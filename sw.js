
async function registerUserScript(){
  if (chrome.userScripts?.configureWorld) await chrome.userScripts.configureWorld({ messaging: true });
  try { await chrome.userScripts.unregister(); } catch {}
  await chrome.userScripts.register([{
    id: "ldd-userscript",
    matches: ["https://mydesigns.io/app/*"],
    world: "USER_SCRIPT",
    runAt: "document_idle",
    js: [{ file: "gm-us.js" }, { file: "userscript.js" }]
  }]);
}
async function unregisterUserScript(){ try { await chrome.userScripts.unregister(); } catch {} }

async function ensureDefaultEnabled(){
  let { ldd_enabled } = await chrome.storage.local.get("ldd_enabled");
  if (ldd_enabled === undefined) {
    await chrome.storage.local.set({ ldd_enabled: true });
    await registerUserScript();
    await chrome.action.setBadgeText({ text: "" });
    return true;
  }
  return false;
}

async function applyEnabledState(){
  const defaulted = await ensureDefaultEnabled();
  if (defaulted) return;
  const { ldd_enabled } = await chrome.storage.local.get("ldd_enabled");
  if (ldd_enabled) {
    await registerUserScript();
    await chrome.action.setBadgeText({ text: "" });
  } else {
    await unregisterUserScript();
    await chrome.action.setBadgeText({ text: "OFF" });
    await chrome.action.setBadgeBackgroundColor({ color: "#A0A0A0" });
  }
}

async function disableAndRefreshActive(){
  await chrome.storage.local.set({ ldd_enabled: false });
  await applyEnabledState();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true, url: "https://mydesigns.io/*" });
  if (tab) chrome.tabs.reload(tab.id);
}

async function enableAndRefreshActive(){
  await chrome.storage.local.set({ ldd_enabled: true });
  await applyEnabledState();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true, url: "https://mydesigns.io/*" });
  if (tab) chrome.tabs.reload(tab.id);
}

chrome.runtime.onInstalled.addListener(applyEnabledState);
chrome.runtime.onStartup.addListener(applyEnabledState);

// GM_XHR proxy
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;
  if (message.type === 'GM_XHR') {
    (async () => {
      try {
        const { url, method='GET', headers={}, data, responseType } = message.opts || {};
        const res = await fetch(url, { method, headers, body: data, mode: 'cors', credentials: 'omit', redirect: 'follow' });
        const text = responseType === 'arraybuffer' ? '' : await res.text();
        const hdrs = []; res.headers.forEach((v,k)=>hdrs.push(`${k}: ${v}`));
        sendResponse({ ok: res.ok, status: res.status, statusText: res.statusText, finalUrl: res.url, responseText: text, responseHeaders: hdrs.join('\r\n') });
      } catch (e) {
        sendResponse({ ok: false, status: 0, statusText: String(e), finalUrl: '', responseText: '' });
      }
    })();
    return true;
  }
  if (message.type === "GET_STATUS") {
    (async ()=>{
      await ensureDefaultEnabled();
      const { ldd_enabled } = await chrome.storage.local.get("ldd_enabled");
      sendResponse({ enabled: !!ldd_enabled });
    })();
    return true;
  }
  if (message.type === "ENABLE_NOW") {
    (async ()=>{ await enableAndRefreshActive(); sendResponse({ ok: true }); })();
    return true;
  }
  if (message.type === "DISABLE_CONFIRM_REFRESH") {
    (async ()=>{ await disableAndRefreshActive(); sendResponse({ ok: true }); })();
    return true;
  }
});
