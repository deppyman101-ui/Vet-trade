(()=>{
const SUPA='https://iymhyxheggqsewpczgjl.supabase.co',KEY='sb_publishable_Q8yb_Mw70jDkwld8YGQRRw_h-T5Rau2';
const $=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
async function rpc(name,body){const r=await fetch(SUPA+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Could not load live availability.');const d=await r.json();return Array.isArray(d)?d:[]}
async function renderCollection(){
 const wrap=$('#slotGrid'),date=$('#collectionDate')?.value,service=window.PRESSED_SERVICE||'small';if(!wrap||!date)return;
 const requested=date+'|'+service;wrap.dataset.liveRequest=requested;wrap.innerHTML='<div class="muted">Checking live collection space…</div>';
 try{const rows=await rpc('pressed_slot_availability',{p_date:date,p_service:service});if(wrap.dataset.liveRequest!==requested)return;wrap.innerHTML=rows.map(x=>{const n=Number(x.remaining||0);return `<button type="button" class="slot ${n?'':'sold'}" data-slot="${x.slot}" ${n?'':'disabled'}>${x.slot}<small>${n?`${n} space${n===1?'':'s'} left`:'Full'}</small></button>`}).join('');window.PRESSED_SLOT='';qsa('.slot',wrap).forEach(b=>b.onclick=()=>{qsa('.slot',wrap).forEach(x=>x.classList.remove('active'));b.classList.add('active');window.PRESSED_SLOT=b.dataset.slot;const s=$('#sumCollection');if(s)s.textContent=date+' · '+b.dataset.slot;});}catch(e){if(wrap.dataset.liveRequest===requested)wrap.innerHTML='<div class="empty">Could not check collection space. Refresh and try again.</div>'}
}
async function renderReturn(){
 const date=$('#returnDate')?.value,service=window.PRESSED_SERVICE||'small',sel=$('#returnSlot');if(!sel||!date)return;
 const requested=date+'|'+service;sel.dataset.liveRequest=requested;sel.innerHTML='<option value="">Checking return space…</option>';
 try{const rows=await rpc('pressed_return_availability',{p_date:date,p_service:service});if(sel.dataset.liveRequest!==requested)return;const open=rows.filter(x=>Number(x.remaining||0)>0);sel.innerHTML=rows.map(x=>{const n=Number(x.remaining||0);return `<option value="${n?x.slot:''}" ${n?'':'disabled'}>${x.slot} — ${n?`${n} space${n===1?'':'s'} left`:'Full'}</option>`}).join('')||'<option value="">No return space</option>';if(!open.length){sel.value='';}else{sel.value=open[0].slot}const sum=$('#sumReturn');if(sum)sum.textContent=date+(sel.value?' · '+sel.value:' · choose another date');}catch(e){sel.innerHTML='<option value="">Could not check return space</option>'}
}
function refreshAll(){setTimeout(()=>{renderCollection();renderReturn()},0)}
window.PressedLiveSlots={refresh:renderCollection,refreshReturn:renderReturn,refreshAll};
document.addEventListener('DOMContentLoaded',()=>{refreshAll();$('#collectionDate')?.addEventListener('change',refreshAll);$('#returnDate')?.addEventListener('change',()=>setTimeout(renderReturn,0));document.addEventListener('click',e=>{if(e.target?.closest?.('.service')||e.target?.closest?.('[data-service]'))refreshAll();});});
})();