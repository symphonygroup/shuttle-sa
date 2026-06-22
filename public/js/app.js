// ── State ──────────────────────────────────────────────────────────────────
let currentUser = null;
let tours = [];
let activeTour = null; // tour open in modal
let selectedSeat = null;
let pendingCancelSeat = null; // seat whose cancel panel is shown (managers: any of their seats)
let socket = null;
let map = null;
let busMarker = null;
let mapCenteredOnReveal = false;
let driverWatchId = null;
let activeDriverTourId = null;
let sharingTourId = null; // tour the live GPS share is actually pinned to (may differ from the dropdown)
let manifestTourId = null;

const TOTAL_SEATS = 19;

// ── Init ───────────────────────────────────────────────────────────────────
(async function init() {
  let data;
  try {
    const res = await fetch('/auth/user');
    if (!res.ok) throw new Error('auth request failed');
    data = await res.json();
  } catch (e) {
    console.error('Init failed:', e);
    window.location.href = '/login';
    return;
  }
  if (!data.user) {
    window.location.href = '/login';
    return;
  }
  currentUser = data.user;

  document.getElementById('userName').textContent = currentUser.displayName.split(' ')[0];
  const avatar = document.getElementById('userAvatar');
  if (currentUser.photo) {
    avatar.src = currentUser.photo;
    avatar.style.display = 'block';
  }

  if (currentUser.isDriver) {
    document.getElementById('driverTabBtn').classList.remove('hidden');
  }

  initSocket();
  initTabs();
  initMap();
  await loadTours();
  initManifest();
  initMessages();
  initDriverTourSelect();
  initPushNotifications();
  initModal();

  // Clear GPS watch when leaving the page (driver location sharing)
  window.addEventListener('beforeunload', () => {
    if (driverWatchId != null) navigator.geolocation.clearWatch(driverWatchId);
  });
})();

// ── Socket ─────────────────────────────────────────────────────────────────
function initSocket() {
  socket = io();

  // Re-join rooms after a dropped connection is restored
  socket.io.on('reconnect', () => {
    tours.forEach(t => {
      socket.emit('joinTour', t.id);
    });
    socket.emit('joinGlobal');
    if (currentUser?.isDriver) socket.emit('joinDriverInbox');
  });

  socket.on('seatUpdate', ({ tourId, seatNumber, status, userName, guest }) => {
    const tour = tours.find(t => t.id === tourId);
    if (!tour) return;
    if (status === 'free') {
      delete tour.seats[seatNumber];
      if (tour.seatNames) delete tour.seatNames[seatNumber];
      if (tour.seatGuests) delete tour.seatGuests[seatNumber];
      // Seat freed externally (e.g. driver cancelled) — clear local reservation state
      if (tour.myReservation?.seatNumber === seatNumber) {
        tour.myReservation = null;
      }
    } else {
      // Server always sends 'taken'; preserve 'mine' if this is the current user's seat
      tour.seats[seatNumber] = tour.myReservation?.seatNumber === seatNumber ? 'mine' : status;
      if (userName) {
        if (!tour.seatNames) tour.seatNames = {};
        tour.seatNames[seatNumber] = userName;
      }
      if (!tour.seatGuests) tour.seatGuests = {};
      if (guest) tour.seatGuests[seatNumber] = true;
      else delete tour.seatGuests[seatNumber];
    }
    renderTourCard(tour);
    if (activeTour && activeTour.id === tourId) {
      renderSeatGrid(tour);
      updateModalPanels(tour);
    }
    if (currentUser?.isDriver && activeDriverTourId === tourId) {
      loadPassengers(tourId);
    }
    if (manifestTourId === tourId) loadManifest(tourId);
  });

  socket.on('reservationsReset', () => {
    tours.forEach(t => {
      t.seats = {};
      t.myReservation = null;
      t.takenCount = 0;
    });
    tours.forEach(renderTourCard);
    if (activeTour) {
      renderSeatGrid(activeTour);
      updateModalPanels(activeTour);
    }
    if (currentUser?.isDriver && activeDriverTourId) {
      loadPassengers(activeDriverTourId);
    }
    if (manifestTourId) loadManifest(manifestTourId);
    showToast('Rezervacije su resetovane 🔄');
  });

  socket.on('driverLocation', loc => {
    if (!map) return;
    const latlng = [loc.lat, loc.lng];
    if (!busMarker) {
      busMarker = L.marker(latlng, { icon: busIcon() }).addTo(map);
      map.setView(latlng, 14);
    } else {
      busMarker.setLatLng(latlng);
    }
    showActiveRide(loc);
  });

  socket.on('driverLocationStopped', () => {
    if (busMarker) {
      busMarker.remove();
      busMarker = null;
    }
    showNoRide();
  });

  socket.on('newMessage', msg => {
    appendMessage(msg, false, 'messagesBox');
    if (currentUser.isDriver) {
      appendMessage(msg, false, 'driverMessagesBox');
      if (msg.userName !== currentUser.displayName) playDing();
    }
  });

  socket.on('messageHistory', messages => {
    populateMessageBox('messagesBox', messages);
    if (currentUser.isDriver) populateMessageBox('driverMessagesBox', messages);
  });

  socket.on('messageLiked', ({ id, liked }) => {
    document.querySelectorAll(`[data-msg-id="${id}"] .msg-heart`).forEach(heart => {
      heart.classList.toggle('liked', liked);
    });
  });

  socket.on('driverAlert', msg => {
    const driverTabActive = document.getElementById('tab-driver').classList.contains('active');
    const msgTabActive = document.getElementById('tab-messages').classList.contains('active');
    if (!driverTabActive && !msgTabActive) {
      showToast(`💬 ${msg.userName}: ${msg.text.slice(0, 40)}${msg.text.length > 40 ? '…' : ''}`);
    }
  });

  if (currentUser.isDriver) {
    // Driver toggles like by double-tapping anywhere on a message (mouse + touch).
    let lastTapTs = 0;
    let lastTapId = null;
    const DOUBLE_TAP_MS = 350;
    ['messagesBox', 'driverMessagesBox'].forEach(boxId => {
      const box = document.getElementById(boxId);
      if (!box) return;
      box.addEventListener('click', e => {
        const msgItem = e.target.closest('[data-msg-id]');
        if (!msgItem) return;
        const id = msgItem.dataset.msgId;
        const now = Date.now();
        if (id === lastTapId && now - lastTapTs <= DOUBLE_TAP_MS) {
          socket.emit('likeMessage', id);
          lastTapTs = 0;
          lastTapId = null;
        } else {
          lastTapTs = now;
          lastTapId = id;
        }
      });
    });
  }
}

function busIcon() {
  return L.divIcon({
    html: '<div style="font-size:28px;line-height:1;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.5))">🚌</div>',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    className: ''
  });
}

// ── Tabs ───────────────────────────────────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab').forEach(b => {
        b.classList.remove('active');
      });
      document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('active');
      });
      btn.classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
      if (tab === 'map' && map) setTimeout(recenterMapOnReveal, 100);
      if (tab === 'messages') {
        const box = document.getElementById('messagesBox');
        box.scrollTop = box.scrollHeight;
      }
      if (tab === 'driver') {
        const box = document.getElementById('driverMessagesBox');
        if (box) box.scrollTop = box.scrollHeight;
      }
    });
  });
}

// ── Tours ──────────────────────────────────────────────────────────────────
function getRideDate() {
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
  const now = new Date();
  const tz = 'Europe/Sarajevo';
  const hourStr = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    hour12: false,
    timeZone: tz
  }).format(now);
  const isTomorrow = parseInt(hourStr, 10) >= 11;
  const target = new Date(now);
  if (isTomorrow) target.setDate(target.getDate() + 1);
  const parts = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    timeZone: tz
  }).formatToParts(target);
  const day = parseInt(parts.find(p => p.type === 'day').value, 10);
  const month = parseInt(parts.find(p => p.type === 'month').value, 10) - 1;
  const year = parts.find(p => p.type === 'year').value;
  return `${isTomorrow ? 'Sutra' : 'Danas'}, ${day}. ${MONTHS[month]} ${year}.`;
}

async function loadTours() {
  try {
    const res = await fetch('/api/tours');
    if (!res.ok) throw new Error('tours request failed');
    tours = await res.json();
  } catch (e) {
    console.error('loadTours failed:', e);
    showToast('❌ Greška pri učitavanju tura', 'error');
    return;
  }
  document.getElementById('rideDateLabel').textContent = getRideDate();
  const grid = document.getElementById('toursGrid');
  grid.innerHTML = '';
  const morning = tours.filter(t => t.direction === 'toOffice');
  const afternoon = tours.filter(t => t.direction === 'fromOffice');
  [
    { label: 'Jutarnje ture', items: morning },
    { label: 'Popodnevne ture', items: afternoon }
  ].forEach(({ label, items }) => {
    if (!items.length) return;
    const h = document.createElement('div');
    h.className = 'tour-group-label';
    h.textContent = label;
    grid.appendChild(h);
    items.forEach(tour => {
      const card = document.createElement('div');
      card.className = 'tour-card';
      card.id = `tour-card-${tour.id}`;
      card.addEventListener('click', () => openModal(tour));
      grid.appendChild(card);
      renderTourCard(tour);
      socket.emit('joinTour', tour.id);
    });
  });
}

function renderTourCard(tour) {
  const card = document.getElementById(`tour-card-${tour.id}`);
  if (!card) return;
  const taken = Object.values(tour.seats).filter(s => s === 'taken' || s === 'mine').length;
  const free = TOTAL_SEATS - taken;
  card.classList.toggle('has-reservation', !!tour.myReservation);
  card.innerHTML = `
    <div class="tour-card-accent"></div>
    <div class="tour-header">
      <div class="tour-name">${tour.name}</div>
      <div class="tour-time">${tour.departureTime}</div>
    </div>
    <div class="tour-meta">
      <span class="seats-text">${free} slobodnih mjesta</span>
      ${tour.myReservation ? `<span class="my-res-badge">S${tour.myReservation.seatNumber}</span>` : ''}
    </div>
  `;
}

// ── Manifest (Ko putuje) ─────────────────────────────────────────────────────
function nowMinutesSarajevo() {
  const parts = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
    timeZone: 'Europe/Sarajevo'
  }).formatToParts(new Date());
  const h = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const m = parseInt(parts.find(p => p.type === 'minute').value, 10);
  return h * 60 + m;
}

function depMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function defaultManifestTourId() {
  if (!tours.length) return null;
  // Same 11:00 cutoff as getRideDate(): after 11:00 the ride window is tomorrow,
  // so every tour counts as upcoming; before 11:00 only tours not yet departed.
  const afterCutoff = nowMinutesSarajevo() >= 11 * 60;
  const upcoming = afterCutoff
    ? tours.slice()
    : tours.filter(t => depMinutes(t.departureTime) >= nowMinutesSarajevo());
  const pool = upcoming.length ? upcoming : tours.slice();
  const byTime = [...pool].sort(
    (a, b) => depMinutes(a.departureTime) - depMinutes(b.departureTime)
  );
  const mine = byTime.find(t => t.myReservation);
  return (mine || byTime[0]).id;
}

function initManifest() {
  const sel = document.getElementById('manifestTourSelect');
  if (!sel) return;
  tours.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.name} · ${t.departureTime}`;
    sel.appendChild(opt);
  });
  manifestTourId = defaultManifestTourId();
  if (manifestTourId) {
    sel.value = manifestTourId;
    loadManifest(manifestTourId);
  }
  sel.addEventListener('change', () => {
    manifestTourId = sel.value;
    loadManifest(manifestTourId);
  });
}

async function loadManifest(tourId) {
  let data;
  try {
    const res = await fetch(`/api/tours/${tourId}/passengers`);
    if (!res.ok) throw new Error('manifest request failed');
    data = await res.json();
  } catch (e) {
    console.error('loadManifest failed:', e);
    return;
  }
  if (manifestTourId !== tourId) return; // selection changed while fetching
  renderManifest(data);
}

function renderManifest(data) {
  const container = document.getElementById('manifestList');
  if (!container) return;
  if (!data.passengers?.length) {
    container.innerHTML = '<p class="manifest-empty">Nema rezervacija za ovu turu.</p>';
    return;
  }
  container.innerHTML = data.passengers
    .map(
      s => `
      <div class="passenger-stop">
        <div class="passenger-stop-name">📍 ${escapeHtml(s.stop)}</div>
        ${s.passengers
          .map(
            p =>
              `<div class="passenger-row"><span>${escapeHtml(p.userName)}${p.guest ? ' <span class="guest-badge">★ Gost</span>' : ''}</span></div>`
          )
          .join('')}
      </div>
    `
    )
    .join('');
}

// ── Modal / Seat Grid ──────────────────────────────────────────────────────
function initModal() {
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('seatModal').addEventListener('click', e => {
    if (e.target === document.getElementById('seatModal')) closeModal();
  });
  document.getElementById('reserveBtn').addEventListener('click', doReserve);
  document.getElementById('cancelBtn').addEventListener('click', doCancel);
  document.getElementById('stopSelect').addEventListener('change', e => {
    document.getElementById('reserveBtn').disabled = !e.target.value;
  });
}

function openModal(tour) {
  activeTour = tour;
  selectedSeat = null;
  pendingCancelSeat = null;
  document.getElementById('modalTourName').textContent = `${tour.name} · ${tour.departureTime}`;
  renderSeatGrid(tour);
  updateModalPanels(tour);
  document.getElementById('seatModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('seatModal').classList.add('hidden');
  document.body.style.overflow = '';
  activeTour = null;
  selectedSeat = null;
  pendingCancelSeat = null;
}

function renderSeatGrid(tour) {
  const grid = document.getElementById('seatGrid');
  grid.className = 'bus-layout';
  grid.innerHTML = '';

  // Row 0: [Vozač][empty] | aisle | [S1]
  const row0 = document.createElement('div');
  row0.className = 'bus-row';
  const leftPair0 = document.createElement('div');
  leftPair0.className = 'bus-left-pair';
  leftPair0.innerHTML = `<div class="seat driver" title="Vozač">Vozač</div>`;
  leftPair0.appendChild(makeEmptySeatEl());
  row0.appendChild(leftPair0);
  const aisle0 = document.createElement('div');
  aisle0.className = 'bus-aisle';
  row0.appendChild(aisle0);
  row0.appendChild(makeSeatEl(1, tour));
  grid.appendChild(row0);

  // Rows 1-6: base = 2 + r*3 → [base][base+1] | aisle | [base+2]
  // Row 1: 2,3 | 4  — Row 2: 5,6 | 7  — ... — Row 6: 17,18 | 19
  for (let r = 0; r < 6; r++) {
    const base = 2 + r * 3;
    const row = document.createElement('div');
    row.className = 'bus-row';

    const leftPair = document.createElement('div');
    leftPair.className = 'bus-left-pair';
    leftPair.appendChild(makeSeatEl(base, tour));
    leftPair.appendChild(makeSeatEl(base + 1, tour));
    row.appendChild(leftPair);

    const aisle = document.createElement('div');
    aisle.className = 'bus-aisle';
    row.appendChild(aisle);

    row.appendChild(makeSeatEl(base + 2, tour));
    grid.appendChild(row);
  }
}

function getInitials(name) {
  return (name || '')
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

function makeSeatEl(num, tour) {
  const status = tour.seats[num] || 'free';
  const div = document.createElement('div');
  div.className = `seat ${status}`;
  div.dataset.seat = num;
  if (status === 'taken' || status === 'mine') {
    const isGuest = !!tour.seatGuests?.[num];
    const label = isGuest ? '★' : getInitials(tour.seatNames?.[num] || '');
    div.classList.add('seat--named');
    if (isGuest) div.classList.add('seat--guest');
    div.innerHTML = `<span class="seat-num">${num}</span><span class="seat-initials">${label}</span>`;
  } else {
    div.textContent = num;
  }
  if (status !== 'taken') {
    div.addEventListener('click', () => onSeatClick(num, status, tour));
  }
  return div;
}

function makeEmptySeatEl() {
  const div = document.createElement('div');
  div.className = 'seat-empty';
  return div;
}

function onSeatClick(seatNum, status, tour) {
  if (status === 'taken') return;
  if (status === 'mine') {
    // Show cancel panel for this specific seat (managers may own several)
    pendingCancelSeat = seatNum;
    selectedSeat = null;
    document.querySelectorAll('.seat').forEach(s => {
      s.classList.remove('selected');
    });
    document.getElementById('stopSelector').classList.add('hidden');
    renderCancelInfo(tour, seatNum);
    document.getElementById('myReservationPanel').classList.remove('hidden');
    return;
  }
  // Free seat — select it
  selectedSeat = seatNum;
  pendingCancelSeat = null;
  document.querySelectorAll('.seat').forEach(s => {
    s.classList.remove('selected');
  });
  document.querySelector(`.seat[data-seat="${seatNum}"]`)?.classList.add('selected');
  populateStopSelect(tour);
  document.getElementById('reserveBtn').disabled = true;
  document.getElementById('stopSelector').classList.remove('hidden');
  document.getElementById('myReservationPanel').classList.add('hidden');
}

function renderCancelInfo(tour, seat) {
  const isGuest = !!tour.seatGuests?.[seat];
  const isMyRes = tour.myReservation?.seatNumber === seat;
  const guestLine = isGuest ? ' <span class="guest-badge">★ Gost</span>' : '';
  const stopLine =
    isMyRes && tour.myReservation.stop
      ? `<br>📍 Stanica: <strong>${escapeHtml(tour.myReservation.stop)}</strong>`
      : '';
  const name = tour.seatNames?.[seat];
  const nameLine = !isMyRes && name ? `<br>👤 <strong>${escapeHtml(name)}</strong>` : '';
  document.getElementById('myResInfo').innerHTML =
    `✅ Rezervisano: <strong>Sjedište ${seat}</strong>${guestLine}${stopLine}${nameLine}`;
}

function updateModalPanels(tour) {
  const stopSel = document.getElementById('stopSelector');
  const myResPanel = document.getElementById('myReservationPanel');
  const hint = document.getElementById('managerHint');
  if (hint) hint.classList.toggle('hidden', !currentUser.isManager);

  // Managers hold many seats: panels are driven by explicit seat clicks, not a
  // single reservation. Keep an open cancel panel only while its seat is still mine.
  if (currentUser.isManager) {
    stopSel.classList.add('hidden');
    if (pendingCancelSeat != null && tour.seats[pendingCancelSeat] === 'mine') {
      renderCancelInfo(tour, pendingCancelSeat);
      myResPanel.classList.remove('hidden');
    } else {
      pendingCancelSeat = null;
      myResPanel.classList.add('hidden');
    }
    return;
  }

  if (tour.myReservation) {
    stopSel.classList.add('hidden');
    myResPanel.classList.remove('hidden');
    document.getElementById('myResInfo').innerHTML =
      `✅ Rezervisano: <strong>Sjedište ${tour.myReservation.seatNumber}</strong><br>📍 Stanica: <strong>${escapeHtml(tour.myReservation.stop)}</strong>`;
  } else {
    stopSel.classList.add('hidden');
    myResPanel.classList.add('hidden');
  }
}

function populateStopSelect(tour) {
  const sel = document.getElementById('stopSelect');
  sel.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = '-- Odaberi stanicu --';
  sel.appendChild(placeholder);
  // Exclude last stop (Office/Dobrinja) — destination
  const stops = tour.direction === 'toOffice' ? tour.stops.slice(0, -1) : tour.stops.slice(1);
  stops.forEach(stop => {
    const opt = document.createElement('option');
    opt.value = stop;
    opt.textContent = stop;
    sel.appendChild(opt);
  });
}

async function doReserve() {
  if (!activeTour || !selectedSeat) return;
  const stop = document.getElementById('stopSelect').value;
  if (!stop) {
    showToast('❌ Odaberi stanicu', 'error');
    return;
  }
  // Capture the requested tour/seat — activeTour/selectedSeat can change while the
  // request is in flight (modal closed/reopened on a different tour mid-request).
  const tourId = activeTour.id;
  const bookedSeat = selectedSeat;
  const btn = document.getElementById('reserveBtn');
  btn.disabled = true;
  btn.textContent = 'Rezervišem...';

  try {
    const res = await fetch('/api/reserve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, seatNumber: bookedSeat, stop })
    });
    if (res.redirected || res.status === 401) {
      showToast('❌ Sesija istekla — prijavite se ponovo', 'error');
      setTimeout(() => (window.location.href = '/login'), 1500);
      return;
    }
    const data = await res.json();
    if (data.success) {
      const tour = tours.find(t => t.id === tourId);
      if (tour) {
        tour.seats[bookedSeat] = 'mine';
        if (!tour.seatNames) tour.seatNames = {};
        tour.seatNames[bookedSeat] = currentUser.displayName;
        if (currentUser.isManager) {
          // Guest booking — keep modal open so the manager can book more seats.
          if (!tour.seatGuests) tour.seatGuests = {};
          tour.seatGuests[bookedSeat] = true;
        } else {
          tour.myReservation = { seatNumber: bookedSeat, stop };
        }
        renderTourCard(tour);
        // Only touch the modal/selection state if it's still showing this same tour.
        if (activeTour?.id === tourId) {
          if (currentUser.isManager) {
            selectedSeat = null;
            document.getElementById('stopSelector').classList.add('hidden');
          }
          activeTour = tour;
          renderSeatGrid(tour);
          updateModalPanels(tour);
        }
      }
      showToast(`✅ Rezervisano sjedište ${bookedSeat} na ${stop}`);
    } else {
      showToast(`❌ ${data.error || 'Greška'}`, 'error');
    }
  } catch (e) {
    showToast('❌ Greška pri rezervaciji', 'error');
    console.error('Reserve error:', e);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Rezerviši sjedište';
  }
}

async function doCancel() {
  const seatNumber = pendingCancelSeat ?? activeTour?.myReservation?.seatNumber;
  if (!activeTour || seatNumber == null) return;
  // Capture the requested tour — activeTour can change while the request is in
  // flight (modal closed/reopened on a different tour mid-request).
  const tourId = activeTour.id;
  let data;
  try {
    const res = await fetch(`/api/reserve/${tourId}/${seatNumber}`, { method: 'DELETE' });
    if (res.redirected || res.status === 401) {
      showToast('❌ Sesija istekla — prijavite se ponovo', 'error');
      setTimeout(() => (window.location.href = '/login'), 1500);
      return;
    }
    data = await res.json();
  } catch (e) {
    showToast('❌ Greška', 'error');
    console.error('Cancel error:', e);
    return;
  }
  if (data.success) {
    const tour = tours.find(t => t.id === tourId);
    if (tour) {
      delete tour.seats[seatNumber];
      if (tour.seatNames) delete tour.seatNames[seatNumber];
      if (tour.seatGuests) delete tour.seatGuests[seatNumber];
      if (tour.myReservation?.seatNumber === seatNumber) tour.myReservation = null;
      renderTourCard(tour);
      // Only touch the modal/pending-cancel state if it's still showing this same tour.
      if (activeTour?.id === tourId) {
        pendingCancelSeat = null;
        activeTour = tour;
        renderSeatGrid(tour);
        updateModalPanels(tour);
      }
    }
    showToast('Rezervacija otkazana');
  } else {
    showToast('❌ Greška', 'error');
  }
}

// ── Map ────────────────────────────────────────────────────────────────────
function initMap() {
  map = L.map('map', { zoomControl: true }).setView([43.847, 18.356], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19
  }).addTo(map);
}

// Active ride drives the map: overlay names the live tour, empty state covers the
// map when no driver is sharing. No tour selector — clients already join all rooms.
function showActiveRide(loc) {
  const overlay = document.getElementById('mapActiveTour');
  const empty = document.getElementById('mapEmpty');
  if (overlay) {
    const time = loc.departureTime ? ` · ${loc.departureTime}` : '';
    overlay.innerHTML = `<span class="status-dot online"></span> <strong>${escapeHtml(loc.name || 'Aktivna vožnja')}</strong>${time} — praćenje uživo`;
    overlay.classList.remove('hidden');
  }
  if (empty) empty.classList.add('hidden');
  if (map) setTimeout(recenterMapOnReveal, 50);
}

function showNoRide() {
  const overlay = document.getElementById('mapActiveTour');
  const empty = document.getElementById('mapEmpty');
  if (overlay) overlay.classList.add('hidden');
  if (empty) empty.classList.remove('hidden');
  mapCenteredOnReveal = false;
}

// Leaflet computes pixel bounds against the container's current size — if the
// map tab is hidden (display:none) when a marker first appears or setView runs,
// the resulting center is wrong even after a later invalidateSize(). Only
// recenter once the map tab is actually visible, then never fight a manual pan/zoom.
function recenterMapOnReveal() {
  if (!map || !busMarker || mapCenteredOnReveal) return;
  const mapTab = document.getElementById('tab-map');
  if (mapTab && !mapTab.classList.contains('active')) return;
  map.invalidateSize();
  map.setView(busMarker.getLatLng(), map.getZoom());
  mapCenteredOnReveal = true;
}

// ── Messages ───────────────────────────────────────────────────────────────
function initMessages() {
  socket.emit('joinGlobal');
  if (currentUser.isDriver) socket.emit('joinDriverInbox');

  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('msgInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
  });
}

function sendMessage() {
  const input = document.getElementById('msgInput');
  const text = input.value.trim();
  if (!text) return;
  socket.emit('sendMessage', { text, userName: currentUser.displayName });
  input.value = '';
}

function populateMessageBox(boxId, messages) {
  const box = document.getElementById(boxId);
  if (!box) return;
  box.innerHTML = '';
  if (!messages.length) {
    box.innerHTML = '<div class="msg-empty">Nema poruka</div>';
    return;
  }
  messages.forEach(m => {
    appendMessage(m, true, boxId);
  });
  box.scrollTop = box.scrollHeight;
}

function appendMessage(msg, skipScroll = false, boxId = 'messagesBox') {
  const box = document.getElementById(boxId);
  if (!box) return;
  const empty = box.querySelector('.msg-empty');
  if (empty) empty.remove();

  const isMine = msg.userName === currentUser.displayName;
  const div = document.createElement('div');
  div.className = `msg-item${isMine ? ' mine' : ''}`;
  if (msg.id) div.dataset.msgId = msg.id;

  let heartHtml = '';
  if (msg.id) {
    const likedClass = msg.liked ? ' liked' : '';
    const driverClass = currentUser.isDriver ? ' driver-heart' : '';
    heartHtml = `<button class="msg-heart${likedClass}${driverClass}" data-action="like" aria-label="Lajkuj">❤</button>`;
  }

  div.innerHTML = `
    <div class="msg-sender">${escapeHtml(msg.userName)}</div>
    <div class="msg-text">${escapeHtml(msg.text)}</div>
    <div class="msg-time">${formatTime(msg.timestamp)}</div>
    ${heartHtml}
  `;
  box.appendChild(div);
  if (!skipScroll) box.scrollTop = box.scrollHeight;
}

let dingAudioCtx = null;

function playDingTone() {
  try {
    if (!dingAudioCtx) dingAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = dingAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.warn('playDingTone failed:', e);
  }
}

function playDing() {
  const audio = new Audio('/sounds/driver-alert.mp3');
  audio.play().catch(e => {
    console.warn('driver-alert.mp3 playback failed, falling back to tone:', e);
    playDingTone();
  });
}

// ── Driver Panel ───────────────────────────────────────────────────────────
function initDriverTourSelect() {
  if (!currentUser.isDriver) return;
  const sel = document.getElementById('driverTourSelect');
  tours.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.name} · ${t.departureTime}`;
    sel.appendChild(opt);
  });
  sel.addEventListener('change', () => {
    activeDriverTourId = sel.value;
    if (activeDriverTourId) loadPassengers(activeDriverTourId);
    else document.getElementById('passengerList').innerHTML = '';
  });

  document.getElementById('startLocBtn').addEventListener('click', startSharingLocation);
  document.getElementById('stopLocBtn').addEventListener('click', stopSharingLocation);
  document.getElementById('driverResetBtn').addEventListener('click', doDriverReset);

  document.getElementById('driverSendBtn').addEventListener('click', sendDriverMessage);
  document.getElementById('driverMsgInput').addEventListener('keypress', e => {
    if (e.key === 'Enter') sendDriverMessage();
  });
}

function sendDriverMessage() {
  const input = document.getElementById('driverMsgInput');
  const text = input.value.trim();
  if (!text) return;
  socket.emit('sendMessage', { text, userName: currentUser.displayName });
  input.value = '';
}

async function doDriverReset() {
  if (!confirm('Resetovati sve rezervacije?')) return;
  try {
    const res = await fetch('/api/driver/reset', { method: 'POST' });
    const data = await res.json();
    if (data.success) showToast('Sve rezervacije su resetovane');
    else showToast('❌ Greška pri resetovanju', 'error');
  } catch (e) {
    showToast('❌ Greška pri resetovanju', 'error');
    console.error('Driver reset error:', e);
  }
}

async function loadPassengers(tourId) {
  let data;
  try {
    const res = await fetch(`/api/driver/passengers/${tourId}`);
    data = await res.json();
  } catch (e) {
    console.error('loadPassengers failed:', e);
    return;
  }
  const container = document.getElementById('passengerList');
  if (!data.passengers?.length) {
    container.innerHTML =
      '<p style="color:var(--muted);font-size:0.85rem;padding:0.5rem 0">Nema rezervacija za ovu turu.</p>';
    return;
  }
  container.innerHTML = `
    <div class="section-title" style="margin-bottom:0.75rem">Putnici po stanicama · ${data.total} ukupno</div>
    ${data.passengers
      .map(
        s => `
      <div class="passenger-stop">
        <div class="passenger-stop-name">📍 ${escapeHtml(s.stop)}</div>
        ${s.passengers
          .map(
            p => `
          <div class="passenger-row">
            <span class="seat-badge">S${p.seat}</span>
            <span>${escapeHtml(p.userName)}${p.guest ? ' <span class="guest-badge">★ Gost</span>' : ''}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `
      )
      .join('')}
  `;
}

function startSharingLocation() {
  if (!navigator.geolocation) {
    showToast('GPS nije dostupan', 'error');
    return;
  }
  document.getElementById('startLocBtn').classList.add('hidden');
  document.getElementById('stopLocBtn').classList.remove('hidden');

  sharingTourId = activeDriverTourId;
  const tourName = tours.find(t => t.id === sharingTourId)?.name || sharingTourId;
  document.getElementById('locStatus').innerHTML =
    `<span class="status-dot online"></span> Dijeljenje lokacije aktivno · ${escapeHtml(tourName)}`;

  driverWatchId = navigator.geolocation.watchPosition(
    pos => {
      socket.emit('driverLocation', {
        tourId: sharingTourId,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    },
    err => {
      showToast(`GPS greška: ${err.message}`, 'error');
      stopSharingLocation();
    },
    { enableHighAccuracy: true, maximumAge: 5000 }
  );
}

function stopSharingLocation() {
  if (driverWatchId != null) navigator.geolocation.clearWatch(driverWatchId);
  driverWatchId = null;
  socket.emit('driverStopSharing', sharingTourId);
  sharingTourId = null;
  document.getElementById('stopLocBtn').classList.add('hidden');
  document.getElementById('startLocBtn').classList.remove('hidden');
  document.getElementById('locStatus').innerHTML =
    '<span class="status-dot offline"></span> Lokacija nije aktivna';
}

// ── Push Notifications ─────────────────────────────────────────────────────
async function initPushNotifications() {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
  if (Notification.permission === 'granted') {
    registerPushSubscription();
    return;
  }
  if (Notification.permission === 'default' && !localStorage.getItem('pushDismissed')) {
    const banner = document.getElementById('notifyBanner');
    banner.classList.remove('hidden');
    document.getElementById('enableNotify').addEventListener('click', async () => {
      banner.classList.add('hidden');
      const perm = await Notification.requestPermission();
      if (perm === 'granted') registerPushSubscription();
    });
    document.getElementById('dismissNotify').addEventListener('click', () => {
      localStorage.setItem('pushDismissed', '1');
      banner.classList.add('hidden');
    });
  }
}

async function registerPushSubscription() {
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    const keyRes = await fetch('/api/push/vapid-key');
    const { publicKey } = await keyRes.json();
    if (!publicKey || publicKey.includes('your_')) return;

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub)
    });
  } catch (e) {
    console.warn('push subscribe failed:', e);
  }
}

// ── Utilities ──────────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  const bg = type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(30,34,48,0.97)';
  const border = type === 'error' ? 'rgba(239,68,68,0.5)' : 'rgba(79,142,247,0.3)';
  el.style.cssText = `
    position:fixed;top:calc(var(--nav-h, 56px) + 0.75rem);bottom:auto;
    left:50%;transform:translateX(-50%) translateY(0);
    background:${bg};border:1px solid ${border};
    color:#fff;padding:0.7rem 1.25rem;border-radius:12px;
    font-size:0.9rem;font-weight:600;z-index:9999;
    white-space:nowrap;box-shadow:0 8px 32px rgba(0,0,0,0.4);
    backdrop-filter:blur(8px);
    animation:toastIn 0.3s cubic-bezier(0.16,1,0.3,1);
    transition:opacity 0.2s,transform 0.2s;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(8px)';
    setTimeout(() => el.remove(), 200);
  }, 2800);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString('bs', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}
