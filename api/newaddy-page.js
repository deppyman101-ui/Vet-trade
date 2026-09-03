const PUBLIC_SOURCE='https://www.vetttrade.co.uk/nextkey/index.html';
const ADMIN_SOURCE='https://www.vetttrade.co.uk/nextkey/admin.html';

const publicInjection=`
<script>
(function(){
  var form=document.getElementById('tenantForm');
  if(!form||form.dataset.passportV1==='1')return;
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
    const upstream=await fetch(source,{headers:{'user-agent':'NewAddy-Page-Composer/2.0'}});
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