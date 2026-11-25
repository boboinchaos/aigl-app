// Twilio Function: /open  (service ryan-actions, visibility Public)
// Email-open pixel + résumé-page visit ping. Returns a 1x1 GIF and tells the Ryan Actions
// Apps Script (action "track"), which emails Jason and logs to the Ryan Leads sheet.
// Env: AS_URL (Apps Script web app URL), AS_KEY (its RYAN_KEY).
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');

exports.handler = async function (context, event, callback) {
  const tag = String(event.t || '').slice(0, 80);
  const kind = event.k === 'visit' ? 'visit' : 'open';
  if (tag && context.AS_URL && context.AS_KEY) {
    try {
      await fetch(context.AS_URL, {
        method: 'POST', headers: { 'Content-Type': 'text/plain' }, redirect: 'follow',
        body: JSON.stringify({ key: context.AS_KEY, action: 'track', tag, kind, ua: String((event.request && event.request.headers && event.request.headers['user-agent']) || '').slice(0, 120) })
      });
    } catch (e) { /* never break the image */ }
  }
  const res = new Twilio.Response();
  res.appendHeader('Content-Type', 'image/gif');
  res.appendHeader('Cache-Control', 'no-store, max-age=0');
  res.appendHeader('Access-Control-Allow-Origin', '*');
  res.setBody(GIF);
  callback(null, res);
};
