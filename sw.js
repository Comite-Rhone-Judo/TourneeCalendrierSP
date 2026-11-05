// L'application s'ouvre toujours depuis le téléphone. S'il y a du réseau, la copie est rafraîchie pour le prochain lancement.
const CACHE='tournee-v5';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','leaflet.js','leaflet.css'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
  const key=e.request.mode==='navigate'?'./':e.request;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(key,r.clone());return r});
    if(hit){net.catch(()=>{});return hit}
    return net;
  }));
});
