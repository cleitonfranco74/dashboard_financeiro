/* Base comum das seções de ações da página Mercado (radar de queda, corretoras e topos): carrega
 * data/acoes.json uma vez, aplica as cotações do pregão (assets/cotacoes.js) e define os grupos. */
window.AcoesComum = (() => {
  const BANCOS = ["ITUB4", "ITUB3", "BBDC4", "BBDC3", "BBAS3", "SANB11", "BPAC11", "BNBR3", "BAZA3", "BRSR6", "ABCB4", "BMGB4", "BEES3", "ROXO34", "INBR32"];
  const ESTATAIS = ["PETR4", "PETR3", "BBAS3", "BBSE3", "CXSE3", "BNBR3", "BAZA3", "TELB4"];
  const ETFS = ["BOVA11", "IVVB11"];
  const GRUPOS = [["todas", "Todas"], ["bancos", "Bancos"], ["estatais", "Estatais"], ["demais", "Demais"]];
  const doGrupo = (c, g) => g === "todas" || (g === "bancos" ? BANCOS.includes(c) : g === "estatais" ? ESTATAIS.includes(c) : !BANCOS.includes(c) && !ESTATAIS.includes(c));
  let prom;
  /* {acoes: {código: ativo}, atualizado, intradia, todos: {categoria: {...}}} */
  const carregar = () => prom || (prom = fetch("data/acoes.json?h=" + Math.floor(Date.now() / 36e5), { cache: "no-cache" })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(d => window.Cotacoes ? Cotacoes.aplicar(d) : d)
    .then(d => ({ acoes: d.categorias?.acoes || {}, todos: d.categorias || {}, atualizado: d.atualizado, intradia: !!d.intradia })));
  const recarregar = () => { prom = null; return carregar(); };   // para conferir os alertas de tempos em tempos
  const consenso = r => r == null ? null : r <= 1.5 ? "Compra forte" : r <= 2.5 ? "Compra" : r <= 3.5 ? "Neutro" : r <= 4.5 ? "Venda" : "Venda forte";
  const corCons = r => r == null ? "var(--muted)" : r <= 2.5 ? "#34d399" : r <= 3.5 ? "#f5b83d" : "#ff6b6b";
  const quando = d => d.atualizado ? `${d.intradia ? "cotações de" : "atualizado em"} ${new Date(d.atualizado).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}` : "";
  /* alertas pessoais, guardados só neste navegador: {id, cat, cod, tipo, valor, criado, avisado} */
  const CHAVE = "lc-alertas-acoes";
  const TIPOS = { acima: "Preço acima de", abaixo: "Preço abaixo de", maxima: "Nova máxima de 52 semanas", ifr: "IFR de 14 dias acima de 70 (sobrecompra)", alvo: "Chegar ao preço-alvo médio" };
  const ler = () => { try { return JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { return []; } };
  const gravar = l => { try { localStorage.setItem(CHAVE, JSON.stringify(l)); } catch {} };
  const ativo = (d, al) => d.todos[al.cat]?.[al.cod];
  /* true quando a condição do alerta vale com as cotações carregadas */
  function disparou(al, d){
    const a = ativo(d, al); if (!a || !(a.preco > 0)) return false;
    return { acima: () => a.preco >= al.valor, abaixo: () => a.preco <= al.valor, maxima: () => a.max52 > 0 && a.preco >= a.max52 * .999,
      ifr: () => a.ifr >= 70, alvo: () => a.alvo > 0 && a.preco >= a.alvo }[al.tipo]?.() || false;
  }
  const brl = (v, moeda) => `${moeda === "USD" ? "US$" : "R$"} ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const descreve = (al, a) => `${al.cod} · ${TIPOS[al.tipo]}${al.tipo === "acima" || al.tipo === "abaixo" ? " " + brl(al.valor, a?.moeda) : ""}`;
  const alertas = { TIPOS, ler, gravar, disparou, descreve, ativo, brl };

  return { BANCOS, ESTATAIS, ETFS, GRUPOS, doGrupo, carregar, recarregar, consenso, corCons, quando, alertas };
})();
