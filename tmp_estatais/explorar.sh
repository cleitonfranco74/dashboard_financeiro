#!/bin/bash
set -x
mkdir -p tmp_estatais/g && cd tmp_estatais/g
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
curl -sSL -A "$UA" -m 300 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/sestdadosfinanceiros.zip" -o d.zip
unzip -o -q d.zip sest-dadosfinanceiros-demonstracoes.csv sest-dadosfinanceiros-dicionario.pdf; rm d.zip
grep -v ";Balanço;" sest-dadosfinanceiros-demonstracoes.csv | gzip -9 > demonstracoes_sem_balanco.csv.gz
rm sest-dadosfinanceiros-demonstracoes.csv
python3 -m pip install -q pdfplumber && python3 -c "
import pdfplumber
with pdfplumber.open('sest-dadosfinanceiros-dicionario.pdf') as p: open('dicionario.txt','w').write('\n'.join(x.extract_text() or '' for x in p.pages))"
ls -la
