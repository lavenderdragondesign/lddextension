async function getStatus(){ const r=await chrome.runtime.sendMessage({type:'GET_STATUS'}); return !!(r&&r.enabled); }
async function syncUI(){ const en=await getStatus(); document.getElementById('status').textContent=en?'Enabled':'Disabled'; document.getElementById('toggleBtn').textContent=en?'Disable':'Enable'; }
document.getElementById('openApp').addEventListener('click',()=>chrome.tabs.create({url:'https://mydesigns.io/app'}));
document.getElementById('toggleBtn').addEventListener('click', async ()=>{ const en=await getStatus(); if(en){ document.getElementById('confirmModal').classList.remove('hidden'); } else { await chrome.runtime.sendMessage({type:'ENABLE_NOW'}); await syncUI(); } });
document.getElementById('cancelDisable').addEventListener('click',()=>document.getElementById('confirmModal').classList.add('hidden'));
document.getElementById('keepEnabled').addEventListener('click', async ()=>{ await chrome.runtime.sendMessage({type:'ENABLE_NOW'}); document.getElementById('confirmModal').classList.add('hidden'); await syncUI(); });
document.getElementById('confirmDisable').addEventListener('click', async ()=>{ await chrome.runtime.sendMessage({type:'DISABLE_CONFIRM_REFRESH'}); document.getElementById('confirmModal').classList.add('hidden'); await syncUI(); });
syncUI();