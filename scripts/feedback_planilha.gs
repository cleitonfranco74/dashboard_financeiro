/**
 * Recebe o feedback dos sites Livro-Caixa e Boi na Bolsa e grava numa Planilha Google.
 * Instalação (uma vez):
 *   1. Crie uma planilha vazia em sheets.new e abra Extensões > Apps Script.
 *   2. Apague o conteúdo do editor, cole este arquivo e salve.
 *   3. Implantar > Nova implantação > tipo "App da Web": Executar como "Eu";
 *      Quem pode acessar "Qualquer pessoa". Autorize e copie o URL que termina em /exec.
 *   4. Coloque esse URL na constante PLANILHA de feedback.js, nos dois sites.
 * Ao mudar este código, use Implantar > Gerenciar implantações > editar > Nova versão,
 * para manter o mesmo URL.
 */
const ABA = "Respostas";
const AVISAR_POR_EMAIL = true;   // e-mail para o dono da planilha a cada opinião da caixa ou 👎 com comentário
const CABECALHO = ["Data", "Site", "Página", "Tipo", "Ferramenta", "Nota", "Útil", "Perfil", "Comentário", "E-mail para resposta"];

function doPost(e) {
  const trava = LockService.getScriptLock();
  trava.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (d._honey) return json({ ok: true });                   // robô
    const util = d.tipo === "util";
    const nota = Math.round(Number(d.nota));
    const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email || "")) ? corta(d.email, 120) : "";
    const linha = [
      new Date(), corta(d.site, 80), corta(d.pagina, 160),
      util ? "Ferramenta útil?" : "Caixa de opinião", corta(d.ferramenta, 120),
      nota >= 1 && nota <= 5 ? nota : "", util ? (d.util ? "Sim" : "Não") : "",
      corta(d.perfil, 80), corta(d.comentario, 2000), email,
    ];
    aba().appendRow(linha.map(seguro));
    CacheService.getScriptCache().remove("resumo");
    if (AVISAR_POR_EMAIL && (!util || linha[8])) avisar(linha);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, erro: String(err) });
  } finally {
    trava.releaseLock();
  }
}

/* Resumo público: nota média e número de avaliações por site (sem comentários nem e-mails). */
function doGet() {
  const cache = CacheService.getScriptCache();
  let r = cache.get("resumo");
  if (!r) { r = JSON.stringify(resumo()); cache.put("resumo", r, 600); }
  return ContentService.createTextOutput(r).setMimeType(ContentService.MimeType.JSON);
}

function resumo() {
  const sites = {};
  aba().getDataRange().getValues().slice(1).forEach(function (l) {
    const site = l[1], nota = Number(l[5]);
    if (!(nota >= 1 && nota <= 5)) return;
    if (!sites[site]) sites[site] = { n: 0, soma: 0 };
    sites[site].n++; sites[site].soma += nota;
  });
  Object.keys(sites).forEach(function (s) {
    sites[s] = { n: sites[s].n, media: Math.round(sites[s].soma / sites[s].n * 10) / 10 };
  });
  return { ok: true, sites: sites };
}

function avisar(l) {
  const assunto = "Feedback " + l[1] + ": " + (l[5] ? l[5] + "/5" : l[6] ? "útil? " + l[6] : "sem nota") + (l[4] ? " · " + l[4] : "") + (l[7] ? " · " + l[7] : "");
  const corpo = CABECALHO.map(function (c, i) { return c + ": " + (i === 0 ? l[0].toLocaleString("pt-BR") : l[i] || "—"); }).join("\n")
    + "\n\nTodas as respostas: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const msg = { to: Session.getEffectiveUser().getEmail(), subject: assunto, body: corpo };
  if (l[9]) msg.replyTo = l[9];
  MailApp.sendEmail(msg);
}

function aba() {
  const pl = SpreadsheetApp.getActiveSpreadsheet();
  let a = pl.getSheetByName(ABA);
  if (!a) {
    a = pl.insertSheet(ABA);
    a.appendRow(CABECALHO);
    a.setFrozenRows(1);
    a.getRange(1, 1, 1, CABECALHO.length).setFontWeight("bold");
  }
  return a;
}

const corta = (s, n) => String(s == null ? "" : s).trim().slice(0, n);
/* texto que começa com = + - @ viraria fórmula na planilha */
const seguro = v => typeof v === "string" && /^[=+\-@]/.test(v) ? "'" + v : v;
const json = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
