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
        .replace("Private-home landlords pay £79 only after a successful NewAddy introduction becomes the tenant. Room hosts can use a free listing or buy optional Featured and Fast-Track upgrades. House swaps are free.", "Property and room listers can use free listings or buy optional Featured and Fast-Track visibility upgrades. NewAddy may also sell clearly labelled sponsored advertising. Renters and house swaps remain free.");

      if (req.query.page === 'public') {
        body = body.replace(/<section class=\"section soft\" id=\"areas\">[\s\S]*?<\/section>\s*<section class=\"section\" id=\"homes\">/, '<section class=\"section\" id=\"homes\">');
      }

      if (req.query.page === 'admin' && !body.includes('__newAddyRetiredFeeActionsV10')) {
        body = body.replace('</body>', retiredAdminActions + '\n</body>');
      }
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
