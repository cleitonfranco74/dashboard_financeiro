"""Atualiza data/acoes.json com cotações, indicadores e histórico mensal
de ações da B3, ações americanas, fundos imobiliários e ETFs internacionais,
usados pelo comparador de ações da aba Calculadoras.

Roda diariamente pela GitHub Action em .github/workflows/mercado.yml, depois
de atualizar_mercado.py. Um ativo que falhar mantém os dados do arquivo anterior.
"""
from __future__ import annotations

import json
import math
import sys
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "data" / "acoes.json"

# categoria -> {código exibido: (ticker no Yahoo, nome)}
ATIVOS = {
    "acoes": {
        "PETR4": ("PETR4.SA", "Petrobras"), "VALE3": ("VALE3.SA", "Vale"), "ITUB4": ("ITUB4.SA", "Itaú Unibanco"),
        "BBDC4": ("BBDC4.SA", "Bradesco"), "BBAS3": ("BBAS3.SA", "Banco do Brasil"), "ITSA4": ("ITSA4.SA", "Itaúsa"),
        "BPAC11": ("BPAC11.SA", "BTG Pactual"), "SANB11": ("SANB11.SA", "Santander Brasil"), "B3SA3": ("B3SA3.SA", "B3"),
        "BBSE3": ("BBSE3.SA", "BB Seguridade"), "CXSE3": ("CXSE3.SA", "Caixa Seguridade"), "PSSA3": ("PSSA3.SA", "Porto Seguro"),
        "WEGE3": ("WEGE3.SA", "WEG"), "ABEV3": ("ABEV3.SA", "Ambev"), "AXIA3": ("AXIA3.SA", "Axia Energia (ex-Eletrobras)"),
        "EGIE3": ("EGIE3.SA", "Engie Brasil"), "TAEE11": ("TAEE11.SA", "Taesa"), "CMIG4": ("CMIG4.SA", "Cemig"),
        "EQTL3": ("EQTL3.SA", "Equatorial"), "ISAE4": ("ISAE4.SA", "ISA Energia"), "AURE3": ("AURE3.SA", "Auren"),
        "SBSP3": ("SBSP3.SA", "Sabesp"), "VIVT3": ("VIVT3.SA", "Vivo"), "TIMS3": ("TIMS3.SA", "TIM"),
        "SUZB3": ("SUZB3.SA", "Suzano"), "KLBN11": ("KLBN11.SA", "Klabin"), "PRIO3": ("PRIO3.SA", "PRIO"),
        "GGBR4": ("GGBR4.SA", "Gerdau"), "CSNA3": ("CSNA3.SA", "CSN"), "BRAP4": ("BRAP4.SA", "Bradespar"),
        "RENT3": ("RENT3.SA", "Localiza"), "RADL3": ("RADL3.SA", "Raia Drogasil"), "RDOR3": ("RDOR3.SA", "Rede D'Or"),
        "HAPV3": ("HAPV3.SA", "Hapvida"), "LREN3": ("LREN3.SA", "Lojas Renner"), "MGLU3": ("MGLU3.SA", "Magazine Luiza"),
        "ASAI3": ("ASAI3.SA", "Assaí"), "RAIL3": ("RAIL3.SA", "Rumo"), "UGPA3": ("UGPA3.SA", "Ultrapar"),
        "VBBR3": ("VBBR3.SA", "Vibra"), "CSAN3": ("CSAN3.SA", "Cosan"), "TOTS3": ("TOTS3.SA", "Totvs"),
        "CYRE3": ("CYRE3.SA", "Cyrela"), "MULT3": ("MULT3.SA", "Multiplan"), "SMTO3": ("SMTO3.SA", "São Martinho"),
        "BOVA11": ("BOVA11.SA", "ETF Ibovespa"), "IVVB11": ("IVVB11.SA", "ETF S&P 500 em reais"),
    },
    "stocks": {
        "AAPL": ("AAPL", "Apple"), "MSFT": ("MSFT", "Microsoft"), "NVDA": ("NVDA", "Nvidia"), "AMZN": ("AMZN", "Amazon"),
        "GOOGL": ("GOOGL", "Alphabet"), "META": ("META", "Meta"), "TSLA": ("TSLA", "Tesla"),
        "BRK-B": ("BRK-B", "Berkshire Hathaway"), "JPM": ("JPM", "JPMorgan"), "V": ("V", "Visa"),
        "KO": ("KO", "Coca-Cola"), "JNJ": ("JNJ", "Johnson & Johnson"), "PG": ("PG", "Procter & Gamble"),
        "XOM": ("XOM", "ExxonMobil"), "NFLX": ("NFLX", "Netflix"), "DIS": ("DIS", "Disney"),
        "MCD": ("MCD", "McDonald's"), "WMT": ("WMT", "Walmart"), "O": ("O", "Realty Income"),
    },
    "fiis": {
        "HGLG11": ("HGLG11.SA", "CSHG Logística"), "KNRI11": ("KNRI11.SA", "Kinea Renda Imobiliária"),
        "MXRF11": ("MXRF11.SA", "Maxi Renda"), "XPML11": ("XPML11.SA", "XP Malls"), "VISC11": ("VISC11.SA", "Vinci Shopping Centers"),
        "HGRU11": ("HGRU11.SA", "CSHG Renda Urbana"), "KNCR11": ("KNCR11.SA", "Kinea Rendimentos Imobiliários"),
        "BTLG11": ("BTLG11.SA", "BTG Pactual Logística"), "XPLG11": ("XPLG11.SA", "XP Log"), "CPTS11": ("CPTS11.SA", "Capitânia Securities"),
        "RECR11": ("RECR11.SA", "REC Recebíveis"), "HGBS11": ("HGBS11.SA", "Hedge Brasil Shopping"),
        "VILG11": ("VILG11.SA", "Vinci Logística"), "TRXF11": ("TRXF11.SA", "TRX Real Estate"), "KNIP11": ("KNIP11.SA", "Kinea Índices de Preços"),
        "PVBI11": ("PVBI11.SA", "VBI Prime Properties"), "GGRC11": ("GGRC11.SA", "GGR Covepi"), "HSML11": ("HSML11.SA", "HSI Malls"),
        "KNSC11": ("KNSC11.SA", "Kinea Securities"), "RBRR11": ("RBRR11.SA", "RBR Rendimento High Grade"),
    },
    "etfs": {
        "VOO": ("VOO", "Vanguard S&P 500"), "IVV": ("IVV", "iShares Core S&P 500"), "QQQ": ("QQQ", "Invesco Nasdaq-100"),
        "VTI": ("VTI", "Vanguard Total Stock Market"), "VT": ("VT", "Vanguard Total World Stock"),
        "VXUS": ("VXUS", "Vanguard Total International"), "SCHD": ("SCHD", "Schwab US Dividend Equity"),
        "VNQ": ("VNQ", "Vanguard Real Estate"), "BND": ("BND", "Vanguard Total Bond Market"),
        "TLT": ("TLT", "iShares 20+ Year Treasury"), "EEM": ("EEM", "iShares MSCI Emerging Markets"),
        "GLD": ("GLD", "SPDR Gold Shares"), "IBIT": ("IBIT", "iShares Bitcoin Trust"),
    },
}
MESES = 61  # 5 anos de fechamentos mensais


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def num(v, nd=4):
    """Número finito arredondado, ou None."""
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    return round(f, nd) if math.isfinite(f) else None


def ativo(yf, ticker: str) -> dict:
    t = yf.Ticker(ticker)
    h = t.history(period="5y", interval="1mo", auto_adjust=True)
    fech = h["Close"].dropna() if not h.empty else None
    if fech is None or fech.empty:
        raise ValueError("sem histórico")
    fech.index = fech.index.strftime("%Y-%m")
    fech = fech[~fech.index.duplicated(keep="last")].tail(MESES)

    d = t.history(period="10d", interval="1d", auto_adjust=False)
    preco = num(d["Close"].dropna().iloc[-1], 2) if not d.empty else None
    if preco is None:
        raise ValueError("sem cotação")

    # dividend yield pelos proventos pagos nos últimos 12 meses (não depende do formato do Yahoo)
    dy = None
    try:
        div = t.dividends
        if div is not None and len(div):
            corte = datetime.now(div.index.tz) - timedelta(days=365)
            dy = num(float(div[div.index >= corte].sum()) / preco)
    except Exception:  # noqa: BLE001
        pass

    try:
        info = t.info or {}
    except Exception:  # noqa: BLE001
        info = {}
    dpl = num(info.get("debtToEquity"))
    return {
        "preco": preco,
        "moeda": info.get("currency") or ("BRL" if ticker.endswith(".SA") else "USD"),
        "setor": info.get("sector") or info.get("category") or None,
        "pl": num(info.get("trailingPE"), 2),
        "pvp": num(info.get("priceToBook"), 2),
        "dy": dy,
        "roe": num(info.get("returnOnEquity")),
        "margem": num(info.get("profitMargins")),
        "divpl": num(dpl / 100) if dpl is not None else None,   # o Yahoo informa em %
        "vm": num(info.get("marketCap") or info.get("totalAssets"), 0),
        "beta": num(info.get("beta") or info.get("beta3Year"), 2),
        "ini": fech.index[0],
        "c": [num(v, 4) for v in fech],
    }


def main() -> None:
    import yfinance as yf

    anterior = json.loads(SAIDA.read_text(encoding="utf-8")) if SAIDA.exists() else {}
    saida = {"atualizado": None, "categorias": {}}
    ok = falhas = 0
    for cat, lista in ATIVOS.items():
        velhos = (anterior.get("categorias") or {}).get(cat) or {}
        novos = {}
        for cod, (ticker, nome) in lista.items():
            try:
                novos[cod] = {"nome": nome, **ativo(yf, ticker)}
                ok += 1
            except Exception as e:  # noqa: BLE001
                falhas += 1
                log(f"  {cod}: falhou ({e})")
                if cod in velhos:
                    novos[cod] = velhos[cod]
            time.sleep(0.4)
        saida["categorias"][cat] = novos
        log(f"{cat}: {len(novos)} ativos")
    if not ok:
        log("Nenhum ativo atualizado; arquivo mantido.")
        return
    saida["atualizado"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Gravado {SAIDA} ({SAIDA.stat().st_size / 1024:.0f} KB; {ok} ok, {falhas} falhas)")


if __name__ == "__main__":
    main()
