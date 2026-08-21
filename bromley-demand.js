const SUPA_URL='https://iymhyxheggqsewpczgjl.supabase.co';

function getAttribution(){
  const p=new URLSearchParams(location.search);
  const keys=['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','gbraid','wbraid','msclkid'];
  const now={};
  for(const k of keys){if(p.get(k))now[k]=p.get(k)}
  if(Object.keys(now).length){sessionStorage.setItem('vett_attribution',JSON.stringify(now))}
  let saved={};
  try{saved=JSON.parse(sessionStorage.getItem('vett_attribution')||'{}')}catch{}
  return {...saved,...now};
}

const form=document.getElementById('customerForm');
if(form){
  form.onsubmit=async e=>{
    e.preventDefault();
    const b=form.querySelector('.submit'),old=b.textContent,m=document.getElementById('customerMessage');
    const a=getAttribution();
    b.disabled=true;b.textContent='SENDING...';m.innerHTML='';
    try{
      const payload={
        name:document.getElementById('custName').value.trim(),
        phone:document.getElementById('custPhone').value.trim(),
        email:document.getElementById('custEmail').value.trim(),
        area:document.getElementById('custArea').value.trim(),
        jobType:form.dataset.jobType,
        urgency:document.getElementById('custUrgency').value,
        propertyType:document.getElementById('custProperty').value,
        jobSize:'Standard job',
        description:document.getElementById('custDesc').value.trim(),
        consent:document.getElementById('custConsent').checked,
        sourcePage:location.pathname,
        sourceName:form.dataset.sourceName||'',
        referrer:document.referrer||'',
        ...a
      };
      const r=await fetch(SUPA_URL+'/functions/v1/submit-vett-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),d=await r.json();
      if(!r.ok||!d.ok)throw new Error(d.error||'Unable to submit request');
      m.innerHTML='<div class="notice"><b>Request received.</b> Your reference is '+d.reference+'.<br><a href="/customer-status.html?ref='+encodeURIComponent(d.reference)+'">Track this request →</a></div>';
      form.reset();
    }catch(x){
      m.innerHTML='<div class="error">We couldn\'t send your request. Please try again.</div>';
    }finally{b.disabled=false;b.textContent=old}
  };
}
