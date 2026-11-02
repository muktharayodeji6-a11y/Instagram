const V='igdemo-v1';
const FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','icon-maskable.png','feed1.webp','feed2.webp','profile.webp','navH.webp','navP.webp','popCard.webp','popMenu.webp','poster.jpg','vid.mp4'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
async function ranged(req,res){
  const buf=await res.arrayBuffer();
  const m=/bytes=(\d*)-(\d*)/.exec(req.headers.get('range')||'');
  const size=buf.byteLength;
  let s=m&&m[1]?parseInt(m[1],10):0;
  let en=m&&m[2]?parseInt(m[2],10):size-1;
  if(en>=size)en=size-1;
  return new Response(buf.slice(s,en+1),{status:206,headers:{
    'Content-Type':res.headers.get('Content-Type')||'video/mp4',
    'Content-Range':'bytes '+s+'-'+en+'/'+size,
    'Content-Length':String(en-s+1),'Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  e.respondWith((async()=>{
    const hit=await caches.match(req,{ignoreSearch:true});
    if(hit){
      if(req.headers.has('range'))return ranged(req,hit);
      return hit;
    }
    try{return await fetch(req)}catch(err){
      if(req.mode==='navigate')return caches.match('index.html');
      throw err;
    }
  })());
});
