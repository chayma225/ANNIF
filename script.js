/* script.js - CosmicLove Premium Upgrade */
/* Enhanced animations, micro-interactions, and premium feel */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, setDoc, getDoc, getDocs, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfwmK5b9xK0YAzPFCvGWCNex_N1B-5gII",
  authDomain: "cosmiclove-ilyes.firebaseapp.com",
  projectId: "cosmiclove-ilyes",
  storageBucket: "cosmiclove-ilyes.firebasestorage.app",
  messagingSenderId: "1050605246477",
  appId: "1:1050605246477:web:67e7b8de8342c3e4779d44"
};

let app = null;
let db = null;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (err) {
  console.error('Firebase init failed (blocked by browser/extension?) — Firebase-dependent features (gallery, dreams, moods, comments...) will be unavailable, but the rest of the site keeps working:', err);
}

// ==========================================================================
// SECURITY HELPER - Échappe le HTML pour éviter les injections
// (utilisé partout où on affiche du texte tapé par un utilisateur)
// ==========================================================================
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

// ==========================================================================
// TOAST NOTIFICATION LOGIC - PREMIUM EDITION
// ==========================================================================
export function showToast(message, isError = false) {
  const toast = document.getElementById('cosmic-toast');
  if (!toast) return;
  toast.textContent = message;
  if (isError) {
    toast.style.background = 'linear-gradient(135deg, #FF9EAA, #D4547E)';
  } else {
    toast.style.background = 'linear-gradient(135deg, rgba(255, 111, 168, 0.9), rgba(212, 84, 126, 0.9))';
  }
  toast.classList.add('show');
  setTimeout(() => { toast.classList.remove('show'); }, 3500);
}

// ==========================================================================
// IDENTITY LOGIC - ENHANCED
// ==========================================================================
let currentUser = null;
try {
  currentUser = localStorage.getItem('cosmiclove_user');
} catch (err) {
  console.error('localStorage unavailable (private mode / blocked storage?):', err);
}
export function getUser() {
  const identity = localStorage.getItem('identity');
  return identity ? identity : (currentUser || 'Anon');
}

function initIdentity() {
  const identityModal = document.getElementById('identity-modal');
  if (!identityModal) return;
  if (!currentUser) {
    identityModal.style.display = 'flex';
    identityModal.offsetHeight;
    identityModal.classList.add('open');
    document.body.style.overflow = 'hidden';

    const chaymaBtn = document.getElementById('btn-chayma');
    const ilyessBtn = document.getElementById('btn-ilyess');

    if (chaymaBtn) {
      chaymaBtn.addEventListener('click', () => {
        playButtonClick();
        setUser('Chayma');
        closeIdentityModal(identityModal);
      });
    }

    if (ilyessBtn) {
      ilyessBtn.addEventListener('click', () => {
        playButtonClick();
        setUser('Ilyess');
        closeIdentityModal(identityModal);
      });
    }
  }
}

function setUser(name) {
  currentUser = name;
  localStorage.setItem('cosmiclove_user', name);
  localStorage.setItem('identity', name);
  showToast(`Bienvenue dans notre coin, ${name} 🤍`);
}

function closeIdentityModal(modal) {
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { modal.style.display = 'none'; }, 300);
}

// ==========================================================================
// AMBIENT LAYER - PREMIUM FLOATING ELEMENTS
// ==========================================================================
function initAmbientLayer() {
  const layer = document.createElement('div');
  layer.className = 'ambient-layer';
  layer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
  `;
  document.body.appendChild(layer);

  const shapes = ['🤍', '✨', '💕', '⭐', '🌸'];
  const PIECE_COUNT = 20;

  for (let i = 0; i < PIECE_COUNT; i++) {
    const piece = document.createElement('span');
    piece.className = 'ambient-piece';
    piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];

    const size = (Math.random() * 16 + 12).toFixed(1);
    const startX = (Math.random() * 100).toFixed(1);
    const driftMid = (Math.random() * 80 - 40).toFixed(0) + 'px';
    const driftEnd = (Math.random() * 120 - 60).toFixed(0) + 'px';
    const spinMid = (Math.random() * 60 - 30).toFixed(0) + 'deg';
    const spinEnd = (Math.random() * 120 - 60).toFixed(0) + 'deg';
    const duration = (Math.random() * 16 + 18).toFixed(1) + 's';
    const delay = (Math.random() * -35).toFixed(1) + 's';
    const opacity = (Math.random() * 0.4 + 0.25).toFixed(2);

    piece.style.cssText = `
      position: fixed;
      left: ${startX}vw;
      bottom: -50px;
      font-size: ${size}px;
      opacity: ${opacity};
      pointer-events: none;
      animation: ambientRise ${duration} linear ${delay} infinite;
      --drift-mid: ${driftMid};
      --drift-end: ${driftEnd};
      --spin-mid: ${spinMid};
      --spin-end: ${spinEnd};
    `;

    layer.appendChild(piece);
  }
}

// Add ambient rise animation to stylesheet
const style = document.createElement('style');
style.textContent = `
  @keyframes ambientRise {
    0% {
      transform: translateY(0) translateX(0) rotate(0deg);
      opacity: 0;
    }
    5% {
      opacity: var(--piece-opacity, 0.5);
    }
    25% {
      transform: translateY(-25vh) translateX(var(--drift-mid, 0)) rotate(var(--spin-mid, 0deg));
    }
    75% {
      transform: translateY(-75vh) translateX(var(--drift-end, 0)) rotate(var(--spin-end, 0deg));
      opacity: var(--piece-opacity, 0.5);
    }
    100% {
      transform: translateY(-100vh) translateX(var(--drift-end, 0)) rotate(var(--spin-end, 0deg));
      opacity: 0;
    }
  }

  .ambient-piece {
    --piece-opacity: 0.5;
  }
`;
document.head.appendChild(style);

// ==========================================================================
// SOUND EFFECTS - PREMIUM BELL-LIKE TONES
// ==========================================================================
let audioCtx = null;
let soundEnabled = localStorage.getItem('cosmiclove_sound') !== 'off';

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playNote({ freq, duration = 0.22, type = 'sine', startTime = 0, volume = 0.1, glideTo = null }) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + startTime + duration * 0.8);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration + 0.05);
  } catch (err) {
    console.error('Sound error:', err);
  }
}

function playPop() {
  playNote({ freq: 740, duration: 0.14, type: 'sine', volume: 0.08 });
  playNote({ freq: 988, duration: 0.16, type: 'sine', volume: 0.06, startTime: 0.05 });
}

function playChime() {
  playNote({ freq: 523.25, duration: 0.3, type: 'triangle', volume: 0.09, startTime: 0 });
  playNote({ freq: 659.25, duration: 0.3, type: 'triangle', volume: 0.09, startTime: 0.14 });
  playNote({ freq: 987.77, duration: 0.45, type: 'triangle', volume: 0.1, startTime: 0.28 });
}

function playPing() {
  playNote({ freq: 880, glideTo: 1320, duration: 0.22, type: 'sine', volume: 0.07 });
}

function playVinylStart() {
  playNote({ freq: 392, duration: 0.18, type: 'triangle', volume: 0.06 });
  playNote({ freq: 523.25, duration: 0.16, type: 'sine', volume: 0.05, startTime: 0.05 });
}

function playPin() {
  playNote({ freq: 660, glideTo: 500, duration: 0.09, type: 'triangle', volume: 0.07 });
}

function playButtonClick() {
  playNote({ freq: 800, duration: 0.12, type: 'sine', volume: 0.08 });
  playNote({ freq: 1000, duration: 0.1, type: 'sine', volume: 0.06, startTime: 0.08 });
}

function initSoundToggle() {
  const btn = document.getElementById('sound-toggle-btn');
  if (!btn) return;
  function render() {
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    btn.classList.toggle('muted', !soundEnabled);
  }
  render();
  btn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('cosmiclove_sound', soundEnabled ? 'on' : 'off');
    render();
    if (soundEnabled) playPop();
  });
}

// ==========================================================================
// LIVE DISTANCE - REAL GEOLOCATION
// ==========================================================================
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`, {
      headers: { 'Accept-Language': 'fr' }
    });
    const data = await res.json();
    return data?.address?.town || data?.address?.city || data?.address?.village || data?.address?.county || null;
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    return null;
  }
}

let myLastGeocodedAt = 0;

// Default fixed positions (Tunisia) used until GPS activates
const DEFAULT_POSITIONS = {
  Chayma: { lat: 34.6867, lng: 9.1022,  city: 'Regueb' },       // Regueb, Sidi Bouzid
  Ilyess:  { lat: 35.8808, lng: 10.5396, city: 'Kalâa Kebira' }  // Kalâa Kebira, Sousse
};

function initLiveDistance() {
  const btn      = document.getElementById('enable-location-btn');
  const statusEl = document.getElementById('location-status');
  if (!document.getElementById('love-map')) return;

  const user      = getUser();
  const otherUser = user === 'Chayma' ? 'Ilyess' : 'Chayma';
  const positions = {
    Chayma: { ...DEFAULT_POSITIONS.Chayma },
    Ilyess:  { ...DEFAULT_POSITIONS.Ilyess }
  };

  // ── Leaflet map setup ──────────────────────────────────────────────────
  if (typeof L === 'undefined') return; // Leaflet not loaded yet

  const map = L.map('love-map', {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false
  });

  // Pastel cute tile layer (standard OSM tiles - more reliable than 3rd-party CDNs)
  const pastelFallbackTile = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23FCE4EC'/%3E%3C/svg%3E";
  const tileLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap',
    errorTileUrl: pastelFallbackTile // never show a broken/hashed tile - instant pastel fallback instead
  }).addTo(map);

  const mapEl = document.getElementById('love-map');
  if (mapEl) {
    mapEl.classList.add('map-loading');
    map.whenReady(() => mapEl.classList.remove('map-loading'));
    setTimeout(() => mapEl.classList.remove('map-loading'), 1500); // never wait more than 1.5s, no matter what
  }

  // Heart icon factory
  function heartIcon(color) {
    return L.divIcon({
      className: '',
      html: `<div class="heart-marker-icon" style="color:${color};">💗</div>`,
      iconSize:   [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -36]
    });
  }

  const markerC = L.marker(
    [positions.Chayma.lat, positions.Chayma.lng],
    { icon: heartIcon('#FF6FA8') }
  ).addTo(map).bindPopup('<b>Chayma</b><br>' + positions.Chayma.city);

  const markerI = L.marker(
    [positions.Ilyess.lat, positions.Ilyess.lng],
    { icon: heartIcon('#C06AC4') }
  ).addTo(map).bindPopup('<b>Ilyess</b><br>' + positions.Ilyess.city);

  // Dashed line connecting the two
  let loveLine = L.polyline(
    [[positions.Chayma.lat, positions.Chayma.lng],
     [positions.Ilyess.lat, positions.Ilyess.lng]],
    { color: '#FF6FA8', weight: 2, opacity: 0.6, dashArray: '8 8' }
  ).addTo(map);

  // Fit map to show both markers with padding
  function fitMap() {
    const bounds = L.latLngBounds(
      [positions.Chayma.lat, positions.Chayma.lng],
      [positions.Ilyess.lat, positions.Ilyess.lng]
    );
    map.fitBounds(bounds, { padding: [40, 40] });
  }
  fitMap();

  // ── Stats updater ──────────────────────────────────────────────────────
  function recalcAndRender() {
    const c = positions.Chayma;
    const i = positions.Ilyess;
    const distKm = haversineKm(c.lat, c.lng, i.lat, i.lng);

    const distEl = document.getElementById('live-distance-value');
    const timeEl = document.getElementById('live-time-value');
    if (distEl) distEl.textContent = `${distKm.toFixed(0)} km`;
    if (timeEl) {
      const h = Math.floor(distKm / 75);
      const m = Math.round((distKm / 75 - h) * 60);
      timeEl.textContent = `${h}h ${String(m).padStart(2,'0')}m`;
    }

    // Update widget subtitle
    const desc = document.getElementById('distance-widget-desc');
    if (desc) desc.textContent = `${c.city || 'Chayma'} ↔ ${i.city || 'Ilyess'}`;

    // Update line + markers
    markerC.setLatLng([c.lat, c.lng]).bindPopup(`<b>Chayma</b><br>${c.city || ''}`);
    markerI.setLatLng([i.lat, i.lng]).bindPopup(`<b>Ilyess</b><br>${i.city || ''}`);
    loveLine.setLatLngs([[c.lat, c.lng], [i.lat, i.lng]]);
    fitMap();
  }

  // ── Firestore listener — both users' live positions ────────────────────
  onSnapshot(collection(db, 'locations'), (snapshot) => {
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (positions[docSnap.id]) {
        positions[docSnap.id] = { ...positions[docSnap.id], ...data };
      }
    });
    recalcAndRender();
  });

  // ── Share my position button ───────────────────────────────────────────
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (!navigator.geolocation) {
      if (statusEl) statusEl.textContent = "Géolocalisation non supportée 😕";
      return;
    }
    if (statusEl) statusEl.textContent = "Localisation en cours… 🔍";
    btn.disabled = true;

    navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const now = Date.now();
        let city = positions[user]?.city;
        if (!city || now - myLastGeocodedAt > 5 * 60 * 1000) {
          const geocoded = await reverseGeocode(lat, lng);
          if (geocoded) { city = geocoded; myLastGeocodedAt = now; }
        }
        positions[user] = { lat, lng, city: city || positions[user]?.city || null };
        await setDoc(doc(db, 'locations', user),
          { lat, lng, city: city || null, updatedAt: now },
          { merge: true }
        );
        if (statusEl) statusEl.textContent = `📍 Position partagée${city ? ` — ${city}` : ''} 💕`;
        btn.textContent = '📍 Position active';
      },
      (err) => {
        console.error('Geolocation error:', err);
        if (statusEl) statusEl.textContent = "Active la localisation dans les réglages du navigateur 😕";
        btn.disabled = false;
      },
      { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 }
    );
  });
}

// ==========================================================================
// PREMIUM BUTTON INTERACTIONS
// ==========================================================================
function addButtonInteractions() {
  const buttons = document.querySelectorAll('button:not(.nav-tab)');
  buttons.forEach(button => {
    button.addEventListener('mousedown', function() {
      this.style.transform = 'scale(0.97)';
    });
    button.addEventListener('mouseup', function() {
      this.style.transform = 'scale(1)';
    });
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1)';
    });
  });
}

// ==========================================================================
// TAB NAVIGATION WITH SMOOTH TRANSITIONS
// ==========================================================================
function initTabNavigation() {
  const navTabs = document.querySelectorAll('.nav-tab');
  const footerTabLinks = document.querySelectorAll('.footer-tab-link');
  const tabViews = document.querySelectorAll('.tab-view');

  function switchTab(targetViewId) {
    navTabs.forEach(t => t.classList.remove('active'));
    tabViews.forEach(v => v.classList.remove('active'));

    const targetView = document.getElementById(targetViewId);
    if (targetView) {
      targetView.classList.add('active');
      playPing();
    }

    navTabs.forEach(tab => {
      if (tab.getAttribute('data-target') === targetViewId) {
        tab.classList.add('active');
      }
    });

    const navbar = document.getElementById('navbar');
    if (navbar) navbar.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-target')));
  });

  footerTabLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('data-target');
      if (target) {
        e.preventDefault();
        switchTab(target);
      }
    });
  });
}

// ==========================================================================
// COUNTDOWN TIMER GATE LOGIC - PREMIUM EDITION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  initAmbientLayer();
  initLiveDistance();
  initSoundToggle();
  addButtonInteractions();
  initTabNavigation();

  // Countdown to the real birthday: August 9, midnight (Tunis time)
  const targetDate = new Date('2026-08-09T00:00:00+01:00');

  let timerInterval = null;
  let clickCount = 0;

  function updateCountdownGate() {
    const now = new Date();
    let diff = targetDate - now;

    const setElemText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    if (diff <= 0) {
      if (timerInterval) clearInterval(timerInterval);

      setElemText('gate-days', '00');
      setElemText('gate-hours', '00');
      setElemText('gate-minutes', '00');
      setElemText('gate-seconds', '00');

      const gateWrap = document.getElementById('gate-countdown-wrap');
      const padlockWrap = document.getElementById('padlock-wrapper');

      if (gateWrap) {
        gateWrap.style.display = 'none';
      }
      if (padlockWrap) {
        padlockWrap.classList.add('visible');
        padlockWrap.style.display = 'flex';
      }
      // NOTE: le cadenas ne s'ouvre plus tout seul ici — il attend un vrai clic
      // (+ le bon code) pour préserver la surprise. Voir plus bas.
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num) => String(num).padStart(2, '0');

    setElemText('gate-days', pad(days));
    setElemText('gate-hours', pad(hours));
    setElemText('gate-minutes', pad(minutes));
    setElemText('gate-seconds', pad(seconds));
  }

  updateCountdownGate();
  timerInterval = setInterval(updateCountdownGate, 1000);

  // ==========================================================================
  // HEART PADLOCK UNLOCKING & CONFETTI EXPLOSION
  // ==========================================================================
  const padlock = document.getElementById('main-padlock');
  const gateOverlay = document.getElementById('countdown-gate');
  const mainContent = document.getElementById('main-content');
  const countdownWidget = document.getElementById('gate-countdown');

  // Le bypass de test (5 clics = simuler minuit) n'est actif QUE si on ouvre
  // le site avec ?test=1 dans l'URL. Sans ça, personne ne peut sauter le compteur.
  const isTestMode = new URLSearchParams(window.location.search).get('test') === '1';
  const testHint = document.getElementById('test-bypass-hint');
  if (isTestMode && testHint) testHint.style.display = 'block';

  if (countdownWidget && isTestMode) {
    countdownWidget.addEventListener('click', () => {
      clickCount++;
      playPop();
      if (clickCount >= 5) {
        targetDate.setTime(Date.now());
        updateCountdownGate();
      }
    });
  }

  // ==========================================================================
  // ACCESS CODE GATE - le vrai verrou avant l'animation d'ouverture
  // ==========================================================================
  // ⚠️ CHAYMA : change ce code avant de déployer (ex: une date qui compte pour vous deux)
  const ACCESS_CODE = '0104';
  const ACCESS_STORAGE_KEY = 'cosmiclove_access_granted';

  function runUnlockSequence() {
    const padlockContainer = padlock.parentElement;
    if (!padlockContainer || padlockContainer.classList.contains('unlocked')) return;

    padlockContainer.classList.add('unlocking');
    playChime();

    setTimeout(() => {
      padlockContainer.classList.remove('unlocking');
      padlockContainer.classList.add('unlocked');
      createConfetti();

      setTimeout(() => {
        gateOverlay.classList.add('fade-out');
        setTimeout(() => {
          gateOverlay.style.display = 'none';
          mainContent.style.display = 'block';
          mainContent.classList.add('visible');
          mainContent.offsetHeight;
          playVinylStart();
          initIdentity(); // ask "who are you" only now, after the gate/PIN is fully done
        }, 400);
      }, 800);
    }, 500);
  }

  const accessModal = document.getElementById('access-code-modal');
  const accessForm = document.getElementById('access-code-form');
  const accessInput = document.getElementById('access-code-input');
  const accessError = document.getElementById('access-code-error');
  const accessCloseBtn = document.getElementById('access-code-close');

  function openAccessModal() {
    if (!accessModal) return;
    accessModal.style.display = 'flex';
    accessModal.offsetHeight;
    accessModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (accessInput) {
      accessInput.value = '';
      setTimeout(() => accessInput.focus(), 300);
    }
  }

  function closeAccessModal() {
    if (!accessModal) return;
    accessModal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { accessModal.style.display = 'none'; }, 300);
  }

  if (accessForm) {
    accessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = (accessInput.value || '').trim();
      if (value === ACCESS_CODE) {
        try { localStorage.setItem(ACCESS_STORAGE_KEY, '1'); } catch (err) {}
        closeAccessModal();
        runUnlockSequence();
      } else {
        playPop();
        if (accessError) accessError.textContent = 'Ce n\'est pas le bon code… réessaie 🤍';
        accessForm.classList.add('shake');
        setTimeout(() => accessForm.classList.remove('shake'), 400);
      }
    });
  }

  // Escape hatch — this popup must NEVER be able to get stuck blocking the whole site
  if (accessCloseBtn) {
    accessCloseBtn.addEventListener('click', closeAccessModal);
  }
  if (accessModal) {
    accessModal.addEventListener('click', (e) => {
      if (e.target === accessModal) closeAccessModal(); // clicked the dark backdrop, not the card
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal-backdrop.open').forEach((openModal) => {
      openModal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        if (!openModal.classList.contains('open')) openModal.style.display = 'none';
      }, 300);
    });
  });

  if (padlock) {
    padlock.addEventListener('click', () => {
      const padlockContainer = padlock.parentElement;
      if (!padlockContainer || padlockContainer.classList.contains('unlocked')) return;

      let alreadyGranted = false;
      try { alreadyGranted = localStorage.getItem(ACCESS_STORAGE_KEY) === '1'; } catch (err) {}

      if (alreadyGranted) {
        runUnlockSequence();
      } else {
        openAccessModal();
      }
    });
  }

  // ==========================================================================
  // CONFETTI EXPLOSION - PREMIUM CELEBRATION
  // ==========================================================================
  function createConfetti() {
    const confettiCount = 60;
    const colors = ['#FF6FA8', '#FFB6D0', '#D4547E', '#FFD6E8', '#FFF0F5'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'garland-particle';
      
      const size = Math.random() * 8 + 4;
      const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
      const startY = window.innerHeight / 2;
      const endX = startX + (Math.random() - 0.5) * 400;
      const endY = window.innerHeight + 100;
      const duration = Math.random() * 2 + 2;
      const delay = Math.random() * 0.3;
      const rotation = Math.random() * 720;

      confetti.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: 50%;
        pointer-events: none;
        z-index: 599;
        animation: confettiFall ${duration}s ease-in ${delay}s forwards;
        --end-x: ${endX}px;
        --end-y: ${endY}px;
        --rotation: ${rotation}deg;
      `;

      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), (duration + delay) * 1000);
    }
  }

  // Add confetti animation
  const confettiStyle = document.createElement('style');
  confettiStyle.textContent = `
    @keyframes confettiFall {
      0% {
        transform: translate(0, 0) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translate(calc(var(--end-x) - 50%), calc(var(--end-y) - 50%)) rotate(var(--rotation));
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(confettiStyle);

  initContentModules();
});

// ==========================================================================
// CONTENT MODULES — Gallery, Dreams, Playlist, Emotions Extras, Univers
// (ported from the complete previous version, kept feature-identical)
// ==========================================================================
function initContentModules() {

  // ---- 5. PHOTO GALLERY (Cloudinary upload + Firestore) ----
  const uploadModal = document.getElementById('upload-modal');
  const addPhotoBtn = document.getElementById('add-photo-btn');
  const uploadModalClose = document.getElementById('upload-modal-close');
  const uploadForm = document.getElementById('upload-form');
  const uploadFile = document.getElementById('upload-file');
  const fileChosen = document.getElementById('file-chosen');
  const uploadPreview = document.getElementById('upload-preview');
  const uploadPreviewContainer = document.getElementById('upload-preview-container');
  const polaroidGridWrapper = document.getElementById('polaroid-grid-wrapper');
  const MAX_PHOTOS = 250;
  let photosCache = {};

  if (addPhotoBtn && uploadModal) {
    addPhotoBtn.addEventListener('click', () => {
      uploadModal.style.display = 'flex';
      uploadModal.offsetHeight;
      uploadModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeUploadModal() {
    if (!uploadModal) return;
    uploadModal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!uploadModal.classList.contains('open')) {
        uploadModal.style.display = 'none';
        if (uploadForm) uploadForm.reset();
        if (fileChosen) fileChosen.textContent = "Aucun fichier choisi";
        if (uploadPreviewContainer) uploadPreviewContainer.style.display = 'none';
        if (uploadPreview) uploadPreview.src = "";
      }
    }, 300);
  }

  if (uploadModalClose) uploadModalClose.addEventListener('click', closeUploadModal);
  if (uploadModal) {
    uploadModal.addEventListener('click', (e) => {
      if (e.target === uploadModal) closeUploadModal();
    });
  }

  if (uploadFile) {
    uploadFile.addEventListener('change', () => {
      const file = uploadFile.files[0];
      if (file) {
        fileChosen.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadPreview.src = e.target.result;
          uploadPreviewContainer.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = uploadFile.files[0];
      const caption = document.getElementById('upload-caption').value.trim();
      const tag = document.getElementById('upload-tag').value.trim();

      if (!file || !caption || !tag) return;

      if (Object.keys(photosCache).length >= MAX_PHOTOS) {
  showToast(`Notre galerie est complète (${MAX_PHOTOS}/${MAX_PHOTOS}) — supprime un souvenir avant d'en ajouter un nouveau 🤍`, true);
  return;
}

      const cloudName = 'zwrchxbf';
      const uploadPreset = 'cosmiclove_unsigned';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const submitBtn = uploadForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Envoi vers les étoiles... ✨';
      submitBtn.disabled = true;

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Erreur Cloudinary');

        const imageUrl = data.secure_url;

        await addDoc(collection(db, 'photos'), {
          src: imageUrl,
          caption: caption,
          tag: tag,
          addedBy: getUser(),
          favoritedBy: [],
          createdAt: Date.now()
        });

        showToast('Souvenir ajouté avec succès ! ✨');
        closeUploadModal();
      } catch (err) {
        console.error('Error uploading photo:', err);
        const msg = err.message && err.message.includes('preset')
          ? 'Upload preset introuvable — crée "cosmiclove_unsigned" dans ton dashboard Cloudinary (Settings → Upload → Unsigned) 🛠️'
          : 'Oups, un nuage cosmique bloque l\'envoi… Vérifie ta connexion et réessaie 🌧️';
        showToast(msg, true);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  function renderGallery() {
  if (!polaroidGridWrapper) return;
  const photos = Object.values(photosCache).sort((a, b) => a.createdAt - b.createdAt);

  const slotsStatus = document.getElementById('gallery-slots-status');
  if (slotsStatus) slotsStatus.textContent = `${photos.length}/${MAX_PHOTOS} souvenirs`;

  polaroidGridWrapper.innerHTML = '';

  photos.forEach(p => {
    const isFav = (p.favoritedBy || []).includes(getUser());
    const card = document.createElement('div');
    card.className = 'masonry-card';
    card.id = p.id;
    card.innerHTML = `
      <img src="${escapeHTML(p.src)}" alt="${escapeHTML(p.caption)}" onerror="handleImageError(this)">
      <button class="masonry-delete-btn" data-id="${p.id}" title="Supprimer ce souvenir">&times;</button>
      <button class="masonry-heart-btn${isFav ? ' active' : ''}" data-id="${p.id}" title="Favori">${isFav ? '❤️' : '🤍'}</button>
      <div class="masonry-overlay">
        <div class="masonry-caption">${escapeHTML(p.caption)}</div>
        <div class="masonry-tag">${escapeHTML(p.tag || '')}</div>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.masonry-heart-btn') || e.target.closest('.masonry-delete-btn')) return;
      openLightbox(p.src, p.caption, p.id);
    });
    polaroidGridWrapper.appendChild(card);
  });
}

  if (polaroidGridWrapper) {
    polaroidGridWrapper.addEventListener('click', async (e) => {
      const heartBtn = e.target.closest('.masonry-heart-btn');
      if (heartBtn) {
        e.stopPropagation();
        const id = heartBtn.getAttribute('data-id');
        const docRef = doc(db, 'photos', id);
        if (heartBtn.classList.contains('active')) {
          await updateDoc(docRef, { favoritedBy: arrayRemove(getUser()) });
        } else {
          playPop();
          await updateDoc(docRef, { favoritedBy: arrayUnion(getUser()) });
        }
        return;
      }
      const delBtn = e.target.closest('.masonry-delete-btn');
      if (delBtn) {
        e.stopPropagation();
        deletePhoto(delBtn.getAttribute('data-id'));
      }
    });
  }

  async function deletePhoto(photoId) {
    if (confirm("Voulez-vous vraiment supprimer ce souvenir ?")) {
      try {
        await deleteDoc(doc(db, 'photos', photoId));
        showToast('Souvenir effacé ✨');
      } catch (err) {
        console.error(err);
        showToast('Erreur lors de la suppression', true);
      }
    }
  }

  // ---- Favorites side panel ----
  const favPanelToggleBtn = document.getElementById('fav-panel-toggle-btn');
  const favPanelOverlay = document.getElementById('fav-panel-overlay');
  const favPanelClose = document.getElementById('fav-panel-close');
  const favPanelList = document.getElementById('fav-panel-list');

  function renderFavPanel() {
    const badge = document.getElementById('fav-count-badge');
    const countEl = document.getElementById('fav-panel-count');
    if (!favPanelList) return;

    const myFavs = Object.values(photosCache).filter(p => (p.favoritedBy || []).includes(getUser()));

    if (badge) {
      badge.style.display = myFavs.length > 0 ? 'inline' : 'none';
      badge.textContent = myFavs.length || '';
    }
    if (countEl) countEl.textContent = myFavs.length ? `(${myFavs.length})` : '';

    if (myFavs.length === 0) {
      favPanelList.innerHTML = '<div class="fav-panel-empty">Aucun favori encore… clique sur 🤍 sur une photo 💕</div>';
      return;
    }

    favPanelList.innerHTML = '';
    myFavs.forEach((p) => {
      const item = document.createElement('div');
      item.className = 'fav-panel-item';
      item.innerHTML = `
        <img src="${escapeHTML(p.src)}" alt="${escapeHTML(p.caption)}" data-id="${p.id}">
        <div class="fav-panel-item-info">
          <div class="fav-panel-item-caption">${escapeHTML(p.caption)}</div>
          <div class="fav-panel-item-tag">${escapeHTML(p.tag || '')}</div>
        </div>
        <button class="fav-panel-item-remove" data-id="${p.id}" title="Retirer des favoris">🤍</button>
      `;
      favPanelList.appendChild(item);
    });
  }

  if (favPanelToggleBtn && favPanelOverlay) {
    favPanelToggleBtn.addEventListener('click', () => favPanelOverlay.classList.add('open'));
  }
  if (favPanelClose && favPanelOverlay) {
    favPanelClose.addEventListener('click', () => favPanelOverlay.classList.remove('open'));
  }
  if (favPanelOverlay) {
    favPanelOverlay.addEventListener('click', (e) => {
      if (e.target === favPanelOverlay) favPanelOverlay.classList.remove('open');
    });
  }
  if (favPanelList) {
    favPanelList.addEventListener('click', async (e) => {
      const img = e.target.closest('img');
      if (img) {
        const p = photosCache[img.getAttribute('data-id')];
        if (p) {
          favPanelOverlay.classList.remove('open');
          openLightbox(p.src, p.caption, p.id);
        }
        return;
      }
      const removeBtn = e.target.closest('.fav-panel-item-remove');
      if (removeBtn) {
        await updateDoc(doc(db, 'photos', removeBtn.getAttribute('data-id')), { favoritedBy: arrayRemove(getUser()) });
      }
    });
  }

  onSnapshot(collection(db, 'photos'), (snapshot) => {
    photosCache = {};
    snapshot.forEach((docSnap) => {
      photosCache[docSnap.id] = { id: docSnap.id, ...docSnap.data() };
    });
    renderGallery();
    renderFavPanel();
  });

  // ---- 5b. LIGHTBOX ----
  const lightbox = document.getElementById('lightbox-overlay');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxFavBtn = document.getElementById('lightbox-fav-btn');
  const lightboxCommentForm = document.getElementById('lightbox-comment-form');
  const lightboxCommentInput = document.getElementById('lightbox-comment-input');
  const lightboxCommentsList = document.getElementById('lightbox-comments-list');
  let currentLightboxPhotoId = '';
  let zoomScale = 1;
  let zoomX = 0, zoomY = 0;
  let isPanning = false, panStartX = 0, panStartY = 0;

  function resetZoom() {
    zoomScale = 1;
    zoomX = 0;
    zoomY = 0;
    if (lightboxImg) {
      lightboxImg.style.transform = 'translate(0px, 0px) scale(1)';
      lightboxImg.classList.remove('zoomed');
    }
  }

  function applyZoomTransform() {
    lightboxImg.style.transform = `translate(${zoomX}px, ${zoomY}px) scale(${zoomScale})`;
    lightboxImg.classList.toggle('zoomed', zoomScale > 1);
  }

  if (lightboxImg) {
    // Click to toggle between normal size and 2.5x zoom
    lightboxImg.addEventListener('click', (e) => {
      if (isPanning) return; // avoid toggling right after a drag
      if (zoomScale === 1) {
        zoomScale = 2.5;
      } else {
        zoomScale = 1;
        zoomX = 0;
        zoomY = 0;
      }
      applyZoomTransform();
    });

    // Scroll wheel to fine-tune zoom
    lightboxImg.addEventListener('wheel', (e) => {
      e.preventDefault();
      zoomScale += (e.deltaY < 0 ? 0.2 : -0.2);
      zoomScale = Math.min(Math.max(zoomScale, 1), 4);
      if (zoomScale === 1) { zoomX = 0; zoomY = 0; }
      applyZoomTransform();
    }, { passive: false });

    // Drag to pan around when zoomed in
    lightboxImg.addEventListener('mousedown', (e) => {
      if (zoomScale === 1) return;
      isPanning = true;
      panStartX = e.clientX - zoomX;
      panStartY = e.clientY - zoomY;
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      zoomX = e.clientX - panStartX;
      zoomY = e.clientY - panStartY;
      applyZoomTransform();
    });
    window.addEventListener('mouseup', () => {
      setTimeout(() => { isPanning = false; }, 0);
    });
  }

  function openLightbox(src, caption, photoId) {
    if (!lightbox) return;
    currentLightboxPhotoId = photoId;
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
    resetZoom();
    lightbox.style.display = 'flex';
    lightbox.offsetHeight;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';

    updateFavButton();
    loadComments();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    resetZoom();
    setTimeout(() => {
      if (!lightbox.classList.contains('open')) {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
        currentLightboxPhotoId = '';
      }
    }, 300);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  async function updateFavButton() {
    if (!lightboxFavBtn) return;
    lightboxFavBtn.classList.remove('active');
    lightboxFavBtn.textContent = '🤍 Marquer favori';
    if (!currentLightboxPhotoId) return;

    const docRef = doc(db, 'photos', currentLightboxPhotoId);
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && currentLightboxPhotoId === docSnap.id) {
        const data = docSnap.data();
        const favs = data.favoritedBy || [];
        if (favs.includes(getUser())) {
          lightboxFavBtn.classList.add('active');
          lightboxFavBtn.textContent = '❤️ Favori';
        } else {
          lightboxFavBtn.classList.remove('active');
          lightboxFavBtn.textContent = '🤍 Marquer favori';
        }
      }
    });
  }

  if (lightboxFavBtn) {
    lightboxFavBtn.addEventListener('click', async () => {
      const docRef = doc(db, 'photos', currentLightboxPhotoId);
      if (lightboxFavBtn.classList.contains('active')) {
        await updateDoc(docRef, { favoritedBy: arrayRemove(getUser()) });
      } else {
        playPop();
        await updateDoc(docRef, { favoritedBy: arrayUnion(getUser()) });
      }
    });
  }

  let unsubscribeComments = null;
  function loadComments() {
    if (!lightboxCommentsList) return;
    lightboxCommentsList.innerHTML = '<p class="no-comments">Chargement...</p>';
    if (unsubscribeComments) unsubscribeComments();
    unsubscribeComments = onSnapshot(collection(db, `photos/${currentLightboxPhotoId}/comments`), (snapshot) => {
      if (snapshot.empty) {
        lightboxCommentsList.innerHTML = '<p class="no-comments">Aucun commentaire encore… ajoute le premier 💕</p>';
        return;
      }
      lightboxCommentsList.innerHTML = '';
      const comments = [];
      snapshot.forEach(d => comments.push({ id: d.id, ...d.data() }));
      comments.sort((a, b) => a.createdAt - b.createdAt).forEach((c) => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        div.innerHTML = `<span class="comment-text"><strong>${escapeHTML(c.author)} :</strong> ${escapeHTML(c.text)}</span>`;
        lightboxCommentsList.appendChild(div);
      });
    });
  }

  if (lightboxCommentForm) {
    lightboxCommentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = lightboxCommentInput.value.trim();
      if (!text) return;
      await addDoc(collection(db, `photos/${currentLightboxPhotoId}/comments`), {
        text: text,
        author: getUser(),
        createdAt: Date.now()
      });
      lightboxCommentInput.value = '';
    });
  }

  // ---- 6. DREAMS & COMMON POINTS (scrapbook) ----
  const dreamForm = document.getElementById('dream-form');
  const dreamInput = document.getElementById('dream-input');
  const dreamCategory = document.getElementById('dream-category');
  const dreamsList = document.getElementById('dreams-list');

  function addDreamToDOM(dreamObj, prepend) {
    if (!dreamsList) return;
    let card = document.getElementById(dreamObj.id);
    const exists = !!card;
    if (!card) {
      card = document.createElement('div');
      card.className = 'scrap-ticket';
      card.id = dreamObj.id;
    }
    const category = dreamObj.category || 'reve';
    const emoji = category === 'commun' ? '💞' : category === 'voyage' ? '✈️' : '✨';
    const tagLabel = category === 'commun' ? 'point commun' : category === 'voyage' ? 'voyage' : 'rêve';
    card.innerHTML = `
      <div class="washi-tape ${category}"></div>
      <button class="scrap-delete-btn" data-id="${dreamObj.id}" title="Supprimer">&times;</button>
      <div class="scrap-emoji">${emoji}</div>
      <div class="scrap-text">${escapeHTML(dreamObj.text)}</div>
      <div class="scrap-meta">${escapeHTML(tagLabel)} · ${escapeHTML(dreamObj.date || '')} · ${escapeHTML(dreamObj.author || '')}</div>
    `;
    if (!exists) {
      playPop();
      if (prepend) dreamsList.insertBefore(card, dreamsList.firstChild);
      else dreamsList.appendChild(card);
    }
  }

  if (dreamForm) {
    dreamForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = dreamInput.value.trim();
      if (!text) return;
      await addDoc(collection(db, 'dreams'), {
        text: text,
        category: dreamCategory.value,
        author: getUser(),
        date: new Date().toLocaleDateString('fr-FR'),
        createdAt: Date.now()
      });
      dreamForm.reset();
    });
  }

  if (dreamsList) {
    dreamsList.addEventListener('click', async (e) => {
      if (e.target.classList.contains('scrap-delete-btn')) {
        await deleteDoc(doc(db, 'dreams', e.target.getAttribute('data-id')));
      }
    });
  }

  onSnapshot(collection(db, 'dreams'), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      const data = change.doc.data();
      const dreamObj = { id: change.doc.id, ...data };
      if (change.type === 'added' || change.type === 'modified') addDreamToDOM(dreamObj, true);
      if (change.type === 'removed') { const card = document.getElementById(change.doc.id); if (card) card.remove(); }
    });
  });

  // ---- 7. SURPRISE MODAL ----
  const modal = document.getElementById('surprise-modal');
  const footerSurpriseBtn = document.getElementById('footer-surprise-btn');
  const modalCloseBtn = document.getElementById('modal-close');

  // Multi-step surprise elements
  const surpriseStep1 = document.getElementById('surprise-step-1');
  const surpriseStep2 = document.getElementById('surprise-step-2');
  const surpriseStep3 = document.getElementById('surprise-step-3');
  const surpriseOpenBtn = document.getElementById('surprise-open-btn');
  const surpriseReplyBtn = document.getElementById('surprise-reply-btn');
  const surpriseCloseFinalBtn = document.getElementById('surprise-close-final-btn');
  const envelopeBody = document.getElementById('envelope-body');

  function showStep(stepEl) {
    [surpriseStep1, surpriseStep2, surpriseStep3].forEach(s => {
      if (s) { s.classList.add('surprise-hidden'); s.style.animation = 'none'; }
    });
    if (stepEl) {
      stepEl.classList.remove('surprise-hidden');
      void stepEl.offsetWidth; // reflow to restart CSS animation
      stepEl.style.animation = '';
    }
  }

  function resetModal() {
    // Cancel any in-flight step transition so stale setTimeout can't fire after close
    if (surpriseStepTimer !== null) { clearTimeout(surpriseStepTimer); surpriseStepTimer = null; }
    if (envelopeBody) envelopeBody.classList.remove('opened');
    if (surpriseOpenBtn) surpriseOpenBtn.disabled = false;
    showStep(surpriseStep1);
  }

  function openModal() {
    if (modal) {
      modal.style.display = 'flex';
      modal.offsetHeight; // force reflow so the opacity transition fires correctly
      modal.classList.add('open');
    }
  }

  function closeModal() {
    if (modal) {
      modal.classList.remove('open');
      setTimeout(() => { modal.style.display = 'none'; resetModal(); }, 350);
    }
  }

  if (footerSurpriseBtn) footerSurpriseBtn.addEventListener('click', openModal);
  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  // Single backdrop-click listener
  if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  let surpriseStepTimer = null;

  if (surpriseOpenBtn) {
    surpriseOpenBtn.addEventListener('click', () => {
      if (envelopeBody) envelopeBody.classList.add('opened');
      surpriseOpenBtn.disabled = true;
      surpriseStepTimer = setTimeout(() => {
        surpriseStepTimer = null;
        showStep(surpriseStep2);
        burstHearts();
      }, 500);
    });
  }

  if (surpriseReplyBtn) {
    surpriseReplyBtn.addEventListener('click', () => { showStep(surpriseStep3); burstHearts(); });
  }

  if (surpriseCloseFinalBtn) {
    surpriseCloseFinalBtn.addEventListener('click', closeModal);
  }

  function burstHearts() {
    for (let i = 0; i < 30; i++) createFloatingHeart();
  }

  function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'css-heart';
    heart.style.position = 'fixed';
    heart.style.left = `${Math.random() * 90 + 5}vw`;
    heart.style.bottom = `-50px`;
    document.body.appendChild(heart);
    setTimeout(() => { heart.style.transition = '3s'; heart.style.transform = `translateY(-100vh)`; heart.style.opacity = '0'; }, 50);
    setTimeout(() => heart.remove(), 3500);
  }

  // ---- 8. PLAYLIST — vinyl record player ----
  const playlistForm = document.getElementById('playlist-form');
  const songFan = document.getElementById('song-fan');
  const recordDisc = document.getElementById('record-disc');
  const tonearm = document.getElementById('tonearm');
  const activeSongTitle = document.getElementById('active-song-title');
  const activeSongArtist = document.getElementById('active-song-artist');
  const activeSongNote = document.getElementById('active-song-note');
  const activeSongPlayer = document.getElementById('active-song-player');

  function toEmbedUrl(url) {
    try {
      const u = new URL(url);
      if (u.hostname.includes('open.spotify.com') && !u.pathname.includes('/embed')) {
        // Spotify sometimes shares links like /intl-fr/album/xxx - the embed endpoint 404s on that locale prefix
        const cleanPath = u.pathname.replace(/^\/intl-[a-zA-Z-]+/, '');
        return `https://open.spotify.com/embed${cleanPath}`;
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        return `https://www.youtube.com/embed/${id}`;
      }
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}`;
      }
      return url;
    } catch {
      return url;
    }
  }

  function playSong(data, cardEl) {
    playVinylStart();
    if (activeSongTitle) activeSongTitle.textContent = data.title;
    if (activeSongArtist) activeSongArtist.textContent = data.artist;
    if (activeSongNote) activeSongNote.textContent = data.note || '';

    if (activeSongPlayer) {
      const embedUrl = toEmbedUrl(data.url);
      const isSpotify = embedUrl.includes('spotify.com');
      activeSongPlayer.innerHTML = `<iframe src="${embedUrl}" width="100%" height="${isSpotify ? 152 : 200}" frameborder="0" allow="autoplay; encrypted-media; clipboard-write" allowfullscreen loading="lazy" style="border-radius: 12px;"></iframe>`;
    }

    if (recordDisc) recordDisc.classList.add('spinning');
    if (tonearm) tonearm.classList.add('playing');

    document.querySelectorAll('.song-card.active-card').forEach(el => el.classList.remove('active-card'));
    if (cardEl) cardEl.classList.add('active-card');
  }

  if (playlistForm) {
    playlistForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await addDoc(collection(db, 'playlist'), {
        title: document.getElementById('song-title').value,
        artist: document.getElementById('song-artist').value,
        url: document.getElementById('song-url').value,
        note: document.getElementById('song-note').value,
        author: getUser(),
        createdAt: Date.now()
      });
      playlistForm.reset();
    });
  }

  onSnapshot(collection(db, 'playlist'), (snapshot) => {
    if (!songFan) return;
    songFan.innerHTML = '';

    const songs = [];
    snapshot.forEach((docSnap) => songs.push({ id: docSnap.id, ...docSnap.data() }));
    songs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

    if (songs.length === 0) {
      songFan.innerHTML = '<div class="song-fan-empty">Aucune chanson encore… ajoute la première note de notre histoire 🎵</div>';
      return;
    }

    songs.forEach((data, idx) => {
      const div = document.createElement('div');
      div.className = 'song-card';
      div.innerHTML = `
        <span class="song-track-num">${String(idx + 1).padStart(2, '0')}</span>
        <div class="song-vinyl-icon"><div class="song-vinyl-dot"></div></div>
        <div class="song-card-text">
          <span class="song-card-title">${data.note ? escapeHTML(data.note) : escapeHTML(data.title)}</span>
          <span class="song-card-artist">${escapeHTML(data.title)}</span>
          ${data.artist ? `<span class="song-card-note">${escapeHTML(data.artist)}</span>` : ''}
        </div>
        <button class="song-delete-btn" data-id="${data.id}" title="Supprimer">&times;</button>
      `;
      div.addEventListener('click', (e) => {
        if (e.target.closest('.song-delete-btn')) return;
        playSong(data, div);
      });
      songFan.appendChild(div);
    });
  });

  if (songFan) {
    songFan.addEventListener('click', async (e) => {
      if (e.target.classList.contains('song-delete-btn')) {
        e.stopPropagation();
        await deleteDoc(doc(db, 'playlist', e.target.getAttribute('data-id')));
      }
    });
  }

  // ---- 9. HUMEUR DU MOMENT (replaces baromètre) ----
  const moodPicker   = document.getElementById('mood-picker');
  const moodChaymaEl = document.getElementById('mood-chayma');
  const moodIlyessEl = document.getElementById('mood-ilyess');
  const moodLabelC   = document.getElementById('mood-label-chayma');
  const moodLabelI   = document.getElementById('mood-label-ilyess');

  // Listen for both users' moods in real-time
  onSnapshot(doc(db, 'moods', 'Chayma'), (snap) => {
    if (snap.exists()) {
      const { emoji, label } = snap.data();
      if (moodChaymaEl) { moodChaymaEl.textContent = emoji || '❓'; bumpEl(moodChaymaEl); }
      if (moodLabelC)   moodLabelC.textContent = label || '—';
    }
  });

  onSnapshot(doc(db, 'moods', 'Ilyess'), (snap) => {
    if (snap.exists()) {
      const { emoji, label } = snap.data();
      if (moodIlyessEl) { moodIlyessEl.textContent = emoji || '❓'; bumpEl(moodIlyessEl); }
      if (moodLabelI)   moodIlyessEl && (moodLabelI.textContent = label || '—');
    }
  });

  function bumpEl(el) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 420);
  }

  if (moodPicker) {
    moodPicker.addEventListener('click', async (e) => {
      const btn = e.target.closest('.mood-btn');
      if (!btn) return;
      const emoji = btn.dataset.mood;
      const user  = getUser();
      const label = user === 'Chayma' ? btn.dataset.labelF : btn.dataset.labelM;
      // Highlight selected
      moodPicker.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      try {
        await setDoc(doc(db, 'moods', user), { emoji, label, updatedAt: Date.now() }, { merge: true });
        showToast(`Humeur partagée : ${emoji} ${label} 💕`);
      } catch (err) {
        console.error('Mood save error:', err);
        showToast('Erreur de sauvegarde de l\'humeur', true);
      }
    });
  }

  // ---- 10. CAPSULE TEMPORELLE ----
  const capsuleChest = document.getElementById('capsule-chest');
  const capsuleMessageEl = document.getElementById('capsule-message');
  const capsuleTimerEl = document.getElementById('capsule-timer');
  const capsuleFormContainer = document.getElementById('capsule-form-container');
  const capsuleInput = document.getElementById('capsule-input');
  const capsuleSubmitBtn = document.getElementById('capsule-submit-btn');

  const capsuleDateInput = document.getElementById('capsule-unlock-date');

  function nextFirstOfMonth(from = new Date()) {
    return new Date(from.getFullYear(), from.getMonth() + 1, 1, 0, 0, 0);
  }

  if (capsuleChest) {
    let capsuleData = null;
    let capsuleWasUnlocked = false;

    function renderCapsule() {
      const now = Date.now();
      if (!capsuleData) {
        capsuleChest.classList.remove('unlocked');
        capsuleMessageEl.style.display = 'none';
        capsuleTimerEl.textContent = "Aucun secret scellé pour l'instant";
        capsuleFormContainer.style.display = 'block';
        capsuleWasUnlocked = false;
        return;
      }

      if (now >= capsuleData.unlockDate) {
        if (!capsuleWasUnlocked) playChime();
        capsuleWasUnlocked = true;
        capsuleChest.classList.add('unlocked');
        capsuleMessageEl.style.display = 'block';
        capsuleMessageEl.textContent = `"${capsuleData.message}" — ${capsuleData.sealedBy}`;
        capsuleTimerEl.textContent = "Ouverte ! Scelle un nouveau secret pour le mois prochain 🤍";
        capsuleFormContainer.style.display = 'block';
      } else {
        capsuleWasUnlocked = false;
        capsuleChest.classList.remove('unlocked');
        capsuleMessageEl.style.display = 'none';

        const diffMs = capsuleData.unlockDate - now;
        const totalMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        let parts = [];
        if (days > 0) parts.push(`${days}j`);
        if (days > 0 || hours > 0) parts.push(`${hours}h`);
        parts.push(`${String(minutes).padStart(2, '0')}min`);

        capsuleTimerEl.textContent = `S'ouvre dans : ${parts.join(' ')}`;
        capsuleFormContainer.style.display = 'none';
      }
    }

    onSnapshot(doc(db, 'capsule', 'current'), (docSnap) => {
      capsuleData = docSnap.exists() ? docSnap.data() : null;
      renderCapsule();
    });

    setInterval(renderCapsule, 60 * 1000);

    capsuleChest.addEventListener('click', () => {
      if (!capsuleData || Date.now() < capsuleData.unlockDate) {
        showToast('Pas encore… patience Zawji 🤍');
      }
    });

    if (capsuleSubmitBtn) {
      capsuleSubmitBtn.addEventListener('click', async () => {
        const text = capsuleInput.value.trim();
        if (!text) {
          showToast('Écris quelque chose avant de sceller la capsule', true);
          return;
        }

        let unlockTimestamp;
        const chosenDate = capsuleDateInput ? capsuleDateInput.value : '';
        if (chosenDate) {
          unlockTimestamp = new Date(chosenDate).getTime();
          if (isNaN(unlockTimestamp) || unlockTimestamp <= Date.now()) {
            showToast('Choisis une date dans le futur 🤍', true);
            return;
          }
        } else {
          unlockTimestamp = nextFirstOfMonth().getTime(); // default if no date chosen
        }

        await setDoc(doc(db, 'capsule', 'current'), {
          message: text,
          sealedBy: getUser(),
          sealedAt: Date.now(),
          unlockDate: unlockTimestamp
        });
        capsuleInput.value = '';
        if (capsuleDateInput) capsuleDateInput.value = '';
        showToast('Capsule scellée 🔒');
      });
    }
  }

  // ---- 11. DÉTECTEUR D'ONDES D'AMOUR (RADAR) ----
  // ---- Messages des Étoiles (replaces radar) ----
  const etoileBtn = document.getElementById('etoile-btn');
  const etoileMessage = document.getElementById('etoile-message');
  const etoileCard = document.getElementById('etoile-card');

  const starMessages = [
    "Quelqu'un quelque part pense à toi en ce moment même… et son cœur sourit 💗",
    "Les étoiles murmurent : tu es la plus précieuse de toute la galaxie ✨",
    "Message reçu de très loin : 'kol 3am w enti b 1000 ya a8la ma 3andi' 🌙",
    "Une pensée douce vient de traverser l'univers juste pour toi 🌌",
    "Les constellations s'alignent pour te dire… tu es aimée à l'infini 💫",
    "Signal d'amour capté : quelqu'un compte les heures avant de te revoir 🤍",
    "Les étoiles confirment : vous êtes connectés, peu importe la distance ⭐",
    "Message des étoiles : chaque nuit qu'on partage devient un souvenir éternel 🌠",
    "L'univers entier sait à quel point tu es spéciale… et lui aussi 💕"
  ];

  let lastStarIdx = -1;

  if (etoileBtn && etoileMessage && etoileCard) {
    etoileBtn.addEventListener('click', () => {
      etoileBtn.disabled = true;
      etoileCard.classList.add('etoile-loading');
      etoileMessage.textContent = '✦ Les étoiles cherchent un message pour toi… ✦';

      setTimeout(() => {
        let idx;
        do { idx = Math.floor(Math.random() * starMessages.length); } while (idx === lastStarIdx);
        lastStarIdx = idx;
        etoileCard.classList.remove('etoile-loading');
        etoileCard.classList.add('etoile-reveal');
        etoileMessage.textContent = starMessages[idx];
        playPing();
        setTimeout(() => { etoileCard.classList.remove('etoile-reveal'); etoileBtn.disabled = false; }, 600);
      }, 1400);
    });
  }

  // ---- 12. L'ÉCHO DES MOTS DOUX (CORKBOARD) ----
  const noteForm = document.getElementById('note-form');
  const noteInput = document.getElementById('note-input');
  const corkboard = document.getElementById('corkboard');

  if (noteForm) {
    noteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = noteInput.value.trim();
      if (!text) return;
      playPin();
      await addDoc(collection(db, 'notes'), {
        text,
        author: getUser(),
        createdAt: Date.now()
      });
      noteForm.reset();
    });
  }

  if (corkboard) {
    onSnapshot(collection(db, 'notes'), (snapshot) => {
      const notes = [];
      snapshot.forEach((docSnap) => notes.push({ id: docSnap.id, ...docSnap.data() }));
      notes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

      corkboard.innerHTML = '';
      if (notes.length === 0) {
        corkboard.innerHTML = '<p style="width:100%; text-align:center; color:#8a7a4a; font-family: var(--font-serif); font-style: italic;">Le tableau est encore vide… épingle le premier mot 🤍</p>';
        return;
      }

      notes.forEach((note) => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
          ${escapeHTML(note.text)}
          <span class="note-card-author">— ${escapeHTML(note.author || 'Anon')}</span>
          <button class="note-delete-btn" data-id="${note.id}">&times;</button>
        `;
        corkboard.appendChild(card);
      });
    });

    corkboard.addEventListener('click', async (e) => {
      if (e.target.classList.contains('note-delete-btn')) {
        await deleteDoc(doc(db, 'notes', e.target.getAttribute('data-id')));
      }
    });
  }
}


// ==========================================================================
// PREMIUM UPGRADES — custom cursor · scroll reveal · navbar shrink · starfield
// ==========================================================================

// ── Custom Cursor ──────────────────────────────────────────────────────────
function initCustomCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  // Only on pointer-capable devices
  if (!window.matchMedia('(pointer: fine)').matches) {
    dot.style.display  = 'none';
    ring.style.display = 'none';
    return;
  }

  // Only now hide the native cursor - if we got this far, the custom one actually works
  document.body.classList.add('custom-cursor-active');

  let mx = -100, my = -100; // start off-screen
  let rx = -100, ry = -100;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  // Lag ring for smoothness
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx - 16}px, ${ry - 16}px)`;
    requestAnimationFrame(animRing);
  }
  animRing();

  // Hovering state on interactive elements
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, [role="button"], label, input, select, textarea')) {
      ring.classList.add('hovering');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, [role="button"], label, input, select, textarea')) {
      ring.classList.remove('hovering');
    }
  });
}

// ── Scroll Reveal (IntersectionObserver) ──────────────────────────────────
function initScrollReveal() {
  // Tag elements that should reveal
  const targets = [
    '.section-header',
    '.letter-card',
    '.emotion-widget',
    '.univers-widget',
    '.notes-board-container',
    '.scrapbook-board',
    '.playlist-container',
    '.song-fan',
    '.dream-form',
    '.gallery-actions',
    '.mini-notes-row .mini-note',
    '.keyword-pills-row',
    '.footer-section',
  ];

  targets.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal') &&
          !el.classList.contains('reveal-left') &&
          !el.classList.contains('reveal-right')) {
        el.classList.add('reveal');
        if (i > 0) el.classList.add(`reveal-delay-${Math.min(i, 4)}`);
      }
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach((el) => {
    observer.observe(el);
  });
}

// Re-run scroll reveal when a tab switches (new content becomes visible)
function refreshScrollReveal() {
  document.querySelectorAll('.tab-view.active .reveal:not(.revealed), .tab-view.active .reveal-left:not(.revealed), .tab-view.active .reveal-right:not(.revealed)')
    .forEach((el) => {
      // Give browser a frame to paint the tab, then reveal
      requestAnimationFrame(() => {
        setTimeout(() => el.classList.add('revealed'), 60);
      });
    });
}

// Patch tab navigation to call refreshScrollReveal
const _origSwitchTab = window.__cosmicSwitchTab;
document.addEventListener('cosmicTabSwitch', refreshScrollReveal);

// ── Navbar Shrink on Scroll ────────────────────────────────────────────────
function initNavbarShrink() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const mainEl = document.getElementById('main-content');
  if (!mainEl) return;

  mainEl.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', mainEl.scrollTop > 40);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── Gate Starfield ─────────────────────────────────────────────────────────
function initGateStarfield() {
  const container = document.getElementById('gate-starfield');
  if (!container) return;

  const COUNT = 80;
  for (let i = 0; i < COUNT; i++) {
    const star = document.createElement('div');
    star.className = 'gate-star';
    const size = (Math.random() * 2.5 + 0.8).toFixed(1);
    const x    = (Math.random() * 100).toFixed(2);
    const y    = (Math.random() * 100).toFixed(2);
    const dur  = (Math.random() * 3 + 2).toFixed(1) + 's';
    const del  = (Math.random() * 4).toFixed(1) + 's';
    const minO = (Math.random() * 0.2 + 0.1).toFixed(2);
    const maxO = (Math.random() * 0.5 + 0.4).toFixed(2);
    star.style.cssText = `
      width:${size}px; height:${size}px;
      left:${x}%; top:${y}%;
      --dur:${dur}; --del:${del};
      --min-op:${minO}; --max-op:${maxO};
    `;
    container.appendChild(star);
  }
}

// ── Boot all upgrades ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  try { initCustomCursor(); } catch (err) { console.error('initCustomCursor failed:', err); }
  try { initGateStarfield(); } catch (err) { console.error('initGateStarfield failed:', err); }

  // Run scroll-reveal after gate is dismissed and main content becomes visible
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    const observer = new MutationObserver(() => {
      if (mainContent.classList.contains('visible')) {
        try {
          initScrollReveal();
          initNavbarShrink();
          // Initial reveal for above-the-fold elements
          setTimeout(refreshScrollReveal, 200);
        } catch (err) {
          console.error('post-unlock init failed:', err);
        }
        observer.disconnect();
      }
    });
    observer.observe(mainContent, { attributes: true, attributeFilter: ['class'] });
  }
});
