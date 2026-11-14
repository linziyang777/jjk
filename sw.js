const CORE_CACHE='jjk-core-v497';
const ASSET_CACHE='jjk-assets';
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){
  e.waitUntil(
    caches.keys().then(function(keys){return Promise.all(keys.map(function(k){
      if(k!==CORE_CACHE&&k!==ASSET_CACHE) return caches.delete(k);
    }));}).then(function(){return self.clients.claim();}).then(function(){
      return self.clients.matchAll({type:'window'});
    }).then(function(cs){
      cs.forEach(function(c){ try{ c.navigate(c.url); }catch(e){} });
    }).catch(function(){})
  );
});
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==location.origin) return;          /* CDN 资源不介入 */
  var isDoc = req.mode==='navigate' || /(\/|index\.html)$/.test(url.pathname);
  if(!isDoc) return;
  /* 文档：网络优先，离线才回缓存 */
  e.respondWith(
    fetch(req).then(function(resp){
      if(resp&&resp.ok){ var cp=resp.clone(); caches.open(CORE_CACHE).then(function(c){ c.put(req,cp).catch(function(){}); }); }
      return resp;
    }).catch(function(){ return caches.match(req); })
  );
});
