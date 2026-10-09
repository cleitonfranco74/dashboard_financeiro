# Dashboard Financeiro

Painel de finanças pessoais, simuladores e otimizador de carteira em português, feitos em HTML, CSS e JavaScript puros. Os dados de mercado se atualizam sozinhos.

**Site:** https://cleitonfranco74.github.io/dashboard_financeiro/

**Autor:** Prof. Dr. Cleiton Franco, Doutor em Economia e Professor Adjunto da UNEMAT (Universidade do Estado de Mato Grosso), Câmpus de Sinop.

## Páginas

### Capa (`index.html`)
Apresentação do projeto, indicadores do dia (Selic, CDI, IPCA e trajetória esperada pelo Focus), acesso às ferramentas e autoria.

### Livro-Caixa (`livro-caixa.html`)
- Resumo do mês: receitas, despesas, resultado e taxa de poupança.
- **Reserva de emergência:** quantos meses de despesas você cobre e em quanto tempo completa 6 meses.
- Fluxo de caixa dos últimos 6 meses, orçamento por categoria e livro de lançamentos com exportação para CSV.
- Dados salvos no `localStorage` do navegador.

### Simuladores (`simuladores.html`)
Aposentadoria, Tesouro Direto, Tesouro Selic, Tesouro IPCA+, Tesouro Prefixado, Tesouro Educa+ (faculdade dos filhos), quitação de dívidas, alugar ou financiar, consórcio, CDB e LCI/LCA, ações e PGBL/VGBL.
- **Dados ao vivo:** Selic, CDI, IPCA 12 meses e Focus, direto das APIs do Banco Central. As taxas de Prefixado e IPCA+ vêm do título do Tesouro com vencimento mais próximo do prazo.
- **Cenário Focus:** a Selic e o IPCA seguem mês a mês a trajetória esperada pelo mercado, e não uma taxa fixa.
- **Valores em reais de hoje:** opção de descontar a inflação esperada.
- **Taxas de equilíbrio:** Selic média que empata Prefixado × Selic e inflação implícita que empata IPCA+ × Prefixado.
- **Tesouro Selic:** projeção mês a mês com a Selic do Focus, objetivo opcional, tabela ano a ano e comparação com a poupança e com o investido corrigido pelo IPCA.
- **Tesouro IPCA+:** ganho real garantido no vencimento e o risco de vender antes: marcação a mercado para cada taxa de venda, comparada ao Tesouro Selic.
- **Tesouro Prefixado:** valor nominal garantido no vencimento, ganho real conforme a inflação, Selic e inflação de equilíbrio contra o Tesouro Selic e o IPCA+, e marcação a mercado na venda antecipada.
- **CDB e LCI/LCA:** pós-fixado, prefixado ou IPCA+, taxas de empate em cada prazo, limite do FGC e carência da LCI/LCA.
- **Tesouro Educa+:** aporte mensal para que as 60 parcelas do título paguem Medicina, Odontologia, Direito ou outro curso, com a taxa do Educa+ do ano certo.
- **Ações:** cenários sorteados de blocos de 12 meses da história real do BOVA11.
- **Sobra do Livro-Caixa:** a sobra média entra como aporte com um clique.

### Carteira eficiente (`carteira.html`)
Otimização de Markowitz com Tesouro Selic/CDI, Prefixado, IPCA+, BOVA11, IVVB11 e ações (ITUB4, PETR4, VALE3, WEGE3, BBAS3).
- **Retornos esperados:** pelas taxas de mercado de hoje e pelo CAPM (CDI esperado + beta × prêmio de risco), ou pela média histórica, para comparação.
- **Covariâncias:** com encolhimento Ledoit-Wolf.
- **Otimização:** fronteira eficiente, linha de mercado de capitais e carteira de máximo Sharpe.
- **Perfil de risco:** por volatilidade máxima aceita.
- **Estabilidade dos pesos:** reamostragem de Michaud.
- **Teste histórico:** com rebalanceamento, comparado ao CDI e ao BOVA11, mais o mapa de correlações.

## Dados de mercado
`data/mercado.json` é atualizado todo dia útil às 19h (Brasília) pela GitHub Action `.github/workflows/mercado.yml`, que roda `scripts/atualizar_mercado.py`. Fontes:
- **BCB SGS:** Selic (432), CDI (4389 e 4391), IPCA (433 e 13522).
- **Boletim Focus:** expectativas anuais de Selic e IPCA.
- **Tesouro Transparente:** preços e taxas do Tesouro Direto.
- **Yahoo Finance (yfinance):** preços mensais ajustados das ações e ETFs.

Para atualizar à mão: aba **Actions** → *Atualizar dados de mercado* → *Run workflow*.

Para editar a lista de ações, altere `ACOES` em `scripts/atualizar_mercado.py` e `ATIVOS` em `carteira.html`.

## Aviso
Ferramenta educacional. Estimativas não são recomendação de investimento. As regras tributárias refletem a legislação conhecida na data de criação.
