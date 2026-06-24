const fs = require('node:fs');
const path = require('node:path');

const DB_PATH = path.join(__dirname, 'data', 'db.json');
const SEED = { reservations: {}, pushSubscriptions: [], messages: [] };

// Ensure the runtime DB file exists (git-ignored; seeded from defaults on first boot)
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify(SEED, null, 2));
}

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { reservations: {}, pushSubscriptions: [], messages: [] };
  }
}

function writeDB(data) {
  // Atomic write: tmp file + rename, so a crash mid-write can't truncate db.json
  const tmp = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

function getReservationsForTour(tourId) {
  const db = readDB();
  return db.reservations[tourId] || {};
}

function reserve(tourId, seatNumber, data) {
  const db = readDB();
  if (!db.reservations[tourId]) db.reservations[tourId] = {};
  db.reservations[tourId][seatNumber] = data;
  writeDB(db);
}

function cancelReservation(tourId, seatNumber) {
  const db = readDB();
  if (db.reservations[tourId]) {
    delete db.reservations[tourId][seatNumber];
    writeDB(db);
  }
}

function resetAllReservations() {
  const db = readDB();
  db.reservations = {};
  writeDB(db);
}

function resetReservationsForTours(tourIds) {
  const db = readDB();
  for (const id of tourIds) delete db.reservations[id];
  writeDB(db);
}

function addPushSubscription(userId, subscription) {
  const db = readDB();
  if (!Array.isArray(db.pushSubscriptions)) db.pushSubscriptions = [];
  // Remove existing for this user
  db.pushSubscriptions = db.pushSubscriptions.filter(s => s.userId !== userId);
  db.pushSubscriptions.push({ userId, subscription });
  writeDB(db);
}

function getAllPushSubscriptions() {
  return readDB().pushSubscriptions || [];
}

function removePushSubscription(endpoint) {
  if (!endpoint) return;
  const db = readDB();
  if (!Array.isArray(db.pushSubscriptions)) return;
  db.pushSubscriptions = db.pushSubscriptions.filter(s => s.subscription?.endpoint !== endpoint);
  writeDB(db);
}

function saveMessage(tourId, message) {
  const db = readDB();
  if (!Array.isArray(db.messages)) db.messages = [];
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const timestamp = new Date().toISOString();
  const saved = { id, tourId, ...message, timestamp, liked: false };
  db.messages.push(saved);
  if (db.messages.length > 200) db.messages = db.messages.slice(-200);
  writeDB(db);
  return saved;
}

function likeMessage(msgId) {
  const db = readDB();
  if (!Array.isArray(db.messages)) return null;
  const msg = db.messages.find(m => m.id === msgId);
  if (!msg) return null;
  msg.liked = !msg.liked;
  writeDB(db);
  return msg;
}

function getMessages(tourId) {
  const db = readDB();
  return (db.messages || []).filter(m => m.tourId === tourId);
}

module.exports = {
  getReservationsForTour,
  reserve,
  cancelReservation,
  resetAllReservations,
  resetReservationsForTours,
  addPushSubscription,
  getAllPushSubscriptions,
  removePushSubscription,
  saveMessage,
  getMessages,
  likeMessage
};
