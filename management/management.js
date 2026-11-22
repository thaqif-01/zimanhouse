// Property-owner page behaviour: mobile menu, scroll reveal, floating WhatsApp button.
// Mirrors the matching parts of /script.js (which also drives home-page-only widgets).
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

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

// Reveal on scroll. Elements are only hidden once JS has run, so content stays visible without it.
// Cards in the same group enter one after another (the delay only affects the reveal, see CSS).
[".pkgs .pkg", ".terms .term", ".cols .col", ".steps li"].forEach(selector => {
  document.querySelectorAll(selector).forEach((el, i) => el.style.setProperty("--reveal-delay", `${i * 110}ms`));
});
if ("IntersectionObserver" in window) {
  const pending = new Set(document.querySelectorAll("[data-reveal]"));
  const show = el => {
    el.classList.add("in");
    io.unobserve(el);
    pending.delete(el);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) show(e.target); });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  pending.forEach(el => {
    el.classList.add("reveal");
    io.observe(el);
  });
  // A jump (menu link, fast fling) can skip past cards without them ever intersecting:
  // reveal anything already above the bottom of the viewport.
  const catchUp = () => pending.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) show(el); });
  window.addEventListener("scroll", () => { if (pending.size) catchUp(); }, { passive: true });
}

// Highlight the nav link of the section currently in view.
const sectionLinks = [...links.querySelectorAll('a[href^="#"]')];
const activeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    sectionLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
  });
}, { rootMargin: "-35% 0px -60% 0px" });
sectionLinks.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean).forEach(s => activeObserver.observe(s));
// Clear the highlight when back in the hero.
new IntersectionObserver(([e]) => {
  if (e.isIntersecting) sectionLinks.forEach(a => a.classList.remove("is-active"));
}, { rootMargin: "-35% 0px -60% 0px" }).observe(document.getElementById("home"));

// Floating WhatsApp button: hide while the hero or footer CTA is visible
const waFloat = document.getElementById("waFloat");
const ctaZones = new Map();
const zoneObserver = new IntersectionObserver(entries => {
  entries.forEach(e => ctaZones.set(e.target, e.isIntersecting));
  waFloat.classList.toggle("is-hidden", [...ctaZones.values()].some(Boolean));
});
["home", "contact"].forEach(id => zoneObserver.observe(document.getElementById(id)));

document.getElementById("year").textContent = new Date().getFullYear();
