"""Sonda temporária: testa endereços públicos da B3 para o DI futuro (DI1F28)."""
import requests, sys
URLS = [
    "https://cotacao.b3.com.br/mds/api/v1/DerivativeQuotation/DI1",
    "https://cotacao.b3.com.br/mds/api/v1/InstrumentQuotation/DI1F28",
    "https://cotacao.b3.com.br/mds/api/v1/DailyFluctuationHistory/DI1F28",
    "https://cotacao.b3.com.br/mds/api/v1/InstrumentPriceFluctuation/DI1F28",
    "https://www2.bmf.com.br/pages/portal/bmfbovespa/lumis/lum-ajustes-do-pregao-ptBR.asp",
    "https://sistemaswebb3-derivativos.b3.com.br/financialIndicatorsProxy/FinancialIndicators/GetFinancialIndicators/eyJsYW5ndWFnZSI6InB0LWJyIn0=",
]
s = requests.Session(); s.headers["User-Agent"] = "Mozilla/5.0"
for u in URLS:
    try:
        r = s.get(u, timeout=30)
        print(f"== {u}\n   {r.status_code} {r.headers.get('content-type')} {len(r.text)}B")
        print("   " + r.text[:1500].replace("\n"," ") + "\n", flush=True)
    except Exception as e:
        print(f"== {u}\n   ERRO {e}\n", flush=True)
