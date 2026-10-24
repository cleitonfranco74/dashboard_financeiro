#!/bin/bash
set -x
mkdir -p tmp_estatais/z && cd tmp_estatais/z
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
B=https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia
for z in sestdadosfinanceiros sestidentificacao; do
  curl -sSL -A "$UA" -m 300 "$B/$z.zip" -o $z.zip; ls -la $z.zip; file $z.zip
  mkdir -p $z && (cd $z && unzip -o -q ../$z.zip); rm $z.zip
done
curl -sSL -A "$UA" -m 60 "$B/dados-abertos" | python3 -c "
import sys,re,html
t=sys.stdin.read(); t=re.sub(r'<script.*?</script>|<style.*?</style>','',t,flags=re.S)
print(html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',t)))[:20000])" > ../dados_abertos_pagina.txt
find . -type f -exec ls -la {} \; > ../arquivos.txt
for f in $(find . -type f); do echo "=== $f"; head -c 3000 "$f" | iconv -f latin1 -t utf-8 2>/dev/null; echo; done > ../amostras.txt
# guarda só arquivos pequenos (até 20 MB) para análise
find . -type f -size +20M -delete
