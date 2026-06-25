// Two-day rolling window logic. A "ride" is a tour on a specific service date.
// Source of truth for which dated rides are bookable/visible and their labels.
const { TOURS } = require('./routes/tours');

const TZ = 'Europe/Sarajevo';

// Per-direction cutoff (minutes since midnight, Sarajevo): once now >= cutoff,
// today's rides of that direction retire and tomorrow's become the new "today".
const CUTOFF = {
  toOffice: 10 * 60, // morning1/2 retire at 10:00
  fromOffice: 18 * 60 + 30 // afternoon1/2 retire at 18:30 (past 17:30 dep + ride)
};

const MONTHS = [
  'januar',
  'februar',
  'mart',
  'april',
  'maj',
  'juni',
  'juli',
  'august',
  'septembar',
  'oktobar',
  'novembar',
  'decembar'
];

// Today's calendar date in Sarajevo, optionally offset by whole days (DST-immune).
function sarajevoDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const y = Number(parts.find(p => p.type === 'year').value);
  const m = Number(parts.find(p => p.type === 'month').value);
  const d = Number(parts.find(p => p.type === 'day').value);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + offsetDays);
  return dt.toISOString().slice(0, 10);
}

function sarajevoNowMinutes() {
  const parts = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: TZ
  }).formatToParts(new Date());
  const h = Number(parts.find(p => p.type === 'hour').value);
  const m = Number(parts.find(p => p.type === 'minute').value);
  return h * 60 + m;
}

function rideId(tourId, date) {
  return `${tourId}__${date}`;
}

function parseRideId(id) {
  const sep = (id || '').indexOf('__');
  if (sep === -1) return { tourId: null, date: null };
  return { tourId: id.slice(0, sep), date: id.slice(sep + 2) };
}

// "25. juni 2026." from a YYYY-MM-DD calendar string.
function displayDate(date) {
  const [y, m, d] = date.split('-').map(Number);
  return `${d}. ${MONTHS[m - 1]} ${y}.`;
}

function buildRide(tour, date, today) {
  return {
    id: rideId(tour.id, date),
    tourId: tour.id,
    date,
    dateLabel: date === today ? 'Danas' : 'Sutra',
    displayDate: displayDate(date),
    name: tour.name,
    departureTime: tour.departureTime,
    direction: tour.direction,
    stops: tour.stops
  };
}

// Active window: today (per-direction, only before its cutoff) + tomorrow (always).
function getActiveRides() {
  const today = sarajevoDate(0);
  const tomorrow = sarajevoDate(1);
  const nowMin = sarajevoNowMinutes();
  const out = [];
  for (const tour of Object.values(TOURS)) {
    for (const date of [today, tomorrow]) {
      if (date === today && nowMin >= CUTOFF[tour.direction]) continue;
      out.push(buildRide(tour, date, today));
    }
  }
  return out;
}

// Today's still-active rides (driver drives today only).
function todayRides() {
  const today = sarajevoDate(0);
  return getActiveRides().filter(r => r.date === today);
}

// Gate reserve: a (tourId, date) is bookable only inside the active window.
function isRideActive(tourId, date) {
  const tour = TOURS[tourId];
  if (!tour || !date) return false;
  const today = sarajevoDate(0);
  const tomorrow = sarajevoDate(1);
  if (date === tomorrow) return true;
  if (date === today) return sarajevoNowMinutes() < CUTOFF[tour.direction];
  return false;
}

module.exports = {
  CUTOFF,
  sarajevoDate,
  sarajevoNowMinutes,
  rideId,
  parseRideId,
  displayDate,
  getActiveRides,
  todayRides,
  isRideActive
};
