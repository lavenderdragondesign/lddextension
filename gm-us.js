// GM shims with robust messaging + proxy + bootstrap
(function(){
  if (!window.GM_addStyle) window.GM_addStyle = (css)=>{ const s=document.createElement('style'); s.textContent=css; (document.head||document.documentElement).appendChild(s); return s; };
  const K=(k)=>"LDD_GM_"+k;
  window.GM_getValue=(k,d)=>{ try{const v=localStorage.getItem(K(k)); return v==null?d:JSON.parse(v);}catch(_){return d;} };
  window.GM_setValue=(k,v)=>{ try{localStorage.setItem(K(k),JSON.stringify(v));}catch(_){}};

  const EXT_ID = (chrome && chrome.runtime && chrome.runtime.id) ? chrome.runtime.id : null;
  const PROXY_HOSTS = [
    /(^|\.)suggestqueries\.google\.com$/i,
    /(^|\.)completion\.amazon\.com$/i,
    /(^|\.)redbubble\.com$/i,
    /(^|\.)etsy\.com$/i,
    /(^|\.)bing\.com$/i,
    /(^|\.)api\.bing\.com$/i
  ];
  const proxyUrl=(u)=>"https://api.allorigins.win/raw?url="+encodeURIComponent(u);
  const shouldProxy=(u)=>{ try{const x=new URL(u); return PROXY_HOSTS.some(rx=>rx.test(x.hostname));}catch(_){return false;} };

  function sendMsg(payload){
    try{
      if (EXT_ID) return chrome.runtime.sendMessage(EXT_ID, payload);
      return chrome.runtime.sendMessage(payload);
    }catch(e){
      return Promise.reject(e);
    }
  }

  window.GM_xmlhttpRequest = function(opts){
    const payload = { type: 'GM_XHR', opts: {
      url: opts.url, method: (opts.method||'GET'), headers: (opts.headers||{}), data: opts.data, responseType: opts.responseType
    }};
    sendMsg(payload).then((res)=>{
      if (res && res.ok){
        const p={ responseText: res.responseText||'', status: res.status||0, statusText: res.statusText||'', finalUrl: res.finalUrl||'', responseHeaders: res.responseHeaders||'' };
        if (opts.responseType==='json'){ try{ p.response=JSON.parse(p.responseText);}catch{} }
        opts.onload && opts.onload(p); opts.onloadend && opts.onloadend(); return;
      }
      const target = shouldProxy(opts.url) ? proxyUrl(opts.url) : opts.url;
      fetch(target, { method:(opts.method||'GET'), headers:(opts.headers||{}), body:opts.data, credentials:'omit', mode:'cors' })
        .then(async r=>{ const text=await r.text(); const p={responseText:text,status:r.status,statusText:r.statusText,finalUrl:r.url,responseHeaders:''}; if(opts.responseType==='json'){try{p.response=JSON.parse(p.responseText);}catch{}} opts.onload&&opts.onload(p); opts.onloadend&&opts.onloadend(); })
        .catch(err=>{ opts.onerror&&opts.onerror(err); opts.onloadend&&opts.onloadend(); });
    }).catch((_e)=>{
      const target = shouldProxy(opts.url) ? proxyUrl(opts.url) : opts.url;
      fetch(target, { method:(opts.method||'GET'), headers:(opts.headers||{}), body:opts.data, credentials:'omit', mode:'cors' })
        .then(async r=>{ const text=await r.text(); const p={responseText:text,status:r.status,statusText:r.statusText,finalUrl:r.url,responseHeaders:''}; if(opts.responseType==='json'){try{p.response=JSON.parse(p.responseText);}catch{}} opts.onload&&opts.onload(p); opts.onloadend&&opts.onloadend(); })
        .catch(err=>{ opts.onerror&&opts.onerror(err); opts.onloadend&&opts.onloadend(); });
    });

  };

  // Resilient bootstrap for UI init
  (function bootstrap(){
    function tryInit(){
      try{
        const api = window.LDD||window.ldd||window.LavenderDragon||window.MDEnhancer;
        const fn = api && (api.init||api.mount||api.start||api.bootstrap);
        if (fn){ fn.call(api); return true; }
      }catch(e){}
      return false;
    }
    if (document.readyState==='complete' || document.readyState==='interactive'){ if (tryInit()) return; }
    else { document.addEventListener('DOMContentLoaded', ()=>tryInit(), {once:true}); }
    let tries=0; const t=setInterval(()=>{ if(tryInit()||++tries>120) clearInterval(t); }, 250);
  })();
})();