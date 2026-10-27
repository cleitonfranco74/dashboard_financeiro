/* Radar de topos e alertas, na página Mercado: ações da B3 na máxima de 52 semanas ou perto dela,
 * sobrecompradas pelo IFR de 14 dias e acima do preço-alvo médio das corretoras; alertas pessoais
 * guardados no navegador; e os avisos públicos no celular pelo ntfy, enviados de hora em hora pela
 * Action cotacoes.yml (scripts/alertas_topo.py). Usa assets/acoes-comum.js. */
(() => {
  const el = document.getElementById("topo");
  if (!el || !window.AcoesComum) return;
  const C = window.AcoesComum, AL = C.alertas;
  const TOPICO = "livro-caixa-topos-z26hf9";
  const RAW = "https://raw.githubusercontent.com/cleitonfranco74/dashboard_financeiro/dados/alertas.json";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = (x, d) => x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  const pct = (x, d = 1) => x == null || !isFinite(x) ? "—" : `${x > 0 ? "+" : x < 0 ? "−" : ""}${nf(Math.abs(x) * 100, d)}%`;
  const CATS = [["acoes", "Ações e BDRs da B3"], ["fiis", "Fundos imobiliários"], ["stocks", "Ações americanas"], ["etfs", "ETFs internacionais"]];
  const SINAIS = [["perto", "Perto do topo (até 5%)"], ["sobre", "Sobrecompra (IFR ≥ 70)"], ["alvo", "Acima do preço-alvo"], ["todas", "Todas"]];
  const st = { grupo: "todas", sinal: "perto", todas: false };
  let D, HIST = null;

  function linhas(){
    return Object.entries(D.acoes).filter(([c, a]) => !C.ETFS.includes(c) && a.preco > 0).map(([c, a]) => {
      const mx = a.max52 > 0 ? Math.max(a.max52, a.preco) : null, dist = mx ? a.preco / mx - 1 : null;
      const s = { nova: a.max52 > 0 && a.preco >= a.max52 * .999, perto: dist != null && dist >= -.05, sobre: a.ifr >= 70, alvo: a.alvo > 0 && (a.nanal || 0) >= 3 && a.preco >= a.alvo };
      return { c, a, dist, s, dia: a.ant ? a.preco / a.ant - 1 : null };
    });
  }
  const selos = s => [s.nova && `<span class="tp-s nv">Máxima de 52 semanas</span>`, !s.nova && s.perto && `<span class="tp-s pt">Perto do topo</span>`,
    s.sobre && `<span class="tp-s sb">Sobrecompra</span>`, s.alvo && `<span class="tp-s av">Acima do alvo</span>`].filter(Boolean).join("") || `<span class="tp-s">—</span>`;

  function meus(){
    const l = AL.ler();
    const opcoes = CATS.map(([k, n]) => D.todos[k] ? `<optgroup label="${n}">${Object.entries(D.todos[k]).sort(([x], [y]) => x.localeCompare(y)).map(([c, a]) => `<option value="${k}|${c}">${esc(c)} · ${esc(a.nome)}</option>`).join("")}</optgroup>` : "").join("");
    return `<div class="al-box">
      <h4>Meus alertas</h4>
      <p class="al-sub">Ficam guardados só neste navegador. A página confere os alertas ao abrir e, enquanto estiver aberta, a cada 15 minutos; com os avisos do navegador ativados, aparece uma notificação quando um alerta dispara.</p>
      <form class="al-form" id="alForm">
        <label class="f"><span>Ativo</span><select id="alAtivo" required>${opcoes}</select></label>
        <label class="f"><span>Condição</span><select id="alTipo">${Object.entries(AL.TIPOS).map(([k, n]) => `<option value="${k}">${n}</option>`).join("")}</select></label>
        <label class="f" id="alValorF"><span>Preço</span><input id="alValor" type="number" step="0.01" min="0" inputmode="decimal" placeholder="ex.: 60,00"></label>
        <button type="submit" class="al-bt">Criar alerta</button>
      </form>
      ${l.length ? `<ul class="al-list">${l.map(al => { const a = AL.ativo(D, al), ok = AL.disparou(al, D);
        return `<li class="${ok ? "ok" : ""}"><span class="al-st">${ok ? "Disparou" : "Aguardando"}</span><span><b>${esc(AL.descreve(al, a))}</b><small>${a ? `agora ${AL.brl(a.preco, a.moeda)}${a.max52 ? ` · máxima ${AL.brl(a.max52, a.moeda)}` : ""}${a.ifr != null ? ` · IFR ${nf(a.ifr, 0)}` : ""}${a.alvo ? ` · alvo ${AL.brl(a.alvo, a.moeda)}` : ""}` : "ativo sem cotação"}</small></span><button type="button" data-alrm="${al.id}" aria-label="Apagar alerta">×</button></li>`; }).join("")}</ul>`
        : `<p class="est-fonte" style="margin-top:12px">Nenhum alerta criado.</p>`}
      ${"Notification" in window ? `<button type="button" class="est-mais" data-alnot ${Notification.permission === "granted" ? "disabled" : ""}>${Notification.permission === "granted" ? "Avisos do navegador ativados" : Notification.permission === "denied" ? "Avisos bloqueados nas configurações do navegador" : "Ativar avisos do navegador"}</button>` : ""}
    </div>`;
  }

  function celular(){
    const h = HIST?.historico || [];
    return `<div class="al-box ntfy">
      <h4>Avisos no celular, mesmo com o site fechado</h4>
      <p class="al-sub">De hora em hora, durante o pregão, o site publica um aviso quando uma ação da B3 <b>renova a máxima de 52 semanas</b> ou <b>chega ao preço-alvo médio das corretoras</b>. Os avisos são os mesmos para todos e chegam pelo <a href="https://ntfy.sh" target="_blank" rel="noopener">ntfy</a>, um aplicativo gratuito de notificações que não pede cadastro.</p>
      <ol>
        <li>Instale o ntfy: <a href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" rel="noopener">Android</a> ou <a href="https://apps.apple.com/app/ntfy/id1625396347" target="_blank" rel="noopener">iPhone</a>.</li>
        <li>Toque em <b>+</b> e assine o tópico <code>${TOPICO}</code> (servidor ntfy.sh, o padrão).</li>
        <li>Pronto: os avisos chegam como notificações. No computador, dá para acompanhar em <a href="https://ntfy.sh/${TOPICO}" target="_blank" rel="noopener">ntfy.sh/${TOPICO}</a>.</li>
      </ol>
      <h5>Últimos avisos enviados</h5>
      ${h.length ? `<ul class="al-hist">${h.slice(0, 8).map(x => `<li><time>${esc(new Date(x.quando).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }))}</time> ${esc(x.msg)}</li>`).join("")}</ul>`
        : `<p class="est-fonte" style="margin-top:6px">${HIST ? "Nenhum aviso enviado ainda." : "Carregando…"}</p>`}
    </div>`;
  }

  function render(){
    const todas = linhas(), base = todas.filter(x => C.doGrupo(x.c, st.grupo));
    const k = n => base.filter(x => x.s[n]).length;
    const rows = base.filter(x => st.sinal === "todas" || x.s[st.sinal]).sort((x, y) => (y.dist ?? -9) - (x.dist ?? -9));
    const lim = st.todas ? rows.length : 15;
    const chip = (t, v, n) => `<button type="button" data-${t}="${v}" aria-pressed="${st[t === "tg" ? "grupo" : "sinal"] === v}">${n}</button>`;
    el.innerHTML = `
      <div class="est-k">
        <div class="pos"><span>Na máxima de 52 semanas</span><b>${k("nova")}</b><small>cotação no topo do último ano</small></div>
        <div><span>Perto do topo</span><b>${k("perto")}</b><small>até 5% abaixo da máxima</small></div>
        <div class="neg"><span>Sobrecompradas</span><b>${k("sobre")}</b><small>IFR de 14 dias acima de 70</small></div>
        <div class="az"><span>Acima do preço-alvo</span><b>${k("alvo")}</b><small>já passaram da média das corretoras</small></div>
      </div>
      <div class="est-ctl rd-ctl" style="margin-top:18px">
        <div class="seg" role="group" aria-label="Grupo">${C.GRUPOS.map(([v, n]) => chip("tg", v, n)).join("")}</div>
        <div class="seg" role="group" aria-label="Sinal">${SINAIS.map(([v, n]) => chip("ts", v, n)).join("")}</div>
      </div>
      <div class="rd-wrap"><table class="rd-tb tp-tb">
        <thead><tr><th>Ação</th><th>Preço</th><th>Dia</th><th>Máxima 52 sem.</th><th>Da máxima</th><th>IFR 14</th><th>Alvo médio</th><th>Sinais</th></tr></thead>
        <tbody>${rows.slice(0, lim).map(x => { const a = x.a; return `<tr><td><b>${esc(x.c)}</b><small>${esc(a.nome)}</small></td><td class="num">${nf(a.preco, 2)}</td>
          <td class="num" style="color:${x.dia == null ? "inherit" : x.dia >= 0 ? "var(--good)" : "#ff6b6b"}">${pct(x.dia)}</td>
          <td class="num">${a.max52 ? nf(a.max52, 2) : "—"}</td><td class="num">${pct(x.dist)}</td>
          <td class="num${x.s.sobre ? " neg" : ""}">${a.ifr == null ? "—" : nf(a.ifr, 0)}</td><td class="num">${a.alvo ? nf(a.alvo, 2) : "—"}</td><td>${selos(x.s)}</td></tr>`; }).join("")
          || `<tr><td colspan="8">Nenhuma ação com este sinal agora.</td></tr>`}</tbody></table></div>
      ${rows.length > lim ? `<button type="button" class="est-mais" data-ttodas>Mostrar ${rows.length - lim === 1 ? "a restante" : `as ${rows.length - lim} restantes`}</button>` : ""}
      <div class="al-cols">${meus()}${celular()}</div>
      <p class="est-fonte">Fonte: Yahoo Finance (${esc(C.quando(D))}). A máxima de 52 semanas é a maior cotação do último ano; o IFR (índice de força relativa de Wilder, 14 pregões) é calculado sobre os fechamentos diários e passa de 70 quando as altas recentes dominam. <b>Topo não é sinal de venda nem de compra:</b> ações em tendência de alta renovam máximas por meses. Os alertas são informativos, com cotações de hora em hora e cerca de 15 minutos de atraso.</p>`;
    tipo();
  }
  const tipo = () => { const t = el.querySelector("#alTipo")?.value, f = el.querySelector("#alValorF"); if (f) f.hidden = !(t === "acima" || t === "abaixo"); };

  /* notifica os alertas que dispararam e ainda não foram avisados hoje */
  function conferir(){
    const hoje = new Date().toDateString(), l = AL.ler(); let mudou = false;
    l.forEach(al => {
      if (!AL.disparou(al, D) || al.avisado === hoje) return;
      al.avisado = hoje; mudou = true;
      if ("Notification" in window && Notification.permission === "granted"){
        const a = AL.ativo(D, al);
        try { new Notification("Alerta de ação: " + al.cod, { body: `${AL.descreve(al, a)}. Agora: ${AL.brl(a.preco, a.moeda)}.`, tag: al.id }); } catch {}
      }
    });
    if (mudou) AL.gravar(l);
  }

  el.addEventListener("click", e => {
    const b = e.target.closest("[data-tg],[data-ts],[data-ttodas],[data-alrm],[data-alnot]"); if (!b) return;
    if (b.dataset.tg){ st.grupo = b.dataset.tg; st.todas = false; }
    if (b.dataset.ts){ st.sinal = b.dataset.ts; st.todas = false; }
    if ("ttodas" in b.dataset) st.todas = true;
    if (b.dataset.alrm) AL.gravar(AL.ler().filter(x => x.id !== b.dataset.alrm));
    if ("alnot" in b.dataset){ Notification.requestPermission().then(() => { conferir(); render(); }); return; }
    render();
  });
  el.addEventListener("change", e => { if (e.target.id === "alTipo") tipo(); });
  el.addEventListener("submit", e => {
    if (e.target.id !== "alForm") return;
    e.preventDefault();
    const [cat, cod] = el.querySelector("#alAtivo").value.split("|"), t = el.querySelector("#alTipo").value;
    const valor = parseFloat(String(el.querySelector("#alValor").value).replace(",", "."));
    if ((t === "acima" || t === "abaixo") && !(valor > 0)){ el.querySelector("#alValor").focus(); return; }
    const l = AL.ler();
    l.push({ id: Date.now().toString(36), cat, cod, tipo: t, valor: t === "acima" || t === "abaixo" ? valor : null, criado: new Date().toISOString() });
    AL.gravar(l); conferir(); render();
  });

  C.carregar().then(d => { D = d; conferir(); render(); })
    .catch(() => { el.innerHTML = `<p class="est-fonte">Não foi possível carregar as cotações agora. Tente recarregar a página.</p>`; });
  fetch(`${RAW}?t=${Math.floor(Date.now() / 6e5)}`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null)
    .then(h => { HIST = h || { historico: [] }; if (D) render(); });
  // enquanto a página estiver aberta, confere os alertas com as cotações novas a cada 15 minutos
  setInterval(() => { if (document.hidden) return; C.recarregar().then(d => { D = d; conferir(); }).catch(() => {}); }, 15 * 60 * 1000);
})();
