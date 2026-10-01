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

// Availability calendar.
// Not connected to real booking data yet, so it renders as a neutral preview.
// To go live: set AVAILABILITY_LIVE = true and fill bookedDates (e.g. from an iCal feed).
const AVAILABILITY_LIVE = false;
const bookedDates = []; // e.g. ["2026-10-03", "2026-10-04"]
const week = document.getElementById("week");
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
for (let i = 0; i < 7; i++) {
  const d = new Date();
  d.setDate(d.getDate() + i);
  const iso = d.toLocaleDateString("en-CA");
  const state = !AVAILABILITY_LIVE ? "" : bookedDates.includes(iso) ? "taken" : "free";
  week.insertAdjacentHTML("beforeend", `
    <div class="day${state ? ` day--${state}` : ""}">
      <span class="day__name">${dayNames[d.getDay()]}</span>
      <span class="day__num">${d.getDate()}</span>
      ${state ? `<i class="dot dot--${state}"></i>` : ""}
    </div>`);
}
if (AVAILABILITY_LIVE) {
  document.getElementById("availabilityCard").classList.remove("is-preview");
  week.removeAttribute("aria-hidden");
  document.getElementById("legend").hidden = false;
}

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
