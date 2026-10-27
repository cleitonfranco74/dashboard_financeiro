"""Cotações durante o pregão, de hora em hora, para o comparador de ações e a seção Ações das estatais.

Roda pela GitHub Action em .github/workflows/cotacoes.yml e grava um arquivo pequeno no branch
"dados" (para não gerar commits na main a cada hora). As páginas leem esse arquivo e, quando ele
é mais novo que data/acoes.json, trocam o preço e o fechamento anterior de cada ativo. O Yahoo
Finance entrega as cotações da B3 com cerca de 15 minutos de atraso.

Uso: python scripts/cotacoes_intradia.py ../dados/cotacoes.json
"""
from __future__ import annotations

import json
import math
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from atualizar_acoes import ATIVOS, log  # noqa: E402


def main() -> None:
    import yfinance as yf

    saida = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("cotacoes.json")
    tickers = {t: (cat, cod) for cat, lista in ATIVOS.items() for cod, (t, _) in lista.items()}
    d = yf.download(list(tickers), period="5d", interval="1d", auto_adjust=False, group_by="ticker",
                    threads=True, progress=False)
    ativos = {}
    for t, (cat, cod) in tickers.items():
        try:
            fech = d[t]["Close"].dropna()
        except KeyError:
            continue
        if fech.empty or not math.isfinite(float(fech.iloc[-1])):
            continue
        ant = round(float(fech.iloc[-2]), 2) if len(fech) > 1 else None
        ativos.setdefault(cat, {})[cod] = [round(float(fech.iloc[-1]), 2), ant, fech.index[-1].strftime("%Y-%m-%d")]
    n = sum(len(v) for v in ativos.values())
    if n < 0.5 * len(tickers):
        log(f"Só {n} de {len(tickers)} cotações; arquivo mantido.")
        return
    saida.parent.mkdir(parents=True, exist_ok=True)
    saida.write_text(json.dumps({"atualizado": datetime.now(timezone.utc).isoformat(timespec="seconds"), "ativos": ativos},
                                ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Gravado {saida}: {n} de {len(tickers)} cotações.")


if __name__ == "__main__":
    main()
