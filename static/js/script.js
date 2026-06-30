// Data
const SESSIONS = [
  { tag: "Keynote", title: "Operating in the open: a live teardown", host: "Mira Okonkwo", role: "VP Product, Northwind", when: "Tue · 18:00 CET", minutes: 55, seats: 412, seatsLeft: 38, accent: "var(--primary)" },
  { tag: "Workshop", title: "Designing rituals that don't break at scale", host: "Theo Lindqvist", role: "Principal designer, Field Notes", when: "Wed · 16:30 CET", minutes: 90, seats: 120, seatsLeft: 11, accent: "var(--accent)" },
  { tag: "Panel", title: "What we got wrong about async-first culture", host: "Four operators", role: "Hosted by Ines Park", when: "Thu · 19:00 CET", minutes: 60, seats: 900, seatsLeft: 312, accent: "var(--signal)" },
];
const PILLARS = [
  { k: "01", t: "Live, with cameras on", d: "No pre-records dressed up as live. Speakers stay after to answer everything." },
  { k: "02", t: "Small rooms by default", d: "Workshops cap at 120. Q&A is read out loud, not buried in a chat sidebar." },
  { k: "03", t: "Replays you'd actually rewatch", d: "Chaptered, transcribed, with a one-page memo from the host within 24 hours." },
  { k: "04", t: "Calendar that respects you", d: "One reminder. One link. No surprise 'pre-event mixer' at 7am your time." },
];
const SPEAKERS = ["Mira Okonkwo · Northwind","Theo Lindqvist · Field Notes","Ines Park · Loop Studio","Avi Rahman · Ledger Co.","Hana Brandt · Constellate","Pierre Vassal · Atelier 9","Sade Nuñez · Quill","Jun Watanabe · Hover"];
const MARQUEE = ["Live & unedited","★","Cameras on","★","Workshops capped at 120","★","Replays in 24h","★","No pre-recorded fakes","★","One link, one reminder","★"];

// Sessions
const grid = document.getElementById("sessions-grid");
SESSIONS.forEach(s => {
  const pct = Math.round(((s.seats - s.seatsLeft) / s.seats) * 100);
  const el = document.createElement("article");
  el.className = "session";
  el.innerHTML = `
    <div class="session-top">
      <span class="tag" style="color:${s.accent}"><i style="background:${s.accent}"></i>${s.tag}</span>
      <span class="mono small muted">${s.minutes}m</span>
    </div>
    <h3>${s.title}</h3>
    <div class="session-foot">
      <div><div class="host-name">${s.host}</div><div class="host-role">${s.role}</div></div>
      <div class="meta"><span>${s.when}</span><span>${s.seatsLeft} seats left</span></div>
      <div class="bar"><i style="width:${pct}%;background:${s.accent}"></i></div>
      <button>Reserve seat <span>→</span></button>
    </div>`;
  grid.appendChild(el);
});

// Pillars
const pillars = document.getElementById("pillars");
PILLARS.forEach(p => {
  const li = document.createElement("li");
  li.innerHTML = `<div class="k">${p.k}</div><div class="t">${p.t}</div><p>${p.d}</p>`;
  pillars.appendChild(li);
});

// Speakers
const speakers = document.getElementById("speakers");
SPEAKERS.forEach((s, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<div class="row"><span class="n">${String(i+1).padStart(2,"0")}</span><span class="name">${s}</span></div><span class="more">READ BIO →</span>`;
  speakers.appendChild(li);
});

// Marquee (doubled for seamless loop)
const m = document.getElementById("marquee");
[...MARQUEE, ...MARQUEE].forEach(t => {
  const span = document.createElement("span");
  span.textContent = t;
  m.appendChild(span);
});

// Countdown
const target = new Date(Date.now() + 1000*60*60*24*6 + 1000*60*60*3);
document.getElementById("date-label").textContent = target.toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long" });
function tick() {
  const diff = Math.max(0, target - Date.now());
  const d = Math.floor(diff/86400000);
  const h = Math.floor((diff/3600000)%24);
  const mm = Math.floor((diff/60000)%60);
  const s = Math.floor((diff/1000)%60);
  document.getElementById("cd-d").textContent = String(d).padStart(2,"0");
  document.getElementById("cd-h").textContent = String(h).padStart(2,"0");
  document.getElementById("cd-m").textContent = String(mm).padStart(2,"0");
  document.getElementById("cd-s").textContent = String(s).padStart(2,"0");
}
tick(); setInterval(tick, 1000);

// Form
document.getElementById("reg-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = document.getElementById("email").value;
  if (v.includes("@")) document.getElementById("reg-btn").textContent = "✓ You're in";
});

// Footer year
document.getElementById("copy").textContent = `© ${new Date().getFullYear()} Signal Broadcasting GmbH · Berlin`;
