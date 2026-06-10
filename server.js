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
const db = require('./db');
const { TOURS } = require('./routes/tours');
const apiRouter = require('./routes/api');
const { ensureAuthenticated } = require('./middleware/auth');

const isProd = process.env.NODE_ENV === 'production';

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

console.log('[auth] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'set' : 'MISSING');
console.log(
  '[auth] GOOGLE_CALLBACK_URL:',
  process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
);

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
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email,
        photo: profile.photos?.[0]?.value,
        isDriver: driverEmails.includes(email)
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
const driverLocations = {};
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

  // Join tour room (location tracking only)
  socket.on('joinTour', tourId => {
    if (!TOURS[tourId]) return;
    socket.join(tourId);
    if (driverLocations[tourId]) {
      socket.emit('driverLocation', driverLocations[tourId]);
    }
  });

  // Leave a tour room (client switches tour on the map)
  socket.on('leaveRoom', tourId => {
    if (typeof tourId === 'string') socket.leave(tourId);
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

  // Driver shares location (drivers only)
  socket.on('driverLocation', data => {
    if (!user.isDriver) return;
    const { tourId, lat, lng } = data || {};
    if (!TOURS[tourId] || lat == null || lng == null) return;
    driverLocations[tourId] = { lat, lng, timestamp: Date.now() };
    io.to(tourId).emit('driverLocation', driverLocations[tourId]);
  });

  // Stop sharing location (drivers only)
  socket.on('driverStopSharing', tourId => {
    if (!user.isDriver || !TOURS[tourId]) return;
    delete driverLocations[tourId];
    io.to(tourId).emit('driverLocationStopped');
  });

  // Chat message — always global, no tour selection required
  socket.on('sendMessage', data => {
    const text = (data?.text || '').toString().trim().slice(0, MAX_MSG_LEN);
    const userName = (data?.userName || '').toString().trim();
    if (!text || !userName) return;
    const msg = db.saveMessage('global', { text, userName });
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

// Cron: Reset reservations at 11:00
cron.schedule(
  '0 11 * * *',
  () => {
    db.resetAllReservations();
    io.emit('reservationsReset');
    console.log('Reservations reset at 11:00');
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

process.on('unhandledRejection', err => console.error('Unhandled rejection:', err));
process.on('uncaughtException', err => console.error('Uncaught exception:', err));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Symphony Shuttle running on http://localhost:${PORT}`);
});
