/* Investimentos das estatais federais na página inicial, a partir de data/investimentos.json
 * (gravado por scripts/atualizar_investimentos.py com o Orçamento de Investimento da SEST/MGI).
 * Cada grupo é uma estatal de controle direto com suas subsidiárias; valores em R$ milhões e,
 * em cada ano da série, [aprovado (LOA + créditos), realizado]. Usa as funções de assets/estatais.js. */
(() => {
  const el = document.getElementById("inv"), H = window.EstHelpers;
  if (!el || !H) return;
  const { esc, curto, rs, pct, selo, LINHAS } = H;
  const VERDE = "#4fd1c5";
  const st = { ano: null, grupo: "", semPetro: false, barra: null, todas: false };
  let D;

  const grupos = () => D.grupos.filter(g => !(st.semPetro && g.sigla === "PETROBRAS"));
  const rotAno = a => D.parcial[a] ? `${a} (${D.parcial[a]})` : String(a);
  const soma = (gs, a) => gs.reduce((s, g) => { const v = g.serie[a]; if (v){ s.d += v[0]; s.r += v[1]; if (v[1] > 0) s.n++; } return s; }, { d: 0, r: 0, n: 0 });
  const somaReg = (gs, a) => { const t = {}; gs.forEach(g => Object.entries(g.regioes[a] || {}).forEach(([k, x]) => t[k] = (t[k] || 0) + x)); return t; };

  function grafico(serie){
    const anos = D.anos.map(String), W = Math.max(300, Math.min(1000, (el.clientWidth || 640) - 40)), Hh = W < 520 ? 200 : 240, pt = 26, pb = 26;
    const max = Math.max(1, ...anos.map(a => serie[a] ? Math.max(...serie[a]) : 0));
    const y = v => pt + (1 - v / max) * (Hh - pt - pb), bw = W / anos.length, gap = Math.min(16, bw * .28);
    const sel = st.barra ?? (serie[st.ano] ? st.ano : anos.filter(a => serie[a]).pop());
    const bars = anos.map((a, i) => {
      const v = serie[a], x = i * bw + gap / 2, w = bw - gap, on = a === sel;
      const lbl = `<text x="${x + w / 2}" y="${Hh - 8}" text-anchor="middle" class="ax">${bw < 44 ? "’" + a.slice(2) : a}${D.parcial[a] ? "*" : ""}</text>`;
      if (!v) return lbl;
      return `<g class="b${on ? " on" : ""}" data-ia="${a}" tabindex="0" role="button" aria-label="${a}: ${esc(rs(v[1]))} investidos de ${esc(rs(v[0]))} aprovados">
        <rect x="${x - gap / 2}" y="${pt - 18}" width="${bw}" height="${Hh - pt + 18}" fill="transparent"/>
        <rect x="${x}" y="${y(v[0])}" width="${w}" height="${Hh - pb - y(v[0])}" rx="4" fill="${VERDE}" opacity=".16"/>
        <rect class="bv" x="${x + w * .18}" y="${y(v[1])}" width="${w * .64}" height="${Math.max(1.5, Hh - pb - y(v[1]))}" rx="4" fill="${VERDE}" opacity="${D.parcial[a] ? .45 : on ? 1 : .8}"/>
        ${on ? `<text x="${x + w / 2}" y="${Math.min(y(v[0]), y(v[1])) - 6}" text-anchor="middle" class="vl">${esc(curto(v[1]))}</text>` : ""}${lbl}</g>`;
    }).join("");
    const v = serie[sel];
    return `<svg viewBox="0 0 ${W} ${Hh}" class="est-g" role="group" aria-label="Investimento por ano"><line x1="0" x2="${W}" y1="${Hh - pb}" y2="${Hh - pb}" class="zero"/>${bars}</svg>
      <div class="dv-leg"><span><i style="background:${VERDE}"></i>Realizado</span><span><i style="background:${VERDE};opacity:.25"></i>Aprovado no orçamento (LOA + créditos)</span></div>
      <p class="est-cap">${v ? `<b>${esc(rotAno(sel))}</b>: <b style="color:${VERDE}">${esc(rs(v[1]))}</b> investidos, de ${esc(rs(v[0]))} aprovados${v[0] > 0 ? ` (execução de ${pct(v[1] / v[0], 0)})` : ""}.` : "Sem dados para este ano."}
      ${Object.keys(D.parcial).length ? `<br><small>* Ano em andamento: realizado acumulado ${Object.entries(D.parcial).map(([a, p]) => `${p} de ${a}`).join(", ")}.</small>` : ""}</p>`;
  }

  const barras = (itens, cor) => {
    const max = Math.max(1, ...itens.map(i => i[1]));
    return `<div class="iv-bars">${itens.map(([nome, v, extra]) => `<div class="iv-b"><span title="${esc(nome)}">${esc(nome)}</span><i class="br"><i style="width:${Math.max(.5, v / max * 100)}%;background:${cor}"></i></i><b class="num">${esc(curto(v))}</b>${extra ? `<small>${extra}</small>` : ""}</div>`).join("")}</div>`;
  };

  function render(){
    const a = st.ano, ant = String(+a - 1), gs = grupos();
    const g = st.grupo && D.grupos.find(x => x.sigla === st.grupo);
    const base = g ? [g] : gs;
    const s = soma(base, a), sa = soma(base, ant), tot = soma(gs, a);
    const serie = Object.fromEntries(D.anos.map(String).map(x => { const z = soma(base, x); return [x, z.d || z.r ? [z.d, z.r] : null]; }));
    const varia = sa.r > 0 && serie[ant] ? (s.r - sa.r) / sa.r : null;
    const rows = gs.filter(x => x.serie[a]?.[1] > 0).sort((x, y) => y.serie[a][1] - x.serie[a][1]);
    const maior = rows[0];
    const reg = Object.entries(somaReg(base, a)).sort((x, y) => y[1] - x[1]).map(([k, v]) => [D.regioes[k] || k, v, s.r > 0 ? (v / s.r < .005 ? "menos de 1%" : pct(v / s.r, 0)) : ""]);
    const opcoes = D.grupos.filter(x => Object.values(x.serie).some(v => v[1] > 0)).sort((x, y) => x.nome.localeCompare(y.nome, "pt-BR"));
    el.innerHTML = `
      <div class="est-ctl">
        <label class="f"><span>Ano</span><select id="invAno">${D.anos.slice().reverse().map(x => `<option value="${x}" ${String(x) === a ? "selected" : ""}>${esc(rotAno(x))}</option>`).join("")}</select></label>
        <label class="f"><span>Estatal</span><select id="invGr"><option value="">Todas as estatais</option>${opcoes.map(x => `<option value="${esc(x.sigla)}" ${x.sigla === st.grupo ? "selected" : ""}>${esc(x.nome)}</option>`).join("")}</select></label>
        <label class="f tg"><input type="checkbox" id="invPetro" ${st.semPetro ? "checked" : ""}><span class="sw" aria-hidden="true"></span><span><b>Excluir Petrobras</b><small>responde pela maior parte do investimento</small></span></label>
      </div>
      <div class="est-det">
        ${g ? `<div class="est-dh">${selo(g, true)}<div><h3>${esc(g.nome)}</h3><p>${g.empresas ? "Com as subsidiárias" : "Orçamento de Investimento"} · ${esc(rotAno(a))}</p></div></div>`
          : `<div class="est-dh"><div><h3>Todas as estatais${st.semPetro ? " <small>sem Petrobras</small>" : ""}</h3><p>Orçamento de Investimento de ${esc(rotAno(a))}, com as subsidiárias.</p></div></div>`}
        <div class="est-k">
          <div class="iv"><span>Investimento realizado</span><b>${esc(rs(s.r))}</b><small>${varia != null ? `${varia >= 0 ? "+" : ""}${pct(varia, 0)} sobre ${ant}` : "&nbsp;"}</small></div>
          <div><span>Aprovado no orçamento</span><b>${esc(rs(s.d))}</b><small>${s.d > 0 ? `execução de ${pct(s.r / s.d, 0)}` : "&nbsp;"}</small></div>
          ${g ? `<div><span>Fatia no total das estatais</span><b>${tot.r > 0 ? pct(s.r / soma(D.grupos, a).r, 1) : "—"}</b><small>de ${esc(rs(soma(D.grupos, a).r))} investidos por todas</small></div>`
            : `<div><span>Maior investidora</span><b class="nm1">${maior ? esc(maior.nome) : "—"}</b><small>${maior ? `${esc(rs(maior.serie[a][1]))} · ${pct(maior.serie[a][1] / (s.r || 1), 0)} do total` : "&nbsp;"}</small></div>
          <div><span>Estatais que investiram</span><b>${s.n}</b><small>grupos com investimento no ano</small></div>`}
        </div>
        <div class="est-gh"><h4>Investimento ${g ? "" : "somado "}ano a ano</h4></div>${grafico(serie)}
        <div class="iv-cols">
          <div><h4>Onde foi investido</h4>${reg.length ? barras(reg, VERDE) : `<p class="est-fonte">Sem investimento realizado no ano.</p>`}</div>
          ${!g && rows.length ? `<div><h4>Maiores investidoras</h4>${barras(rows.slice(0, 7).map(x => [x.nome, x.serie[a][1], s.r > 0 ? `${x.serie[a][1] / s.r < .005 ? "menos de 1%" : pct(x.serie[a][1] / s.r, 0)} do total` : ""]), "#5aa2ff")}</div>` : ""}
          ${g ? `<div><h4>Principais projetos</h4>${(g.acoes[a] || []).length ? barras(g.acoes[a].map(([t, r, d]) => [t, r, d > 0 ? `${pct(r / d, 0)} do aprovado` : ""]), "#f5b83d") : `<p class="est-fonte">Sem projetos com investimento realizado no ano.</p>`}</div>` : ""}
          ${g && g.empresas && (g.empresas[a] || []).length > 1 ? `<div><h4>Por empresa do grupo</h4>${barras(g.empresas[a].map(([, n, r]) => [n, r]), "#5aa2ff")}</div>` : ""}
        </div>
      </div>
      <div class="est-th"><h4>Quanto cada estatal investiu em ${esc(rotAno(a))}</h4><span>com as subsidiárias · clique numa linha para ver os projetos</span></div>
      <div class="est-tb iv-tb" role="table" aria-label="Investimento por estatal em ${esc(rotAno(a))}">
        <div class="tr th" role="row"><span role="columnheader">#</span><span role="columnheader">Empresa</span><span role="columnheader" class="c-l">Realizado</span><span role="columnheader" class="n">Aprovado</span><span role="columnheader" class="n">Execução</span><span role="columnheader" class="n">Sobre ${ant}</span></div>
        ${rows.slice(0, st.todas ? rows.length : LINHAS).map((x, i) => { const v = x.serie[a], p = x.serie[ant], mx = rows[0].serie[a][1];
          const vr = p && p[1] > 0 ? (v[1] - p[1]) / p[1] : null;
          return `<div class="tr${st.grupo === x.sigla ? " sel" : ""}" role="row" data-ig="${esc(x.sigla)}" tabindex="0">
            <span class="rk num" role="cell">${i + 1}</span>
            <span class="nm" role="cell">${selo(x)}<span><b>${esc(x.nome)}</b><small>${x.empresas ? "com subsidiárias" : "&nbsp;"}</small></span></span>
            <span class="c-l" role="cell"><i class="br"><i style="width:${Math.max(.5, v[1] / mx * 100)}%;background:${VERDE}"></i></i><b class="num">${esc(curto(v[1]))}</b></span>
            <span class="n num" role="cell">${esc(curto(v[0]))}</span>
            <span class="n num" role="cell">${v[0] > 0 ? pct(v[1] / v[0], 0) : "—"}</span>
            <span class="n num${vr != null && vr < 0 ? " neg" : ""}" role="cell">${vr == null ? "—" : `${vr >= 0 ? "+" : ""}${pct(vr, 0)}`}</span></div>`; }).join("")}
      </div>${rows.length > LINHAS && !st.todas ? `<button type="button" class="est-mais" data-itodas>Mostrar as ${rows.length - LINHAS} restantes</button>` : ""}
      <p class="est-fonte">Fonte: ${esc(D.fonte)}. O Orçamento de Investimento reúne o que as estatais aplicam em obras, equipamentos, tecnologia e expansão, com recursos próprios, empréstimos ou aportes da União; não inclui custeio. "Aprovado" é a Lei Orçamentária Anual mais os créditos do ano; "realizado" é o executado. Cada estatal aparece com suas subsidiárias (a Petrobras com Transpetro, TBG e as empresas no exterior, por exemplo); o grupo Eletrobras aparece até 2022, quando foi privatizado. Atualizado em ${new Date(D.atualizado + "T12:00").toLocaleDateString("pt-BR")}.</p>`;
  }

  el.addEventListener("click", e => {
    const t = e.target.closest("[data-ig],[data-ia],[data-itodas]");
    if (!t) return;
    if (t.dataset.ia) st.barra = t.dataset.ia;
    else if ("itodas" in t.dataset) st.todas = true;
    else { st.grupo = st.grupo === t.dataset.ig ? "" : t.dataset.ig; st.barra = null; render(); el.querySelector(".est-det")?.scrollIntoView({ behavior: "smooth", block: "nearest" }); return; }
    render();
  });
  el.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-ig],[data-ia]")){ e.preventDefault(); e.target.click(); } });
  el.addEventListener("change", e => {
    if (e.target.id === "invAno"){ st.ano = e.target.value; st.barra = null; st.todas = false; }
    if (e.target.id === "invGr"){ st.grupo = e.target.value; st.barra = null; }
    if (e.target.id === "invPetro"){ st.semPetro = e.target.checked; if (st.semPetro && st.grupo === "PETROBRAS") st.grupo = ""; }
    render();
  });
  let rt, larg = 0;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (D && el.clientWidth !== larg){ larg = el.clientWidth; render(); } }, 150); });

  fetch("data/investimentos.json").then(r => r.ok ? r.json() : Promise.reject(r.status)).then(d => {
    D = d;
    const completos = d.anos.filter(a => !d.parcial[a]);
    st.ano = String((completos.length ? completos : d.anos).slice(-1)[0]);
    render();
  }).catch(() => { el.innerHTML = `<p class="est-fonte">Não foi possível carregar os investimentos agora. Tente recarregar a página.</p>`; });
})();
