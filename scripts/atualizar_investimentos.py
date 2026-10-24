"""Atualiza data/investimentos.json: investimentos das estatais federais pelo Orçamento de
Investimento (OI), ano a ano desde 2016: valor aprovado (LOA mais créditos) e realizado, por grupo
(estatal de controle direto com suas subsidiárias), por região, por empresa do grupo e por ação.

Fonte: dados abertos da SEST/MGI (sestoi.zip, arquivo oi-despesa.csv). O realizado vem acumulado
mês a mês; o ano em andamento aparece como parcial, até o último mês publicado. O cadastro
(sestidentificacao.zip) liga cada subsidiária à controladora; empresas que já saíram do cadastro
(grupo Eletrobras, privatizado em 2022, e outras) são ligadas pelo dicionário HISTORICO.
Se o download falhar, o arquivo anterior é mantido. Roda pela GitHub Action em .github/workflows/mercado.yml.
"""
from __future__ import annotations

import csv
import io
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from atualizar_estatais import EMPRESAS, LOGOS, baixar_zip, log, nome_logo, numero, texto  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "data" / "investimentos.json"
MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]
NOMES_MES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
REGIOES = {"NO": "Norte", "NE": "Nordeste", "CO": "Centro-Oeste", "SD": "Sudeste", "SL": "Sul", "NA": "Nacional", "EX": "Exterior"}
TOP = 6   # empresas do grupo e ações guardadas por grupo e ano

ELETROBRAS = ("CHESF", "FURNAS", "ELETRONORTE", "ELETROSUL", "CGT Eletrosul", "CGTEE", "AmGT", "AmE", "CEAL", "CERON",
              "CEPISA", "CELG D", "ELETROACRE", "BVENERGIA", "ELETROBRAS", "ELETROPAR", "CEPEL", "FOTE", "TSLE", "TGO",
              "TSBE", "LVTE", "UIRAPURU", "IBER", "Brasil Ventos", "MANGUE SECO 2", "Bentevi", "Arará Azul")
PETROBRAS = ("BR", "ARAUCÁRIA", "TAG", "NTS", "LIQUIGÁS", "GASPETRO", "GÁS BRASILIANO GBD", "PETROQUÍMICASUAPE",
             "CITEPE", "STRATURA ASFALTOS", "Mataripe", "Refinaria de Manaus", "Mucuripe", "Paraná Xisto", "LOGIGAS")
# subsidiária ou nome antigo → controladora, para siglas que não estão no cadastro atual
HISTORICO = {**{s: "ELETROBRAS" for s in ELETROBRAS}, **{s: "PETROBRAS" for s in PETROBRAS},
             "TELEBRÁS": "TELEBRAS", "SPA": "APS", "CODESP": "APS", "BBTS": "BB", "BB TURISMO": "BB",
             "ATIVOS S.A.": "BB", "COBRA": "BB", "ALADA - PROJETOS AEROESPACIAIS": "NAV Brasil", "CBTU-MG": "CBTU"}
# grupos que não estão entre as estatais de controle direto de hoje
NOMES_HIST = {"ELETROBRAS": "Eletrobras (privatizada em 2022)", "CODESA": "Docas do Espírito Santo (privatizada em 2022)",
              "CODOMAR": "Docas do Maranhão", "CASEMG": "Casemg"}


# nomes curtos das subsidiárias que mais investem (as demais usam a sigla)
SUBS = {"PIB BV": "Petrobras International Braspetro", "PNBV": "Petrobras Netherlands", "TRANSPETRO": "Transpetro",
        "TBG": "TBG (gasoduto Bolívia-Brasil)", "ARAUCÁRIA": "Araucária Nitrogenados", "TI B.V.": "Transpetro International",
        "PBIO": "Petrobras Biocombustível", "BR": "BR Distribuidora", "TAG": "TAG (gasodutos)", "LIQUIGÁS": "Liquigás",
        "ELETRONUCLEAR": "Eletronuclear", "INB": "Indústrias Nucleares do Brasil", "BBTS": "BB Tecnologia e Serviços",
        "CHESF": "Chesf", "FURNAS": "Furnas", "ELETRONORTE": "Eletronorte", "ELETROSUL": "Eletrosul",
        "CGT Eletrosul": "CGT Eletrosul", "SPA": "Porto de Santos (APS)", "CODESP": "Porto de Santos (Codesp)",
        "TELEBRÁS": "Telebras", "CAIXA SEGURIDADE": "Caixa Seguridade"}


def controladora(sigla: str, cadastro: dict[str, dict]) -> str:
    if sigla.startswith(("EDV ", "Ventos", "Ouro Verde", "Eólica")):
        return "ELETROBRAS"
    if sigla in HISTORICO:
        return HISTORICO[sigla]
    e = cadastro.get(sigla)
    if e and e.get("controle_acionario", "").strip() == "Controle indireto":
        g = e.get("grupo_economico", "").strip()
        if g in cadastro:
            return g
    return sigla


def main() -> int:
    try:
        cad_txt = texto(baixar_zip("sestidentificacao.zip"), "empresas-ativas.csv")
        oi = texto(baixar_zip("sestoi.zip"), "oi-despesa.csv")
    except Exception as e:  # noqa: BLE001
        log(f"Investimentos: falha no download ({e}); mantido o arquivo anterior.")
        return 0
    cadastro = {e["sigla"].strip(): e for e in csv.DictReader(io.StringIO(cad_txt), delimiter=";")}
    linhas = list(csv.DictReader(io.StringIO(oi), delimiter=";"))
    if not linhas or "realizado_dez" not in linhas[0]:
        log("Investimentos: formato do oi-despesa.csv mudou; mantido o arquivo anterior.")
        return 0
    v = lambda s: numero((s or "").strip()) if (s or "").strip() not in ("", "-") else 0.0
    # último mês publicado de cada ano (o realizado é acumulado no ano)
    soma_mes: dict[str, list[float]] = defaultdict(lambda: [0.0] * 12)
    for l in linhas:
        for m, mes in enumerate(MESES):
            soma_mes[l["exercicio"]][m] += v(l[f"realizado_{mes}"])
    ultimo = {a: max((m for m in range(12) if s[m] > 0), default=-1) for a, s in soma_mes.items()}
    serie: dict = defaultdict(lambda: defaultdict(lambda: [0.0, 0.0]))
    regioes: dict = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
    por_emp: dict = defaultdict(lambda: defaultdict(lambda: defaultdict(float)))
    acoes: dict = defaultdict(lambda: defaultdict(lambda: defaultdict(lambda: [0.0, 0.0])))
    for l in linhas:
        a = l["exercicio"]
        if ultimo.get(a, -1) < 0:
            continue
        sigla = l["empresa"].strip()
        g = controladora(sigla, cadastro)
        dot, real = v(l["lei_creditos"]), v(l[f"realizado_{MESES[ultimo[a]]}"])
        serie[g][a][0] += dot
        serie[g][a][1] += real
        regioes[g][a][l["regiao"].strip() or "NA"] += real
        por_emp[g][a][sigla] += real
        acao = acoes[g][a][l["tituloacao"].strip()]
        acao[0] += real
        acao[1] += dot
    mi = lambda x: round(x / 1e6, 1)
    grupos = []
    for g, s in serie.items():
        nome = EMPRESAS.get(g, (None,))[0] or NOMES_HIST.get(g) or g
        logo = LOGOS / nome_logo(g)
        item = {
            "sigla": g, "nome": nome, "grupo": EMPRESAS.get(g, (None, "outros"))[1],
            **({"logo": logo.name} if logo.exists() else {}),
            "serie": {a: [mi(d), mi(r)] for a, (d, r) in sorted(s.items())},
            "regioes": {a: {k: mi(x) for k, x in sorted(rg.items(), key=lambda t: -t[1]) if mi(x) > 0} for a, rg in sorted(regioes[g].items())},
            "acoes": {a: [[t, mi(r), mi(d)] for t, (r, d) in sorted(ac.items(), key=lambda t: -t[1][0])[:TOP] if mi(r) > 0]
                      for a, ac in sorted(acoes[g].items())},
        }
        emp = {a: [[e, SUBS.get(e) or EMPRESAS.get(e, (e,))[0], mi(r)] for e, r in sorted(pe.items(), key=lambda t: -t[1])[:TOP] if mi(r) > 0]
               for a, pe in sorted(por_emp[g].items())}
        if any(len(x) > 1 or (x and x[0][0] != g) for x in emp.values()):
            item["empresas"] = emp
        grupos.append(item)
    if len(grupos) < 20:
        log(f"Investimentos: só {len(grupos)} grupos; mantido o arquivo anterior.")
        return 0
    anos = sorted(a for a in ultimo if ultimo[a] >= 0)
    ref = max((a for a in anos if ultimo[a] == 11), default=anos[-1])   # último ano completo
    grupos.sort(key=lambda x: -(x["serie"].get(ref, [0, 0])[1]))
    saida = {
        "atualizado": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "fonte": "SEST/MGI, dados abertos do Orçamento de Investimento das empresas estatais federais",
        "unidade": "R$ milhões",
        "anos": [int(a) for a in anos],
        "parcial": {a: f"até {NOMES_MES[ultimo[a]]}" for a in anos if ultimo[a] < 11},
        "regioes": REGIOES,
        "grupos": grupos,
    }
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Investimentos: {len(grupos)} grupos, anos {anos[0]}–{anos[-1]}, parciais {saida['parcial'] or 'nenhum'}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
