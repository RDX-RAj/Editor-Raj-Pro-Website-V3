const CACHE_NAME='editor-raj-existing-v10';
const STATIC=['./','./index.html','./style.css','./script.js','./config.js','./manifest.json','./1762319150601.jpg','./IMG_20260323_213556.jpg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(STATIC)))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(u.pathname.endsWith('/config.js')||u.pathname.endsWith('/script.js')||u.pathname.endsWith('/style.css')||u.pathname.endsWith('/index.html')){
  e.respondWith(fetch(e.request,{cache:'no-store'}).catch(()=>caches.match(e.request)));return;
 }
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});
