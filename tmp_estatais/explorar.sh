#!/bin/bash
set -x
mkdir -p tmp_estatais/h && cd tmp_estatais/h
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
curl -sSL -A "$UA" -m 300 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/sestdadosfinanceiros.zip" -o d.zip
unzip -o -q d.zip sest-dadosfinanceiros-demonstracoes.csv; rm d.zip
python3 - <<'PY'
import gzip, collections
raw = open("sest-dadosfinanceiros-demonstracoes.csv","rb").read()
try: txt = raw.decode("utf-8"); enc="utf-8"
except UnicodeDecodeError: txt = raw.decode("latin-1"); enc="latin-1"
linhas = txt.splitlines()
per = collections.Counter(); dem = collections.Counter()
out = [linhas[0]]
for l in linhas[1:]:
    p = l.split(";")
    per[(p[0], p[1])] += 1; dem[p[4]] += 1
    if p[4] in ("DRE",) or "DRE" in p[4] or "Resultado" in p[4]: out.append(l)
with gzip.open("dre.csv.gz","wt",encoding="utf-8") as f: f.write("\n".join(out))
with open("resumo.txt","w") as f:
    f.write(f"encoding {enc}\nlinhas {len(linhas)}\n{dem}\n")
    for k,v in sorted(per.items()): f.write(f"{k} {v}\n")
PY
rm sest-dadosfinanceiros-demonstracoes.csv
ls -la; cat resumo.txt
