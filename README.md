# Zimanhome

Landing page for Zimanhome. Static site (HTML/CSS/JS), deployed on Vercel.

## Run locally
Open `index.html` in a browser, or run any static server in this folder.

## Availability calendar
`api/availability.js` (a Vercel function) merges the Airbnb and Booking.com iCal feeds and returns the booked nights.
The feed links are private, so they live in Vercel > Settings > Environment Variables, not in this repo:

- `AIRBNB_ICAL_URL`
- `BOOKING_ICAL_URL`

A feed with no URL is skipped. After changing a variable, redeploy so it takes effect.
