const CORE_CACHE='jjk-core-v24';
const ASSET_CACHE='jjk-assets';
const CORE_URLS=['./','index.html'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(CORE_CACHE).then(function(c){return c.addAll(CORE_URLS);}).catch(function(){}));});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.map(function(k){if(k!==CORE_CACHE&&k!==ASSET_CACHE)return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});
self.addEventListener('fetch',function(e){
  var req=e.request; if(req.method!=='GET')return;
  var url=new URL(req.url); if(url.origin!==location.origin)return;
  if(url.pathname.indexOf('/assets/')>=0){
    e.respondWith(caches.open(ASSET_CACHE).then(function(c){return c.match(req).then(function(hit){return hit||fetch(req).then(function(resp){if(resp&&resp.ok){var cp=resp.clone();c.put(req,cp).catch(function(){});}return resp;});});}));
    return;
  }
  e.respondWith(caches.open(CORE_CACHE).then(function(c){return c.match(req).then(function(hit){
    var net=fetch(req).then(function(resp){if(resp&&resp.ok){var cp=resp.clone();c.put(req,cp).catch(function(){});}return resp;}).catch(function(){return hit;});
    return hit||net;
  });}));
});
