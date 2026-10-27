/* Hoje na B3, no topo da página Ações: quantas ações subiram e caíram no dia, o ETF do Ibovespa e as
 * maiores altas e baixas, a partir de data/acoes.json com as cotações do pregão. Usa assets/acoes-comum.js. */
(() => {
  const el = document.getElementById("hojeB3");
  if (!el || !window.AcoesComum) return;
  const C = window.AcoesComum;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = (x, d) => x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = x => `${x > 0 ? "+" : x < 0 ? "−" : ""}${nf(Math.abs(x) * 100, 2)}%`;
  const POS = "#34d399", NEG = "#ff6b6b";
  const st = { grupo: "todas" };
  let D;

  const lista = (itens, cor, max) => `<div class="iv-bars">${itens.map(x => `<div class="iv-b"><span><b>${esc(x.c)}</b> · ${esc(x.a.nome)}</span><i class="br"><i style="width:${Math.max(2, Math.abs(x.v) / max * 100)}%;background:${cor}"></i></i><b class="num" style="color:${cor}">${pct(x.v)}</b><small>R$ ${nf(x.a.preco, 2)}</small></div>`).join("")}</div>`;

  function render(){
    const todas = Object.entries(D.acoes).filter(([c, a]) => !C.ETFS.includes(c) && a.preco > 0 && a.ant > 0).map(([c, a]) => ({ c, a, v: a.preco / a.ant - 1 }));
    const base = todas.filter(x => C.doGrupo(x.c, st.grupo));
    const sobe = base.filter(x => x.v > 0).sort((x, y) => y.v - x.v), cai = base.filter(x => x.v < 0).sort((x, y) => x.v - y.v);
    const ib = D.acoes.BOVA11, vib = ib?.ant ? ib.preco / ib.ant - 1 : null;
    const max = Math.max(.001, ...base.map(x => Math.abs(x.v)));
    const media = base.length ? base.reduce((s, x) => s + x.v, 0) / base.length : null;
    el.innerHTML = `
      <div class="est-k">
        <div class="${vib == null ? "" : vib >= 0 ? "pos" : "neg"}"><span>ETF do Ibovespa (BOVA11)</span><b>${vib == null ? "—" : pct(vib)}</b><small>${ib ? `R$ ${nf(ib.preco, 2)}` : "&nbsp;"}</small></div>
        <div class="pos"><span>Subiram</span><b>${sobe.length}</b><small>de ${base.length} ações</small></div>
        <div class="neg"><span>Caíram</span><b>${cai.length}</b><small>${base.length - sobe.length - cai.length} estáveis</small></div>
        <div class="${media == null ? "" : media >= 0 ? "pos" : "neg"}"><span>Variação média</span><b>${media == null ? "—" : pct(media)}</b><small>média simples das ações</small></div>
      </div>
      <div class="est-ctl rd-ctl" style="margin-top:18px"><div class="seg" role="group" aria-label="Grupo">${C.GRUPOS.map(([k, n]) => `<button type="button" data-hg="${k}" aria-pressed="${st.grupo === k}">${n}</button>`).join("")}</div></div>
      <div class="iv-cols">
        <div><h4>Maiores altas</h4>${sobe.length ? lista(sobe.slice(0, 6), POS, max) : `<p class="est-fonte">Nenhuma alta neste grupo.</p>`}</div>
        <div><h4>Maiores baixas</h4>${cai.length ? lista(cai.slice(0, 6), NEG, max) : `<p class="est-fonte">Nenhuma baixa neste grupo.</p>`}</div>
      </div>
      <p class="est-fonte">Variação sobre o fechamento do pregão anterior. Fonte: Yahoo Finance (${esc(C.quando(D))}); durante o pregão, as cotações são atualizadas de hora em hora, com cerca de 15 minutos de atraso.</p>`;
  }
  el.addEventListener("click", e => { const b = e.target.closest("[data-hg]"); if (!b) return; st.grupo = b.dataset.hg; render(); });
  C.carregar().then(d => { D = d; render(); })
    .catch(() => { el.innerHTML = `<p class="est-fonte">Não foi possível carregar as cotações agora. Tente recarregar a página.</p>`; });
})();
