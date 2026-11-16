/* AIGL demo knowledge base — TWO LAYERS crossed:
   industryEntries = reusable home-inspection / FORTIFIED base (same for any inspector)
   businessEntries = this prospect's specifics (swap per demo)
   Both the chat widget and the voice agent read from this one file. */
window.KB = {
  business: {
    name: "Knockout Inspections",
    city: "Fairhope, Alabama",
    areas: "Alabama, Florida, Louisiana, Mississippi and Kentucky (FORTIFIED in all)",
    hours: "24/7, nights and weekends included",
    about: "built on faith, integrity, and a focus on you"
  },

  /* ---------- BUSINESS LAYER (Knockout-specific; wins over industry) ---------- */
  businessEntries: [
    { k:/area|where|serve|coverage|cover|fairhope|daphne|mobile|baldwin|county|out of state|florida|louisiana|mississippi|kentucky|alabama/,
      a:"We're licensed across Alabama, Florida, Louisiana, Mississippi and Kentucky, and we do FORTIFIED in all of them. What city is the property in? I'll confirm and get you scheduled.",
      q:["Schedule an inspection"] },
    { k:/hour|open|night|weekend|sunday|holiday|24|after hours|late/,
      a:"That's the best part — we're here 24/7, nights and weekends included, so you can book any time. Want to lock in a time now?",
      q:["Schedule an inspection"] },
    { k:/who are you|about|company|trust|reviews?|reputation|why knockout|faith/,
      a:"Knockout Inspections is built on faith, integrity, and a focus on you — home inspections and FORTIFIED evaluations done right, with same-day reports. How can I help?",
      q:["Schedule an inspection","What is FORTIFIED?"] }
  ],

  /* ---------- INDUSTRY LAYER (reusable for any home inspector) ---------- */
  industryEntries: [
    { k:/renew|expire|expiration|coming up|how long.*good|valid for|designation.*good|lapse/,
      a:"Your FORTIFIED designation is good for 5 years from the date it was issued, and you'll want to renew before it lapses to keep your insurance discount. Remembering the date is the hard part — we track your expiration and remind you ahead of time. Want me to note your designation date so we can flag your renewal?",
      q:["Set a renewal reminder","Book FORTIFIED eval"] },
    { k:/insuranc|discount|premium|carrier|compan|save money|lower my|cheaper|credit/,
      a:"In Alabama, insurers are required to offer a discount for FORTIFIED homes, and most major carriers do — the exact savings depend on your carrier and your FORTIFIED level, so it's worth confirming with your agent. Want me to get your evaluation booked so you can claim it?",
      q:["Book FORTIFIED eval","What is FORTIFIED?"] },
    { k:/level|roof|silver|gold|bronze|tier/,
      a:"FORTIFIED has three levels — Roof, Silver, and Gold — each adding more protection and usually a bigger insurance credit. We can tell you which one fits your home. Want to book an evaluation?",
      q:["Book FORTIFIED eval","How much?"] },
    { k:/fortif|ibhs|wind|hurricane|storm/,
      a:"FORTIFIED is the IBHS program that rates how well a home stands up to severe weather, and many insurers give a discount for it. We do new evaluations and renewals. Want to book yours?",
      q:["Book FORTIFIED eval","Insurance discount?"] },
    { k:/what.*(inspection|inspect|included|cover|check)|included|look at|what do you (check|inspect)/,
      a:"A home inspection is a top-to-bottom look at the home's condition — roof, structure, electrical, plumbing, HVAC, water heater, and major appliances — so you know what you're buying before you close. You get a written report with photos. Want me to find you a time?",
      q:["Schedule an inspection","How long does it take?"] },
    { k:/how long|turnaround|take|hours to|report.*when|when.*report|same day|get the report/,
      a:"Most inspections take about 2–3 hours depending on the size of the home, and your full written report with photos comes the same day — usually within hours. Want me to get you scheduled?",
      q:["Schedule an inspection"] },
    { k:/radon/,
      a:"Radon is a naturally occurring gas that can build up indoors, and we can add a radon test to your inspection if you'd like. Want me to include it?",
      q:["Schedule an inspection"] },
    { k:/mold|moisture|water damage|leak/,
      a:"We check for signs of moisture and mold intrusion during the inspection and flag anything that needs a closer look. Want to get on the schedule?",
      q:["Schedule an inspection"] },
    { k:/termite|wdo|wood destroying|pest|bug/,
      a:"A termite or wood-destroying-organism (WDO) check is a common add-on — I can include it with your inspection. Want me to set that up?",
      q:["Schedule an inspection"] },
    { k:/new construction|new build|pre.?drywall|builder|phase|warranty/,
      a:"Even brand-new homes have issues — a new-construction or pre-drywall inspection catches them before your builder's warranty runs out. Want me to book one?",
      q:["Schedule an inspection"] },
    { k:/sell|selling|pre.?listing|list my|before i list/,
      a:"A pre-listing inspection lets you fix issues before you list, so there are no surprises when a buyer's inspector shows up. Want to schedule one?",
      q:["Schedule an inspection"] },
    { k:/be there|present|attend|do i need to|join|come/,
      a:"You don't have to be there, but you're welcome to join at the end so we can walk you through anything important. Want me to find a time?",
      q:["Schedule an inspection"] },
    { k:/price|cost|how much|\$|fee|rate|quote|expensive/,
      a:"Price depends on the home's size, age, and which services you add — I won't guess a number, but I can grab a few details and have the team confirm an exact quote fast. Want to do that?",
      q:["Yes, get me a quote","What is FORTIFIED?"] },
    { k:/why|worth it|need (an|a).*inspection|should i/,
      a:"An inspection is a small cost that can save you from big surprises — it gives you leverage to negotiate repairs and real peace of mind before you close. Want me to set one up?",
      q:["Schedule an inspection"] }
  ],

  get entries(){ return this.businessEntries.concat(this.industryEntries); },

  fallback: "Great question — I want to make sure you get an exact answer, so let me grab your name and number for the team. I can also book your inspection right now. What works?",

  /* ---------- VOICE: one merged brain (industry facts + business facts) ---------- */
  prompt: [
    "You are the friendly AI receptionist for Knockout Inspections, a home inspection and FORTIFIED evaluation company based in Fairhope, Alabama, built on faith, integrity and a focus on the customer.",
    "You are available 24/7 and licensed across Alabama, Florida, Louisiana, Mississippi and Kentucky, FORTIFIED in all of them. Keep every reply to one or two short, warm, spoken sentences.",
    "",
    "INDUSTRY KNOWLEDGE you can use:",
    "- A home inspection is a top-to-bottom check of the home (roof, structure, electrical, plumbing, HVAC, water heater, major appliances); the client gets a written report with photos the same day. Inspections usually take 2-3 hours.",
    "- Add-ons: radon testing, moisture/mold checks, and termite/wood-destroying-organism (WDO) checks.",
    "- FORTIFIED is the IBHS program rating how well a home handles severe weather. It has three levels: Roof, Silver, and Gold.",
    "- In Alabama, insurers are REQUIRED to offer a premium discount for FORTIFIED homes; most major carriers do, and the exact savings depend on the carrier and FORTIFIED level, so advise confirming with their agent.",
    "- A FORTIFIED designation is valid for 5 years from the issue date; it must be renewed before it lapses to keep the insurance discount. Offer to track the expiration and remind them.",
    "- New-construction / pre-drywall inspections catch issues before the builder warranty ends; pre-listing inspections help sellers fix issues before buyers' inspectors find them.",
    "",
    "RULES: Never quote a specific dollar price — say it depends on size, age and services, and offer to take details for an exact quote. To book, collect the caller's name, phone number, property address or city, and what they need, then confirm the team will reach out to lock in the time. If you don't know something, offer to take a message. This is a live demo of an AI receptionist."
  ].join("\n")
};
