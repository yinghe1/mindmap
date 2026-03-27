import type { Person, GraphData, ContextData } from '../api/client';

function escapeJs(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateExportHtml(person: Person, graph: GraphData, context: ContextData): string {
  const name = escapeHtml(person.name);
  const group = escapeHtml(person.auto_group || '');
  const nodesJson = JSON.stringify(graph.nodes);
  const edgesJson = JSON.stringify(graph.edges);
  const outcomesJson = JSON.stringify(graph.outcomes);
  const arch = context.cognitive_architecture;
  const archJson = arch ? JSON.stringify(arch) : 'null';
  const influencesJson = JSON.stringify(context.influences || []);
  const patternDetails = context.pattern_details || '';
  const wikiUrl = person.wiki_url ? escapeHtml(person.wiki_url) : '';
  const wikiSummary = escapeHtml((person.wiki_summary || '').slice(0, 250));

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${name} — Cognitive Map</title>
<style>
:root{--bg:#050813;--bg2:#0a1022;--panel:rgba(12,18,36,0.78);--text:#edf3ff;--muted:#a6b4d8;--border:rgba(255,255,255,0.08);--chip:rgba(255,255,255,0.05);--accent:#8ab7ff;--accent2:#c39cff;--good:#7df2ca;--warn:#ffc778;--technical:#5ea1ff;--strategic:#72e5c7;--reflective:#d299ff;--macro:#ffb26b}
*{box-sizing:border-box}html,body{height:100%;margin:0}
body{color:var(--text);font-family:Inter,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;background:radial-gradient(circle at 15% 10%,rgba(94,161,255,0.16),transparent 28%),radial-gradient(circle at 85% 18%,rgba(210,153,255,0.12),transparent 25%),radial-gradient(circle at 65% 85%,rgba(255,178,107,0.08),transparent 28%),linear-gradient(180deg,var(--bg2),var(--bg));overflow:hidden}
.app{display:grid;grid-template-columns:300px 1fr 360px;height:100vh}
.sidebar,.details{background:var(--panel);backdrop-filter:blur(18px);overflow-y:auto;padding:18px}
.sidebar{border-right:1px solid var(--border)}.details{border-left:1px solid var(--border)}
.main{display:grid;grid-template-rows:auto 1fr auto;min-width:0}
.topbar,.bottombar{padding:14px 18px;background:rgba(255,255,255,0.03)}
.topbar{border-bottom:1px solid var(--border)}.bottombar{border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
h1{margin:0 0 6px;font-size:20px}h2{margin:0 0 10px;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:1.1px}h3{margin:0 0 8px;font-size:18px}
p,li,label,.small{margin:0;color:var(--muted);font-size:13px;line-height:1.45}
.section,.detail-card{margin-bottom:16px;padding:14px;background:rgba(255,255,255,0.035);border:1px solid var(--border);border-radius:16px}
.chips,.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.chip,button{appearance:none;border:1px solid var(--border);background:var(--chip);color:var(--text);border-radius:999px;padding:7px 11px;font-size:12px;cursor:pointer}
button:hover,.chip:hover{background:rgba(255,255,255,0.09)}.chip.active{outline:2px solid rgba(138,183,255,0.5)}
.toggle{display:inline-flex;gap:8px;align-items:center;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,0.04);border:1px solid var(--border)}
.legend-item{display:flex;align-items:center;gap:8px;margin:6px 0}
.dot{width:12px;height:12px;border-radius:50%;border:1px solid rgba(255,255,255,0.15)}
.bar{height:8px;border-radius:999px;overflow:hidden;background:rgba(255,255,255,0.08);margin-top:6px}
.bar>span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2))}
.metric{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin:8px 0}
.tag{display:inline-block;margin:4px 6px 0 0;padding:4px 8px;border-radius:999px;font-size:12px;color:#dbe8ff;background:rgba(138,183,255,0.12);border:1px solid rgba(138,183,255,0.18)}
.canvas-wrap{position:relative;min-height:0}canvas{width:100%;height:100%;display:block}
.tooltip{position:absolute;max-width:320px;pointer-events:none;padding:10px 12px;border-radius:14px;border:1px solid rgba(255,255,255,0.1);background:rgba(8,12,24,0.94);box-shadow:0 12px 40px rgba(0,0,0,0.32);color:var(--text);font-size:12px;line-height:1.4;opacity:0;transform:translateY(4px);transition:opacity .12s ease,transform .12s ease}
.tooltip.visible{opacity:1;transform:translateY(0)}
.footer-note{color:var(--muted);font-size:12px}input[type="range"]{width:220px}
.detail-mini{margin-top:8px;font-size:12px;color:var(--muted)}
.spark{width:100%;height:54px;margin-top:8px;display:block;border-radius:10px;background:rgba(255,255,255,0.03)}
.back-link{font-size:12px;color:var(--accent);cursor:pointer;margin-bottom:10px}
.patterns-overlay{position:fixed;inset:0;z-index:100;background:var(--bg);overflow-y:auto}
.patterns-overlay .pat-inner{max-width:760px;margin:0 auto;padding:40px 28px 80px;position:relative;z-index:1}
.patterns-overlay .pat-bg{position:fixed;inset:0;background:radial-gradient(circle at 20% 5%,rgba(138,183,255,0.08),transparent 40%),radial-gradient(circle at 80% 15%,rgba(195,156,255,0.06),transparent 35%);pointer-events:none;z-index:0}
.patterns-overlay .pat-label{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:var(--accent);font-weight:600;margin-bottom:8px}
.patterns-overlay .pat-title{margin:0;font-size:28px;font-weight:700;color:var(--text);letter-spacing:-0.5px;line-height:1.2}
.patterns-overlay .pat-sub{font-size:14px;color:var(--muted);margin-top:8px;line-height:1.6}
.patterns-overlay .pat-sep{height:1px;background:linear-gradient(90deg,var(--accent),var(--accent2),transparent);margin-top:20px;opacity:0.3}
.patterns-overlay .pat-back{color:var(--accent);font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-bottom:24px;text-decoration:none;opacity:0.8}
.patterns-overlay .pat-back:hover{opacity:1}
.pat-section{margin-bottom:16px}
.pat-h1{font-size:22px;font-weight:700;color:var(--text);letter-spacing:-0.3px;margin:0 0 8px}
.pat-h2-card{background:rgba(255,255,255,0.035);border:1px solid var(--border);border-radius:16px;padding:18px 20px;margin-bottom:12px}
.pat-h2-title{font-size:16px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:10px}
.pat-h2-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.pat-h3-card{background:rgba(255,255,255,0.02);border-radius:12px;padding:14px 16px;border:1px solid var(--chip);margin-bottom:8px}
.pat-h3-title{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
.pat-body p{font-size:13px;color:var(--muted);line-height:1.7;margin:6px 0}
.pat-body ul{margin:8px 0;padding-left:18px;list-style:none}
.pat-body ul li{font-size:13px;color:var(--muted);line-height:1.7;margin-bottom:4px;position:relative;padding-left:14px}
.pat-body ul li::before{content:'';position:absolute;left:0;top:0.55em;width:4px;height:4px;border-radius:50%;background:var(--accent);opacity:0.5}
.pat-body ol{margin:8px 0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:6px}
.pat-body ol li{font-size:13px;color:var(--muted);line-height:1.7;display:flex;gap:10px;align-items:flex-start}
.pat-body ol li .num{font-size:11px;font-weight:700;color:var(--accent);background:rgba(138,183,255,0.12);border-radius:999px;min-width:22px;height:22px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px}
.pat-link{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(138,183,255,0.08);border:1px solid rgba(138,183,255,0.18);border-radius:12px;color:var(--accent);font-size:13px;font-weight:600;cursor:pointer;text-decoration:none;margin-top:10px;transition:background 0.15s}
.pat-link:hover{background:rgba(138,183,255,0.15)}
.arch-sep{font-size:12px;text-transform:uppercase;letter-spacing:1.1px;color:var(--muted);margin-bottom:12px;padding-top:12px;border-top:1px solid var(--border)}
.tension-box{margin-bottom:10px;padding:10px 12px;background:rgba(255,255,255,0.02);border-radius:14px;border:1px solid rgba(255,255,255,0.04)}
.pole-a{font-size:12px;font-weight:700;color:var(--accent)}.pole-b{font-size:12px;font-weight:700;color:var(--accent2)}
.dp-line{position:absolute;left:7px;top:4px;bottom:4px;width:2px;background:linear-gradient(180deg,var(--accent),var(--accent2),var(--warn));border-radius:1px;opacity:0.4}
.dp-dot{position:absolute;left:-17px;top:3px;width:10px;height:10px;border-radius:50%;border:2px solid rgba(255,255,255,0.2)}
.dp-branch{font-size:11px;padding:2px 7px;border-radius:999px;background:rgba(138,183,255,0.08);border:1px solid rgba(138,183,255,0.15);color:var(--accent)}
@media(max-width:1150px){body{overflow:auto}.app{grid-template-columns:1fr;height:auto}.sidebar,.details{border:none}.main{min-height:72vh}}
</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
<h1>${name} Life Map</h1>
<p>${group ? group + ' — ' : ''}Latent-space cognitive architecture map</p>
<div class="section"><h2>View</h2><div class="chips" id="timeModes"></div><h2 style="margin-top:12px">Filters</h2><div class="chips" id="clusterFilters"></div><div class="row" style="margin-top:10px"><label class="toggle"><input type="checkbox" id="bridgesOnly"> Bridges only</label><label class="toggle"><input type="checkbox" id="recentOnly"> Rising only</label><label class="toggle"><input type="checkbox" id="strongLinks"> Strong links</label></div></div>
<div class="section"><h2>Legend</h2><div class="legend-item"><span class="dot" style="background:var(--technical)"></span><span>Technical</span></div><div class="legend-item"><span class="dot" style="background:var(--strategic)"></span><span>Strategic</span></div><div class="legend-item"><span class="dot" style="background:var(--reflective)"></span><span>Reflective</span></div><div class="legend-item"><span class="dot" style="background:var(--macro)"></span><span>Macro</span></div><p class="small" style="margin-top:8px">Size = importance. Glow = momentum. Outline = bridge score. Motion on links = recent strengthening.</p></div>
<div class="section"><h2>Top 10 nodes</h2><div id="topNodes"></div></div>
</aside>
<main class="main">
<div class="topbar"><div class="row" style="justify-content:space-between;align-items:flex-end"><div><div class="small" style="text-transform:uppercase;letter-spacing:1px">Latent-space cognitive architecture</div><div style="font-size:22px;font-weight:700">${name} — whole-life interactive visualization</div></div><div class="row"><label for="monthSlider" class="small">Time</label><input type="range" id="monthSlider" min="0" max="3" value="3" step="1"/><span id="monthLabel" class="small"></span></div></div></div>
<div class="canvas-wrap"><canvas id="graph"></canvas><div id="tooltip" class="tooltip"></div></div>
<div class="bottombar"><div><strong>Interaction:</strong> click node or link for details, drag nodes, hover for excerpts, and scrub across four life phases.</div><div class="footer-note">Cognitive map based on public biography and major works.</div></div>
</main>
<aside class="details"><div id="detailContent"></div><div id="archContent"></div></aside>
</div>
<script>
const nodes=${nodesJson};
const edges=${edgesJson};
const outcomes=${outcomesJson};
const arch=${archJson};
const influences=${influencesJson};
const wikiUrl="${escapeJs(wikiUrl)}";
const wikiSummary="${escapeJs(wikiSummary)}";
const personName="${escapeJs(person.name)}";
const patternDetails="${escapeJs(patternDetails)}";

const months=["Phase 1","Phase 2","Phase 3","Phase 4"];
const timeModes=[{id:"all",label:"Whole life"},{id:"recent",label:"Late period emphasis"},{id:"playback",label:"Life-phase playback"}];
const clusterColors={technical:getCss('--technical'),strategic:getCss('--strategic'),reflective:getCss('--reflective'),macro:getCss('--macro')};
function getCss(n){return getComputedStyle(document.documentElement).getPropertyValue(n).trim()}

const nodesById=Object.fromEntries(nodes.map(n=>[n.id,n]));
const anchorByCluster={technical:{x:0.58,y:0.44},strategic:{x:0.39,y:0.46},reflective:{x:0.23,y:0.55},macro:{x:0.63,y:0.50}};
const state={timeMode:'all',monthIndex:3,activeClusters:new Set(['technical','strategic','reflective','macro']),bridgesOnly:false,recentOnly:false,strongLinks:false,selected:null,hoveredNode:null,hoveredEdge:null,draggingNode:null,mouse:{x:0,y:0}};

const canvas=document.getElementById('graph'),ctx=canvas.getContext('2d'),tooltip=document.getElementById('tooltip'),monthSlider=document.getElementById('monthSlider'),monthLabel=document.getElementById('monthLabel');

function setCanvasSize(){const r=canvas.parentElement.getBoundingClientRect(),d=window.devicePixelRatio||1;canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);canvas.style.width=r.width+'px';canvas.style.height=r.height+'px';ctx.setTransform(d,0,0,d,0,0)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function getNodeValue(n){const t=state.monthIndex;return state.timeMode==='recent'?(n.trend[t]*0.75+n.momentum*0.25):n.trend[t]}
function visibleNode(n){if(!state.activeClusters.has(n.cluster))return false;if(state.bridgesOnly&&n.bridge<0.75)return false;if(state.recentOnly&&n.momentum<0.7)return false;return true}
function visibleEdge(e){if(state.strongLinks&&e.weight<0.72)return false;if(state.recentOnly&&e.recentChange<0.1)return false;return visibleNode(nodesById[e.source])&&visibleNode(nodesById[e.target])}
function nodeRadius(n){return 18+getNodeValue(n)*26}
function hexToRgba(hex,alpha){const v=hex.replace('#',''),bi=parseInt(v,16);return 'rgba('+((bi>>16)&255)+','+((bi>>8)&255)+','+(bi&255)+','+alpha+')'}
function screenPos(n){const r=canvas.getBoundingClientRect();return{x:n.sx*r.width,y:n.sy*r.height}}

function initNodeSim(){const pad=0.1,u=0.8;let mnX=Infinity,mxX=-Infinity,mnY=Infinity,mxY=-Infinity;for(const n of nodes){if(n.x<mnX)mnX=n.x;if(n.x>mxX)mxX=n.x;if(n.y<mnY)mnY=n.y;if(n.y>mxY)mxY=n.y}const rX=mxX-mnX||1,rY=mxY-mnY||1;for(const n of nodes){n.x=pad+((n.x-mnX)/rX)*u;n.y=pad+((n.y-mnY)/rY)*u;n.sx=n.x;n.sy=n.y;n.vx=0;n.vy=0}}
function updateSimulation(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const vn=nodes.filter(visibleNode),ve=edges.filter(visibleEdge);for(const n of vn){const a=anchorByCluster[n.cluster];let dx=0,dy=0;if(state.timeMode==='playback'){const d=(state.monthIndex-1.5)*0.013;dx=n.cluster==='technical'?-d:n.cluster==='macro'?d:0;dy=n.role==='Emergent'?-d:n.role==='Core'?d*0.4:0}const tx=n.x+dx,ty=n.y+dy;if(state.draggingNode===n)continue;n.vx+=(tx-n.sx)*0.012;n.vy+=(ty-n.sy)*0.012;n.vx+=(a.x-n.sx)*0.002;n.vy+=(a.y-n.sy)*0.002}for(let i=0;i<vn.length;i++){for(let j=i+1;j<vn.length;j++){const a=vn[i],b=vn[j],dx=b.sx-a.sx,dy=b.sy-a.sy,dist=Math.hypot(dx,dy)+1e-6,mn=(nodeRadius(a)+nodeRadius(b))/Math.max(r.width,r.height)*1.1;if(dist<mn){const p=(mn-dist)*0.012,ux=dx/dist,uy=dy/dist;if(state.draggingNode!==a){a.vx-=ux*p;a.vy-=uy*p}if(state.draggingNode!==b){b.vx+=ux*p;b.vy+=uy*p}}}}for(const e of ve){const a=nodesById[e.source],b=nodesById[e.target],dx=b.sx-a.sx,dy=b.sy-a.sy,dist=Math.hypot(dx,dy)+1e-6,des=0.18+(1-e.weight)*0.16,f=(dist-des)*0.004,ux=dx/dist,uy=dy/dist;if(state.draggingNode!==a){a.vx+=ux*f;a.vy+=uy*f}if(state.draggingNode!==b){b.vx-=ux*f;b.vy-=uy*f}}for(const n of vn){if(state.draggingNode===n)continue;n.vx*=0.92;n.vy*=0.92;n.sx=clamp(n.sx+n.vx,0.08,0.92);n.sy=clamp(n.sy+n.vy,0.08,0.9)}}

function draw(){const r=canvas.getBoundingClientRect();ctx.clearRect(0,0,r.width,r.height);for(let i=0;i<55;i++){const x=(i*137)%r.width,y=((i*83)+44)%r.height;ctx.beginPath();ctx.arc(x,y,1+(i%2),0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.05)';ctx.fill()}
for(const e of edges.filter(visibleEdge)){const a=screenPos(nodesById[e.source]),b=screenPos(nodesById[e.target]),mx=(a.x+b.x)/2,my=(a.y+b.y)/2-22,th=1+e.weight*5;const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);g.addColorStop(0,'rgba(136,182,255,0.18)');g.addColorStop(0.5,'rgba(211,171,255,0.16)');g.addColorStop(1,'rgba(255,196,140,0.16)');ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mx,my,b.x,b.y);ctx.strokeStyle=g;ctx.lineWidth=th+4;ctx.stroke();const sel=state.selected===e,hov=state.hoveredEdge===e,al=sel||hov?0.9:0.22+e.recentChange*1.4;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(mx,my,b.x,b.y);ctx.strokeStyle='rgba(190,214,255,'+Math.min(al,0.92)+')';ctx.lineWidth=th;ctx.stroke();if(e.recentChange>0.14){const t=(Date.now()/700+e.weight*10)%1,qx=(1-t)*(1-t)*a.x+2*(1-t)*t*mx+t*t*b.x,qy=(1-t)*(1-t)*a.y+2*(1-t)*t*my+t*t*b.y;ctx.beginPath();ctx.arc(qx,qy,3.3,0,Math.PI*2);ctx.fillStyle='rgba(187,220,255,0.95)';ctx.fill()}}
for(const n of nodes.filter(visibleNode)){const p=screenPos(n),r2=nodeRadius(n),c=clusterColors[n.cluster],act=state.selected===n||state.hoveredNode===n;const gl=ctx.createRadialGradient(p.x,p.y,r2*0.2,p.x,p.y,r2+18+n.momentum*9);gl.addColorStop(0,hexToRgba(c,act?0.25:0.17));gl.addColorStop(1,hexToRgba(c,0));ctx.beginPath();ctx.arc(p.x,p.y,r2+18+n.momentum*8,0,Math.PI*2);ctx.fillStyle=gl;ctx.fill();ctx.beginPath();ctx.arc(p.x,p.y,r2+4,0,Math.PI*2);ctx.strokeStyle=hexToRgba('#ffffff',0.12+n.bridge*0.46);ctx.lineWidth=1+n.bridge*3;ctx.stroke();const bg=ctx.createLinearGradient(p.x-r2,p.y-r2,p.x+r2,p.y+r2);bg.addColorStop(0,hexToRgba(c,act?1:0.94));bg.addColorStop(1,hexToRgba('#ffffff',act?0.55:0.26));ctx.beginPath();ctx.arc(p.x,p.y,r2,0,Math.PI*2);ctx.fillStyle=bg;ctx.fill();ctx.beginPath();ctx.arc(p.x-r2*0.28,p.y-r2*0.28,r2*0.28,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,0.14)';ctx.fill();ctx.font=(act?'700':'600')+' 13px Inter,system-ui,sans-serif';ctx.textAlign='center';ctx.fillStyle='#eff4ff';ctx.fillText(n.label,p.x,p.y+r2+21);ctx.font='12px Inter,system-ui,sans-serif';ctx.fillStyle='rgba(232,237,248,0.76)';ctx.fillText(n.role,p.x,p.y+r2+36)}}

function ptQuadDist(p,p0,p1,p2){let m=Infinity;for(let i=0;i<=36;i++){const t=i/36,x=(1-t)*(1-t)*p0.x+2*(1-t)*t*p1.x+t*t*p2.x,y=(1-t)*(1-t)*p0.y+2*(1-t)*t*p1.y+t*t*p2.y;m=Math.min(m,Math.hypot(p.x-x,p.y-y))}return m}
function pick(mx,my){state.hoveredNode=null;state.hoveredEdge=null;for(const n of nodes.filter(visibleNode)){const p=screenPos(n);if(Math.hypot(mx-p.x,my-p.y)<=nodeRadius(n)+6){state.hoveredNode=n;return}}for(const e of edges.filter(visibleEdge)){const a=screenPos(nodesById[e.source]),b=screenPos(nodesById[e.target]);if(ptQuadDist({x:mx,y:my},a,{x:(a.x+b.x)/2,y:(a.y+b.y)/2-22},b)<8){state.hoveredEdge=e;return}}}

function renderSpark(vals){const w=300,h=54,p=6;const pts=vals.map((v,i)=>{const x=p+i*((w-p*2)/(vals.length-1)),y=h-p-v*(h-p*2);return[x,y]});const line=pts.map((pt,i)=>(i===0?'M':'L')+' '+pt[0]+' '+pt[1]).join(' ');return '<svg class="spark" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0%" stop-color="#8ab7ff"/><stop offset="100%" stop-color="#c39cff"/></linearGradient></defs><path d="M '+p+' '+(h-p)+' L '+(w-p)+' '+(h-p)+'" stroke="rgba(255,255,255,0.08)" fill="none"/><path d="'+line+'" stroke="url(#g)" stroke-width="3" fill="none"/>'+pts.map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="#cfe1ff"/>').join('')+'</svg>'}

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function renderArch(){
  const el=document.getElementById('archContent');
  if(!arch){el.innerHTML='';return}
  let h='<div class="arch-sep">Cognitive Architecture</div>';
  h+='<div class="detail-card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:16px">\\u{1F9E0}</span><strong style="font-size:18px">How '+esc(personName.split(' ')[0])+' Thinks</strong></div><p>'+esc(arch.summary)+'</p><div style="margin-top:8px"><span class="tag">'+esc(arch.primary_driver)+'</span></div></div>';
  h+='<div class="detail-card"><strong>Decision Path</strong><p style="font-size:11px;margin:4px 0 12px;color:var(--muted)">How situations are processed from trigger to action</p><div style="position:relative;padding-left:20px"><div class="dp-line"></div>';
  arch.decision_path.forEach((s,i)=>{const last=i===arch.decision_path.length-1;const col=i===0?'var(--accent)':last?'var(--warn)':'var(--accent2)';h+='<div style="position:relative;margin-bottom:'+(last?'0':'16px')+'"><div class="dp-dot" style="background:'+col+'"></div><div style="font-size:12px;font-weight:700">'+esc(s.stage)+'</div><p style="font-size:12px;margin:2px 0 4px;line-height:1.4">'+esc(s.description)+'</p><div style="display:flex;gap:4px;flex-wrap:wrap">'+s.branches.map(b=>'<span class="dp-branch">'+esc(b)+'</span>').join('')+'</div></div>'});
  h+='</div></div>';
  h+='<div class="detail-card"><strong>Core Tensions</strong><p style="font-size:11px;margin:4px 0 10px;color:var(--muted)">Internal opposing forces that shape behaviour</p>';
  arch.cognitive_tensions.forEach(t=>{h+='<div class="tension-box"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span class="pole-a">'+esc(t.pole_a)+'</span><span style="color:var(--muted);font-size:11px">vs</span><span class="pole-b">'+esc(t.pole_b)+'</span></div><p style="font-size:12px;margin:0;line-height:1.4">'+esc(t.description)+'</p></div>'});
  h+='</div>';
  h+='<div class="detail-card"><strong>Behavioural Signature</strong><p style="margin-top:6px;line-height:1.5">'+esc(arch.behavioural_signature)+'</p></div>';
  el.innerHTML=h;
}

function showOverview(){
  const top=[...nodes].sort((a,b)=>b.importance-a.importance).slice(0,4);
  let h='<div class="detail-card"><h3>Overview</h3><p>'+esc(wikiSummary)+'</p>'+(wikiUrl?'<a href="'+wikiUrl+'" target="_blank" rel="noopener" style="color:var(--accent);font-size:12px;display:inline-block;margin-top:8px">Wikipedia</a>':'')+'</div>';
  if(patternDetails){h+='<a class="pat-link" style="margin-bottom:16px" onclick="showPatterns()">\\u{1F9E9} Patterns \\u2192</a>'}
  h+='<div class="detail-card"><strong>Strongest attractors</strong><div style="margin-top:8px">'+top.map((n,i)=>'<p style="margin:4px 0">'+(i+1)+'. '+esc(n.label)+'</p>').join('')+'</div></div>';
  if(influences.length>0){h+='<div class="detail-card"><strong>Key influences</strong><div style="margin-top:8px">'+influences.slice(0,5).map(inf=>'<p style="margin:4px 0"><a href="https://en.wikipedia.org/wiki/'+encodeURIComponent(inf.name.replace(/\\s+/g,'_'))+'" target="_blank" rel="noopener" style="color:var(--accent);text-decoration:none">'+esc(inf.name)+'</a> <span style="color:var(--muted)">('+esc(inf.type)+')</span></p>').join('')+'</div></div>'}
  if(outcomes.length>0){h+='<div class="detail-card"><strong>Key outcomes</strong><div style="margin-top:8px">'+outcomes.map(o=>'<div style="margin:6px 0"><span style="font-size:12px;font-weight:600">'+esc(o.label)+'</span><span style="font-size:11px;color:var(--muted);margin-left:8px">'+esc(o.year)+'</span><p style="font-size:12px;margin:2px 0 0">'+esc(o.description)+'</p></div>').join('')+'</div></div>'}
  document.getElementById('detailContent').innerHTML=h;
}

function showNode(n){
  const val=getNodeValue(n);
  const conn=edges.filter(e=>e.source===n.id||e.target===n.id).sort((a,b)=>b.weight-a.weight).map(e=>({e,other:nodesById[e.source===n.id?e.target:e.source]}));
  let h='<div class="back-link" onclick="state.selected=null;renderAll()">\\u2190 Back to Overview</div>';
  h+='<div class="detail-card"><h3>'+esc(n.label)+'</h3><p>'+esc(n.role)+' node in the '+n.cluster+' cluster. Importance '+Math.round(n.importance*100)+', momentum '+Math.round(n.momentum*100)+', bridge score '+Math.round(n.bridge*100)+'.</p></div>';
  h+='<div class="detail-card"><div><strong>Importance</strong></div><div class="bar"><span style="width:'+Math.round(val*100)+'%"></span></div><div style="height:10px"></div><div><strong>Momentum</strong></div><div class="bar"><span style="width:'+Math.round(n.momentum*100)+'%"></span></div><div style="height:10px"></div><div><strong>Bridge score</strong></div><div class="bar"><span style="width:'+Math.round(n.bridge*100)+'%"></span></div><div class="detail-mini">Trend across life phases</div>'+renderSpark(n.trend)+'</div>';
  h+='<div class="detail-card"><strong>Representative excerpt</strong><p style="margin-top:8px">'+esc(n.excerpt)+'</p></div>';
  h+='<div class="detail-card"><strong>Subthemes</strong><div style="margin-top:8px">'+n.subthemes.map(s=>'<span class="tag">'+esc(s)+'</span>').join('')+'</div></div>';
  if(conn.length>0){h+='<div class="detail-card"><strong>Top associations</strong><p style="margin-top:8px">'+conn.map(x=>esc(x.other.label)+' \\u00b7 '+Math.round(x.e.weight*100)).join('<br>')+'</p></div>'}
  document.getElementById('detailContent').innerHTML=h;
}

function showEdge(e){
  const a=nodesById[e.source],b=nodesById[e.target];
  let h='<div class="back-link" onclick="state.selected=null;renderAll()">\\u2190 Back to Overview</div>';
  h+='<div class="detail-card"><h3>'+esc(a.label)+' \\u2194 '+esc(b.label)+'</h3><p>Association strength '+Math.round(e.weight*100)+' with recent change '+Math.round(e.recentChange*100)+'. Classified as '+e.type.replace(/_/g,' ')+'.</p></div>';
  h+='<div class="detail-card"><div><strong>Association strength</strong></div><div class="bar"><span style="width:'+Math.round(e.weight*100)+'%"></span></div><div style="height:10px"></div><div><strong>Recent change</strong></div><div class="bar"><span style="width:'+Math.round(Math.min(e.recentChange*300,100))+'%"></span></div></div>';
  h+='<div class="detail-card"><strong>Representative excerpt</strong><p style="margin-top:8px">'+esc(e.excerpt)+'</p></div>';
  h+='<div class="detail-card"><strong>Shared topics</strong><div style="margin-top:8px">'+e.shared.map(s=>'<span class="tag">'+esc(s)+'</span>').join('')+'</div></div>';
  document.getElementById('detailContent').innerHTML=h;
}

function renderSidebars(){
  const tw=document.getElementById('timeModes');tw.innerHTML=timeModes.map(m=>'<div class="chip '+(state.timeMode===m.id?'active':'')+'" data-time="'+m.id+'">'+m.label+'</div>').join('');tw.querySelectorAll('.chip').forEach(el=>el.onclick=()=>{state.timeMode=el.dataset.time;renderAll()});
  const cw=document.getElementById('clusterFilters');cw.innerHTML=[['technical','Technical'],['strategic','Strategic'],['reflective','Reflective'],['macro','Macro']].map(([id,l])=>'<div class="chip '+(state.activeClusters.has(id)?'active':'')+'" data-cluster="'+id+'">'+l+'</div>').join('');cw.querySelectorAll('.chip').forEach(el=>el.onclick=()=>{const id=el.dataset.cluster;state.activeClusters.has(id)?state.activeClusters.delete(id):state.activeClusters.add(id);renderAll()});
  const top=[...nodes].sort((a,b)=>getNodeValue(b)-getNodeValue(a)).slice(0,10);document.getElementById('topNodes').innerHTML=top.map((n,i)=>'<div class="metric"><div><div><strong>'+(i+1)+'. '+esc(n.label)+'</strong></div><div class="bar"><span style="width:'+Math.round(getNodeValue(n)*100)+'%"></span></div></div><div>'+Math.round(getNodeValue(n)*100)+'</div></div>').join('');
  document.getElementById('bridgesOnly').checked=state.bridgesOnly;document.getElementById('recentOnly').checked=state.recentOnly;document.getElementById('strongLinks').checked=state.strongLinks;
}

function updateTooltip(mx,my){const r=canvas.parentElement.getBoundingClientRect();if(state.hoveredNode){tooltip.innerHTML='<strong>'+esc(state.hoveredNode.label)+'</strong><div style="margin-top:6px;color:var(--muted)">'+esc(state.hoveredNode.excerpt)+'</div>'}else if(state.hoveredEdge){const a=nodesById[state.hoveredEdge.source],b=nodesById[state.hoveredEdge.target];tooltip.innerHTML='<strong>'+esc(a.label)+' \\u2194 '+esc(b.label)+'</strong><div style="margin-top:6px;color:var(--muted)">'+esc(state.hoveredEdge.excerpt)+'</div>'}else{tooltip.classList.remove('visible');return}tooltip.style.left=Math.min(mx+18,r.width-330)+'px';tooltip.style.top=Math.min(my+18,r.height-120)+'px';tooltip.classList.add('visible')}

const PAT_ACCENTS=['var(--accent)','var(--accent2)','var(--strategic)','var(--warn)','var(--technical)','var(--reflective)','var(--macro)','var(--good)'];
function mdInline(t){return t.replace(/\\*\\*(.+?)\\*\\*/g,'<strong style="color:var(--text);font-weight:600">$1</strong>').replace(/\\*(.+?)\\*/g,'<em style="color:var(--accent2);font-style:italic">$1</em>')}
function mdToHtml(md){
  const lines=md.split('\\n');const sections=[];let cur=null;
  for(const line of lines){
    const h4=line.match(/^#{4,}\\s+(.+)/);const h3=line.match(/^###\\s+(.+)/);const h2=line.match(/^##\\s+(.+)/);const h1=line.match(/^#\\s+(.+)/);
    if(h4||h3||h2||h1){if(cur)sections.push(cur);cur={level:h4?3:h3?3:h2?2:1,heading:(h4?h4[1]:h3?h3[1]:h2?h2[1]:h1[1]).trim(),body:[]};}
    else if(/^---+\\s*$/.test(line.trim())){}
    else{if(!cur)cur={level:0,heading:'',body:[]};cur.body.push(line);}
  }
  if(cur)sections.push(cur);
  let out='';
  sections.forEach((s,si)=>{
    const accent=PAT_ACCENTS[si%PAT_ACCENTS.length];
    const bodyHtml=renderMdBody(s.body);
    if(s.level===1){out+='<div class="pat-section"><div class="pat-h1">'+esc(s.heading)+'</div>'+(bodyHtml?'<div class="pat-body">'+bodyHtml+'</div>':'')+'</div>';}
    else if(s.level===2){out+='<div class="pat-h2-card" style="border-left:3px solid '+accent+'"><div class="pat-h2-title"><span class="pat-h2-dot" style="background:'+accent+'"></span>'+esc(s.heading)+'</div>'+(bodyHtml?'<div class="pat-body" style="padding-left:16px;margin-top:10px">'+bodyHtml+'</div>':'')+'</div>';}
    else if(s.level===3){out+='<div class="pat-h3-card"><div class="pat-h3-title" style="color:'+accent+'">'+esc(s.heading)+'</div>'+(bodyHtml?'<div class="pat-body">'+bodyHtml+'</div>':'')+'</div>';}
    else if(bodyHtml){out+='<div class="pat-body">'+bodyHtml+'</div>';}
  });
  return out;
}
function renderMdBody(lines){
  let i=0;while(i<lines.length&&lines[i].trim()==='')i++;
  let end=lines.length-1;while(end>i&&lines[end].trim()==='')end--;
  const t=lines.slice(i,end+1);let h='';i=0;
  while(i<t.length){
    if(/^\\s*[-*]\\s/.test(t[i])){h+='<ul>';while(i<t.length&&/^\\s*[-*]\\s/.test(t[i])){h+='<li>'+mdInline(t[i].replace(/^\\s*[-*]\\s/,''))+'</li>';i++;}h+='</ul>';continue;}
    if(/^\\s*\\d+[.)]\\s/.test(t[i])){h+='<ol>';let n=1;while(i<t.length&&/^\\s*\\d+[.)]\\s/.test(t[i])){const m=t[i].match(/^\\s*\\d+[.)]\\s(.*)/);h+='<li><span class="num">'+n+'</span><span>'+mdInline(m[1])+'</span></li>';i++;n++;}h+='</ol>';continue;}
    if(t[i].trim()===''){i++;continue;}
    h+='<p>'+mdInline(t[i])+'</p>';i++;
  }
  return h;
}
function showPatterns(){
  let el=document.getElementById('patternsOverlay');
  if(!el){el=document.createElement('div');el.id='patternsOverlay';el.className='patterns-overlay';document.body.appendChild(el);}
  el.style.display='block';
  el.innerHTML='<div class="pat-bg"></div><div class="pat-inner"><a class="pat-back" onclick="hidePatterns()">\\u2190 Back to map</a><div style="margin-bottom:32px"><div class="pat-label">Pattern Analysis</div><div class="pat-title">'+esc(personName)+'</div><div class="pat-sub">Thinking, behavior, and decision-making structures</div><div class="pat-sep"></div></div>'+mdToHtml(patternDetails)+'</div>';
}
function hidePatterns(){const el=document.getElementById('patternsOverlay');if(el)el.style.display='none';}

function renderAll(){monthLabel.textContent=months[state.monthIndex];renderSidebars();if(!state.selected)showOverview();else if(state.selected.source)showEdge(state.selected);else showNode(state.selected);renderArch();draw()}

canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;state.mouse={x:mx,y:my};if(state.draggingNode){state.draggingNode.sx=clamp(mx/r.width,0.08,0.92);state.draggingNode.sy=clamp(my/r.height,0.08,0.9);state.draggingNode.x=state.draggingNode.sx;state.draggingNode.y=state.draggingNode.sy;draw();updateTooltip(mx,my);return}pick(mx,my);canvas.style.cursor=state.hoveredNode?'grab':state.hoveredEdge?'pointer':'default';updateTooltip(mx,my);draw()});
canvas.addEventListener('mouseleave',()=>tooltip.classList.remove('visible'));
canvas.addEventListener('mousedown',e=>{const r=canvas.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;pick(mx,my);if(state.hoveredNode){state.draggingNode=state.hoveredNode;state.selected=state.hoveredNode;showNode(state.selected);draw()}});
window.addEventListener('mouseup',()=>{state.draggingNode=null});
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;pick(mx,my);if(state.hoveredNode){state.selected=state.hoveredNode;showNode(state.selected)}else if(state.hoveredEdge){state.selected=state.hoveredEdge;showEdge(state.selected)}else{state.selected=null;showOverview()}renderArch();draw()});
monthSlider.addEventListener('input',e=>{state.monthIndex=Number(e.target.value);renderAll()});
document.getElementById('bridgesOnly').addEventListener('change',e=>{state.bridgesOnly=e.target.checked;renderAll()});
document.getElementById('recentOnly').addEventListener('change',e=>{state.recentOnly=e.target.checked;renderAll()});
document.getElementById('strongLinks').addEventListener('change',e=>{state.strongLinks=e.target.checked;renderAll()});
window.addEventListener('resize',()=>{setCanvasSize();draw()});

initNodeSim();setCanvasSize();renderAll();
(function animate(){updateSimulation();draw();requestAnimationFrame(animate)})();
<\/script>
</body>
</html>`;
}
