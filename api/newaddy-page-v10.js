const baseHandler = require('./newaddy-page-v9.js');

const retiredAdminActions = `
<script>
(function(){
  if(window.__newAddyRetiredFeeActionsV10)return;
  window.__newAddyRetiredFeeActionsV10=true;
  function cleanLegacyActions(){
    document.querySelectorAll('button,a').forEach(function(el){
      var t=(el.textContent||'').trim();
      if(/create introduction|introduce renter|pay £79|payment link|successful[- ]?introduction fee/i.test(t)){
        el.style.display='none';
        el.setAttribute('aria-hidden','true');
      }
    });
  }
  cleanLegacyActions();
  new MutationObserver(cleanLegacyActions).observe(document.body,{subtree:true,childList:true});
})();
</script>`;

const propertyPhotoGallery = `
<style>
.naPropertyThumbs{display:flex;gap:7px;padding:9px;background:#f7f9fa;border-top:1px solid #e4e9ec;overflow-x:auto}
.naPropertyThumb{width:62px;height:47px;object-fit:cover;border-radius:8px;border:2px solid transparent;cursor:pointer;flex:0 0 auto}
.naPropertyThumb:hover,.naPropertyThumb.active{border-color:#ef6c57}
.naPhotoCount{font-size:11px;color:#66727d;padding:0 19px 10px;background:#fff}
</style>
<script>
(function(){
  if(window.__newAddyPropertyPhotoGalleryV11)return;
  window.__newAddyPropertyPhotoGalleryV11=true;
  var API='https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-property-marketplace';
  var cache={};
  async function getPhotos(){
    try{
      var r=await fetch(API),d=await r.json();
      if(!r.ok)return;
      (d.properties||[]).forEach(function(p){cache[p.property_ref]=Array.isArray(p.photo_urls)?p.photo_urls:[];});
      apply();
    }catch(e){}
  }
  function apply(){
    var box=document.getElementById('propertyListings');if(!box)return;
    box.querySelectorAll('.listingCard').forEach(function(card){
      if(card.dataset.galleryReady==='1')return;
      var btn=card.querySelector('.propertyEnquiry');var ref=btn&&btn.dataset.ref;if(!ref)return;
      var pics=cache[ref]||[];if(!pics.length)return;
      card.dataset.galleryReady='1';
      var main=card.querySelector('.listingImg');if(!main)return;
      if(pics.length>1){
        var thumbs=document.createElement('div');thumbs.className='naPropertyThumbs';
        pics.forEach(function(url,i){
          var im=document.createElement('img');im.className='naPropertyThumb'+(i===0?' active':'');im.src=url;im.alt='Property photo '+(i+1);
          im.onclick=function(){main.style.backgroundImage='url("'+String(url).replace(/"/g,'%22')+'")';thumbs.querySelectorAll('.naPropertyThumb').forEach(function(x){x.classList.remove('active')});im.classList.add('active');};
          thumbs.appendChild(im);
        });
        main.insertAdjacentElement('afterend',thumbs);
        var count=document.createElement('div');count.className='naPhotoCount';count.textContent=pics.length+' property photos';thumbs.insertAdjacentElement('afterend',count);
      }
    });
  }
  var target=document.getElementById('propertyListings');if(target)new MutationObserver(apply).observe(target,{childList:true,subtree:true});
  getPhotos();
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string') {
      body = body
        .replace("Paid visibility never changes a renter's legal rights or guarantees enquiries.", "Paid visibility never changes a renter\\'s legal rights or guarantees enquiries.")
        .replace("style=\"background-image:url(''+esc2(img)+'')\"", "style=\"background-image:url(&quot;'+esc2(img)+'&quot;)\"")
        .replace("NewAddy’s original service remains focused on studios and 1-bed homes. Renters join free; participating landlords list free and pay £79 only when a NewAddy introduction becomes the tenant.", "NewAddy lists studios, 1-bed and 2-bed private rentals. Renters browse and enquire free; landlords and agents can list free and choose optional paid visibility.")
        .replace("<strong>NewAddy pilot terms:</strong> listing and receiving interest are free. If a renter first introduced through NewAddy becomes the tenant for this property within 90 days, a £79 successful-introduction fee is payable by the landlord/property provider. The fee must not be passed to the tenant.", "<strong>NewAddy marketplace terms:</strong> standard property listing is free. Featured and Fast-Track are optional paid visibility upgrades. NewAddy does not take a successful-let fee, rent or tenancy commission.")
        .replace("I accept the £79 successful-let fee and 90-day introduction protection.", "I confirm I am authorised to advertise this property and accept the NewAddy marketplace terms.")
        .replace("Private-home landlords pay £79 only after a successful NewAddy introduction becomes the tenant. Room hosts can use a free listing or buy optional Featured and Fast-Track upgrades. House swaps are free.", "Property and room listers can use free listings or buy optional Featured and Fast-Track visibility upgrades. NewAddy may also sell clearly labelled sponsored advertising. Renters and house swaps remain free.")
        .replace(/Property photos — max 3, JPG\/PNG\/WEBP, 1\.5MB each/g, "Property photos — add as many as you need, JPG/PNG/WEBP, 1.5MB each");

      if (req.query.page === 'public') {
        body = body.replace(/<section class=\"section soft\" id=\"areas\">[\s\S]*?<\/section>\s*<section class=\"section\" id=\"homes\">/, '<section class=\"section\" id=\"homes\">');
        if (!body.includes('__newAddyPropertyPhotoGalleryV11')) body = body.replace('</body>', propertyPhotoGallery + '\n</body>');
      }

      if (req.query.page === 'admin' && !body.includes('__newAddyRetiredFeeActionsV10')) {
        body = body.replace('</body>', retiredAdminActions + '\n</body>');
      }
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
