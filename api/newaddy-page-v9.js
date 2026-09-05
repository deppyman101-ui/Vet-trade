const baseHandler = require('./newaddy-page-v8.js');

const marketplaceInjection = `
<style>
#homes .propertyPlans{margin-top:6px}
#homes .propertyActions{margin:18px 0 26px}
#homes .sponsorNote{margin-top:18px;border:1px dashed #cfd6d9;border-radius:14px;padding:14px 16px;background:#fff;color:#66727d;font-size:12px;line-height:1.6}
#homes .sponsorNote strong{color:#17324d}
#landlordForm .propertyMarketTerms{background:#f8fafb;border:1px solid #e2e7e9;border-radius:12px;padding:15px;color:#596671;font-size:12px;line-height:1.55}
</style>
<script>
(function(){
  if(window.__newAddyMarketplaceV9)return;
  window.__newAddyMarketplaceV9=true;
  var PROPERTY_API='https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-property-marketplace';

  function setText(el,v){if(el)el.textContent=v}
  function esc2(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]})}
  function money2(v){return v==null||v===''?'—':'£'+Number(v).toLocaleString('en-GB',{maximumFractionDigits:0})}
  function show(el,type,msg){if(!el)return;el.className='status '+type;el.textContent=msg}

  document.title='NewAddy | Private rentals, rooms & house swaps';
  var meta=document.querySelector('meta[name="description"]');
  if(meta)meta.setAttribute('content','Browse private rentals, rooms and house swaps across South-East London. Property listers can list free and pay only for optional visibility upgrades.');

  var trust=document.querySelectorAll('.trustRow span');
  if(trust[0])trust[0].textContent='Free for renters';
  if(trust[1])trust[1].textContent='Property listings from £0';
  if(trust[2])trust[2].textContent='House swaps free';

  var homes=document.getElementById('homes');
  if(homes){
    setText(homes.querySelector('.sectionHead h2'),'Private rentals. Deal direct.');
    setText(homes.querySelector('.sectionHead p'),'Browse live studios, 1-bed and 2-bed rentals. Send a private enquiry through NewAddy, then the renter and landlord or agent continue directly. NewAddy does not charge a successful-let fee.');
    var grid=homes.querySelector('.listingGrid');
    if(grid){grid.id='propertyListings';grid.innerHTML='<div class="emptyState">Loading property listings…</div>';}
    var note=homes.querySelector('.pilotNote');
    if(note)note.textContent='Landlords and agents can list free. Optional paid upgrades affect visibility only — there is no NewAddy fee if a tenancy is agreed.';
    if(!homes.querySelector('.propertyPlans')){
      var plans=document.createElement('div');plans.className='priceGrid propertyPlans';
      plans.innerHTML='<div class="planCard"><strong>Free</strong><div class="planPrice">£0</div><p>Standard property listing with photos and private enquiries.</p></div><div class="planCard hot"><strong>Featured</strong><div class="planPrice">£9.99</div><p>30 days of priority placement and a Featured badge.</p></div><div class="planCard"><strong>Fast-Track</strong><div class="planPrice">£19.99</div><p>30 days of highest listing priority and stronger visibility across NewAddy.</p></div>';
      var head=homes.querySelector('.sectionHead');if(head)head.insertAdjacentElement('afterend',plans);
    }
    if(!homes.querySelector('.propertyActions')){
      var actions=document.createElement('div');actions.className='actionRow propertyActions';
      actions.innerHTML='<button class="btn btnCoral" type="button" id="listPropertyNow">LIST A PROPERTY</button><a class="btn btnSoft" href="mailto:NewAddy101@outlook.com?subject=NewAddy%20sponsored%20placement">ADVERTISE ON NEWADDY</a>';
      var plans2=homes.querySelector('.propertyPlans');if(plans2)plans2.insertAdjacentElement('afterend',actions);
      var sponsor=document.createElement('div');sponsor.className='sponsorNote';sponsor.innerHTML='<strong>Sponsored placements:</strong> property-related businesses can enquire about clearly labelled advertising or sponsorship space. Paid visibility never changes a renter\'s legal rights or guarantees enquiries.';
      actions.insertAdjacentElement('afterend',sponsor);
    }
  }

  var privateCard=document.querySelector('#moreways .privateRentals p');
  setText(privateCard,'Studios, 1-bed and 2-bed homes. Browse listings, send a private enquiry and deal directly with the landlord or agent. Property listing is free, with optional paid visibility.');
  var how=document.getElementById('how');
  if(how){var first=how.querySelector('.planCard p');setText(first,'Browse studios, 1-bed and 2-bed homes, send a private enquiry and continue directly with the property lister.');}
  var tenantIntro=document.querySelector('#tenantBox .intro');
  setText(tenantIntro,'Joining is free. Create your renter profile, browse listings and use NewAddy to send private enquiries to property listers.');

  var landlordBox=document.getElementById('landlordBox');
  var landlordForm=document.getElementById('landlordForm');
  if(landlordBox){
    setText(landlordBox.querySelector('h2'),'List your property.');
    setText(landlordBox.querySelector('.intro'),'List free or choose an optional visibility upgrade. Add up to 3 photos; your phone number and email stay private until you receive an enquiry.');
  }
  if(landlordForm){
    landlordForm.enctype='multipart/form-data';
    var grid2=landlordForm.querySelector('.formGrid');
    var oldTerms=landlordForm.querySelector('.terms');
    if(oldTerms){oldTerms.className='propertyMarketTerms';oldTerms.innerHTML='<strong>NewAddy property marketplace:</strong> listing is free. Featured and Fast-Track are optional 30-day visibility upgrades. NewAddy does not charge a successful-let fee and is not a party to any tenancy.';}
    var lt=document.querySelector('label[for="lt"]');
    if(lt)lt.innerHTML='I confirm I am authorised to advertise this property, the listing is accurate, and I accept the <a href="/newaddy/terms" target="_blank" rel="noopener">NewAddy Terms & Conditions</a>.';
    if(grid2 && !landlordForm.querySelector('input[name="photos"]')){
      var photos=document.createElement('div');photos.className='field full';photos.innerHTML='<label>Property photos — max 3, JPG/PNG/WEBP, 1.5MB each</label><input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple required>';
      var termsField=oldTerms&&oldTerms.closest('.field');if(termsField)grid2.insertBefore(photos,termsField);else grid2.appendChild(photos);
    }
    if(grid2 && !landlordForm.querySelector('select[name="plan"]')){
      var plan=document.createElement('div');plan.className='field full';plan.innerHTML='<label>Listing option</label><select name="plan"><option value="free">Free — £0</option><option value="featured">Featured — £9.99 / 30 days</option><option value="fast_track">Fast-Track — £19.99 / 30 days</option></select>';
      var termsField2=oldTerms&&oldTerms.closest('.field');if(termsField2)grid2.insertBefore(plan,termsField2);else grid2.appendChild(plan);
    }
    var submit=landlordForm.querySelector('button[type="submit"]');setText(submit,'PUBLISH MY PROPERTY');
    landlordForm.addEventListener('submit',async function(e){
      e.preventDefault();e.stopImmediatePropagation();
      var b=landlordForm.querySelector('button[type="submit"]'),old=b.textContent;b.disabled=true;b.textContent='PUBLISHING…';
      try{
        var r=await fetch(PROPERTY_API,{method:'POST',body:new FormData(landlordForm)});var d=await r.json();if(!r.ok)throw new Error(d.error||'Could not publish property');
        show(document.getElementById('landlordStatus'),'ok',d.message+' Reference: '+d.ref);
        if(d.payment_url){location.href=d.payment_url;return;}
        landlordForm.reset();loadProperties();
      }catch(err){show(document.getElementById('landlordStatus'),'err',err.message||'Could not publish property')}
      finally{b.disabled=false;b.textContent=old}
    },true);
  }

  var listBtn=document.getElementById('listPropertyNow');
  if(listBtn)listBtn.onclick=function(){
    var tab=Array.from(document.querySelectorAll('.tabBtn')).find(function(b){return b.dataset.show==='landlordBox'});if(tab)tab.click();
    if(landlordBox){landlordBox.classList.remove('hide');landlordBox.scrollIntoView({behavior:'smooth',block:'start'});}
  };

  var faq=document.getElementById('landlord');
  if(faq){
    setText(faq.querySelector('.sectionHead p'),'NewAddy keeps the three routes simple: free access for renters and swaps, with optional paid visibility for property and room listings.');
    faq.querySelectorAll('details').forEach(function(d){
      var s=d.querySelector('summary');if(!s)return;
      if(s.textContent.indexOf('How does NewAddy make money?')>-1){var p=d.querySelector('p');setText(p,'Landlords, agents and room listers can use free listings or buy optional Featured and Fast-Track visibility upgrades. NewAddy may also sell clearly labelled sponsored advertising. There is no successful-let fee. House swaps and renter access remain free.');}
    });
  }

  async function loadProperties(){
    var box=document.getElementById('propertyListings');if(!box)return;
    try{
      var r=await fetch(PROPERTY_API);var d=await r.json();if(!r.ok)throw new Error();
      if(!d.properties||!d.properties.length){box.innerHTML='<div class="emptyState"><strong>No live private-rental listings yet.</strong><br>Landlords and agents can be among the first to list free on NewAddy.</div>';return;}
      box.innerHTML=d.properties.map(function(x){
        var img=x.photo_urls&&x.photo_urls[0]?x.photo_urls[0]:'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=82';
        var premium=x.plan==='featured'||x.plan==='fast_track';var label=x.plan==='fast_track'?'Fast-Track':x.plan==='featured'?'Featured':'Private rental';
        return '<article class="listingCard"><div class="listingImg" style="background-image:url(\''+esc2(img)+'\')"><span class="tag '+(premium?'featured':'')+'">'+label+'</span></div><div class="listingBody"><div class="listingTop"><h3>'+esc2(x.property_type)+' · '+esc2(x.property_area)+'</h3><div class="price">'+money2(x.monthly_rent)+'</div></div><div class="meta">'+esc2(x.postcode||'')+(x.available_from?' · Available '+esc2(x.available_from):'')+(x.deposit_amount!=null?' · Deposit '+money2(x.deposit_amount):'')+'</div>'+(x.property_notes?'<p>'+esc2(x.property_notes)+'</p>':'')+'<button class="btn btnSoft propertyEnquiry" type="button" data-ref="'+esc2(x.property_ref)+'" style="width:100%;margin-top:14px">ENQUIRE DIRECT</button></div></article>';
      }).join('');
      box.querySelectorAll('.propertyEnquiry').forEach(function(b){b.onclick=function(){openPropertyMessage(b.dataset.ref)}});
    }catch(e){box.innerHTML='<div class="emptyState">Property listings could not be loaded right now. Please try again shortly.</div>';}
  }

  function openPropertyMessage(ref){
    var modal=document.getElementById('messageModal');if(!modal)return;
    document.getElementById('messageType').value='property';document.getElementById('messageRef').value=ref;
    setText(document.getElementById('messageIntro'),'Your details will be sent privately to the landlord or agent who posted this property. You can then continue the conversation directly.');
    var st=document.getElementById('messageStatus');if(st){st.className='status';st.textContent='';}
    modal.classList.remove('hide');
  }

  var messageForm=document.getElementById('messageForm');
  if(messageForm){
    messageForm.addEventListener('submit',async function(e){
      var type=document.getElementById('messageType').value;if(type!=='property')return;
      e.preventDefault();e.stopImmediatePropagation();
      var b=messageForm.querySelector('button[type="submit"]'),old=b.textContent;b.disabled=true;b.textContent='SENDING…';
      try{
        var fd=new FormData(messageForm);var payload={action:'message'};fd.forEach(function(v,k){payload[k]=v});
        var r=await fetch(PROPERTY_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});var d=await r.json();if(!r.ok)throw new Error(d.error||'Could not send');
        show(document.getElementById('messageStatus'),'ok',d.message);
        var ref=document.getElementById('messageRef').value;messageForm.reset();document.getElementById('messageType').value='property';document.getElementById('messageRef').value=ref;
      }catch(err){show(document.getElementById('messageStatus'),'err',err.message||'Could not send enquiry')}
      finally{b.disabled=false;b.textContent=old}
    },true);
  }

  var params=new URLSearchParams(location.search);if(params.get('property_payment')){
    var s=params.get('property_payment');var msg=s==='success'?'Your property visibility upgrade was confirmed and the listing is live.':s==='cancelled'?'Payment was cancelled. Your paid visibility upgrade is not active yet.':'We could not confirm the property upgrade payment.';
    setTimeout(function(){if(landlordBox)landlordBox.classList.remove('hide');show(document.getElementById('landlordStatus'),s==='success'?'ok':'warn',msg);if(homes)homes.scrollIntoView({behavior:'smooth'})},250);
  }

  loadProperties();
})();
</script>`;

const adminMarketplaceInjection = `
<script>
(function(){
  if(window.__newAddyAdminMarketplaceV9)return;
  window.__newAddyAdminMarketplaceV9=true;
  var subtitle=document.querySelector('.head .muted');if(subtitle)subtitle.textContent='Renters, property listings, rooms, house swaps and enquiries in one place.';
  var propertyHeading=document.querySelector('#properties .panelHead h2');if(propertyHeading)propertyHeading.textContent='Property listings';
  var matchingHeading=document.querySelector('#matching .panelHead h2');if(matchingHeading)matchingHeading.textContent='Renter demand match';
  var matchingHint=document.querySelector('#matching .panelHead .muted');if(matchingHint)matchingHint.textContent='Internal demand view only — renters and property listers deal directly.';
  ['introductions','revenue'].forEach(function(id){var t=document.querySelector('.tab[data-tab="'+id+'"]');if(t)t.style.display='none';var s=document.getElementById(id);if(s)s.classList.add('hidden');});
  var enquiryHeading=document.querySelector('#enquiries .panelHead h2');if(enquiryHeading)enquiryHeading.textContent='Property, room & swap enquiries';
  document.querySelectorAll('.kpi').forEach(function(k){var tx=k.textContent||'';if(tx.indexOf('£79')>-1||/fee/i.test(tx))k.style.display='none';});
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'public' && !body.includes('__newAddyMarketplaceV9')) {
      body = body.replace('</body>', marketplaceInjection + '\n</body>');
    }
    if (typeof body === 'string' && req.query.page === 'admin' && !body.includes('__newAddyAdminMarketplaceV9')) {
      body = body.replace('</body>', adminMarketplaceInjection + '\n</body>');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
