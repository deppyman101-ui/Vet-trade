const baseHandler = require('./newaddy-page-v6.js');

const launchStructureInjection = `
<style>
@media(min-width:921px){#moreways .portalGrid{grid-template-columns:repeat(3,1fr)}}
#moreways .portalCard.privateRentals{background:#f6f2eb;border:1px solid #e4e1dc;color:#17212b}
#moreways .portalCard.privateRentals h3{color:#17324d}
#moreways .portalCard.privateRentals p{color:#66727d}
</style>
<script>
(function(){
  if(window.__newAddyLaunchStructureV7)return;
  window.__newAddyLaunchStructureV7=true;

  function text(el, value){ if(el) el.textContent=value; }

  /* Navigation */
  var homeNav=document.querySelector('.navlinks a[href="#homes"]');
  text(homeNav,'Private rentals');

  /* Hero */
  var heroP=document.querySelector('.hero p');
  text(heroP,'Find a studio, 1-bed or 2-bed private rental, discover a room in someone’s home, or connect with people looking for a mutual house swap.');
  var heroLabel=document.querySelector('#heroSearch .searchField:nth-child(2) label');
  text(heroLabel,'Looking for');
  var heroType=document.getElementById('heroType');
  if(heroType){
    heroType.innerHTML='<option>Studio</option><option>1 bedroom</option><option>2 bedrooms</option><option>Room / bedsit</option><option>Studio or 1 bedroom</option>';
  }

  /* Area cards: every pilot area supports all three routes */
  document.querySelectorAll('.areaCard small').forEach(function(el){el.textContent='Rent • Rooms • Swap';});

  /* Private rentals */
  var homes=document.getElementById('homes');
  if(homes){
    var h2=homes.querySelector('.sectionHead h2');
    var p=homes.querySelector('.sectionHead p');
    text(h2,'Private rentals, matched properly.');
    text(p,'NewAddy focuses on studios, 1-bed and 2-bed private rentals. Renters join free; participating landlords list free and pay £79 only when a NewAddy introduction becomes the tenant.');
  }

  /* Make the three routes obvious */
  var more=document.getElementById('moreways');
  if(more){
    text(more.querySelector('.sectionHead h2'),'Three simple ways to find your next address.');
    text(more.querySelector('.sectionHead p'),'Choose private rentals, rooms or house swaps. Each route stays simple and has its own clear process.');
    var grid=more.querySelector('.portalGrid');
    if(grid && !grid.querySelector('.privateRentals')){
      var card=document.createElement('article');
      card.className='portalCard privateRentals';
      card.innerHTML='<div><div class="portalIcon">🏠</div><h3>Private Rentals</h3><p>Studios, 1-bed and 2-bed homes. Join as a renter or list a property free and let NewAddy match genuine demand.</p></div><a class="btn btnNavy" href="#homes">Private rentals</a>';
      grid.insertBefore(card,grid.firstChild);
    }
  }

  /* Renter choices */
  var tenantType=document.getElementById('tenantType');
  if(tenantType && !Array.from(tenantType.options).some(function(o){return o.value==='2 bedrooms'||o.text==='2 bedrooms';})){
    var oneBed=Array.from(tenantType.options).find(function(o){return o.text==='1 bedroom';});
    var opt=document.createElement('option'); opt.text='2 bedrooms'; opt.value='2 bedrooms';
    if(oneBed && oneBed.nextSibling) tenantType.insertBefore(opt,oneBed.nextSibling); else tenantType.appendChild(opt);
  }

  /* Landlord route = self-contained private rentals only */
  var landlordType=document.querySelector('#landlordForm select[name="property_type"]');
  if(landlordType){
    landlordType.innerHTML='<option value="">Choose</option><option>Studio</option><option>1 bedroom</option><option>2 bedrooms</option>';
  }
  var landlordIntro=document.querySelector('#landlordBox .intro');
  text(landlordIntro,'No listing fee. Add your studio, 1-bed or 2-bed now and NewAddy can compare it with renter demand in the same area.');

  /* Bottom explanation */
  var how=document.getElementById('how');
  if(how){
    var cards=how.querySelectorAll('.planCard');
    if(cards[0]){
      var strong=cards[0].querySelector('strong');
      var cp=cards[0].querySelector('p');
      text(strong,'🏠 Private rentals');
      text(cp,'Create a renter profile once. NewAddy matches studios, 1-bed and 2-bed homes against participating landlord requirements.');
    }
  }
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'public' && !body.includes('__newAddyLaunchStructureV7')) {
      body = body
        .replace('<title>NewAddy | Homes, rooms & house swaps</title>', '<title>NewAddy | Private rentals, rooms & house swaps</title>')
        .replace('content="NewAddy helps people find studios, 1-bed homes and rooms across South-East London, plus a free house-swap board."', 'content="NewAddy helps people find studios, 1-bed and 2-bed private rentals, rooms and house swaps across South-East London."')
        .replace('</body>', launchStructureInjection + '\n</body>');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
