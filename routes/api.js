const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { ensureAuthenticated, ensureDriver } = require('../middleware/auth');
const { TOURS, TOTAL_SEATS } = require('./tours');
const { getActiveRides, isRideActive, rideId } = require('../rides');
const db = require('../db');

const reservationLocks = new Set();

// Generous limit on mutating endpoints — far above real usage, blocks only floods
const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Previše zahtjeva, pokušaj ponovo za koji trenutak' }
});

// Get active dated rides (today + tomorrow window) with reservation status
router.get('/tours', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const ridesWithStatus = getActiveRides().map(ride => {
    const rideReservations = db.getReservationsForRide(ride.date, ride.tourId);
    const seats = {};
    const seatNames = {};
    const seatGuests = {};
    for (let i = 1; i <= TOTAL_SEATS; i++) {
      const res_user = rideReservations[i];
      if (!res_user) {
        seats[i] = 'free';
      } else if (res_user.userId === userId) {
        seats[i] = 'mine';
        seatNames[i] = res_user.userName;
      } else {
        seats[i] = 'taken';
        seatNames[i] = res_user.userName;
      }
      if (res_user?.guest) seatGuests[i] = true;
    }
    const myReservation = Object.entries(rideReservations).find(([, r]) => r.userId === userId);
    return {
      ...ride,
      seats,
      seatNames,
      seatGuests,
      myReservation: myReservation
        ? { seatNumber: parseInt(myReservation[0], 10), stop: myReservation[1].stop }
        : null,
      takenCount: Object.keys(rideReservations).length
    };
  });
  res.json(ridesWithStatus);
});

// Reserve a seat on a dated ride
router.post('/reserve', writeLimiter, ensureAuthenticated, (req, res) => {
  const { tourId, date, stop } = req.body;
  const seatNumber = parseInt(req.body.seatNumber, 10);
  const userId = req.user.id;
  const userName = req.user.displayName;

  if (!TOURS[tourId]) return res.status(400).json({ error: 'Nevažeća tura' });
  if (!isRideActive(tourId, date))
    return res.status(400).json({ error: 'Tura više nije dostupna' });
  if (!stop || !TOURS[tourId].stops.includes(stop))
    return res.status(400).json({ error: 'Nevažeća stanica' });
  if (Number.isNaN(seatNumber) || seatNumber < 1 || seatNumber > TOTAL_SEATS)
    return res.status(400).json({ error: 'Nevažeći broj sjedišta' });

  const lockKey = `${rideId(tourId, date)}-${seatNumber}`;
  if (reservationLocks.has(lockKey))
    return res.status(409).json({ error: 'Sjedalo se upravo rezerviše, pokušaj ponovo' });
  reservationLocks.add(lockKey);

  try {
    const rideReservations = db.getReservationsForRide(date, tourId);

    // Managers may book multiple seats (for guests who can't log in); skip per-user limits.
    if (!req.user.isManager) {
      const existing = Object.entries(rideReservations).find(([, r]) => r.userId === userId);
      if (existing)
        return res
          .status(400)
          .json({ error: 'Već imaš rezervaciju na ovoj turi', seat: parseInt(existing[0], 10) });

      // Group limit (scoped per date): 1 morning tour + 1 afternoon tour per user per day
      const morningTours = ['morning1', 'morning2'];
      const afternoonTours = ['afternoon1', 'afternoon2'];
      const group = morningTours.includes(tourId) ? morningTours : afternoonTours;
      const sibling = group.find(id => id !== tourId);
      if (sibling) {
        const siblingReservations = db.getReservationsForRide(date, sibling);
        const siblingExisting = Object.entries(siblingReservations).find(
          ([, r]) => r.userId === userId
        );
        if (siblingExisting) {
          const label = morningTours.includes(tourId) ? 'jutarnjoj' : 'popodnevnoj';
          return res.status(400).json({ error: `Već imaš rezervaciju u drugoj ${label} turi` });
        }
      }
    }

    if (rideReservations[seatNumber])
      return res.status(400).json({ error: 'Sjedište je već zauzeto' });

    const guest = !!req.user.isManager;
    db.reserve(date, tourId, seatNumber, {
      userId,
      userName,
      stop,
      guest,
      reservedAt: new Date().toISOString()
    });

    req.app.get('io').to(rideId(tourId, date)).emit('seatUpdate', {
      tourId,
      date,
      seatNumber,
      status: 'taken',
      userName,
      stop,
      guest
    });

    res.json({ success: true, tourId, date, seatNumber, stop });
  } finally {
    reservationLocks.delete(lockKey);
  }
});

// Cancel a reservation on a dated ride
router.delete(
  '/reserve/:tourId/:date/:seatNumber',
  writeLimiter,
  ensureAuthenticated,
  (req, res) => {
    const { tourId, date, seatNumber } = req.params;
    const userId = req.user.id;
    const seat = parseInt(seatNumber, 10);

    if (!TOURS[tourId]) return res.status(400).json({ error: 'Nevažeća tura' });
    if (Number.isNaN(seat) || seat < 1 || seat > TOTAL_SEATS)
      return res.status(400).json({ error: 'Nevažeći broj sjedišta' });

    const rideReservations = db.getReservationsForRide(date, tourId);
    const reservation = rideReservations[seat];

    if (!reservation) return res.status(404).json({ error: 'Rezervacija nije pronađena' });
    if (reservation.userId !== userId && !req.user.isDriver)
      return res.status(403).json({ error: 'Nije tvoja rezervacija' });

    db.cancelReservation(date, tourId, seat);

    req.app.get('io').to(rideId(tourId, date)).emit('seatUpdate', {
      tourId,
      date,
      seatNumber: seat,
      status: 'free'
    });

    res.json({ success: true });
  }
);

// Build passenger manifest grouped by stop, ordered by tour route sequence
function buildManifest(date, tourId) {
  const rideReservations = db.getReservationsForRide(date, tourId);
  const byStop = {};

  Object.entries(rideReservations).forEach(([seat, r]) => {
    if (!byStop[r.stop]) byStop[r.stop] = [];
    byStop[r.stop].push({ seat: parseInt(seat, 10), userName: r.userName, guest: !!r.guest });
  });

  // Order by tour stop sequence (driver pickup order)
  const ordered = TOURS[tourId].stops
    .filter(stop => byStop[stop])
    .map(stop => ({ stop, passengers: byStop[stop] }));

  return { tourId, date, passengers: ordered, total: Object.keys(rideReservations).length };
}

// Get passengers for driver
router.get('/driver/passengers/:tourId/:date', ensureDriver, (req, res) => {
  const { tourId, date } = req.params;
  if (!TOURS[tourId] || !date) return res.status(400).json({ error: 'Nevažeća tura' });
  res.json(buildManifest(date, tourId));
});

// Get passengers for any authenticated employee (homepage "who rides" manifest)
router.get('/tours/:tourId/:date/passengers', ensureAuthenticated, (req, res) => {
  const { tourId, date } = req.params;
  if (!TOURS[tourId] || !date) return res.status(400).json({ error: 'Nevažeća tura' });
  res.json(buildManifest(date, tourId));
});

// Save push subscription
router.post('/push/subscribe', writeLimiter, ensureAuthenticated, (req, res) => {
  const sub = req.body;
  const valid =
    sub &&
    typeof sub.endpoint === 'string' &&
    sub.keys &&
    typeof sub.keys.p256dh === 'string' &&
    typeof sub.keys.auth === 'string';
  if (!valid) return res.status(400).json({ error: 'Nevažeća pretplata na notifikacije' });
  db.addPushSubscription(req.user.id, sub);
  res.json({ success: true });
});

// Get VAPID public key for push
router.get('/push/vapid-key', (_req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Manual reservation reset (driver only)
router.post('/driver/reset', writeLimiter, ensureDriver, (req, res) => {
  db.resetAllReservations();
  req.app.get('io').emit('reservationsReset');
  console.log('Reservations manually reset by driver:', req.user.email);
  res.json({ success: true });
});

module.exports = router;
