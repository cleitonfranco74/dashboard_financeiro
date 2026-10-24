"""Atualiza data/estatais.json: receita e lucro (ou prejuízo) de cada estatal federal de controle
direto da União, ano a ano desde 2016.

Fonte: dados abertos da Secretaria de Coordenação e Governança das Empresas Estatais (SEST/MGI),
extraídos do Siest e validados pelo contador de cada empresa:
- sestidentificacao.zip: cadastro das empresas ativas (controle direto ou indireto, ministério);
- sestdadosfinanceiros.zip: demonstrações contábeis (DRE). Até 2024 os dados são anuais; a partir
  de 2025 são trimestrais e acumulados no ano, e o 4º trimestre equivale ao exercício completo.
Definições:
- lucro: "Lucro ou prejuízo líquido do exercício" (até 2024) e "Lucro/prejuízo líquido" (2025 em diante);
- receita: receita bruta de vendas de bens e serviços; nos bancos, receitas da intermediação
  financeira mais receitas de prestação de serviços e tarifas.
Se o download falhar, o arquivo anterior é mantido. Roda pela GitHub Action em .github/workflows/mercado.yml.
"""
from __future__ import annotations

import csv
import io
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

import requests

RAIZ = Path(__file__).resolve().parent.parent
SAIDA = RAIZ / "data" / "estatais.json"
LOGOS = RAIZ / "assets" / "logos"   # logomarcas baixadas por scripts/baixar_logos.py
BASE = "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/"
H = {"User-Agent": "Mozilla/5.0 (dashboard-financeiro; +github.com/cleitonfranco74/dashboard_financeiro)"}
INICIO = 2016

# Nome curto e grupo de cada estatal (os nomes do cadastro variam entre maiúsculas e minúsculas).
GRUPOS = {
    "financeiro": "Bancos públicos e crédito",
    "energia": "Petróleo, energia e minas",
    "infra": "Portos, aeroportos e transportes",
    "tec": "Tecnologia, correios e comunicação",
    "industria": "Indústria e defesa",
    "social": "Saúde, pesquisa e abastecimento",
}
EMPRESAS = {
    "PETROBRAS": ("Petrobras", "energia"), "PPSA": ("Pré-Sal Petróleo (PPSA)", "energia"),
    "ENBPar": ("ENBPar", "energia"), "EPE": ("Empresa de Pesquisa Energética (EPE)", "energia"),
    "CPRM": ("Serviço Geológico do Brasil (CPRM)", "energia"),
    "BNDES": ("BNDES", "financeiro"), "BB": ("Banco do Brasil", "financeiro"), "CAIXA": ("Caixa", "financeiro"),
    "BNB": ("Banco do Nordeste", "financeiro"), "BASA": ("Banco da Amazônia", "financeiro"),
    "FINEP": ("Finep", "financeiro"), "EMGEA": ("Emgea", "financeiro"), "ABGF": ("ABGF", "financeiro"),
    "APS": ("Porto de Santos (APS)", "infra"), "CDC": ("Docas do Ceará", "infra"), "CDP": ("Docas do Pará", "infra"),
    "CDRJ": ("Docas do Rio (PortosRio)", "infra"), "CODEBA": ("Docas da Bahia", "infra"),
    "CODERN": ("Docas do Rio Grande do Norte", "infra"), "INFRAERO": ("Infraero", "infra"),
    "NAV Brasil": ("NAV Brasil", "infra"), "CBTU": ("CBTU (trens urbanos)", "infra"),
    "TRENSURB": ("Trensurb", "infra"), "INFRA S.A.": ("Infra S.A.", "infra"),
    "ECT": ("Correios", "tec"), "SERPRO": ("Serpro", "tec"), "DATAPREV": ("Dataprev", "tec"),
    "TELEBRAS": ("Telebras", "tec"), "EBC": ("EBC", "tec"),
    "CMB": ("Casa da Moeda", "industria"), "IMBEL": ("Imbel", "industria"), "NUCLEP": ("Nuclep", "industria"),
    "CEITEC": ("Ceitec", "industria"), "HEMOBRÁS": ("Hemobrás", "industria"), "AMAZUL": ("Amazul", "industria"),
    "EMGEPRON": ("Emgepron", "industria"),
    "EBSERH": ("Ebserh", "social"), "HCPA": ("Hospital de Clínicas de Porto Alegre", "social"),
    "CONCEIÇÃO": ("Grupo Hospitalar Conceição", "social"), "EMBRAPA": ("Embrapa", "social"),
    "CODEVASF": ("Codevasf", "social"), "CONAB": ("Conab", "social"), "CEAGESP": ("Ceagesp", "social"),
    "CEASAMINAS": ("CeasaMinas", "social"),
}


def nome_logo(sigla: str) -> str:
    """Mesmo nome de arquivo usado por scripts/baixar_logos.py."""
    return (sigla.lower().replace(" ", "-").replace(".", "").replace("ç", "c").replace("á", "a").replace("ã", "a") + ".png")


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def baixar_zip(nome: str) -> zipfile.ZipFile:
    r = requests.get(BASE + nome, headers=H, timeout=300)
    r.raise_for_status()
    return zipfile.ZipFile(io.BytesIO(r.content))


def texto(z: zipfile.ZipFile, padrao: str) -> str:
    """Lê o CSV do zip cujo nome termina com o padrão; os arquivos da SEST vêm em latin-1 ou UTF-8."""
    nome = next(n for n in z.namelist() if n.endswith(padrao))
    raw = z.read(nome)
    try:
        return raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        return raw.decode("latin-1")


def numero(s: str) -> float:
    return float(s.replace(".", "").replace(",", ".") or 0)


def cadastro(txt: str) -> dict[str, dict]:
    out = {}
    for e in csv.DictReader(io.StringIO(txt), delimiter=";"):
        if e.get("controle_acionario", "").strip() != "Controle direto":
            continue
        sigla = e["sigla"].strip()
        nome, grupo = EMPRESAS.get(sigla, (sigla, "social"))
        logo = LOGOS / nome_logo(sigla)
        out[e["codigo_siest"].strip()] = {
            "sigla": sigla, "nome": nome, "grupo": grupo, **({"logo": logo.name} if logo.exists() else {}),
            "ministerio": e.get("ministerio_supervisor", "").strip(),
            "dependente": e.get("dependencia", "").strip().startswith("Dependente"),
            "banco": e.get("segmento", "").strip() == "Financeiro",
        }
    return out


def demonstracoes(txt: str, empresas: dict[str, dict]) -> dict:
    """Retorna {codigo: {ano: {"periodo": str, "contas": {rubrica: valor}}}} com o período mais completo de cada ano."""
    contas: dict[tuple, dict] = {}
    linhas = iter(txt.splitlines())
    cab = next(linhas).split(";")
    i = {c: cab.index(c) for c in ("exercicio", "periodicidade", "codigo_siest", "demonstrativo", "rubrica_codigo", "valor")}
    for l in linhas:
        p = l.split(";")
        if len(p) < len(cab) or p[i["demonstrativo"]] != "DRE" or p[i["codigo_siest"]] not in empresas:
            continue
        chave = (p[i["codigo_siest"]], int(p[i["exercicio"]]), p[i["periodicidade"]])
        contas.setdefault(chave, {}).setdefault(p[i["rubrica_codigo"]], numero(p[i["valor"]]))
    ordem = lambda per: 5 if per == "Anual" else int(m.group(1)) if (m := re.match(r"(\d)", per)) else 0
    melhor: dict = {}
    for (cod, ano, per), c in contas.items():
        atual = melhor.setdefault(cod, {}).get(ano)
        if atual is None or ordem(per) > ordem(atual["periodo"]):
            melhor[cod][ano] = {"periodo": per, "contas": c}
    return melhor


def receita_lucro(c: dict) -> tuple[float | None, float | None]:
    if "500000" in c or "300100" in c or "310000" in c:              # plano de contas até 2024
        rec = c.get("300100", 0) + c.get("310100", 0) if "300100" in c else c.get("310000")
        return rec, c.get("500000")
    rec = c.get("200100000", 0) + c.get("240104000", 0) if "200100000" in c else c.get("220100000")
    return rec, c.get("290000000", c.get("289900000"))


def main() -> int:
    try:
        empresas = cadastro(texto(baixar_zip("sestidentificacao.zip"), "empresas-ativas.csv"))
        dre = demonstracoes(texto(baixar_zip("sestdadosfinanceiros.zip"), "demonstracoes.csv"), empresas)
    except Exception as e:  # noqa: BLE001
        log(f"Estatais: falha no download ({e}); mantido o arquivo anterior.")
        return 0
    anos: set[int] = set()
    parcial: dict[str, str] = {}
    lista = []
    for cod, e in empresas.items():
        serie = {}
        for ano, d in sorted(dre.get(cod, {}).items()):
            if ano < INICIO:
                continue
            rec, luc = receita_lucro(d["contas"])
            if luc is None:
                continue
            serie[str(ano)] = [round(rec / 1e6, 1) if rec is not None else None, round(luc / 1e6, 1), d["periodo"]]
        if serie:
            lista.append({**e, "serie": serie})
    if len(lista) < 20:
        log(f"Estatais: só {len(lista)} empresas com dados; mantido o arquivo anterior.")
        return 0
    # um ano é parcial enquanto nenhuma empresa tiver o ano completo; num ano completo,
    # a empresa que só entregou parte do ano fica sem dado
    completo = lambda per: per in ("Anual", "4º Trimestre")
    completos = {a for x in lista for a, v in x["serie"].items() if completo(v[2])}
    for x in lista:
        for a, v in list(x["serie"].items()):
            if a in completos and not completo(v[2]):
                del x["serie"][a]
            else:
                if not completo(v[2]):
                    parcial[a] = v[2].replace("Trimestre", "trimestre")
                x["serie"][a] = v[:2]
                anos.add(int(a))
    ref = str(max(a for a in anos if str(a) not in parcial))
    lista.sort(key=lambda x: -(x["serie"].get(ref, [0, 0])[1] or 0))
    saida = {
        "atualizado": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "fonte": "SEST/MGI, dados abertos das empresas estatais federais (Siest)",
        "unidade": "R$ milhões",
        "anos": sorted(anos),
        "parcial": parcial,
        "grupos": GRUPOS,
        "empresas": lista,
    }
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"Estatais: {len(lista)} empresas, anos {min(anos)}–{max(anos)}, parciais {parcial or 'nenhum'}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
