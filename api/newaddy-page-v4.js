const baseHandler = require('./newaddy-page-v3.js');

const revenueInjection = `
<style>
.naRevenueCards{display:grid;grid-template-columns:repeat(5,minmax(135px,1fr));gap:10px;margin:0 0 16px}
.naRevenueCard{background:#fff;border:1px solid #e3e5e4;border-radius:15px;padding:16px}
.naRevenueCard small{display:block;color:#66727d;font-size:11px;font-weight:800}
.naRevenueCard strong{display:block;margin-top:7px;color:#17324d;font-size:25px}
.naRevenueCard.due{background:#fffaf0;border-color:#f0d8a5}
.naRevenueCard.paid{background:#f1f9f3;border-color:#cfe6d5}
.naProtection{font-size:11px;line-height:1.45}
.naProtection.active{color:#2c633b;font-weight:800}.naProtection.expired{color:#8b372c;font-weight:800}
.naRevenueHint{background:#eef4f7;border:1px solid #d9e3e8;border-radius:12px;padding:12px 14px;color:#4c6170;font-size:12px;line-height:1.55;margin-bottom:14px}
@media(max-width:950px){.naRevenueCards{grid-template-columns:repeat(2,1fr)}}
@media(max-width:520px){.naRevenueCards{grid-template-columns:1fr}}
</style>
<script>
(function(){
  if(window.__newAddyRevenueV1)return;
  window.__newAddyRevenueV1=true;

  const tabs=document.querySelector('.tabs');
  const introButton=tabs&&tabs.querySelector('[data-tab="introductions"]');
  if(tabs&&!tabs.querySelector('[data-tab="revenue"]')){
    const b=document.createElement('button');
    b.className='tab';b.type='button';b.dataset.tab='revenue';b.textContent='Revenue';
    b.addEventListener('click',()=>openTab('revenue',b));
    if(introButton&&introButton.nextSibling)tabs.insertBefore(b,introButton.nextSibling);else tabs.appendChild(b);
  }

  const app=document.getElementById('app');
  if(app&&!document.getElementById('revenue')){
    const section=document.createElement('section');
    section.id='revenue';section.className='tabSection hidden';
    section.innerHTML='<div class="panel"><div class="panelHead"><h2>£79 Revenue</h2><span class="muted">Successful private-home introductions</span></div><div class="panelBody"><div id="naRevenueCards" class="naRevenueCards"></div><div class="naRevenueHint"><b>How this tracks:</b> when a tenancy is marked <b>started</b>, the £79 becomes due. Once payment is confirmed it moves to collected. Every introduction also shows the end of NewAddy’s 90-day protection period.</div><div class="tableWrap"><table><thead><tr><th>Introduction</th><th>Landlord / property</th><th>Renter</th><th>£79 fee</th><th>Protection</th><th>Payment</th></tr></thead><tbody id="naRevenueRows"></tbody></table></div></div></div>';
    const introSection=document.getElementById('introductions');
    if(introSection&&introSection.nextSibling)introSection.parentNode.insertBefore(section,introSection.nextSibling);else app.appendChild(section);
  }

  function protectionEnd(introducedAt){
    if(!introducedAt)return null;
    const d=new Date(introducedAt);if(Number.isNaN(d.getTime()))return null;
    d.setDate(d.getDate()+90);return d;
  }
  function sameMonth(a,b){return a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()}
  function amount(i){return Number(i.success_fee||79)}

  window.renderRevenue=function(){
    const cardBox=document.getElementById('naRevenueCards'),rowBox=document.getElementById('naRevenueRows');
    if(!cardBox||!rowBox)return;
    const now=new Date();
    const paid=D.introductions.filter(i=>i.fee_status==='paid');
    const due=D.introductions.filter(i=>i.fee_status==='due');
    const started=D.introductions.filter(i=>i.tenancy_status==='started');
    const collected=paid.reduce((n,i)=>n+amount(i),0);
    const currentlyDue=due.reduce((n,i)=>n+amount(i),0);
    const thisMonth=paid.filter(i=>i.paid_at&&sameMonth(new Date(i.paid_at),now)).reduce((n,i)=>n+amount(i),0);
    cardBox.innerHTML=[
      ['Collected',money(collected),'paid'],
      ['Currently due',money(currentlyDue),'due'],
      ['Successful lets',started.length,''],
      ['Outstanding fees',due.length,'due'],
      ['This month',money(thisMonth),'paid']
    ].map(x=>'<div class="naRevenueCard '+x[2]+'"><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('');

    const tm=Object.fromEntries(D.tenants.map(x=>[x.id,x]));
    const pm=Object.fromEntries(D.properties.map(x=>[x.id,x]));
    const rows=[...D.introductions].sort((a,b)=>new Date(b.introduced_at)-new Date(a.introduced_at));
    rowBox.innerHTML=rows.length?rows.map(i=>{
      const t=tm[i.tenant_id]||{},p=pm[i.property_id]||{};
      const end=protectionEnd(i.introduced_at),active=end&&end>=new Date(new Date().toDateString());
      const fee=i.fee_status||'not_due';
      const feeClass=fee==='paid'?'good':fee==='due'?'warn':'';
      return '<tr><td><span class="ref">'+esc(i.intro_ref||'—')+'</span><br><span class="muted">'+dt(i.introduced_at)+'</span></td>'+
        '<td><b>'+esc(p.landlord_name||'Landlord')+'</b><br>'+esc(p.property_ref||'')+' · '+esc(p.property_area||'')+'<br><span class="muted">'+money(p.monthly_rent)+' pcm</span></td>'+
        '<td><b>'+esc(t.full_name||'Renter')+'</b><br><span class="muted">'+esc(t.tenant_ref||'')+'</span></td>'+
        '<td><b>'+money(amount(i))+'</b><br><span class="pill '+feeClass+'">'+esc(fee.replaceAll('_',' '))+'</span></td>'+
        '<td>'+(end?'<div class="naProtection '+(active?'active':'expired')+'">'+(active?'Protected until ':'Protection ended ')+shortDate(end.toISOString())+'</div>':'—')+'<br><span class="muted">90 days from introduction</span></td>'+
        '<td>'+(i.paid_at?'<b>Paid '+shortDate(i.paid_at)+'</b>':fee==='due'?'<b>Payment outstanding</b>':'<span class="muted">Not paid / not due</span>')+(i.payment_url?'<br><button class="btn secondary smallBtn" type="button" onclick="openUrl(\''+esc(i.payment_url)+'\')">OPEN PAYMENT</button>':'')+'</td></tr>';
    }).join(''):'<tr><td colspan="6" class="empty">No protected introductions yet.</td></tr>';
  };

  const oldRenderAll=renderAll;
  renderAll=function(){oldRenderAll();renderRevenue();};
  const oldOpenTab=openTab;
  openTab=function(id,btn){oldOpenTab(id,btn);if(id==='revenue')renderRevenue();};
  renderRevenue();
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'admin' && !body.includes('__newAddyRevenueV1')) {
      body = body.replace('</body>', revenueInjection + '\n</body>');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};