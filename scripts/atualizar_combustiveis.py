"""Atualiza data/combustiveis.json: diesel S10 no Brasil e em Mato Grosso (ANP), petróleo Brent
em reais e diesel nos EUA (EIA), em séries semanais alinhadas pelas semanas da ANP.

Fontes, todas públicas e sem chave:
- ANP, Levantamento de Preços de Combustíveis, séries semanais desde 2013 (Brasil e estados);
- Yahoo Finance (yfinance): Brent (BZ=F) e dólar (BRL=X), fechamento semanal;
- EIA (Departamento de Energia dos EUA): preço médio do diesel no varejo, US$/galão.
Se uma fonte falhar, as demais são gravadas; se tudo falhar, o arquivo anterior é mantido.
Roda pela GitHub Action em .github/workflows/mercado.yml.
"""
from __future__ import annotations

import io
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd
import requests

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "data" / "combustiveis.json"
ANP = ("https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/"
       "precos-revenda-e-de-distribuicao-combustiveis/shlp/semanal/")
EIA = "https://www.eia.gov/dnav/pet/hist_xls/EMD_EPD2D_PTE_NUS_DPGw.xls"
INICIO = "2019-01-01"
ESTADO = "MATO GROSSO"
PRODUTO = "OLEO DIESEL S10"
LITROS_BARRIL, LITROS_GALAO = 158.987, 3.78541
H = {"User-Agent": "Mozilla/5.0 (dashboard-financeiro; +github.com/cleitonfranco74/dashboard_financeiro)"}


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def baixar(url: str, timeout: int = 180) -> bytes:
    r = requests.get(url, headers=H, timeout=timeout)
    r.raise_for_status()
    return r.content


def anp(arquivo: str, col_produto: int, col_preco: int, filtro=None) -> pd.Series:
    """Série semanal (data final da semana -> preço médio de revenda) de um produto."""
    df = pd.read_excel(io.BytesIO(baixar(ANP + arquivo)), header=None)
    df = df[pd.to_datetime(df[1], errors="coerce").notna()]
    df = df[df[col_produto].astype(str).str.strip().str.upper() == PRODUTO]
    if filtro is not None:
        df = df[filtro(df)]
    s = pd.Series(pd.to_numeric(df[col_preco], errors="coerce").values, index=pd.to_datetime(df[1])).dropna()
    return s[s.index >= INICIO].sort_index()


def yahoo(ticker: str) -> pd.Series:
    import yfinance as yf
    h = yf.Ticker(ticker).history(start=INICIO, interval="1wk", auto_adjust=False)
    s = h["Close"].dropna()
    s.index = pd.to_datetime(s.index.date)
    return s.sort_index()


def eia() -> pd.Series:
    x = pd.ExcelFile(io.BytesIO(baixar(EIA)), engine="xlrd")
    aba = next((a for a in x.sheet_names if a.lower().startswith("data")), x.sheet_names[-1])
    df = pd.read_excel(x, aba, header=None)
    d = pd.to_datetime(df[0], errors="coerce")
    s = pd.Series(pd.to_numeric(df[1], errors="coerce").values, index=d)
    s = s[s.index.notna()].dropna()
    return s[s.index >= INICIO].sort_index()


def alinhar(semanas: pd.DatetimeIndex, s: pd.Series | None, dias: int = 10) -> list:
    """Último valor da série até cada semana da ANP (no máximo `dias` antes)."""
    if s is None or s.empty:
        return [None] * len(semanas)
    esq = pd.DataFrame({"d": pd.DatetimeIndex(semanas).astype("datetime64[ns]")})
    dir_ = pd.DataFrame({"d": pd.DatetimeIndex(s.index).astype("datetime64[ns]"), "v": s.values})
    a = pd.merge_asof(esq, dir_,
                      on="d", direction="backward", tolerance=pd.Timedelta(days=dias))
    return [None if pd.isna(v) else round(float(v), 4) for v in a["v"]]


def tentar(nome: str, f):
    try:
        s = f()
        log(f"{nome}: {len(s)} semanas, última {s.index[-1].date()} = {s.iloc[-1]:.3f}")
        return s
    except Exception as e:  # noqa: BLE001
        log(f"{nome}: falhou ({e})")
        return None


def main() -> None:
    br = tentar("Diesel S10 Brasil", lambda: anp("semanal-brasil-desde-2013.xlsx", 2, 5))
    mt = tentar(f"Diesel S10 {ESTADO}", lambda: anp("semanal-estados-desde-2013.xlsx", 4, 7,
                                                     lambda df: df[3].astype(str).str.strip().str.upper() == ESTADO))
    brent = tentar("Brent (US$/barril)", lambda: yahoo("BZ=F"))
    usd = tentar("Dólar (R$)", lambda: yahoo("BRL=X"))
    eua = tentar("Diesel EUA (US$/galão)", eia)
    base = mt if mt is not None and not mt.empty else br
    if base is None or base.empty:
        log("Sem dados da ANP: arquivo mantido.")
        return
    semanas = base.index
    c = {k: alinhar(semanas, s) for k, s in {"br": br, "mt": mt, "brent": brent, "usd": usd, "euaGal": eua}.items()}
    conv = lambda v, u, l: None if v is None or u is None else round(v * u / l, 4)
    saida = {
        "atualizado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "fontes": {"anp": "ANP, Levantamento de Preços de Combustíveis (semanal)",
                   "brent": "Yahoo Finance (BZ=F) e dólar BRL=X", "eua": "EIA, U.S. No 2 Diesel Retail Prices"},
        "estado": "Mato Grosso", "produto": "Diesel S10",
        "semanas": [d.strftime("%Y-%m-%d") for d in semanas],
        "br": c["br"], "mt": c["mt"],
        "brentUsd": c["brent"], "usd": c["usd"],
        "brentLitro": [conv(b, u, LITROS_BARRIL) for b, u in zip(c["brent"], c["usd"])],
        "euaGalao": c["euaGal"],
        "euaLitro": [conv(e, u, LITROS_GALAO) for e, u in zip(c["euaGal"], c["usd"])],
    }
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Gravado {SAIDA} ({SAIDA.stat().st_size / 1024:.0f} KB, {len(semanas)} semanas)")


if __name__ == "__main__":
    main()
