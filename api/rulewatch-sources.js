module.exports = async function handler(req,res){
  const targets=[
    {name:'Simpler Recycling',url:'https://www.gov.uk/guidance/simpler-recycling-workplace-recycling-in-england'},
    {name:'Right to work guidance',url:'https://www.gov.uk/government/publications/right-to-work-checks-employers-guide'},
    {name:'Food business registration',url:'https://register.food.gov.uk/new/?lang=en'},
    {name:'Fire risk assessment',url:'https://www.gov.uk/workplace-fire-safety-your-responsibilities/fire-risk-assessments'}
  ];
  const checked=new Date().toISOString();
  const sources=await Promise.all(targets.map(async t=>{
    try{
      const r=await fetch(t.url,{headers:{'user-agent':'RuleWatchPilot/1.0'}});
      return {name:t.name,url:t.url,ok:r.ok,status:r.status,lastModified:r.headers.get('last-modified')||r.headers.get('date')||null,checked};
    }catch(e){return {name:t.name,url:t.url,ok:false,status:0,lastModified:null,checked};}
  }));
  res.setHeader('Cache-Control','s-maxage=1800, stale-while-revalidate=86400');
  res.status(200).json({ok:true,checked,sources});
}