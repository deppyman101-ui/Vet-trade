const baseHandler = require('./newaddy-page-v7.js');

const adminStructureInjection = `
<script>
(function(){
  if(window.__newAddyAdminStructureV8)return;
  window.__newAddyAdminStructureV8=true;

  var subtitle=document.querySelector('.head .muted');
  if(subtitle)subtitle.textContent='Private rentals, rooms, house swaps, enquiries, introductions and payments in one place.';

  var propertyHeading=document.querySelector('#properties .panelHead h2');
  if(propertyHeading)propertyHeading.textContent='Private rental properties';

  var matchHint=document.querySelector('#matching .panelHead .muted');
  if(matchHint)matchHint.textContent='Area + property type + budget + household size · Studio / 1 bed / 2 bed';

  var revenueHint=document.querySelector('#revenue .panelHead .muted');
  if(revenueHint)revenueHint.textContent='Successful private-rental introductions';
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'admin' && !body.includes('__newAddyAdminStructureV8')) {
      body = body.replace('</body>', adminStructureInjection + '\n</body>');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
