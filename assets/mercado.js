/* Dados de mercado compartilhados pelas páginas.
 * 1. Lê data/mercado.json (gerado diariamente pela GitHub Action).
 * 2. Atualiza Selic, CDI, IPCA e Focus direto das APIs do Banco Central.
 * 3. Se tudo falhar, usa valores de referência e avisa.
 */
window.Mercado = (() => {
  const SGS = c => `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${c}/dados/ultimos/1?formato=json`;
  const FOCUS = ind => "https://olinda.bcb.gov.br/olinda/servico/Expectativas/versao/v1/odata/ExpectativasMercadoAnuais" +
    `?$top=40&$filter=Indicador%20eq%20'${ind}'%20and%20baseCalculo%20eq%200&$orderby=Data%20desc&$format=json&$select=Indicador,Data,DataReferencia,Mediana`;
  const REFERENCIA = {
    indicadores: { selic: { valor: 13.75, data: "2026-09-24" }, cdi: { valor: 13.65, data: "2026-09-24" }, ipca12: { valor: 4.22, data: "2026-08-01" } },
    focus: { data: "2026-09-18", selic: { 2026: 13.5, 2027: 12, 2028: 10.5, 2029: 10, 2030: 10 }, ipca: { 2026: 4.92, 2027: 4.3, 2028: 3.8, 2029: 3.5, 2030: 3.5 } },
  };

  async function buscar(url, ms = 9000) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), ms);
    try {
      const r = await fetch(url, { signal: c.signal, cache: "no-cache" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } finally { clearTimeout(t); }
  }
  const brIso = s => s.split("/").reverse().join("-");

  async function focusAoVivo(ind) {
    const j = await buscar(FOCUS(ind));
    const ultima = j.value.reduce((a, l) => (l.Data > a ? l.Data : a), "");
    const anos = {};
    for (const l of j.value) if (l.Data === ultima) anos[l.DataReferencia] = +l.Mediana;
    return { data: ultima, anos };
  }

  let promessa = null;
  function carregar() {
    if (promessa) return promessa;
    promessa = (async () => {
      let m = null;
      try { m = await buscar("data/mercado.json?h=" + Math.floor(Date.now() / 36e5)); m.fonte = "arquivo"; } catch { m = null; }
      m = m || { fonte: "referencia" };
      const vivo = { indicadores: false, focus: false };
      try {
        const [s, c, i] = await Promise.all([432, 4389, 13522].map(k => buscar(SGS(k))));
        const f = a => ({ valor: parseFloat(a[a.length - 1].valor), data: brIso(a[a.length - 1].data) });
        m.indicadores = { selic: f(s), cdi: f(c), ipca12: f(i) };
        vivo.indicadores = true;
      } catch { /* mantém o arquivo */ }
      try {
        // Dólar PTAX de venda ao vivo: acrescenta o último valor à série diária do arquivo, se for mais novo.
        const d = await buscar(SGS(1)), u = d[d.length - 1], data = brIso(u.data), valor = parseFloat(u.valor);
        m.bolsa = m.bolsa || {};
        const s = m.bolsa.dolar || { datas: [], valores: [] };
        if (!s.datas.length || data > s.datas[s.datas.length - 1]) { s.datas = [...s.datas, data]; s.valores = [...s.valores, valor]; }
        m.bolsa.dolar = s; vivo.dolar = true;
      } catch { /* mantém o arquivo */ }
      try {
        const [s, i] = await Promise.all([focusAoVivo("Selic"), focusAoVivo("IPCA")]);
        m.focus = { data: s.data > i.data ? s.data : i.data, selic: s.anos, ipca: i.anos };
        vivo.focus = true;
      } catch { /* mantém o arquivo */ }
      if (!m.indicadores) m.indicadores = REFERENCIA.indicadores;
      if (!m.focus) m.focus = REFERENCIA.focus;
      m.aoVivo = vivo.indicadores || vivo.focus;
      m.dolarAoVivo = !!vivo.dolar;
      m.referencia = m.fonte === "referencia" && !m.aoVivo;
      return m;
    })();
    return promessa;
  }

  /* Trajetórias mensais a partir do mês atual. t = 1 é o próximo mês. Retornam taxa anual (decimal). */
  const hoje = new Date(), ANO = hoje.getFullYear(), MES = hoje.getMonth();
  function selicPath(m, selicHoje) {
    const pts = [[0, selicHoje]];
    for (const [ano, v] of Object.entries(m.focus.selic).sort()) {
      const t = (+ano - ANO) * 12 + (11 - MES);
      if (t > 0) pts.push([t, v]);
    }
    return t => {
      if (t >= pts[pts.length - 1][0]) return pts[pts.length - 1][1] / 100;
      for (let i = 1; i < pts.length; i++) {
        const [t1, v1] = pts[i];
        if (t <= t1) { const [t0, v0] = pts[i - 1]; return (v0 + (v1 - v0) * (t - t0) / (t1 - t0)) / 100; }
      }
      return pts[pts.length - 1][1] / 100;
    };
  }
  function ipcaPath(m) {
    const anos = Object.keys(m.focus.ipca).map(Number).sort((a, b) => a - b);
    return t => {
      const ano = ANO + Math.floor((MES + t) / 12);
      const k = anos.filter(a => a <= ano).pop() ?? anos[0];
      return m.focus.ipca[k] / 100;
    };
  }
  /* Média geométrica anual de uma trajetória ao longo de n meses. */
  function mediaAnual(path, n) {
    let f = 1;
    for (let t = 1; t <= n; t++) f *= Math.pow(1 + path(t), 1 / 12);
    return Math.pow(f, 12 / n) - 1;
  }
  /* Título do Tesouro do tipo pedido com vencimento mais próximo de `anos` a partir de hoje. */
  function titulo(m, tipo, anos) {
    const lista = (m.tesouro?.titulos || []).filter(t => t.tipo === tipo && t.taxaCompra > 0);
    if (!lista.length) return null;
    const alvo = Date.now() + anos * 365.25 * 864e5;
    return lista.reduce((a, b) => (Math.abs(new Date(b.vencimento) - alvo) < Math.abs(new Date(a.vencimento) - alvo) ? b : a));
  }
  const dataBR = iso => iso ? iso.slice(0, 10).split("-").reverse().join("/") : "";

  return { carregar, selicPath, ipcaPath, mediaAnual, titulo, dataBR };
})();
