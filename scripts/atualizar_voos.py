"""Atualiza data/voos.json com os menores preços de passagens do Brasil para Roma,
por companhia aérea, cidade de origem e mês, a partir da Aviasales Data API
(Travelpayouts).

Os preços vêm das buscas feitas por usuários da Aviasales nos últimos dias:
são uma referência atualizada diariamente, não uma cotação garantida.

Precisa do segredo TRAVELPAYOUTS_TOKEN (conta gratuita em travelpayouts.com).
Sem o token, ou se a API falhar, o arquivo anterior é mantido.
Roda pela GitHub Action em .github/workflows/mercado.yml.
"""
from __future__ import annotations

import json
import os
import sys
import time
from datetime import date, datetime, timezone
from pathlib import Path

import requests

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "data" / "voos.json"
API = "https://api.travelpayouts.com/aviasales/v3/prices_for_dates"
DESTINO = "ROM"                       # código de cidade: Fiumicino (FCO) e Ciampino (CIA)
MESES = 9                             # meses à frente
ORIGENS = {                           # códigos de cidade (todos os aeroportos da cidade)
    "SAO": "São Paulo", "RIO": "Rio de Janeiro", "BSB": "Brasília", "BHZ": "Belo Horizonte",
    "CWB": "Curitiba", "POA": "Porto Alegre", "FLN": "Florianópolis", "REC": "Recife",
    "SSA": "Salvador", "FOR": "Fortaleza", "BEL": "Belém", "MAO": "Manaus",
    "CGB": "Cuiabá", "GYN": "Goiânia", "VIX": "Vitória", "NAT": "Natal",
}

sessao = requests.Session()
sessao.headers["User-Agent"] = "dashboard-financeiro/1.0 (+github.com/cleitonfranco74/dashboard_financeiro)"


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def meses_a_frente(n: int) -> list[str]:
    h = date.today().replace(day=1)
    out = []
    for i in range(n):
        y, m = h.year + (h.month - 1 + i) // 12, (h.month - 1 + i) % 12 + 1
        out.append(f"{y}-{m:02d}")
    return out


def buscar(token: str, origem: str, mes: str) -> list[dict]:
    params = {
        "origin": origem, "destination": DESTINO, "departure_at": mes, "one_way": "false",
        "currency": "brl", "market": "br", "sorting": "price", "unique": "false", "limit": 100, "token": token,
    }
    r = sessao.get(API, params=params, headers={"X-Access-Token": token}, timeout=40)
    r.raise_for_status()
    js = r.json()
    if js.get("success") is False:
        raise ValueError(js.get("error") or "resposta sem sucesso")
    return js.get("data") or []


def oferta(item: dict, origem: str) -> dict | None:
    preco = item.get("price") or item.get("value")
    cia = item.get("airline")
    ida = item.get("departure_at")
    if not (preco and cia and ida):
        return None
    link = item.get("link") or ""
    return {
        "o": origem, "oa": item.get("origin_airport") or item.get("origin") or origem,
        "da": item.get("destination_airport") or DESTINO,
        "ida": ida[:16], "volta": (item.get("return_at") or "")[:16] or None,
        "preco": round(float(preco)), "cia": cia, "voo": str(item.get("flight_number") or ""),
        "esc": item.get("transfers"), "escv": item.get("return_transfers"),
        "dur": item.get("duration_to") or item.get("duration"),
        "link": ("https://www.aviasales.com" + link) if link.startswith("/") else (link or None),
    }


def main() -> None:
    token = os.environ.get("TRAVELPAYOUTS_TOKEN", "").strip()
    if not token:
        log("TRAVELPAYOUTS_TOKEN ausente: data/voos.json mantido.")
        return
    ofertas, falhas = [], 0
    for origem in ORIGENS:
        for mes in meses_a_frente(MESES):
            try:
                for it in buscar(token, origem, mes):
                    o = oferta(it, origem)
                    if o:
                        ofertas.append(o)
            except Exception as e:  # noqa: BLE001
                falhas += 1
                log(f"  {origem} {mes}: falhou ({e})")
            time.sleep(0.35)
        log(f"{origem}: {sum(1 for o in ofertas if o['o'] == origem)} ofertas")
    if not ofertas:
        log("Nenhuma oferta: arquivo mantido.")
        return
    # sem duplicatas: mesma origem, companhia, voo e datas
    vistos, unicas = set(), []
    for o in sorted(ofertas, key=lambda x: x["preco"]):
        k = (o["o"], o["cia"], o["voo"], o["ida"], o["volta"])
        if k not in vistos:
            vistos.add(k)
            unicas.append(o)
    saida = {
        "atualizado": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "destino": {"codigo": DESTINO, "nome": "Roma", "aeroportos": ["FCO", "CIA"]},
        "moeda": "BRL", "fonte": "Aviasales Data API (Travelpayouts)",
        "origens": ORIGENS, "ofertas": unicas[:3000],
    }
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Gravado {SAIDA} ({SAIDA.stat().st_size / 1024:.0f} KB; {len(unicas)} ofertas, {falhas} falhas)")


if __name__ == "__main__":
    main()
