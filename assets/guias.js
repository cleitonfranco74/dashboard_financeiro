/* Guias de uso e explicações das calculadoras e dos simuladores.
 * Cada entrada: usar (passo a passo), entenda ([título, html]) e faq ([pergunta, resposta]).
 * renderGuia(id) devolve o HTML da seção; cada página estiliza as classes .guia.
 */
window.GUIAS = {

/* ===================== Calculadoras: trabalho e salário ===================== */
"clt-pj": {
  usar: [
    "Na <b>Proposta CLT</b>, informe o salário bruto e os benefícios pagos em dinheiro, como vale-refeição, auxílios e PLR.",
    "Escolha se o FGTS entra como renda. Ele é seu, mas fica retido e só pode ser sacado em situações previstas em lei.",
    "Na <b>Proposta PJ</b>, informe quanto a empresa vai faturar por mês, o regime (Simples Anexo III, Anexo V ou MEI) e os custos: contador, plano de saúde e outros.",
    "Em <b>Meses faturados no ano</b>, use 11 se pretende tirar um mês de folga: PJ não tem férias remuneradas.",
    "Leia o veredito e o valor da <b>nota PJ que empata</b>. O gráfico mostra, para cada faturamento, quanto sobra no ano como PJ comparado ao total CLT."
  ],
  entenda: [
    ["O que entra na conta da CLT", "Além dos 12 salários, a CLT paga o 13º, as férias com um terço a mais e deposita 8% do salário no FGTS todo mês. Somando tudo, o pacote anual equivale a cerca de 13,3 salários brutos, antes de INSS e IR. Benefícios como vale-refeição aumentam esse valor."],
    ["Como o PJ é tributado", "No Simples Nacional, a empresa paga uma guia única (DAS) com alíquota que cresce com o faturamento. Serviços intelectuais ficam no <b>Anexo V</b> (a partir de 15,5%), mas caem para o <b>Anexo III</b> (a partir de 6%) quando a folha, incluindo o pró-labore do sócio, é de pelo menos 28% do faturamento: é o <b>fator R</b>. O pró-labore paga 11% de INSS e IR pela tabela; o restante sai como lucro, isento até R$ 50 mil por mês por empresa."],
    ["O que o número não mostra", "A CLT oferece proteções que não aparecem no salário: multa de 40% do FGTS na demissão, seguro-desemprego, licenças e estabilidade em alguns casos. O PJ ganha flexibilidade, mas precisa montar a própria reserva de emergência, a previdência e o plano de saúde. Por isso, muita gente só troca a CLT pelo PJ com uma diferença de 20% a 40% a favor do PJ."]
  ],
  faq: [
    ["Posso ser MEI prestando serviço como PJ?", "Só se a atividade estiver na lista do MEI e o faturamento for de até R$ 81 mil por ano. Profissões intelectuais e regulamentadas, como desenvolvedor, médico ou advogado, em geral não podem."],
    ["Por que o pró-labore de 28%?", "É o mínimo para atingir o fator R e pagar o Simples pelo Anexo III, que é bem mais barato que o Anexo V para a maioria das faixas."],
    ["O PJ se aposenta pelo INSS?", "Sim, contribuindo sobre o pró-labore. Como ele costuma ser menor que um salário CLT, o benefício futuro também tende a ser menor."]
  ]
},
"salario": {
  usar: [
    "Digite o <b>salário bruto</b> que aparece no contracheque.",
    "Informe o número de <b>dependentes</b> declarados à empresa e a pensão alimentícia, se houver.",
    "Em <b>Outros descontos</b>, some vale-transporte, plano de saúde e coparticipações.",
    "Confira o salário líquido e a linha do imposto de renda, que mostra a base de cálculo e o redutor de 2026."
  ],
  entenda: [
    ["INSS progressivo", "A contribuição ao INSS é calculada por faixas: 7,5% sobre a parte do salário até um salário mínimo, 9%, 12% e 14% nas faixas seguintes, até o teto. Por isso a alíquota efetiva é sempre menor que a da última faixa."],
    ["Imposto de renda em 2026", "Desde 2026, quem ganha até R$ 5.000 por mês não paga IR, graças a um redutor que zera o imposto da tabela. Entre R$ 5.000 e R$ 7.350, o desconto diminui aos poucos. A empresa usa o maior entre as deduções legais (INSS, dependentes, pensão) e o desconto simplificado de R$ 607,20."]
  ],
  faq: [
    ["Por que meu líquido é diferente do contracheque?", "Podem existir descontos que a calculadora não conhece, como faltas, adiantamentos, sindicato ou empréstimo consignado."],
    ["Vale-transporte desconta quanto?", "Até 6% do salário básico, limitado ao custo do transporte."]
  ]
},
"ferias": {
  usar: [
    "Informe o salário bruto e a média de horas extras, comissões e adicionais dos últimos 12 meses.",
    "Escolha se vai <b>vender 10 dias</b> (abono pecuniário) e se quer <b>adiantar a 1ª parcela do 13º</b>.",
    "Veja quanto recebe antes de sair de férias e o detalhamento dos descontos."
  ],
  entenda: [
    ["Como as férias são pagas", "A cada 12 meses trabalhados você tem direito a 30 dias de descanso, pagos até 2 dias antes do início com um terço a mais. O valor já desconta INSS e IR. No mês seguinte, o salário vem menor, porque os dias de férias foram pagos adiantados."],
    ["Vender férias compensa?", "O abono de 10 dias e o terço sobre ele são isentos de INSS e IR, o que torna a venda financeiramente vantajosa. O custo é descansar menos."]
  ],
  faq: [
    ["Posso dividir as férias?", "Sim, em até três períodos, se o empregado concordar: um de pelo menos 14 dias e os outros de pelo menos 5 dias cada."],
    ["Quando pedir o abono?", "Até 15 dias antes de completar o período aquisitivo de 12 meses."]
  ]
},
"decimo": {
  usar: [
    "Informe o salário bruto e a média de variáveis (horas extras, comissões).",
    "Indique os meses trabalhados no ano: conta o mês em que você trabalhou 15 dias ou mais.",
    "Veja o valor da 1ª parcela (sem descontos) e da 2ª (com INSS e IR)."
  ],
  entenda: [
    ["Duas parcelas", "A 1ª parcela, metade do 13º sem descontos, é paga até 30 de novembro ou junto com as férias. A 2ª, paga até 20 de dezembro, desconta o INSS e o IR sobre o valor total. Por isso ela costuma ser bem menor que a primeira."],
    ["Tributação exclusiva", "O IR do 13º é calculado separado do salário, sem se misturar com outras rendas na declaração anual."]
  ],
  faq: [
    ["Quem foi demitido recebe 13º?", "Sim, proporcional aos meses trabalhados, exceto na demissão por justa causa."]
  ]
},
"rescisao": {
  usar: [
    "Informe o último salário, a data de admissão e o último dia de trabalho.",
    "Escolha o <b>motivo da saída</b> e se o aviso prévio será indenizado ou trabalhado.",
    "Indique férias vencidas não tiradas e o saldo do FGTS (ou deixe 0 para estimar).",
    "Confira as verbas, os descontos e quanto do FGTS poderá ser sacado."
  ],
  entenda: [
    ["O que cada tipo de saída paga", "<table><thead><tr><th>Verba</th><th>Sem justa causa</th><th>Pedido</th><th>Acordo</th><th>Justa causa</th></tr></thead><tbody><tr><td>Saldo de salário</td><td>sim</td><td>sim</td><td>sim</td><td>sim</td></tr><tr><td>Aviso prévio indenizado</td><td>integral</td><td>não</td><td>metade</td><td>não</td></tr><tr><td>13º e férias proporcionais</td><td>sim</td><td>sim</td><td>sim</td><td>não</td></tr><tr><td>Férias vencidas + 1/3</td><td>sim</td><td>sim</td><td>sim</td><td>sim</td></tr><tr><td>Multa do FGTS</td><td>40%</td><td>não</td><td>20%</td><td>não</td></tr><tr><td>Saque do FGTS</td><td>100%</td><td>não</td><td>80%</td><td>não</td></tr><tr><td>Seguro-desemprego</td><td>sim</td><td>não</td><td>não</td><td>não</td></tr></tbody></table>"],
    ["Aviso prévio proporcional", "São 30 dias mais 3 dias por ano completo de empresa, até 90 dias. Quando indenizado, esse período conta como tempo de serviço e pode render mais um avo de 13º e de férias."]
  ],
  faq: [
    ["Qual o prazo para receber?", "Até 10 dias corridos após o fim do contrato."],
    ["A rescisão paga imposto?", "O saldo de salário e o 13º pagam INSS e IR. Aviso prévio indenizado, férias indenizadas e a multa do FGTS são isentos."]
  ]
},

/* ===================== Calculadoras: investimentos ===================== */
"milhao": {
  usar: [
    "Escolha o <b>tipo de cálculo</b>: o prazo para chegar à meta, o aporte mensal necessário ou a taxa necessária.",
    "Preencha a meta, o valor inicial e os campos que aparecem: valor mensal, prazo e taxa (anual ou mensal).",
    "Veja o resultado, o gráfico e a tabela ano a ano, com a linha da meta em destaque.",
    "Role até <b>Carteiras sugeridas</b> para ver três formas de investir, a chance de cada uma atingir a meta no prazo e o aporte que cada uma exige."
  ],
  entenda: [
    ["Por que os juros compostos importam", "No começo, quase todo o patrimônio vem do que você aporta. Com o tempo, os juros passam a render sobre os juros e viram o motor principal: em prazos longos, a maior parte do primeiro milhão vem dos rendimentos, não dos aportes."],
    ["Como as carteiras são montadas", "Quanto mais longe a meta, mais espaço para ações, que oscilam no curto prazo mas tendem a render mais no longo. Perto da data, a carteira migra para renda fixa, porque não há tempo para recuperar uma queda. Quando o juro real está alto, a renda fixa já paga bem com pouco risco, e as carteiras usam mais dela."],
    ["O milhão de daqui a 20 anos", "A inflação corrói o valor do dinheiro. A calculadora mostra quanto a meta vale em reais de hoje: se quiser o poder de compra de um milhão atual, aumente a meta."]
  ],
  faq: [
    ["Qual taxa usar?", "Use uma taxa líquida de IR e realista para a sua carteira. As carteiras sugeridas mostram a rentabilidade esperada de cada perfil para o seu prazo."],
    ["O que é a chance de atingir a meta?", "É a proporção de 800 cenários simulados, com oscilações baseadas nos últimos 10 anos, em que a carteira chega à meta no prazo."]
  ]
},
"juros": {
  usar: [
    "Informe o valor inicial, o aporte mensal e a taxa de juros (ao ano ou ao mês). O padrão é o CDI de hoje.",
    "Escolha o prazo em anos ou meses.",
    "Veja o valor final, quanto foi aportado e quanto veio dos juros, no gráfico e na tabela."
  ],
  entenda: [
    ["Juros sobre juros", "Nos juros compostos, cada mês rende sobre o saldo acumulado, incluindo os rendimentos anteriores. A fórmula é VF = VP × (1 + i)ⁿ, somada à série de aportes. A diferença para os juros simples cresce muito com o tempo."],
    ["Taxa anual e mensal", "1% ao mês não é 12% ao ano: é (1,01)¹² − 1 = 12,68%. A calculadora converte as taxas pela equivalência composta."]
  ],
  faq: [
    ["O resultado desconta imposto?", "Não. Para ver o valor líquido, use os simuladores de CDB ou de Tesouro na aba Simuladores, ou informe uma taxa já líquida."]
  ]
},
"reserva": {
  usar: [
    "Informe seu custo de vida mensal (o que você gasta, não o que ganha).",
    "Escolha sua situação: servidor, CLT ou autônomo, PJ e empresário.",
    "Diga quanto já tem guardado, quanto pode guardar por mês e o rendimento líquido.",
    "Veja o tamanho ideal da reserva e em quantos meses você chega lá."
  ],
  entenda: [
    ["Para que serve", "A reserva cobre imprevistos, como perda de renda, saúde ou conserto, sem precisar se endividar ou vender investimentos em hora ruim. Ela vem antes de qualquer outro investimento."],
    ["Onde guardar", "Em aplicações de baixo risco e liquidez diária: Tesouro Selic, CDB de liquidez diária de banco sólido ou fundo DI de taxa baixa. Rentabilidade é secundária; o importante é poder sacar no mesmo dia sem perda."]
  ],
  faq: [
    ["Poupança serve?", "Serve, mas costuma render menos que o Tesouro Selic e o CDB a 100% do CDI."]
  ]
},
"renda": {
  usar: [
    "Informe a renda mensal desejada em valores de hoje.",
    "Escolha a rentabilidade real (acima da inflação) que espera obter.",
    "Informe o patrimônio atual e o aporte mensal para ver em quanto tempo atinge a meta."
  ],
  entenda: [
    ["Viver de renda sem consumir o patrimônio", "Se o patrimônio rende 5% acima da inflação, você pode retirar esses 5% por ano sem reduzir o poder de compra. Para R$ 10 mil por mês, são R$ 120 mil por ano ÷ 5% = R$ 2,4 milhões."],
    ["Regra dos 4%", "Estudos americanos mostram que retirar 4% do patrimônio inicial por ano, corrigido pela inflação, sustentou carteiras por pelo menos 30 anos na maioria dos cenários históricos. É uma referência conservadora: 25 vezes a despesa anual."]
  ],
  faq: [
    ["Qual rentabilidade real é razoável?", "O Tesouro IPCA+ longo paga perto de 7% acima da inflação hoje, mas historicamente 4% a 5% é uma hipótese prudente para o longo prazo."]
  ]
},
"teto": {
  usar: [
    "Informe a cotação atual da ação.",
    "Para <b>Bazin</b>, informe os dividendos médios por ação e o dividend yield mínimo que você aceita (6% na regra original).",
    "Para <b>Graham</b>, informe o lucro por ação (LPA) e o valor patrimonial por ação (VPA), encontrados nos sites de análise.",
    "Compare a cotação com cada preço-teto e veja a margem de segurança."
  ],
  entenda: [
    ["Método Bazin", "Décio Bazin propunha comprar apenas ações que pagassem pelo menos 6% ao ano em dividendos. O preço-teto é o dividendo anual dividido por 6%. Funciona melhor em empresas maduras e pagadoras estáveis."],
    ["Fórmula de Graham", "Benjamin Graham aceitava pagar até 15 vezes o lucro e 1,5 vez o patrimônio, cujo produto é 22,5. O preço justo é √(22,5 × LPA × VPA). Não se aplica a empresas com prejuízo ou de crescimento acelerado."]
  ],
  faq: [
    ["Preço abaixo do teto significa comprar?", "Não necessariamente. É um filtro inicial: a empresa pode estar barata por um bom motivo. Analise endividamento, setor e perspectivas."]
  ]
},
"magico": {
  usar: [
    "Informe o preço da cota e o rendimento mensal por cota do fundo imobiliário.",
    "Diga quantas cotas já tem e quanto pode aportar por mês.",
    "Veja o número mágico e em quanto tempo chega lá reinvestindo os rendimentos."
  ],
  entenda: [
    ["O que é o número mágico", "É a quantidade de cotas cujos rendimentos de um mês compram uma cota nova sozinhos. A partir daí, a carteira cresce mesmo sem aportes. Ele é o preço da cota dividido pelo rendimento mensal."]
  ],
  faq: [
    ["Rendimento de FII paga IR?", "Os rendimentos mensais são isentos para pessoa física quando o fundo tem cotas negociadas em bolsa e cumpre os requisitos da lei; o ganho na venda das cotas paga 20%."]
  ]
},

/* ===================== Calculadoras: crédito ===================== */
"amortizacao": {
  usar: [
    "<b>Escolha a modalidade</b> (opcional): imobiliário, veículos, consignado ou pessoal. Os campos são preenchidos com valores típicos, que você pode ajustar.",
    "<b>Informe o valor do empréstimo</b>. Se o contrato já está em andamento, use o saldo devedor atual: quem financiou R$ 300 mil e hoje deve R$ 220 mil deve simular com R$ 220 mil e as parcelas que faltam.",
    "Escolha o <b>mês da primeira parcela</b> e o <b>sistema de amortização</b>: SAC (parcelas decrescentes) ou Price (parcelas fixas).",
    "Informe a <b>taxa de juros</b> e se ela é anual ou mensal, como aparece no contrato.",
    "Digite a <b>quantidade de parcelas</b> (ou as que faltam pagar).",
    "Escolha a <b>correção monetária</b>: TR é comum em financiamento imobiliário; IPCA aparece em alguns contratos; empréstimos pessoais e de veículos em geral não têm.",
    "Em <b>Amortização extra</b>, clique em “Adicionar aporte” e preencha o valor, a parcela em que começa, até qual parcela, a cada quantos meses e se é recorrente. Exemplo: R$ 5.000 a cada 12 meses a partir da parcela 12.",
    "Escolha o efeito dos aportes: <b>reduzir prazo</b> ou <b>reduzir parcela</b>.",
    "Veja a economia de juros, a nova data de quitação, os gráficos do saldo devedor e da composição das parcelas, a comparação SAC × Price e a tabela parcela a parcela."
  ],
  entenda: [
    ["O que é amortização", "Amortizar é abater o valor principal da dívida. Cada parcela tem duas partes: os <b>juros</b>, que remuneram quem emprestou, e a <b>amortização</b>, que reduz o que você ainda deve. Só a amortização diminui a dívida; os juros são o custo de ter o dinheiro emprestado."],
    ["Saldo devedor", "É o principal que ainda falta pagar. Os juros de cada mês são calculados sobre ele, então qualquer real a menos no saldo devedor reduz todos os juros futuros. É diferente da soma das parcelas que faltam, que inclui os juros que ainda vão correr. Contratos com correção monetária (TR ou IPCA) aumentam o saldo devedor todo mês antes de calcular os juros."],
    ["Amortização extra", "É um pagamento além da parcela, usado inteiro para abater o saldo devedor. Como não carrega juros, ele “rende” exatamente a taxa da dívida: amortizar um financiamento de 12% ao ano equivale a uma aplicação sem risco que paga 12% ao ano, livre de IR. Pelo Código de Defesa do Consumidor, você tem direito a antecipar o pagamento com redução proporcional dos juros."],
    ["Reduzir prazo ou reduzir parcela", "<p>As duas opções diminuem a dívida, mas de jeitos diferentes:</p><ul><li><b>Reduzir prazo</b> mantém a parcela e antecipa a quitação. Como os juros correm por menos tempo, é a opção que mais economiza.</li><li><b>Reduzir parcela</b> mantém o prazo e recalcula a prestação para baixo. Economiza menos juros, mas alivia o orçamento todo mês.</li></ul><table><thead><tr><th>Seu objetivo</th><th>Melhor opção</th></tr></thead><tbody><tr><td>Pagar menos juros no total</td><td>Reduzir prazo</td></tr><tr><td>Quitar a dívida mais cedo</td><td>Reduzir prazo</td></tr><tr><td>Diminuir a prestação mensal</td><td>Reduzir parcela</td></tr><tr><td>Folga no orçamento ou renda instável</td><td>Reduzir parcela</td></tr><tr><td>Comprometer menos da renda</td><td>Reduzir parcela</td></tr></tbody></table><p>Uma estratégia comum é reduzir o prazo e, se a parcela apertar no futuro, usar o próximo aporte para reduzir a parcela.</p>"],
    ["Tabela SAC e Tabela Price", "<p>No <b>SAC</b> (Sistema de Amortização Constante), a amortização é igual todo mês: o saldo cai em linha reta, os juros diminuem e a parcela começa alta e vai caindo. Na <b>Price</b> (sistema francês), a parcela é fixa: no início ela é quase só juros e a amortização cresce aos poucos.</p><table><thead><tr><th></th><th>SAC</th><th>Price</th></tr></thead><tbody><tr><td>Parcela</td><td>Começa maior e diminui</td><td>Constante (sem correção)</td></tr><tr><td>Amortização</td><td>Constante</td><td>Crescente</td></tr><tr><td>Saldo devedor</td><td>Cai mais rápido</td><td>Cai devagar no início</td></tr><tr><td>Total de juros</td><td>Menor</td><td>Maior</td></tr><tr><td>Indicado para</td><td>Quem aguenta parcelas iniciais maiores</td><td>Quem precisa de parcela previsível e menor no início</td></tr></tbody></table><p>A tabela “SAC ou Price?” do simulador mostra a diferença de juros no seu caso.</p>"],
    ["Quando amortizar vale a pena", "<p>Compare o custo da dívida com o que seu dinheiro rende. Se o financiamento custa mais do que um investimento seguro rende depois do IR, amortizar é o melhor “investimento” disponível. O simulador faz essa comparação com o CDI de hoje.</p><p>Amortizar costuma valer a pena quando você já tem reserva de emergência, a taxa da dívida é alta, recebeu uma renda extra (13º, bônus, PLR, restituição) ou tem dinheiro parado sem objetivo.</p><p>Tenha cautela quando ainda não há reserva de emergência, a renda é instável, você pode precisar do dinheiro em breve ou existem dívidas mais caras: quite primeiro as mais caras, como cartão de crédito e cheque especial.</p>"],
    ["Como amortizar na prática", "<ol><li>Peça ao banco o saldo devedor atualizado.</li><li>Solicite a simulação oficial reduzindo prazo e reduzindo parcela.</li><li>Confira tarifas e regras do contrato.</li><li>Pague pelo boleto ou débito indicado pelo banco.</li><li>Confirme no extrato que o saldo, o prazo ou a parcela foram atualizados.</li></ol>"],
    ["FGTS no financiamento imobiliário", "No Sistema Financeiro da Habitação, o FGTS pode abater o saldo devedor, pagar parte das prestações ou quitar o contrato, respeitando regras como intervalo mínimo de dois anos entre usos, imóvel residencial urbano e não ter outro imóvel na mesma cidade. Confira as condições com o banco."],
    ["Amortizar não é o mesmo que antecipar parcelas", "Antecipar a última parcela, com desconto dos juros, equivale a amortizar e reduzir o prazo. Já pagar a próxima parcela adiantada, sem desconto, não economiza juros. Antes de pagar, pergunte ao banco se o valor vai abater o saldo devedor e como os juros serão recalculados."]
  ],
  faq: [
    ["O que significa amortizar uma dívida?", "Pagar parte do valor principal que ainda está em aberto, o saldo devedor."],
    ["O banco pode cobrar para eu amortizar?", "Não pode cobrar multa por liquidação antecipada em contratos com pessoas físicas, e os juros futuros devem ser reduzidos proporcionalmente."],
    ["É melhor reduzir prazo ou parcela?", "Para pagar menos juros, reduzir prazo. Para aliviar o orçamento mensal, reduzir parcela."],
    ["Amortizar ou investir?", "Se a dívida custa mais que o rendimento líquido de um investimento seguro, amortize. Se custa menos, como alguns financiamentos imobiliários subsidiados, investir a diferença pode render mais."],
    ["Por que meu saldo devedor quase não cai no início?", "Na Price, as primeiras parcelas são quase só juros; com correção pela TR ou IPCA, a correção ainda soma ao saldo. Os aportes extras aceleram muito a queda."]
  ]
},

/* ===================== Calculadoras: comparadores ===================== */
"comp-rf": {
  usar: [
    "Em <b>Qual é o tipo de investimento?</b>, escolha o primeiro título (CDB, LCI, Tesouro, debênture...) e, em <b>Você quer comparar com</b>, o segundo.",
    "Para cada um, indique como a rentabilidade está expressa: pré-fixado (% ao ano), % do CDI ou taxa fixada + IPCA.",
    "Digite as taxas oferecidas e o prazo em meses de cada aplicação.",
    "Informe o valor investido e veja qual rende mais, a taxa que empata e o CDB equivalente."
  ],
  entenda: [
    ["Pré, pós e inflação", "No <b>pré-fixado</b>, você sabe a taxa desde o início. No <b>pós-fixado</b>, ganha um percentual do CDI, que acompanha a Selic. No <b>IPCA+</b>, recebe a inflação mais uma taxa fixa, protegendo o poder de compra. A calculadora projeta o CDI e o IPCA mês a mês pelo Boletim Focus."],
    ["Imposto faz diferença", "CDB, LC, Tesouro e debêntures comuns pagam IR regressivo: 22,5% até 6 meses, 20% até 1 ano, 17,5% até 2 anos e 15% depois. LCI, LCA, CRI, CRA e debêntures incentivadas são isentas. Por isso, 92% do CDI isento pode render mais que 110% do CDI tributado."],
    ["Garantias", "CDB, LCI, LCA, LC e poupança têm o FGC, que cobre até R$ 250 mil por CPF e por instituição. Tesouro Direto tem garantia do Tesouro Nacional. CRI, CRA e debêntures não têm FGC: o risco é da empresa emissora."]
  ],
  faq: [
    ["O que é o CDB equivalente?", "É a taxa, em % do CDI, que um CDB tributado precisaria pagar no mesmo prazo para deixar o mesmo valor líquido."],
    ["E se eu precisar resgatar antes?", "Títulos sem liquidez diária podem não permitir; IPCA+ e prefixados vendidos antes do vencimento seguem o preço de mercado, que pode ser menor."]
  ]
},
"comp-acoes": {
  usar: [
    "Escolha a categoria: Ações (B3), Stocks (EUA), FIIs ou ETFs internacionais.",
    "Busque pelo código ou pelo nome, como “itau” ou “BBAS3”, e clique para incluir. São até 5 ativos.",
    "Remova um ativo pelo ×.",
    "Compare o gráfico de desempenho e a tabela: o melhor valor de cada linha aparece em destaque."
  ],
  entenda: [
    ["Indicadores de preço", "<b>P/L</b> é quantos anos de lucro atual pagariam o preço da ação; <b>P/VP</b> compara o preço com o patrimônio da empresa. Valores baixos podem indicar ação barata, mas também desconfiança do mercado. Compare empresas do mesmo setor."],
    ["Rentabilidade e risco", "<b>Dividend yield</b> é quanto a ação pagou em proventos nos últimos 12 meses em relação ao preço. <b>ROE</b> mede o lucro sobre o patrimônio, a eficiência da empresa. <b>Volatilidade</b> e <b>maior queda</b> mostram quanto o preço oscilou: o retorno passado veio acompanhado desse risco."]
  ],
  faq: [
    ["Os retornos incluem dividendos?", "Sim. O gráfico usa cotações ajustadas por proventos, como se eles fossem reinvestidos."],
    ["Stocks estão em reais?", "Não, em dólar. Para o investidor brasileiro, a variação do câmbio soma ou subtrai do resultado."]
  ]
},

/* ===================== Simuladores ===================== */
"aposentadoria": {
  usar: ["Informe sua idade, com que idade quer se aposentar e até que idade planejar a renda.", "Diga quanto já tem investido e quanto aporta por mês.", "Informe a renda desejada e o INSS estimado, em valores de hoje.", "Ajuste a rentabilidade real antes e depois da aposentadoria e veja se o plano cobre a renda ou quanto precisa aportar."],
  entenda: [["Por que valores de hoje", "Usar retornos reais (acima da inflação) mantém todos os números no poder de compra atual: R$ 8 mil de renda significam o que R$ 8 mil compram hoje, sem precisar estimar a inflação de décadas."], ["Duas fases", "Na acumulação, aportes e juros fazem o patrimônio crescer. Na aposentadoria, você retira a renda desejada menos o INSS e o patrimônio é consumido até a idade planejada."]],
  faq: [["Qual rentabilidade real usar?", "Algo entre 3% e 5% ao ano é prudente para carteiras diversificadas no longo prazo."]]
},
"tesouro": {
  usar: ["Informe o investimento inicial, o aporte mensal e o prazo.", "Os campos de mercado vêm preenchidos com Selic, IPCA e taxas do Tesouro de hoje; você pode alterá-los.", "Compare quanto Selic, Prefixado, IPCA+ e poupança deixam no fim, já sem IR e custódia."],
  entenda: [["Qual título escolher", "O <b>Tesouro Selic</b> acompanha os juros e é o mais estável, ideal para a reserva. O <b>Prefixado</b> trava uma taxa e ganha se os juros caírem. O <b>IPCA+</b> garante ganho acima da inflação e protege o poder de compra no longo prazo. Levados até o vencimento, todos pagam o combinado."]],
  faq: [["E a poupança?", "Rende 0,5% ao mês mais TR quando a Selic está acima de 8,5%, sem IR, mas costuma perder para o Tesouro Selic."]]
},
"selic": {
  usar: ["Informe o valor inicial, o aporte mensal e o prazo.", "Defina um objetivo, se quiser saber quando chega lá.", "Veja a projeção mês a mês com a Selic esperada pelo Focus, a comparação com a poupança e com o investido corrigido pela inflação."],
  entenda: [["Por que é o título da reserva", "O Tesouro Selic rende a taxa básica de juros, tem liquidez diária e quase não oscila de preço. É o investimento mais seguro do país."]],
  faq: [["Paga custódia?", "A B3 cobra 0,20% ao ano; consulte a regra vigente de isenção para valores menores no Tesouro Selic."]]
},
"ipca": {
  usar: ["Informe o valor, o aporte e o prazo até o vencimento.", "Se pensa em vender antes, indique quando e quanto a taxa de mercado pode variar até lá.", "Compare o ganho garantido no vencimento com o resultado da venda antecipada."],
  entenda: [["Marcação a mercado", "O preço do IPCA+ sobe quando os juros caem e cai quando os juros sobem. Quem leva até o vencimento recebe a taxa contratada; quem vende antes recebe o preço do dia, que pode dar ganho ou perda."]],
  faq: [["Para que serve?", "Objetivos de longo prazo com data definida, como aposentadoria, em que proteger o poder de compra é essencial."]]
},
"prefixado": {
  usar: ["Informe o valor, o aporte e o prazo.", "Compare a taxa do Prefixado com o IPCA+ do mesmo prazo.", "Veja o ganho real conforme a inflação e o resultado de vender antes."],
  entenda: [["Inflação implícita", "A diferença entre o Prefixado e o IPCA+ mostra a inflação que o mercado espera. Se a inflação vier acima dela, o IPCA+ ganha; abaixo, o Prefixado ganha."]],
  faq: [["Quando o Prefixado é bom negócio?", "Quando você acredita que os juros e a inflação vão cair mais do que o mercado espera."]]
},
"educa": {
  usar: ["Informe a idade do filho, com que idade entra na faculdade e quanto já tem guardado.", "Escolha o curso e a mensalidade de hoje, e se inclui moradia.", "Veja o aporte mensal necessário no Tesouro Educa+."],
  entenda: [["Como o Educa+ funciona", "Você acumula até a data escolhida e o título paga 60 parcelas mensais corrigidas pela inflação, como uma renda para custear os estudos."]],
  faq: [["E se o filho não fizer faculdade?", "O dinheiro continua seu e pode ser usado para outro objetivo; a renda mensal é paga a quem for o titular."]]
},
"dividas": {
  usar: ["Liste cada dívida com o saldo, os juros ao mês e a parcela mínima.", "Informe quanto consegue pagar por mês no total.", "Compare as estratégias avalanche e bola de neve: prazo para quitar e juros pagos."],
  entenda: [["Avalanche × bola de neve", "A <b>avalanche</b> paga primeiro a dívida de juros mais altos e economiza mais. A <b>bola de neve</b> quita primeiro a menor, gerando vitórias rápidas que ajudam a manter a disciplina."], ["Antes de tudo", "Cartão de crédito rotativo e cheque especial estão entre os juros mais altos do mercado: troque-os por um crédito mais barato, como consignado, se possível."]],
  faq: [["Vale renegociar?", "Sim. Bancos e programas de renegociação costumam oferecer descontos grandes para pagamento à vista ou parcelado."]]
},
"alugar": {
  usar: ["Informe o valor do imóvel, a entrada, os juros e o prazo do financiamento.", "Informe o aluguel equivalente, o reajuste e a valorização esperada.", "Defina quanto rende o dinheiro investido e em quantos anos comparar."],
  entenda: [["A comparação justa", "Os dois gastam o mesmo por mês: quem aluga investe a entrada e a diferença entre a parcela e o aluguel. No fim, compara-se o imóvel quitado (menos a dívida) com a carteira de quem alugou."]],
  faq: [["Comprar é sempre melhor?", "Não. Com juros altos e aluguel barato em relação ao preço do imóvel, alugar e investir costuma deixar mais patrimônio."]]
},
"consorcio": {
  usar: ["Informe o valor da carta, o prazo, a taxa de administração e o fundo de reserva.", "Indique quando espera ser contemplado e se dará lance.", "Compare com financiamento e com juntar o dinheiro investindo."],
  entenda: [["Consórcio não tem juros, mas tem custos", "A taxa de administração e o reajuste da carta encarecem o consórcio, e não há data certa para receber o bem. Comparado em valor presente, ele pode sair mais caro do que parece."]],
  faq: [["Para quem serve?", "Para quem não tem pressa e quer disciplina para poupar; quem precisa do bem já costuma preferir o financiamento."]]
},
"veiculo": {
  usar: ["Informe o preço do carro, a entrada, o prazo e a taxa.", "Inclua tarifas, seguro prestamista e a renda da família.", "Veja a parcela, o CET, o custo mensal de ter o carro e a alternativa de juntar e comprar à vista."],
  entenda: [["CET", "O Custo Efetivo Total soma juros, IOF, tarifas e seguros: é a taxa que realmente importa ao comparar financiamentos."], ["Depreciação", "O carro perde valor enquanto você paga juros: nos primeiros anos, a dívida pode ser maior que o valor do carro."]],
  faq: [["Quanto da renda pode ir para a parcela?", "O ideal é não passar de 30% da renda, somando todas as dívidas."]]
},
"imovel": {
  usar: ["Informe o valor do imóvel, a entrada, o FGTS e o prazo.", "Escolha SAC ou Price e ajuste juros, TR, seguros MIP e DFI e taxa de administração.", "Inclua amortizações extras anuais e escolha reduzir prazo ou parcela."],
  entenda: [["Custos além dos juros", "O financiamento imobiliário tem seguros obrigatórios (morte e invalidez e danos ao imóvel), taxa de administração e correção pela TR. O CET mostra o custo real."], ["SAC ou Price", "O SAC tem parcelas iniciais maiores e paga menos juros; a Price começa com parcelas menores. Veja também o simulador de amortização na aba Calculadoras."]],
  faq: [["Qual renda o banco exige?", "Em geral, a primeira parcela não pode passar de 30% da renda bruta familiar."]]
},
"cdb": {
  usar: ["Informe o valor, o aporte e o prazo.", "Escolha o tipo de remuneração: pós-fixado, prefixado ou IPCA+.", "Digite as taxas oferecidas para o CDB e para a LCI/LCA e veja qual rende mais e a taxa de empate."],
  entenda: [["Isenção da LCI e da LCA", "Por serem isentas de IR, LCI e LCA podem pagar menos que o CDB e ainda render mais líquido, principalmente em prazos curtos, quando o IR do CDB é maior."]],
  faq: [["O FGC cobre tudo?", "Até R$ 250 mil por CPF por instituição, com teto global de R$ 1 milhão a cada 4 anos."]]
},
"acoes": {
  usar: ["Escolha o tipo de ativo, o investimento inicial, o aporte e o prazo.", "Escolha como gerar os cenários: trechos reais da história ou suas premissas.", "Veja a faixa de resultados possíveis e compare com a renda fixa."],
  entenda: [["Por que 1.000 cenários", "Ações não têm um resultado único. Simular muitos caminhos mostra o resultado provável, o pessimista e o otimista, e a chance de ficar abaixo da renda fixa."]],
  faq: [["Ações pagam IR?", "15% sobre o lucro na venda; vendas de até R$ 20 mil por mês em ações são isentas para pessoa física."]]
},
"dividendos": {
  usar: ["Informe o investimento, o aporte, o prazo e a renda mensal desejada.", "Escolha a ação ou carteira, os proventos por ação e a parte paga como JCP.", "Veja a renda em proventos, o preço justo e o imposto de cada tipo de provento."],
  entenda: [["Dividendos e JCP", "Dividendos são isentos até o limite da lei; JCP sofre 15% de IR na fonte. Reinvestir os proventos acelera o crescimento da renda."]],
  faq: [["O que é yield on cost?", "É o dividendo recebido dividido pelo preço que você pagou, mostrando como a renda cresce sobre o capital investido."]]
},
"fii": {
  usar: ["Informe o investimento, o aporte, o prazo e a renda desejada.", "Escolha o fundo, o preço da cota e o rendimento mensal.", "Veja a renda projetada, o número mágico e a comparação com o Tesouro IPCA+."],
  entenda: [["Renda mensal isenta", "Fundos imobiliários distribuem a maior parte do resultado todo mês, isento de IR para pessoa física nas condições da lei. A cota varia com o mercado."]],
  faq: [["FII é renda fixa?", "Não. É renda variável: o rendimento e a cota podem cair."]]
},
"cripto": {
  usar: ["Escolha a criptomoeda, onde investe, o valor, o aporte e o prazo.", "Informe o resto do seu patrimônio para ver o peso da cripto.", "Veja a faixa de resultados nos 1.000 cenários e a chance de perda."],
  entenda: [["Volatilidade extrema", "Criptomoedas já caíram mais de 70% várias vezes. Por isso, a maioria dos especialistas sugere no máximo uma pequena parte do patrimônio."]],
  faq: [["Cripto paga IR?", "Ganhos com criptoativos são tributados; consulte a regra vigente para corretoras no Brasil e no exterior."]]
},
"previdencia": {
  usar: ["Informe sua renda bruta tributável, a contribuição e o prazo.", "Escolha o tipo de declaração e sua alíquota de IR.", "Compare PGBL, VGBL e investir por fora."],
  entenda: [["PGBL ou VGBL", "O <b>PGBL</b> deduz até 12% da renda bruta na declaração completa, mas no resgate o IR incide sobre o total. O <b>VGBL</b> não deduz, e o IR incide só sobre o rendimento. Quem usa a declaração simplificada ou é isento costuma preferir o VGBL."]],
  faq: [["Qual tabela de IR escolher?", "A regressiva cai até 10% após 10 anos e é boa para longo prazo; a progressiva pode ser melhor para quem terá renda baixa na aposentadoria."]]
},
"prevprivada": {
  usar: ["Informe idade, quando começa a receber e por quanto tempo.", "Informe o saldo, a contribuição, o tipo de plano e a tabela de IR.", "Ajuste taxas de administração e carregamento e compare com um plano de baixo custo."],
  entenda: [["O peso das taxas", "Uma diferença de 1% ao ano na taxa de administração pode reduzir a renda final em 20% ou mais em prazos longos. Prefira planos sem carregamento e com taxa baixa."]],
  faq: [["Posso trocar de plano?", "Sim, pela portabilidade, sem pagar IR, mantendo a data de início para a tabela regressiva."]]
},
"ir": {
  usar: ["Informe o salário, os dependentes, a previdência e a pensão paga.", "Para a declaração anual, inclua outras rendas, despesas médicas, de educação e PGBL.", "Veja o IR retido, a alíquota efetiva e qual declaração compensa."],
  entenda: [["Completa ou simplificada", "A simplificada dá um desconto padrão; a completa usa as deduções reais (saúde sem limite, educação com limite, dependentes, previdência). Compensa a que resultar em menos imposto."]],
  faq: [["O que mudou em 2026?", "Quem ganha até R$ 5.000 por mês ficou isento pelo redutor, que diminui gradualmente até R$ 7.350."]]
},
"cambio": {
  usar: ["Escolha a moeda e quanto vai gastar na viagem.", "Ajuste spreads e IOF de cartão de crédito, pré-pago, conta global e espécie.", "Informe em quantos meses viaja para ver o risco do câmbio e o rendimento até lá."],
  entenda: [["Custo real", "O custo total é a cotação comercial mais o spread da instituição mais o IOF. Contas globais costumam ter o menor spread."]],
  faq: [["Vale comprar aos poucos?", "Comprar parcelado ao longo dos meses dilui o risco de pegar o câmbio no pico."]]
},
"voos": {
  usar: ["Informe origem, destino, datas, classe e passageiros.", "Use os links para pesquisar nos buscadores já preenchidos.", "Compare pagar em dinheiro ou com milhas usando o valor do milheiro."],
  entenda: [["Quando usar milhas", "Divida o preço em dinheiro (menos as taxas da emissão) pelas milhas exigidas e compare com o valor do milheiro: se cada mil milhas “valem” mais do que você pagaria por elas, use as milhas."]],
  faq: [["Qual a melhor antecedência?", "Em geral, 1 a 3 meses para voos nacionais e 2 a 6 meses para internacionais."]]
},
"viagem": {
  usar: ["Escolha o destino ou informe seus próprios valores.", "Defina pessoas, dias e o cenário: econômico, médio ou luxo.", "Inclua passagem, seguro e reserva, e veja quanto guardar por mês até a viagem."],
  entenda: [["Planejar evita dívida", "Juntar o dinheiro antes da viagem rende juros a seu favor; parcelar no cartão sem juros só compensa se não houver desconto à vista."]],
  faq: [["Seguro-viagem é obrigatório?", "Para países do Espaço Schengen, sim, com cobertura mínima de 30 mil euros."]]
}
};

/* ===================== Calculadoras novas ===================== */
Object.assign(window.GUIAS, {
"pj": {
  usar: ["Informe quanto sua empresa vai faturar por mês.", "Informe o custo do contador e o ISS do seu município, usado no Lucro Presumido.", "Compare o líquido de cada regime e veja o detalhamento de impostos, pró-labore e lucro distribuído."],
  entenda: [["Os regimes para quem presta serviço", "<ul><li><b>MEI</b>: imposto fixo mensal, mas só para atividades permitidas e até R$ 81 mil por ano.</li><li><b>Simples Nacional</b>: guia única com alíquota que cresce com o faturamento. Serviços intelectuais pagam pelo Anexo V, ou pelo Anexo III se a folha (incluindo o pró-labore) for de pelo menos 28% do faturamento.</li><li><b>Lucro Presumido</b>: o imposto incide sobre um lucro presumido de 32% para serviços, mais PIS, Cofins e ISS. Costuma valer a pena em faturamentos mais altos.</li></ul>"], ["Pró-labore e lucro", "O pró-labore é o salário do sócio e paga INSS e IR. O restante pode ser distribuído como lucro, isento até R$ 50 mil por mês por empresa desde 2026."]],
  faq: [["Qual regime escolher?", "O que deixar mais dinheiro com segurança. Confirme com um contador, que também avalia a atividade (CNAE) e as regras do município."],
    ["A calculadora considera a reforma tributária?", "Ainda não. Ela usa as regras de 2026, em que a CBS e o IBS são apenas um teste de 1% compensado com o PIS/Cofins (e dispensado no Simples). A partir de 2027 a CBS substitui o PIS/Cofins; de 2029 a 2033 o IBS substitui o ISS e o ICMS. As alíquotas de referência ainda serão fixadas; profissões intelectuais regulamentadas terão redução de 30%."]]
},
"rural": {
  usar: ["Informe a receita bruta anual da produção e as despesas de custeio e investimentos.", "Informe a folha de pagamento e escolha se o Funrural incide sobre a receita ou sobre a folha.", "Para a pessoa jurídica, informe o PIS/Cofins efetivo dos seus produtos, o pró-labore e o custo extra de contabilidade.", "Inclua outras rendas e dependentes da pessoa física.", "Compare o que sobra como pessoa física, no Lucro Presumido e no Lucro Real, e veja no gráfico a partir de que receita a PJ passa a compensar."],
  entenda: [["Produtor pessoa física", "Apura o resultado da atividade rural pelo livro-caixa (LCDPR): receitas menos despesas efetivamente pagas no ano, incluindo investimentos como máquinas e benfeitorias. O resultado entra na declaração anual pela tabela progressiva, até 27,5%. Se for vantajoso, pode tributar 20% da receita bruta em vez do resultado, e prejuízos são compensados nos anos seguintes."], ["Produtor pessoa jurídica", "No Lucro Presumido, o IRPJ incide sobre 8% da receita e a CSLL sobre 12%, uma carga baixa quando a margem é alta. No Lucro Real, os tributos incidem sobre o lucro efetivo, melhor para margens apertadas ou anos de prejuízo. O lucro chega ao sócio como dividendo, isento até R$ 50 mil por mês, e o pró-labore paga INSS e IR."], ["Funrural", "Contribuição previdenciária sobre a receita da comercialização: 1,5% na pessoa física e 2,05% na jurídica, com o Senar. Substitui o INSS patronal sobre os empregados. Desde 2019 é possível optar, ano a ano, por contribuir sobre a folha, o que compensa quando a folha é pequena."], ["Quando a PJ compensa", "Em geral, quando o resultado é grande e a margem alta: a pessoa física paga até 27,5% sobre o lucro, enquanto o Presumido rural fica perto de 3% a 4% da receita. Mas a PJ tem custos de contabilidade, PIS/Cofins conforme o produto e efeitos sobre sucessão, crédito rural e ITR."]],
  faq: [["E a reforma tributária?", "A partir de 2027, a CBS e o IBS entram no lugar do PIS/Cofins, do ICMS e do ISS. O produtor pessoa física com receita anual abaixo de R$ 3,6 milhões pode optar por não ser contribuinte, e seus compradores recebem crédito presumido; insumos e produtos agropecuários têm alíquotas reduzidas. A calculadora ainda não modela essas regras."], ["Posso mudar de PF para PJ a qualquer momento?", "Pode, mas a transferência de terras e bens para a empresa tem custos (ITBI, cartório, eventual ganho de capital) e precisa de planejamento, muitas vezes junto com uma holding familiar."]]
},
"custo-clt": {
  usar: ["Informe o salário bruto do funcionário.", "Escolha o regime tributário da empresa: no Simples o INSS patronal já está no DAS.", "Inclua vale-refeição, vale-transporte e plano de saúde.", "Veja o custo mensal, anual e quantas vezes o salário ele representa."],
  entenda: [["Por que o custo é maior que o salário", "Além do salário, a empresa provisiona 13º e férias com um terço, deposita 8% de FGTS e, fora do Simples, paga cerca de 28% de INSS patronal, RAT e terceiros. Benefícios somam ao custo. No Simples, um funcionário costuma custar de 1,5 a 1,8 vez o salário; no Lucro Presumido ou Real, de 1,8 a 2,2 vezes."]],
  faq: [["O vale-transporte é custo da empresa?", "Em parte: a empresa pode descontar até 6% do salário do funcionário e paga o restante."]]
},
"ferias-prop": {
  usar: ["Informe o salário e as médias de variáveis.", "Informe o início do período aquisitivo (a data de admissão ou o último aniversário dela) e a data do cálculo.", "Informe as faltas injustificadas no período.", "Veja os avos, os dias e o valor com o terço."],
  entenda: [["Avos de férias", "Cada mês trabalhado no período aquisitivo vale 1/12 das férias; a fração de 15 dias ou mais conta como mês inteiro."], ["Faltas reduzem as férias", "Até 5 faltas injustificadas mantêm os 30 dias; de 6 a 14, 24 dias; de 15 a 23, 18 dias; de 24 a 32, 12 dias; acima de 32, o empregado perde o direito naquele período."]],
  faq: [["Quem pede demissão recebe férias proporcionais?", "Sim, com o terço. Só quem é demitido por justa causa perde as proporcionais."]]
},
"inss": {
  usar: ["Escolha o tipo de segurado.", "Informe o salário ou a remuneração, se for empregado ou autônomo.", "Veja a contribuição, a alíquota efetiva e, para empregados, o cálculo faixa por faixa."],
  entenda: [["Alíquota progressiva", "Desde 2020, cada parte do salário paga a alíquota da sua faixa: 7,5%, 9%, 12% e 14%. Por isso quem ganha R$ 5 mil paga cerca de 10%, e não 14% sobre tudo."], ["Autônomos e MEI", "O contribuinte individual paga 20% sobre o que ganha, até o teto. Há planos reduzidos de 11% e 5% do salário mínimo, que não dão direito à aposentadoria por tempo de contribuição."]],
  faq: [["Qual o teto do INSS?", "É o maior salário de contribuição e de benefício. Acima dele, não há desconto adicional."]]
},
"fgts": {
  usar: ["Informe o salário e o saldo atual do FGTS (veja no aplicativo FGTS).", "Escolha por quantos anos projetar, o reajuste salarial e o rendimento do fundo.", "Veja o saldo futuro, o valor do saque-aniversário e a multa de 40%."],
  entenda: [["Como o FGTS rende", "A empresa deposita 8% do salário todo mês, inclusive sobre o 13º e o terço de férias. O saldo rende 3% ao ano mais a TR e recebe parte do lucro do fundo quando há distribuição."], ["Saque-aniversário ou saque-rescisão", "No saque-aniversário você retira uma parte do saldo todo ano, no mês do aniversário, mas se for demitido só recebe a multa de 40%, não o saldo. No saque-rescisão (padrão), o saldo fica guardado e pode ser sacado na demissão sem justa causa."]],
  faq: [["Posso usar o FGTS para comprar imóvel?", "Sim, na compra da casa própria, na amortização e na quitação do financiamento, respeitando as regras do SFH."]]
},
"horas": {
  usar: ["Informe o salário e a jornada mensal (220 horas para 44 horas semanais).", "Informe as horas extras a 50% e a 100% e as horas noturnas.", "Informe os dias úteis e os domingos e feriados do mês para calcular o DSR."],
  entenda: [["Valor da hora extra", "A hora extra vale no mínimo 50% a mais que a hora normal (salário ÷ jornada). Domingos e feriados trabalhados sem folga compensatória são pagos em dobro."], ["DSR", "As horas extras habituais também aumentam o descanso semanal remunerado: o valor das extras é dividido pelos dias úteis e multiplicado pelos domingos e feriados do mês."]],
  faq: [["Qual o limite de horas extras?", "Em regra, até 2 horas por dia, salvo acordo de compensação ou situações excepcionais previstas em lei."]]
},
"seguro": {
  usar: ["Informe os três últimos salários antes da demissão.", "Informe os meses trabalhados e se é a 1ª, 2ª ou 3ª solicitação.", "Veja o valor e o número de parcelas."],
  entenda: [["Quem tem direito", "Quem foi demitido sem justa causa e não tem outra renda própria suficiente. É preciso ter trabalhado 12 meses nos últimos 18 na 1ª solicitação, 9 meses nos últimos 12 na 2ª e 6 meses antes da dispensa a partir da 3ª."], ["Prazo para pedir", "De 7 a 120 dias após a demissão, pela carteira de trabalho digital, pelo portal gov.br ou numa unidade do Sine."]],
  faq: [["Posso trabalhar recebendo o seguro?", "Não com carteira assinada: o benefício é suspenso ao conseguir novo emprego formal."]]
},
"isencao": {
  usar: ["Informe o salário bruto e os dependentes.", "Compare o IR retido em 2025 e em 2026 e a economia no ano.", "O gráfico mostra o imposto para salários de R$ 2 mil a R$ 10 mil."],
  entenda: [["O que mudou em 2026", "A Lei 15.270/2025 manteve a tabela do IR, mas criou um redutor: quem ganha até R$ 5.000 por mês fica isento, e o desconto diminui até sumir em R$ 7.350. Para compensar, rendas muito altas passaram a ter um imposto mínimo e dividendos acima de R$ 50 mil por mês são tributados na fonte."]],
  faq: [["Preciso declarar mesmo isento?", "Depende das outras regras de obrigatoriedade da declaração anual, como rendimentos totais, bens e operações em bolsa."]]
},
"juros-simples": {
  usar: ["Informe o capital, a taxa e se ela é mensal ou anual.", "Informe o prazo em meses.", "Compare os juros simples com os compostos no gráfico."],
  entenda: [["Simples × compostos", "Nos juros simples, a taxa incide sempre sobre o capital inicial: J = C × i × n. Nos compostos, incide sobre o saldo acumulado. No curto prazo a diferença é pequena; no longo prazo, enorme."]],
  faq: [["Onde se usam juros simples?", "Em juros de mora de contas atrasadas e em alguns cálculos de curto prazo."]]
},
"poup-selic": {
  usar: ["Informe o valor e o prazo.", "Informe quanto o CDB paga em % do CDI.", "Compare o valor líquido da poupança, do Tesouro Selic e do CDB."],
  entenda: [["Por que a poupança perde", "Com a Selic acima de 8,5%, a poupança rende 0,5% ao mês mais TR, cerca de 6,2% ao ano mais TR, bem abaixo do CDI. Mesmo pagando IR, o Tesouro Selic e um CDB a 100% do CDI rendem mais."]],
  faq: [["A poupança tem alguma vantagem?", "É isenta de IR, simples e tem liquidez, mas só rende no aniversário mensal do depósito."]]
},
"rentab": {
  usar: ["Informe o valor inicial, o aporte mensal e o prazo.", "Escolha a forma da rentabilidade e a taxa.", "Escolha se há IR regressivo ou se é isento.", "Veja o valor bruto, o líquido e em reais de hoje."],
  entenda: [["Nominal, líquido e real", "O valor nominal é o que aparece no extrato. O líquido desconta o IR. O real desconta também a inflação, mostrando o que o dinheiro compra. Investir só vale a pena de verdade se o rendimento real for positivo."]],
  faq: [["Qual inflação é usada?", "A projeção mês a mês do Boletim Focus."]]
},
"cdb-calc": {
  usar: ["Informe o valor investido.", "Informe a rentabilidade em % do CDI e o prazo.", "Veja o valor líquido, o IR e a LCI equivalente."],
  entenda: [["Como um CDB pós-fixado rende", "Um CDB a 110% do CDI rende 1,1 vez o CDI de cada dia. O IR regressivo incide só no resgate, de 22,5% a 15% conforme o prazo. Para comparar com uma LCI isenta, veja a taxa equivalente."]],
  faq: [["CDB tem garantia?", "Sim, do FGC, até R$ 250 mil por CPF e por instituição."]]
},
"marcacao": {
  usar: ["Escolha o título: Prefixado ou IPCA+.", "Informe o valor, a taxa na compra, o prazo do título e quanto tempo já passou.", "Informe a taxa de mercado de hoje (no site do Tesouro Direto).", "Veja quanto o título vale hoje e o ganho ou perda em relação à curva."],
  entenda: [["Por que o preço muda", "O título paga um valor definido no vencimento. Se os juros de mercado sobem, esse valor futuro vale menos hoje, e o preço cai; se os juros caem, o preço sobe. Quem leva até o vencimento recebe a taxa contratada, sem efeito da marcação."], ["Duration", "Quanto mais tempo falta para o vencimento, maior o efeito de uma mudança de taxa no preço. Títulos longos oscilam muito mais."]],
  faq: [["Dá para lucrar com a marcação?", "Sim, vendendo antes quando os juros caem. Mas é uma aposta: se os juros subirem, a venda dá prejuízo."]]
},
"avista": {
  usar: ["Informe o preço, o desconto à vista e o número de parcelas.", "Se o parcelamento tiver juros, informe a taxa mensal.", "Informe quanto o seu dinheiro rende e veja qual opção compensa."],
  entenda: [["Valor presente", "Pagar parcelado permite deixar o dinheiro rendendo até cada vencimento. Trazendo as parcelas para hoje, descontadas pelo rendimento, dá para comparar com o preço à vista. O desconto mínimo que compensa pagar à vista aparece no resultado."]],
  faq: [["Sem juros é sempre melhor parcelar?", "Não. Se o desconto à vista for maior que o rendimento do dinheiro no período, pagar à vista ganha."]]
},
"pix": {
  usar: ["Escolha se você sabe o valor da parcela ou a taxa de juros.", "Informe o valor do Pix e o número de parcelas.", "Veja a taxa mensal e anual, o total pago e a tabela de pagamento."],
  entenda: [["O que é o Pix parcelado", "O banco paga o recebedor na hora e você devolve em parcelas com juros e IOF. É uma operação de crédito como outra qualquer, e a taxa embutida pode ser alta."]],
  faq: [["Como saber se a taxa é boa?", "Compare com o cartão sem juros, o crédito pessoal e o consignado. Acima de 5% ao mês, é crédito caro."]]
},
"dias": {
  usar: ["Escolha a data inicial e a data final.", "Veja os dias corridos, as semanas e a diferença em anos, meses e dias.", "Para descobrir uma data futura, informe quantos dias somar."],
  entenda: [["Contando prazos", "Na maioria dos prazos, exclui-se o dia do início e inclui-se o do fim. Para contar as duas datas, some um dia."]],
  faq: [["E prazos em dias úteis?", "Use o contador de dias úteis, que desconta fins de semana e feriados nacionais."]]
},
"dias-uteis": {
  usar: ["Escolha a data inicial e a data final.", "Escolha se o Carnaval conta como feriado (os bancos não abrem).", "Veja os dias úteis e a lista de feriados no período."],
  entenda: [["Feriados nacionais", "Confraternização Universal, Carnaval (ponto facultativo), Sexta-feira Santa, Tiradentes, Dia do Trabalho, Corpus Christi, Independência, Nossa Senhora Aparecida, Finados, Proclamação da República, Consciência Negra e Natal. Feriados estaduais e municipais não entram."]],
  faq: [["Por que contar dias úteis?", "Prazos bancários, de boletos, de liquidação de investimentos (D+1, D+2) e muitos prazos legais são contados em dias úteis."]]
},
"veiculo-ev": {
  usar: ["Informe a quilometragem anual, o prazo da comparação e o rendimento do dinheiro.", "Preencha os dados do carro a combustão e do elétrico: preço, consumo, energia, manutenção, seguro, IPVA e desvalorização.", "Compare o custo total e o custo por quilômetro."],
  entenda: [["O custo total de ter um carro", "Além da energia, contam o seguro, o IPVA, a manutenção, a desvalorização e o rendimento que o dinheiro do carro deixaria de ganhar. O elétrico gasta muito menos por quilômetro, mas custa mais caro: quem roda muito tende a compensar a diferença mais rápido."]],
  faq: [["Elétrico paga IPVA?", "Depende do estado: alguns isentam, outros reduzem a alíquota."]]
},
"custos": {
  usar: ["Informe sua renda líquida mensal.", "Preencha os gastos fixos de cada categoria.", "Veja quanto da renda está comprometido e onde está o maior peso."],
  entenda: [["Regra 50-30-20", "Uma referência simples: até 50% da renda para necessidades, 30% para desejos e 20% para investir ou quitar dívidas. Custos fixos acima de 60% da renda deixam pouca margem para imprevistos."]],
  faq: [["Como reduzir os custos fixos?", "Comece pelos maiores: moradia, transporte e planos. Renegocie contratos, troque de plano e revise assinaturas."]]
},
"cartoes": {
  usar: ["Informe quanto gasta por mês no cartão, a cotação do dólar e o valor do milheiro.", "Preencha anuidade, isenção, pontos por dólar e cashback de até três cartões.", "Veja qual deixa mais benefício líquido por ano."],
  entenda: [["Pontos × cashback", "Pontos são convertidos pelo dólar e valem conforme o uso: passagens em promoção valorizam mais. Cashback é dinheiro de volta, simples e previsível. Anuidade só compensa se os benefícios forem maiores que ela."]],
  faq: [["Vale gastar mais para isentar a anuidade?", "Não: gastar mais só para ganhar pontos ou isenção quase sempre custa mais do que o benefício."]]
}
});

window.renderGuia = (id, titulo) => {
  const g = window.GUIAS[id];
  if (!g) return "";
  const usar = `<div class="guia-col"><h2>Como usar${titulo ? ` ${titulo}` : ""}</h2><ol class="passos">${g.usar.map(p=>`<li><span>${p}</span></li>`).join("")}</ol></div>`;
  const faq = g.faq?.length ? `<div class="guia-col"><h2>Perguntas frequentes</h2>${g.faq.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div>` : "";
  const ent = g.entenda?.length ? `<div class="guia-col"><h2>Entenda</h2>${g.entenda.map(([h,t])=>`<h3>${h}</h3>${/^\s*</.test(t) ? t : `<p>${t}</p>`}`).join("")}</div>` : "";
  return `<section class="guia" aria-label="Como usar e entenda"><div class="guia-lado">${usar}${faq}</div>${ent}</section>`;
};
