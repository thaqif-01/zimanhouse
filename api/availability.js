// Vercel serverless function: reads the Airbnb and Booking.com calendar (iCal) feeds and returns
// the nights booked on either. Set AIRBNB_ICAL_URL and BOOKING_ICAL_URL in Vercel > Project >
// Settings > Environment Variables (kept out of the repo because the feed URLs are private).
// A feed with no URL set is skipped. Responses are cached at the edge, so the calendar is
// near-real-time (a few minutes of delay).

const FEED_ENV_VARS = ["AIRBNB_ICAL_URL", "BOOKING_ICAL_URL"];

const toIso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function parseBookedNights(ics) {
  const lines = ics.replace(/\r?\n[ \t]/g, "").split(/\r?\n/);
  const nights = new Set();
  let start = null;
  let end = null;
  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) { start = end = null; continue; }
    const m = line.match(/^(DTSTART|DTEND)[^:]*:(\d{4})(\d{2})(\d{2})/);
    if (m) {
      const d = Date.UTC(+m[2], +m[3] - 1, +m[4]);
      if (m[1] === "DTSTART") start = d; else end = d;
      continue;
    }
    if (line.startsWith("END:VEVENT") && start !== null) {
      // DTEND is the check-out day, so it is not a booked night.
      const last = end !== null && end > start ? end : start + 86400000;
      for (let t = start; t < last; t += 86400000) {
        const d = new Date(t);
        nights.add(toIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()));
      }
    }
  }
  return [...nights].sort();
}

async function fetchFeed(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!r.ok) throw new Error(`Upstream ${r.status}`);
  return r.text();
}

module.exports = async (req, res) => {
  const urls = FEED_ENV_VARS.map(name => process.env[name]).filter(Boolean);
  if (!urls.length) {
    res.status(503).json({ error: "Calendar not configured" });
    return;
  }
  try {
    // If any feed fails we return an error rather than a partial answer: a missing feed would
    // show its booked dates as free and invite a double booking.
    const feeds = await Promise.all(urls.map(fetchFeed));
    const booked = [...new Set(feeds.flatMap(parseBookedNights))].sort();
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=3600");
    res.status(200).json({ booked, updated: new Date().toISOString() });
  } catch (err) {
    res.status(502).json({ error: "Calendar unavailable" });
  }
};

module.exports.parseBookedNights = parseBookedNights;
