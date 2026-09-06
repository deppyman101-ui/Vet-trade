(()=>{
const SUPA='https://iymhyxheggqsewpczgjl.supabase.co',KEY='sb_publishable_Q8yb_Mw70jDkwld8YGQRRw_h-T5Rau2';
const $=(s,r=document)=>r.querySelector(s),qsa=(s,r=document)=>[...r.querySelectorAll(s)];
async function availability(date,service){
  const r=await fetch(SUPA+'/rest/v1/rpc/pressed_slot_availability',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_date:date,p_service:service})});
  if(!r.ok)throw new Error('Could not load live availability.');
  const d=await r.json();return Array.isArray(d)?d:[];
}
async function render(){
  const wrap=$('#slotGrid'),date=$('#collectionDate')?.value,service=window.PRESSED_SERVICE||'small';
  if(!wrap||!date)return;
  const requested=date+'|'+service;wrap.dataset.liveRequest=requested;
  wrap.innerHTML='<div class="muted">Checking live availability…</div>';
  try{
    const rows=await availability(date,service);
    if(wrap.dataset.liveRequest!==requested)return;
    wrap.innerHTML=rows.map(x=>{const n=Number(x.remaining||0);return `<button type="button" class="slot ${n?'':'sold'}" data-slot="${x.slot}" ${n?'':'disabled'}>${x.slot}<small>${n?`${n} space${n===1?'':'s'} left`:'Full'}</small></button>`}).join('');
    window.PRESSED_SLOT='';
    qsa('.slot',wrap).forEach(b=>b.onclick=()=>{qsa('.slot',wrap).forEach(x=>x.classList.remove('active'));b.classList.add('active');window.PRESSED_SLOT=b.dataset.slot;const s=$('#sumCollection');if(s)s.textContent=date+' · '+b.dataset.slot;});
  }catch(e){
    if(wrap.dataset.liveRequest===requested)wrap.innerHTML='<div class="empty">Could not check availability. Refresh the page and try again.</div>';
  }
}
window.PressedLiveSlots={refresh:render};
document.addEventListener('DOMContentLoaded',()=>{render();$('#collectionDate')?.addEventListener('change',()=>setTimeout(render,0));document.addEventListener('click',e=>{if(e.target?.closest?.('.service')||e.target?.closest?.('[data-service]'))setTimeout(render,0);});});
})();