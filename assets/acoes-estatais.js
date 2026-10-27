/* Ações das estatais na bolsa, na página inicial, a partir de data/acoes.json (gravado todo dia útil
 * por scripts/atualizar_acoes.py com as cotações do Yahoo Finance). Cada ativo traz o preço de
 * fechamento, o fechamento anterior (ant), indicadores e os fechamentos mensais ajustados (c),
 * que incluem os proventos. Usa as funções de assets/estatais.js. */
(() => {
  const el = document.getElementById("acEst"), H = window.EstHelpers;
  if (!el || !H) return;
  const { esc, nf, pct } = H;
  const POS = "#34d399", NEG = "#ff6b6b", AZUL = "#5aa2ff", CINZA = "#8b93a7";
  /* código: [logo, controle, observação] */
  const LISTA = [
    ["PETR4", "petrobras.png", "União", "preferencial"],
    ["PETR3", "petrobras.png", "União", "ordinária (com voto)"],
    ["BBAS3", "bb.png", "União", ""],
    ["BBSE3", "bb.png", "Banco do Brasil", "seguros"],
    ["CXSE3", "caixa.png", "Caixa", "seguros"],
    ["BNBR3", "bnb.png", "União", ""],
    ["BAZA3", "basa.png", "União", ""],
    ["TELB4", "telebras.png", "União", "preferencial"],
  ];
  const st = { sel: "PETR4" };
  let A, IBOV;

  const brl = v => v == null ? "—" : `R$ ${nf(v, 2)}`;
  const sinal = (x, d = 1) => x == null || !isFinite(x) ? "—" : `${x > 0 ? "+" : ""}${pct(x, d)}`;
  const cor = x => x == null ? CINZA : x >= 0 ? POS : NEG;
  const bi = v => v == null ? "—" : v >= 1e12 ? `R$ ${nf(v / 1e12, 2)} tri` : v >= 1e9 ? `R$ ${nf(v / 1e9, v >= 1e11 ? 0 : 1)} bi` : `R$ ${nf(v / 1e6, 0)} mi`;
  const dia = a => a.ant ? a.preco / a.ant - 1 : null;
  const ret = (a, m) => a.c && a.c.length > m && a.c[a.c.length - 1 - m] > 0 ? a.c[a.c.length - 1] / a.c[a.c.length - 1 - m] - 1 : null;
  const mesRot = (ini, i) => { const [y, m] = ini.split("-").map(Number), t = y * 12 + m - 1 + i; return `${["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"][t % 12]}/${String(Math.floor(t / 12)).slice(2)}`; };

  /* linha dos últimos 12 meses, sem eixos, para os cartões */
  function mini(c){
    const v = c.slice(-13), W = 120, Hh = 34, mn = Math.min(...v), mx = Math.max(...v), sp = mx - mn || 1;
    const pts = v.map((x, i) => `${(i / (v.length - 1) * W).toFixed(1)},${(2 + (mx - x) / sp * (Hh - 4)).toFixed(1)}`).join(" ");
    return `<svg viewBox="0 0 ${W} ${Hh}" class="ae-mini" aria-hidden="true" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${cor(v[v.length - 1] / v[0] - 1)}" stroke-width="2" vector-effect="non-scaling-stroke"/></svg>`;
  }

  /* cinco anos, base 100 no primeiro mês comum, com o ETF do Ibovespa para comparar */
  function grafico(a, cod){
    const n = a.c.length, ib = IBOV && IBOV.c && IBOV.ini === a.ini && IBOV.c.length === n ? IBOV.c : null;
    const b = x => x.map(v => 100 * v / x[0]);
    const s1 = b(a.c), s2 = ib ? b(ib) : null, todos = s2 ? [...s1, ...s2] : s1;
    const W = Math.max(300, Math.min(1000, (el.clientWidth || 640) - 40)), Hh = W < 520 ? 200 : 250, pl = 40, pr = 8, pt = 14, pb = 24;
    const mn = Math.min(...todos), mx = Math.max(...todos), sp = mx - mn || 1;
    const x = i => pl + i / (n - 1) * (W - pl - pr), y = v => pt + (mx - v) / sp * (Hh - pt - pb);
    const linha = (s, c, w) => `<polyline points="${s.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round"/>`;
    const passo = sp > 300 ? 100 : sp > 120 ? 50 : sp > 50 ? 20 : 10, grade = [];
    for (let v = Math.ceil(mn / passo) * passo; v <= mx; v += passo) grade.push(`<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" class="${v === 100 ? "zero" : "gd"}"/><text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${v}</text>`);
    const marcas = [];
    for (let i = 0; i < n; i += W < 520 ? 24 : 12) marcas.push(`<text x="${x(i)}" y="${Hh - 6}" text-anchor="${i === 0 ? "start" : "middle"}" class="ax">${mesRot(a.ini, i)}</text>`);
    const f1 = s1[n - 1] / 100 - 1, f2 = s2 ? s2[n - 1] / 100 - 1 : null;
    return `<svg viewBox="0 0 ${W} ${Hh}" class="est-g" role="img" aria-label="${esc(cod)} em cinco anos, base 100">${grade.join("")}${s2 ? linha(s2, CINZA, 1.5) : ""}${linha(s1, AZUL, 2.4)}${marcas.join("")}</svg>
      <div class="dv-leg"><span><i style="background:${AZUL}"></i>${esc(cod)} (${sinal(f1, 0)})</span>${s2 ? `<span><i style="background:${CINZA}"></i>Ibovespa, pelo BOVA11 (${sinal(f2, 0)})</span>` : ""}</div>`;
  }

  function render(){
    const itens = LISTA.filter(([c]) => A[c]);
    if (!itens.length){ el.innerHTML = `<p class="est-fonte">As cotações das estatais ainda não foram carregadas.</p>`; return; }
    if (!A[st.sel]) st.sel = itens[0][0];
    const a = A[st.sel], meta = LISTA.find(([c]) => c === st.sel), d = dia(a), r12 = ret(a, 12);
    el.innerHTML = `
      <div class="ae-cards" role="list">${itens.map(([c, logo, ctl, obs]) => { const x = A[c], dx = dia(x), r = ret(x, 12);
        return `<button type="button" class="ae-c${c === st.sel ? " sel" : ""}" data-ae="${c}" role="listitem" aria-pressed="${c === st.sel}">
          <span class="ae-t">${H.selo({ logo, nome: x.nome, sigla: c })}<span><b>${esc(c)}</b><small>${esc(x.nome)}</small></span></span>
          <span class="ae-p"><b class="num">${esc(brl(x.preco))}</b><small class="num" style="color:${cor(dx)}">${dx == null ? "&nbsp;" : `${esc(sinal(dx, 2))} no dia`}</small></span>
          ${x.c && x.c.length > 13 ? mini(x.c) : ""}
          <small class="ae-r">12 meses: <b style="color:${cor(r)}">${esc(sinal(r, 0))}</b>${obs ? ` · ${esc(obs)}` : ""}</small></button>`; }).join("")}</div>
      <div class="est-det">
        <div class="est-dh">${H.selo({ logo: meta[1], nome: a.nome, sigla: st.sel }, true)}<div><h3>${esc(a.nome)} <small class="num">${esc(st.sel)}</small></h3><p>Controle: ${esc(meta[2])}${meta[3] ? ` · ação ${esc(meta[3])}` : ""}${a.data ? ` · fechamento de ${esc(new Date(a.data + "T12:00").toLocaleDateString("pt-BR"))}` : ""}</p></div></div>
        <div class="est-k">
          <div class="${d == null ? "" : d >= 0 ? "pos" : "neg"}"><span>Cotação</span><b>${esc(brl(a.preco))}</b><small>${d == null ? "variação do dia indisponível" : `${esc(sinal(d, 2))} no dia (anterior ${esc(brl(a.ant))})`}</small></div>
          <div class="${r12 == null ? "" : r12 >= 0 ? "pos" : "neg"}"><span>Retorno em 12 meses</span><b>${esc(sinal(r12, 1))}</b><small>com dividendos reinvestidos</small></div>
          <div class="az"><span>Dividend yield</span><b>${a.dy == null ? "—" : esc(pct(a.dy, 1))}</b><small>proventos dos últimos 12 meses</small></div>
          <div><span>P/L · P/VP</span><b>${a.pl == null ? "—" : esc(nf(a.pl, 1))} · ${a.pvp == null ? "—" : esc(nf(a.pvp, 2))}</b><small>valor de mercado ${esc(bi(a.vm))}</small></div>
        </div>
        <div class="est-gh"><h4>Cinco anos, base 100</h4></div>${a.c && a.c.length > 2 ? grafico(a, st.sel) : `<p class="est-fonte">Sem histórico mensal.</p>`}
      </div>
      <p class="est-fonte">Fonte: Yahoo Finance, fechamento do último pregão; atualizado todo dia útil depois do fechamento da B3 (${A.__atualizado ? `última atualização em ${esc(new Date(A.__atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }))}` : "data indisponível"}). O retorno usa os preços ajustados por proventos. Só as estatais com ações negociadas na bolsa aparecem aqui; a BB Seguridade e a Caixa Seguridade são controladas pelo Banco do Brasil e pela Caixa. A Eletrobras (hoje Axia Energia) foi privatizada em 2022. Não é recomendação de investimento.</p>`;
  }

  el.addEventListener("click", e => { const b = e.target.closest("[data-ae]"); if (!b) return; st.sel = b.dataset.ae; render(); if (innerWidth < 760) el.querySelector(".est-det")?.scrollIntoView({ behavior: "smooth", block: "start" }); });
  let rt, larg = 0;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (A && el.clientWidth !== larg){ larg = el.clientWidth; render(); } }, 150); });

  fetch("data/acoes.json?h=" + Math.floor(Date.now() / 36e5), { cache: "no-cache" }).then(r => r.ok ? r.json() : Promise.reject(r.status)).then(d => {
    A = { ...(d.categorias?.acoes || {}), __atualizado: d.atualizado };
    IBOV = A.BOVA11;
    render();
  }).catch(() => { el.innerHTML = `<p class="est-fonte">Não foi possível carregar as cotações agora. Tente recarregar a página.</p>`; });
})();
