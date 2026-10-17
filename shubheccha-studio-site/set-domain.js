// ব্যবহার: node set-domain.js https://আপনার-সাইট.vercel.app
const fs=require('fs'), path=require('path');
const d=(process.argv[2]||'').replace(/\/+$/,'');
if(!/^https?:\/\/[^\s/]+$/.test(d)){ console.log('সঠিক ঠিকানা দিন, যেমন: node set-domain.js https://shubheccha.vercel.app'); process.exit(1); }
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?(e.name==='node_modules'||e.name==='.git'?[]:walk(path.join(dir,e.name))):[path.join(dir,e.name)]);
let n=0; for(const f of walk(__dirname)){ if(!/\.(html|xml|txt)$/.test(f)) continue; const s=fs.readFileSync(f,'utf8'); if(s.includes('https://YOUR-SITE.vercel.app')){ fs.writeFileSync(f,s.split('https://YOUR-SITE.vercel.app').join(d)); n++; } }
console.log(n+'টি ফাইলে ঠিকানা বসানো হয়েছে: '+d);
