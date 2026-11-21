/* AIGL demo knowledge base: The Wine Bunker (Alabaster, AL).
   One source for BOTH the chat widget and the voice receptionist.
   Facts from public sources (Google Maps, thewinebunker.com, menu page), Nov 19, 2026.
   NOTE: the coffee bar is closed. Never offer coffee. */
window.KB = {
  business: {
    name: "The Wine Bunker",
    tagline: "Whiskey & Wine Bar",
    address: "81 Weatherly Club Dr, Alabaster, AL 35007",
    phone: "(205) 358-8940",
    hours: [
      ["Wednesday", "3 – 9 PM"], ["Thursday", "3 – 9 PM"],
      ["Friday", "3 – 11 PM"], ["Saturday", "3 – 11 PM"],
      ["Sunday – Tuesday", "Closed"]
    ],
    hoursText: "Wednesday and Thursday 3 to 9 PM, Friday and Saturday 3 to 11 PM, closed Sunday through Tuesday"
  },

  entries: [
    { k:/coffee|latte|cappuccino|americano|cold brew|caf[eé]\b/,
      a:"We no longer serve coffee. These days we're all about wine, whiskey and craft cocktails. If you want something with a little kick, our Bunker Espresso Martini is a favorite.",
      q:["See cocktails","Hours"] },
    { k:/hour|open|close|tonight|today|sunday|monday|tuesday|wednesday|thursday|friday|saturday|when/,
      a:"We're open Wednesday and Thursday 3–9 PM, and Friday and Saturday 3–11 PM. We're closed Sunday through Tuesday.",
      q:["Directions","Live music?"] },
    { k:/where|address|location|direction|park|find you|weatherly/,
      a:"We're at 81 Weatherly Club Dr in Alabaster (Weatherly Plaza). Want me to open directions?",
      q:["Open directions","Hours"] },
    { k:/\bage\b|under 21|21 and|21\+|minor|kid|child|underage|teen|years? old|yr old|\bid\b|carded/,
      a:"We're 21 and up for alcohol, and our team checks ID. I can't approve anyone under 21. Bring a valid ID and you're set!",
      q:["Hours"] },
    { k:/deliver|delivery|ship|to go|takeout|take out|bottle.*home|bottles/,
      a:"I can't set up delivery from here. For bottles to take home or anything to-go, give the team a quick call at (205) 358-8940 and they'll tell you what's available.",
      q:["Request a callback"] },
    { k:/music|band|live |playing|entertain|trivia|lineup|on deck|what.?s (going on|happening|on)|who.?s (on|up)|this weekend|happening tonight/,
      get a(){ return window.KB.eventsAnswer(); },
      q:["Hours","Private event"] },
    { k:/dinner|pairing|tasting|event|class|power of place|chef/,
      a:"We host wine pairing dinners and tastings. Past dinners have been chef-prepared, multi-course pairings, ticketed at the bar or online. I can take your name and number so the team lets you know about the next one.",
      q:["Notify me of events","Private party"] },
    { k:/private|party|rent|book the|birthday|rehearsal|corporate|group|reserve|reservation|table/,
      a:"We'd love to host you! For private parties and group reservations, I'll grab a few details: your name, phone, date, and how many guests. Someone from the team will call you back to set it up.",
      q:["Request a callback"] },
    { k:/whiskey|bourbon|scotch|rye|old fashioned|smoked/,
      a:"Whiskey is half our name. We pour a curated lineup of bourbon, scotch and whiskey, and our Smoked Old Fashioned is the guest favorite. The shelf rotates, so ask the bartender what's new.",
      q:["See cocktails","Wine list"] },
    { k:/wine|red|white|cab|pinot|chardonnay|rose|ros[eé]|bubbl|champagne|prosecco|by the glass|bottle/,
      a:"We pour about two dozen wines by the glass or bottle, from Napa Cab and Oregon Pinot to Sancerre, Albariño, Prosecco and Champagne. Check the menu section on this page for the current list. Selections can change, so confirm a specific bottle with the team.",
      q:["Wine list","Food"] },
    { k:/cocktail|drink|mule|smash|spritz|sidecar|sazerac|martini/,
      a:"Our cocktails include the Smoked Old Fashioned, Kentucky Mule, Blackberry Smash, Aperol Spritz, French Bunker, Sidecar, Sazerac and the Bunker Espresso Martini.",
      q:["Wine list","Food"] },
    { k:/food|eat|menu|charcuterie|board|cheese|flatbread|small plate|hungry|snack/,
      a:"We serve small plates, flatbreads and charcuterie. The Bunker Board is the one to share. It's a wine bar menu, not a full kitchen, so think tapas and boards.",
      q:["Wine list","Hours"] },
    { k:/price|cost|how much|\$/,
      a:"The prices on our menu section are the latest we have posted, but they can change. For anything not listed, I'll have the team confirm rather than guess.",
      q:["Request a callback"] },
    { k:/veteran|military|owner|chris|dave|story|who/,
      a:"The Wine Bunker was founded by Chris and Dave, who met serving our country together. They built the bar around the same camaraderie: good wine, good whiskey and good company.",
      q:["Hours","Live music?"] },
    { k:/call ?back|callback|talk to|speak|human|manager|someone/,
      a:"Sure! Just tell me your name, phone number and what it's about, and the team will call you back.",
      q:[] }
  ],

  fallback: "Good question. I don't want to guess, so let me have the team get back to you. What's your name and best number?",

  greeting: "Hey, welcome to The Wine Bunker! I'm your host, Brianna. How can I help you?",

  prompt: `Manners: sound like a relaxed, warm local bartender, not a form. Use contractions and short sentences. After someone gives their name, use their first name only, and only now and then. Never assume the caller is the one being celebrated, and don't congratulate unless they say it's theirs. You are Brianna, the friendly host and receptionist for The Wine Bunker, a veteran-owned whiskey and wine bar at 81 Weatherly Club Dr, Alabaster, Alabama 35007 (Weatherly Plaza). Phone (205) 358-8940. Founded by Chris and Dave, who met while serving in the military.
HOURS: Wednesday and Thursday 3 to 9 PM; Friday and Saturday 3 to 11 PM; closed Sunday, Monday and Tuesday.
OFFERING: about two dozen wines by the glass or bottle (Napa Cabernet, Oregon Pinot Noir, Malbec, Rioja, Sancerre, Albarino, Riesling, Rose, Prosecco, Champagne), a curated whiskey, bourbon and scotch selection, craft cocktails (Smoked Old Fashioned is the favorite; also Kentucky Mule, Blackberry Smash, Aperol Spritz, French Bunker, Sidecar, Sazerac, Bunker Espresso Martini), small plates, flatbreads and charcuterie (the Bunker Board). Live music from local artists, usually Friday and Saturday nights. Periodic ticketed wine pairing dinners and tastings. Private parties and group events by arrangement.
COFFEE: The coffee bar is closed. If anyone asks about coffee, say they no longer serve coffee and suggest a cocktail or wine instead.
RULES: Alcohol is 21 and up with ID; never confirm or arrange a sale to anyone under 21. Never quote a price you were not given; offer to have staff confirm. Never promise delivery or shipping; refer to-go and bottle questions to staff. Use UPCOMING EVENTS below to answer what's happening, who's playing, tonight or this week, with specific names, dates and times. If nothing is listed for the day asked, say the lineup for that night isn't posted yet and suggest checking Instagram @thewinebunkeralabaster or the Facebook page; do NOT offer a callback for simple questions. Offer a callback only for private events, bookings, or when the caller asks for a person. Don't promise a bottle is in stock; schedules and stock rotate. For private parties, events, reservations or anything you can't answer, collect name, phone number, date, party size and what they need, read the phone number back, and say the team will call back. If asked, say you're an AI assistant. Keep answers short, warm and conversational, with a little patriotic pride.`
};

/* ---- Live events: one list feeds chat, voice and the website ---- */
(function(){
  const KB=window.KB, BASE=KB.prompt;
  {const i=KB.entries.findIndex(e=>e.k.test('lineup'));if(i>0)KB.entries.unshift(KB.entries.splice(i,1)[0]);}
  const tz='America/Chicago';
  const today=()=>new Date(new Date().toLocaleString('en-US',{timeZone:tz}));
  const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const nice=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})};
  KB.events=[];KB.weekly=[];
  KB.upcoming=function(days){const t=today(),start=ymd(t),end=ymd(new Date(t.getTime()+days*864e5));
    return KB.events.filter(e=>e.date>=start&&e.date<=end).sort((a,b)=>a.date.localeCompare(b.date));};
  KB.eventsText=function(){const t=today();let out='Today is '+t.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})+'.\n';
    const up=KB.upcoming(21);
    out+=up.length?up.map(e=>'- '+nice(e.date)+(e.time?', '+e.time:'')+': '+e.title+(e.details?' ('+e.details+')':'')).join('\n'):'- No dated events posted yet.';
    if(KB.weekly.length)out+='\nEVERY WEEK:\n'+KB.weekly.map(w=>'- '+w.day+(w.time?', '+w.time:'')+': '+w.title).join('\n');
    return out;};
  KB.eventsAnswer=function(){const up=KB.upcoming(10);const t=ymd(today());
    if(up.length){const tonight=up.filter(e=>e.date===t);
      const list=(tonight.length?tonight:up.slice(0,3)).map(e=>(e.date===t?'Tonight':nice(e.date))+(e.time?' at '+e.time:'')+': '+e.title).join('. ');
      return list+'. Anything else I can help with?';}
    const wk=KB.weekly.length?' Every week: '+KB.weekly.map(w=>w.day+' '+w.title).join(', ')+'.':'';
    return "This week's lineup isn't posted yet."+wk+" Check our Instagram @thewinebunkeralabaster or Facebook for the latest, and Friday and Saturday nights usually have live music.";};
  KB.prompt=BASE+'\nUPCOMING EVENTS:\n'+KB.eventsText();
  const url='/winebunker/events.json?v='+Date.now();
  KB.eventsReady=fetch(url).then(r=>r.json()).then(j=>{KB.events=j.events||[];KB.weekly=j.weekly||[];KB.prompt=BASE+'\nUPCOMING EVENTS:\n'+KB.eventsText();
    document.dispatchEvent(new CustomEvent('wb-events',{detail:j}));}).catch(()=>{});
})();

