"""Alertas de topo das ações da B3, enviados pelo ntfy (https://ntfy.sh) de hora em hora durante o pregão.

Roda na GitHub Action .github/workflows/cotacoes.yml, logo depois de cotacoes_intradia.py. Compara a
cotação do momento com a máxima de 52 semanas e com o preço-alvo médio das corretoras (de data/acoes.json)
e publica um aviso no tópico público do ntfy para cada ação que:
  - renovou a máxima de 52 semanas, ou
  - atingiu o preço-alvo médio das corretoras (consenso com 3 ou mais analistas).
Cada aviso sai uma vez por dia. O arquivo de estado (no branch "dados") guarda o que já foi enviado
e os últimos avisos, que a página Mercado mostra.

Uso: python scripts/alertas_topo.py data/acoes.json ../dados/cotacoes.json ../dados/alertas.json
Variáveis: NTFY_TOPICO (padrão livro-caixa-topos); NTFY_DESLIGADO=1 grava o estado sem enviar.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

TOPICO = os.environ.get("NTFY_TOPICO", "livro-caixa-topos")
SITE = "https://cleitonfranco74.github.io/dashboard_financeiro/mercado.html#topos"
FORA = {"BOVA11", "IVVB11"}   # ETFs
MAX_AVISOS = 8                # por execução; o excedente vai num resumo
HISTORICO = 60


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def brl(v: float) -> str:
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def eventos(acoes: dict, cot: dict, hoje: str) -> list[dict]:
    ev = []
    for cod, (preco, _ant, data) in sorted(cot.items()):
        a = acoes.get(cod)
        if cod in FORA or not a or data != hoje or not preco:
            continue
        nome = a.get("nome", cod)
        mx = a.get("max52")
        if mx and preco > mx:
            ev.append({"cod": cod, "tipo": "maxima", "preco": preco,
                       "msg": f"{cod} ({nome}) renovou a máxima de 52 semanas: {brl(preco)}, acima de {brl(mx)}."})
        alvo, n = a.get("alvo"), a.get("nanal") or 0
        if alvo and n >= 3 and preco >= alvo:
            ev.append({"cod": cod, "tipo": "alvo", "preco": preco,
                       "msg": f"{cod} ({nome}) chegou ao preço-alvo médio de {n} analistas: {brl(preco)} (alvo {brl(alvo)})."})
    return ev


def enviar(titulo: str, msg: str, tags: list[str]) -> None:
    corpo = json.dumps({"topic": TOPICO, "title": titulo, "message": msg, "tags": tags, "click": SITE}).encode()
    req = urllib.request.Request("https://ntfy.sh/", data=corpo, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        r.read()


def main() -> None:
    p_acoes, p_cot, p_estado = map(Path, sys.argv[1:4])
    acoes = json.loads(p_acoes.read_text(encoding="utf-8"))["categorias"]["acoes"]
    cot = json.loads(p_cot.read_text(encoding="utf-8"))["ativos"].get("acoes", {})
    agora = datetime.now(timezone.utc)
    hoje = (agora - timedelta(hours=3)).strftime("%Y-%m-%d")   # data de Brasília
    estado = json.loads(p_estado.read_text(encoding="utf-8")) if p_estado.exists() else {}
    if estado.get("data") != hoje:
        estado.update({"data": hoje, "enviados": {}})
    enviados = estado.setdefault("enviados", {})
    novos = [e for e in eventos(acoes, cot, hoje) if e["tipo"] not in enviados.get(e["cod"], [])]
    if not novos:
        log("Nenhum alerta novo.")
    desligado = os.environ.get("NTFY_DESLIGADO") == "1"
    TIT = {"maxima": "Nova máxima de 52 semanas", "alvo": "Preço-alvo atingido"}
    TAG = {"maxima": ["chart_with_upwards_trend"], "alvo": ["dart"]}
    for i, e in enumerate(novos):
        try:
            if not desligado:
                if i < MAX_AVISOS:
                    enviar(f"{TIT[e['tipo']]}: {e['cod']}", e["msg"], TAG[e["tipo"]])
                elif i == MAX_AVISOS:
                    resto = novos[MAX_AVISOS:]
                    enviar(f"Mais {len(resto)} alertas de topo", "; ".join(f"{x['cod']} ({TIT[x['tipo']].lower()})" for x in resto), ["bell"])
        except Exception as erro:  # noqa: BLE001
            log(f"  ntfy falhou para {e['cod']}: {erro}")
            continue
        enviados.setdefault(e["cod"], []).append(e["tipo"])
        estado.setdefault("historico", []).insert(0, {"quando": agora.isoformat(timespec="minutes"), **e})
        log(f"  {e['msg']}")
    estado["historico"] = estado.get("historico", [])[:HISTORICO]
    estado["topico"] = TOPICO
    p_estado.write_text(json.dumps(estado, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
