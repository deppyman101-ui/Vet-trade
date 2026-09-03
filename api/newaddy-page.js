const PUBLIC_SOURCE='https://www.vetttrade.co.uk/nextkey/index.html';
const ADMIN_SOURCE='https://www.vetttrade.co.uk/nextkey/admin.html';

const publicInjection=`
<style>
/* NewAddy public UX polish */
.btn{min-height:48px;border-radius:14px;box-shadow:0 8px 18px rgba(23,50,77,.10);transition:transform .18s ease,box-shadow .18s ease,filter .18s ease;letter-spacing:.1px}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(23,50,77,.16);filter:saturate(1.05)}
.btn:active{transform:translateY(0)}
.btnCoral{background:linear-gradient(135deg,#ef6c57,#e75a45)}
.btnNavy{background:linear-gradient(135deg,#17324d,#244f70)}
.btnSoft{background:linear-gradient(180deg,#f8fbfc,#edf3f6);border:1px solid #d8e1e6}
.formShell select,.searchField select{appearance:none;-webkit-appearance:none;border:1.5px solid #cfd9df!important;border-radius:12px!important;background:linear-gradient(180deg,#fff,#f8fbfc)!important;padding-right:38px!important;box-shadow:0 5px 14px rgba(23,50,77,.06);cursor:pointer}
.formShell select:focus,.searchField select:focus{border-color:#69879d!important;box-shadow:0 0 0 4px rgba(23,50,77,.09)!important}
#rooms .priceGrid{align-items:stretch;gap:16px}
#rooms .planCard{position:relative;transition:transform .18s ease,box-shadow .18s ease;border-radius:19px;padding:22px;overflow:visible}
#rooms .planCard:hover{transform:translateY(-3px);box-shadow:0 16px 32px rgba(23,50,77,.10)}
#rooms .premiumFeatured{border:2px solid #ef6c57;background:linear-gradient(180deg,#fff9f7,#fff)}
#rooms .premiumFast{border:2px solid #17324d;background:linear-gradient(145deg,#f2f7fb,#fff);box-shadow:0 14px 34px rgba(23,50,77,.12)}
#rooms .premiumFast.hot:before{content:'BEST VISIBILITY';background:#17324d;right:14px}
.planBenefits{display:grid;gap:8px;margin-top:14px;font-size:12px;color:#53616d;line-height:1.45}
.planBenefits span:before{content:'✓';font-weight:900;color:#17324d;margin-right:7px}
.planPitch{font-size:13px!important;font-weight:750;color:#334b5d!important;margin-top:10px!important}
.premiumListing{border:2px solid rgba(239,108,87,.45);box-shadow:0 16px 36px rgba(23,50,77,.11)}
.premiumListing.fast{border-color:#17324d;box-shadow:0 18px 42px rgba(23,50,77,.16)}
.naPhotoWrap{position:relative;background:#e7ecef}
.naMainImage{height:210px;width:100%;object-fit:cover;display:block}
.naThumbs{display:flex;gap:7px;padding:8px;background:#f7f9fa;overflow-x:auto;border-top:1px solid #e4e9ec}
.naThumb{width:56px;height:44px;object-fit:cover;border-radius:8px;border:2px solid transparent;cursor:pointer;flex:0 0 auto;transition:.15s}
.naThumb:hover{border-color:#ef6c57;transform:translateY(-1px)}
.directNote{margin-top:10px;padding:9px 11px;border-radius:10px;background:#eef5f8;color:#355469;font-size:11px;font-weight:750;line-height:1.45}
@media(max-width:700px){.naMainImage{height:220px}.btn{min-height:50px}}
</style>
<script>
(function(){
  var form=document.getElementById('tenantForm');
  if(form&&form.dataset.passportV1!=='1'){
    form.dataset.passportV1='1';
    var notes=form.querySelector('textarea[name="notes"]');
    var anchor=notes&&notes.closest('.field');
    if(anchor&&anchor.parentNode){
      var holder=document.createElement('div');
      holder.innerHTML=
        '<div class="field full"><div class="terms"><strong>Renter Passport</strong><br>Complete these details once so NewAddy can quickly see how ready you are for a suitable property. If you are not sure about something yet, choose Not sure — your Passport will simply show as Incomplete until it is updated.</div></div>'+
        '<div class="field"><label>Income / support position</label><select name="income_position"><option value="unsure">Choose / not sure yet</option><option value="employment">Employment income</option><option value="housing_support">Housing support / UC housing element</option><option value="employment_and_support">Employment + housing support</option><option value="other_income">Other income</option><option value="other_or_none">Other / no regular income</option></select></div>'+
        '<div class="field"><label>Other monthly income (if any)</label><input name="other_income" type="number" min="0" max="100000" placeholder="£"></div>'+
        '<div class="field"><label>Guarantor position</label><select name="guarantor_status"><option value="unsure">Not sure yet</option><option value="available">Guarantor available</option><option value="if_needed">Could arrange one if needed</option><option value="not_available">No guarantor available</option></select></div>'+
        '<div class="field"><label>References</label><select name="reference_ready"><option value="unsure">Not sure yet</option><option value="ready">Reference ready</option><option value="need_help">Need help / need to arrange</option><option value="not_available">No reference available</option></select></div>'+
        '<div class="field"><label>Right to Rent readiness</label><select name="right_to_rent_ready"><option value="unsure">Not sure yet</option><option value="ready">Ready to provide when required</option><option value="need_help">Need help / need to arrange</option></select></div>'+
        '<div class="field"><label>Earliest date you could move</label><input name="earliest_move_date" type="date"></div>'+
        '<div class="field full"><label>Must-haves for your next place</label><textarea name="must_haves" maxlength="800" placeholder="e.g. ground floor, near a station, no stairs — or type None if you are flexible"></textarea></div>'+
        '<div class="field full"><div class="terms">No evidence documents are requested at this stage. The Passport is a readiness summary for matching, not a tenancy approval or guarantee.</div></div>';
      while(holder.firstElementChild)anchor.parentNode.insertBefore(holder.firstElementChild,anchor);
    }
    var legacySend=send;
    send=async function(kind,formEl,out){
      if(kind!=='tenant')return legacySend(kind,formEl,out);
      var b=formEl.querySelector('button[type=submit]'),old=b.textContent;
      b.disabled=true;b.textContent='SENDING…';
      try{
        var r=await fetch('https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-passport-tenant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(obj(formEl))});
        var d=await r.json();
        if(!r.ok)throw new Error(d.error||'Could not submit');
        var label=d.passport_status==='complete'?'Complete':'Incomplete';
        showStatus(out,'ok',d.message+' Reference: '+d.ref+' · Renter Passport: '+label);
        formEl.reset();
      }catch(e){showStatus(out,'err',e.message||'Something went wrong. Please try again.')}finally{b.disabled=false;b.textContent=old;}
    };
  }

  /* Photo allowances */
  var roomPhotos=document.querySelector('#roomForm input[name="photos"]');
  if(roomPhotos){var rf=roomPhotos.closest('.field');var rl=rf&&rf.querySelector('label');if(rl)rl.textContent='Photos — exactly what renters need to see, max 3, JPG/PNG/WEBP, 1.5MB each';}
  var swapPhotos=document.querySelector('#swapForm input[name="photos"]');
  if(swapPhotos){var sf=swapPhotos.closest('.field');var sl=sf&&sf.querySelector('label');if(sl)sl.textContent='Photos — optional, up to 8, JPG/PNG/WEBP, 1.5MB each';}

  /* Make paid room plans feel meaningfully different */
  var plans=document.querySelectorAll('#rooms .priceGrid .planCard');
  if(plans.length>=3){
    plans[0].classList.remove('hot');
    plans[0].innerHTML='<strong>Free</strong><div class="planPrice">£0</div><p class="planPitch">A proper live listing at no cost.</p><div class="planBenefits"><span>Up to 3 room photos</span><span>Direct private enquiries</span><span>Standard listing position</span></div>';
    plans[1].classList.remove('hot');plans[1].classList.add('premiumFeatured');
    plans[1].innerHTML='<strong>★ Featured</strong><div class="planPrice">£9.99</div><p class="planPitch">Stand out from standard rooms for 30 days.</p><div class="planBenefits"><span>Featured badge</span><span>Priority placement above free listings</span><span>Up to 3 photos + direct enquiries</span></div>';
    plans[2].classList.add('hot','premiumFast');
    plans[2].innerHTML='<strong>⚡ Fast-Track</strong><div class="planPrice">£19.99</div><p class="planPitch">Maximum NewAddy visibility for 30 days.</p><div class="planBenefits"><span>Top-priority listing position</span><span>Fast-Track badge</span><span>Priority matching consideration with room seekers</span></div>';
  }
  var planSelect=document.querySelector('#roomForm select[name="plan"]');
  if(planSelect&&planSelect.options.length>=3){
    planSelect.options[0].text='Free — £0 · standard live listing';
    planSelect.options[1].text='Featured — £9.99 / 30 days · stand out';
    planSelect.options[2].text='Fast-Track — £19.99 / 30 days · best visibility';
  }

  /* Direct-interest messaging: automatic, no admin forwarding */
  var modal=document.getElementById('messageModal');
  if(modal){
    var mh=modal.querySelector('.modalHead h3');if(mh)mh.textContent='Send interest direct';
    var mb=modal.querySelector('button[type="submit"]');if(mb)mb.textContent='SEND INTEREST DIRECT';
    var mn=modal.querySelector('.note');if(mn)mn.textContent='This is sent automatically to the person who posted the listing. NewAddy admin does not review or forward it. They can reply to you directly using the contact details you provide.';
  }
  cardButton=function(type,ref,label){return '<button class="btn btnSoft messageBtn" type="button" data-type="'+esc(type)+'" data-ref="'+esc(ref)+'" style="width:100%;margin-top:14px">SEND INTEREST DIRECT</button><div class="directNote">Goes straight to the lister automatically — no NewAddy admin in the middle.</div>';};
  openMessage=function(type,ref){
    document.getElementById('messageType').value=type;
    document.getElementById('messageRef').value=ref;
    document.getElementById('messageIntro').textContent=type==='room'?'Your interest goes directly to the person offering this room. They can respond to you directly.':'Your interest goes directly to the person who posted this house swap. They can respond to you directly.';
    document.getElementById('messageStatus').className='status';document.getElementById('messageStatus').textContent='';document.getElementById('messageModal').classList.remove('hide');
  };

  function gallery(urls,fallback,label){
    var pics=Array.isArray(urls)&&urls.length?urls:[fallback];
    var main=esc(pics[0]);
    var thumbs=pics.length>1?'<div class="naThumbs">'+pics.map(function(u,i){return '<img class="naThumb" src="'+esc(u)+'" alt="'+esc(label)+' photo '+(i+1)+'" data-full="'+esc(u)+'">';}).join('')+'</div>':'';
    return '<div class="naPhotoWrap"><img class="naMainImage" src="'+main+'" alt="'+esc(label)+'">'+thumbs+'</div>';
  }
  function wireGalleries(){
    document.querySelectorAll('.naThumb').forEach(function(t){t.onclick=function(){var wrap=t.closest('.naPhotoWrap');var main=wrap&&wrap.querySelector('.naMainImage');if(main)main.src=t.dataset.full||t.src;};});
  }

  loadRooms=async function(){
    var box=document.getElementById('roomListings');
    try{
      var r=await fetch(api+'/rooms'),d=await r.json();if(!r.ok)throw new Error();
      if(!d.rooms||!d.rooms.length){box.innerHTML='<div class="emptyState"><strong>No live rooms yet.</strong><br>Be one of the first people to list a room on NewAddy.</div>';return;}
      box.innerHTML=d.rooms.map(function(x){
        var fallback='https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=900&q=82';
        var featured=x.plan==='featured',fast=x.plan==='fast_track';
        var cls=fast?' premiumListing fast':featured?' premiumListing':'';
        var badge=fast?'⚡ FAST-TRACK':featured?'★ FEATURED':'ROOM';
        return '<article class="listingCard'+cls+'">'+gallery(x.photo_urls,fallback,'Room in '+x.property_area)+'<div class="listingBody"><div class="listingTop"><h3>Room · '+esc(x.property_area)+'</h3><div class="price">'+money(x.monthly_rent)+'</div></div><div class="meta"><b>'+badge+'</b> · '+esc(x.postcode||'')+' · '+(x.bills_included?'Bills included':'Bills vary')+(x.available_from?' · '+esc(x.available_from):'')+'</div><p>'+esc(x.room_description||'')+'</p>'+(x.household_summary?'<p><b>Household:</b> '+esc(x.household_summary)+'</p>':'')+cardButton('room',x.room_ref,'')+'</div></article>';
      }).join('');wireMessageButtons();wireGalleries();
    }catch(e){box.innerHTML='<div class="emptyState">Room listings could not be loaded right now. Please try again shortly.</div>';}
  };

  loadSwaps=async function(){
    var box=document.getElementById('swapListings');
    try{
      var r=await fetch(api+'/swaps'),d=await r.json();if(!r.ok)throw new Error();
      if(!d.swaps||!d.swaps.length){box.innerHTML='<div class="emptyState"><strong>No live house swaps yet.</strong><br>List what you have and what you are looking for free — add up to 8 photos.</div>';return;}
      box.innerHTML=d.swaps.map(function(x){
        var fallback='https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=82';
        return '<article class="listingCard">'+gallery(x.photo_urls,fallback,'House swap in '+x.current_area)+'<div class="listingBody"><h3 style="margin:0;color:var(--navy)">HAS: '+esc(x.current_area)+'</h3><div class="meta">'+esc(String(x.current_bedrooms||''))+' bed '+esc(x.current_property_type||'home')+' · '+esc(x.landlord_type||'')+'</div><p><b>WANTS:</b> '+esc(x.wanted_areas)+(x.wanted_bedrooms?' · '+esc(String(x.wanted_bedrooms))+' bed':'')+'</p>'+(x.current_description?'<p>'+esc(x.current_description)+'</p>':'')+cardButton('swap',x.swap_ref,'')+'</div></article>';
      }).join('');wireMessageButtons();wireGalleries();
    }catch(e){box.innerHTML='<div class="emptyState">Swap listings could not be loaded right now. Please try again shortly.</div>';}
  };

  /* Room stays max 3. Swap posts use the 8-photo endpoint. */
  sendMultipart=async function(kind,formEl,out){
    var b=formEl.querySelector('button[type=submit]'),old=b.textContent;b.disabled=true;b.textContent='UPLOADING…';
    try{
      var fd=new FormData(formEl),files=fd.getAll('photos').filter(function(x){return x instanceof File&&x.size;});
      var max=kind==='swap'?8:3;
      if(files.length>max)throw new Error('Please choose no more than '+max+' photos.');
      for(var i=0;i<files.length;i++)if(files[i].size>1572864)throw new Error('Each photo must be 1.5MB or smaller.');
      var endpoint=kind==='swap'?'https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-swap-listing':api+'/'+kind;
      var r=await fetch(endpoint,{method:'POST',body:fd}),d=await r.json();if(!r.ok)throw new Error(d.error||'Could not submit');
      showStatus(out,'ok',d.message+' Reference: '+d.ref);formEl.reset();
      if(d.payment_url){setTimeout(function(){location.href=d.payment_url;},700);return;}
      await (kind==='room'?loadRooms():loadSwaps());
    }catch(e){showStatus(out,'err',e.message||'Something went wrong. Please try again.')}finally{b.disabled=false;b.textContent=old;}
  };

  loadRooms();loadSwaps();
})();
</script>`;

function patchAdmin(html){
  const oldReadiness="Deposit: ${esc(t.deposit_ready)}<br>Reference: ${esc(t.reference_ready)}</td>";
  const newReadiness="Deposit: ${esc(t.deposit_ready)}<br>Reference: ${esc(t.reference_ready)}<br><span class=\"pill ${t.passport_status==='complete'?'good':'warn'}\">Passport ${t.passport_status==='complete'?'Complete':'Incomplete'}</span></td>";
  let patched=html.replace(oldReadiness,newReadiness);
  const oldRecent="${esc(t.preferred_areas)} · ${esc(t.property_type)} · max ${money(t.max_monthly_rent)} · ${esc(t.status)}</span>";
  const newRecent="${esc(t.preferred_areas)} · ${esc(t.property_type)} · max ${money(t.max_monthly_rent)} · ${esc(t.status)} · Passport ${t.passport_status==='complete'?'Complete':'Incomplete'}</span>";
  return patched.replace(oldRecent,newRecent);
}

module.exports=async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return res.status(405).send('Method not allowed');}
  const page=req.query.page==='admin'?'admin':'public';
  const source=page==='admin'?ADMIN_SOURCE:PUBLIC_SOURCE;
  try{
    const upstream=await fetch(source,{headers:{'user-agent':'NewAddy-Page-Composer/2.1'}});
    if(!upstream.ok)throw new Error('Source page returned '+upstream.status);
    let html=await upstream.text();
    html=page==='admin'?patchAdmin(html):html.replace('</body>',publicInjection+'\n</body>');
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, no-cache, must-revalidate');
    res.setHeader('Pragma','no-cache');
    res.setHeader('X-Content-Type-Options','nosniff');
    if(req.method==='HEAD')return res.status(200).end();
    return res.status(200).send(html);
  }catch(e){
    console.error('newaddy page composer',e);
    res.setHeader('Content-Type','text/html; charset=utf-8');
    return res.status(503).send('<!doctype html><title>NewAddy</title><p>NewAddy is temporarily unavailable. Please refresh.</p>');
  }
};