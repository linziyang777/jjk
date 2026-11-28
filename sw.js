const CORE_CACHE='jjk-core-v673';
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
function netOnly(req){ try{ return new Request(req,{cache:'no-store'}); }catch(e){ return req; } }
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET')return;
  var url=new URL(req.url);
  if(url.origin!==location.origin) return;          /* CDN 资源不介入 */
  var isDoc = req.mode==='navigate' || /(\/|index\.html)$/.test(url.pathname);
  /* ★ v523 資源改回同源後，assets 由 SW 緩存托底：檔名即內容哈希 ⇒ cache-first 永不失效 */
  var isAsset = url.pathname.indexOf('/assets/') >= 0;
  if(isAsset){
    if(req.headers.get('range')) return;      /* 分段請求直通，206 寫進緩存會毀掉影片/音頻 */
    e.respondWith(
      caches.open(ASSET_CACHE).then(function(c){
        return c.match(req).then(function(hit){
          if(hit) return hit;
          return fetch(req).then(function(resp){
            if(resp&&resp.ok){ var cp=resp.clone(); c.put(req,cp).catch(function(){}); }
            return resp;
          });
        });
      })
    );
    return;
  }
  if(!isDoc) return;
  /* 文档：网络优先，离线才回缓存 */
  e.respondWith(
    fetch(netOnly(req)).then(function(resp){
      if(resp&&resp.ok){ var cp=resp.clone(); caches.open(CORE_CACHE).then(function(c){ c.put(req,cp).catch(function(){}); }); }
      return resp;
    }).catch(function(){ return caches.match(req); })
  );
});
