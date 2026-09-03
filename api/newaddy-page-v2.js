const baseHandler = require('./newaddy-page.js');

const adminPassportInjection = `
<style>
#naPassportModal{position:fixed;inset:0;background:rgba(11,27,40,.72);z-index:250;display:grid;place-items:center;padding:18px}
#naPassportModal.naHidden{display:none}
.naPassportCard{width:min(760px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.28);border:1px solid #dfe5e8}
.naPassportHead{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:22px 24px;border-bottom:1px solid #e7ebed}
.naPassportHead h2{margin:3px 0 3px;font-family:Georgia,serif;font-size:30px;color:#17324d}
.naPassportHead p{margin:0;color:#66727d;font-size:12px;line-height:1.5}
.naPassportClose{width:38px;height:38px;border:0;border-radius:999px;background:#eef3f6;color:#17324d;font-size:22px;font-weight:900;cursor:pointer}
.naPassportBody{padding:22px 24px 24px}
.naPassportGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.naPassportField.full{grid-column:1/-1}
.naPassportField label{margin:0 0 6px;display:block;font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:#506170}
.naPassportField input,.naPassportField select,.naPassportField textarea{border:1.5px solid #d2dce1;border-radius:11px;padding:11px 12px;background:#fff;box-shadow:0 4px 12px rgba(23,50,77,.04)}
.naPassportField textarea{min-height:95px}
.naPassportStatusBox{padding:11px 13px;border-radius:11px;background:#f3f7f9;margin-bottom:15px;font-size:12px;color:#405665}
.naPassportActions{display:flex;gap:9px;justify-content:flex-end;margin-top:18px;flex-wrap:wrap}
.naPassportEdit{margin-top:8px;width:100%;background:#17324d;color:#fff;border:0;border-radius:9px;padding:8px 10px;font-size:11px;font-weight:900;cursor:pointer}
.naPassportEdit:hover{background:#244f70}
@media(max-width:650px){.naPassportGrid{grid-template-columns:1fr}.naPassportField.full{grid-column:auto}.naPassportCard{border-radius:14px}.naPassportHead,.naPassportBody{padding:18px}}
</style>
<script>
(function(){
  if(window.__newAddyPassportAdminEditor)return;
  window.__newAddyPassportAdminEditor=true;
  const PASSPORT_FN='https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-admin-passport';

  document.body.insertAdjacentHTML('beforeend',
    '<div id="naPassportModal" class="naHidden">'+
      '<div class="naPassportCard">'+
        '<div class="naPassportHead"><div><div class="eyebrow">Renter Passport</div><h2 id="naPassportTitle">Edit renter</h2><p id="naPassportSub">Update readiness details without changing the renter journey status.</p></div><button class="naPassportClose" type="button" onclick="closePassportEditor()">×</button></div>'+
        '<form id="naPassportForm" class="naPassportBody">'+
          '<input type="hidden" name="id">'+
          '<div id="naPassportCurrent" class="naPassportStatusBox"></div>'+
          '<div class="naPassportGrid">'+
            '<div class="naPassportField"><label>Income / support position</label><select name="income_position"><option value="unsure">Not sure yet</option><option value="employment">Employment income</option><option value="housing_support">Housing support / UC housing element</option><option value="employment_and_support">Employment + housing support</option><option value="other_income">Other income</option><option value="other_or_none">Other / no regular income</option></select></div>'+
            '<div class="naPassportField"><label>Employment income / month</label><input name="employment_income" type="number" min="0" max="100000" placeholder="£"></div>'+
            '<div class="naPassportField"><label>Housing support / month</label><input name="housing_support_amount" type="number" min="0" max="100000" placeholder="£"></div>'+
            '<div class="naPassportField"><label>Other income / month</label><input name="other_income" type="number" min="0" max="100000" placeholder="£"></div>'+
            '<div class="naPassportField"><label>Deposit position</label><select name="deposit_ready"><option value="unsure">Not sure yet</option><option value="ready">Deposit ready</option><option value="part_ready">Partly ready</option><option value="support_needed">Need deposit support</option></select></div>'+
            '<div class="naPassportField"><label>Guarantor position</label><select name="guarantor_status"><option value="unsure">Not sure yet</option><option value="available">Guarantor available</option><option value="if_needed">Could arrange one if needed</option><option value="not_available">No guarantor available</option></select></div>'+
            '<div class="naPassportField"><label>References</label><select name="reference_ready"><option value="unsure">Not sure yet</option><option value="ready">Reference ready</option><option value="need_help">Need help / need to arrange</option><option value="not_available">No reference available</option></select></div>'+
            '<div class="naPassportField"><label>Right to Rent readiness</label><select name="right_to_rent_ready"><option value="unsure">Not sure yet</option><option value="ready">Ready to provide when required</option><option value="need_help">Need help / need to arrange</option></select></div>'+
            '<div class="naPassportField"><label>Earliest move date</label><input name="earliest_move_date" type="date"></div>'+
            '<div class="naPassportField full"><label>Must-haves</label><textarea name="must_haves" maxlength="800" placeholder="e.g. ground floor, near station, no stairs — or None"></textarea></div>'+
          '</div>'+
          '<div id="naPassportFormMsg"></div>'+
          '<div class="naPassportActions"><button class="btn secondary" type="button" onclick="closePassportEditor()">CANCEL</button><button class="btn coral" type="submit">SAVE PASSPORT</button></div>'+
        '</form>'+
      '</div>'+
    '</div>'
  );

  const form=document.getElementById('naPassportForm');
  const modal=document.getElementById('naPassportModal');
  const value=(v)=>v===null||v===undefined?'':String(v);
  const passportLabel=(t)=>t&&t.passport_status==='complete'?'Complete':'Incomplete';

  window.openPassportEditor=function(id){
    const t=D.tenants.find(x=>x.id===id);
    if(!t)return showMsg('Renter could not be found.',true);
    form.elements.id.value=t.id;
    form.elements.income_position.value=t.income_position||'unsure';
    form.elements.employment_income.value=value(t.employment_income);
    form.elements.housing_support_amount.value=value(t.housing_support_amount);
    form.elements.other_income.value=value(t.other_income);
    form.elements.deposit_ready.value=t.deposit_ready||'unsure';
    form.elements.guarantor_status.value=t.guarantor_status||'unsure';
    form.elements.reference_ready.value=t.reference_ready||'unsure';
    form.elements.right_to_rent_ready.value=t.right_to_rent_ready||'unsure';
    form.elements.earliest_move_date.value=value(t.earliest_move_date).slice(0,10);
    form.elements.must_haves.value=value(t.must_haves);
    document.getElementById('naPassportTitle').textContent=t.full_name||'Edit renter';
    document.getElementById('naPassportSub').textContent=(t.tenant_ref||'')+' · Journey status: '+(t.status||'waiting');
    document.getElementById('naPassportCurrent').innerHTML='<b>Current Passport: '+passportLabel(t)+'</b><br>Complete means all Passport questions have been answered. It does not mean the renter has been approved.';
    document.getElementById('naPassportFormMsg').innerHTML='';
    modal.classList.remove('naHidden');
  };
  window.closePassportEditor=function(){modal.classList.add('naHidden');};
  modal.addEventListener('click',e=>{if(e.target===modal)window.closePassportEditor();});

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const b=form.querySelector('button[type="submit"]'),old=b.textContent;
    b.disabled=true;b.textContent='SAVING…';
    document.getElementById('naPassportFormMsg').innerHTML='';
    try{
      const payload=Object.fromEntries(new FormData(form).entries());
      const d=await secureCall(PASSPORT_FN,payload);
      const i=D.tenants.findIndex(x=>x.id===payload.id);
      if(i>=0)D.tenants[i]=d.renter;
      renderRenters();renderOverview();renderKPIs();
      window.closePassportEditor();
      showMsg('Renter Passport saved — '+(d.passport_status==='complete'?'Complete':'Incomplete')+'.');
    }catch(err){
      document.getElementById('naPassportFormMsg').innerHTML='<div class="error">'+esc(err.message||'Could not save Passport')+'</div>';
    }finally{b.disabled=false;b.textContent=old;}
  });

  renderRenters=function(){
    const q=($('renterSearch')?.value||'').toLowerCase(),st=$('renterStatusFilter')?.value||'',rows=D.tenants.filter(t=>(!q||[t.tenant_ref,t.full_name,t.preferred_areas,t.email,t.phone].join(' ').toLowerCase().includes(q))&&(!st||t.status===st));
    $('renterRows').innerHTML=rows.length?rows.map(t=>{
      const income=Number(t.housing_support_amount||0)+Number(t.employment_income||0)+Number(t.other_income||0);
      const complete=t.passport_status==='complete';
      return '<tr><td><span class="ref">'+esc(t.tenant_ref)+'</span><br><b>'+esc(t.full_name)+'</b><br>'+esc(t.phone)+'<br><span class="muted">'+esc(t.email)+'</span></td><td><b>'+esc(t.preferred_areas)+'</b><br>'+esc(t.property_type)+'<br>Household: '+esc(t.household_size)+'</td><td><span class="money">'+money(t.max_monthly_rent)+'</span> pcm</td><td>'+(income?'<b>'+money(income)+'</b> stated monthly income':'<span class="muted">Income not fully stated</span>')+'<br>Deposit: '+esc(t.deposit_ready||'unsure')+'<br>Reference: '+esc(t.reference_ready||'unsure')+'<br><span class="pill '+(complete?'good':'warn')+'">Passport '+(complete?'Complete':'Incomplete')+'</span><button class="naPassportEdit" type="button" onclick="openPassportEditor(\''+t.id+'\')">EDIT PASSPORT</button></td><td>'+esc(t.move_timing||'—')+(t.earliest_move_date?'<br><b>Earliest: '+esc(t.earliest_move_date)+'</b>':'')+'<br><span class="muted">Joined '+shortDate(t.created_at)+'</span></td><td>'+renterStatusSelect(t)+'</td></tr>';
    }).join(''):'<tr><td colspan="6" class="empty">No renters match this filter.</td></tr>';
  };

  renderRenters();
})();
</script>`;

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page !== 'admin') {
      body = body.replace(
        "var r=await fetch(api+'/rooms'),d=await r.json();if(!r.ok)throw new Error();",
        "var r=await fetch('https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-rooms-feed'),d=await r.json();if(!r.ok)throw new Error();"
      );
    }
    if (typeof body === 'string' && req.query.page === 'admin' && !body.includes('__newAddyPassportAdminEditor')) {
      body = body.replace('</body>', adminPassportInjection + '\n</body>');
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};