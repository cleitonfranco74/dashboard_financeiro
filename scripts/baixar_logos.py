"""Baixa as logomarcas das estatais federais para assets/logos/<sigla>.png (uso pontual, não diário).

Busca cada empresa no Wikidata, lê a propriedade "logo" (P154) e baixa a imagem do Wikimedia Commons
em PNG com 240 px de largura. Grava assets/logos/relatorio.txt com a entidade escolhida para conferência.
Empresas sem logomarca no Wikidata ficam com a sigla na página.
Uso: python scripts/baixar_logos.py [SIGLA ...]
"""
from __future__ import annotations

import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests

RAIZ = Path(__file__).resolve().parent.parent
DEST = RAIZ / "assets" / "logos"
H = {"User-Agent": "dashboard-financeiro/1.0 (https://github.com/cleitonfranco74/dashboard_financeiro)"}
WD = "https://www.wikidata.org/w/api.php"

# sigla → termos de busca no Wikidata (o primeiro resultado com logomarca é usado)
BUSCA = {
    "PETROBRAS": ["Petrobras"], "PPSA": ["Pré-Sal Petróleo"], "ENBPar": ["ENBPar", "Empresa Brasileira de Participações em Energia Nuclear e Binacional"],
    "EPE": ["Empresa de Pesquisa Energética"], "CPRM": ["Serviço Geológico do Brasil", "CPRM"],
    "BNDES": ["Banco Nacional de Desenvolvimento Econômico e Social"], "BB": ["Banco do Brasil"], "CAIXA": ["Caixa Econômica Federal"],
    "BNB": ["Banco do Nordeste"], "BASA": ["Banco da Amazônia"], "FINEP": ["Finep", "Financiadora de Estudos e Projetos"],
    "EMGEA": ["Empresa Gestora de Ativos"], "ABGF": ["Agência Brasileira Gestora de Fundos Garantidores e Garantias"],
    "APS": ["Autoridade Portuária de Santos", "Santos Port Authority"], "CDC": ["Companhia Docas do Ceará"], "CDP": ["Companhia Docas do Pará"],
    "CDRJ": ["Companhia Docas do Rio de Janeiro", "PortosRio"], "CODEBA": ["Companhia das Docas do Estado da Bahia"],
    "CODERN": ["Companhia Docas do Rio Grande do Norte"], "INFRAERO": ["Infraero"], "NAV Brasil": ["NAV Brasil"],
    "CBTU": ["Companhia Brasileira de Trens Urbanos"], "TRENSURB": ["Trensurb"], "INFRA S.A.": ["Infra S.A.", "Valec"],
    "ECT": ["Correios", "Empresa Brasileira de Correios e Telégrafos"], "SERPRO": ["Serpro", "Serviço Federal de Processamento de Dados"],
    "DATAPREV": ["Dataprev"], "TELEBRAS": ["Telebras"], "EBC": ["Empresa Brasil de Comunicação"],
    "CMB": ["Casa da Moeda do Brasil"], "IMBEL": ["Imbel", "Indústria de Material Bélico do Brasil"], "NUCLEP": ["Nuclep"],
    "CEITEC": ["Ceitec"], "HEMOBRÁS": ["Hemobrás"], "AMAZUL": ["Amazul", "Amazônia Azul Tecnologias de Defesa"],
    "EMGEPRON": ["Emgepron", "Empresa Gerencial de Projetos Navais"], "EBSERH": ["Ebserh", "Empresa Brasileira de Serviços Hospitalares"],
    "HCPA": ["Hospital de Clínicas de Porto Alegre"], "CONCEIÇÃO": ["Grupo Hospitalar Conceição", "Hospital Nossa Senhora da Conceição"],
    "EMBRAPA": ["Embrapa"], "CODEVASF": ["Codevasf"], "CONAB": ["Companhia Nacional de Abastecimento"], "CEAGESP": ["Ceagesp"],
    "CEASAMINAS": ["CeasaMinas", "Centrais de Abastecimento de Minas Gerais"],
}


def arquivo(sigla: str) -> Path:
    return DEST / nome_logo(sigla)


def nome_logo(sigla: str) -> str:
    return (sigla.lower().replace(" ", "-").replace(".", "").replace("ç", "c").replace("á", "a").replace("ã", "a") + ".png")


def logo(termo: str) -> tuple[str, str, str] | None:
    r = requests.get(WD, params={"action": "wbsearchentities", "search": termo, "language": "pt", "uselang": "pt",
                                 "limit": 5, "format": "json"}, headers=H, timeout=30).json()
    for item in r.get("search", []):
        ent = requests.get(WD, params={"action": "wbgetclaims", "entity": item["id"], "property": "P154", "format": "json"},
                           headers=H, timeout=30).json()
        claims = ent.get("claims", {}).get("P154", [])
        if claims:
            return item["id"], f'{item.get("label", "")} — {item.get("description", "")}', claims[0]["mainsnak"]["datavalue"]["value"]
    return None


def main() -> int:
    DEST.mkdir(parents=True, exist_ok=True)
    siglas = sys.argv[1:] or list(BUSCA)
    linhas = []
    for s in siglas:
        achado = None
        for termo in BUSCA[s]:
            try:
                achado = logo(termo)
            except Exception as e:  # noqa: BLE001
                linhas.append(f"{s}\tERRO busca {termo}: {e}")
            if achado:
                break
            time.sleep(0.3)
        if not achado:
            linhas.append(f"{s}\tsem logomarca no Wikidata")
            continue
        qid, rotulo, nome = achado
        url = "https://commons.wikimedia.org/wiki/Special:FilePath/" + quote(nome.replace(" ", "_")) + "?width=240"
        try:
            img = requests.get(url, headers=H, timeout=60)
            img.raise_for_status()
            arquivo(s).write_bytes(img.content)
            if "png" not in img.headers.get("content-type", ""):
                try:  # JPEG ou WebP do Commons viram PNG de verdade (precisa do Pillow)
                    from PIL import Image
                    Image.open(arquivo(s)).convert("RGBA").save(arquivo(s), "PNG", optimize=True)
                except ImportError:
                    pass
            linhas.append(f"{s}\t{qid}\t{rotulo}\t{nome}\t{len(img.content)} bytes\t{img.headers.get('content-type')}")
        except Exception as e:  # noqa: BLE001
            linhas.append(f"{s}\t{qid}\t{nome}\tERRO download: {e}")
        time.sleep(0.3)
    (DEST / "relatorio.txt").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print("\n".join(linhas))
    return 0


if __name__ == "__main__":
    sys.exit(main())
