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
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll("[data-reveal]").forEach(el => {
    el.classList.add("reveal");
    io.observe(el);
  });
}

// Floating WhatsApp button: hide while the hero or footer CTA is visible
const waFloat = document.getElementById("waFloat");
const ctaZones = new Map();
const zoneObserver = new IntersectionObserver(entries => {
  entries.forEach(e => ctaZones.set(e.target, e.isIntersecting));
  waFloat.classList.toggle("is-hidden", [...ctaZones.values()].some(Boolean));
});
["home", "contact"].forEach(id => zoneObserver.observe(document.getElementById(id)));

document.getElementById("year").textContent = new Date().getFullYear();
