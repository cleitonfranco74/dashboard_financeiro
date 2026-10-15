"""Atualiza data/cripto.json com o fechamento diário dos últimos 12 meses de Bitcoin, Ethereum,
Solana e XRP em reais (cotação em dólar do Yahoo Finance × dólar BRL=X do dia).

A capa usa este arquivo para o gráfico e os indicadores; o preço do momento vem ao vivo da
CoinGecko no navegador. Se tudo falhar, o arquivo anterior é mantido.
Roda pela GitHub Action em .github/workflows/mercado.yml.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "data" / "cripto.json"
MOEDAS = {  # símbolo: (nome, ticker no Yahoo, id na CoinGecko)
    "BTC": ("Bitcoin", "BTC-USD", "bitcoin"),
    "ETH": ("Ethereum", "ETH-USD", "ethereum"),
    "SOL": ("Solana", "SOL-USD", "solana"),
    "XRP": ("XRP", "XRP-USD", "ripple"),
}


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def diario(ticker: str) -> pd.Series:
    import yfinance as yf
    h = yf.Ticker(ticker).history(period="1y", interval="1d", auto_adjust=False)
    s = h["Close"].dropna()
    s.index = pd.to_datetime([d.date() for d in s.index])
    return s[~s.index.duplicated(keep="last")].sort_index()


def main() -> None:
    try:
        usd = diario("BRL=X")
    except Exception as e:  # noqa: BLE001
        log(f"Dólar: falhou ({e}); arquivo mantido.")
        return
    series = {}
    for sim, (nome, ticker, _) in MOEDAS.items():
        try:
            series[sim] = diario(ticker)
            log(f"{sim}: {len(series[sim])} dias, último US$ {series[sim].iloc[-1]:.4f}")
        except Exception as e:  # noqa: BLE001
            log(f"{sim}: falhou ({e})")
    if not series:
        log("Nenhuma moeda: arquivo mantido.")
        return
    datas = pd.date_range(min(s.index[0] for s in series.values()), max(s.index[-1] for s in series.values()), freq="D")
    dolar = usd.reindex(datas).ffill().bfill()               # câmbio só em dias úteis: repete o último
    saida = {
        "atualizado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "fonte": "Yahoo Finance (cotação em dólar) × dólar BRL=X; fechamento diário em UTC",
        "datas": [d.strftime("%Y-%m-%d") for d in datas],
        "dolar": [round(float(v), 4) for v in dolar],
        "moedas": {},
    }
    for sim, s in series.items():
        nome, ticker, cg = MOEDAS[sim]
        u = s.reindex(datas)
        brl = u * dolar
        casas = 2 if float(u.dropna().iloc[-1]) >= 10 else 4
        saida["moedas"][sim] = {
            "nome": nome, "coingecko": cg,
            "usd": [None if pd.isna(v) else round(float(v), casas) for v in u],
            "brl": [None if pd.isna(v) else round(float(v), casas) for v in brl],
        }
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Gravado {SAIDA} ({SAIDA.stat().st_size / 1024:.0f} KB, {len(datas)} dias)")


if __name__ == "__main__":
    main()
