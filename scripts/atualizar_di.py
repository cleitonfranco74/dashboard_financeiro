"""Atualiza o arquivo de juros futuros (DI1) com as cotações da B3.

Grava, para alguns vencimentos de DI1, a taxa do dia em intervalos de 5 minutos
(guardando os últimos pregões), o fechamento de cada dia e a curva de juros com
todos os vencimentos negociados. Fonte: API pública de cotações da B3
(cotacao.b3.com.br), com atraso de cerca de 15 minutos.

Uso: python scripts/atualizar_di.py CAMINHO/di.json
Roda a cada 15 minutos no pregão pela GitHub Action .github/workflows/di.yml,
que grava o arquivo no branch "dados" (fora da main).
"""
from __future__ import annotations

import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

API = "https://cotacao.b3.com.br/mds/api/v1"
CONTRATOS = ["DI1F27", "DI1F28", "DI1F29", "DI1F31", "DI1F33"]   # janeiros: 1, 2, 3, 5 e 7 anos à frente
PREGOES = 7                                                    # dias de histórico intradiário guardados
PASSO_MIN = 5                                                  # minutos entre pontos guardados
BRT = timezone(timedelta(hours=-3))

sessao = requests.Session()
sessao.headers["User-Agent"] = "dashboard-financeiro/1.0 (+github.com/cleitonfranco74/dashboard_financeiro)"


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def get(caminho: str) -> dict:
    r = sessao.get(f"{API}/{caminho}", timeout=30)
    r.raise_for_status()
    js = r.json()
    if (js.get("BizSts") or {}).get("cd") != "OK":
        raise ValueError((js.get("BizSts") or {}).get("desc") or "resposta sem sucesso")
    return js


def num(v):
    try:
        f = float(v)
        return round(f, 4) if f == f else None
    except (TypeError, ValueError):
        return None


def curva() -> list[dict]:
    js = get("DerivativeQuotation/DI1")
    out = []
    for s in js.get("Scty") or []:
        q, a = s.get("SctyQtn") or {}, (s.get("asset") or {}).get("AsstSummry") or {}
        taxa = num(q.get("curPrc")) or num(q.get("prvsDayAdjstmntPric"))
        if not (s.get("symb") and a.get("mtrtyCode") and taxa):
            continue
        out.append({"c": s["symb"], "venc": a["mtrtyCode"], "taxa": taxa, "ant": num(q.get("prvsDayAdjstmntPric")),
                    "contratos": a.get("traddCtrctsQty"), "abertos": a.get("opnCtrcts")})
    out.sort(key=lambda x: x["venc"])
    return out


def intradia(contrato: str) -> tuple[str, list[list]]:
    js = get(f"DailyFluctuationHistory/{contrato}")
    tf = js.get("TradgFlr") or {}
    dia = tf.get("date")
    pts = [(p.get("dtTm", "")[:5], num(p.get("closPric"))) for p in ((tf.get("scty") or {}).get("lstQtn") or [])]
    pts = [p for p in pts if p[0] and p[1]]
    # guarda um ponto a cada PASSO_MIN minutos (o último de cada intervalo) e sempre o mais recente
    por_passo = {}
    for hora, v in pts:
        h, m = int(hora[:2]), int(hora[3:5])
        por_passo[(h * 60 + m) // PASSO_MIN] = [hora, v]
    serie = [por_passo[k] for k in sorted(por_passo)]
    if pts and serie and serie[-1][0] != pts[-1][0]:
        serie.append(list(pts[-1]))
    return dia, serie


def cotacao(contrato: str) -> dict:
    js = get(f"InstrumentQuotation/{contrato}")
    t = (js.get("Trad") or [{}])[0]
    q = (t.get("scty") or {}).get("SctyQtn") or {}
    return {"taxa": num(q.get("curPrc")), "abertura": num(q.get("opngPric")), "min": num(q.get("minPric")),
            "max": num(q.get("maxPric")), "var": num(q.get("prcFlcn")), "negocios": t.get("ttlQty"),
            "hora": (js.get("Msg") or {}).get("dtTm")}


def main() -> None:
    saida = Path(sys.argv[1] if len(sys.argv) > 1 else "di.json")
    dados = json.loads(saida.read_text(encoding="utf-8")) if saida.exists() else {}
    dados.setdefault("contratos", {})
    ok = 0
    try:
        dados["curva"] = curva()
        ok += 1
        log(f"curva: {len(dados['curva'])} vencimentos")
    except Exception as e:  # noqa: BLE001
        log(f"curva: falhou ({e})")
    ajustes = {c["c"]: c["ant"] for c in dados.get("curva") or []}
    for c in CONTRATOS:
        reg = dados["contratos"].setdefault(c, {"intradia": {}, "fechamentos": {}})
        try:
            dia, serie = intradia(c)
            if dia and serie:
                reg["intradia"][dia] = serie
                reg["fechamentos"][dia] = serie[-1][1]
                for d in sorted(reg["intradia"])[:-PREGOES]:
                    del reg["intradia"][d]
                for d in sorted(reg["fechamentos"])[:-260]:
                    del reg["fechamentos"][d]
            reg["ultimo"] = {**cotacao(c), "ajusteAnterior": ajustes.get(c)}
            ok += 1
            log(f"{c}: {dia} {len(serie)} pontos, taxa {reg['ultimo']['taxa']}")
        except Exception as e:  # noqa: BLE001
            log(f"{c}: falhou ({e})")
    if not ok:
        log("Nada atualizado; arquivo mantido.")
        return
    dados["atualizado"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
    dados["fonte"] = "B3 (cotacao.b3.com.br), com atraso de cerca de 15 minutos"
    saida.parent.mkdir(parents=True, exist_ok=True)
    saida.write_text(json.dumps(dados, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Gravado {saida} ({saida.stat().st_size / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
