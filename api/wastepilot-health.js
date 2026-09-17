export default async function handler(req,res){
  try{
    const r=await fetch('https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/wastepilot-signup?action=stats',{headers:{'cache-control':'no-store'}});
    const text=await r.text();
    res.setHeader('Cache-Control','no-store');
    res.status(r.status).setHeader('Content-Type','application/json; charset=utf-8').send(text);
  }catch(e){
    res.status(502).json({ok:false,error:'WastePilot backend unavailable'});
  }
}
