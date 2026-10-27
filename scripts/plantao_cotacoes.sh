#!/usr/bin/env bash
# Plantão das cotações: roda dentro da Action cotacoes.yml por até PLANTAO_MIN minutos. Durante o pregão
# (dias úteis, das 13h15 às 21h30 UTC), atualiza as cotações e os alertas de topo a cada hora, no minuto 20;
# fora dele, só espera. No fim, a Action dispara a execução seguinte, de modo que o plantão não depende do
# agendamento do GitHub, que neste repositório descarta a maior parte das execuções programadas.
set -uo pipefail

PLANTAO_MIN=${PLANTAO_MIN:-340}
DADOS=${DADOS:-../dados}
fim=$(( $(date +%s) + PLANTAO_MIN * 60 ))

no_pregao() {   # dia útil e horário de pregão (UTC)
  local dia hm
  dia=$(date -u +%u); hm=$(date -u +%H%M)
  [ "$dia" -le 5 ] && [ "$hm" -ge 1315 ] && [ "$hm" -le 2130 ]
}

atualiza() {
  echo "::group::Atualização $(date -u +%H:%MZ)"
  # o data/acoes.json da main muda na coleta diária; os alertas usam sempre a versão mais nova
  git fetch -q origin main && git checkout -q origin/main -- data/acoes.json || true
  python scripts/cotacoes_intradia.py "$DADOS/cotacoes.json" || echo "cotações: falha"
  python scripts/alertas_topo.py data/acoes.json "$DADOS/cotacoes.json" "$DADOS/alertas.json" || echo "alertas: falha"
  (
    cd "$DADOS" || exit 0
    git add cotacoes.json
    [ -f alertas.json ] && git add alertas.json
    if git diff --cached --quiet; then echo "Sem mudanças."; exit 0; fi
    git commit -q -m "Cotações $(date -u +%Y-%m-%dT%H:%MZ)"
    # o di.yml também grava neste branch: tenta de novo se ele empurrou antes
    for i in 1 2 3; do git pull -q --rebase origin dados && git push -q origin dados && exit 0; sleep 5; done
    echo "push: falha"
  )
  echo "::endgroup::"
}

no_pregao && atualiza   # ao começar, atualiza logo se o pregão está aberto
while :; do
  agora=$(date +%s)
  # próxima marca: minuto 20 da hora seguinte
  prox=$(( (agora / 3600 + 1) * 3600 + 20 * 60 ))
  [ $(( prox - 3600 )) -gt "$agora" ] && prox=$(( prox - 3600 ))
  [ "$prox" -ge "$fim" ] && break
  sleep $(( prox - agora ))
  no_pregao && atualiza
done
echo "Plantão encerrado às $(date -u +%H:%MZ); a próxima execução assume."
