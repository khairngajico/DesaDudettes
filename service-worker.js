const CACHE='desa-card-v3';
const root=new URL('./',self.location.href);
const paths=['index.html','app.js','manifest.webmanifest','counter-manifest.webmanifest','admin-manifest.webmanifest','icon-192.png','icon-512.png','counter-icon-192.png','counter-icon-512.png','app-ahli/index.html','app-kaunter/index.html','app-admin/index.html'];
const assets=paths.map(p=>new URL(p,root).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(assets))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('desa-card-')&&k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==root.origin)return;
 let relative=url.pathname.startsWith(root.pathname)?url.pathname.slice(root.pathname.length):null;
 if(relative===null)return;
 if(relative==='')relative='index.html';
 if(['app-ahli/','app-kaunter/','app-admin/'].includes(relative))relative+='index.html';
 const target=new URL(relative,root).href;
 // Cache public app files only. No auth/API responses, customer data, QR or receipts.
 if(!assets.includes(target)||(url.search&&!['?app=member','?app=counter','?app=admin'].includes(url.search)))return;
 event.respondWith(fetch(event.request,{cache:'no-cache'}).then(response=>{if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(target,copy)))}return response}).catch(()=>caches.match(target).then(cached=>cached||Response.error())));
});
