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

### Calculadoras (`calculadoras.html`)
35 calculadoras em 3 grupos, abertas a partir de uma vitrine em cartões, como no Investidor Sardinha. Links como `calculadoras.html#clt-pj` abrem direto a calculadora.
- **Financeiras:** primeiro milhão com carteiras sugeridas, juros compostos, juros simples, poupança × Selic, rentabilidade (bruta, líquida e real), viver de renda, reserva de emergência, CDB, comparador de renda fixa, marcação a mercado, comparador de ações (dados em `data/acoes.json`, gerado por `scripts/atualizar_acoes.py`), preço-teto, número mágico, à vista ou parcelado, juros do Pix parcelado e simulador de amortização (SAC ou Price, TR ou IPCA, aportes extras para reduzir prazo ou parcela). Aposentadoria e aluguel × financiamento abrem os simuladores.
- **Trabalhistas:** CLT vs PJ, calculadora PJ (MEI, Simples III e V, Simples híbrido e Lucro Presumido, com cenário da reforma tributária de 2027 a 2033), produtor rural PF ou PJ (livro-caixa, Lucro Presumido e Lucro Real, com Funrural), salário líquido, custo de funcionário, férias, férias proporcionais, 13º, INSS, FGTS com saque-aniversário, horas extras, seguro-desemprego, isenção do IR 2026 e rescisão.
- **Utilitárias:** contador de dias, dias úteis com feriados nacionais, carro a combustão × elétrico, custos fixos (regra 50-30-20) e comparador de cartões de crédito.
- INSS e IR pelas tabelas de 2026, com o redutor da Lei 15.270/2025; CDI e IPCA projetados pelo Boletim Focus.

Todas as páginas usam o mesmo visual escuro com destaque verde-limão e a mesma barra de navegação; Livro-Caixa, Simuladores e Carteira carregam o tema compartilhado `assets/tema.css`.

Cada calculadora, cada simulador, o Livro-Caixa e a Carteira trazem abaixo dos resultados um **Como usar** (passo a passo), um **Entenda** (os conceitos por trás da conta) e **Perguntas frequentes**. Os textos ficam em `assets/guias.js`, compartilhado pelas duas páginas.

### Simuladores (`simuladores.html`)
22 simuladores em 5 grupos, abertos a partir de uma vitrine em cartões, com navegação em dois níveis (grupo e simulador):
- **Tesouro Direto:** comparar títulos, Tesouro Selic, IPCA+, Prefixado e Educa+ (faculdade dos filhos).
- **Investimentos:** CDB e LCI/LCA, ações, dividendos, fundos imobiliários e criptomoedas.
- **Aposentadoria e impostos:** aposentadoria, previdência privada, PGBL ou VGBL e imposto de renda.
- **Crédito e moradia:** quitar dívidas, financiar veículo, financiar imóvel, alugar ou financiar e consórcio.
- **Viagem:** orçamento de viagem, passagens aéreas e câmbio.

Links como `simuladores.html#ipca` abrem direto o simulador, já no grupo certo.
- **Dados ao vivo:** Selic, CDI, IPCA 12 meses e Focus, direto das APIs do Banco Central. As taxas de Prefixado e IPCA+ vêm do título do Tesouro com vencimento mais próximo do prazo.
- **Cenário Focus:** a Selic e o IPCA seguem mês a mês a trajetória esperada pelo mercado, e não uma taxa fixa.
- **Valores em reais de hoje:** opção de descontar a inflação esperada.
- **Taxas de equilíbrio:** Selic média que empata Prefixado × Selic e inflação implícita que empata IPCA+ × Prefixado.
- **Tesouro Selic:** projeção mês a mês com a Selic do Focus, objetivo opcional, tabela ano a ano e comparação com a poupança e com o investido corrigido pelo IPCA.
- **Tesouro IPCA+:** ganho real garantido no vencimento e o risco de vender antes: marcação a mercado para cada taxa de venda, comparada ao Tesouro Selic.
- **Tesouro Prefixado:** valor nominal garantido no vencimento, ganho real conforme a inflação, Selic e inflação de equilíbrio contra o Tesouro Selic e o IPCA+, e marcação a mercado na venda antecipada.
- **Financiar veículo:** parcela do CDC com IOF e tarifas, CET, saldo devedor contra a depreciação, custo mensal de ter o carro e comparação com juntar e comprar à vista.
- **Financiar imóvel:** SAC × Price com TR, seguros MIP e DFI e taxa de administração, CET, renda mínima, FGTS e amortizações extras para reduzir prazo ou parcela.
- **CDB e LCI/LCA:** pós-fixado, prefixado ou IPCA+, taxas de empate em cada prazo, limite do FGC e carência da LCI/LCA.
- **Dividendos:** renda mensal de ações pagadoras, yield on cost, IR sobre JCP e dividendos, preço-teto de Bazin e preço justo pelo modelo de Gordon.
- **Orçamento de viagem:** três cenários (econômico, médio e luxo) para destinos europeus prontos (Itália, França, Grécia, Alemanha, Holanda, Leste Europeu, Noruega, Rússia, Portugal e Espanha) ou valores próprios, custo por categoria com câmbio e IOF, quanto guardar por mês até a data e se compensa pagar à vista com desconto ou parcelar sem juros.
- **Passagens aéreas:** links de busca já preenchidos (Google Voos, Skyscanner, Kayak, Momondo) para voos nacionais e internacionais, antecedência ideal e comparação entre pagar em dinheiro ou em milhas. Não consulta preços ao vivo.
- **Câmbio e viagem:** cartão de crédito, pré-pago, conta global e espécie pelo valor efetivo total (spread + IOF), risco cambial até a viagem com a volatilidade do dólar e quanto guardar por mês.
- **Imposto de renda:** IR retido no salário pela tabela de 2026 (com o redutor), INSS, declaração completa × simplificada, efeito do PGBL e alíquotas efetiva e marginal faixa a faixa.
- **Criptomoedas:** bitcoin e ethereum com cenários sorteados do histórico em reais, quedas no caminho, peso no patrimônio e IR conforme onde se investe (exchange no Brasil com isenção de R$ 35 mil/mês, exterior ou ETF).
- **Previdência privada:** saldo na aposentadoria, custo das taxas de administração e carregamento, restituição do PGBL e renda líquida mensal nas tabelas progressiva e regressiva.
- **Fundos imobiliários:** renda mensal ao longo do tempo, número mágico, prazo para a renda desejada, IR sobre o ganho de capital e comparação com o Tesouro Selic e o IPCA+.
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
- **Yahoo Finance (yfinance):** preços mensais ajustados das ações e ETFs, de bitcoin e ethereum em reais, e o fechamento diário do Ibovespa nos últimos 12 meses.
- **BCB SGS 1:** dólar PTAX de venda, diário (último valor também lido ao vivo na página inicial).

Para atualizar à mão: aba **Actions** → *Atualizar dados de mercado* → *Run workflow*.

Para editar a lista de ações, altere `ACOES` em `scripts/atualizar_mercado.py` e `ATIVOS` em `carteira.html`.

## Aviso
Ferramenta educacional. Estimativas não são recomendação de investimento. As regras tributárias refletem a legislação conhecida na data de criação.
