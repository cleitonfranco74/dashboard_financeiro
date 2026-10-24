/* Estatais federais na página inicial: receita e lucro de cada empresa de controle direto da União,
 * ano a ano, e os dividendos pagos à União, a partir de data/estatais.json (gravado por
 * scripts/atualizar_estatais.py com os dados abertos da SEST/MGI). Valores do arquivo em R$ milhões;
 * cada ano da série é [receita, lucro, dividendos à União, dividendos a todos os acionistas]. */
(() => {
  const el = document.getElementById("est");
  if (!el) return;
  const COR = { financeiro: "#5aa2ff", energia: "#f5b83d", infra: "#ff7a45", tec: "#b18cff", industria: "#4fd1c5", social: "#f78fb3" };
  const POS = "#34d399", NEG = "#ff6b6b";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const nf = (x, d) => x.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
  /* R$ milhões → "1,34 tri", "169 bi", "957 mi" (três algarismos significativos) */
  const curto = m => {
    if (m == null || !isFinite(m)) return "—";
    const a = Math.abs(m), s = m < 0 ? "−" : "";
    const [v, u] = a >= 1e6 ? [a / 1e6, "tri"] : a >= 1e3 ? [a / 1e3, "bi"] : [a, "mi"];
    return `${s}${nf(v, v >= 100 ? 0 : v >= 10 ? 1 : 2)} ${u}`;
  };
  /* logomarca em fundo branco (assets/logos, baixadas do Wikimedia Commons); sem ela, a sigla */
  const selo = (e, grande) => e.logo
    ? `<span class="lg${grande ? " g" : ""}"><img src="assets/logos/${esc(e.logo)}" alt="${esc(e.nome)}" loading="lazy"></span>`
    : `<span class="lg sem${grande ? " g" : ""}" title="${esc(e.nome)}">${esc(e.sigla.length > 9 ? e.sigla.slice(0, 8) + "…" : e.sigla)}</span>`;
  const rs = m => m == null ? "—" : `${m < 0 ? "−" : ""}R$ ${curto(Math.abs(m))}`;
  const pct = (x, d = 1) => x == null || !isFinite(x) ? "—" : `${x < 0 ? "−" : ""}${nf(Math.abs(x) * 100, d)}%`;

  let D, st = { ano: null, grupo: "todos", emp: null, semPetro: false, semBancos: false, mostrar: "todas", ordem: "lucro", barra: null, todas: false, met: "lucro" };
  const LINHAS = 12;
  window.EstHelpers = { esc, nf, curto, rs, pct, selo, LINHAS };   // usados por assets/investimentos.js
  /* margem acima de 100% em módulo aparece em empresas com pouca receita própria (as dependentes do Tesouro) */
  const margemTxt = v => { const m = margem(v); return m.startsWith(">") ? "margem acima de 100%" : m.startsWith("<") ? "margem abaixo de −100%" : `margem de ${m}`; };
  const margem = v => !(v[0] > 0) ? "—" : Math.abs(v[1] / v[0]) > 1 ? (v[1] > 0 ? "> 100%" : "< −100%") : pct(v[1] / v[0]);

  /* bancos públicos: BB, Caixa, BNDES, BNB, Banco da Amazônia e Finep (segmento "Financeiro" do cadastro da SEST) */
  const lista = () => D.empresas.filter(e => !(st.semPetro && e.sigla === "PETROBRAS") && !(st.semBancos && e.banco));
  const excluidas = () => [st.semPetro && "Petrobras", st.semBancos && "bancos públicos"].filter(Boolean).join(" e ") + (st.semPetro && st.semBancos ? " (critério do Banco Central)" : "");
  const doGrupo = () => lista().filter(e => st.grupo === "todos" || e.grupo === st.grupo);
  const val = (e, ano) => e.serie[ano] || null;
  const soma = (emps, ano) => {
    let rec = 0, luc = 0, n = 0, pos = 0, neg = 0, nPos = 0, nNeg = 0;
    emps.forEach(e => { const v = val(e, ano); if (!v) return; n++; rec += v[0] || 0; luc += v[1];
      if (v[1] >= 0){ pos += v[1]; nPos++; } else { neg += v[1]; nNeg++; } });
    return { rec, luc, n, pos, neg, nPos, nNeg };
  };
  const rotAno = a => D.parcial[a] ? `${a} (até o ${D.parcial[a]})` : String(a);

  /* ---------- gráfico de barras por ano: lucro, receita ou margem ---------- */
  /* f: valor desenhado (margem limitada a ±100% para não achatar as demais barras); txt: rótulo da barra */
  const MET = {
    lucro: { f: v => v[1], txt: v => curto(v[1]), cor: x => x >= 0 ? POS : NEG },
    receita: { f: v => v[0], txt: v => curto(v[0]), cor: () => "#f5b83d" },
    margem: { f: v => v[0] > 0 ? Math.max(-1, Math.min(1, v[1] / v[0])) : null, txt: v => margem(v), cor: x => x >= 0 ? POS : NEG },
  };
  const TITULO = { lucro: ["Lucro ou prejuízo", "Lucro somado"], receita: ["Receita", "Receita somada"], margem: ["Margem líquida", "Margem do conjunto"] };
  const cabGrafico = grupo => `<div class="est-gh"><h4>${TITULO[st.met][grupo ? 1 : 0]}, ano a ano</h4><div class="seg" role="group" aria-label="O que mostrar no gráfico">${[["lucro", "Lucro"], ["receita", "Receita"], ["margem", "Margem"]].map(([k, n]) => `<button type="button" data-met="${k}" aria-pressed="${st.met === k}">${n}</button>`).join("")}</div></div>`;
  function grafico(serie, nome){
    const M = MET[st.met], anos = D.anos.map(String), vals = anos.map(a => serie[a] ? M.f(serie[a]) ?? null : null);
    // desenha na largura real do painel, para o texto do gráfico ficar no tamanho certo
    const W = Math.max(300, Math.min(1000, (el.clientWidth || 640) - 40)), H = W < 520 ? 200 : 260, pl = 4, pr = 4, pt = 26, pb = 26;
    const ok = vals.filter(v => v != null), max = Math.max(0, ...ok), min = Math.min(0, ...ok);
    const span = (max - min) || 1, y = v => pt + (max - v) / span * (H - pt - pb), y0 = y(0);
    const bw = (W - pl - pr) / anos.length, gap = Math.min(14, bw * .28);
    const sel = st.barra ?? (vals[anos.indexOf(st.ano)] != null ? st.ano : anos.filter((a, i) => vals[i] != null).pop());
    const bars = anos.map((a, i) => {
      const v = vals[i], x = pl + i * bw + gap / 2, w = bw - gap;
      const lbl = `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" class="ax">${bw < 44 ? "’" + a.slice(2) : a}${D.parcial[a] ? "*" : ""}</text>`;
      if (v == null) return lbl + `<text x="${x + w / 2}" y="${y0 - 6}" text-anchor="middle" class="nd">s/d</text>`;
      const top = Math.min(y(v), y0), h = Math.max(1.5, Math.abs(y(v) - y0)), on = a === sel;
      return `<g class="b${on ? " on" : ""}" data-a="${a}" tabindex="0" role="button" aria-label="${a}: ${esc(TITULO[st.met][0].toLowerCase())} ${esc(M.txt(serie[a]))}">
        <rect x="${x - gap / 2}" y="${pt - 18}" width="${bw}" height="${H - pt + 18}" fill="transparent"/>
        <rect class="bv" x="${x}" y="${top}" width="${w}" height="${h}" rx="4" fill="${M.cor(v)}" opacity="${D.parcial[a] ? .45 : on ? 1 : .78}"/>
        ${on ? `<text x="${x + w / 2}" y="${v >= 0 ? top - 6 : top + h + 13}" text-anchor="middle" class="vl">${esc(M.txt(serie[a]))}</text>` : ""}${lbl}</g>`;
    }).join("");
    const v = serie[sel], ant = serie[String(+sel - 1)];
    return `<svg viewBox="0 0 ${W} ${H}" class="est-g" role="group" aria-label="${esc(TITULO[st.met][0])} por ano: ${esc(nome)}">
      <line x1="0" x2="${W}" y1="${y0}" y2="${y0}" class="zero"/>${bars}</svg>
      <p class="est-cap">${v ? `<b>${esc(rotAno(sel))}</b>: ${v[1] < 0 ? "prejuízo" : "lucro"} de <b class="${v[1] < 0 ? "neg" : "pos"}">${esc(rs(Math.abs(v[1])))}</b>, receita de ${esc(rs(v[0]))}${v[0] > 0 ? `, ${margemTxt(v)}` : ""}${ant ? `. Em ${+sel - 1}: ${ant[1] < 0 ? "prejuízo" : "lucro"} de ${esc(rs(Math.abs(ant[1])))}` : ""}.` : "Sem dados para este ano."}
      ${Object.keys(D.parcial).length ? `<br><small>* Ano em andamento: lucro acumulado ${Object.entries(D.parcial).map(([a, p]) => `até o ${p} de ${a}`).join(", ")}.</small>` : ""}</p>`;
  }

  /* ---------- painel do grupo ou da empresa ---------- */
  function painel(){
    const emps = doGrupo(), ano = st.ano, e = st.emp && emps.find(x => x.sigla === st.emp);
    if (e){
      const v = val(e, ano), ant = val(e, String(+ano - 1));
      return `<div class="est-det"><div class="est-dh">${selo(e, true)}<div><h3>${esc(e.nome)}</h3>
          <p>${esc(D.grupos[e.grupo] || "")} · ${esc(e.ministerio)}${e.dependente ? ` · <span class="tag" title="Recebe recursos do Tesouro para pagar despesas de pessoal ou de custeio">dependente do Tesouro</span>` : ""}</p></div></div>
        <div class="est-k">
          <div><span>Receita ${esc(rotAno(ano))}</span><b>${esc(rs(v?.[0]))}</b><small>${ant?.[0] && v?.[0] != null ? `${v[0] >= ant[0] ? "+" : ""}${pct((v[0] - ant[0]) / Math.abs(ant[0]), 0)} sobre ${+ano - 1}` : "&nbsp;"}</small></div>
          <div class="${v && v[1] < 0 ? "neg" : "pos"}"><span>${v && v[1] < 0 ? "Prejuízo" : "Lucro"} ${esc(rotAno(ano))}</span><b>${esc(rs(v ? Math.abs(v[1]) : null))}</b><small>${v?.[0] > 0 ? `${margemTxt(v)}` : "&nbsp;"}</small></div>
        </div>
        ${cabGrafico(false)}${grafico(e.serie, e.nome)}</div>`;
    }
    const s = soma(emps, ano), anos = D.anos.map(String);
    const serie = Object.fromEntries(anos.map(a => { const x = soma(emps, a); return [a, x.n ? [x.rec, x.luc] : null]; }));
    const tot = Math.abs(s.pos) + Math.abs(s.neg) || 1;
    const nome = st.grupo === "todos" ? "Todas as estatais" : D.grupos[st.grupo];
    return `<div class="est-det"><div class="est-dh"><div><h3>${esc(nome)}${excluidas() ? ` <small>sem ${excluidas()}</small>` : ""}</h3>
        <p>${s.n} empresas somadas em ${esc(rotAno(ano))}. Escolha uma estatal acima para ver a receita e o lucro dela.</p></div></div>
      <div class="est-k">
        <div><span>Receita somada</span><b>${esc(rs(s.rec))}</b><small>vendas e serviços + receitas dos bancos</small></div>
        <div class="${s.luc < 0 ? "neg" : "pos"}"><span>${s.luc < 0 ? "Prejuízo" : "Lucro"} somado</span><b>${esc(rs(Math.abs(s.luc)))}</b><small>${s.rec > 0 ? `margem de ${pct(s.luc / s.rec)} · lucros menos prejuízos` : "&nbsp;"}</small></div>
        <div class="pos"><span>Lucros</span><b>${esc(rs(s.pos))}</b><small>${s.nPos} ${s.nPos === 1 ? "empresa lucrou" : "empresas lucraram"}</small></div>
        <div class="neg"><span>Prejuízos</span><b>${esc(rs(Math.abs(s.neg)))}</b><small>${s.nNeg} ${s.nNeg === 1 ? "empresa teve" : "empresas tiveram"} prejuízo</small></div>
      </div>
      <h4>Quem puxa para cima e quem puxa para baixo</h4>
      <div class="est-pn"><span>Lucros: <b class="pos">${esc(rs(s.pos))}</b> em ${s.nPos} empresas</span><span>Prejuízos: <b class="neg">${esc(rs(s.neg))}</b> em ${s.nNeg} empresas</span></div>
      <div class="est-pb" aria-hidden="true"><i style="width:${s.pos / tot * 100}%;background:${POS}"></i><i style="width:${Math.abs(s.neg) / tot * 100}%;background:${NEG}"></i></div>
      ${cabGrafico(true)}${grafico(serie, nome)}</div>`;
  }

  /* ---------- tabela ---------- */
  function tabela(){
    const ano = st.ano, f = st.ordem === "receita" ? v => v[0] ?? -Infinity : st.ordem === "margem" ? v => v[0] > 0 ? v[1] / v[0] : -Infinity : v => v[1];
    const rows = doGrupo().filter(e => val(e, ano) && (st.mostrar === "todas" || (st.mostrar === "prej") === (val(e, ano)[1] < 0))).sort((a, b) => f(val(b, ano)) - f(val(a, ano)));
    if (st.mostrar === "prej" && st.ordem === "lucro") rows.reverse();   // maiores prejuízos primeiro
    const mRec = Math.max(...rows.map(e => val(e, ano)[0] || 0), 1), mLuc = Math.max(...rows.map(e => Math.abs(val(e, ano)[1])), 1);
    return `<div class="est-tb" role="table" aria-label="Receita e lucro em ${esc(rotAno(ano))}">
      <div class="tr th" role="row"><span role="columnheader">#</span><span role="columnheader">Empresa</span><span role="columnheader" class="c-r">Receita</span><span role="columnheader" class="c-l">Lucro / prejuízo</span><span role="columnheader" class="n">Margem</span></div>
      ${rows.slice(0, st.todas ? rows.length : LINHAS).map((e, i) => { const v = val(e, ano);
        return `<div class="tr${st.emp === e.sigla ? " sel" : ""}" role="row" data-emp="${esc(e.sigla)}" tabindex="0">
          <span class="rk num" role="cell">${i + 1}</span>
          <span class="nm" role="cell">${selo(e)}<span><b>${esc(e.nome)}</b><small>${esc(D.grupos[e.grupo] || "")}</small></span></span>
          <span class="c-r" role="cell"><i class="br"><i style="width:${Math.max(.5, (v[0] || 0) / mRec * 100)}%;background:var(--s4)"></i></i><b class="num">${esc(curto(v[0]))}</b></span>
          <span class="c-l" role="cell"><i class="br"><i style="width:${Math.max(.5, Math.abs(v[1]) / mLuc * 100)}%;background:${v[1] < 0 ? NEG : POS}"></i></i><b class="num ${v[1] < 0 ? "neg" : ""}">${esc(curto(v[1]))}</b></span>
          <span class="n num" role="cell">${margem(v)}</span></div>`; }).join("")}
    </div>${rows.length > LINHAS && !st.todas ? `<button type="button" class="est-mais" data-todas>Mostrar as ${rows.length - LINHAS} restantes</button>` : ""}`;
  }

  function render(){
    const emps = doGrupo();
    if (st.emp && !emps.some(e => e.sigla === st.emp)) st.emp = null;
    const chips = emps.slice().sort((a, b) => (val(b, st.ano)?.[1] ?? -Infinity) - (val(a, st.ano)?.[1] ?? -Infinity));
    el.innerHTML = `
      <div class="est-ctl">
        <label class="f"><span>Ano</span><select id="estAno">${D.anos.slice().reverse().map(a => `<option value="${a}" ${String(a) === st.ano ? "selected" : ""}>${esc(rotAno(a))}</option>`).join("")}</select></label>
        <label class="f tg"><input type="checkbox" id="estPetro" ${st.semPetro ? "checked" : ""}><span class="sw" aria-hidden="true"></span><span><b>Excluir Petrobras</b><small>a maior estatal, sozinha</small></span></label>
        <label class="f tg"><input type="checkbox" id="estBancos" ${st.semBancos ? "checked" : ""}><span class="sw" aria-hidden="true"></span><span><b>Excluir bancos públicos</b><small>BB, Caixa, BNDES, BNB, Basa e Finep</small></span></label>
        <div class="f"><span id="estMosR">Mostrar na tabela</span><div class="seg" role="group" aria-labelledby="estMosR">${[["todas", "Todas"], ["lucro", "Com lucro"], ["prej", "Com prejuízo"]].map(([k, n]) => `<button type="button" data-mos="${k}" aria-pressed="${st.mostrar === k}">${n}</button>`).join("")}</div></div>
        <div class="f"><span id="estOrdR">Ordenar tabela por</span><div class="seg" role="group" aria-labelledby="estOrdR">${[["lucro", "Lucro"], ["receita", "Receita"], ["margem", "Margem"]].map(([k, n]) => `<button type="button" data-ord="${k}" aria-pressed="${st.ordem === k}">${n}</button>`).join("")}</div></div>
      </div>
      <div class="est-tabs" role="tablist" aria-label="Grupos de estatais">${[["todos", "Todas"], ...Object.entries(D.grupos)].map(([k, n]) =>
        `<button type="button" role="tab" data-g="${k}" aria-selected="${st.grupo === k}">${k !== "todos" ? `<i style="background:${COR[k]}"></i>` : ""}${esc(n)}</button>`).join("")}</div>
      <div class="est-chips" aria-label="Estatais do grupo"><button type="button" data-emp="" aria-pressed="${!st.emp}">Total do grupo</button>${chips.map(e =>
        `<button type="button" data-emp="${esc(e.sigla)}" aria-pressed="${st.emp === e.sigla}">${esc(e.nome)}</button>`).join("")}</div>
      ${painel()}
      <div class="est-th"><h4>Quanto cada estatal faturou e quanto lucrou em ${esc(rotAno(st.ano))}</h4><span>${{ todas: "", lucro: "só as que lucraram · ", prej: "só as que tiveram prejuízo · " }[st.mostrar]}clique numa linha para ver o histórico</span></div>
      ${tabela()}
      <p class="est-fonte">Fonte: ${esc(D.fonte)}, demonstrações validadas pelo contador de cada empresa. Lucro líquido do exercício; receita bruta de vendas e serviços e, nos bancos, receitas da intermediação financeira e de tarifas. Até 2024, dados anuais; desde 2025, trimestrais acumulados no ano. Atualizado em ${new Date(D.atualizado + "T12:00").toLocaleDateString("pt-BR")}. Logomarcas do Wikimedia Commons, marcas de suas respectivas empresas, usadas só para identificá-las.</p>`;
  }

  el.addEventListener("click", e => {
    const t = e.target.closest("button,[data-emp],.b");
    if (!t) return;
    if (t.dataset.g){ st.grupo = t.dataset.g; st.emp = null; st.barra = null; }
    else if (t.dataset.ord) st.ordem = t.dataset.ord;
    else if (t.dataset.met) st.met = t.dataset.met;
    else if (t.dataset.mos){ st.mostrar = t.dataset.mos; st.todas = false; }
    else if ("todas" in t.dataset) st.todas = true;
    else if (t.dataset.a) st.barra = t.dataset.a;
    else if ("emp" in t.dataset){
      st.emp = t.dataset.emp || null; st.barra = null;
      if (t.classList.contains("tr")){ const x = D.empresas.find(z => z.sigla === st.emp); if (x && st.grupo !== "todos") st.grupo = x.grupo;
        render(); el.querySelector(".est-det")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
    } else return;
    render();
  });
  el.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".tr[data-emp],.b")){ e.preventDefault(); e.target.click(); } });
  el.addEventListener("change", e => {
    if (e.target.id === "estAno"){ st.ano = e.target.value; st.barra = null; }
    if (e.target.id === "estPetro") st.semPetro = e.target.checked;
    if (e.target.id === "estBancos") st.semBancos = e.target.checked;
    render();
  });

  /* ---------- dividendos pagos à União ---------- */
  const dv = document.getElementById("div"), AZ = "#5aa2ff";
  const sd = { ano: null, emp: "", barra: null, todas: false };
  let anosDiv = [];
  const dvd = (e, a) => { const v = e.serie[a]; return v && v[2] != null ? v : null; };
  const somaDiv = (emps, a) => {
    let u = 0, t = 0, n = 0;
    emps.forEach(e => { const v = dvd(e, a); if (!v) return; u += v[2]; t += v[3] || 0; if (v[2] > 0) n++; });
    return { u, t, n };
  };
  function graficoDiv(serie, nome){
    const W = Math.max(300, Math.min(1000, (dv.clientWidth || 640) - 40)), H = W < 520 ? 200 : 240, pt = 26, pb = 26;
    const max = Math.max(1, ...anosDiv.map(a => serie[a] ? Math.max(serie[a][0], serie[a][1]) : 0));
    const y = v => pt + (1 - v / max) * (H - pt - pb), bw = W / anosDiv.length, gap = Math.min(18, bw * .3);
    const sel = sd.barra ?? (serie[sd.ano] ? sd.ano : anosDiv.filter(a => serie[a]).pop());   // começa no ano escolhido
    const bars = anosDiv.map((a, i) => {
      const v = serie[a], x = i * bw + gap / 2, w = bw - gap, on = a === sel;
      const lbl = `<text x="${x + w / 2}" y="${H - 8}" text-anchor="middle" class="ax">${a}${D.parcial[a] ? "*" : ""}</text>`;
      if (!v) return lbl;
      return `<g class="b${on ? " on" : ""}" data-da="${a}" tabindex="0" role="button" aria-label="${a}: ${esc(rs(v[0]))} à União, ${esc(rs(v[1]))} a todos os acionistas">
        <rect x="${x - gap / 2}" y="${pt - 18}" width="${bw}" height="${H - pt + 18}" fill="transparent"/>
        <rect x="${x}" y="${y(v[1])}" width="${w}" height="${H - pb - y(v[1])}" rx="4" fill="${AZ}" opacity=".18"/>
        <rect class="bv" x="${x + w * .18}" y="${y(v[0])}" width="${w * .64}" height="${Math.max(1.5, H - pb - y(v[0]))}" rx="4" fill="${AZ}" opacity="${D.parcial[a] ? .45 : on ? 1 : .8}"/>
        ${on ? `<text x="${x + w / 2}" y="${y(v[1]) - 6}" text-anchor="middle" class="vl">${esc(curto(v[0]))}</text>` : ""}${lbl}</g>`;
    }).join("");
    const v = serie[sel];
    return `<svg viewBox="0 0 ${W} ${H}" class="est-g" role="group" aria-label="Dividendos pagos por ano: ${esc(nome)}"><line x1="0" x2="${W}" y1="${H - pb}" y2="${H - pb}" class="zero"/>${bars}</svg>
      <div class="dv-leg"><span><i style="background:${AZ}"></i>Pagos à União</span><span><i style="background:${AZ};opacity:.25"></i>Pagos a todos os acionistas</span></div>
      <p class="est-cap">${v ? `<b>${esc(rotAno(sel))}</b>: <b style="color:${AZ}">${esc(rs(v[0]))}</b> pagos à União, de ${esc(rs(v[1]))} distribuídos a todos os acionistas${v[1] > 0 ? ` (${pct(v[0] / v[1], 0)} para a União)` : ""}.` : "Sem dados para este ano."}</p>`;
  }
  function dividendos(){
    if (!dv) return;
    anosDiv = D.anos.map(String).filter(a => D.empresas.some(e => dvd(e, a)));
    if (!anosDiv.length){ dv.closest("section").hidden = true; return; }
    const completos = anosDiv.filter(a => !D.parcial[a]);
    sd.ano = sd.ano || (completos.length ? completos : anosDiv)[(completos.length ? completos : anosDiv).length - 1];
    renderDiv();
  }
  function renderDiv(){
    const a = sd.ano, ant = String(+a - 1);
    const pagadoras = D.empresas.filter(e => anosDiv.some(x => dvd(e, x)?.[2] > 0)).sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR"));
    const emp = sd.emp && D.empresas.find(e => e.sigla === sd.emp);
    const base = emp ? [emp] : D.empresas;
    const s = somaDiv(base, a), sa = somaDiv(base, ant);
    const serie = Object.fromEntries(anosDiv.map(x => { const z = somaDiv(base, x); return [x, z.u || z.t ? [z.u, z.t] : null]; }));
    const rows = D.empresas.filter(e => dvd(e, a)?.[2] > 0).sort((x, y) => dvd(y, a)[2] - dvd(x, a)[2]);
    const maior = rows[0], mU = rows.length ? dvd(rows[0], a)[2] : 1;
    const luc = e => e.serie[ant]?.[1];
    const varia = sa.u > 0 && anosDiv.includes(ant) ? (s.u - sa.u) / sa.u : null;
    dv.innerHTML = `
      <div class="est-ctl">
        <label class="f"><span>Ano</span><select id="divAno">${anosDiv.slice().reverse().map(x => `<option value="${x}" ${x === a ? "selected" : ""}>${esc(rotAno(x))}</option>`).join("")}</select></label>
        <label class="f"><span>Estatal</span><select id="divEmp"><option value="">Todas as estatais</option>${pagadoras.map(e => `<option value="${esc(e.sigla)}" ${e.sigla === sd.emp ? "selected" : ""}>${esc(e.nome)}</option>`).join("")}</select></label>
      </div>
      <div class="est-det">
        ${emp ? `<div class="est-dh">${selo(emp, true)}<div><h3>${esc(emp.nome)}</h3><p>${esc(D.grupos[emp.grupo] || "")} · ${esc(emp.ministerio)}</p></div></div>` : `<div class="est-dh"><div><h3>Todas as estatais</h3><p>Dividendos e juros sobre capital próprio pagos em ${esc(rotAno(a))}.</p></div></div>`}
        <div class="est-k">
          <div class="az"><span>Pagos à União</span><b>${esc(rs(s.u))}</b><small>${varia != null ? `${varia >= 0 ? "+" : ""}${pct(varia, 0)} sobre ${ant}` : "&nbsp;"}</small></div>
          <div><span>Pagos a todos os acionistas</span><b>${esc(rs(s.t))}</b><small>${s.t > 0 ? `${pct(s.u / s.t, 0)} ficou com a União` : "&nbsp;"}</small></div>
          ${emp ? `<div><span>Lucro de ${ant}</span><b>${esc(rs(luc(emp)))}</b><small>${luc(emp) > 0 && s.t ? `pagou o equivalente a ${pct(s.t / luc(emp), 0)} dele` : "&nbsp;"}</small></div>`
            : `<div><span>Maior pagadora</span><b class="nm1">${maior ? esc(maior.nome) : "—"}</b><small>${maior ? `${esc(rs(mU))} · ${pct(mU / (s.u || 1), 0)} do total à União` : "&nbsp;"}</small></div>
          <div><span>Empresas que pagaram</span><b>${s.n}</b><small>de ${D.empresas.length} estatais de controle direto</small></div>`}
        </div>
        <div class="est-gh"><h4>Dividendos ${emp ? "pagos" : "somados"}, ano a ano</h4></div>${graficoDiv(serie, emp ? emp.nome : "Todas as estatais")}
      </div>
      <div class="est-th"><h4>Quem pagou dividendos à União em ${esc(rotAno(a))}</h4><span>clique numa linha para ver o histórico da estatal</span></div>
      <div class="est-tb dv-tb" role="table" aria-label="Dividendos pagos em ${esc(rotAno(a))}">
        <div class="tr th" role="row"><span role="columnheader">#</span><span role="columnheader">Empresa</span><span role="columnheader" class="c-l">À União</span><span role="columnheader" class="n">A todos</span><span role="columnheader" class="n">% União</span><span role="columnheader" class="n">Lucro de ${ant}</span></div>
        ${rows.slice(0, sd.todas ? rows.length : LINHAS).map((e, i) => { const v = dvd(e, a);
          return `<div class="tr${sd.emp === e.sigla ? " sel" : ""}" role="row" data-demp="${esc(e.sigla)}" tabindex="0">
            <span class="rk num" role="cell">${i + 1}</span>
            <span class="nm" role="cell">${selo(e)}<span><b>${esc(e.nome)}</b><small>${esc(D.grupos[e.grupo] || "")}</small></span></span>
            <span class="c-l" role="cell"><i class="br"><i style="width:${Math.max(.5, v[2] / mU * 100)}%;background:${AZ}"></i></i><b class="num">${esc(curto(v[2]))}</b></span>
            <span class="n num" role="cell">${esc(curto(v[3]))}</span>
            <span class="n num" role="cell">${v[3] > 0 ? pct(v[2] / v[3], 0) : "—"}</span>
            <span class="n num${luc(e) < 0 ? " neg" : ""}" role="cell">${esc(curto(luc(e)))}</span></div>`; }).join("")}
      </div>${rows.length > LINHAS && !sd.todas ? `<button type="button" class="est-mais" data-dtodas>Mostrar as ${rows.length - LINHAS} restantes</button>` : ""}
      <p class="est-fonte">Fonte: ${esc(D.fonte)}, demonstração dos fluxos de caixa de cada empresa (dividendos e juros sobre capital próprio pagos à União e aos demais acionistas). É o dinheiro pago no ano, que em geral corresponde ao lucro do ano anterior. A separação entre União e demais acionistas existe a partir de 2020. O que a Petrobras paga ao BNDES e à BNDESPar não entra como pago à União.</p>`;
  }
  if (dv){
    dv.addEventListener("click", e => {
      const t = e.target.closest("[data-demp],[data-da],[data-dtodas]");
      if (!t) return;
      if (t.dataset.da) sd.barra = t.dataset.da;
      else if ("dtodas" in t.dataset) sd.todas = true;
      else { sd.emp = sd.emp === t.dataset.demp ? "" : t.dataset.demp; sd.barra = null; renderDiv(); dv.querySelector(".est-det")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
      renderDiv();
    });
    dv.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-demp],[data-da]")){ e.preventDefault(); e.target.click(); } });
    dv.addEventListener("change", e => {
      if (e.target.id === "divAno"){ sd.ano = e.target.value; sd.barra = null; sd.todas = false; }
      if (e.target.id === "divEmp"){ sd.emp = e.target.value; sd.barra = null; }
      renderDiv();
    });
  }

  let rt, larg = 0;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (D && el.clientWidth !== larg){ larg = el.clientWidth; render(); if (dv && anosDiv.length) renderDiv(); } }, 150); });

  fetch("data/estatais.json").then(r => r.ok ? r.json() : Promise.reject(r.status)).then(d => {
    D = d;
    const completos = d.anos.filter(a => !d.parcial[a]);
    st.ano = String(completos.length ? completos[completos.length - 1] : d.anos[d.anos.length - 1]);
    render();
    dividendos();
    const t = document.getElementById("estResumo");
    if (t){ const s = soma(d.empresas, st.ano);
      t.innerHTML = `<b>${esc(rs(s.luc))}</b> de lucro somado em ${st.ano} · <span class="pos">${s.nPos} com lucro</span> · <span class="neg">${s.nNeg} com prejuízo</span>`; }
  }).catch(() => { el.innerHTML = `<p class="est-fonte">Não foi possível carregar os dados das estatais agora. Tente recarregar a página.</p>`; });
})();
