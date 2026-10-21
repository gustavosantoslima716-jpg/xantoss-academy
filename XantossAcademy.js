/* Xantoss Academy v0.6 — independent visual bookmarklet module.
   No credentials, answer extraction, network requests, or automatic submission. */
(function () {
  "use strict";
  if (window.__xantossAcademyCleanup) {
    window.__xantossAcademyCleanup();
  }
  const root = document.createElement("div");
  root.id = "xantoss-academy-root";
  document.body.appendChild(root);
  const shadow = root.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.id = "xantoss-academy-page-theme";
  style.textContent = `
    html.xantoss-academy-dark, html.xantoss-academy-dark body {
      background: #080f20 !important; color: #e5eeff !important;
    }
    html.xantoss-academy-dark main, html.xantoss-academy-dark article,
    html.xantoss-academy-dark section, html.xantoss-academy-dark [role="main"] {
      background-color: #101d35 !important; color: #e5eeff !important;
    }
    html.xantoss-academy-dark main p, html.xantoss-academy-dark main h1,
    html.xantoss-academy-dark main h2, html.xantoss-academy-dark main h3,
    html.xantoss-academy-dark main label { color: #e5eeff !important; }
    html.xantoss-academy-dark input, html.xantoss-academy-dark textarea {
      background: #1c2c48 !important; color: #fff !important;
    }
    html.xantoss-academy-dark a { color: #8dbaff !important; }
    #xantoss-academy-activity { color: #eaf2ff; background: #0e1c34;
      border: 1px solid #3e68a2; border-radius: 18px;
      padding: 22px; margin: 18px 12px; font-family: Arial, sans-serif; }
    #xantoss-academy-activity button { display: block; width: 100%;
      margin: 10px 0; padding: 15px; text-align: left; border-radius: 10px;
      border: 1px solid #648bd0; background: #20395f; color: white; }
  `;
  document.head.appendChild(style);
  shadow.innerHTML = `
    <style>
      * { box-sizing: border-box; font-family: Arial, sans-serif; }
      .curtain { position:fixed; inset:0; z-index:2147483647;
        display:grid; place-items:center; background:#030711; color:white;
        transform:translateY(-100%); transition:transform .7s ease, opacity .4s ease; }
      .curtain h1 { font-size:28px; text-align:center; letter-spacing:3px; }
      .bubble { position:fixed; top:45%; right:12px; z-index:2147483646;
        display:none; width:56px; height:56px; border-radius:50%;
        border:2px solid #8bbcff; background:#194184; color:white;
        font-size:24px; box-shadow:0 0 20px #4287ff99; touch-action:none; }
      .panel { position:fixed; top:18%; right:12px; z-index:2147483646;
        display:none; width:min(320px,calc(100vw - 24px)); padding:20px;
        border-radius:18px; border:1px solid #5286df; background:#0b162c;
        color:white; box-shadow:0 15px 40px #0009; }
      .panel h2 { color:#92bdff; margin:0 0 12px; font-size:20px; }
      label { display:flex; justify-content:space-between; align-items:center;
        padding:14px 0; border-top:1px solid #2b4264; }
      input { width:22px; height:22px; accent-color:#438bff; }
      .action { border:0; border-radius:9px; background:#254b88; color:white;
        padding:11px 16px; margin:6px 6px 0 0; }
    </style>
    <div class="curtain"><h1>XANTOSS<br>ACADEMY</h1></div>
    <button class="bubble" aria-label="Abrir Xantoss Academy">X</button>
    <div class="panel">
      <h2>XANTOSS ACADEMY</h2>
      <p>Versão 0.6 — visual experimental</p>
      <label>Modo Xantoss <input class="mode" type="checkbox" checked></label>
      <label>Midnight Blue <input class="dark" type="checkbox" checked></label>
      <button class="action close">Fechar</button>
      <button class="action exit">Sair</button>
    </div>`;
  const $ = (selector) => shadow.querySelector(selector);
  const bubble = $(".bubble");
  const panel = $(".panel");
  const mode = $(".mode");
  const dark = $(".dark");
  let activity = null;
  let originalDisplay = "";
  let originalParent = null;
  let originalNextSibling = null;
  let disposed = false;
  let lastUrl = location.href;
  let poll = null;
  const timeouts = [];
  function later(fn, ms) { timeouts.push(setTimeout(fn, ms)); }
  function restore() {
    if (activity) { activity.remove(); activity = null; }
    if (originalParent && originalParent.isConnected) {
      originalParent.style.display = originalDisplay;
    }
    originalParent = null;
    originalNextSibling = null;
  }
  function locateExercise() {
    const main = document.querySelector('main, [role="main"]');
    if (!main) return null;
    const inputs = [...main.querySelectorAll('input:not([type="hidden"]), textarea, [role="radio"]')];
    const answer = inputs.find(el => !el.closest('nav,header,footer'));
    if (!answer) return null;
    let node = answer;
    while (node.parentElement && node.parentElement !== main) {
      if (node.parentElement.querySelectorAll('input,textarea,[role="radio"]').length > 1) {
        node = node.parentElement; break;
      }
      node = node.parentElement;
    }
    return node === main ? null : node;
  }
  function update() {
    if (disposed) return;
    document.documentElement.classList.toggle("xantoss-academy-dark", dark.checked);
    restore();
    if (!mode.checked) return;
    const target = locateExercise();
    if (!target || !target.parentElement) {
      return;
    }
    originalParent = target;
    originalDisplay = target.style.display;
    originalNextSibling = target.nextSibling;
    activity = document.createElement("div");
    activity.id = "xantoss-academy-activity";
    activity.innerHTML = '<h2 style="color:#91bdff">XANTOSS ACADEMY</h2>' +
      '<p>Interface demonstrativa — questão original preservada.</p>' +
      '<p>Escolha uma opção para testar o visual:</p>' +
      '<button type="button" data-xa-choice="correct">A — Resposta correta</button>' +
      '<button type="button" data-xa-choice="incorrect">B — Resposta incorreta</button>' +
      '<p class="xa-feedback" style="font-size:12px;color:#b4c8e8">Não envia respostas nem altera sua pontuação.</p>';
    target.parentElement.insertBefore(activity, target);
    target.style.display = "none";
    activity.addEventListener("click", (event) => {
      const button = event.target.closest("[data-xa-choice]");
      if (!button) return;
      activity.querySelector(".xa-feedback").textContent =
        "Opção visual selecionada. Nenhuma resposta foi enviada.";
    });
  }
  function cleanup() {
    disposed = true;
    timeouts.forEach(clearTimeout);
    if (poll) clearInterval(poll);
    restore();
    document.documentElement.classList.remove("xantoss-academy-dark");
    style.remove();
    root.remove();
    delete window.__xantossAcademyCleanup;
  }
  window.__xantossAcademyCleanup = cleanup;
  mode.addEventListener("change", update);
  dark.addEventListener("change", update);
  $(".close").addEventListener("click", () => { panel.style.display = "none"; });
  $(".exit").addEventListener("click", cleanup);
  let dragging = false, moved = false;
  bubble.addEventListener("pointerdown", (e) => {
    dragging = true; moved = false; bubble.setPointerCapture(e.pointerId);
  });
  bubble.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = true;
    bubble.style.right = "auto";
    bubble.style.left = Math.max(0, Math.min(innerWidth - 56, e.clientX - 28)) + "px";
    bubble.style.top = Math.max(0, Math.min(innerHeight - 56, e.clientY - 28)) + "px";
  });
  bubble.addEventListener("pointerup", () => {
    dragging = false;
    if (!moved) panel.style.display = panel.style.display === "block" ? "none" : "block";
  });
  update();
  poll = setInterval(() => {
    if (disposed || !mode.checked) return;
    if (location.href !== lastUrl) { lastUrl = location.href; update(); return; }
    if (!activity || !activity.isConnected) update();
  }, 1500);
  later(() => { if (!disposed) $(".curtain").style.transform = "translateY(0)"; }, 30);
  later(() => { if (!disposed) $(".curtain").style.opacity = "0"; }, 1450);
  later(() => {
    if (!disposed) { $(".curtain").remove(); bubble.style.display = "block"; }
  }, 1900);
})();
