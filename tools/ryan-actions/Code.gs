/**
 * Ryan Actions: lets Jason's AI résumé agent (ElevenLabs) actually do things.
 *   send_resume     emails the résumé from jason@aigl.dev
 *   check_time      checks Jason's calendar for a time and suggests open slots
 *   book_interview  puts the interview on Jason's calendar and invites the recruiter
 *   connect_call    calls the recruiter's phone and connects them to Jason (Twilio)
 * Every action emails Jason a summary and logs a row in the "Ryan Leads" sheet.
 *
 * Setup (Script properties, Project Settings > Script properties):
 *   RYAN_KEY            shared secret the ElevenLabs tools send (required)
 *   TWILIO_SID          Twilio Account SID (only for connect_call; Jason adds it)
 *   TWILIO_TOKEN        Twilio Auth Token  (only for connect_call; Jason adds it)
 */
const OWNER = 'boboinchaos@gmail.com';      // where Jason's alerts go
const FROM = 'jason@aigl.dev';               // Gmail "send mail as" alias
const NAME = 'Jason Bourbeau';
const TZ = 'America/Chicago';
const PAGE = 'https://app.aigl.dev/jasonbourbeauresume/';
const INTERVIEW_LINE = '+12059557174';       // Twilio number recruiters see
const JASON_CELL = '+17862094537';           // where connect_call rings Jason
const LINE_PRETTY = '(205) 955-7174';

function doPost(e) { return handle_(e); }
function doGet(e) { return handle_(e); }

function handle_(e) {
  let body = {};
  try { if (e && e.postData && e.postData.contents) body = JSON.parse(e.postData.contents); } catch (x) {}
  const p = Object.assign({}, (e && e.parameter) || {}, body);
  const key = PropertiesService.getScriptProperties().getProperty('RYAN_KEY');
  if (!key || p.key !== key) return out_({ ok: false, message: 'Not authorized.' });
  try {
    switch (p.action) {
      case 'send_resume': return out_(sendResume_(p));
      case 'check_time': return out_(checkTime_(p));
      case 'book_interview': return out_(book_(p));
      case 'connect_call': return out_(connectCall_(p));
      case 'ping': return out_({ ok: true, message: 'Ryan actions are online.' });
      default: return out_({ ok: false, message: 'Unknown action.' });
    }
  } catch (err) {
    notify_('Ryan action error', String(err) + '\n\n' + JSON.stringify(scrub_(p), null, 2));
    return out_({ ok: false, message: 'Something went wrong on my end. Jason has been notified and will follow up.' });
  }
}

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function scrub_(p) { const c = Object.assign({}, p); delete c.key; return c; }
function clean_(s, n) { return String(s || '').replace(/[\r\n<>]/g, ' ').trim().slice(0, n || 120); }
function validEmail_(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim()); }

// Basic abuse limits: per address per hour, and per day overall.
function allow_(bucket, perHour, perDay) {
  const cache = CacheService.getScriptCache();
  const h = 'h:' + bucket, n = Number(cache.get(h) || 0);
  if (n >= perHour) return false;
  cache.put(h, String(n + 1), 3600);
  const props = PropertiesService.getScriptProperties();
  const d = 'd:' + Utilities.formatDate(new Date(), TZ, 'yyyyMMdd');
  const m = Number(props.getProperty(d) || 0);
  if (m >= perDay) return false;
  props.setProperty(d, String(m + 1));
  return true;
}

function sendResume_(p) {
  const to = String(p.email || '').trim();
  if (!validEmail_(to)) return { ok: false, message: 'That email address does not look right. Please spell it out again.' };
  if (!allow_('mail:' + to.toLowerCase(), 3, 40)) return { ok: false, message: 'I have already sent it a few times. Please check spam, or Jason can resend it.' };
  const name = clean_(p.name, 60), company = clean_(p.company, 80);
  const fmt = String(p.format || 'pdf').toLowerCase();
  const files = [];
  if (fmt.indexOf('word') > -1 || fmt.indexOf('doc') > -1 || fmt === 'both') files.push('Jason-Bourbeau-Resume.docx');
  if (fmt.indexOf('pdf') > -1 || fmt === 'both' || files.length === 0) files.push('Jason-Bourbeau-Resume.pdf');
  const attachments = files.map(f => UrlFetchApp.fetch(PAGE + f).getBlob().setName(f));
  const link = PAGE + (company ? '?c=' + encodeURIComponent(company) : '');
  const subject = 'Jason Bourbeau - Resume' + (company ? ' for ' + company : '');
  const text = 'Hi' + (name ? ' ' + name : '') + ',\n\n' +
    'Thanks for taking a look. As requested, my resume is attached.\n\n' +
    'You can keep talking with my AI interactive resume anytime: ' + link + '\n' +
    'Or reach me directly at ' + LINE_PRETTY + ' or ' + FROM + '.\n\n' +
    'Best,\nJason Bourbeau';
  GmailApp.sendEmail(to, subject, text, { from: FROM, name: NAME, replyTo: FROM, attachments: attachments });
  log_('send_resume', name, company, to, '', files.join(', '));
  notify_('Ryan sent your resume to ' + (name || to) + (company ? ' (' + company + ')' : ''),
    'Sent to: ' + to + '\nName: ' + name + '\nCompany: ' + company + '\nFiles: ' + files.join(', ') + '\n\nThey can reply straight to jason@aigl.dev.');
  return { ok: true, message: 'Sent. The resume is on its way to ' + to + ' from jason@aigl.dev.' };
}

function parseStart_(s) {
  const d = new Date(String(s || ''));
  return isNaN(d.getTime()) ? null : d;
}

function busy_(start, end) {
  return CalendarApp.getDefaultCalendar().getEvents(start, end).filter(ev => !ev.isAllDayEvent());
}

function fmt_(d) { return Utilities.formatDate(d, TZ, "EEEE, MMMM d 'at' h:mm a 'Central'"); }

function suggest_(from, minutes, count) {
  const out = [];
  let t = new Date(from.getTime());
  t.setMinutes(t.getMinutes() < 30 ? 30 : 60, 0, 0);
  for (let i = 0; i < 400 && out.length < count; i++) {
    const hour = Number(Utilities.formatDate(t, TZ, 'H'));
    const dow = Number(Utilities.formatDate(t, TZ, 'u')); // 1=Mon .. 7=Sun
    const end = new Date(t.getTime() + minutes * 60000);
    if (dow <= 5 && hour >= 9 && hour < 17 && busy_(t, end).length === 0) out.push(fmt_(t));
    t = new Date(t.getTime() + 30 * 60000);
  }
  return out;
}

function checkTime_(p) {
  const start = parseStart_(p.start);
  const minutes = Math.min(Math.max(Number(p.minutes || 30), 15), 120);
  if (!start) return { ok: false, message: 'I could not read that time. Please give a day and time.' };
  if (start.getTime() < Date.now() + 30 * 60000) return { ok: false, message: 'That time has passed or is too soon.', open_times: suggest_(new Date(Date.now() + 2 * 3600000), minutes, 3) };
  const end = new Date(start.getTime() + minutes * 60000);
  const conflicts = busy_(start, end);
  if (conflicts.length) return { ok: true, available: false, message: fmt_(start) + ' is taken.', open_times: suggest_(start, minutes, 3) };
  return { ok: true, available: true, message: fmt_(start) + ' is open.' };
}

function book_(p) {
  const email = String(p.email || '').trim();
  if (!validEmail_(email)) return { ok: false, message: 'I need a valid email to send the calendar invite.' };
  const start = parseStart_(p.start);
  if (!start) return { ok: false, message: 'I could not read that time. Please give a day and time.' };
  const minutes = Math.min(Math.max(Number(p.minutes || 30), 15), 120);
  if (start.getTime() < Date.now() + 30 * 60000) return { ok: false, message: 'That time has passed or is too soon.', open_times: suggest_(new Date(Date.now() + 2 * 3600000), minutes, 3) };
  if (start.getTime() > Date.now() + 60 * 86400000) return { ok: false, message: 'Please pick a time within the next 60 days.' };
  if (!allow_('book:' + email.toLowerCase(), 3, 20)) return { ok: false, message: 'There are already a few requests for this email. Jason will follow up directly.' };
  const end = new Date(start.getTime() + minutes * 60000);
  if (busy_(start, end).length) return { ok: false, available: false, message: fmt_(start) + ' is taken.', open_times: suggest_(start, minutes, 3) };
  const name = clean_(p.name, 60), company = clean_(p.company, 80), phone = clean_(p.phone, 30), notes = clean_(p.notes, 400);
  const title = 'Interview: ' + NAME + (company ? ' x ' + company : '') + (name ? ' (' + name + ')' : '');
  const desc = 'Interview call with Jason Bourbeau about ' + (company ? company + "'s" : 'your') + ' open role.\n\n' +
    'Jason will call ' + (phone ? phone : 'you at the number you shared') + '. You can also reach him at ' + LINE_PRETTY + ' or ' + FROM + '.\n' +
    'AI interactive resume: ' + PAGE + (company ? '?c=' + encodeURIComponent(company) : '') + (notes ? '\n\nNotes: ' + notes : '') +
    '\n\nBooked by Ryan, Jason\'s AI resume assistant.';
  const ev = CalendarApp.getDefaultCalendar().createEvent(title, start, end, { description: desc, guests: email, sendInvites: true, location: phone ? 'Phone: ' + phone : 'Phone: ' + LINE_PRETTY });
  ev.addPopupReminder(30);
  log_('book_interview', name, company, email, phone, fmt_(start) + ' (' + minutes + ' min)');
  notify_('Interview booked: ' + (company || name || email) + ', ' + fmt_(start),
    'Ryan booked an interview on your calendar.\n\nWhen: ' + fmt_(start) + ' (' + minutes + ' min)\nName: ' + name + '\nCompany: ' + company + '\nEmail: ' + email + '\nPhone: ' + phone + (notes ? '\nNotes: ' + notes : '') + '\n\nThey were sent a calendar invite.');
  return { ok: true, message: 'Booked for ' + fmt_(start) + '. A calendar invite is on its way to ' + email + '.' };
}

// Rings Jason first; when he answers, Twilio dials the recruiter and bridges the call.
function connectCall_(p) {
  const props = PropertiesService.getScriptProperties();
  const sid = props.getProperty('TWILIO_SID'), token = props.getProperty('TWILIO_TOKEN');
  const name = clean_(p.name, 60), company = clean_(p.company, 80);
  let phone = String(p.phone || '').replace(/[^\d+]/g, '');
  if (phone.length === 10) phone = '+1' + phone;
  if (phone.length === 11 && phone[0] === '1') phone = '+' + phone;
  if (!/^\+1\d{10}$/.test(phone)) return { ok: false, message: 'Please give a 10-digit US phone number.' };
  if (!allow_('call:' + phone, 2, 10)) return { ok: false, message: 'I already tried connecting that number. Jason will call you back.' };
  if (!sid || !token) {
    notify_('Call request: ' + (name || phone) + (company ? ' (' + company + ')' : ''), 'Ryan took a call request. Please call ' + phone + ' now.\nName: ' + name + '\nCompany: ' + company);
    return { ok: true, message: 'I sent Jason your number and asked him to call you right away. You can also call him at ' + LINE_PRETTY + '.' };
  }
  const whisper = 'Job interview call from ' + (name || 'a recruiter') + (company ? ' at ' + company : '') + '. Connecting now.';
  const twiml = '<Response><Say voice="Polly.Matthew">' + whisper.replace(/[<&>]/g, '') + '</Say><Dial callerId="' + INTERVIEW_LINE + '" timeout="25"><Number>' + phone + '</Number></Dial></Response>';
  const res = UrlFetchApp.fetch('https://api.twilio.com/2010-04-01/Accounts/' + sid + '/Calls.json', {
    method: 'post', muteHttpExceptions: true,
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(sid + ':' + token) },
    payload: { To: JASON_CELL, From: INTERVIEW_LINE, Twiml: twiml, Timeout: '25' }
  });
  const ok = res.getResponseCode() < 300;
  log_('connect_call', name, company, '', phone, ok ? 'dialing' : 'twilio error ' + res.getResponseCode());
  if (!ok) {
    notify_('Call request (auto-dial failed): ' + phone, 'Twilio said: ' + res.getContentText().slice(0, 500) + '\n\nPlease call ' + phone + '.');
    return { ok: true, message: 'I could not dial automatically, so I sent Jason your number to call you right away. You can also call him at ' + LINE_PRETTY + '.' };
  }
  return { ok: true, message: 'Calling Jason now. When he picks up, your phone at ' + phone + ' will ring from ' + LINE_PRETTY + '.' };
}

function notify_(subject, text) {
  GmailApp.sendEmail(OWNER, '[Ryan] ' + subject, text, { name: 'Ryan (AI resume)' });
}

function log_(action, name, company, email, phone, detail) {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID'), ss;
  try { ss = id ? SpreadsheetApp.openById(id) : null; } catch (x) { ss = null; }
  if (!ss) {
    ss = SpreadsheetApp.create('Ryan Leads (AI resume)');
    ss.getSheets()[0].appendRow(['When', 'Action', 'Name', 'Company', 'Email', 'Phone', 'Detail']);
    props.setProperty('SHEET_ID', ss.getId());
  }
  ss.getSheets()[0].appendRow([new Date(), action, name, company, email, phone, detail]);
}

// Run once from the editor to approve permissions and create the leads sheet.
function setup() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('RYAN_KEY')) props.setProperty('RYAN_KEY', RYAN_KEY_INIT);
  log_('setup', '', '', '', '', 'Ryan actions installed');
  Logger.log('OK. Leads sheet: ' + SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID')).getUrl());
}
