/* শুভেচ্ছা স্টুডিও — card engine & editor */
(function(){
'use strict';
const $ = id => document.getElementById(id);
const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(m){ const t=$('toast'); if(!t) return; t.textContent=m; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),2400); }
const store={get(k,d){try{const v=localStorage.getItem('shub2_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('shub2_'+k,JSON.stringify(v))}catch(e){}}};

/* ===================== helpers ===================== */
const SIZES={post:[1080,1080],story:[1080,1920],cover:[1640,624],og:[1200,630]};
function rng(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function rgba(hex,a){ const n=parseInt(hex.slice(1),16); return `rgba(${n>>16&255},${n>>8&255},${n&255},${a})`; }
function lin(c,x0,y0,x1,y1,cols){ const g=c.createLinearGradient(x0,y0,x1,y1); cols.forEach((k,i)=>g.addColorStop(i/(cols.length-1),k)); return g; }
function glow(c,x,y,r,col,a){ const g=c.createRadialGradient(x,y,0,x,y,r); g.addColorStop(0,rgba(col,a)); g.addColorStop(1,rgba(col,0)); c.fillStyle=g; c.fillRect(x-r,y-r,2*r,2*r); }
function rr(c,x,y,w,h,r){ r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
function heartPath(c,x,y,s){ c.beginPath(); c.moveTo(x,y+s*.3); c.bezierCurveTo(x,y,x-s*.5,y,x-s*.5,y+s*.3); c.bezierCurveTo(x-s*.5,y+s*.6,x,y+s*.8,x,y+s); c.bezierCurveTo(x,y+s*.8,x+s*.5,y+s*.6,x+s*.5,y+s*.3); c.bezierCurveTo(x+s*.5,y,x,y,x,y+s*.3); c.closePath(); }
function sparkle(c,x,y,r){ c.beginPath(); c.moveTo(x,y-r); c.quadraticCurveTo(x,y,x+r,y); c.quadraticCurveTo(x,y,x,y+r); c.quadraticCurveTo(x,y,x-r,y); c.quadraticCurveTo(x,y,x,y-r); c.fill(); }
function star5(c,x,y,r){ c.beginPath(); for(let i=0;i<10;i++){ const a=-Math.PI/2+i*Math.PI/5, k=i%2?r*.45:r; c.lineTo(x+Math.cos(a)*k,y+Math.sin(a)*k); } c.closePath(); c.fill(); }
function crescent(c,x,y,r,col){ c.save(); c.beginPath(); c.rect(-1e5,-1e5,2e5,2e5); c.arc(x+r*.38,y-r*.18,r*.86,0,Math.PI*2); c.clip('evenodd'); c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fillStyle=col; c.fill(); c.restore(); }
function balloon(c,x,y,r,col){ c.strokeStyle='rgba(255,255,255,.75)'; c.lineWidth=r*.04; c.beginPath(); c.moveTo(x,y+r*1.25); c.bezierCurveTo(x-r*.3,y+r*1.9,x+r*.3,y+r*2.4,x,y+r*3.2); c.stroke();
  const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.1,x,y,r*1.25); g.addColorStop(0,'rgba(255,255,255,.55)'); g.addColorStop(.25,col); g.addColorStop(1,col);
  c.fillStyle=g; c.beginPath(); c.ellipse(x,y,r,r*1.2,0,0,Math.PI*2); c.fill(); c.fillStyle=col;
  c.beginPath(); c.moveTo(x,y+r*1.18); c.lineTo(x-r*.12,y+r*1.34); c.lineTo(x+r*.12,y+r*1.34); c.closePath(); c.fill(); }
function flower(c,x,y,r,col,center){ c.save(); c.translate(x,y);
  for(let i=0;i<6;i++){ c.save(); c.rotate(i*Math.PI/3); const g=c.createLinearGradient(0,0,0,-r); g.addColorStop(0,col); g.addColorStop(1,rgba(col,.55)); c.fillStyle=g; c.beginPath(); c.ellipse(0,-r*.52,r*.32,r*.55,0,0,Math.PI*2); c.fill(); c.restore(); }
  c.fillStyle=center||'#f6c453'; c.beginPath(); c.arc(0,0,r*.22,0,Math.PI*2); c.fill(); c.restore(); }
function leaf(c,x,y,r,a,col){ c.save(); c.translate(x,y); c.rotate(a); c.fillStyle=col; c.beginPath(); c.ellipse(0,-r*.5,r*.2,r*.5,0,0,Math.PI*2); c.fill(); c.strokeStyle=rgba('#ffffff',.35); c.lineWidth=r*.03; c.beginPath(); c.moveTo(0,0); c.lineTo(0,-r*.95); c.stroke(); c.restore(); }
function mandala(c,x,y,R,c1,c2,lw,dash){ c.save(); c.translate(x,y); c.lineWidth=lw; if(dash) c.setLineDash(dash);
  [[1,24,c1],[.78,16,c2],[.55,12,c1],[.32,8,c2]].forEach(([k,n,col])=>{ c.strokeStyle=col;
    for(let i=0;i<n;i++){ c.save(); c.rotate(i*2*Math.PI/n); c.beginPath(); c.ellipse(0,-R*k*.82,R*k*.07,R*k*.18,0,0,Math.PI*2); c.stroke(); c.restore(); }
    c.save(); c.setLineDash([lw*1.2,lw*2.2]); c.beginPath(); c.arc(0,0,R*k*.6,0,Math.PI*2); c.stroke(); c.restore(); });
  c.setLineDash([]); c.fillStyle=c2; c.beginPath(); c.arc(0,0,R*.08,0,Math.PI*2); c.fill(); c.restore(); }
function lantern(c,x,y0,y,s,col,glowCol){ c.strokeStyle=rgba(col,.8); c.lineWidth=s*.04; c.beginPath(); c.moveTo(x,y0); c.lineTo(x,y); c.stroke(); glow(c,x,y+s*.9,s*1.4,glowCol,.45);
  c.fillStyle=col; c.beginPath(); c.moveTo(x-s*.25,y); c.lineTo(x+s*.25,y); c.lineTo(x+s*.4,y+s*.25); c.lineTo(x-s*.4,y+s*.25); c.closePath(); c.fill();
  rr(c,x-s*.42,y+s*.25,s*.84,s*1.25,s*.3); c.fillStyle=rgba(glowCol,.9); c.fill(); c.lineWidth=s*.06; c.strokeStyle=col; c.stroke(); c.beginPath(); c.moveTo(x,y+s*.25); c.lineTo(x,y+s*1.5); c.stroke();
  c.fillStyle=col; c.beginPath(); c.moveTo(x-s*.3,y+s*1.5); c.lineTo(x+s*.3,y+s*1.5); c.lineTo(x,y+s*1.8); c.closePath(); c.fill(); }
function laurel(c,cx,cy,R,col){ c.fillStyle=col; c.strokeStyle=col; c.lineWidth=R*.018;
  [-1,1].forEach(sd=>{ c.beginPath(); c.arc(cx,cy,R, sd<0?Math.PI*.6:Math.PI*.4, sd<0?Math.PI*1.38:-Math.PI*.38, sd>0); c.stroke();
    for(let i=0;i<11;i++){ const t=Math.PI*(.62+i*.071), ang=sd<0?t:Math.PI-t, px=cx+Math.cos(ang)*R, py=cy+Math.sin(ang)*R;
      [1,-1].forEach(o=>{ c.save(); c.translate(px,py); c.rotate(ang+(sd<0?-1:1)*Math.PI/2+o*.55*(sd<0?1:-1)); c.beginPath(); c.ellipse(0,-R*.075,R*.035,R*.085,0,0,Math.PI*2); c.fill(); c.restore(); }); } }); }
function inBox(b,x,y,pad){ return b && x>b.x0-pad && x<b.x1+pad && y>b.y0-pad && y<b.y1+pad; }
function nearPhoto(g,x,y,pad){ return g && g.cx!==undefined && Math.hypot(x-g.cx,y-g.cy)<g.r+pad; }

/* ===================== painters ===================== */
// signature: (c,W,H,p,R,u,L)  L = {g, tr, box, size}
const PAINT = {
  blobs(c,W,H,p,R,u){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H); (p.blob||[]).forEach((b,i)=>glow(c,W*[.1,.9,.85,.15][i%4],H*[.12,.2,.88,.85][i%4],u*.75,b,.55)); },
  confetti(c,W,H,p,R,u,L){ c.fillStyle=lin(c,0,0,0,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    for(let i=0;i<170;i++){ const x=R()*W,y=R()*H, col=p.conf[i%p.conf.length], s=u*(.008+R()*.014); const k=R()*6.3, sh=i%3;
      if(inBox(L.box,x,y,u*.03)||nearPhoto(L.g,x,y,u*.04)) continue; c.fillStyle=col; c.save(); c.translate(x,y); c.rotate(k);
      if(sh===0){ c.beginPath(); c.arc(0,0,s*.6,0,Math.PI*2); c.fill(); } else c.fillRect(-s,-s*.35,s*2,s*.7); c.restore(); } },
  frame(c,W,H,p,R,u,L){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    const m=u*.045; c.strokeStyle=p.accent; c.lineWidth=u*.006; c.strokeRect(m,m,W-2*m,H-2*m); c.lineWidth=u*.0025; c.strokeRect(m*1.45,m*1.45,W-2.9*m,H-2.9*m);
    [[m,m],[W-m,m],[m,H-m],[W-m,H-m]].forEach(([x,y])=>{ c.save(); c.translate(x,y); c.rotate(Math.PI/4); c.fillStyle=p.accent; c.fillRect(-u*.014,-u*.014,u*.028,u*.028); c.restore(); });
    c.fillStyle=p.accent; c.save(); c.translate(W/2,m); for(let k=-1;k<=1;k+=2){ c.beginPath(); c.ellipse(k*u*.04,0,u*.03,u*.009,0,0,Math.PI*2); c.fill(); } c.restore();
    if(p.moon && !(L.g&&L.g.cx!==undefined)){ crescent(c,W/2,H*.11,u*.04,p.accent); } },
  luxe(c,W,H,p,R,u){ const g=c.createRadialGradient(W*.5,H*.35,0,W*.5,H*.5,Math.max(W,H)*.8); g.addColorStop(0,p.bg2); g.addColorStop(1,p.bg1); c.fillStyle=g; c.fillRect(0,0,W,H);
    for(let i=0;i<30;i++) glow(c,R()*W,R()*H,u*(.02+R()*.06),p.accent,.18+R()*.25);
    const m=u*.04; c.strokeStyle=rgba(p.accent,.85); c.lineWidth=u*.003; c.strokeRect(m,m,W-2*m,H-2*m); c.strokeRect(m*1.3,m*1.3,W-2.6*m,H-2.6*m);
    c.fillStyle=p.accent; for(let i=0;i<14;i++) sparkle(c,R()*W,R()*H,u*(.006+R()*.012)); },
  arch(c,W,H,p,R,u,L){ c.fillStyle=p.bg1; c.fillRect(0,0,W,H); const g=L.g&&L.g.cx!==undefined?L.g:null;
    const cx=g?g.cx:W/2, top=g?g.cy-g.r*1.45:H*.12, hw=(g?g.r:u*.25)*1.3;
    c.fillStyle=p.bg2; c.beginPath(); c.moveTo(cx-hw,H+5); c.lineTo(cx-hw,top+hw); c.arc(cx,top+hw,hw,Math.PI,0); c.lineTo(cx+hw,H+5); c.closePath(); c.fill();
    c.strokeStyle=rgba(p.accent,.6); c.lineWidth=u*.004; const o=u*.025; c.beginPath(); c.moveTo(cx-hw-o,H+5); c.lineTo(cx-hw-o,top+hw); c.arc(cx,top+hw,hw+o,Math.PI,0); c.lineTo(cx+hw+o,H+5); c.stroke();
    c.fillStyle=p.accent; for(let i=0;i<9;i++){ const x=R()*W,y=R()*H*.6; if(Math.abs(x-cx)<hw*1.2) continue; sparkle(c,x,y,u*(.01+R()*.018)); } },
  hearts(c,W,H,p,R,u,L){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    for(let i=0;i<36;i++){ const s=u*(.03+R()*.08), x=R()*W, y=R()*H, a=.12+R()*.35; if(inBox(L.box,x,y,0)) continue; c.globalAlpha=a; c.fillStyle=p.conf[i%p.conf.length]; heartPath(c,x,y,s); c.fill(); } c.globalAlpha=1; },
  night(c,W,H,p,R,u){ c.fillStyle=lin(c,0,0,0,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    c.fillStyle='#ffffff'; for(let i=0;i<90;i++){ c.globalAlpha=.3+R()*.7; c.beginPath(); c.arc(R()*W,R()*H,u*(.001+R()*.0028),0,Math.PI*2); c.fill(); } c.globalAlpha=1;
    glow(c,W*.82,H*.16,u*.35,p.accent,.25); crescent(c,W*.82,H*.16,u*.085,p.accent);
    [[.1,.12,.07],[.2,.2,.05],[.92,.32,.045]].forEach(([x,y,s])=>{ if(x>.85 && W/H<1.5) return; lantern(c,W*x,0,H*y,u*s*1.2,p.accent,p.glow||'#ffd77a'); }); },
  alpana(c,W,H,p,R,u,L){ c.fillStyle=p.bg1; c.fillRect(0,0,W,H);
    const m=u*.035; c.fillStyle=p.accent; c.fillRect(0,0,W,m); c.fillRect(0,H-m,W,m); c.fillRect(0,0,m,H); c.fillRect(W-m,0,m,H);
    c.strokeStyle=p.accent; c.lineWidth=u*.003; c.setLineDash([u*.012,u*.01]); c.strokeRect(m*1.6,m*1.6,W-3.2*m,H-3.2*m); c.setLineDash([]);
    [[0,0],[W,0],[0,H],[W,H]].forEach(([x,y])=>mandala(c,x,y,u*.26,p.accent,p.accent2,u*.004));
    if(L.g&&L.g.cx!==undefined) mandala(c,L.g.cx,L.g.cy,L.g.r*1.55,rgba(p.accent,.55),rgba(p.accent2,.7),u*.003); },
  geo(c,W,H,p,R,u){ c.fillStyle=p.bg1; c.fillRect(0,0,W,H);
    c.fillStyle=rgba(p.accent,.9); c.beginPath(); c.moveTo(W*.68,0); c.lineTo(W,0); c.lineTo(W,H*.42); c.closePath(); c.fill();
    c.fillStyle=rgba(p.accent2,.85); c.beginPath(); c.moveTo(0,H*.74); c.lineTo(0,H); c.lineTo(W*.36,H); c.closePath(); c.fill();
    c.strokeStyle=rgba(p.bg2,.25); c.lineWidth=u*.002; for(let i=-12;i<26;i++){ c.beginPath(); c.moveTo(i*u*.09,0); c.lineTo(i*u*.09+H,H); c.stroke(); }
    c.fillStyle=rgba(p.bg2,.6); for(let i=0;i<6;i++) for(let j=0;j<6;j++){ c.beginPath(); c.arc(W*.06+i*u*.028,H*.07+j*u*.028,u*.0045,0,Math.PI*2); c.fill(); } },
  balloons(c,W,H,p,R,u){ c.fillStyle=lin(c,0,0,0,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    const spots = W/H>1.5 ? [[.05,.25],[.12,.55],[.94,.3],[.88,.62],[.98,.75]] : [[.1,.12],[.2,.24],[.06,.4],[.88,.1],[.8,.24],[.94,.38]];
    spots.forEach(([x,y],i)=>balloon(c,W*x,H*y,u*(.055+R()*.025),p.conf[i%p.conf.length])); c.fillStyle=p.accent; for(let i=0;i<12;i++) sparkle(c,R()*W,R()*H,u*(.006+R()*.01)); },
  laurelbg(c,W,H,p,R,u){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H); for(let i=0;i<6;i++) glow(c,R()*W,R()*H,u*.4,p.accent,.12);
    c.fillStyle=rgba(p.accent,.9); for(let i=0;i<16;i++) sparkle(c,R()*W,R()*H,u*(.005+R()*.012)); },
  split(c,W,H,p,R,u,L){ c.fillStyle=p.bg1; c.fillRect(0,0,W,H); const g=L.g;
    if(g && g.rect){ const [x,y,w,h]=g.rect; c.fillStyle=p.bg2; c.fillRect(x,y,w,h);
      c.strokeStyle=rgba(p.accent,.35); c.lineWidth=u*.006; c.save(); c.beginPath(); c.rect(x,y,w,h); c.clip(); for(let i=-20;i<40;i++){ c.beginPath(); c.moveTo(x+i*u*.05,y); c.lineTo(x+i*u*.05-h,y+h); c.stroke(); } c.restore();
      c.fillStyle=p.accent; if(h<H) c.fillRect(x,y+h-u*.012,w,u*.012); else c.fillRect(x+w-u*.012,y,u*.012,h); } },
  glass(c,W,H,p,R,u,L){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    (p.blob||[]).forEach((b,i)=>glow(c,W*[.15,.85,.75,.2,.5][i%5],H*[.15,.25,.85,.8,.5][i%5],u*.6,b,.75));
    const b=L.box; if(b){ const pad=u*.05; rr(c,b.x0-pad,b.y0-pad*.8,b.x1-b.x0+2*pad,b.y1-b.y0+1.6*pad,u*.045); c.fillStyle='rgba(255,255,255,.16)'; c.fill(); c.strokeStyle='rgba(255,255,255,.5)'; c.lineWidth=u*.003; c.stroke(); } },
  neon(c,W,H,p,R,u){ const g=c.createRadialGradient(W/2,H*.4,0,W/2,H/2,Math.max(W,H)*.75); g.addColorStop(0,p.bg2); g.addColorStop(1,p.bg1); c.fillStyle=g; c.fillRect(0,0,W,H);
    c.strokeStyle=rgba(p.accent,.22); c.lineWidth=u*.002; const hz=H*.72; for(let i=-14;i<=14;i++){ c.beginPath(); c.moveTo(W/2+i*u*.02,hz); c.lineTo(W/2+i*u*.16,H); c.stroke(); }
    for(let j=0;j<7;j++){ const y=hz+(H-hz)*Math.pow(j/6,1.8); c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }
    c.save(); c.shadowColor=p.accent2||p.accent; c.shadowBlur=u*.03; c.strokeStyle=p.accent2||p.accent; c.lineWidth=u*.006; c.beginPath(); c.arc(W*.12,H*.14,u*.07,0,Math.PI*2); c.stroke();
    c.strokeStyle=p.accent; c.beginPath(); c.arc(W*.9,H*.82,u*.09,0,Math.PI*1.6); c.stroke(); c.restore();
    c.fillStyle=rgba(p.accent,.8); for(let i=0;i<10;i++) sparkle(c,R()*W,R()*H*.6,u*(.004+R()*.008)); },
  floral(c,W,H,p,R,u){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    const cl=(x,y,sx,sy)=>{ const k=u; [[.0,.0,.13],[.15,-.02,.085],[-.02,.15,.085],[.2,.1,.05]].forEach(([dx,dy,r],i)=>{
        leaf(c,x+sx*(dx+.08)*k,y+sy*(dy+.02)*k,k*r*1.3,sx*(.9+i*.3)*(sy),p.leaf||'#5f8f6a'); });
      [[.0,.0,.13,p.f1],[.15,-.02,.085,p.f2],[-.02,.15,.085,p.f2],[.2,.1,.05,p.f1]].forEach(([dx,dy,r,col])=>flower(c,x+sx*dx*k,y+sy*dy*k,k*r,col,p.fc)); };
    cl(W*.03,H*.03,1,1); cl(W*.97,H*.97,-1,-1); if(W/H<1.5){ c.globalAlpha=.55; flower(c,W*.92,H*.08,u*.04,p.f2,p.fc); flower(c,W*.08,H*.92,u*.04,p.f2,p.fc); c.globalAlpha=1; } },
  paper(c,W,H,p,R,u){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    c.fillStyle=rgba(p.accent,.14); for(let x=u*.03;x<W;x+=u*.04) for(let y=u*.03;y<H;y+=u*.04){ c.beginPath(); c.arc(x,y,u*.0032,0,Math.PI*2); c.fill(); }
    c.fillStyle=p.accent; for(let i=0;i<8;i++) sparkle(c,R()*W,R()*H,u*(.008+R()*.012)); },
  foil(c,W,H,p,R,u,L){ c.fillStyle=lin(c,0,0,W,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    c.strokeStyle=rgba(p.accent,.07); c.lineWidth=u*.003; for(let i=-30;i<30;i++){ c.beginPath(); c.moveTo(i*u*.06,0); c.lineTo(i*u*.06+H*.6,H); c.stroke(); }
    const gold=lin(c,0,0,W,0,['#b8862b','#f7e08a','#c9973a','#fff0b3','#b8862b']); const b=L.box;
    if(b){ const pad=u*.04; [b.y0-pad, b.y1+pad].forEach(y=>{ c.fillStyle=gold; c.fillRect(W/2-u*.22,y-u*.0015,u*.44,u*.003); c.save(); c.translate(W/2,y); c.rotate(Math.PI/4); c.fillRect(-u*.009,-u*.009,u*.018,u*.018); c.restore(); }); }
    const m=u*.035; c.strokeStyle=gold; c.lineWidth=u*.004; c.strokeRect(m,m,W-2*m,H-2*m);
    if(p.moon){ crescent(c,W*.86,H*.14,u*.06,'#f3d98b'); c.fillStyle='#f3d98b'; [[.78,.1],[.92,.24],[.12,.16],[.2,.08]].forEach(([x,y])=>star5(c,W*x,H*y,u*.012)); } },
  editorial(c,W,H,p,R,u,L){ c.fillStyle=p.bg1; c.fillRect(0,0,W,H);
    c.fillStyle=rgba(p.accent,.06); c.fillRect(0,H*.88,W,H*.12);
    const b=L.box; c.strokeStyle=p.accent; c.lineWidth=u*.0025; if(b){ const pad=u*.035; [b.y0-pad,b.y1+pad].forEach(y=>{ c.beginPath(); c.moveTo(Math.max(u*.06,b.x0),y); c.lineTo(Math.min(W-u*.06,b.x1),y); c.stroke(); }); }
    c.fillStyle=p.accent; c.beginPath(); c.arc(W-u*.07,u*.07,u*.012,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(u*.07,H-u*.07,u*.012,0,Math.PI*2); c.fill(); },
  sunburst(c,W,H,p,R,u,L){ c.fillStyle=lin(c,0,0,0,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    const g=L.g&&L.g.cx!==undefined?L.g:null, cx=g?g.cx:W/2, cy=g?g.cy:(L.box?L.box.y0:H*.3), Rr=Math.max(W,H)*1.2;
    c.fillStyle=rgba(p.accent,.12); for(let i=0;i<24;i+=2){ const a1=i*Math.PI/12, a2=(i+1)*Math.PI/12; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.cos(a1)*Rr,cy+Math.sin(a1)*Rr); c.lineTo(cx+Math.cos(a2)*Rr,cy+Math.sin(a2)*Rr); c.closePath(); c.fill(); }
    glow(c,cx,cy,u*.5,p.accent,.35); },
  waves(c,W,H,p,R,u){ c.fillStyle=lin(c,0,0,0,H,[p.bg1,p.bg2]); c.fillRect(0,0,W,H);
    (p.w||[]).forEach((col,i)=>{ const base=H*(.86+i*.05), amp=u*(.025-i*.004), f=(2+i)*Math.PI/W; c.fillStyle=col; c.beginPath(); c.moveTo(0,H); for(let x=0;x<=W;x+=W/60) c.lineTo(x,base+Math.sin(x*f+i*1.7)*amp); c.lineTo(W,H); c.closePath(); c.fill(); });
    c.fillStyle=rgba((p.w||['#ffffff'])[0],.5); c.beginPath(); c.moveTo(0,0); for(let x=0;x<=W;x+=W/60) c.lineTo(x,H*.06+Math.sin(x*3*Math.PI/W)*u*.015); c.lineTo(W,0); c.closePath(); c.fill(); },
  memphis(c,W,H,p,R,u,L){ c.fillStyle=p.bg1; c.fillRect(0,0,W,H);
    for(let i=0;i<46;i++){ const x=R()*W,y=R()*H,s=u*(.02+R()*.03),col=p.conf[i%p.conf.length],k=i%5, rot=R()*6.3; if(inBox(L.box,x,y,u*.04)||nearPhoto(L.g,x,y,u*.06)) continue;
      c.save(); c.translate(x,y); c.rotate(rot); c.fillStyle=col; c.strokeStyle=col; c.lineWidth=u*.006;
      if(k===0){ c.beginPath(); c.arc(0,0,s*.5,0,Math.PI*2); c.fill(); }
      else if(k===1){ c.beginPath(); c.moveTo(0,-s*.6); c.lineTo(s*.55,s*.4); c.lineTo(-s*.55,s*.4); c.closePath(); c.stroke(); }
      else if(k===2){ c.beginPath(); for(let t=-1;t<=1;t+=.1) c.lineTo(t*s,Math.sin(t*Math.PI*2)*s*.25); c.stroke(); }
      else if(k===3){ c.fillRect(-s*.5,-s*.12,s,s*.24); c.fillRect(-s*.12,-s*.5,s*.24,s); }
      else { for(let a=0;a<3;a++) for(let b=0;b<3;b++){ c.beginPath(); c.arc((a-1)*s*.35,(b-1)*s*.35,s*.07,0,Math.PI*2); c.fill(); } } c.restore(); } },
  kantha(c,W,H,p,R,u){ c.fillStyle=p.bg1; c.fillRect(0,0,W,H);
    [[.03,p.accent],[.05,p.accent2],[.07,p.accent]].forEach(([k,col])=>{ const m=u*k; c.strokeStyle=col; c.lineWidth=u*.005; c.setLineDash([u*.016,u*.012]); c.strokeRect(m,m,W-2*m,H-2*m); });
    c.setLineDash([]);
    [[u*.16,u*.16],[W-u*.16,u*.16],[u*.16,H-u*.16],[W-u*.16,H-u*.16]].forEach(([x,y])=>mandala(c,x,y,u*.09,p.accent,p.accent2,u*.004,[u*.01,u*.008]));
    c.strokeStyle=rgba(p.accent2,.5); c.lineWidth=u*.004; c.setLineDash([u*.01,u*.01]); for(let i=0;i<10;i++){ const x=R()*W,y=R()*H; if(x>W*.2&&x<W*.8) continue; c.beginPath(); c.ellipse(x,y,u*.03,u*.012,R()*3,0,Math.PI*2); c.stroke(); } c.setLineDash([]); }
};
const DECOR = {
  laurelbg(c,W,H,p,R,u,L){ const g=L.g&&L.g.cx!==undefined?L.g:null; if(g){ laurel(c,g.cx,g.cy,g.r*1.28,p.accent); return; }
    const cx=W/2, cy=L.size==='story'?H*.24:H*.2, r=u*.1; laurel(c,cx,cy,r,p.accent); c.fillStyle=p.accent; star5(c,cx,cy,r*.5); },
  paper(c,W,H,p,R,u,L){ const g=L.g&&L.g.cx!==undefined?L.g:null; if(!g || L.shape!=='polaroid') return;
    const tape=(x,y,a)=>{ c.save(); c.translate(x,y); c.rotate(a); c.fillStyle='rgba(255,236,170,.75)'; c.fillRect(-u*.06,-u*.018,u*.12,u*.036); c.restore(); };
    tape(g.cx-g.r*.8,g.cy-g.r*1.12,-.6); tape(g.cx+g.r*.85,g.cy-g.r*1.1,.55); }
};

/* ===================== stickers ===================== */
const STICK = {
  heart:{n:'হৃদয়',d(c,s){ const g=c.createLinearGradient(0,-s/2,0,s/2); g.addColorStop(0,'#ff6b8a'); g.addColorStop(1,'#e11d48'); c.fillStyle=g; heartPath(c,0,-s*.5,s); c.fill(); c.fillStyle='rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-s*.2,-s*.2,s*.07,s*.12,-.6,0,Math.PI*2); c.fill(); }},
  star:{n:'তারা',d(c,s){ const g=c.createLinearGradient(0,-s/2,0,s/2); g.addColorStop(0,'#fde68a'); g.addColorStop(1,'#f59e0b'); c.fillStyle=g; star5(c,0,0,s*.55); }},
  sparkle:{n:'ঝিলিক',d(c,s){ c.fillStyle='#fff7d1'; c.shadowColor='#fcd34d'; c.shadowBlur=s*.4; sparkle(c,0,0,s*.5); c.shadowBlur=0; c.fillStyle='#fde68a'; sparkle(c,s*.38,-s*.32,s*.16); }},
  balloon:{n:'বেলুন',d(c,s){ balloon(c,-s*.18,-s*.45,s*.24,'#3b82f6'); balloon(c,s*.2,-s*.38,s*.24,'#f43f5e'); }},
  moon:{n:'চাঁদ',d(c,s){ glow(c,0,0,s*.7,'#fcd581',.35); crescent(c,0,0,s*.4,'#fcd581'); c.fillStyle='#fcd581'; star5(c,s*.38,-s*.22,s*.08); }},
  flower:{n:'ফুল',d(c,s){ leaf(c,-s*.1,s*.1,s*.4,-1,'#4d8a5c'); leaf(c,s*.1,s*.1,s*.4,1,'#4d8a5c'); flower(c,0,0,s*.42,'#f472b6','#fcd34d'); }},
  crown:{n:'মুকুট',d(c,s){ const g=c.createLinearGradient(0,-s/2,0,s/2); g.addColorStop(0,'#fde68a'); g.addColorStop(1,'#d97706'); c.fillStyle=g; c.beginPath(); c.moveTo(-s*.5,s*.3); c.lineTo(-s*.5,-s*.25); c.lineTo(-s*.25,0); c.lineTo(0,-s*.4); c.lineTo(s*.25,0); c.lineTo(s*.5,-s*.25); c.lineTo(s*.5,s*.3); c.closePath(); c.fill(); c.fillStyle='#e11d48'; [[-.5,-.25],[0,-.4],[.5,-.25]].forEach(([a,b])=>{ c.beginPath(); c.arc(a*s,b*s,s*.05,0,Math.PI*2); c.fill(); }); }},
  gift:{n:'উপহার',d(c,s){ c.fillStyle='#ef4444'; c.fillRect(-s*.4,-s*.15,s*.8,s*.55); c.fillStyle='#dc2626'; c.fillRect(-s*.45,-s*.3,s*.9,s*.18); c.fillStyle='#fde047'; c.fillRect(-s*.07,-s*.3,s*.14,s*.7); c.beginPath(); c.ellipse(-s*.15,-s*.38,s*.14,s*.08,-.4,0,Math.PI*2); c.ellipse(s*.15,-s*.38,s*.14,s*.08,.4,0,Math.PI*2); c.fill(); }},
  confetti:{n:'কনফেটি',d(c,s){ const cols=['#f43f5e','#f59e0b','#10b981','#3b82f6','#a855f7']; const r=rng(7); for(let i=0;i<16;i++){ const a=r()*6.3, d=r()*s*.5; c.save(); c.translate(Math.cos(a)*d,Math.sin(a)*d); c.rotate(r()*6); c.fillStyle=cols[i%5]; c.fillRect(-s*.04,-s*.015,s*.08,s*.03); c.restore(); } }},
  ring:{n:'আংটি',d(c,s){ c.strokeStyle='#f3c96b'; c.lineWidth=s*.08; c.beginPath(); c.arc(0,s*.1,s*.3,0,Math.PI*2); c.stroke(); c.fillStyle='#bfe9ff'; c.beginPath(); c.moveTo(0,-s*.45); c.lineTo(s*.14,-s*.28); c.lineTo(0,-s*.16); c.lineTo(-s*.14,-s*.28); c.closePath(); c.fill(); }}
};

/* ===================== data ===================== */
const D = window.SHUB_DATA;
const OCC = D.occasions, ORDER = D.order;
const FONTS=[['Baloo Da 2','আধুনিক'],['Galada','হাতের লেখা'],['Tiro Bangla','ক্লাসিক'],['Atma','মজার'],['Hind Siliguri','সাধারণ']];
const COLORS=['foil','#ffffff','#111827','#e8364f','#f5c542','#16a34a','#2563eb','#9333ea'];
const SHAPES=[['circle','বৃত্ত'],['rounded','গোলকোণা'],['arch','খিলান'],['heart','হৃদয়'],['polaroid','পোলারয়েড']];

/* ===================== layout ===================== */
function geometry(W,H,size,tpl,hasPhoto,shape){
  let g=null, tr;
  if(tpl.layout==='split'){
    if(size==='story'){ g={rect:[0,0,W,H*.5]}; tr={x:W*.08,w:W*.84,y0:H*.54,y1:H*.93}; }
    else if(size==='cover'||size==='og'){ g={rect:[0,0,W*.42,H]}; tr={x:W*.47,w:W*.49,y0:H*.1,y1:H*.9}; }
    else { g={rect:[0,0,W*.5,H]}; tr={x:W*.54,w:W*.42,y0:H*.1,y1:H*.9}; }
    return {g,tr,split:true};
  }
  const wide = size==='cover'||size==='og';
  if(hasPhoto){
    if(size==='story'){ g={cx:W/2,cy:H*.3,r:W*.27}; tr={x:W*.08,w:W*.84,y0:H*.5,y1:H*.9}; }
    else if(wide){ g={cx:W*.22,cy:H*.5,r:H*.33}; tr={x:W*.42,w:W*.53,y0:H*.1,y1:H*.9}; }
    else { g={cx:W/2,cy:H*.3,r:W*.17}; tr={x:W*.12,w:W*.76,y0:H*.53,y1:H*.9}; }
    if(shape==='polaroid'){ g.r*=.88; if(!wide) g.cy-=g.r*.14; else g.cy-=g.r*.16; }
    if(shape==='arch' && !wide){ g.cy-=g.r*.06; }
  } else {
    if(size==='story') tr={x:W*.1,w:W*.8,y0:H*.2,y1:H*.82};
    else if(wide) tr={x:W*.12,w:W*.76,y0:H*.1,y1:H*.9};
    else tr={x:W*.1,w:W*.8,y0:H*.13,y1:H*.9};
    if(tpl.badge) tr.y0 = H*(size==='story'?.34:(wide?.38:.34));
  }
  return {g,tr,split:false};
}
function wrap(c,text,maxW){ const out=[]; String(text).split('\n').forEach(par=>{ let line=''; par.split(/\s+/).filter(Boolean).forEach(w=>{ const t=line?line+' '+w:w; if(c.measureText(t).width>maxW && line){ out.push(line); line=w; } else line=t; }); out.push(line); }); return out; }
function slotPath(c,shape,g){
  const {cx,cy,r}=g;
  if(shape==='rounded'){ rr(c,cx-r,cy-r,2*r,2*r,r*.28); }
  else if(shape==='arch'){ const w=r*1.7, h=r*2.1, x=cx-w/2, y=cy-h/2; c.beginPath(); c.moveTo(x,y+h); c.lineTo(x,y+w/2); c.arc(cx,y+w/2,w/2,Math.PI,0); c.lineTo(x+w,y+h); c.closePath(); }
  else if(shape==='heart'){ const s=r*2.25; heartPath(c,cx,cy-s*.5,s); }
  else if(shape==='polaroid'){ c.beginPath(); c.rect(cx-r,cy-r,2*r,2*r); }
  else { c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); }
}
function slotBounds(shape,g){ const {cx,cy,r}=g; if(shape==='arch') return [cx-r*.85,cy-r*1.05,r*1.7,r*2.1]; if(shape==='heart'){ const s=r*2.25; return [cx-s*.5,cy-s*.5,s,s]; } return [cx-r,cy-r,2*r,2*r]; }

/* ===================== render ===================== */
function render(c,W,H,size,tpl,tx,o={}){
  const p=Object.assign({},tpl.p), wide=size==='cover'||size==='og';
  const u = wide? H*1.15 : size==='story'? W*1.2 : Math.min(W,H);
  const R=rng(1234+(o.seed||0));
  const shape = o.shape || tpl.shape || 'circle';
  const hasPhoto=!!o.photo;
  const L=geometry(W,H,size,tpl,hasPhoto,shape); L.size=size; L.shape=shape;
  const tr=L.tr; tr.y0+= (o.shift||0)*H; tr.y1+=(o.shift||0)*H;
  const font=o.font||tpl.f, ts=o.tscale||1, ms=o.mscale||1, scale=L.split&&size!=='story'?.82:1;
  const titleFont = s => `${font==='Baloo Da 2'?'800':(font==='Atma'?'600':'400')} ${s}px "${font}", "Hind Siliguri", sans-serif`;
  const items=[];
  if(tx.sub) items.push({k:'sub',t:tx.sub,font:`600 ${u*.042*scale}px "Hind Siliguri", sans-serif`,col:p.sub||p.text,lh:1.3,gap:u*.012});
  const compact = hasPhoto && !L.split && size==='post';
  if(tx.title){ let s=u*(compact?.098:.115)*scale*ts; c.font=titleFont(s); let lines=wrap(c,tx.title,tr.w); while(s>u*.05 && lines.some(l=>c.measureText(l).width>tr.w)){ s*=.92; c.font=titleFont(s); lines=wrap(c,tx.title,tr.w); }
    items.push({k:'title',t:tx.title,font:titleFont(s),col:p.title,lh:1.18,gap:u*.018}); }
  if(tx.name) items.push({k:'name',t:tx.name,font:`700 ${u*.066*scale*Math.sqrt(ts)}px "Baloo Da 2", "Hind Siliguri", sans-serif`,col:p.name,lh:1.2,gap:u*.022});
  if(tx.msg) items.push({k:'msg',t:tx.msg,font:`500 ${u*.043*scale*ms}px "Hind Siliguri", sans-serif`,col:p.text,lh:1.5,gap:u*.022,maxW:Math.min(tr.w*(tpl.pa==='alpana'?.74:1),u*.95)});
  if(tx.from) items.push({k:'from',t:tx.from,font:`600 ${u*.034*scale}px "Hind Siliguri", sans-serif`,col:p.sub||p.text,lh:1.35,gap:0,alpha:.92});
  let laid=items.map(it=>{ c.font=it.font; const sz=parseFloat(it.font.match(/(\d+(\.\d+)?)px/)[1]); const lines=wrap(c,it.t,it.maxW||tr.w); const wmax=Math.max(...lines.map(l=>c.measureText(l).width),0); return {...it,size:sz,lines,wmax,h:lines.length*sz*it.lh}; });
  let total=laid.reduce((a,b)=>a+b.h+b.gap,0); const avail=tr.y1-tr.y0;
  const refit=(it,k)=>{ it.size*=k; it.font=it.font.replace(/(\d+(\.\d+)?)px/,it.size+'px'); c.font=it.font; it.lines=wrap(c,it.t,it.maxW||tr.w); it.wmax=Math.max(...it.lines.map(l=>c.measureText(l).width)); it.h=it.lines.length*it.size*it.lh; it.gap*=k; };
  if(total>avail){ const m=laid.find(x=>x.k==='msg'); if(m){ refit(m,Math.max(.78,(avail-(total-m.h))/m.h)); total=laid.reduce((a,b)=>a+b.h+b.gap,0); } }
  for(let guard=0; total>avail && guard<8; guard++){ laid.forEach(it=>refit(it,.94)); total=laid.reduce((a,b)=>a+b.h+b.gap,0); }
  const cx=tr.x+tr.w/2, y0=tr.y0+Math.max(0,(avail-total)/2), wm=Math.max(...laid.map(x=>x.wmax),u*.2);
  L.box = laid.length ? {x0:cx-wm/2, x1:cx+wm/2, y0:y0, y1:y0+total} : null;
  /* background */
  PAINT[tpl.pa](c,W,H,p,R,u,L);
  /* photo */
  if(hasPhoto && L.g){
    const img=o.photo; let x,y,w,h;
    c.save();
    if(L.g.rect){ [x,y,w,h]=L.g.rect; c.beginPath(); c.rect(x,y,w,h); c.clip(); }
    else {
      const g=L.g; if(shape==='polaroid'){ c.translate(g.cx,g.cy); c.rotate(-.05); c.translate(-g.cx,-g.cy);
        c.save(); c.shadowColor='rgba(0,0,0,.3)'; c.shadowBlur=u*.04; c.shadowOffsetY=u*.015; c.fillStyle='#fffdf8'; c.fillRect(g.cx-g.r*1.12,g.cy-g.r*1.12,g.r*2.24,g.r*2.62); c.restore(); }
      else { c.save(); c.shadowColor='rgba(0,0,0,.28)'; c.shadowBlur=u*.04; c.shadowOffsetY=u*.012; c.fillStyle=p.ring||'#fff'; slotPath(c,shape,g); c.fill(); c.restore(); }
      [x,y,w,h]=slotBounds(shape,g); slotPath(c,shape,g); c.clip(); }
    const s=Math.max(w/img.width,h/img.height)*(o.zoom||1), iw=img.width*s, ih=img.height*s;
    const mx=(iw-w)/2, my=(ih-h)/2, ox=Math.max(-mx,Math.min(mx,(o.ox||0)*w)), oy=Math.max(-my,Math.min(my,(o.oy||0)*h));
    c.drawImage(img,x+(w-iw)/2+ox,y+(h-ih)/2+oy,iw,ih);
    c.restore();
    if(!L.g.rect && shape!=='polaroid'){ c.save(); c.strokeStyle=p.ring||'#fff'; c.lineWidth=u*.012; if(tpl.glow){ c.shadowColor=p.ring; c.shadowBlur=u*.04; } slotPath(c,shape,L.g); c.stroke(); c.restore(); }
  }
  if(DECOR[tpl.pa]) DECOR[tpl.pa](c,W,H,p,R,u,L);
  /* stickers */
  (o.stickers||[]).forEach((st,i)=>{ const S=STICK[st.t]; if(!S) return; c.save(); c.translate(st.x*W,st.y*H); c.rotate(st.r||0); S.d(c,st.s*u); c.restore();
    if(o.preview && o.sel===i){ c.save(); c.strokeStyle='#e8364f'; c.lineWidth=u*.004; c.setLineDash([u*.012,u*.008]); c.beginPath(); c.arc(st.x*W,st.y*H,st.s*u*.7,0,Math.PI*2); c.stroke(); c.restore(); } });
  /* text */
  c.textAlign='center'; c.textBaseline='alphabetic'; let y=y0;
  const titleCol = o.color || null;
  laid.forEach(it=>{ c.font=it.font; c.globalAlpha=it.alpha||1;
    let fill=it.col;
    if(it.k==='title'){ if(titleCol==='foil' || (!titleCol && tpl.foil)){ fill=lin(c,cx-it.wmax/2,0,cx+it.wmax/2,0,['#b8862b','#f7e08a','#c9973a','#fff0b3','#b8862b']); } else if(titleCol) fill=titleCol;
      if(tpl.glow){ c.shadowColor=typeof fill==='string'?fill:'#f7e08a'; c.shadowBlur=u*.035; } else { c.shadowColor='rgba(0,0,0,.18)'; c.shadowBlur=u*.012; c.shadowOffsetY=u*.004; } }
    c.fillStyle=fill;
    it.lines.forEach((ln,i)=>{ c.fillText(ln,cx,y+it.size*(i+1)*it.lh-it.size*(it.lh-1)*.5-it.size*.12); });
    c.shadowColor='transparent'; c.shadowBlur=0; c.shadowOffsetY=0; c.globalAlpha=1; y+=it.h+it.gap; });
  return L;
}
window.SHUB_RENDER = render;

/* ===================== editor ===================== */
const cv=$('cv'); if(!cv) return;
const cx=cv.getContext('2d');
let S=store.get('state',null)||{};
S=Object.assign({occ:ORDER[0],size:'post',fmt:'png',tpl:{},font:{},color:{},shape:{},text:{},ts:{},ms:{},shift:{}},S);
if(window.SHUB_PAGE && OCC[window.SHUB_PAGE]) S.occ=window.SHUB_PAGE;
let photo=null, pz=1, pox=0, poy=0, stickers=[], sel=-1, lastL=null;
const T=()=>{ const o=OCC[S.occ]; return o.tpls[Math.min(S.tpl[S.occ]||0,o.tpls.length-1)]; };
const txt=()=>{ const o=OCC[S.occ]; return Object.assign({title:o.title,sub:o.sub,name:o.name,msg:o.msgs[0],from:''},S.text[S.occ]||{}); };
const save=()=>store.set('state',S);
const opts=(extra={})=>Object.assign({photo,zoom:pz,ox:pox,oy:poy,font:S.font[S.occ],color:S.color[S.occ],shape:S.shape[S.occ],tscale:S.ts[S.occ]||1,mscale:S.ms[S.occ]||1,shift:S.shift[S.occ]||0,stickers,seed:ORDER.indexOf(S.occ)*97+(S.tpl[S.occ]||0)*13},extra);
function draw(){ const [W,H]=SIZES[S.size]; if(cv.width!==W||cv.height!==H){ cv.width=W; cv.height=H; } cx.clearRect(0,0,W,H);
  lastL=render(cx,W,H,S.size,T(),txt(),opts({preview:true,sel})); cv.style.maxHeight=S.size==='story'?'72vh':''; }
let thT; function thumbsSoon(){ clearTimeout(thT); thT=setTimeout(thumbs,220); }
function thumbs(){ const o=OCC[S.occ], cur=S.tpl[S.occ]||0;
  $('tpls').innerHTML=o.tpls.map((t,i)=>`<button class="tpl" data-i="${i}" aria-pressed="${i===cur}" title="${esc(t.n)}"><canvas width="216" height="216"></canvas><span>${esc(t.n)}</span></button>`).join('');
  $('tpls').querySelectorAll('.tpl').forEach(b=>{ const i=+b.dataset.i, cc=b.querySelector('canvas').getContext('2d'); cc.save(); cc.scale(.2,.2);
    render(cc,1080,1080,'post',o.tpls[i],txt(),opts({font:null,color:null,shape:null,stickers:[],seed:ORDER.indexOf(S.occ)*97+i*13})); cc.restore();
    b.onclick=()=>{ S.tpl[S.occ]=i; save(); $('tpls').querySelectorAll('.tpl').forEach(x=>x.setAttribute('aria-pressed',x===b)); fillStyleControls(); draw(); }; }); }
function chips(el,list,cur,on){ el.innerHTML=list.map(([k,n])=>`<button type="button" class="chip" data-k="${k}" aria-pressed="${k===cur}">${n}</button>`).join(''); el.querySelectorAll('.chip').forEach(b=>b.onclick=()=>on(b.dataset.k)); }
function fillStyleControls(){
  const f=S.font[S.occ]||T().f;
  $('fonts').innerHTML=FONTS.map(([k,n])=>`<button type="button" class="chip" data-k="${k}" aria-pressed="${k===f}" style="font-family:'${k}'">${n}</button>`).join('');
  $('fonts').querySelectorAll('.chip').forEach(b=>b.onclick=async()=>{ S.font[S.occ]=b.dataset.k; save(); await loadFont(b.dataset.k); fillStyleControls(); draw(); });
  const col=S.color[S.occ]||'';
  $('colors').innerHTML=`<button type="button" class="swatch def" data-c="" aria-pressed="${!col}" title="নকশার নিজস্ব রঙ"></button>`+COLORS.map(k=>`<button type="button" class="swatch ${k==='foil'?'foil':''}" data-c="${k}" aria-pressed="${k===col}" style="${k==='foil'?'':'background:'+k}" title="${k==='foil'?'সোনালি ফয়েল':k}"></button>`).join('');
  $('colors').querySelectorAll('.swatch').forEach(b=>b.onclick=()=>{ S.color[S.occ]=b.dataset.c; save(); fillStyleControls(); draw(); });
  chips($('shapes'),SHAPES,S.shape[S.occ]||T().shape||'circle',k=>{ S.shape[S.occ]=k; save(); fillStyleControls(); draw(); });
  $('shapeRow').hidden = T().layout==='split';
  $('tsz').value=S.ts[S.occ]||1; $('msz').value=S.ms[S.occ]||1; $('shift').value=S.shift[S.occ]||0;
}
function fillText(){ const t=txt(); $('tTitle').value=t.title; $('tSub').value=t.sub; $('tName').value=t.name; $('tMsg').value=t.msg; $('tFrom').value=t.from;
  $('msgs').innerHTML=OCC[S.occ].msgs.map((m,i)=>`<button type="button" class="msg" data-m="${i}">${esc(m)}</button>`).join('');
  $('msgs').querySelectorAll('.msg').forEach(b=>b.onclick=()=>{ const m=OCC[S.occ].msgs[+b.dataset.m]; $('tMsg').value=m; setText('msg',m); }); }
function setText(k,v){ S.text[S.occ]=Object.assign({},S.text[S.occ]||{},{[k]:v}); save(); draw(); thumbsSoon(); }
[['tTitle','title'],['tSub','sub'],['tName','name'],['tMsg','msg'],['tFrom','from']].forEach(([id,k])=>$(id).addEventListener('input',()=>setText(k,$(id).value)));
$('resetText').onclick=()=>{ delete S.text[S.occ]; S.ts[S.occ]=1; S.ms[S.occ]=1; S.shift[S.occ]=0; save(); fillText(); fillStyleControls(); draw(); thumbs(); toast('লেখা আগের মতো করা হয়েছে'); };
$('tsz').oninput=()=>{ S.ts[S.occ]=+$('tsz').value; save(); draw(); };
$('msz').oninput=()=>{ S.ms[S.occ]=+$('msz').value; save(); draw(); };
$('shift').oninput=()=>{ S.shift[S.occ]=+$('shift').value; save(); draw(); };
function occNav(){ $('occs').querySelectorAll('a[data-o]').forEach(a=>{ a.setAttribute('aria-current', a.dataset.o===S.occ?'page':'false');
  if(window.SHUB_SINGLE){ a.onclick=e=>{ e.preventDefault(); selectOcc(a.dataset.o); }; } }); }
async function selectOcc(k){ S.occ=k; save(); occNav(); const o=OCC[k]; const h=$('h1'); if(h && window.SHUB_SINGLE) h.textContent=o.h1;
  await loadFont(S.font[k]||T().f); fillText(); fillStyleControls(); draw(); thumbs(); }
document.querySelectorAll('.size').forEach(b=>b.onclick=()=>{ S.size=b.dataset.s; save(); document.querySelectorAll('.size').forEach(x=>x.setAttribute('aria-pressed',x===b)); pox=poy=0; draw(); });
document.querySelectorAll('.fmt').forEach(b=>b.onclick=()=>{ S.fmt=b.dataset.f; save(); document.querySelectorAll('.fmt').forEach(x=>x.setAttribute('aria-pressed',x===b)); });

/* photo */
$('file').onchange=e=>{ const f=e.target.files[0]; if(!f) return; const r=new FileReader();
  r.onload=()=>{ const img=new Image(); img.onload=()=>{ const k=Math.min(1,2200/Math.max(img.width,img.height)); if(k<1){ const cc=document.createElement('canvas'); cc.width=img.width*k; cc.height=img.height*k; cc.getContext('2d').drawImage(img,0,0,cc.width,cc.height); const i2=new Image(); i2.onload=()=>{ photo=i2; afterPhoto(); }; i2.src=cc.toDataURL('image/jpeg',.92); } else { photo=img; afterPhoto(); } };
    img.onerror=()=>toast('ছবিটি খোলা যায়নি, অন্য ছবি চেষ্টা করুন'); img.src=r.result; }; r.readAsDataURL(f); e.target.value=''; };
function afterPhoto(){ pz=1; pox=poy=0; $('zoom').value=1; $('photoCtl').hidden=false; $('hint').textContent='ছবি বা স্টিকার টেনে সরান।'; draw(); thumbs(); }
$('rmPhoto').onclick=()=>{ photo=null; $('photoCtl').hidden=true; $('hint').textContent='ছবি দিলে বা স্টিকার বসালে টেনে সরাতে পারবেন।'; draw(); thumbs(); };
$('zoom').oninput=()=>{ pz=+$('zoom').value; draw(); };

/* stickers */
$('stickers').innerHTML=Object.entries(STICK).map(([k,s])=>`<button type="button" class="stk" data-s="${k}" title="${s.n}"><canvas width="96" height="96"></canvas></button>`).join('');
$('stickers').querySelectorAll('.stk').forEach(b=>{ const c=b.querySelector('canvas').getContext('2d'); c.translate(48,52); STICK[b.dataset.s].d(c,70);
  b.onclick=()=>{ stickers.push({t:b.dataset.s,x:.5+(Math.random()-.5)*.3,y:.22+Math.random()*.15,s:.14,r:0}); sel=stickers.length-1; stickCtl(); draw(); }; });
function stickCtl(){ $('stkCtl').hidden=sel<0; if(sel>=0){ $('ssz').value=stickers[sel].s; $('srot').value=stickers[sel].r||0; } }
$('ssz').oninput=()=>{ if(sel>=0){ stickers[sel].s=+$('ssz').value; draw(); } };
$('srot').oninput=()=>{ if(sel>=0){ stickers[sel].r=+$('srot').value; draw(); } };
$('sdel').onclick=()=>{ if(sel>=0){ stickers.splice(sel,1); sel=-1; stickCtl(); draw(); } };
$('sdone').onclick=()=>{ sel=-1; stickCtl(); draw(); };

/* dragging photo / stickers */
let drag=null;
function canvasPt(e){ const r=cv.getBoundingClientRect(), k=cv.width/r.width; return [(e.clientX-r.left)*k,(e.clientY-r.top)*k]; }
cv.addEventListener('pointerdown',e=>{ const [x,y]=canvasPt(e), W=cv.width, H=cv.height, u=S.size==='cover'?H*1.15:S.size==='story'?W*1.2:Math.min(W,H);
  for(let i=stickers.length-1;i>=0;i--){ const st=stickers[i]; if(Math.hypot(x-st.x*W,y-st.y*H)<st.s*u*.7){ sel=i; stickCtl(); drag={type:'s',i,x,y,ox:st.x,oy:st.y}; break; } }
  if(!drag && photo && lastL && lastL.g){ drag={type:'p',x,y,ox:pox,oy:poy}; if(sel>=0){ sel=-1; stickCtl(); } }
  if(drag){ cv.setPointerCapture(e.pointerId); cv.classList.add('dragging'); draw(); } });
cv.addEventListener('pointermove',e=>{ if(!drag) return; const [x,y]=canvasPt(e), W=cv.width, H=cv.height;
  if(drag.type==='s'){ const st=stickers[drag.i]; st.x=Math.max(0,Math.min(1,drag.ox+(x-drag.x)/W)); st.y=Math.max(0,Math.min(1,drag.oy+(y-drag.y)/H)); }
  else { const g=lastL.g, w=g.rect?g.rect[2]:g.r*2, h=g.rect?g.rect[3]:g.r*2; pox=drag.ox+(x-drag.x)/w; poy=drag.oy+(y-drag.y)/h; }
  draw(); });
const endDrag=()=>{ if(drag){ const t=drag.type; drag=null; cv.classList.remove('dragging'); if(t==='p') thumbsSoon(); } };
cv.addEventListener('pointerup',endDrag); cv.addEventListener('pointercancel',endDrag);

/* fonts */
async function loadFont(f){ try{ await Promise.race([document.fonts.load(`700 40px "${f}"`,'শুভ জন্মদিন'),new Promise(r=>setTimeout(r,2500))]); }catch(e){} }

/* export */
function exportBlob(){ return new Promise(res=>{ const [W,H]=SIZES[S.size], c=document.createElement('canvas'); c.width=W; c.height=H; const x=c.getContext('2d');
  if(S.fmt==='jpg'){ x.fillStyle='#ffffff'; x.fillRect(0,0,W,H); }
  render(x,W,H,S.size,T(),txt(),opts({preview:false})); c.toBlob(res, S.fmt==='jpg'?'image/jpeg':'image/png', .93); }); }
const fname=()=>`${OCC[S.occ].slug}-${S.size}.${S.fmt==='jpg'?'jpg':'png'}`;
$('dl').onclick=async()=>{ const b=await exportBlob(); if(!b){ toast('ছবি তৈরি করা যায়নি'); return; }
  if(window.claude && typeof window.claude.use==='function'){ const d=await window.claude.use('downloads'); if(!d){ toast('এখানে ডাউনলোড চালু নেই'); return; }
    try{ await d.save({filename:fname(),data:b}); toast('কার্ড সেভ হয়েছে, এবার ফেসবুকে পোস্ট করুন'); }catch(e){ if(e&&e.code!=='declined') toast('ডাউনলোড করা যায়নি'); } return; }
  const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=fname(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); toast('কার্ড সেভ হয়েছে, এবার ফেসবুকে পোস্ট করুন'); };
(async()=>{ try{ const f=new File([new Blob(['x'])],'t.png',{type:'image/png'}); if(navigator.canShare && navigator.canShare({files:[f]})) $('share').hidden=false; }catch(e){} })();
$('share').onclick=async()=>{ try{ const b=await exportBlob(); const f=new File([b],fname(),{type:b.type}); await navigator.share({files:[f],title:OCC[S.occ].title}); }catch(e){ if(e&&e.name!=='AbortError') toast('শেয়ার করা যায়নি, ডাউনলোড করে পোস্ট করুন'); } };

/* init */
(async function(){
  document.querySelectorAll('.size').forEach(x=>x.setAttribute('aria-pressed',x.dataset.s===S.size));
  document.querySelectorAll('.fmt').forEach(x=>x.setAttribute('aria-pressed',x.dataset.f===S.fmt));
  occNav(); fillText(); fillStyleControls(); draw(); thumbs();
  await Promise.all(FONTS.map(f=>loadFont(f[0])));
  draw(); thumbs();
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>{ draw(); thumbs(); });
})();
})();
