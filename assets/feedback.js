/* Caixa de feedback: botão fixo no canto da tela que abre um formulário com nota (1 a 5),
 * perfil de quem usa e comentário. O envio vai por e-mail ao autor, pelo FormSubmit
 * (formsubmit.co, gratuito e sem cadastro). Nada é guardado no site.
 * Uso: <script src="feedback.js" data-site="Nome do site" data-cor="#c8f250" defer></script> */
(() => {
  const DESTINO = "https://formsubmit.co/ajax/cleitonfranco@unemat.br";
  const me = document.currentScript;
  const SITE = me?.dataset.site || document.title, COR = me?.dataset.cor || "#c8f250";
  const PERFIS = ["Aluno(a) de graduação", "Aluno(a) de pós-graduação", "Professor(a)", "Investidor(a) ou poupador(a)", "Produtor(a) rural", "Profissional do mercado financeiro", "Outro"];
  const ROTULOS = ["", "Ruim", "Fraco", "Bom", "Muito bom", "Excelente"];

  const css = `
  .fb-btn{position:fixed;right:18px;bottom:18px;z-index:9998;display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:999px;border:0;
    background:${COR};color:#0b0d06;font:700 14px/1 system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;box-shadow:0 10px 30px -8px rgba(0,0,0,.6)}
  .fb-btn:hover{filter:brightness(1.06)}
  .fb-btn:focus-visible,.fb-box :focus-visible{outline:2px solid ${COR};outline-offset:3px}
  @media print{.fb-btn,.fb-box{display:none!important}}
  @media (max-width:600px){body{padding-bottom:64px}}
  .fb-box{position:fixed;right:18px;bottom:74px;z-index:9999;width:min(380px,calc(100vw - 36px));max-height:calc(100vh - 100px);overflow:auto;
    background:#121412;color:#eef0ea;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:18px;box-shadow:0 24px 60px -12px rgba(0,0,0,.75);
    font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}
  .fb-box[hidden]{display:none}
  .fb-box h2{margin:0 0 4px;font-size:17px;font-weight:800;letter-spacing:-.01em}
  .fb-box p{margin:0 0 12px;color:#a7ada2;font-size:13px}
  .fb-box label{display:block;margin:12px 0 6px;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#a7ada2}
  .fb-stars{display:flex;gap:4px;align-items:center}
  .fb-stars button{border:0;background:none;padding:2px;font-size:28px;line-height:1;cursor:pointer;color:#3a3f38}
  .fb-stars button.on{color:${COR}}
  .fb-stars span{margin-left:8px;font-size:13px;color:#a7ada2}
  .fb-box select,.fb-box textarea{width:100%;box-sizing:border-box;background:#0b0c0b;color:#eef0ea;border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:9px 10px;font:inherit}
  .fb-box textarea{min-height:96px;resize:vertical}
  .fb-row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px}
  .fb-send{border:0;border-radius:999px;background:${COR};color:#0b0d06;font-weight:800;padding:10px 18px;cursor:pointer;font:inherit;font-weight:800}
  .fb-send[disabled]{opacity:.55;cursor:default}
  .fb-close{position:absolute;top:10px;right:12px;border:0;background:none;color:#a7ada2;font-size:22px;line-height:1;cursor:pointer}
  .fb-msg{font-size:13px;color:#a7ada2}
  .fb-msg.err{color:#ff7a6b}
  .fb-ok{text-align:center;padding:18px 4px}
  .fb-ok b{display:block;font-size:30px;margin-bottom:6px}
  .fb-hp{position:absolute;left:-5000px}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const btn = document.createElement("button");
  btn.className = "fb-btn"; btn.type = "button"; btn.setAttribute("aria-haspopup", "dialog"); btn.setAttribute("aria-controls", "fb-box");
  btn.innerHTML = `<span aria-hidden="true">💬</span> Dê sua opinião`;
  const box = document.createElement("div");
  box.className = "fb-box"; box.id = "fb-box"; box.hidden = true; box.setAttribute("role", "dialog"); box.setAttribute("aria-labelledby", "fb-tit");
  const form = () => `
    <button type="button" class="fb-close" aria-label="Fechar">×</button>
    <h2 id="fb-tit">O que você achou?</h2>
    <p>Sua opinião ajuda a melhorar o ${SITE.replace(/[<>&]/g,"")}. O envio é anônimo.</p>
    <form novalidate>
      <label id="fb-nl">Nota</label>
      <div class="fb-stars" role="radiogroup" aria-labelledby="fb-nl">${[1,2,3,4,5].map(n=>`<button type="button" role="radio" aria-checked="false" data-n="${n}" aria-label="${n} de 5: ${ROTULOS[n]}">★</button>`).join("")}<span id="fb-rot">escolha de 1 a 5</span></div>
      <label for="fb-perfil">Você é</label>
      <select id="fb-perfil" name="perfil"><option value="">Selecione</option>${PERFIS.map(p=>`<option>${p}</option>`).join("")}</select>
      <label for="fb-txt">Comentário</label>
      <textarea id="fb-txt" name="comentario" maxlength="2000" placeholder="O que foi útil? O que faltou ou não funcionou? Sugestões são bem-vindas."></textarea>
      <input class="fb-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="fb-row"><span class="fb-msg" id="fb-msg" aria-live="polite"></span><button type="submit" class="fb-send">Enviar</button></div>
    </form>`;
  box.innerHTML = form();
  document.body.append(btn, box);

  let nota = 0;
  const abrir = () => { box.hidden = false; btn.setAttribute("aria-expanded", "true"); (box.querySelector(".fb-stars button") || box.querySelector(".fb-close")).focus(); };
  const fechar = () => { box.hidden = true; btn.setAttribute("aria-expanded", "false"); btn.focus(); };
  const pinta = n => box.querySelectorAll(".fb-stars button").forEach(b => { const on = +b.dataset.n <= n; b.classList.toggle("on", on); b.setAttribute("aria-checked", String(+b.dataset.n === n)); });
  btn.addEventListener("click", () => box.hidden ? abrir() : fechar());
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !box.hidden) fechar(); });
  box.addEventListener("click", e => {
    if (e.target.closest(".fb-close")) return fechar();
    const s = e.target.closest(".fb-stars button");
    if (s){ nota = +s.dataset.n; pinta(nota); box.querySelector("#fb-rot").textContent = `${nota} de 5 · ${ROTULOS[nota]}`; box.querySelector("#fb-msg").textContent = ""; }
  });
  box.addEventListener("input", () => { const m = box.querySelector("#fb-msg"); if (m?.classList.contains("err")) m.textContent = ""; });
  box.addEventListener("mouseover", e => { const s = e.target.closest(".fb-stars button"); if (s) pinta(+s.dataset.n); });
  box.addEventListener("mouseout", e => { if (e.target.closest(".fb-stars")) pinta(nota); });
  box.addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target, msg = box.querySelector("#fb-msg"), envia = box.querySelector(".fb-send");
    const comentario = f.comentario.value.trim(), perfil = f.perfil.value;
    if (f._honey.value) return;                                   // robô preencheu o campo escondido
    if (!nota && !comentario){ msg.className = "fb-msg err"; msg.textContent = "Dê uma nota ou escreva um comentário."; return; }
    envia.disabled = true; msg.className = "fb-msg"; msg.textContent = "Enviando…";
    const pagina = location.pathname.split("/").pop() || "index.html";
    try {
      const r = await fetch(DESTINO, { method: "POST", headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `Feedback ${SITE}: ${nota ? nota + "/5" : "sem nota"}${perfil ? " · " + perfil : ""}`,
          _template: "table", _captcha: "false",
          Site: SITE, "Página": pagina + location.hash, Nota: nota ? `${nota} de 5 (${ROTULOS[nota]})` : "não informada",
          Perfil: perfil || "não informado", "Comentário": comentario || "(sem comentário)",
          Data: new Date().toLocaleString("pt-BR"),
        }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || String(j.success) !== "true") throw new Error(j.message || "falha");
      box.innerHTML = `<button type="button" class="fb-close" aria-label="Fechar">×</button><div class="fb-ok" role="status"><b aria-hidden="true">🙏</b><h2 id="fb-tit">Obrigado!</h2><p>Seu feedback foi enviado.</p></div>`;
      box.querySelector(".fb-close").focus();
      setTimeout(() => { if (!box.hidden) fechar(); box.innerHTML = form(); nota = 0; }, 4000);
    } catch {
      envia.disabled = false; msg.className = "fb-msg err"; msg.textContent = "Não foi possível enviar agora. Tente de novo em instantes.";
    }
  });
})();
