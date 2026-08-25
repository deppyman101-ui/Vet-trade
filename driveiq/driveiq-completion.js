/* DRIVEIQ pilot enhancement: completion screenshot -> actual result */
(() => {
  let completionJob = null;
  let completionShotData = null;
  let completionCapturedAt = null;

  function injectCompletionUI(){
    if(document.getElementById('completePage')) return;
    const nav=document.querySelector('#driverApp .nav');
    if(!nav) return;
    const main=document.createElement('main');
    main.id='completePage';
    main.className='hidden';
    main.innerHTML=`
      <section class="panel section">
        <div class="eyebrow">JOB RESULT</div>
        <h2>Job accepted. Finish it, then screenshot it.</h2>
        <div id="completeJobInfo" class="status good">We saved your acceptance time.</div>
        <p class="helper" style="margin-top:10px">When the delivery is complete, open the completed-order / earnings screen in Uber Eats, Deliveroo or Just Eat and take a screenshot. DRIVEIQ reads the final earnings on this phone. The screenshot is not stored.</p>
        <label class="upload" for="completeShot" style="margin-top:16px">
          <input id="completeShot" type="file" accept="image/*"/>
          <div class="scan">✓</div>
          <div><b>Upload completion screenshot</b><small>Completed order • earnings screen</small></div>
          <div class="arrow">→</div>
        </label>
        <div id="completePreview" class="preview hidden"><img id="completePreviewImg" alt="Completion screenshot"/></div>
        <button id="readCompleteBtn" class="cta hidden"><span>READ COMPLETION</span><strong>→</strong></button>
        <div id="completeFields" class="form hidden" style="margin-top:16px">
          <div id="completeReadStatus" class="status">Check the result below.</div>
          <div class="row2">
            <label class="field"><span>FINAL EARNINGS (£)</span><input id="actualEarnings" type="number" step="0.01" inputmode="decimal"/></label>
            <label class="field"><span>ACTUAL JOB TIME</span><input id="actualMinutes" type="number" step="1" inputmode="numeric" readonly/></label>
          </div>
          <label class="field"><span>MAIN DELAY? (OPTIONAL)</span>
            <select id="delayReason">
              <option value="none">None</option>
              <option value="restaurant wait">Restaurant wait</option>
              <option value="traffic">Traffic</option>
              <option value="parking">Parking</option>
              <option value="customer">Customer / drop-off</option>
              <option value="other">Other</option>
            </select>
          </label>
          <button id="saveCompleteBtn" class="cta"><span>SAVE ACTUAL RESULT</span><strong>✓</strong></button>
        </div>
        <button id="completeLaterBtn" class="ghost">I'll upload it after the delivery</button>
      </section>`;
    nav.parentNode.insertBefore(main,nav);

    document.getElementById('completeShot').onchange=e=>{
      const f=e.target.files?.[0];
      if(!f)return;
      const start=completionJob?.acceptedAt?new Date(completionJob.acceptedAt).getTime():0;
      const modified=Number(f.lastModified||0);
      completionCapturedAt=(Number.isFinite(modified)&&modified>=start-60000&&modified<=Date.now()+300000)?modified:Date.now();
      const r=new FileReader();
      r.onload=()=>{
        completionShotData=r.result;
        document.getElementById('completePreviewImg').src=completionShotData;
        show(document.getElementById('completePreview'));
        show(document.getElementById('readCompleteBtn'));
        renderCompletionInfo();
      };
      r.readAsDataURL(f);
    };

    document.getElementById('readCompleteBtn').onclick=readCompletionScreenshot;
    document.getElementById('saveCompleteBtn').onclick=saveCompletionResult;
    document.getElementById('completeLaterBtn').onclick=()=>{
      completionShotData=null;
      completionCapturedAt=null;
      resetScore();
      switchPage('score');
      toast('Accepted job saved — complete it later from History');
    };
  }

  function hideDriverPages(){
    ['scorePage','confirmPage','resultPage','historyPage','settingsPage','completePage'].forEach(id=>{
      const el=document.getElementById(id); if(el) hide(el);
    });
  }

  function elapsedMinutes(){
    if(!completionJob?.acceptedAt)return 1;
    const start=new Date(completionJob.acceptedAt).getTime();
    if(!Number.isFinite(start))return 1;
    const end=completionCapturedAt||Date.now();
    return Math.max(1,Math.round((end-start)/60000));
  }

  function renderCompletionInfo(){
    const info=document.getElementById('completeJobInfo');
    if(!info||!completionJob)return;
    const accepted=new Date(completionJob.acceptedAt);
    const acceptedText=Number.isNaN(accepted.getTime())?'acceptance time saved':accepted.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    const timingText=completionCapturedAt?` Current measured time: ${elapsedMinutes()} min.`:' DRIVEIQ is timing the job automatically.';
    info.textContent=`${completionJob.platform||'Delivery'} • ${money(completionJob.offer||0)} offer • accepted ${acceptedText}.${timingText}`;
    const mins=document.getElementById('actualMinutes');
    if(mins) mins.value=elapsedMinutes();
  }

  function resetCompletionUI(){
    completionShotData=null;
    completionCapturedAt=null;
    const input=document.getElementById('completeShot'); if(input)input.value='';
    const p=document.getElementById('completePreview'); if(p)hide(p);
    const b=document.getElementById('readCompleteBtn'); if(b)hide(b);
    const f=document.getElementById('completeFields'); if(f)hide(f);
    const e=document.getElementById('actualEarnings'); if(e)e.value='';
    const d=document.getElementById('delayReason'); if(d)d.value='none';
  }

  function parseCompletionOCR(text){
    const clean=String(text||'').replace(/,/g,'.');
    const lower=clean.toLowerCase();
    const all=[...clean.matchAll(/£\s*([0-9]+(?:\.[0-9]{1,2})?)/g)]
      .map(m=>Number(m[1])).filter(x=>x>0&&x<500);
    const labelled=[];
    const patterns=[
      /(?:your\s+earnings|earnings|you\s+earned|total|delivery\s+fare|trip\s+fare|fare|paid)\s*[:\-]?\s*£\s*([0-9]+(?:\.[0-9]{1,2})?)/gi,
      /£\s*([0-9]+(?:\.[0-9]{1,2})?)\s*(?:your\s+earnings|earnings|earned|total|fare)/gi
    ];
    patterns.forEach(re=>{for(const m of clean.matchAll(re)){const n=Number(m[1]);if(n>0&&n<500)labelled.push(n)}});
    const offer=Number(completionJob?.offer||0);
    const sensibleMax=Math.max(50,offer*3,offer+25);
    const candidates=(labelled.length?labelled:all).filter(x=>x<=sensibleMax);
    let earnings='';
    if(candidates.length)earnings=Math.max(...candidates);
    else if(all.length===1)earnings=all[0];
    const dists=[...lower.matchAll(/([0-9]+(?:\.[0-9]+)?)\s*(?:mi|mile|miles)\b/g)]
      .map(m=>Number(m[1])).filter(x=>x>0&&x<100);
    return {earnings,distance:dists[0]||'',foundMoney:all.length};
  }

  async function readCompletionScreenshot(){
    if(!completionShotData||!completionJob)return;
    setLoading(true,'Reading completed job…','Looking for the final earnings on this phone. The screenshot is not uploaded.');
    try{
      if(!window.Tesseract)throw new Error('OCR engine could not load');
      const worker=await Tesseract.createWorker('eng',1,{logger:m=>{if(m.progress)document.getElementById('progressBar').style.width=Math.round(m.progress*100)+'%'}});
      const ret=await worker.recognize(completionShotData);
      await worker.terminate();
      const p=parseCompletionOCR(ret.data.text||'');
      document.getElementById('actualMinutes').value=elapsedMinutes();
      const status=document.getElementById('completeReadStatus');
      if(p.earnings){
        document.getElementById('actualEarnings').value=Number(p.earnings).toFixed(2);
        status.className='status good';
        status.textContent=`DRIVEIQ found ${money(p.earnings)} and measured ${elapsedMinutes()} min. Check it, then save.`;
      }else{
        status.className='status warn';
        status.textContent=`I could not confidently find the final earnings. Enter just the final £ amount below — DRIVEIQ measured ${elapsedMinutes()} min automatically.`;
      }
      show(document.getElementById('completeFields'));
    }catch(e){
      document.getElementById('actualMinutes').value=elapsedMinutes();
      const status=document.getElementById('completeReadStatus');
      status.className='status warn';
      status.textContent=`Screenshot could not be read. Enter only the final earnings — DRIVEIQ measured ${elapsedMinutes()} min automatically.`;
      show(document.getElementById('completeFields'));
    }finally{setLoading(false)}
  }

  async function saveCompletionResult(){
    if(!completionJob)return;
    const earnings=Number(document.getElementById('actualEarnings').value);
    const mins=elapsedMinutes();
    if(!(earnings>0))return toast('Enter the final earnings');
    document.getElementById('actualMinutes').value=mins;
    try{
      setLoading(true,'Saving actual result…','Comparing the real job with the DRIVEIQ prediction');
      await api({
        action:'feedback',
        job_id:completionJob.id,
        driver_action:'accepted',
        actual_minutes:mins,
        actual_earnings:earnings,
        actual_miles:null,
        delay_reason:document.getElementById('delayReason').value,
        notes:'Completion result captured from post-job screenshot flow'
      });
      toast('Actual result saved');
      completionJob=null;
      resetCompletionUI();
      resetScore();
      await loadHistory();
      switchPage('score');
    }catch(e){toast(e.message)}finally{setLoading(false)}
  }

  window.openCompletionForJob=(id,offer,acceptedAt,platform,pickup)=>{
    injectCompletionUI();
    completionJob={id,offer:Number(offer||0),acceptedAt,platform:platform||'Delivery',pickup:pickup||''};
    resetCompletionUI();
    renderCompletionInfo();
    hideDriverPages();
    show(document.getElementById('completePage'));
    document.querySelectorAll('.nav button').forEach(b=>b.classList.remove('active'));
  };

  const originalSwitchPage=window.switchPage||switchPage;
  window.switchPage=function(p){
    const complete=document.getElementById('completePage'); if(complete)hide(complete);
    return originalSwitchPage(p);
  };

  document.querySelectorAll('.feedbackButtons button').forEach(b=>{
    b.onclick=async()=>{
      if(!currentJob)return;
      try{
        const action=b.dataset.action;
        const j=await api({action:'feedback',job_id:currentJob.id,driver_action:action});
        await loadHistory();
        if(action==='accepted'){
          const acceptedAt=j?.feedback?.created_at||new Date().toISOString();
          window.openCompletionForJob(currentJob.id,Number(currentJob.offer_pay||document.getElementById('pay').value||0),acceptedAt,currentJob.platform||document.getElementById('platform').value,currentJob.pickup||document.getElementById('pickup').value);
          toast('Accepted — timer started');
        }else toast('Result saved');
      }catch(e){toast(e.message)}
    };
  });

  window.renderHistory=function(jobs){
    const html=jobs.length?jobs.map(j=>{
      const f=j.feedback;
      const actual=f?.actual_minutes?` • actual ${f.actual_minutes}m / ${money(f.actual_earnings||0)}`:'';
      const completeButton=f?.driver_action==='accepted'&&!f.actual_minutes
        ?`<button class="linkbtn completeJobBtn" data-job-id="${j.id}">COMPLETE JOB →</button>`:'';
      return `<div class="historyItem"><div class="historyMain"><b>${escapeHtml(j.platform)} • ${money(j.offer_pay)} • ${Number(j.total_distance).toFixed(1)}mi</b><small>${escapeHtml(j.pickup||'Pickup not recorded')} • ${new Date(j.created_at).toLocaleString()}${actual}</small>${completeButton}</div><div class="historyRight"><span class="vtag v${j.verdict}">${j.verdict}</span><small style="display:block;color:#788eaf;margin-top:5px">${money(j.net_hourly)}/hr</small></div></div>`;
    }).join(''):'<div class="helper">No jobs scored yet.</div>';
    document.getElementById('historyList').innerHTML=html;
    document.getElementById('recentList').innerHTML=jobs.length?html.split('</div></div>').slice(0,3).join('</div></div>')+'</div></div>':'<div class="helper">No jobs scored yet.</div>';
    document.querySelectorAll('.completeJobBtn').forEach(btn=>{
      btn.onclick=()=>{
        const j=jobs.find(x=>String(x.id)===String(btn.dataset.jobId));
        if(!j)return;
        const acceptedAt=j.feedback?.created_at||j.created_at;
        window.openCompletionForJob(j.id,Number(j.offer_pay),acceptedAt,j.platform,j.pickup||'');
      };
    });
  };

  injectCompletionUI();
  if(role==='driver')loadHistory();
})();

// RouteSignal-only shift/idle intelligence. DRIVEIQ pages remain unchanged.
if (location.pathname.toLowerCase().includes('/routesignal/')) {
  const rsIdleScript = document.createElement('script');
  rsIdleScript.src = '../routesignal/idle-intelligence.js?v=1';
  document.head.appendChild(rsIdleScript);
}
