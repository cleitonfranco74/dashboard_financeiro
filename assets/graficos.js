/* Utilitários de formatação e gráfico de linhas compartilhados. */
window.G = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const brl0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const money = v => (v < 0 ? "−" : "") + brl0.format(Math.abs(v));
  const nf = (v, d = 0) => v.toLocaleString("pt-BR", { maximumFractionDigits: d });
  const pct = (v, d = 1) => (v < 0 ? "−" : "") + (Math.abs(v) * 100).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }) + "%";
  const aToM = r => Math.pow(1 + r, 1 / 12) - 1;
  const mToA = r => Math.pow(1 + r, 12) - 1;

  function niceTicks(min, max, n = 5) {
    if (max === min) max = min + 1;
    const raw = (max - min) / n, mag = Math.pow(10, Math.floor(Math.log10(raw))), nr = raw / mag;
    const step = (nr <= 1 ? 1 : nr <= 2 ? 2 : nr <= 2.5 ? 2.5 : nr <= 5 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, out = [];
    for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 1e6) / 1e6);
    return out;
  }
  function compact(v) {
    const a = Math.abs(v), s = v < 0 ? "−" : "";
    if (a >= 1e6) return s + nf(a / 1e6, a >= 1e7 ? 0 : 1) + " mi";
    if (a >= 1e3) return s + nf(a / 1e3, a >= 1e4 ? 0 : 1) + " mil";
    return s + nf(a);
  }

  const charts = new Map();
  function lineChart(el, spec) { charts.set(el, spec); drawLine(el, spec); }
  function drawLine(el, spec) {
    const { xs, series, xFmt, tipTitle, height = 270, yFmt = compact, vFmt = money, dashed = [] } = spec;
    const W = Math.max(280, el.clientWidth || 640), H = height, m = { t: 14, r: 14, b: 30, l: 58 };
    const all = series.flatMap(s => s.values.filter(v => v != null && isFinite(v)));
    const ticks = niceTicks(spec.zero === false ? Math.min(...all) : Math.min(0, ...all), Math.max(...all), 5);
    const y0 = ticks[0], y1 = ticks[ticks.length - 1], x0 = xs[0], x1 = xs[xs.length - 1] || 1;
    const X = v => m.l + (v - x0) / ((x1 - x0) || 1) * (W - m.l - m.r);
    const Y = v => m.t + (y1 - v) / ((y1 - y0) || 1) * (H - m.t - m.b);
    let g = "";
    for (const t of ticks) {
      g += `<line x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}" stroke="var(${t === 0 ? "--axis" : "--line"})"/>`;
      g += `<text class="tn" x="${m.l - 8}" y="${Y(t) + 3.5}" text-anchor="end">${yFmt(t)}</text>`;
    }
    const xt = spec.xTicks || niceTicks(x0, x1, Math.max(3, Math.min(8, Math.floor((W - m.l) / 80)))).filter(v => v >= x0 && v <= x1);
    for (const t of xt) g += `<text x="${X(t)}" y="${H - 9}" text-anchor="middle">${xFmt(t)}</text>`;
    series.forEach((s, si) => {
      let d = "", pen = false;
      s.values.forEach((v, i) => { if (v == null || !isFinite(v)) { pen = false; return; } d += (pen ? "L" : "M") + X(xs[i]).toFixed(1) + "," + Y(v).toFixed(1); pen = true; });
      const dash = dashed.includes(si) ? ` stroke-dasharray="6 5"` : "";
      g += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${dash}/>`;
      let li = s.values.length - 1; while (li >= 0 && (s.values[li] == null || !isFinite(s.values[li]))) li--;
      if (li >= 0 && !dashed.includes(si)) g += `<circle cx="${X(xs[li])}" cy="${Y(s.values[li])}" r="4" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`;
    });
    g += `<g class="hov" style="display:none"><line class="cx" y1="${m.t}" y2="${H - m.b}" stroke="var(--axis)"/>${series.map(s => `<circle r="4.5" fill="${s.color}" stroke="var(--surface)" stroke-width="2"/>`).join("")}</g>`;
    g += `<rect class="ov" x="${m.l}" y="0" width="${W - m.l - m.r}" height="${H}" fill="transparent"/>`;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" height="${H}" role="img" aria-label="${esc(spec.label || "Gráfico")}">${g}</svg><div class="tip" hidden></div>`;
    const svg = $("svg", el), tip = $(".tip", el), hov = $(".hov", el), dots = hov.querySelectorAll("circle");
    const move = e => {
      const b = svg.getBoundingClientRect(), px = (e.clientX - b.left) * (W / b.width);
      const xv = x0 + (px - m.l) / (W - m.l - m.r) * (x1 - x0);
      let i = 0, best = Infinity; xs.forEach((x, k) => { const d = Math.abs(x - xv); if (d < best) { best = d; i = k; } });
      hov.style.display = ""; const cx = X(xs[i]); $(".cx", hov).setAttribute("x1", cx); $(".cx", hov).setAttribute("x2", cx);
      series.forEach((s, k) => { const v = s.values[i]; if (v == null || !isFinite(v)) { dots[k].style.display = "none"; return; } dots[k].style.display = ""; dots[k].setAttribute("cx", cx); dots[k].setAttribute("cy", Y(v)); });
      tip.hidden = false;
      tip.innerHTML = `<div class="t">${esc(tipTitle(xs[i]))}</div>` + series.map(s => `<div class="r"><span><i style="background:${s.color}"></i>${esc(s.name)}</span><span class="num">${s.values[i] == null || !isFinite(s.values[i]) ? "—" : vFmt(s.values[i])}</span></div>`).join("");
      const lx = (cx / W) * b.width; let x = lx + 14; if (x + tip.offsetWidth > b.width) x = lx - tip.offsetWidth - 14;
      tip.style.left = Math.max(0, x) + "px"; tip.style.top = "8px";
    };
    const ov = $(".ov", el);
    ov.addEventListener("mousemove", move);
    ov.addEventListener("touchstart", e => move(e.touches[0]), { passive: true });
    ov.addEventListener("touchmove", e => move(e.touches[0]), { passive: true });
    ov.addEventListener("mouseleave", () => { tip.hidden = true; hov.style.display = "none"; });
  }
  let rsT;
  new ResizeObserver(() => {
    clearTimeout(rsT);
    rsT = setTimeout(() => { for (const [el, spec] of charts) if (el.isConnected) (spec.draw || drawLine)(el, spec); else charts.delete(el); }, 80);
  }).observe(document.body);
  const legend = items => `<div class="legend">${items.map(([n, c, d]) => `<span><i style="background:${d ? `repeating-linear-gradient(90deg,${c} 0 4px,transparent 4px 7px)` : c}"></i>${esc(n)}</span>`).join("")}</div>`;

  return { $, esc, money, nf, pct, aToM, mToA, niceTicks, compact, lineChart, legend, charts };
})();
