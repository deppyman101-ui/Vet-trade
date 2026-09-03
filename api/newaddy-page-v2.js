const baseHandler = require('./newaddy-page.js');

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page !== 'admin') {
      body = body.replace(
        "var r=await fetch(api+'/rooms'),d=await r.json();if(!r.ok)throw new Error();",
        "var r=await fetch('https://iymhyxheggqsewpczgjl.supabase.co/functions/v1/newaddy-rooms-feed'),d=await r.json();if(!r.ok)throw new Error();"
      );
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};