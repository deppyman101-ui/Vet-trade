const baseHandler = require('./newaddy-page-v4.js');

const joinRouteInjection = `
<script>
(function(){
  if(window.__newAddyJoinRouteV1)return;
  window.__newAddyJoinRouteV1=true;
  function openJoin(){
    var join=new URLSearchParams(location.search).get('join');
    if(!join)return;
    setTimeout(function(){
      var target=null;
      if(join==='renter'){
        if(typeof showTab==='function')showTab('tenantBox');
        target=document.getElementById('tenantBox')||document.getElementById('tenant');
      }else if(join==='property'){
        if(typeof showTab==='function')showTab('landlordBox');
        target=document.getElementById('landlordBox')||document.getElementById('tenant');
      }else if(join==='room'){
        target=document.getElementById('roomBox');
        if(target)target.classList.remove('hide');
      }else if(join==='swap'){
        target=document.getElementById('swapBox');
        if(target)target.classList.remove('hide');
      }
      if(target){
        target.scrollIntoView({behavior:'smooth',block:'start'});
        var first=target.querySelector('input:not([type="hidden"]):not(.hp input),select,textarea');
        if(first)setTimeout(function(){try{first.focus({preventScroll:true})}catch(e){}},450);
      }
    },120);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',openJoin);else openJoin();
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'admin') {
      const start = "+(i.payment_url?'<br><button";
      const end = ":'')+'</td></tr>';";
      const s = body.indexOf(start);
      if (s >= 0) {
        const e = body.indexOf(end, s);
        if (e >= 0) body = body.slice(0, s) + "+'</td></tr>';" + body.slice(e + end.length);
      }
    }
    if (typeof body === 'string' && req.query.page === 'public' && !body.includes('__newAddyJoinRouteV1')) {
      body = body.replace('</body>', joinRouteInjection + '\n</body>');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};