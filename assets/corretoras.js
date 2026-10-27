/* O que dizem as corretoras: consenso das recomendações e preço-alvo médio das ações da B3, a partir de
 * data/acoes.json (média das corretoras que cobrem cada ação, reunida pelo Yahoo Finance). Usa assets/acoes-comum.js. */
(() => {
  const el = document.getElementById("corr");
  if (!el || !window.AcoesComum) return;
  const C = window.AcoesComum;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = (x, d) => x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = x => x == null || !isFinite(x) ? "—" : `${x > 0 ? "+" : x < 0 ? "−" : ""}${nf(Math.abs(x) * 100, 0)}%`;
  const st = { grupo: "todas", so: "compra", ordem: "potencial", min: 3, todas: false };
  let D;

  /* régua de 1 (compra forte) a 5 (venda forte) com a posição da média */
  const regua = r => `<span class="cr-rg" title="média ${nf(r, 2)} (1 = compra forte, 5 = venda forte)"><i style="left:${(r - 1) / 4 * 100}%;background:${C.corCons(r)}"></i></span>`;
  const ORD = { potencial: (a, b) => b.pot - a.pot, consenso: (a, b) => a.a.rec - b.a.rec || b.a.nanal - a.a.nanal, analistas: (a, b) => b.a.nanal - a.a.nanal };

  function render(){
    const base = Object.entries(D.acoes).filter(([c, a]) => !C.ETFS.includes(c) && a.rec != null && a.preco > 0 && (a.nanal || 0) >= st.min)
      .map(([c, a]) => ({ c, a, pot: a.alvo > 0 ? a.alvo / a.preco - 1 : -9 }));
    const doG = base.filter(x => C.doGrupo(x.c, st.grupo));
    const rows = doG.filter(x => st.so === "todas" || (st.so === "compra" ? x.a.rec <= 2.5 : x.a.rec > 3.5)).sort(ORD[st.ordem]);
    const nCompra = doG.filter(x => x.a.rec <= 2.5).length, nNeutro = doG.filter(x => x.a.rec > 2.5 && x.a.rec <= 3.5).length, nVenda = doG.length - nCompra - nNeutro;
    const top = doG.filter(x => x.a.rec <= 2.5 && x.pot > -9).sort(ORD.potencial)[0];
    const chip = (k, v, n) => `<button type="button" data-${k}="${v}" aria-pressed="${st[{ cg: "grupo", cs: "so" }[k]] === v}">${n}</button>`;
    const lim = st.todas ? rows.length : 15;
    el.innerHTML = `
      <div class="est-k">
        <div class="pos"><span>Consenso de compra</span><b>${nCompra}</b><small>de ${doG.length} ações cobertas</small></div>
        <div><span>Neutro</span><b>${nNeutro}</b><small>manter</small></div>
        <div class="${nVenda ? "neg" : ""}"><span>Venda</span><b>${nVenda}</b><small>consenso de venda</small></div>
        <div class="az"><span>Maior potencial (compra)</span><b class="nm1">${top ? esc(top.c) : "—"}</b><small>${top ? `alvo R$ ${nf(top.a.alvo, 2)} · ${pct(top.pot)}` : "&nbsp;"}</small></div>
      </div>
      <div class="est-ctl rd-ctl" style="margin-top:18px">
        <div class="seg" role="group" aria-label="Grupo">${C.GRUPOS.map(([k, n]) => chip("cg", k, n)).join("")}</div>
        <div class="seg" role="group" aria-label="Recomendação">${chip("cs", "compra", "Compra")}${chip("cs", "venda", "Venda")}${chip("cs", "todas", "Todas")}</div>
        <label class="f"><span>Ordenar por</span><select id="crOrd">${[["potencial", "Potencial até o alvo"], ["consenso", "Consenso mais forte"], ["analistas", "Mais analistas"]].map(([k, n]) => `<option value="${k}" ${st.ordem === k ? "selected" : ""}>${n}</option>`).join("")}</select></label>
        <label class="f"><span>Mínimo de analistas</span><select id="crMin">${[1, 3, 5, 10].map(n => `<option value="${n}" ${st.min === n ? "selected" : ""}>${n}</option>`).join("")}</select></label>
      </div>
      <div class="rd-wrap"><table class="rd-tb cr-tb">
        <thead><tr><th>Ação</th><th>Preço</th><th>Recomendação</th><th>Compra forte ↔ venda</th><th>Analistas</th><th>Preço-alvo médio</th><th>Potencial</th></tr></thead>
        <tbody>${rows.slice(0, lim).map(x => `<tr><td><b>${esc(x.c)}</b><small>${esc(x.a.nome)}</small></td><td class="num">${nf(x.a.preco, 2)}</td>
          <td style="color:${C.corCons(x.a.rec)};font-weight:700">${C.consenso(x.a.rec)}</td><td>${regua(x.a.rec)}</td><td class="num">${x.a.nanal}</td>
          <td class="num">${x.a.alvo ? nf(x.a.alvo, 2) : "—"}</td><td class="num" style="color:${x.pot > -9 ? (x.pot >= 0 ? "var(--good)" : "#ff6b6b") : "inherit"}">${x.pot > -9 ? pct(x.pot) : "—"}</td></tr>`).join("")
          || `<tr><td colspan="7">Nenhuma ação neste filtro.</td></tr>`}</tbody></table></div>
      ${rows.length > lim ? `<button type="button" class="est-mais" data-ctodas>Mostrar ${rows.length - lim === 1 ? "a restante" : `as ${rows.length - lim} restantes`}</button>` : ""}
      <p class="est-fonte">Fonte: Yahoo Finance, que reúne as recomendações das corretoras que cobrem cada ação (as próprias corretoras não publicam esses dados abertamente, nem o Yahoo informa o nome de cada uma); ${esc(C.quando(D))}. A recomendação é a média numa escala de 1 (compra forte) a 5 (venda forte): até 2,5 é compra, até 3,5 é neutro, acima disso é venda. O preço-alvo é a média das projeções para 12 meses. Consensos com poucos analistas são menos confiáveis. <b>Não é recomendação de investimento.</b></p>`;
  }

  el.addEventListener("click", e => {
    const b = e.target.closest("[data-cg],[data-cs],[data-ctodas]"); if (!b) return;
    if (b.dataset.cg){ st.grupo = b.dataset.cg; st.todas = false; }
    if (b.dataset.cs){ st.so = b.dataset.cs; st.todas = false; }
    if ("ctodas" in b.dataset) st.todas = true;
    render();
  });
  el.addEventListener("change", e => {
    if (e.target.id === "crOrd") st.ordem = e.target.value;
    if (e.target.id === "crMin") st.min = +e.target.value;
    render();
  });
  C.carregar().then(d => { D = d; render(); })
    .catch(() => { el.innerHTML = `<p class="est-fonte">Não foi possível carregar as recomendações agora. Tente recarregar a página.</p>`; });
})();
