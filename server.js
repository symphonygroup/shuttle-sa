require('dotenv').config();
const express = require('express');
const http = require('node:http');
const { Server } = require('socket.io');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const helmet = require('helmet');
const cron = require('node-cron');
const webpush = require('web-push');
const path = require('node:path');
const fs = require('node:fs');
const db = require('./db');
const { TOURS } = require('./routes/tours');
const { sarajevoDate, rideId, parseRideId } = require('./rides');
const apiRouter = require('./routes/api');
const { ensureAuthenticated } = require('./middleware/auth');

const isProd = process.env.NODE_ENV === 'production';

// Boot: ./data must be writable (holds sessions + db.json + backups). In prod it MUST be a
// persistent volume — without one, every redeploy wipes all data. Fail loud if not writable.
(() => {
  const dataDir = path.join(__dirname, 'data');
  try {
    fs.mkdirSync(dataDir, { recursive: true });
    const probe = path.join(dataDir, '.write-probe');
    fs.writeFileSync(probe, String(Date.now()));
    fs.unlinkSync(probe);
    console.log(`[startup] data dir writable: ${dataDir}`);
    if (isProd)
      console.log('[startup] prod: ensure ./data is a persistent Railway volume (see CLAUDE.md)');
  } catch (err) {
    const msg = `data dir NOT writable: ${dataDir} (${err.message})`;
    if (isProd) throw new Error(`[startup] ${msg} — mount a persistent volume on ./data`);
    console.warn(`[startup] ${msg}`);
  }
})();

// Boot: migrate any pre-date-window reservations to today, then drop stale past dates.
(() => {
  const today = sarajevoDate();
  db.migrateLegacyReservations(today, Object.keys(TOURS));
  db.purgePastDates(today);
})();

// Fail fast in production if critical secrets are missing; warn in dev.
(() => {
  const required = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    const msg = `Missing required env vars: ${missing.join(', ')}`;
    if (isProd) throw new Error(msg);
    console.warn(`[startup] ${msg} (dev fallback in use)`);
  }
})();

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: false } });

app.set('io', io);

// Security headers (relaxed CSP for inline scripts/styles in SPA)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'unpkg.com', 'cdn.jsdelivr.net'],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          'unpkg.com',
          'cdn.jsdelivr.net',
          'fonts.googleapis.com'
        ],
        fontSrc: ["'self'", 'fonts.gstatic.com'],
        imgSrc: [
          "'self'",
          'data:',
          'tile.openstreetmap.org',
          '*.tile.openstreetmap.org',
          '*.googleusercontent.com'
        ],
        connectSrc: ["'self'", 'wss:']
      }
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session — file store in both envs (prod needs a Railway persistent volume on ./data)
const SESSION_TTL_SECONDS = 5 * 24 * 60 * 60; // 5 days

const sessionStore = new FileStore({
  path: path.join(__dirname, 'data', 'sessions'),
  ttl: SESSION_TTL_SECONDS,
  retries: 1,
  logFn: () => {
    /* silence session-file-store logging */
  }
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: sessionStore,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS * 1000
  }
});
app.use(sessionMiddleware);

// Passport
app.use(passport.initialize());
app.use(passport.session());

if (!isProd) {
  console.log('[auth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'set' : 'MISSING');
  console.log(
    '[auth] GOOGLE_CALLBACK_URL:',
    process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    },
    (_accessToken, _refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value;
      if (!email?.endsWith('@symphony.is')) {
        if (!isProd) console.log('[auth] Rejected - not @symphony.is');
        return done(null, false, { message: 'Only @symphony.is accounts allowed' });
      }
      const driverEmails = (process.env.DRIVER_EMAILS || '').split(',').map(e => e.trim());
      const managerEmails = (process.env.MANAGER_EMAILS || '').split(',').map(e => e.trim());
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email,
        photo: profile.photos?.[0]?.value,
        isDriver: driverEmails.includes(email),
        isManager: managerEmails.includes(email)
      };
      if (!isProd) console.log('[auth] Login success:', email);
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Web Push
if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY &&
  !process.env.VAPID_PUBLIC_KEY.includes('your_')
) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:admin@symphony.is',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Auth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=domain' }),
  (_req, res) => {
    res.redirect('/');
  }
);

app.get('/auth/logout', (req, res) => {
  req.logout(() => res.redirect('/login'));
});

app.get('/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.json({ user: null });
  }
});

// Login page
app.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Health check (Railway / load balancer)
app.get('/health', (_req, res) => res.json({ ok: true }));

// API routes
app.use('/api', apiRouter);

// Main app (SPA)
app.get('/', ensureAuthenticated, (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io
const driverLocations = {}; // rideId -> live location payload
const driverSocketByRide = {}; // rideId -> socket.id currently sharing, for disconnect cleanup
const MAX_MSG_LEN = 500;

// Attach session, then require an authenticated user for every socket.
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});
io.use((socket, next) => {
  const user = socket.request.session?.passport?.user;
  if (!user) return next(new Error('unauthorized'));
  socket.data.user = user;
  next();
});

io.on('connection', socket => {
  const user = socket.data.user;

  // Join ride room (rideId = `${tourId}__${date}`, location tracking only)
  socket.on('joinTour', id => {
    const { tourId, date } = parseRideId(id);
    if (!TOURS[tourId] || !date) return;
    socket.join(id);
    if (driverLocations[id]) {
      socket.emit('driverLocation', driverLocations[id]);
    }
  });

  // Leave a ride room (client switches ride on the map)
  socket.on('leaveRoom', id => {
    if (typeof id === 'string') socket.leave(id);
  });

  // Join global message channel
  socket.on('joinGlobal', () => {
    socket.join('global');
    socket.emit('messageHistory', db.getMessages('global'));
  });

  // Join driver inbox room (drivers only — notified on every new message)
  socket.on('joinDriverInbox', () => {
    if (!user.isDriver) return;
    socket.join('driver-inbox');
  });

  // Driver shares location (drivers only). Not gated on the active-window cutoff so a
  // ride in progress past its cutoff keeps streaming GPS instead of freezing.
  socket.on('driverLocation', data => {
    if (!user.isDriver) return;
    const { tourId, date, lat, lng } = data || {};
    if (!TOURS[tourId] || !date || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const id = rideId(tourId, date);
    driverLocations[id] = {
      tourId,
      date,
      name: TOURS[tourId].name,
      departureTime: TOURS[tourId].departureTime,
      lat,
      lng,
      timestamp: Date.now()
    };
    driverSocketByRide[id] = socket.id;
    io.to(id).emit('driverLocation', driverLocations[id]);
  });

  // Stop sharing location (drivers only)
  socket.on('driverStopSharing', id => {
    const { tourId, date } = parseRideId(id);
    if (!user.isDriver || !TOURS[tourId] || !date) return;
    delete driverLocations[id];
    if (driverSocketByRide[id] === socket.id) delete driverSocketByRide[id];
    io.to(id).emit('driverLocationStopped', { tourId, date });
  });

  // Driver disconnected (tab closed, network loss) without clicking Stop —
  // clear any ride this socket was actively sharing so riders don't see a frozen ghost bus.
  socket.on('disconnect', () => {
    for (const [id, sharerId] of Object.entries(driverSocketByRide)) {
      if (sharerId === socket.id) {
        const { tourId, date } = parseRideId(id);
        delete driverLocations[id];
        delete driverSocketByRide[id];
        io.to(id).emit('driverLocationStopped', { tourId, date });
      }
    }
  });

  // Chat message — always global, no tour selection required
  socket.on('sendMessage', data => {
    const text = (data?.text || '').toString().trim().slice(0, MAX_MSG_LEN);
    if (!text) return;
    const msg = db.saveMessage('global', { text, userName: user.displayName });
    io.to('global').emit('newMessage', msg);
    // Real-time alert to all connected drivers
    io.to('driver-inbox').emit('driverAlert', msg);
  });

  socket.on('likeMessage', msgId => {
    if (!user.isDriver) return;
    const msg = db.likeMessage(String(msgId));
    if (!msg) return;
    io.to('global').emit('messageLiked', { id: msg.id, liked: msg.liked });
  });
});

// Cron: Retire today's morning rides at 10:00 (after morning1/2 last departure 08:40).
// Tomorrow's morning (separate date key) is untouched and becomes the new "today".
cron.schedule(
  '0 10 * * *',
  () => {
    db.resetReservationsForTours(sarajevoDate(), ['morning1', 'morning2']);
    io.emit('reservationsReset');
    console.log('Morning rides retired at 10:00');
  },
  { timezone: 'Europe/Sarajevo' }
);

// Cron: Retire today's afternoon rides at 18:30 (after afternoon1/2 last departure 17:30).
cron.schedule(
  '30 18 * * *',
  () => {
    db.resetReservationsForTours(sarajevoDate(), ['afternoon1', 'afternoon2']);
    io.emit('reservationsReset');
    console.log('Afternoon rides retired at 18:30');
  },
  { timezone: 'Europe/Sarajevo' }
);

// Cron: Calendar rollover at midnight — purge past-date reservations, refresh clients.
cron.schedule(
  '0 0 * * *',
  () => {
    db.purgePastDates(sarajevoDate());
    io.emit('reservationsReset');
    console.log('Past-date reservations purged at 00:00');
  },
  { timezone: 'Europe/Sarajevo' }
);

// Cron: Send push notification at 15:00
cron.schedule(
  '0 15 * * *',
  async () => {
    if (!process.env.VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY.includes('your_')) return;
    try {
      const subscriptions = db.getAllPushSubscriptions();
      const afternoonTimes = Object.values(TOURS)
        .filter(t => t.direction === 'fromOffice')
        .sort((a, b) => a.departureTime.localeCompare(b.departureTime))
        .map(t => t.departureTime)
        .join(' i ');
      const payload = JSON.stringify({
        title: 'Symphony Shuttle',
        body: `Popodnevne ture kreću uskoro! ${afternoonTimes}`,
        icon: '/images/bus-icon.png'
      });
      for (const { subscription } of subscriptions) {
        try {
          await webpush.sendNotification(subscription, payload);
        } catch (err) {
          // Subscription gone (404/410) — drop it so it stops being retried
          if (err.statusCode === 404 || err.statusCode === 410) {
            db.removePushSubscription(subscription?.endpoint);
          }
        }
      }
      console.log(`Push notifications sent to ${subscriptions.length} subscribers`);
    } catch (err) {
      console.error('Push cron failed:', err);
    }
  },
  { timezone: 'Europe/Sarajevo' }
);

// Process is in an undefined state after these — log then exit so Railway restarts clean
// instead of a zombie continuing to serve.
process.on('unhandledRejection', err => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});
process.on('uncaughtException', err => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Symphony Shuttle running on http://localhost:${PORT}`);
});

// Graceful shutdown: Railway sends SIGTERM on every redeploy. Close sockets + HTTP server
// so in-flight requests finish and no db write is interrupted mid read-modify-write.
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down...`);
  io.close();
  server.close(() => {
    console.log('Server closed, exiting');
    process.exit(0);
  });
  // Don't hang forever if a connection refuses to close.
  setTimeout(() => {
    console.error('Forced exit after shutdown timeout');
    process.exit(1);
  }, 10000).unref();
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
