#!/bin/bash
set -x
cd tmp_mun
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
pip install -q pdfplumber
get(){ curl -sSL -A "$UA" -m 120 "$1" -o "$2"; echo "$2 $(wc -c < "$2") $(file -b "$2" | cut -c1-40)" >> baixados.txt; }
get "https://www.scielo.br/j/dados/a/zzyM3gzHD4P45WWdytXjZWg/?format=pdf&lang=pt" dados2023.pdf
get "https://www.scielo.br/j/op/a/hv8GBg9hfCCZLwcWktfYhtC/?format=pdf&lang=pt" op_centro.pdf
get "https://andreborges.org/wp-content/uploads/2023/11/Ideological-classification-of-Brazilian-parties_appendix.pdf" borges.pdf
get "https://www.scielo.br/j/op/a/hv8GBg9hfCCZLwcWktfYhtC/?lang=pt" op_centro.html
python3 - <<'PY'
import glob, pdfplumber, re, html
for f in glob.glob("*.pdf"):
    try:
        with pdfplumber.open(f) as p:
            txt="\n\f".join((x.extract_text() or "") for x in p.pages)
            tabs=[]
            for i,pg in enumerate(p.pages):
                for t in pg.extract_tables():
                    tabs.append(f"--- pág {i+1}\n"+"\n".join(" | ".join(str(c) for c in r) for r in t))
        open(f[:-4]+".txt","w").write(txt); open(f[:-4]+".tabelas.txt","w").write("\n".join(tabs))
    except Exception as e: print(f, e)
t=open("op_centro.html",encoding="utf-8",errors="ignore").read()
tabs=re.findall(r"<table.*?</table>", t, flags=re.S); out=[]
for tb in tabs:
    for r in re.findall(r"<tr.*?</tr>", tb, flags=re.S):
        out.append(" | ".join(html.unescape(re.sub(r"<[^>]+>","",c)).strip() for c in re.findall(r"<t[hd].*?</t[hd]>", r, flags=re.S)))
    out.append("-----")
open("op_centro.html.tabelas.txt","w").write("\n".join(out))
PY
rm -f *.pdf op_centro.html; ls -la
