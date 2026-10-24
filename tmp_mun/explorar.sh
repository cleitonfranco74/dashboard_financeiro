#!/bin/bash
set -x
cd tmp_mun
UA="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"
pip install -q pdfplumber requests
# 1) Artigo (tabela de ideologia)
curl -sSL -A "$UA" -m 60 "https://www.scielo.br/j/dados/a/zzyM3gzHD4P45WWdytXjZWg/?lang=pt" -o artigo_pt.html
curl -sSL -A "$UA" -m 60 "https://www.scielo.br/j/dados/a/zzyM3gzHD4P45WWdytXjZWg/?lang=en" -o artigo_en.html
python3 - <<'PY'
import re, html
for f in ["artigo_pt.html","artigo_en.html"]:
    t=open(f,encoding="utf-8",errors="ignore").read()
    tabs=re.findall(r"<table.*?</table>", t, flags=re.S)
    out=[]
    for tb in tabs:
        rows=re.findall(r"<tr.*?</tr>", tb, flags=re.S)
        for r in rows:
            cells=[html.unescape(re.sub(r"<[^>]+>","",c)).strip() for c in re.findall(r"<t[hd].*?</t[hd]>", r, flags=re.S)]
            out.append(" | ".join(cells))
        out.append("-----")
    open(f+".tabelas.txt","w").write("\n".join(out))
    print(f, len(tabs))
PY
rm -f artigo_*.html
# 2) Siconfi DCA: um município (Sinop 5107909), 2016 e 2024, anexos
python3 - <<'PY'
import requests, json, time
B="https://apidatalake.tesouro.gov.br/ords/siconfi/tt/"
out=[]
for ano in (2016, 2024):
    for anexo in ("DCA-Anexo I-C","DCA-Anexo I-D","DCA-Anexo I-E"):
        t=time.time()
        r=requests.get(B+"dca", params={"an_exercicio":ano,"id_ente":5107909,"no_anexo":anexo}, timeout=60)
        j=r.json(); it=j.get("items",[])
        out.append(f"{ano} {anexo} status={r.status_code} itens={len(it)} hasMore={j.get('hasMore')} t={time.time()-t:.1f}s")
        contas=sorted({(i.get('cod_conta'),i.get('conta'),i.get('coluna')) for i in it})
        out += [f"   {c}" for c in contas[:400]]
# DCA sem id_ente (todos os entes?)
r=requests.get(B+"dca", params={"an_exercicio":2023,"no_anexo":"DCA-Anexo I-D"}, timeout=120)
out.append(f"sem id_ente status={r.status_code} {r.text[:300]}")
# entes
r=requests.get(B+"entes", timeout=60); j=r.json()
out.append(f"entes itens={len(j.get('items',[]))} exemplo={j.get('items',[{}])[:2]}")
open("siconfi.txt","w").write("\n".join(out))
PY
# 3) IBGE SIDRA: PAM soja (5457) e PPM bovinos (3939), PIB municipal (5938), população (6579) — MT
for u in "t/5457/n6/in%20n3%2051/v/216,214/p/2016,2024/c782/40124" "t/3939/n6/in%20n3%2051/v/105/p/2016,2024/c79/2670" "t/5938/n6/in%20n3%2051/v/37,513/p/last%203" "t/6579/n6/in%20n3%2051/v/9324/p/2016,2024"; do
  curl -sSL -m 120 "https://apisidra.ibge.gov.br/values/$u" -o s.json; echo "== $u $(wc -c < s.json)" >> sidra.txt; head -c 1500 s.json >> sidra.txt; echo >> sidra.txt
done
rm -f s.json
# 4) TSE: votação por candidato e município (2020), tamanho e colunas
curl -sSL -m 600 "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2020.zip" -o v.zip
ls -la v.zip; unzip -l v.zip | head -40 > tse.txt
unzip -p v.zip "votacao_candidato_munzona_2020_MT.csv" | head -5 | iconv -f latin1 -t utf-8 >> tse.txt
rm -f v.zip
# 5) tabela TSE x IBGE
curl -sSL -m 60 "https://raw.githubusercontent.com/betafcc/Municipios-Brasileiros-TSE/master/municipios_brasileiros_tse.csv" | head -5 > crosswalk.txt
ls -la
