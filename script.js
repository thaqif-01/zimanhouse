// Sticky nav shadow on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
const setMenu = open => {
  toggle.classList.toggle("open", open);
  links.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
toggle.addEventListener("click", () => setMenu(!links.classList.contains("open")));
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && links.classList.contains("open")) {
    setMenu(false);
    toggle.focus();
  }
});

// Availability calendar, synced from Airbnb via /api/availability (cached, so a few minutes of delay).
// If the feed can't be loaded, the card falls back to a "check via WhatsApp" message.
const card = document.getElementById("availabilityCard");
const calGrid = document.getElementById("calGrid");
const calTitle = document.getElementById("calTitle");
const calPrev = document.getElementById("calPrev");
const calNext = document.getElementById("calNext");
const MAX_MONTHS_AHEAD = 11;
const pad = n => String(n).padStart(2, "0");
const todayIso = new Date().toLocaleDateString("en-CA");
let booked = new Set();
let monthOffset = 0;

function renderMonth() {
  const base = new Date();
  const first = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const y = first.getFullYear();
  const m = first.getMonth();
  calTitle.textContent = first.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  calPrev.disabled = monthOffset === 0;
  calNext.disabled = monthOffset === MAX_MONTHS_AHEAD;
  const days = new Date(y, m + 1, 0).getDate();
  let html = "<span></span>".repeat(first.getDay());
  for (let d = 1; d <= days; d++) {
    const iso = `${y}-${pad(m + 1)}-${pad(d)}`;
    const state = iso < todayIso || booked.has(iso) ? "taken" : "free";
    html += `<div class="cal__day cal__day--${state}"><span>${d}</span></div>`;
  }
  calGrid.innerHTML = html;
}

calPrev.addEventListener("click", () => { monthOffset--; renderMonth(); });
calNext.addEventListener("click", () => { monthOffset++; renderMonth(); });

fetch("/api/availability")
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(data => {
    booked = new Set(data.booked);
    card.classList.remove("is-preview");
    document.getElementById("legend").hidden = false;
    document.getElementById("calNote").hidden = false;
    renderMonth();
  })
  .catch(() => {
    document.getElementById("calStatus").textContent = "Live calendar unavailable. Message us on WhatsApp to check your dates.";
    renderMonth();
  });

// Guest reviews: shown from reviews.json (copied from real Airbnb reviews). Empty list keeps the placeholder.
fetch("reviews.json")
  .then(r => r.ok ? r.json() : [])
  .then(list => {
    if (!Array.isArray(list) || !list.length) return;
    const section = document.getElementById("reviews");
    const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    section.querySelector("h2").textContent = "What Our Guests Say";
    section.querySelector(".review--soon").outerHTML = `<div class="reviews">${list.map(r => `
      <blockquote class="review">
        <p>${esc(r.quote)}</p>
        <footer>${esc(r.name)}${r.date ? ` &middot; ${esc(r.date)}` : ""}${r.source ? ` &middot; ${esc(r.source)}` : ""}</footer>
      </blockquote>`).join("")}</div>`;
  })
  .catch(() => {});

// Reveal sections on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

// Floating WhatsApp button: hide while the hero or footer booking area is visible
const waFloat = document.getElementById("waFloat");
const ctaZones = new Map();
const zoneObserver = new IntersectionObserver(entries => {
  entries.forEach(e => ctaZones.set(e.target, e.isIntersecting));
  waFloat.classList.toggle("is-hidden", [...ctaZones.values()].some(Boolean));
});
["home", "contact"].forEach(id => zoneObserver.observe(document.getElementById(id)));

document.getElementById("year").textContent = new Date().getFullYear();
