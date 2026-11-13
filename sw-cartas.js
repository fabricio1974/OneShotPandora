const N='cartas-v4';
const BASE=['cartas.html','img/cartas/moldura_p.jpg','img/cartas/moldura_ab.jpg','img/cartas/verso.jpg','img/cartas/ic_s.png','img/cartas/ic_a.png','img/cartas/ic_m.png','img/cartas/ic_h.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(N).then(c=>c.addAll(BASE)).catch(()=>{}))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==N&&k.startsWith('cartas-')).map(k=>caches.delete(k)))).then(()=>clients.claim())));
// A página (navegação) vai primeiro à rede, com 2,5 s de prazo, e cai no cache: assim uma atualização aparece na hora e sem sinal ainda abre.
// Imagens: cache primeiro e atualiza por trás.
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||!r.url.startsWith(self.location.origin))return;
 if(r.mode==='navigate'){e.respondWith(caches.open(N).then(async c=>{
   const rede=fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x});
   const prazo=new Promise((_,no)=>setTimeout(no,2500));
   try{return await Promise.race([rede,prazo])}catch(_){return (await c.match(r,{ignoreSearch:true}))||rede}}));return}
 e.respondWith(caches.open(N).then(async c=>{const h=await c.match(r);const f=fetch(r).then(x=>{if(x.ok)c.put(r,x.clone());return x}).catch(()=>h);return h||f}))});
