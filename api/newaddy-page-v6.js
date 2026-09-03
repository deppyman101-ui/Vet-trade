const baseHandler = require('./newaddy-page-v5.js');

const legalInjection = `
<style>
@media(min-width:921px){.footer .footGrid{grid-template-columns:1.35fr repeat(4,1fr)}}
.naLegalNote{margin-top:10px;font-size:11px;line-height:1.55;color:#66727d}
.naLegalNote a{color:#17324d;font-weight:800}
</style>
<script>
(function(){
  if(window.__newAddyLegalFooter)return;
  window.__newAddyLegalFooter=true;

  var footer=document.querySelector('.footer .footGrid');
  if(footer&&!footer.querySelector('[data-na-legal]')){
    var blocks=footer.children;
    var legal=document.createElement('div');
    legal.setAttribute('data-na-legal','1');
    legal.innerHTML='<strong>Legal & support</strong><p><a href="/newaddy/terms">Terms & Conditions</a><br><a href="/newaddy/privacy">Privacy Policy</a><br><a href="/newaddy/cookies">Cookie Policy</a><br><a href="/newaddy/contact">Contact</a><br><a href="/newaddy/complaints">Complaints</a><br><a href="#landlord">FAQs</a></p>';
    if(blocks.length)footer.insertBefore(legal,blocks[blocks.length-1]);else footer.appendChild(legal);
  }

  function note(form){
    if(!form||form.querySelector('.naLegalNote'))return;
    var n=document.createElement('div');
    n.className='naLegalNote';
    n.innerHTML='By submitting, you agree to the <a href="/newaddy/terms" target="_blank" rel="noopener">NewAddy Terms & Conditions</a> and acknowledge the <a href="/newaddy/privacy" target="_blank" rel="noopener">Privacy Policy</a>.';
    var submit=form.querySelector('button[type="submit"]');
    if(submit)submit.insertAdjacentElement('beforebegin',n);else form.appendChild(n);
  }
  ['tenantForm','landlordForm','roomForm','swapForm','messageForm'].forEach(function(id){note(document.getElementById(id));});

  var lt=document.querySelector('label[for="lt"]');
  if(lt)lt.innerHTML='I accept the £79 successful-let fee, 90-day introduction protection and the <a href="/newaddy/terms" target="_blank" rel="noopener">NewAddy Terms & Conditions</a>.';
  var rt=document.querySelector('label[for="roomTerms"]');
  if(rt)rt.innerHTML='I confirm I own the home or have permission to offer this room, the information is accurate, and I accept the <a href="/newaddy/terms" target="_blank" rel="noopener">NewAddy Terms & Conditions</a>. I remain responsible for all legal checks, agreements, safety and rent/deposit arrangements.';
  var st=document.querySelector('label[for="swapTerms"]');
  if(st)st.innerHTML='I understand NewAddy does not approve or guarantee an exchange, landlord approval is required before moving, and I accept the <a href="/newaddy/terms" target="_blank" rel="noopener">NewAddy Terms & Conditions</a>.';
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'public' && !body.includes('__newAddyLegalFooter')) {
      body = body.replace('</body>', legalInjection + '\n</body>');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
