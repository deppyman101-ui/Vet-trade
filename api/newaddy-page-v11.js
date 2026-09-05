const baseHandler = require('./newaddy-page-v10.js');

const demandFirstInjection = `
<style>
.naDemandFirst{border:1px solid #dbe5ea;background:linear-gradient(145deg,#f4f9fb,#fff);border-radius:18px;padding:18px;margin:16px 0 20px;box-shadow:0 10px 26px rgba(23,50,77,.06)}
.naDemandFirstHead{display:flex;gap:12px;align-items:flex-start}.naDemandIcon{font-size:25px}.naDemandFirst h3{margin:0;color:#17324d;font-family:Georgia,"Times New Roman",serif;font-size:22px}.naDemandFirst p{margin:6px 0 0;color:#66727d;font-size:12px;line-height:1.55}.naDemandResult{margin-top:14px;background:#fff;border:1px solid #e2e9ed;border-radius:13px;padding:14px}.naDemandBig{font-size:20px;font-weight:900;color:#17324d}.naDemandMeta{font-size:11px;color:#66727d;margin-top:5px;line-height:1.5}.naDemandLive{display:inline-block;margin-left:7px;font-size:9px;font-weight:900;letter-spacing:.7px;color:#187a4d;background:#e8f7ef;border-radius:999px;padding:4px 7px;vertical-align:middle}.naDemandStrip{max-width:1180px;margin:16px auto 0;padding:0 24px}.naDemandStripInner{border-radius:19px;background:#17324d;color:#fff;padding:21px 23px;display:flex;align-items:center;justify-content:space-between;gap:20px}.naDemandStrip strong{font-family:Georgia,"Times New Roman",serif;font-size:24px}.naDemandStrip span{font-size:12px;line-height:1.5;color:#d8e3ea}.naDemandStrip b{color:#fff}.naAutoPill{white-space:nowrap;border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:9px 12px;font-size:10px!important;font-weight:900;letter-spacing:.5px;color:#fff!important}
@media(max-width:700px){.naDemandStripInner{align-items:flex-start;flex-direction:column}.naDemandStrip strong{font-size:21px}.naDemandFirst{padding:15px}}
</style>
<div class="naDemandStrip" id="naDemandStrip"><div class="naDemandStripInner"><div><strong>Don’t just wait for enquiries. See the demand first.</strong><br><span>NewAddy checks your property against active renter profiles and automatically alerts matching renters when the listing goes live.</span></div><span class="naAutoPill">⚡ AUTOMATIC MATCHING</span></div></div>
<script>
(function(){
  if(window.__newAddyDemandFirstV11)return;
  window.__newAddyDemandFirstV11=true;
  var API='https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-property-marketplace';
  var form=document.getElementById('landlordForm');
  if(!form)return;

  var grid=form.querySelector('.formGrid');
  if(grid&&!form.querySelector('[name="housing_support_considered"]')){
    var wrap=document.createElement('div');wrap.className='field full';
    wrap.innerHTML='<label>Housing Benefit / Universal Credit</label><select name="housing_support_considered"><option value="yes">Can be considered</option><option value="no">Private income only</option></select>';
    var plan=form.querySelector('select[name="plan"]');var planField=plan&&plan.closest('.field');
    if(planField)grid.insertBefore(wrap,planField);else grid.appendChild(wrap);
  }

  var card=document.createElement('div');card.className='naDemandFirst';card.innerHTML='<div class="naDemandFirstHead"><span class="naDemandIcon">🔥</span><div><h3>Live renter demand</h3><p>Enter the area, property type and rent below. NewAddy will privately check how many active renter profiles currently match. No renter names or contact details are shown here.</p></div></div><div class="naDemandResult" id="naDemandResult"><div class="naDemandBig">Add property details to check demand</div><div class="naDemandMeta">Matching runs automatically before and after you publish.</div></div>';
    var intro=document.querySelector('#landlordBox .intro');
    if(intro)intro.insertAdjacentElement('afterend',card);else form.insertAdjacentElement('beforebegin',card);

  var area=form.querySelector('[name="property_area"]'),ptype=form.querySelector('[name="property_type"]'),rent=form.querySelector('[name="monthly_rent"]'),occ=form.querySelector('[name="max_occupants"]'),support=form.querySelector('[name="housing_support_considered"]'),out=document.getElementById('naDemandResult');
  var timer=0,seq=0;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
  function schedule(){clearTimeout(timer);timer=setTimeout(check,350)}
  async function check(){
    var a=area&&area.value.trim(),t=ptype&&ptype.value,r=rent&&rent.value;
    if(!a||!t||!r){out.innerHTML='<div class="naDemandBig">Add property details to check demand</div><div class="naDemandMeta">We need area, property type and monthly rent.</div>';return}
    var my=++seq;out.innerHTML='<div class="naDemandBig">Checking NewAddy demand…</div><div class="naDemandMeta">Comparing with active renter profiles.</div>';
    var qs=new URLSearchParams({action:'demand',area:a,property_type:t,rent:r,occupants:(occ&&occ.value)||'1',housing_support_considered:(support&&support.value)||'yes'});
    try{var resp=await fetch(API+'?'+qs.toString()),d=await resp.json();if(my!==seq)return;if(!resp.ok)throw new Error();
      var n=Number(d.count||0),c=Number(d.complete_passports||0),m=Number(d.moving_soon||0),h=Number(d.housing_support_renters||0);
      if(n>0){out.innerHTML='<div class="naDemandBig">🔥 '+n+' active renter'+(n===1?' matches':'s match')+' <span class="naDemandLive">LIVE DEMAND</span></div><div class="naDemandMeta">'+c+' complete Renter Passport'+(c===1?'':'s')+(m?' · '+m+' able to move within about 6 weeks':'')+(h?' · '+h+' housing-support renter'+(h===1?'':'s'):'')+'. Matching renters will be alerted automatically when this listing goes live.</div>'}
      else{out.innerHTML='<div class="naDemandBig">No exact active matches yet</div><div class="naDemandMeta">You can still publish free. NewAddy keeps the listing live and future matching renters can discover and enquire about it.</div>'}
    }catch(e){if(my!==seq)return;out.innerHTML='<div class="naDemandBig">Demand check unavailable right now</div><div class="naDemandMeta">You can still publish the property normally.</div>'}
  }
  [area,ptype,rent,occ,support].filter(Boolean).forEach(function(el){el.addEventListener('input',schedule);el.addEventListener('change',schedule)});

  var tenantIntro=document.querySelector('#tenantBox .intro');
  if(tenantIntro&&!tenantIntro.dataset.autopilotCopy){tenantIntro.dataset.autopilotCopy='1';tenantIntro.textContent='Joining is free. Create your renter profile once and NewAddy can automatically alert you when matching properties go live. You can also browse and send private enquiries directly.'}
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'public' && !body.includes('__newAddyDemandFirstV11')) {
      body = body.replace('<section class="section" id="homes">', demandFirstInjection + '\n<section class="section" id="homes">');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
