const baseHandler = require('./newaddy-page-v2.js');

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string' && req.query.page === 'admin') {
      body = body.replace(
        'onclick="openPassportEditor(\'\'+t.id+\'\')"',
        'onclick="openPassportEditor(&quot;\'+t.id+\'&quot;)"'
      );
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};