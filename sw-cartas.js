const N='cartas-v3';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(N).then(c=>c.addAll(['cartas.html','img/cartas/moldura_p.jpg','img/cartas/moldura_ab.jpg','img/cartas/verso.jpg','img/cartas/ic_s.png','img/cartas/ic_a.png','img/cartas/ic_m.png','img/cartas/ic_h.png']).catch(()=>{})))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==N&&k.startsWith('cartas-')).map(k=>caches.delete(k)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
e.respondWith(caches.open(N).then(async c=>{const h=await c.match(e.request);const r=fetch(e.request).then(x=>{if(x.ok)c.put(e.request,x.clone());return x}).catch(()=>h);return h||r}))});
