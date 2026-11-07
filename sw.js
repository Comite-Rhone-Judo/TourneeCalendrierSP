// L'application s'ouvre toujours depuis le téléphone. S'il y a du réseau, la copie est rafraîchie
// en contournant le cache HTTP, pour que la nouvelle version soit prise dès sa publication.
const VERSION='7';
const CACHE='tournee-v'+VERSION;
const FILES=['./','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png','leaflet.js','leaflet.css'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE)
  .then(c=>Promise.all(FILES.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error(u);return c.put(u,r)}))))
  .then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(e.request.method!=='GET'||url.origin!==self.location.origin||url.pathname.endsWith('/sw.js'))return;
  const nav=e.request.mode==='navigate';
  const key=nav?'./':e.request;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(key,{ignoreSearch:true});
    const net=fetch(nav?new Request('./',{cache:'no-cache'}):new Request(e.request,{cache:'no-cache'})).then(r=>{if(r.ok)c.put(key,r.clone());return r});
    if(hit){e.waitUntil(net.catch(()=>{}));return hit}
    return net;
  }));
});
