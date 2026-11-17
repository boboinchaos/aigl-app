/* AIGL AI Academy review widget.
   Usage: <div id="review"></div> then AIGLReview.mount("review", {source:"test-drive", jobTitle:"", industry:"", sessionRef:""});
   Saves to the Academy review API. Vanilla JS, uses the page's CSS variables. */
(function () {
  var API = "https://spam-agent.vercel.app/api/academy/review";
  var CSS = ".rv{background:var(--bg2,#161C24);border:1px solid var(--line,#2B3440);border-radius:18px;padding:18px;margin:18px 0}" +
    ".rv h3{margin:0 0 4px}.rv p.s{color:var(--soft,#B4C1B9);margin:0 0 10px;font-size:15px}" +
    ".rv .stars{display:flex;gap:6px;margin:6px 0 12px}.rv .stars button{appearance:none;border:0;background:none;font-size:34px;line-height:1;cursor:pointer;color:#3d4a58;padding:2px}" +
    ".rv .stars button.on{color:#FFB547}.rv .nps{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 4px}" +
    ".rv .nps button{appearance:none;border:2px solid var(--line,#2B3440);background:var(--bg,#0D1117);color:var(--ink,#F2F5F0);font:600 15px Inter,Arial,sans-serif;border-radius:10px;width:40px;height:40px;cursor:pointer}" +
    ".rv .nps button.on{border-color:var(--green,#2EE08A);background:rgba(46,224,138,.15)}.rv .npsl{display:flex;justify-content:space-between;font-size:12px;color:var(--soft,#B4C1B9);margin-bottom:10px;max-width:480px}" +
    ".rv label{display:block;font-weight:600;margin:12px 0 6px;font-size:15px}.rv label span{color:var(--soft,#B4C1B9);font-weight:400}" +
    ".rv textarea,.rv input[type=text],.rv input[type=email]{width:100%;font:500 16px Inter,Arial,sans-serif;color:var(--ink,#F2F5F0);background:var(--bg,#0D1117);border:2px solid var(--line,#2B3440);border-radius:12px;padding:10px 12px}" +
    ".rv textarea{min-height:64px;resize:vertical}.rv .ck{display:flex;gap:10px;align-items:flex-start;margin-top:14px;font-weight:600;cursor:pointer}.rv .ck input{width:22px;height:22px;margin-top:2px}" +
    ".rv .hp{position:absolute;left:-5000px;width:1px;height:1px;overflow:hidden}.rv .err{color:var(--red,#FF5C5C);font-weight:600;margin-top:10px;min-height:1em}" +
    ".rv .thanks{text-align:center;padding:10px 0}.rv .thanks b{display:block;font:700 22px 'Space Grotesk',Arial,sans-serif;margin-bottom:6px}" +
    ".rv button:focus-visible,.rv textarea:focus-visible,.rv input:focus-visible{outline:3px solid var(--green-l,#7CF5B8);outline-offset:2px}";

  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function mount(id, opts) {
    var host = typeof id === "string" ? document.getElementById(id) : id;
    if (!host || host.getAttribute("data-rv")) return;
    host.setAttribute("data-rv", "1");
    if (!document.getElementById("rv-css")) { var st = el("style", { id: "rv-css" }); st.textContent = CSS; document.head.appendChild(st); }
    var o = opts || {}, stars = 0, rec = null;
    var box = el("div", { "class": "rv" });
    box.appendChild(el("h3", null, o.title || "How was it? Help us make it better"));
    box.appendChild(el("p", { "class": "s" }, "Takes 1 minute. Your feedback changes the next class."));

    var sRow = el("div", { "class": "stars", role: "radiogroup", "aria-label": "Star rating" });
    for (var i = 1; i <= 5; i++) (function (n) {
      var b = el("button", { type: "button", role: "radio", "aria-checked": "false", "aria-label": n + " star" + (n > 1 ? "s" : "") }, "★");
      b.onclick = function () { stars = n; [].forEach.call(sRow.children, function (x, j) { x.classList.toggle("on", j < n); x.setAttribute("aria-checked", String(j === n - 1)); }); };
      sRow.appendChild(b);
    })(i);
    box.appendChild(el("label", null, "Overall rating")); box.appendChild(sRow);

    box.appendChild(el("label", null, "How likely are you to recommend this to a friend or coworker?"));
    var nRow = el("div", { "class": "nps", role: "radiogroup", "aria-label": "Recommend 0 to 10" });
    for (var k = 0; k <= 10; k++) (function (n) {
      var b = el("button", { type: "button", role: "radio", "aria-checked": "false" }, String(n));
      b.onclick = function () { rec = n; [].forEach.call(nRow.children, function (x, j) { x.classList.toggle("on", j === n); x.setAttribute("aria-checked", String(j === n)); }); };
      nRow.appendChild(b);
    })(k);
    box.appendChild(nRow);
    var lbl = el("div", { "class": "npsl" }); lbl.appendChild(el("span", null, "Not likely")); lbl.appendChild(el("span", null, "Very likely")); box.appendChild(lbl);

    function area(key, label, hint) {
      var l = el("label", { "for": "rv-" + key }, label); if (hint) l.appendChild(el("span", null, " " + hint));
      box.appendChild(l); var t = el("textarea", { id: "rv-" + key, maxlength: "1000" }); box.appendChild(t); return t;
    }
    var useful = area("useful", "What was most useful?");
    var confusing = area("confusing", "What was confusing or too slow?", "(optional)");
    var change = area("change", "If you could change one thing, what would it be?", "(optional)");
    var wrong = area("wrong", "Did the AI get anything wrong? What?", "(optional, this helps a lot)");

    var ckL = el("label", { "class": "ck" }); var ck = el("input", { type: "checkbox" }); ckL.appendChild(ck);
    ckL.appendChild(el("span", null, "You can share my review as a testimonial")); box.appendChild(ckL);
    var tWrap = el("div"); tWrap.style.display = "none";
    tWrap.appendChild(el("label", { "for": "rv-name" }, "First name and last initial"));
    var nm = el("input", { type: "text", id: "rv-name", maxlength: "40", placeholder: "e.g. Tanya R." }); tWrap.appendChild(nm);
    tWrap.appendChild(el("label", { "for": "rv-quote" }, "A sentence or two we can quote"));
    var quote = el("textarea", { id: "rv-quote", maxlength: "600" }); tWrap.appendChild(quote);
    tWrap.appendChild(el("p", { "class": "s", style: "margin-top:8px" }, "We may use your first name, last initial and quote on aigl.dev. You can ask us to remove it anytime."));
    box.appendChild(tWrap);
    ck.onchange = function () { tWrap.style.display = ck.checked ? "block" : "none"; };

    var hp = el("div", { "class": "hp", "aria-hidden": "true" }); var hpI = el("input", { type: "text", tabindex: "-1", autocomplete: "off", name: "website" }); hp.appendChild(hpI); box.appendChild(hp);
    var err = el("div", { "class": "err", role: "alert" });
    var send = el("button", { type: "button", "class": "btn" }, "Send my review"); send.style.marginTop = "14px";
    box.appendChild(send); box.appendChild(err);

    send.onclick = function () {
      if (!stars) { err.textContent = "Please pick a star rating."; return; }
      if (ck.checked && !quote.value.trim()) { err.textContent = "Add a sentence for your testimonial, or uncheck the box."; return; }
      err.textContent = ""; send.disabled = true; send.textContent = "Sending…";
      var body = {
        source: o.source || "test-drive", stars: stars, recommend: rec,
        most_useful: useful.value, confusing: confusing.value, change_one_thing: change.value, ai_wrong: wrong.value,
        job_title: typeof o.jobTitle === "function" ? o.jobTitle() : o.jobTitle, industry: typeof o.industry === "function" ? o.industry() : o.industry,
        session_ref: typeof o.sessionRef === "function" ? o.sessionRef() : o.sessionRef,
        testimonial_ok: ck.checked, display_name: ck.checked ? nm.value : "", testimonial: ck.checked ? quote.value : "", website: hpI.value
      };
      if (o.demo) { done(); return; }
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok && r.status !== 429) throw new Error(j.error || "Couldn't send. Please try again."); }); })
        .then(done)
        .catch(function (e) { send.disabled = false; send.textContent = "Send my review"; err.textContent = e.message; });
    };
    function done() {
      box.innerHTML = ""; var t = el("div", { "class": "thanks" }); t.appendChild(el("b", null, "Thank you!"));
      t.appendChild(el("span", null, "Your feedback goes straight to Jason and shapes the next class.")); box.appendChild(t);
    }
    host.appendChild(box);
  }
  window.AIGLReview = { mount: mount };
})();
