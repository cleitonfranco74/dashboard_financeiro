/* Radar de ações em queda, na página inicial, a partir de data/acoes.json (assets/cotacoes.js troca
 * as cotações durante o pregão). Filtra as ações da B3 que caíram e dá uma nota de 0 a 6 por
 * critérios objetivos de fundamentos e pelo consenso das corretoras publicado no Yahoo Finance.
 * É uma triagem educativa, não uma recomendação de investimento. */
(() => {
  const el = document.getElementById("radar");
  if (!el || !window.AcoesComum) return;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = (x, d) => x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (x, d = 0) => x == null || !isFinite(x) ? "—" : `${x > 0 ? "+" : x < 0 ? "−" : ""}${nf(Math.abs(x) * 100, d)}%`;
  const pctS = (x, d = 0) => x == null || !isFinite(x) ? "—" : `${nf(x * 100, d)}%`;
  const POS = "#34d399", NEG = "#ff6b6b";
  const { ETFS: FORA, consenso, corCons } = window.AcoesComum;
  /* critérios da nota: [rótulo curto, explicação, teste] */
  const CRIT = [
    ["P/L ≤ 12", "lucrativa e com preço baixo em relação ao lucro", a => a.pl > 0 && a.pl <= 12],
    ["P/VP ≤ 1,5", "preço perto do patrimônio", a => a.pvp > 0 && a.pvp <= 1.5],
    ["ROE ≥ 12%", "boa rentabilidade sobre o patrimônio", a => a.roe >= .12],
    ["DY ≥ 5%", "boa distribuição de proventos", a => a.dy >= .05],
    ["Consenso de compra", "média das corretoras em compra, com 3 ou mais analistas", a => a.rec != null && a.rec <= 2.5 && a.nanal >= 3],
    ["Potencial ≥ 20%", "preço-alvo médio 20% ou mais acima da cotação", a => a.alvo > 0 && a.alvo / a.preco - 1 >= .2],
  ];
  const st = { grupo: "todas", queda: "15", ordem: "nota" };
  let A, MAIS = false;

  const r12 = a => a.c && a.c.length > 12 && a.c[a.c.length - 13] > 0 ? a.c[a.c.length - 1] / a.c[a.c.length - 13] - 1 : null;
  const maxima = a => a.max52 > 0 ? Math.max(a.max52, a.preco) : a.c && a.c.length > 12 ? Math.max(...a.c.slice(-13)) * (a.preco / a.c[a.c.length - 1]) : null;
  function linhas(){
    return Object.entries(A).filter(([c, a]) => !FORA.includes(c) && a.preco > 0).map(([c, a]) => {
      const mx = maxima(a), q = mx ? a.preco / mx - 1 : null, crit = CRIT.map(k => !!k[2](a));
      return { c, a, q, r: r12(a), dia: a.ant ? a.preco / a.ant - 1 : null, pot: a.alvo > 0 ? a.alvo / a.preco - 1 : null, crit, nota: crit.filter(Boolean).length };
    });
  }
  const doGrupo = (x, g = st.grupo) => AcoesComum.doGrupo(x.c, g);
  const emQueda = x => st.queda === "0" || (x.q != null && x.q <= -st.queda / 100);
  const ORD = { nota: (x, y) => y.nota - x.nota || x.q - y.q, queda: (x, y) => x.q - y.q, potencial: (x, y) => (y.pot ?? -9) - (x.pot ?? -9), dy: (x, y) => (y.a.dy ?? -1) - (x.a.dy ?? -1) };

  function render(){
    const todas = linhas(), base = todas.filter(x => doGrupo(x)), rows = base.filter(emQueda).sort(ORD[st.ordem]);
    const dest = base.filter(x => x.q != null && x.q <= -.15).sort(ORD.nota).filter(x => x.nota >= 3).slice(0, 3);   // destaques: só as que caíram 15% ou mais
    const cont = Object.fromEntries(["todas", "bancos", "estatais", "demais"].map(g => [g, todas.filter(x => doGrupo(x, g)).length]));
    const chip = (k, n, v) => `<button type="button" data-${k}="${v}" aria-pressed="${st[k === "rg" ? "grupo" : "queda"] === v}">${n}</button>`;
    const mostrar = MAIS ? rows : rows.slice(0, 15);
    el.innerHTML = `
      <div class="est-ctl rd-ctl">
        <div class="seg" role="group" aria-label="Grupo">${chip("rg", `Todas (${cont.todas})`, "todas")}${chip("rg", `Bancos (${cont.bancos})`, "bancos")}${chip("rg", `Estatais (${cont.estatais})`, "estatais")}${chip("rg", `Demais (${cont.demais})`, "demais")}</div>
        <div class="seg" role="group" aria-label="Queda desde a máxima de 52 semanas">${chip("rq", "Caíram 15% ou mais", "15")}${chip("rq", "Caíram 30% ou mais", "30")}${chip("rq", "Todas", "0")}</div>
        <label class="f"><span>Ordenar por</span><select id="rdOrd">${[["nota", "Nota"], ["queda", "Maior queda"], ["potencial", "Potencial (preço-alvo)"], ["dy", "Dividend yield"]].map(([k, n]) => `<option value="${k}" ${st.ordem === k ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      </div>
      ${dest.length ? `<div class="est-gh"><h4>Melhores notas entre as que caíram 15% ou mais</h4></div>
      <div class="rd-dest">${dest.map(x => `<div class="rd-d">
        <div class="rd-dh"><b>${esc(x.c)}</b><span class="rd-nota" title="${x.nota} de 6 critérios">${x.nota}/6</span></div>
        <small>${esc(x.a.nome)}</small>
        <p><b class="num">R$ ${nf(x.a.preco, 2)}</b> <span class="num" style="color:${NEG}">${pct(x.q)} da máxima</span></p>
        <ul>${CRIT.map((k, i) => x.crit[i] ? `<li>${esc(k[0])}</li>` : "").join("")}</ul>
        <small>${x.a.rec != null ? `Consenso: <b style="color:${corCons(x.a.rec)}">${consenso(x.a.rec)}</b> (${x.a.nanal || "?"} analistas)${x.pot != null ? ` · alvo R$ ${nf(x.a.alvo, 2)} (${pct(x.pot)})` : ""}` : "Sem consenso de analistas publicado"}</small></div>`).join("")}</div>` : ""}
      <div class="est-th"><h4>${rows.length} ${rows.length === 1 ? "ação" : "ações"} ${st.queda === "0" ? "" : `que caíram ${st.queda}% ou mais desde a máxima de 52 semanas`}</h4><span>nota: quantos dos 6 critérios a ação cumpre</span></div>
      <div class="rd-wrap"><table class="rd-tb">
        <thead><tr><th>Ação</th><th>Preço</th><th>Dia</th><th>Da máxima</th><th>12 meses</th><th>P/L</th><th>P/VP</th><th>ROE</th><th>DY</th><th>Consenso</th><th>Potencial</th><th>Nota</th></tr></thead>
        <tbody>${mostrar.map(x => { const a = x.a;
          return `<tr><td><b>${esc(x.c)}</b><small>${esc(a.nome)}</small></td><td class="num">${nf(a.preco, 2)}</td>
          <td class="num" style="color:${x.dia == null ? "inherit" : x.dia >= 0 ? POS : NEG}">${pct(x.dia, 1)}</td>
          <td class="num" style="color:${NEG}">${pct(x.q)}</td><td class="num" style="color:${x.r == null ? "inherit" : x.r >= 0 ? POS : NEG}">${pct(x.r)}</td>
          <td class="num${x.crit[0] ? " ok" : ""}">${a.pl == null ? "—" : nf(a.pl, 1)}</td><td class="num${x.crit[1] ? " ok" : ""}">${a.pvp == null ? "—" : nf(a.pvp, 2)}</td>
          <td class="num${x.crit[2] ? " ok" : ""}">${pctS(a.roe)}</td><td class="num${x.crit[3] ? " ok" : ""}">${pctS(a.dy, 1)}</td>
          <td style="color:${corCons(a.rec)}">${a.rec == null ? "—" : `${consenso(a.rec)} <small>${a.nanal || "?"} anal.</small>`}</td>
          <td class="num${x.crit[5] ? " ok" : ""}">${pct(x.pot)}</td><td><span class="rd-nota n${x.nota}">${x.nota}</span></td></tr>`; }).join("") || `<tr><td colspan="12">Nenhuma ação neste filtro.</td></tr>`}</tbody></table></div>
      ${rows.length > 15 && !MAIS ? `<button type="button" class="est-mais" data-rmais>${rows.length - 15 === 1 ? "Mostrar a restante" : `Mostrar as ${rows.length - 15} restantes`}</button>` : ""}
      <div class="rd-crit"><h4>Como a nota é calculada</h4><ol>${CRIT.map(k => `<li><b>${esc(k[0])}</b>: ${esc(k[1])}.</li>`).join("")}</ol>
        <p>Nos bancos, o endividamento não entra porque a dívida faz parte do negócio; P/VP e ROE são os indicadores mais usados para avaliá-los. O consenso é a média das recomendações das corretoras que cobrem a ação, reunidas pelo Yahoo Finance (de 1, compra forte, a 5, venda forte), e o preço-alvo é a média das projeções para 12 meses.</p></div>
      <div class="rd-dicas"><h4>Dicas antes de investir</h4><ul>
        <li><b>Queda não é sinônimo de pechincha.</b> Descubra por que a ação caiu: lucro em queda, endividamento, interferência política ou um movimento do mercado inteiro. Uma ação que cai por piora nos resultados pode continuar caindo.</li>
        <li><b>Olhe os fundamentos, não só o preço.</b> P/L baixo com lucro em queda engana; ROE alto e estável e dívida controlada importam mais.</li>
        <li><b>Preço-alvo é estimativa, não promessa.</b> As projeções erram com frequência, e um consenso com poucos analistas vale menos.</li>
        <li><b>Dividend yield alto depois de uma queda</b> pode refletir proventos passados que não vão se repetir.</li>
        <li><b>Compre aos poucos e diversifique.</b> Entrar em várias datas suaviza o preço médio, e nenhuma ação deve pesar demais na carteira.</li>
        <li><b>Primeiro a reserva de emergência.</b> Ações são para dinheiro que pode ficar aplicado por anos; considere também custos e impostos.</li>
        <li>Use o <a href="calculadoras.html#comp-acoes">comparador de ações</a> para ver o histórico e a volatilidade de cada uma.</li></ul></div>
      <p class="est-fonte">Fonte: Yahoo Finance (cotações, indicadores e consenso de analistas)${A.__atualizado ? `, ${A.__intradia ? "cotações de" : "atualizado em"} ${esc(new Date(A.__atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }))}` : ""}. A máxima de 52 semanas é a maior cotação dos últimos 12 meses. <b>Esta triagem é educativa e usa critérios objetivos; não é recomendação de compra ou venda.</b> Recomendações individuais de investimento só podem ser feitas por analistas e consultores credenciados na CVM.</p>`;
  }

  el.addEventListener("click", e => {
    const b = e.target.closest("[data-rg],[data-rq],[data-rmais]"); if (!b) return;
    if (b.dataset.rg){ st.grupo = b.dataset.rg; MAIS = false; }
    if (b.dataset.rq){ st.queda = b.dataset.rq; MAIS = false; }
    if ("rmais" in b.dataset) MAIS = true;
    render();
  });
  el.addEventListener("change", e => { if (e.target.id === "rdOrd"){ st.ordem = e.target.value; render(); } });

  AcoesComum.carregar().then(d => {
    A = { ...d.acoes };
    Object.defineProperty(A, "__atualizado", { value: d.atualizado, enumerable: false });
    Object.defineProperty(A, "__intradia", { value: d.intradia, enumerable: false });
    render();
  }).catch(() => { el.innerHTML = `<p class="est-fonte">Não foi possível carregar as cotações agora. Tente recarregar a página.</p>`; });
})();
