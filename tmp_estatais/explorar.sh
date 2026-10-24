#!/bin/bash
set -x
cd tmp_estatais
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
pages=(
 "https://www.gov.br/gestao/pt-br/assuntos/noticias/2026/julho/estatais-federais-lucram-r-169-4-bilhoes-em-2025-aumento-de-45-sobre-2024"
 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia"
 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/boletim-trimestral-sest"
 "https://www.gov.br/gestao/pt-br/assuntos/estatais/copy_of_transparencia/relatorio-agregado-sest"
 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/relatorio-agregado-sest"
 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/dados-abertos"
)
i=0
for p in "${pages[@]}"; do i=$((i+1)); curl -sSL -A "$UA" -m 60 "$p" -o page$i.html; echo "$i $p $(wc -c < page$i.html)" >> paginas.txt; done
grep -ohE 'href="[^"]+"' page*.html | sed 's/href="//;s/"$//' | grep -iE '\.(pdf|xlsx|xls|csv|zip|ods)|relatorio|boletim|dados-abertos|raeef' | sort -u > links.txt
curl -sSL -A "$UA" -m 120 "https://www.gov.br/gestao/pt-br/assuntos/estatais/copy_of_transparencia/relatorio%20agregado%20sest/relatorio_empresas_estatais_federais_2024-ab2023.pdf" -o raeef2024.pdf
for f in $(grep -iE '\.(pdf|xlsx|xls|csv)' links.txt | grep -iE 'agregado|raeef|relatorio|boletim|2025|2026' | head -12); do
  case $f in http*) u=$f;; /*) u="https://www.gov.br$f";; *) continue;; esac
  n=$(basename "$u" | cut -c1-80); curl -sSL -A "$UA" -m 180 "$u" -o "dl_$n"; echo "$u -> dl_$n $(wc -c < "dl_$n")" >> baixados.txt
done
for f in *.pdf dl_*.pdf; do [ -f "$f" ] && pdftotext -layout "$f" "${f%.pdf}.txt"; done
file * > tipos.txt
rm -f *.pdf page*.html
