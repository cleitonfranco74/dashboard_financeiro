#!/bin/bash
set -x
cd tmp_oi
curl -sSL -A "Mozilla/5.0" -m 300 "https://www.gov.br/gestao/pt-br/assuntos/estatais/transparencia/sestoi.zip" -o oi.zip
ls -la oi.zip; unzip -l oi.zip > lista.txt; mkdir -p x && (cd x && unzip -o -q ../oi.zip); rm oi.zip
python3 -m pip install -q pdfplumber
python3 - <<'PY'
import os, gzip, glob
def ler(f):
    raw=open(f,"rb").read()
    try: return raw.decode("utf-8")
    except UnicodeDecodeError: return raw.decode("latin-1")
with open("amostras.txt","w") as out:
    for f in sorted(glob.glob("x/**/*", recursive=True)):
        if os.path.isdir(f): continue
        out.write(f"=== {f} {os.path.getsize(f)}\n")
        if f.endswith(".csv"):
            L=ler(f).splitlines(); out.write(f"linhas {len(L)}\n"+"\n".join(L[:15])+"\n")
            gzip.open(os.path.basename(f)+".gz","wt",encoding="utf-8").write("\n".join(L))
        elif f.endswith(".pdf"):
            import pdfplumber
            with pdfplumber.open(f) as p: out.write("\n".join((x.extract_text() or "") for x in p.pages)[:12000]+"\n")
PY
rm -rf x; ls -la
