export default async function handler(req, res) {
  const base = 'https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/nextkey-pilot';
  const testEmail = 'NewAddy101@outlook.com';
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlK5wAAAABJRU5ErkJggg==','base64');
  const report = { started_at: new Date().toISOString() };
  try {
    const makeForm = (fields, withPhoto=true) => {
      const fd = new FormData();
      for (const [k,v] of Object.entries(fields)) fd.append(k, String(v));
      if (withPhoto) fd.append('photos', new Blob([png], {type:'image/png'}), 'newaddy-test.png');
      return fd;
    };

    const freeRoomFields = {
      host_name:'NewAddy Test Host', phone:'07000000000', email:testEmail, host_type:'homeowner',
      property_area:'Lewisham', postcode:'SE13 7AA', monthly_rent:'725', deposit_amount:'250', bills_included:'true',
      available_from:'Immediately', furnished:'Furnished', household_summary:'TEST LISTING - delete after smoke test',
      room_description:'CONTROLLED NEWADDY TEST ROOM - not a real listing.', preferences:'Test only', plan:'free', terms:'on'
    };
    let r = await fetch(base+'/room', {method:'POST', body:makeForm(freeRoomFields)});
    report.free_room_status = r.status;
    report.free_room = await r.json();

    if (report.free_room?.ref) {
      r = await fetch(base+'/rooms');
      const rooms = await r.json();
      report.rooms_get_status = r.status;
      report.free_room_visible = !!rooms.rooms?.some(x=>x.room_ref===report.free_room.ref);

      r = await fetch(base+'/message', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({
        listing_type:'room', listing_ref:report.free_room.ref, sender_name:'NewAddy Test Enquirer', sender_email:testEmail,
        sender_phone:'07000000001', message:'CONTROLLED NEWADDY TEST ENQUIRY - please ignore.'
      })});
      report.message_status = r.status;
      report.message = await r.json();
    }

    const swapFields = {
      lister_name:'NewAddy Test Swapper', phone:'07000000002', email:testEmail,
      current_area:'Catford', current_postcode:'SE6 4AA', current_property_type:'Flat', current_bedrooms:'2', landlord_type:'Council',
      current_description:'CONTROLLED NEWADDY TEST SWAP - not a real listing.', current_features:'Test only',
      wanted_areas:'Bromley', wanted_bedrooms:'3', wanted_property_type:'House', move_reason:'Smoke test only', terms:'on'
    };
    r = await fetch(base+'/swap', {method:'POST', body:makeForm(swapFields)});
    report.swap_status = r.status;
    report.swap = await r.json();
    if (report.swap?.ref) {
      r = await fetch(base+'/swaps');
      const swaps = await r.json();
      report.swaps_get_status = r.status;
      report.swap_visible = !!swaps.swaps?.some(x=>x.swap_ref===report.swap.ref);
    }

    const featuredFields = {...freeRoomFields, host_name:'NewAddy Featured Test', phone:'07000000003', property_area:'Bromley', postcode:'BR1 1AA', monthly_rent:'800', plan:'featured', room_description:'CONTROLLED NEWADDY FEATURED TEST ROOM - not a real listing.'};
    r = await fetch(base+'/room', {method:'POST', body:makeForm(featuredFields)});
    report.featured_room_status = r.status;
    report.featured_room = await r.json();
    report.featured_checkout_created = !!report.featured_room?.payment_url;
    report.finished_at = new Date().toISOString();
    res.status(200).json(report);
  } catch (e) {
    report.error = e?.message || String(e);
    report.finished_at = new Date().toISOString();
    res.status(500).json(report);
  }
}
