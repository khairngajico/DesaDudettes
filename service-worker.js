const CACHE='desa-card-v2';
const root=new URL('./',self.location.href);
const paths=['index.html','manifest.webmanifest','counter-manifest.webmanifest','icon-192.png','icon-512.png','counter-icon-192.png','counter-icon-512.png'];
const assets=paths.map(p=>new URL(p,root).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(assets))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('desa-card-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==root.origin)return;
 // Only the public app shell is cached. Auth, Firestore, receipts and QR data never enter Cache Storage.
 const target=url.pathname===root.pathname?new URL('index.html',root).href:url.href;
 if(!assets.includes(target)||(url.search&&!['?app=member','?app=counter'].includes(url.search)))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(target,copy)))}return response}).catch(()=>caches.match(target).then(cached=>cached||Response.error())));
});
