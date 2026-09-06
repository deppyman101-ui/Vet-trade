(()=>{
const STORE='pressed_db_bookings_v1';
const PRICE={small:27.99,large:37.99,suit:25,express:49.99};
const LABEL={small:'Small Bag',large:'Large Bag',suit:'Suit Service',express:'Same-Day Express'};
const SLOT_CAP=4, EXPRESS_CAP=2;
const getBookings=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch(e){return[]}};
const saveBookings=(x)=>localStorage.setItem(STORE,JSON.stringify(x));
const money=(n)=>'£'+Number(n||0).toFixed(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const today=()=>{const d=new Date();return d.toISOString().slice(0,10)};
const addDays=(iso,n)=>{const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
const ref=()=>`PDB-${today().replaceAll('-','')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
const servicePrice=(type,shirts)=>PRICE[type]+((type==='small'||type==='large')?(Number(shirts)||0)*3:0);
const qs=(s,r=document)=>r.querySelector(s), qsa=(s,r=document)=>[...r.querySelectorAll(s)];
const setText=(id,v)=>{const e=qs('#'+id);if(e)e.textContent=v};
function remaining(date,slot,type){
 const list=getBookings().filter(b=>b.collectionDate===date&&b.status!=='Cancelled');
 if(type==='express') return Math.max(0,EXPRESS_CAP-list.filter(b=>b.service==='express').length);
 return Math.max(0,SLOT_CAP-list.filter(b=>b.collectionSlot===slot).length);
}
function renderSlots(){
 const date=qs('#collectionDate')?.value||today();
 const service=window.PRESSED_SERVICE||'small';
 const wrap=qs('#slotGrid'); if(!wrap)return;
 const slots=service==='express'?['08:00–10:00','10:00–12:00']:['09:00–12:00','12:00–15:00','15:00–18:00'];
 wrap.innerHTML=slots.map((s,i)=>{const r=remaining(date,s,service);return `<button type="button" class="slot ${r?'':'sold'}" data-slot="${s}" ${r?'':'disabled'}>${s}<small>${r?`${r} space${r===1?'':'s'} left`:'Full'}</small></button>`}).join('');
 qsa('.slot',wrap).forEach(b=>b.onclick=()=>{qsa('.slot',wrap).forEach(x=>x.classList.remove('active'));b.classList.add('active');window.PRESSED_SLOT=b.dataset.slot;refreshSummary()});
 window.PRESSED_SLOT='';
}
function refreshReturn(){
 const service=window.PRESSED_SERVICE||'small'; const cd=qs('#collectionDate')?.value||today();
 const rd=qs('#returnDate'), rs=qs('#returnSlot'); if(!rd||!rs)return;
 if(service==='express'){
  rd.value=cd;rd.min=cd;rd.max=cd;rd.disabled=true;
  rs.innerHTML='<option value="18:00–21:00">18:00–21:00</option>';rs.disabled=true;
 }else{
  rd.disabled=false;rs.disabled=false;rd.min=addDays(cd,1);rd.max=addDays(cd,3);
  if(!rd.value||rd.value<=cd)rd.value=addDays(cd,1);
  rs.innerHTML='<option value="17:00–20:00">17:00–20:00</option><option value="19:00–21:00">19:00–21:00</option>';
 }
}
function refreshSummary(){
 const service=window.PRESSED_SERVICE||'small'; const shirts=Number(qs('#extraShirts')?.value||0); const price=servicePrice(service,shirts);
 setText('sumService',LABEL[service]);setText('sumCollection',(qs('#collectionDate')?.value||'Choose date')+(window.PRESSED_SLOT?' · '+window.PRESSED_SLOT:''));
 setText('sumReturn',(qs('#returnDate')?.value||'—')+(qs('#returnSlot')?.value?' · '+qs('#returnSlot').value:''));setText('sumTotal',money(price));
 const extra=qs('#shirtRow');if(extra)extra.style.display=(service==='small'||service==='large')?'block':'none';
 const item=qs('#itemLimit');if(item)item.textContent=service==='express'?'Maximum 10 garments. Same-day availability is deliberately limited.':service==='suit'?'Suit service starts at £25. Add details below if you have more than one suit.':'Bag pricing is confirmed at collection if the load is materially larger than the selected bag.';
}
function selectService(type){
 window.PRESSED_SERVICE=type;qsa('.service').forEach(x=>x.classList.toggle('active',x.dataset.service===type));
 if(type==='express'){const d=qs('#collectionDate');if(d)d.value=today()}
 refreshReturn();renderSlots();refreshSummary();qs('#booking')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function validateExpress(){
 if(window.PRESSED_SERVICE!=='express')return true;
 const n=Number(qs('#itemCount')?.value||0);if(n<1||n>10){alert('Same-Day Express is limited to 10 garments.');return false}
 if(qs('#collectionDate').value!==today()){alert('Same-Day Express is for collection and return today.');return false}return true;
}
function submitBooking(e){
 e.preventDefault(); const service=window.PRESSED_SERVICE||'small';
 if(!window.PRESSED_SLOT){alert('Please choose an available collection window.');return}
 if(!validateExpress())return;
 const form=new FormData(e.currentTarget); const email=String(form.get('email')||'').trim().toLowerCase();
 const booking={id:crypto.randomUUID?.()||String(Date.now()),ref:ref(),service,serviceLabel:LABEL[service],price:servicePrice(service,form.get('extraShirts')),name:String(form.get('name')||'').trim(),email,phone:String(form.get('phone')||'').trim(),address1:String(form.get('address1')||'').trim(),address2:String(form.get('address2')||'').trim(),postcode:String(form.get('postcode')||'').trim().toUpperCase(),itemCount:Number(form.get('itemCount')||0),extraShirts:Number(form.get('extraShirts')||0),collectionDate:String(form.get('collectionDate')||''),collectionSlot:window.PRESSED_SLOT,returnDate:String(form.get('returnDate')||''),returnSlot:String(form.get('returnSlot')||''),accessNotes:String(form.get('accessNotes')||''),instructions:String(form.get('instructions')||''),status:'Booking requested',paymentStatus:'Payment due before return',createdAt:new Date().toISOString()};
 const list=getBookings();list.unshift(booking);saveBookings(list);
 const box=qs('#confirmation');box?.classList.add('show');setText('confirmRef',booking.ref);setText('confirmService',booking.serviceLabel);setText('confirmPrice',money(booking.price));setText('confirmWhen',`${booking.collectionDate} · ${booking.collectionSlot}`);
 localStorage.setItem('pressed_last_email',email);localStorage.setItem('pressed_last_ref',booking.ref);box?.scrollIntoView({behavior:'smooth',block:'center'});
}
function trackBooking(e){
 if(e)e.preventDefault(); const r=(qs('#trackRef')?.value||'').trim().toUpperCase(), em=(qs('#trackEmail')?.value||'').trim().toLowerCase(),out=qs('#trackResult');if(!out)return;
 const b=getBookings().find(x=>x.ref.toUpperCase()===r&&x.email===em);
 if(!b){out.innerHTML='<div class="empty">No booking found with that reference and email on this test device.</div>';return}
 const stages=['Booking requested','Confirmed','Collected','Pressing','Ready for return','Completed'];const idx=Math.max(0,stages.indexOf(b.status));
 out.innerHTML=`<div class="bookingcard"><div class="top"><div><span class="pill">${esc(b.status)}</span><h3 style="margin:10px 0 4px">${esc(b.serviceLabel)}</h3><div class="muted">${esc(b.ref)}</div></div><strong style="font-size:22px;color:#c9a24d">${money(b.price)}</strong></div><div class="statusline">${stages.map((_,i)=>`<i class="${i<=idx?'on':''}"></i>`).join('')}</div><div class="summary-row"><span>Collection</span><b>${esc(b.collectionDate)} · ${esc(b.collectionSlot)}</b></div><div class="summary-row"><span>Return</span><b>${esc(b.returnDate)} · ${esc(b.returnSlot)}</b></div><div class="summary-row"><span>Payment</span><b>${esc(b.paymentStatus)}</b></div><div class="notice">This is currently the test booking store. Live customer tracking will use the central booking database once connected.</div></div>`;
}
function myBookings(){
 const out=qs('#myBookings');if(!out)return;const email=(qs('#accountEmail')?.value||localStorage.getItem('pressed_last_email')||'').trim().toLowerCase();
 if(!email){out.innerHTML='<div class="empty">Enter your email to show bookings created on this test device.</div>';return}
 const list=getBookings().filter(b=>b.email===email);if(!list.length){out.innerHTML='<div class="empty">No bookings found for that email on this test device.</div>';return}
 out.innerHTML=list.map(b=>`<div class="bookingcard"><div class="top"><div><span class="pill">${esc(b.status)}</span><h3 style="margin:10px 0 4px">${esc(b.serviceLabel)}</h3><div class="muted">${esc(b.ref)}</div></div><strong style="color:#c9a24d">${money(b.price)}</strong></div><div class="summary-row"><span>Collection</span><b>${esc(b.collectionDate)} · ${esc(b.collectionSlot)}</b></div><div class="summary-row"><span>Return</span><b>${esc(b.returnDate)} · ${esc(b.returnSlot)}</b></div></div>`).join('');
}
window.Pressed={selectService,trackBooking,myBookings};
document.addEventListener('DOMContentLoaded',()=>{
 window.PRESSED_SERVICE='small'; const d=qs('#collectionDate');if(d){d.min=today();d.max=addDays(today(),30);d.value=today();d.addEventListener('change',()=>{refreshReturn();renderSlots();refreshSummary()})}
 qsa('.service').forEach(x=>x.onclick=()=>selectService(x.dataset.service));qs('#extraShirts')?.addEventListener('input',refreshSummary);qs('#returnDate')?.addEventListener('change',refreshSummary);qs('#returnSlot')?.addEventListener('change',refreshSummary);qs('#bookingForm')?.addEventListener('submit',submitBooking);qs('#trackForm')?.addEventListener('submit',trackBooking);qs('#showBookings')?.addEventListener('click',myBookings);
 const lr=localStorage.getItem('pressed_last_ref'),le=localStorage.getItem('pressed_last_email');if(qs('#trackRef')&&lr)qs('#trackRef').value=lr;if(qs('#trackEmail')&&le)qs('#trackEmail').value=le;if(qs('#accountEmail')&&le)qs('#accountEmail').value=le;
 refreshReturn();renderSlots();refreshSummary();
});
})();