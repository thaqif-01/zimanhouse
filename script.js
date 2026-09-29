// Sticky nav background on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
window.addEventListener("scroll", onScroll);
onScroll();

// Mobile menu
const toggle = document.getElementById("navToggle");
const links = document.getElementById("navLinks");
toggle.addEventListener("click", () => {
  toggle.classList.toggle("open");
  links.classList.toggle("open");
});
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  toggle.classList.remove("open");
  links.classList.remove("open");
}));

// This week's availability (draft: sample data only, all dates open)
const bookedDates = []; // e.g. ["2026-10-03", "2026-10-04"]
const week = document.getElementById("week");
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
for (let i = 0; i < 7; i++) {
  const d = new Date();
  d.setDate(d.getDate() + i);
  const iso = d.toLocaleDateString("en-CA");
  const taken = bookedDates.includes(iso);
  week.insertAdjacentHTML("beforeend", `
    <div class="day ${taken ? "day--taken" : "day--free"}">
      <span class="day__name">${dayNames[d.getDay()]}</span>
      <span class="day__num">${d.getDate()}</span>
      <i class="dot ${taken ? "dot--taken" : "dot--free"}"></i>
    </div>`);
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

document.getElementById("year").textContent = new Date().getFullYear();
