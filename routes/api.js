const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { ensureAuthenticated, ensureDriver } = require('../middleware/auth');
const { TOURS, TOTAL_SEATS } = require('./tours');
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

// Get all tours with reservation status
router.get('/tours', ensureAuthenticated, (req, res) => {
  const userId = req.user.id;
  const toursWithStatus = Object.values(TOURS).map(tour => {
    const tourReservations = db.getReservationsForTour(tour.id);
    const seats = {};
    const seatNames = {};
    for (let i = 1; i <= TOTAL_SEATS; i++) {
      const res_user = tourReservations[i];
      if (!res_user) {
        seats[i] = 'free';
      } else if (res_user.userId === userId) {
        seats[i] = 'mine';
        seatNames[i] = res_user.userName;
      } else {
        seats[i] = 'taken';
        seatNames[i] = res_user.userName;
      }
    }
    const myReservation = Object.entries(tourReservations).find(([, r]) => r.userId === userId);
    return {
      ...tour,
      seats,
      seatNames,
      myReservation: myReservation
        ? { seatNumber: parseInt(myReservation[0], 10), stop: myReservation[1].stop }
        : null,
      takenCount: Object.keys(tourReservations).length
    };
  });
  res.json(toursWithStatus);
});

// Reserve a seat
router.post('/reserve', writeLimiter, ensureAuthenticated, (req, res) => {
  const { tourId, stop } = req.body;
  const seatNumber = parseInt(req.body.seatNumber, 10);
  const userId = req.user.id;
  const userName = req.user.displayName;

  if (!TOURS[tourId]) return res.status(400).json({ error: 'Nevažeća tura' });
  if (!stop || !TOURS[tourId].stops.includes(stop))
    return res.status(400).json({ error: 'Nevažeća stanica' });
  if (Number.isNaN(seatNumber) || seatNumber < 1 || seatNumber > TOTAL_SEATS)
    return res.status(400).json({ error: 'Nevažeći broj sjedišta' });

  const lockKey = `${tourId}-${seatNumber}`;
  if (reservationLocks.has(lockKey))
    return res.status(409).json({ error: 'Sjedalo se upravo rezerviše, pokušaj ponovo' });
  reservationLocks.add(lockKey);

  try {
    const tourReservations = db.getReservationsForTour(tourId);

    const existing = Object.entries(tourReservations).find(([, r]) => r.userId === userId);
    if (existing)
      return res
        .status(400)
        .json({ error: 'Već imaš rezervaciju na ovoj turi', seat: parseInt(existing[0], 10) });

    // Check group limit: 1 morning tour + 1 afternoon tour per user
    const morningTours = ['morning1', 'morning2'];
    const afternoonTours = ['afternoon1', 'afternoon2'];
    const group = morningTours.includes(tourId) ? morningTours : afternoonTours;
    const sibling = group.find(id => id !== tourId);
    if (sibling) {
      const siblingReservations = db.getReservationsForTour(sibling);
      const siblingExisting = Object.entries(siblingReservations).find(
        ([, r]) => r.userId === userId
      );
      if (siblingExisting) {
        const label = morningTours.includes(tourId) ? 'jutarnjoj' : 'popodnevnoj';
        return res.status(400).json({ error: `Već imaš rezervaciju u drugoj ${label} turi` });
      }
    }

    if (tourReservations[seatNumber])
      return res.status(400).json({ error: 'Sjedište je već zauzeto' });

    db.reserve(tourId, seatNumber, {
      userId,
      userName,
      stop,
      reservedAt: new Date().toISOString()
    });

    req.app.get('io').to(tourId).emit('seatUpdate', {
      tourId,
      seatNumber,
      status: 'taken',
      userName,
      stop
    });

    res.json({ success: true, tourId, seatNumber, stop });
  } finally {
    reservationLocks.delete(lockKey);
  }
});

// Cancel a reservation
router.delete('/reserve/:tourId/:seatNumber', writeLimiter, ensureAuthenticated, (req, res) => {
  const { tourId, seatNumber } = req.params;
  const userId = req.user.id;
  const seat = parseInt(seatNumber, 10);

  if (!TOURS[tourId]) return res.status(400).json({ error: 'Nevažeća tura' });
  if (Number.isNaN(seat) || seat < 1 || seat > TOTAL_SEATS)
    return res.status(400).json({ error: 'Nevažeći broj sjedišta' });

  const tourReservations = db.getReservationsForTour(tourId);
  const reservation = tourReservations[seat];

  if (!reservation) return res.status(404).json({ error: 'Rezervacija nije pronađena' });
  if (reservation.userId !== userId && !req.user.isDriver)
    return res.status(403).json({ error: 'Nije tvoja rezervacija' });

  db.cancelReservation(tourId, seat);

  req.app.get('io').to(tourId).emit('seatUpdate', {
    tourId,
    seatNumber: seat,
    status: 'free'
  });

  res.json({ success: true });
});

// Build passenger manifest grouped by stop, ordered by tour route sequence
function buildManifest(tourId) {
  const tourReservations = db.getReservationsForTour(tourId);
  const byStop = {};

  Object.entries(tourReservations).forEach(([seat, r]) => {
    if (!byStop[r.stop]) byStop[r.stop] = [];
    byStop[r.stop].push({ seat: parseInt(seat, 10), userName: r.userName });
  });

  // Order by tour stop sequence (driver pickup order)
  const ordered = TOURS[tourId].stops
    .filter(stop => byStop[stop])
    .map(stop => ({ stop, passengers: byStop[stop] }));

  return { tourId, passengers: ordered, total: Object.keys(tourReservations).length };
}

// Get passengers for driver
router.get('/driver/passengers/:tourId', ensureDriver, (req, res) => {
  const { tourId } = req.params;
  if (!TOURS[tourId]) return res.status(400).json({ error: 'Nevažeća tura' });
  res.json(buildManifest(tourId));
});

// Get passengers for any authenticated employee (homepage "who rides" manifest)
router.get('/tours/:tourId/passengers', ensureAuthenticated, (req, res) => {
  const { tourId } = req.params;
  if (!TOURS[tourId]) return res.status(400).json({ error: 'Nevažeća tura' });
  res.json(buildManifest(tourId));
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
