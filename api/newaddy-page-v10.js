const baseHandler = require('./newaddy-page-v9.js');

module.exports = async function handler(req, res) {
  const originalSend = res.send.bind(res);
  res.send = function patchedSend(body) {
    if (typeof body === 'string') {
      body = body
        .replace("Paid visibility never changes a renter's legal rights or guarantees enquiries.", "Paid visibility never changes a renter\\'s legal rights or guarantees enquiries.")
        .replace("style=\"background-image:url(''+esc2(img)+'')\"", "style=\"background-image:url(&quot;'+esc2(img)+'&quot;)\"");
    }
    return originalSend(body);
  };
  return baseHandler(req, res);
};
