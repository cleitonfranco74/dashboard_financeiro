/* Cotações durante o pregão: lê o arquivo gravado de hora em hora pela Action cotacoes.yml no
 * branch "dados" e, quando ele é mais novo que data/acoes.json, troca o preço, o fechamento
 * anterior e a data de cada ativo. O último fechamento mensal (c) acompanha a variação do preço,
 * para os retornos e gráficos usarem a cotação do momento. Usado pelo comparador de ações
 * (assets/calc-lib.js) e pela seção Ações das estatais da capa (assets/acoes-estatais.js). */
window.Cotacoes = (() => {
  const RAW = "https://raw.githubusercontent.com/cleitonfranco74/dashboard_financeiro/dados/cotacoes.json";
  const mes = (ini, n) => { const [y, m] = ini.split("-").map(Number), t = y * 12 + m - 2 + n; return `${Math.floor(t / 12)}-${String(t % 12 + 1).padStart(2, "0")}`; };
  async function aplicar(d){
    if (!d || !d.categorias) return d;
    let q;
    try {
      const r = await fetch(`${RAW}?t=${Math.floor(Date.now() / 6e5)}`, { cache: "no-store" });
      if (!r.ok) return d;
      q = await r.json();
    } catch { return d; }
    if (!q || !q.ativos || !q.atualizado || (d.atualizado && new Date(q.atualizado) <= new Date(d.atualizado))) return d;
    let n = 0;
    for (const [cat, lista] of Object.entries(q.ativos)){
      for (const [cod, [preco, ant, data]] of Object.entries(lista)){
        const a = d.categorias[cat]?.[cod];
        if (!a || !(preco > 0) || (a.data && data < a.data)) continue;
        if (a.c?.length && a.preco > 0 && a.ini){
          const f = preco / a.preco, ult = a.c[a.c.length - 1];
          if (data.slice(0, 7) > mes(a.ini, a.c.length)) a.c.push(ult * f);   // virou o mês desde a última coleta diária
          else a.c[a.c.length - 1] = ult * f;
        }
        Object.assign(a, { preco, ant: ant ?? a.ant, data });
        n++;
      }
    }
    if (n){ d.atualizado = q.atualizado; d.intradia = true; }
    return d;
  }
  return { aplicar };
})();
