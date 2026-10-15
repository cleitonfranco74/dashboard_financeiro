import io, requests, pandas as pd
H={"User-Agent":"Mozilla/5.0 dashboard-financeiro"}
base="https://www.gov.br/anp/pt-br/assuntos/precos-e-defesa-da-concorrencia/precos/precos-revenda-e-de-distribuicao-combustiveis/shlp/semanal/"
for nome in ["semanal-brasil-desde-2013.xlsx","semanal-estados-desde-2013.xlsx","semanal-brasil-2026.xlsx"]:
    try:
        r=requests.get(base+nome,headers=H,timeout=60); print(nome, r.status_code, r.headers.get("content-type"), len(r.content))
        if r.ok and r.content[:2]==b"PK":
            x=pd.ExcelFile(io.BytesIO(r.content)); print(" sheets", x.sheet_names)
            for sh in x.sheet_names[:2]:
                df=pd.read_excel(x, sh, header=None, nrows=20); print(df.to_string(max_colwidth=25)[:3000])
                df=pd.read_excel(x, sh, header=None); print(" linhas", len(df)); print(df.tail(4).to_string(max_colwidth=25)[:2000])
    except Exception as e: print(nome, "erro", e)
try:
    r=requests.get(base,headers=H,timeout=60); print("indice", r.status_code)
    import re; print(sorted(set(re.findall(r'href="([^"]+\.xlsx)"', r.text)))[:40])
except Exception as e: print("indice erro", e)
for u in ["https://fred.stlouisfed.org/graph/fredgraph.csv?id=GASDESW","https://api.eia.gov/series/?series_id=PET.EMD_EPD2D_PTE_NUS_DPG.W"]:
    try:
        r=requests.get(u,headers=H,timeout=60); print(u, r.status_code); print(r.text[:200]); print(r.text[-200:])
    except Exception as e: print(u,"erro",e)
import yfinance as yf
for t in ["BZ=F","BRL=X"]:
    h=yf.Ticker(t).history(start="2021-01-01", interval="1wk"); print(t, len(h)); print(h["Close"].tail(3))
