/* Xantoss Academy v0.7 — question reader. No API keys or automatic answer submission. */
(() => {
  "use strict";
  window.__xantossAcademyCleanup?.();
  const host=document.createElement("div");host.id="xantoss-academy-root";document.body.append(host);
  const shadow=host.attachShadow({mode:"open"});
  shadow.innerHTML=`<style>
    *{box-sizing:border-box;font-family:Arial,sans-serif}
    .curtain{position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#030711;color:#fff;transform:translateY(-100%);transition:transform .7s ease,opacity .4s ease}
    .curtain h1{text-align:center;letter-spacing:3px;font-size:28px}
    .bubble{position:fixed;top:45%;right:12px;z-index:2147483646;width:56px;height:56px;border-radius:50%;border:2px solid #8bbcff;background:#194184;color:white;font-size:24px;box-shadow:0 0 20px #4287ff99;touch-action:none;display:none}
    .panel{position:fixed;top:18%;right:12px;z-index:2147483646;display:none;width:min(340px,calc(100vw - 24px));max-height:75vh;overflow:auto;padding:17px;border-radius:18px;border:1px solid #5286df;background:#0b162c;color:white;box-shadow:0 15px 40px #0009}
    .panel h2{color:#92bdff;margin:0 0 8px;font-size:20px}
    label{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid #2b4264}
    input{width:22px;height:22px;accent-color:#438bff}
    button.action{border:0;border-radius:9px;background:#254b88;color:white;padding:10px 12px;margin:6px 4px 0 0}
    .answer{position:fixed;left:10px;bottom:14px;z-index:2147483645;width:min(410px,calc(100vw - 20px));padding:12px 14px;border-radius:14px;background:#0b162c;color:#eaf2ff;border:1px solid #5286df;box-shadow:0 6px 24px #0008;font-size:13px;display:none}
    .answer strong{color:#a7caff}.answer p{margin:6px 0;line-height:1.4}.answer button{border:1px solid #5286df;border-radius:8px;background:#20395f;color:white;padding:7px;margin:3px}
    .status{color:#a7caff}.detail{white-space:pre-wrap;max-height:120px;overflow:auto;display:none}
  </style>
  <div class="curtain"><h1>XANTOSS<br>ACADEMY</h1></div>
  <button class="bubble" aria-label="Abrir Xantoss Academy">X</button>
  <div class="panel"><h2>XANTOSS ACADEMY</h2><p>V0.7 — leitor de questões</p>
  <label>Modo Xantoss <input class="mode" type="checkbox" checked></label>
  <label>Midnight Blue <input class="dark" type="checkbox" checked></label>
  <button class="action close">Fechar</button><button class="action exit">Sair</button></div>
  <section class="answer" aria-live="polite"><strong>RESPOSTA XANTOSS</strong>
  <p class="status">Procurando questão...</p><p class="result">O leitor identifica o conteúdo. A conexão com Jarvis ainda está pendente.</p>
  <button class="inspect">Ver conteúdo identificado</button><button class="copy">Copiar questão</button>
  <p class="detail"></p></section>`;
  const $=s=>shadow.querySelector(s), bubble=$(".bubble"),panel=$(".panel"),answer=$(".answer"),status=$(".status"),detail=$(".detail");
  const theme=document.createElement("style");theme.textContent=`html.xantoss-academy-dark,html.xantoss-academy-dark body{background:#080f20!important;color:#e5eeff!important}html.xantoss-academy-dark main,html.xantoss-academy-dark article{background:#101d35!important;color:#e5eeff!important}`;document.head.append(theme);
  let disposed=false,lastSignature="",latest=null,timer=null;const timers=[];
  const defer=(fn,ms)=>timers.push(setTimeout(fn,ms));
  function extract(){
    const main=document.querySelector('main,[role="main"]')||document.body;
    const sections=[...main.querySelectorAll('article,[data-testid*="question"],[class*="exercise"],[class*="problem"],[role="group"]')].filter(el=>el.getBoundingClientRect().width>0);
    const node=sections.find(el=>el.innerText?.trim().length>25&&el.innerText.trim().length<12000)||main;
    const clone=node.cloneNode(true);
    clone.querySelectorAll('script,style,nav,header,footer,iframe,form[action*="login"],input[type="password"],[aria-hidden="true"],#xantoss-academy-root').forEach(el=>el.remove());
    const text=(clone.innerText||clone.textContent||"").replace(/\s+/g," ").trim().slice(0,12000);
    const images=[...node.querySelectorAll("img")].slice(0,25).map(el=>({src:el.currentSrc||el.src,alt:el.alt||""})).filter(x=>/^https?:/.test(x.src));
    const formulas=[...node.querySelectorAll("math,annotation")].slice(0,30).map(el=>el.textContent.trim().slice(0,500)).filter(Boolean);
    const svgCount=node.querySelectorAll("svg").length,canvasCount=node.querySelectorAll("canvas").length;
    const choices=[...node.querySelectorAll('label,[role="radio"],[role="option"]')].map(el=>el.innerText?.trim()).filter(x=>x&&x.length<500).slice(0,30);
    return {text,images,formulas,choices,svgCount,canvasCount,url:location.origin+location.pathname};
  }
  function scan(){
    if(disposed)return;
    document.documentElement.classList.toggle("xantoss-academy-dark", $(".dark").checked);
    answer.style.display=$(".mode").checked?"block":"none";
    if(!$(".mode").checked)return;
    const data=extract(),signature=JSON.stringify(data);
    if(signature===lastSignature)return;
    lastSignature=signature;latest=data;
    if(data.text.length<20){status.textContent="Aguardando questão...";return}
    status.textContent="Questão detectada • "+data.images.length+" imagem(ns) • "+data.formulas.length+" fórmula(s)";
    $(".result").textContent="Leitura pronta. O Jarvis ainda não está conectado; nenhuma resposta foi inventada.";
    detail.textContent=JSON.stringify(data,null,2);
  }
  $(".inspect").onclick=()=>{detail.style.display=detail.style.display==="block"?"none":"block"};
  $(".copy").onclick=async()=>{if(!latest)return;try{await navigator.clipboard.writeText(JSON.stringify(latest,null,2));status.textContent="Questão copiada"}catch{status.textContent="Cópia indisponível neste navegador"}};
  $(".mode").onchange=scan;$(".dark").onchange=scan;
  $(".close").onclick=()=>panel.style.display="none";
  function cleanup(){disposed=true;clearInterval(timer);timers.forEach(clearTimeout);theme.remove();document.documentElement.classList.remove("xantoss-academy-dark");host.remove();delete window.__xantossAcademyCleanup}
  $(".exit").onclick=cleanup;window.__xantossAcademyCleanup=cleanup;
  let dragging=false,moved=false;
  bubble.addEventListener("pointerdown",e=>{dragging=true;moved=false;bubble.setPointerCapture(e.pointerId)});
  bubble.addEventListener("pointermove",e=>{if(!dragging)return;moved=true;bubble.style.right="auto";bubble.style.left=Math.max(0,Math.min(innerWidth-56,e.clientX-28))+"px";bubble.style.top=Math.max(0,Math.min(innerHeight-56,e.clientY-28))+"px"});
  bubble.addEventListener("pointerup",()=>{dragging=false;if(!moved)panel.style.display=panel.style.display==="block"?"none":"block"});
  scan();timer=setInterval(scan,1600);
  defer(()=>{$(".curtain").style.transform="translateY(0)"},30);
  defer(()=>{$(".curtain").style.opacity="0"},1450);
  defer(()=>{$(".curtain").remove();bubble.style.display="block"},1900);
})();