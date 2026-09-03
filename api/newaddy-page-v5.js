const baseHandler = require('./newaddy-page-v4.js');

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'admin') {
      const start = "+(i.payment_url?'<br><button";
      const end = ":'')+'</td></tr>';";
      const s = body.indexOf(start);
      if (s >= 0) {
        const e = body.indexOf(end, s);
        if (e >= 0) body = body.slice(0, s) + "+'</td></tr>';" + body.slice(e + end.length);
      }
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};