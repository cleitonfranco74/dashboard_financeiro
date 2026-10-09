"""Atualiza data/mercado.json com indicadores do BCB, expectativas Focus,
taxas do Tesouro Direto e retornos mensais de ações/ETFs da B3.

Roda diariamente pela GitHub Action em .github/workflows/mercado.yml.
Se uma fonte falhar, mantém a parte correspondente do arquivo anterior.
"""
from __future__ import annotations

import io
import json
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import quote

import pandas as pd
import requests

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "data" / "mercado.json"
ANOS_HISTORICO = 10

ACOES = {
    "BOVA11": "BOVA11.SA",
    "IVVB11": "IVVB11.SA",
    "ITUB4": "ITUB4.SA",
    "PETR4": "PETR4.SA",
    "VALE3": "VALE3.SA",
    "WEGE3": "WEGE3.SA",
    "BBAS3": "BBAS3.SA",
}
# Criptomoedas para o simulador (a carteira não as usa). O Yahoo não cota mais
# os pares em reais, então o preço em dólar é convertido pelo câmbio do mês.
CRIPTO = {"BTC": "BTC-USD", "ETH": "ETH-USD"}
DOLAR = "BRL=X"
TESOURO_CSV = (
    "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/"
    "resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv"
)
SGS = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.{}/dados"
FOCUS = "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais"

sessao = requests.Session()
sessao.headers["User-Agent"] = "dashboard-financeiro/1.0 (+github.com/cleitonfranco74/dashboard_financeiro)"


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def sgs_ultimo(codigo: int) -> dict:
    r = sessao.get(SGS.format(codigo) + "/ultimos/1", params={"formato": "json"}, timeout=30)
    r.raise_for_status()
    item = r.json()[-1]
    return {"valor": float(item["valor"]), "data": datetime.strptime(item["data"], "%d/%m/%Y").date().isoformat()}


def sgs_mensal(codigo: int, inicio: date) -> pd.Series:
    r = sessao.get(
        SGS.format(codigo),
        params={"formato": "json", "dataInicial": inicio.strftime("%d/%m/%Y"), "dataFinal": date.today().strftime("%d/%m/%Y")},
        timeout=60,
    )
    r.raise_for_status()
    df = pd.DataFrame(r.json())
    idx = pd.to_datetime(df["data"], format="%d/%m/%Y").dt.strftime("%Y-%m")
    return pd.Series(df["valor"].astype(float).values / 100, index=idx)


def focus(indicador: str) -> tuple[str, dict]:
    # O OData do BCB rejeita espaços codificados como "+", então a query é montada à mão.
    params = {
        "$top": "40",
        "$filter": f"Indicador eq '{indicador}' and baseCalculo eq 0",
        "$orderby": "Data desc",
        "$format": "json",
        "$select": "Indicador,Data,DataReferencia,Mediana",
    }
    qs = "&".join(k + "=" + quote(v, safe="',") for k, v in params.items())
    r = sessao.get(f"{FOCUS}?{qs}", timeout=60)
    r.raise_for_status()
    linhas = r.json()["value"]
    ultima = max(l["Data"] for l in linhas)
    anos = {l["DataReferencia"]: round(float(l["Mediana"]), 4) for l in linhas if l["Data"] == ultima}
    return ultima, dict(sorted(anos.items()))


def tesouro(inicio: date) -> tuple[dict, dict, dict]:
    r = sessao.get(TESOURO_CSV, timeout=180)
    r.raise_for_status()
    df = pd.read_csv(io.BytesIO(r.content), sep=";", decimal=",", encoding="latin-1")
    df["base"] = pd.to_datetime(df["Data Base"], format="%d/%m/%Y")
    df["venc"] = pd.to_datetime(df["Data Vencimento"], format="%d/%m/%Y")
    ultima = df["base"].max()
    atual = df[df["base"] == ultima].sort_values(["Tipo Titulo", "venc"])
    titulos = [
        {
            "tipo": t["Tipo Titulo"],
            "vencimento": t["venc"].date().isoformat(),
            "taxaCompra": round(float(t["Taxa Compra Manha"]), 4),
            "taxaVenda": round(float(t["Taxa Venda Manha"]), 4),
            "pu": round(float(t["PU Base Manha"]), 2),
        }
        for _, t in atual.iterrows()
    ]

    # Série encadeada de prazo quase constante: a cada mês, usa o título do tipo
    # com prazo remanescente mais próximo do alvo (como os índices IMA/IRF-M).
    series, nomes = {}, {}
    df = df[df["base"] >= pd.Timestamp(inicio) - pd.DateOffset(months=2)]
    for chave, tipo, alvo, nome in (
        ("TESOURO_IPCA", "Tesouro IPCA+", 10, "Tesouro IPCA+ (~10 anos)"),
        ("TESOURO_PRE", "Tesouro Prefixado", 4, "Tesouro Prefixado (~4 anos)"),
    ):
        cand = df[df["Tipo Titulo"] == tipo].copy()
        cand["mes"] = cand["base"].dt.strftime("%Y-%m")
        pu = cand.sort_values("base").groupby(["mes", "venc"])["PU Base Manha"].last().unstack()
        meses = list(pu.index)
        ret = {}
        for ant, mes in zip(meses, meses[1:]):
            fim_ant = pd.Timestamp(ant + "-01") + pd.offsets.MonthEnd(0)
            melhor = None
            for venc in pu.columns:
                a, b = pu.at[ant, venc], pu.at[mes, venc]
                if pd.isna(a) or pd.isna(b) or venc <= pd.Timestamp(mes + "-01") + pd.offsets.MonthEnd(0):
                    continue
                dist = abs((venc - fim_ant).days / 365.25 - alvo)
                if melhor is None or dist < melhor[0]:
                    melhor = (dist, b / a - 1)
            if melhor:
                ret[mes] = melhor[1]
        if ret:
            series[chave] = pd.Series(ret)
            nomes[chave] = nome
    return {"data": ultima.date().isoformat(), "titulos": titulos}, series, nomes


def acoes(inicio: date) -> dict:
    import yfinance as yf

    out = {}
    for nome, ticker in ACOES.items():
        try:
            h = yf.Ticker(ticker).history(start=inicio.isoformat(), interval="1mo", auto_adjust=True)
            if h.empty:
                raise ValueError("sem dados")
            fech = h["Close"].dropna()
            fech.index = fech.index.strftime("%Y-%m")
            fech = fech[~fech.index.duplicated(keep="last")]
            ret = fech.pct_change().dropna()
            # descarta o mês corrente, ainda incompleto
            ret = ret[ret.index < date.today().strftime("%Y-%m")]
            out[nome] = ret
            log(f"  {nome}: {len(ret)} meses")
        except Exception as e:  # noqa: BLE001
            log(f"  {nome}: falhou ({e})")
    return out


def cripto(inicio: date) -> dict:
    import yfinance as yf

    def mensal(ticker: str) -> pd.Series:
        h = yf.Ticker(ticker).history(start=inicio.isoformat(), interval="1mo", auto_adjust=True)
        if h.empty:
            raise ValueError(f"{ticker} sem dados")
        fech = h["Close"].dropna()
        fech.index = fech.index.strftime("%Y-%m")
        return fech[~fech.index.duplicated(keep="last")]

    out = {}
    try:
        dolar = mensal(DOLAR)
    except Exception as e:  # noqa: BLE001
        log(f"  câmbio: falhou ({e})")
        return out
    for nome, ticker in CRIPTO.items():
        try:
            em_reais = (mensal(ticker) * dolar).dropna()
            ret = em_reais.pct_change().dropna()
            ret = ret[ret.index < date.today().strftime("%Y-%m")]
            out[nome] = ret
            log(f"  {nome}: {len(ret)} meses (em reais)")
        except Exception as e:  # noqa: BLE001
            log(f"  {nome}: falhou ({e})")
    return out


def main() -> None:
    anterior = json.loads(SAIDA.read_text(encoding="utf-8")) if SAIDA.exists() else {}
    dados = dict(anterior)
    inicio = date.today().replace(day=1) - timedelta(days=365 * ANOS_HISTORICO + 40)

    try:
        dados["indicadores"] = {"selic": sgs_ultimo(432), "cdi": sgs_ultimo(4389), "ipca12": sgs_ultimo(13522)}
        log("BCB ok")
    except Exception as e:  # noqa: BLE001
        log(f"BCB falhou: {e}")

    try:
        d1, selic = focus("Selic")
        d2, ipca = focus("IPCA")
        dados["focus"] = {"data": max(d1, d2), "selic": selic, "ipca": ipca}
        log("Focus ok")
    except Exception as e:  # noqa: BLE001
        log(f"Focus falhou: {e}")

    series: dict[str, pd.Series] = {}
    nomes: dict[str, str] = {"CDI": "CDI", "IPCA": "IPCA"}
    try:
        series["CDI"] = sgs_mensal(4391, inicio)
        series["IPCA"] = sgs_mensal(433, inicio)
    except Exception as e:  # noqa: BLE001
        log(f"Séries BCB falharam: {e}")
    try:
        dados["tesouro"], s_tes, n_tes = tesouro(inicio)
        series.update(s_tes)
        nomes.update(n_tes)
        log("Tesouro ok")
    except Exception as e:  # noqa: BLE001
        log(f"Tesouro falhou: {e}")
    for nome, s in acoes(inicio).items():
        series[nome] = s
        nomes[nome] = nome
    for nome, s in cripto(inicio).items():
        series[nome] = s
        nomes[nome] = nome

    if series:
        # Mantém do arquivo anterior as séries que não vieram agora.
        prev = anterior.get("series") or {}
        for k, vals in (prev.get("retornos") or {}).items():
            if k not in series:
                series[k] = pd.Series(vals, index=prev["meses"]).dropna()
                nomes[k] = (prev.get("nomes") or {}).get(k, k)
        meses = sorted(set().union(*(s.index for s in series.values())))
        meses = [m for m in meses if m < date.today().strftime("%Y-%m")][-12 * ANOS_HISTORICO:]
        dados["series"] = {
            "meses": meses,
            "nomes": nomes,
            "retornos": {
                k: [None if pd.isna(v := s.get(m)) else round(float(v), 6) for m in meses] for k, s in series.items()
            },
        }

    dados["atualizado"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(dados, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Gravado {SAIDA} ({SAIDA.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
