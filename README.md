# Dashboard Financeiro

Painel de finanças pessoais, simuladores e otimizador de carteira em português, feitos em HTML, CSS e JavaScript puros. Os dados de mercado se atualizam sozinhos.

**Site:** https://cleitonfranco74.github.io/dashboard_financeiro/

**Autor:** Prof. Dr. Cleiton Franco, Doutor em Economia e Professor Adjunto da UNEMAT (Universidade do Estado de Mato Grosso), Câmpus de Sinop.

## Páginas

### Capa (`index.html`)
Vitrine curta: apresentação do projeto, faixa "Hoje no mercado" (Selic, CDI, IPCA 12 meses com o juro real, Ibovespa e dólar com a variação do dia, cada um levando ao painel completo), cartões de entrada para os painéis (Mercado, com o Ibovespa do dia; Radar de ações, com quantas ações caíram 15% ou mais da máxima; Estatais, com o lucro somado do último ano; Finanças públicas municipais), as ferramentas e a autoria. Os links antigos das seções que saíram da capa (`index.html#estatais`, `#dividendos`, `#investimentos`, `#acoes-estatais`, `#radar-acoes`, `#equacoes`, `#dados`) redirecionam para a nova página.

### Mercado (`mercado.html`)
Indicadores do dia (Selic, CDI, IPCA e trajetória esperada pelo Focus), Ibovespa e dólar, gráficos dos juros futuros lado a lado (DI1F27 e DI1F28, cada um podendo trocar para outros vencimentos de janeiro; hoje, semana e curva completa, com atualização automática) e painel de inclinação F28 − F27 com taxa a termo implícita e leitura automática do movimento do dia. Painel **Diesel e petróleo**: diesel S10 em Mato Grosso e no Brasil (ANP), Brent em R$/litro e, opcionalmente, o diesel nos EUA (EIA), com marcos de eventos e leitura automática. Painel **Criptomoedas**: Bitcoin, Ethereum, Solana e XRP com preço ao vivo (CoinGecko), gráfico de 1 mês a 1 ano em reais, comparação com o Ibovespa em base 100, volatilidade, maior queda, dominância do Bitcoin e índice de medo e ganância. Seção **Estatais federais**: receita e lucro de cada estatal de controle direto da União, de 2016 ao ano atual, com abas por grupo (bancos, petróleo e energia, portos e transportes, tecnologia e correios, indústria e defesa, saúde e abastecimento) e por empresa, gráfico ano a ano com seletor de lucro, receita ou margem líquida, total de lucros e de prejuízos, receita somada, lucro somado, lucros e prejuízos separados, botões para excluir a Petrobras e os bancos públicos (os dois juntos reproduzem o critério do Banco Central) e tabela de quanto cada estatal faturou e lucrou, filtrável por empresas com lucro ou com prejuízo e ordenável por lucro, receita ou margem. Seção **Dividendos**: quanto as estatais pagaram de dividendos e JCP à União desde 2020, comparado ao total pago a todos os acionistas, com gráfico ano a ano, maior pagadora, filtro por estatal e ranking com a fatia da União e o lucro do ano anterior. Seção **Investimentos**: quanto as estatais investiram desde 2016, aprovado × realizado com a taxa de execução, onde foi investido (por região), maiores investidoras, principais projetos e empresas de cada grupo, opção de excluir a Petrobras e ranking com a variação sobre o ano anterior. Seção **Ações das estatais**: cotação de fechamento, variação do dia, retorno em 12 meses (com proventos), dividend yield, P/L, P/VP e valor de mercado das estatais com ações na B3 (Petrobras PN e ON, Banco do Brasil, BB Seguridade, Caixa Seguridade, Banco do Nordeste, Banco da Amazônia e Telebras), com gráfico de cinco anos em base 100 comparado ao Ibovespa, a partir de `data/acoes.json` (`assets/acoes-estatais.js`). Seção **Radar de ações**: as ações da B3 que mais caíram desde a máxima de 52 semanas, com filtros por bancos (15, incluindo Nubank e Inter por BDR), estatais e demais, nota de 0 a 6 por critérios objetivos (P/L, P/VP, ROE, dividend yield, consenso de compra das corretoras e potencial até o preço-alvo médio), destaques, explicação da nota e dicas educativas (`assets/radar-acoes.js`); o consenso e o preço-alvo vêm do Yahoo Finance. É uma triagem educativa, não recomendação. Seção **O que dizem as corretoras** (`assets/corretoras.js`): consenso das recomendações (compra, neutro ou venda, na média de 1 a 5) e preço-alvo médio das corretoras que cobrem cada ação, com o potencial até o alvo, filtros por grupo, recomendação e número mínimo de analistas. Seção **Topos e alertas** (`assets/topos.js`): ações na máxima de 52 semanas ou até 5% abaixo dela, sobrecompradas pelo IFR de 14 dias (calculado em `scripts/atualizar_acoes.py`) e acima do preço-alvo; alertas pessoais guardados no navegador (preço acima ou abaixo de um valor, nova máxima, IFR acima de 70 ou preço-alvo atingido), conferidos a cada 15 minutos com a página aberta e com notificação do navegador; a capa avisa quando um alerta disparou. As seções de ações da página Mercado e a capa compartilham `assets/acoes-comum.js`.

### Estatais (`estatais.html`)
As seções Receita e lucro, Dividendos, Investimentos e Ações das estatais descritas na página Mercado acima ficam nesta página própria; o radar de ações fica na página Mercado.

### Metodologia (`metodologia.html`)
As equações que fazem as contas das ferramentas e as fontes públicas dos dados.

### Livro-Caixa (`livro-caixa.html`)
- Resumo do mês: receitas, despesas, resultado e taxa de poupança.
- **Reserva de emergência:** quantos meses de despesas você cobre e em quanto tempo completa 6 meses.
- Fluxo de caixa dos últimos 6 meses, orçamento por categoria e livro de lançamentos com exportação para CSV.
- Dados salvos no `localStorage` do navegador.

### Calculadoras (`calculadoras.html`)
34 calculadoras em 3 grupos (contas com resposta exata), abertas a partir de uma vitrine em cartões, como no Investidor Sardinha. Links como `calculadoras.html#clt-pj` abrem direto a calculadora.
- **Financeiras:** primeiro milhão com carteiras sugeridas, juros compostos, juros simples, poupança × Selic, rentabilidade (bruta, líquida e real), viver de renda, reserva de emergência, CDB, comparador de renda fixa, marcação a mercado, comparador de ações (dados em `data/acoes.json`, gerado por `scripts/atualizar_acoes.py`), preço-teto, número mágico, à vista ou parcelado, juros do Pix parcelado e simulador de amortização (SAC ou Price, TR ou IPCA, aportes extras para reduzir prazo ou parcela). Aposentadoria e aluguel × financiamento abrem os simuladores.
- **Trabalhistas:** CLT vs PJ, calculadora PJ (MEI, Simples III e V, Simples híbrido e Lucro Presumido, com cenário da reforma tributária de 2027 a 2033), produtor rural PF ou PJ (livro-caixa, Lucro Presumido e Lucro Real, com Funrural), salário líquido, custo de funcionário, férias, férias proporcionais, 13º, INSS, FGTS com saque-aniversário, horas extras, seguro-desemprego, isenção do IR 2026 e rescisão.
- **Utilitárias:** contador de dias, dias úteis com feriados nacionais, carro a combustão × elétrico, custos fixos (regra 50-30-20) e comparador de cartões de crédito.
- INSS e IR pelas tabelas de 2026, com o redutor da Lei 15.270/2025; CDI e IPCA projetados pelo Boletim Focus.

Todas as páginas usam o mesmo visual escuro com destaque verde-limão e a mesma barra de navegação; Livro-Caixa, Simuladores e Carteira carregam o tema compartilhado `assets/tema.css`.

Cada calculadora, cada simulador, o Livro-Caixa e a Carteira trazem abaixo dos resultados um **Como usar** (passo a passo), um **Entenda** (os conceitos por trás da conta) e **Perguntas frequentes**. Os textos ficam em `assets/guias.js`, compartilhado pelas duas páginas.

### Calculadoras e simuladores: qual é qual
- **Calculadora**: conta com regra fixa e resposta exata (tabelas de INSS e IR, CLT, datas, fórmulas). Fica em `calculadoras.html`.
- **Simulador**: projeção no tempo com premissas sobre o futuro (juros do Focus, inflação, cenários). Fica em `simuladores.html`.
- As ferramentas são definidas em dois motores compartilhados: `assets/calc-lib.js` (estilos em `assets/calc.css`, escopo `.calc-ui`) e `assets/sim-lib.js` (estilos em `assets/sim.css`, escopo `.sim-ui`). As duas páginas carregam os dois, então qualquer ferramenta pode aparecer em qualquer uma.
- `assets/ferramentas.js` define em que página cada ferramenta mora, os links “Veja também” e o redirecionamento de endereços antigos (por exemplo, `calculadoras.html#milhao` abre `simuladores.html#milhao`).

### Simuladores (`simuladores.html`)
23 simuladores em 4 grupos, abertos a partir de uma vitrine em cartões, com navegação em dois níveis (grupo e simulador). Além dos listados abaixo, ficam aqui primeiro milhão, viver de renda, amortização e carro a combustão × elétrico. Imposto de renda, câmbio, passagens e orçamento de viagem ficam nas Calculadoras:
- **Tesouro Direto:** comparar títulos, Tesouro Selic, IPCA+, Prefixado e Educa+ (faculdade dos filhos).
- **Investimentos:** CDB e LCI/LCA, ações, dividendos, fundos imobiliários e criptomoedas.
- **Aposentadoria e impostos:** ponto de inflexão (quando o rendimento mensal supera o aporte, quando os juros superam o total aportado e quando a renda do patrimônio cobre o padrão de vida), aposentadoria, previdência privada, PGBL ou VGBL e imposto de renda.
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

`data/combustiveis.json` também é gravado por essa rotina, via `scripts/atualizar_combustiveis.py`: diesel S10 semanal da ANP (Brasil e Mato Grosso, desde 2019), Brent (BZ=F) e dólar (BRL=X) pelo Yahoo Finance, e diesel no varejo dos EUA pela planilha pública da EIA. Os marcos de eventos do gráfico ficam na lista `MARCOS` do script da capa.

`data/cripto.json` (mesma rotina, `scripts/atualizar_cripto.py`) guarda 12 meses de fechamentos diários de BTC, ETH, SOL e XRP em reais (cotação em dólar do Yahoo Finance × BRL=X). O preço do momento, a dominância e o índice de medo e ganância são lidos ao vivo no navegador (CoinGecko e alternative.me).

`data/estatais.json` (mesma rotina, `scripts/atualizar_estatais.py`) traz a receita e o lucro (ou prejuízo) de cada estatal federal de controle direto da União, ano a ano desde 2016, a partir dos dados abertos da SEST/MGI (Siest): o cadastro das empresas (`sestidentificacao.zip`) e as demonstrações contábeis (`sestdadosfinanceiros.zip`). Até 2024 os dados são anuais; desde 2025 são trimestrais acumulados no ano, e o ano em andamento aparece como parcial. Lucro é o lucro líquido do exercício; receita é a receita bruta de vendas e serviços e, nos bancos, as receitas da intermediação financeira mais tarifas. Os nomes curtos e os grupos das abas ficam no dicionário `EMPRESAS` do script; a seção "Estatais federais" da capa (`assets/estatais.js`) lê esse arquivo. O mesmo arquivo traz, por empresa e ano, os dividendos e juros sobre capital próprio pagos à União e a todos os acionistas (demonstração dos fluxos de caixa; separação entre União e demais acionistas a partir de 2020), usados na seção "Dividendos" da capa.

`data/investimentos.json` (mesma rotina, `scripts/atualizar_investimentos.py`) traz o Orçamento de Investimento das estatais desde 2016 (`sestoi.zip`, SEST/MGI): valor aprovado (LOA mais créditos) e realizado por grupo — a estatal de controle direto com suas subsidiárias —, por região, por empresa do grupo e pelas ações (projetos) que mais receberam recursos. O realizado vem acumulado mês a mês, e o ano em andamento aparece como parcial. As subsidiárias são ligadas à controladora pelo cadastro da SEST; as que já saíram do cadastro (grupo Eletrobras, privatizado em 2022, e outras) ficam no dicionário `HISTORICO` do script. As logomarcas ficam em `assets/logos/` e foram baixadas uma única vez do Wikimedia Commons (propriedade "logo" do Wikidata) por `scripts/baixar_logos.py`, que grava a conferência em `assets/logos/relatorio.txt`; o coletor só marca no JSON as empresas que têm arquivo de logomarca, e as demais aparecem com a sigla. Para trocar ou acrescentar uma logomarca, salve `assets/logos/<sigla>.png` (minúsculas, sem acentos e espaços trocados por hífen).

### Juros futuros (DI1)
`di.json` fica no branch `dados` (fora da `main`, para não republicar o site a cada coleta). A GitHub Action `.github/workflows/di.yml` roda `scripts/atualizar_di.py` a cada 15 minutos nos dias úteis, das 9h às 18h45 (Brasília), e grava as cotações da B3 (cotacao.b3.com.br, atraso de ~15 min): taxa a cada 5 minutos dos últimos 7 pregões para os janeiros de 1, 2, 3, 5 e 7 anos à frente (em 2026: DI1F27, F28, F29, F31 e F33; a lista rola sozinha na virada do ano), fechamentos diários e a curva com todos os vencimentos. A capa lê o arquivo em `raw.githubusercontent.com/.../dados/di.json` e se recarrega a cada 5 minutos. Para coletar à mão: **Actions** → *Juros futuros (DI1)* → *Run workflow*.

`cotacoes.json` também fica no branch `dados`. A Action `.github/workflows/cotacoes.yml` roda `scripts/cotacoes_intradia.py` de hora em hora nos dias úteis, das 10h20 às 18h20 (Brasília), e grava o preço do momento (Yahoo Finance, atraso de ~15 min), o fechamento anterior e a data de todos os ativos do comparador. `assets/cotacoes.js` lê esse arquivo e, quando ele é mais novo que `data/acoes.json`, troca as cotações no comparador de ações e na seção Ações das estatais; depois do fechamento, a coleta diária volta a valer. Na mesma Action, `scripts/alertas_topo.py` publica no tópico público `livro-caixa-topos` do [ntfy](https://ntfy.sh) um aviso quando uma ação da B3 renova a máxima de 52 semanas ou chega ao preço-alvo médio das corretoras (3 ou mais analistas), uma vez por dia para cada ação e sinal, e grava os últimos avisos em `alertas.json` no branch `dados`, que a página Mercado mostra. Para receber, basta instalar o app ntfy e assinar o tópico; o nome do tópico pode ser trocado pela variável `NTFY_TOPICO`.

Para editar a lista de ações, altere `ACOES` em `scripts/atualizar_mercado.py` e `ATIVOS` em `carteira.html`.

## Visitas
Todas as páginas contam visitas pelo [GoatCounter](https://www.goatcounter.com) (sem cookies e sem dados pessoais), no painel `https://dashboardfinan.goatcounter.com`. Em Calculadoras e Simuladores, cada ferramenta (`#id`) conta como uma página. O rodapé da página inicial mostra o total de visitas (`/counter/TOTAL.json`) e as chegadas pelo Instagram: quem abre um link com `utm_source=instagram` é contado no caminho `/instagram` (`/counter/%2Finstagram.json`). Se o navegador bloquear o GoatCounter, o rodapé usa a cópia `visitas.json` que a Action `di.yml` grava no branch `dados`. Os contadores públicos exigem ativar *Allow adding visitor counts on your website* nas configurações do GoatCounter. Para saber quantas visitas vêm do Instagram, divulgue o link com a origem marcada, por exemplo `https://cleitonfranco74.github.io/dashboard_financeiro/?utm_source=instagram&utm_medium=bio`.

## Feedback
`assets/feedback.js` (o mesmo arquivo serve o Boi na Bolsa) coloca três coisas no site:

- **Caixa de opinião:** o botão **💬 Dê sua opinião**, em todas as páginas, abre uma caixa com nota de 1 a 5 estrelas, perfil de quem usa, comentário livre e, se a pessoa quiser resposta, o e-mail dela. Depois de enviar, o botão encolhe para só o ícone.
- **"Esta ferramenta foi útil? 👍 👎":** aparece no fim de cada simulador, calculadora e na carteira (elementos `<div data-fb-util="Nome">`). Quem marca 👎 pode dizer o que faltou. Cada ferramenta é avaliada uma vez por navegador.
- **Nota média:** o rodapé da capa mostra "★ 4,6 de 5 · N avaliações" a partir de 5 avaliações (elemento com `data-fb-media`).

As respostas vão para uma Planilha Google pelo script `scripts/feedback_planilha.gs`, que também avisa por e-mail a cada opinião da caixa ou 👎 com comentário. A planilha guarda data, site, página, ferramenta, nota, 👍/👎, perfil, comentário e e-mail. Para ligar a planilha:

1. Crie uma planilha vazia em [sheets.new](https://sheets.new) e abra **Extensões > Apps Script**.
2. Apague o conteúdo do editor, cole `scripts/feedback_planilha.gs` e salve.
3. **Implantar > Nova implantação**, tipo **App da Web**, *Executar como*: **Eu**, *Quem pode acessar*: **Qualquer pessoa**. Autorize e copie o URL que termina em `/exec`.
4. Coloque o URL na constante `PLANILHA` de `assets/feedback.js` aqui e de `feedback.js` no Boi na Bolsa.

Enquanto `PLANILHA` estiver vazia, a caixa envia por e-mail pelo [FormSubmit](https://formsubmit.co), e o 👍/👎 e a nota média ficam escondidos. Com a planilha ligada, o seu e-mail deixa de aparecer no código do site.

## Aviso
Ferramenta educacional. Estimativas não são recomendação de investimento. As regras tributárias refletem a legislação conhecida na data de criação.
