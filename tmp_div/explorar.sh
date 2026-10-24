#!/bin/bash
set -x
cd tmp_div
curl -sSL -A "Mozilla/5.0" -m 300 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/sestdadosfinanceiros.zip" -o d.zip
unzip -o -q d.zip sest-dadosfinanceiros-demonstracoes.csv sest-dadosfinanceiros-composicao-acionaria.csv; rm d.zip
python3 - <<'PY'
import gzip, re
def ler(f):
    raw=open(f,"rb").read()
    try: return raw.decode("utf-8")
    except UnicodeDecodeError: return raw.decode("latin-1")
L=ler("sest-dadosfinanceiros-demonstracoes.csv").splitlines()
out=[L[0]]+[l for l in L[1:] if re.search(r"(?i)dividend|jcp|juros sobre (o )?capital|uni[aã]o|tesouro", l.split(";")[6] if len(l.split(";"))>6 else "")]
gzip.open("div.csv.gz","wt",encoding="utf-8").write("\n".join(out))
open("composicao_head.txt","w").write("\n".join(ler("sest-dadosfinanceiros-composicao-acionaria.csv").splitlines()[:40]))
print(len(out))
PY
rm sest-dadosfinanceiros-*.csv; ls -la
