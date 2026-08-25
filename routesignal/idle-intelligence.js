(() => {
  const KEY = 'routesignal_shift_v1';
  const NOTIFY_KEY = 'routesignal_shift_notified_v1';
  let lastResultVisible = false;
  const scorePage = document.getElementById('scorePage');
  if (!scorePage) return;

  const style = document.createElement('style');
  style.textContent = `
    .rsShift{margin-bottom:14px;border:1px solid rgba(64,190,255,.22);overflow:hidden;background:linear-gradient(155deg,rgba(16,43,75,.98),rgba(7,18,40,.98))}
    .rsShiftHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.rsShiftHead h2{margin:5px 0 5px;font-size:24px;line-height:1.05}.rsShiftHead p{margin:0;color:#8da1bf;font-size:12px;line-height:1.45}
    .rsOnline{font-size:10px;font-weight:900;letter-spacing:.08em;padding:8px 10px;border-radius:999px;background:#15233b;color:#7f94b5;white-space:nowrap}.rsOnline.on{background:rgba(31,210,135,.13);color:#3be09a;border:1px solid rgba(31,210,135,.28)}
    .rsShiftStats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:15px 0 10px}.rsShiftStat{background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:12px 9px}.rsShiftStat small{display:block;color:#7289aa;font-size:8px;font-weight:900;letter-spacing:.07em;margin-bottom:6px}.rsShiftStat b{font-size:18px;color:#fff}
    .rsGuide{border-radius:14px;padding:14px 15px;margin:10px 0 12px;border:1px solid rgba(255,255,255,.08);background:#0b1930}.rsGuideTop{display:flex;justify-content:space-between;gap:10px;align-items:center}.rsGuideTop span{font-size:9px;font-weight:900;letter-spacing:.09em;color:#7f94b5}.rsGuideTop b{font-size:17px}.rsGuide p{font-size:11px;line-height:1.5;margin:7px 0 0;color:#a6b6cc}.rsGuide.stay b{color:#35df98}.rsGuide.watch b{color:#ffc14d}.rsGuide.move b{color:#ff984f}.rsGuide.stop b{color:#ff6571}
    .rsShiftActions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.rsShiftBtn{height:48px;border:0;border-radius:13px;font-weight:900;letter-spacing:.04em}.rsShiftBtn.start{background:#31d68d;color:#061b15}.rsShiftBtn.end{background:#192a43;color:#dce7f6;border:1px solid rgba(255,255,255,.09)}.rsShiftBtn:disabled{opacity:.45}
    .rsAutoNote{font-size:9px;color:#7086a7;line-height:1.45;margin-top:9px}.rsSummary{margin-top:10px;padding:12px;border-radius:13px;background:rgba(49,214,141,.08);border:1px solid rgba(49,214,141,.18);font-size:11px;color:#b8c9da;line-height:1.55}.rsSummary b{color:#fff}
    @media(max-width:420px){.rsShiftStats{gap:6px}.rsShiftStat{padding:10px 7px}.rsShiftStat b{font-size:16px}.rsShiftHead h2{font-size:22px}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement('section');
  panel.className = 'panel section rsShift';
  panel.innerHTML = `
    <div class="rsShiftHead">
      <div><div class="eyebrow">IDLE INTELLIGENCE • V1</div><h2>Make more. Wait less.</h2><p>Start your shift once. RouteSignal watches your dead time and tells you when waiting stops making sense.</p></div>
      <div id="rsOnline" class="rsOnline">OFFLINE</div>
    </div>
    <div class="rsShiftStats">
      <div class="rsShiftStat"><small>SHIFT TIME</small><b id="rsShiftTime">00:00</b></div>
      <div class="rsShiftStat"><small>NO OFFER FOR</small><b id="rsIdleTime">00:00</b></div>
      <div class="rsShiftStat"><small>ACCEPTED £/HR</small><b id="rsLiveRate">£0.00</b></div>
    </div>
    <div id="rsGuide" class="rsGuide stay"><div class="rsGuideTop"><span>ROUTESIGNAL SAYS</span><b id="rsGuideTitle">GO ONLINE</b></div><p id="rsGuideText">Start a shift and RouteSignal will begin protecting your time.</p></div>
    <div class="rsShiftActions"><button id="rsStart" class="rsShiftBtn start">GO ONLINE</button><button id="rsEnd" class="rsShiftBtn end" disabled>END SHIFT</button></div>
    <div class="rsAutoNote">Automatic pilot: the timer uses real clock time even if the page sleeps. When supported, RouteSignal can alert you when idle time crosses a warning point.</div>
    <div id="rsSummary" class="rsSummary hidden"></div>
  `;
  scorePage.insertBefore(panel, scorePage.firstChild);

  const el = id => document.getElementById(id);
  const fresh = () => ({active:false,start:0,lastOffer:0,jobsSeen:0,accepted:0,acceptedGross:0,ended:0,lat:null,lng:null});
  const load = () => { try { return {...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}')}; } catch { return fresh(); } };
  const save = state => localStorage.setItem(KEY, JSON.stringify(state));
  const cash = n => '£' + Number(n || 0).toFixed(2);
  const target = () => Number(el('hourTarget')?.value) || 15;
  const fmt = ms => {
    ms = Math.max(0, ms || 0);
    const total = Math.floor(ms / 60000);
    const h = Math.floor(total / 60), m = total % 60;
    return h ? `${h}h ${String(m).padStart(2,'0')}m` : `${String(m).padStart(2,'0')}:00`;
  };

  async function requestPilotPermissions(state) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => {
        state.lat = p.coords.latitude;
        state.lng = p.coords.longitude;
        save(state);
      }, () => {}, {enableHighAccuracy:false, timeout:5000, maximumAge:60000});
    }
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch {}
    }
  }

  function notifyOnce(code, title, body) {
    let marks = {};
    try { marks = JSON.parse(localStorage.getItem(NOTIFY_KEY) || '{}'); } catch {}
    const state = load();
    const shiftKey = String(state.start || 0);
    if ((marks[shiftKey] || []).includes(code)) return;
    marks[shiftKey] = [...(marks[shiftKey] || []), code];
    localStorage.setItem(NOTIFY_KEY, JSON.stringify(marks));
    try { if ('Notification' in window && Notification.permission === 'granted') new Notification(title, {body}); } catch {}
    try { navigator.vibrate?.([120,70,120]); } catch {}
  }

  function guidance(idleMs, state) {
    const mins = idleMs / 60000;
    const elapsedH = Math.max((Date.now() - state.start) / 3600000, 1/60);
    const rate = state.acceptedGross / elapsedH;
    const t = target();
    if (!state.active) return {cls:'stay', title:'GO ONLINE', text:'Start a shift and RouteSignal will begin protecting your time.'};
    if (mins < 8) return {cls:'stay', title:'STAY', text:`Still inside the normal wait window. Your target is ${cash(t)}/hr — RouteSignal is watching the clock.`};
    if (mins < 15) return {cls:'watch', title:'WATCHING', text:'The wait is starting to hurt. Stay ready, but if nothing lands by 15 minutes RouteSignal will recommend action.'};
    if (mins < 25) {
      notifyOnce('move15', 'RouteSignal: idle 15 minutes', 'Waiting is starting to cost you. Consider moving to a busier restaurant cluster or switching app.');
      return {cls:'move', title:'MOVE / SWITCH APP', text:`No offer for ${Math.floor(mins)} minutes. Reposition toward a busier restaurant cluster or switch platform instead of waiting blind.`};
    }
    notifyOnce('stop25', 'RouteSignal: dead time warning', 'You have been idle for 25+ minutes. Move zones, switch platform or pause the shift.');
    return {cls:'stop', title:'STOP WASTING THE HOUR', text:`Idle ${Math.floor(mins)} minutes. ${rate < t ? 'Your accepted-offer rate is below target. ' : ''}Move zones, switch app or pause rather than donating more unpaid time.`};
  }

  function render() {
    const state = load();
    const now = Date.now();
    const elapsed = state.active ? now - state.start : (state.ended && state.start ? state.ended - state.start : 0);
    const idle = state.active ? now - (state.lastOffer || state.start) : 0;
    const hours = Math.max(elapsed / 3600000, 0);
    const rate = hours ? state.acceptedGross / hours : 0;
    el('rsShiftTime').textContent = fmt(elapsed);
    el('rsIdleTime').textContent = fmt(idle);
    el('rsLiveRate').textContent = cash(rate);
    el('rsOnline').textContent = state.active ? '● ONLINE' : 'OFFLINE';
    el('rsOnline').classList.toggle('on', state.active);
    el('rsStart').disabled = state.active;
    el('rsEnd').disabled = !state.active;
    const g = guidance(idle, state);
    const box = el('rsGuide');
    box.className = 'rsGuide ' + g.cls;
    el('rsGuideTitle').textContent = g.title;
    el('rsGuideText').textContent = g.text;
  }

  function startShift() {
    const state = fresh();
    state.active = true;
    state.start = Date.now();
    state.lastOffer = state.start;
    save(state);
    localStorage.removeItem(NOTIFY_KEY);
    el('rsSummary').classList.add('hidden');
    requestPilotPermissions(state);
    render();
  }

  function endShift() {
    const state = load();
    if (!state.active) return;
    state.active = false;
    state.ended = Date.now();
    save(state);
    const elapsed = Math.max(state.ended - state.start, 1);
    const hours = elapsed / 3600000;
    const rate = state.acceptedGross / hours;
    const summary = el('rsSummary');
    summary.innerHTML = `<b>SHIFT COMPLETE</b><br>${fmt(elapsed)} online • ${state.jobsSeen} offers scored • ${state.accepted} accepted<br>${cash(state.acceptedGross)} accepted offer value • ${cash(rate)}/hr across the shift<br><span style="color:#7f94b5">Pilot note: this is accepted offer value, not final net profit yet.</span>`;
    summary.classList.remove('hidden');
    render();
  }

  function markOffer() {
    const state = load();
    if (!state.active) return;
    state.lastOffer = Date.now();
    state.jobsSeen += 1;
    save(state);
    render();
  }

  function markAccepted() {
    const state = load();
    if (!state.active) return;
    const pay = Number(el('pay')?.value) || 0;
    state.accepted += 1;
    state.acceptedGross += pay;
    save(state);
    render();
  }

  el('rsStart').addEventListener('click', startShift);
  el('rsEnd').addEventListener('click', endShift);
  document.querySelectorAll('.feedbackButtons button[data-action="accepted"]').forEach(btn => btn.addEventListener('click', markAccepted));

  const resultPage = el('resultPage');
  if (resultPage) {
    const observer = new MutationObserver(() => {
      const visible = !resultPage.classList.contains('hidden');
      if (visible && !lastResultVisible) markOffer();
      lastResultVisible = visible;
    });
    observer.observe(resultPage, {attributes:true, attributeFilter:['class']});
  }

  setInterval(render, 1000);
  render();
})();