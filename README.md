# Dashboard Financeiro

Painel de finanças pessoais e simuladores financeiros em português, feitos em HTML, CSS e JavaScript puros. Não precisam de servidor nem de instalação.

## Páginas

### Livro-Caixa (`index.html`)
Painel de controle do orçamento pessoal:
- resumo do mês: receitas, despesas, resultado e taxa de poupança, com comparação ao mês anterior;
- fluxo de caixa dos últimos 6 meses;
- orçamento por categoria, com limites editáveis e alerta de estouro;
- livro de lançamentos com busca, filtros e exportação para CSV.

Os lançamentos ficam salvos no `localStorage` do navegador. Enquanto nada é registrado, a página mostra dados de exemplo.

### Simuladores (`simuladores.html`)
| Simulador | O que responde |
|---|---|
| Aposentadoria | Patrimônio projetado, capital necessário e aporte mensal para a renda desejada |
| Tesouro Direto | Tesouro Selic, Prefixado e IPCA+ contra a poupança, com IR regressivo e custódia da B3 |
| Quitar dívidas | Estratégias avalanche, bola de neve e só o mínimo: prazo e juros totais |
| Alugar ou financiar | Patrimônio de quem financia (SAC/Price) contra quem aluga e investe |
| Consórcio | Custo em valor presente contra financiamento e contra juntar investindo |
| CDB | Valor líquido e taxa equivalente de LCI/LCA, Tesouro Selic e poupança |
| Ações | 1.000 cenários de mercado com faixa de resultados e chance de vencer a renda fixa |
| PGBL ou VGBL | PGBL, VGBL e investir por fora, com dedução de 12% e tabela regressiva |

## Como usar
Abra `index.html` no navegador ou publique pelo GitHub Pages (Settings → Pages → branch `main`, pasta `/ (root)`).

## Aviso
As taxas padrão (Selic, CDI, IPCA etc.) são apenas exemplos e devem ser atualizadas. As regras tributárias refletem a legislação conhecida na data de criação. Os resultados são estimativas educacionais e não recomendação de investimento.
