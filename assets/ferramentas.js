/* Onde cada ferramenta mora (Calculadoras ou Simuladores), nomes, resumos e links "veja também".
 * Calculadora: conta com regra fixa e resposta exata. Simulador: projeção no tempo com premissas sobre o futuro.
 * Carregado depois de assets/calc-lib.js e assets/sim-lib.js. */
window.Ferramentas = (() => {
  const NOS_SIMULADORES = ["milhao","renda","amortizacao","veiculo-ev"];      // feitas no motor de calculadoras
  const NAS_CALCULADORAS = ["ir","cambio","voos","viagem"];                   // feitas no motor de simuladores
  const C = window.CalcLib, S = window.SimLib;
  const pagina = id => NOS_SIMULADORES.includes(id) ? "simuladores" : NAS_CALCULADORAS.includes(id) ? "calculadoras"
    : S?.tem(id) ? "simuladores" : C?.tem(id) ? "calculadoras" : null;
  const url = id => `${pagina(id)}.html#${id}`;
  const nome = id => C?.get(id)?.nav || S?.get(id)?.nav || id;
  const primeira = t => { t = String(t||"").replace(/<[^>]+>/g,""); const f = t.split(/(?<=\.)\s/)[0]; return f.length > 130 ? f.slice(0,127).replace(/\s+\S*$/,"") + "…" : f; };
  const resumo = id => primeira(C?.get(id)?.desc || S?.get(id)?.lede);
  const VEJA = {
    "cdb":["cdb-calc","comp-rf"], "cdb-calc":["cdb","comp-rf"], "comp-rf":["tesouro","cdb"], "tesouro":["comp-rf","poup-selic"],
    "selic":["poup-selic","reserva"], "poup-selic":["selic"], "ipca":["marcacao"], "prefixado":["marcacao"], "marcacao":["ipca","prefixado"],
    "renda":["aposentadoria","milhao"], "aposentadoria":["renda","milhao"], "milhao":["juros","aposentadoria"], "juros":["milhao","rentab"],
    "amortizacao":["imovel","veiculo"], "imovel":["amortizacao","alugar"], "veiculo":["amortizacao","veiculo-ev"], "veiculo-ev":["veiculo"],
    "ir":["salario","isencao"], "salario":["ir","isencao"], "isencao":["ir"], "previdencia":["ir"],
    "cambio":["viagem","voos"], "voos":["cambio","viagem"], "viagem":["cambio","voos"],
    "dividas":["pix","avista"], "reserva":["selic"], "magico":["fii"], "fii":["magico"], "teto":["dividendos"], "dividendos":["teto"],
    "comp-acoes":["acoes"], "acoes":["comp-acoes"],
  };
  const vejaHTML = id => (VEJA[id]||[]).filter(pagina).length ? `<div class="veja">Veja também: ${VEJA[id].filter(pagina).map(x=>`<a href="${url(x)}">${nome(x)} <small>${pagina(x)==="simuladores"?"simulador":"calculadora"}</small></a>`).join("")}</div>` : "";
  return {pagina, url, nome, resumo, vejaHTML, NOS_SIMULADORES, NAS_CALCULADORAS};
})();
