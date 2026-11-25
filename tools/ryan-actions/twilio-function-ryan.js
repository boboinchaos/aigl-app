// Twilio Function: /ryan  (service ryan-actions, visibility Public)
// Called only by the Ryan Actions Apps Script. Uses the account's own credentials
// (context.getTwilioClient), so no Twilio token ever leaves Twilio.
// Env: RYAN_KEY (shared secret), plus "Add my Twilio Credentials" checked.
const JASON_CELL = '+17862094537';
const LINE = '+12059557174';        // interview line, caller ID for calls
const SMS_FROM = '+18667619032';    // toll-free; texting works once verification is approved

exports.handler = async function (context, event, callback) {
  const res = new Twilio.Response();
  res.appendHeader('Content-Type', 'application/json');
  const send = (code, body) => { res.setStatusCode(code); res.setBody(body); callback(null, res); };
  if (!context.RYAN_KEY || event.key !== context.RYAN_KEY) return send(401, { ok: false, error: 'unauthorized' });

  const client = context.getTwilioClient();
  const clean = (s, n) => String(s || '').replace(/[<>&]/g, '').slice(0, n);
  try {
    if (event.action === 'call') {
      const phone = String(event.phone || '');
      if (!/^\+1\d{10}$/.test(phone)) return send(400, { ok: false, error: 'bad phone' });
      const who = clean(event.name, 60) || 'a recruiter';
      const co = clean(event.company, 80);
      const twiml = '<Response><Say voice="Polly.Matthew">Job interview call from ' + who + (co ? ' at ' + co : '') +
        '. Connecting now.</Say><Dial callerId="' + LINE + '" timeout="25"><Number>' + phone + '</Number></Dial></Response>';
      const call = await client.calls.create({ to: JASON_CELL, from: LINE, twiml, timeout: 25 });
      return send(200, { ok: true, sid: call.sid });
    }
    if (event.action === 'text') {
      const to = event.to === 'jason' ? JASON_CELL : String(event.to || '');
      if (!/^\+1\d{10}$/.test(to)) return send(400, { ok: false, error: 'bad number' });
      const msg = await client.messages.create({ to, from: SMS_FROM, body: String(event.body || '').slice(0, 600) });
      return send(200, { ok: true, sid: msg.sid });
    }
    return send(400, { ok: false, error: 'unknown action' });
  } catch (e) {
    return send(502, { ok: false, error: String(e.message || e).slice(0, 300) });
  }
};
