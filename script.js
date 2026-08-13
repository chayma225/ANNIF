/* script.js - CosmicLove Premium Upgrade */
/* Enhanced animations, micro-interactions, and premium feel */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, setDoc, getDoc, getDocs, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging.js";

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
let messaging = null;
const FCM_VAPID_PUBLIC_KEY = window.COSMICLOVE_FCM_VAPID_KEY || 'REMPLACE_CETTE_VALEUR_PAR_LA_CLE_WEB_PUSH_FIREBASE';
const PUSH_SERVICE_WORKER = new URL('firebase-messaging-sw.js', window.location.href).toString();
const APP_ICON_URL = new URL('cosmiclove-icon.svg', window.location.href).toString();
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
// IMAGE/VIDEO OPTIMIZATION HELPERS - vignettes rapides, upload compressé
// ==========================================================================
function getOptimizedUrl(url, width) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto,c_limit/`);
}

function isVideoUrl(url) {
  return /\.(mp4|mov|webm|m4v|avi)(\?|$)/i.test(String(url || ''));
}

function isVideoFile(file) {
  return file instanceof File && (file.type.startsWith('video/') || /\.(mp4|mov|webm|m4v|avi)$/i.test(file.name));
}

function getVideoThumbnail(url, width = 500) {
  if (!url || !url.includes('/upload/')) return url;
  return url
    .replace('/upload/', `/upload/w_${width},q_auto,c_limit/`)
    .replace(/\.(mp4|mov|webm|m4v|avi)$/i, '.jpg');
}

function compressImageBeforeUpload(file, maxWidth = 1600, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Compression échouée')),
        'image/jpeg',
        quality
      );
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  window.dispatchEvent(new CustomEvent('cosmiclove:identity-ready', { detail: { user: name } }));
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

function initLiveDistance() {
  const btn = document.getElementById('enable-location-btn');
  const recenterBtn = document.getElementById('recenter-map-btn');
  const statusEl = document.getElementById('location-status');
  const mapEl = document.getElementById('love-map');
  if (!mapEl || typeof L === 'undefined' || !db) return;

  const positions = { Chayma: null, Ilyess: null };
  let markerC = null;
  let markerI = null;
  let loveLine = null;
  let hasFittedOnce = false;
  let routeRequestId = 0;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  const validPosition = (value) => {
    const lat = Number(value?.lat);
    const lng = Number(value?.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
      ? { lat, lng, city: value?.city || null, updatedAt: value?.updatedAt || null }
      : null;
  };

  const map = L.map('love-map', {
    zoomControl: true,
    scrollWheelZoom: false,
    attributionControl: false,
    preferCanvas: true
  }).setView([34.95, 9.85], 6);

  const pastelFallbackTile = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23FCE4EC'/%3E%3C/svg%3E";
  const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    subdomains: ['a', 'b', 'c'],
    maxZoom: 19,
    minZoom: 2,
    attribution: '© OpenStreetMap contributors',
    errorTileUrl: pastelFallbackTile,
    updateWhenIdle: true,
    keepBuffer: 3
  }).addTo(map);

  mapEl.classList.add('map-loading');
  tileLayer.once('load', () => mapEl.classList.remove('map-loading'));
  window.setTimeout(() => mapEl.classList.remove('map-loading'), 2200);

  const escapePopup = (value) => String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const heartIcon = (color, person) => L.divIcon({
    className: 'heart-marker-wrapper',
    html: `<span class="heart-marker-icon" style="--heart-color:${color}" aria-label="${person}" role="img">
      <svg viewBox="0 0 48 52" role="presentation" focusable="false">
        <path class="heart-marker-shadow" d="M24 45S5 33.2 5 19.7C5 12.5 9.9 7.7 16.1 7.7c3.6 0 6.5 1.8 7.9 4.7 1.5-2.9 4.4-4.7 7.9-4.7C38.1 7.7 43 12.5 43 19.7 43 33.2 24 45 24 45Z"/>
        <path class="heart-marker-body" d="M24 43S6.5 32.2 6.5 19.9C6.5 13.4 10.8 9 16.4 9c3.4 0 6.2 1.8 7.6 4.6C25.4 10.8 28.2 9 31.6 9c5.6 0 9.9 4.4 9.9 10.9C41.5 32.2 24 43 24 43Z"/>
        <path class="heart-marker-shine" d="M13.2 17.3c.8-2.5 2.6-3.8 5.1-3.8 1.1 0 2.1.3 2.9.8-2.7.1-4.8 1.3-6.1 3.8-.4.7-1.4.3-1.9-.8Z"/>
      </svg>
    </span>`,
    iconSize: [46, 50],
    iconAnchor: [23, 47],
    popupAnchor: [0, -43]
  });

  const fitMap = ({ force = false } = {}) => {
    const available = [positions.Chayma, positions.Ilyess].filter(Boolean);
    if (!available.length) {
      map.setView([34.95, 9.85], 6, { animate: false });
      return;
    }
    if (available.length === 1) {
      map.setView([available[0].lat, available[0].lng], 9, { animate: force });
      return;
    }
    const bounds = L.latLngBounds(available.map((point) => [point.lat, point.lng]));
    map.fitBounds(bounds, { padding: [54, 54], maxZoom: 10, animate: force, duration: 0.7 });
  };

  const invalidateMap = () => {
    requestAnimationFrame(() => window.setTimeout(() => map.invalidateSize({ pan: false }), 90));
  };

  const updateMarkers = ({ recenter = false } = {}) => {
    const c = positions.Chayma;
    const i = positions.Ilyess;
    if (c && !markerC) markerC = L.marker([c.lat, c.lng], { icon: heartIcon('#FF6FA8', 'Chayma'), riseOnHover: true }).addTo(map);
    if (i && !markerI) markerI = L.marker([i.lat, i.lng], { icon: heartIcon('#A66AC4', 'Ilyess'), riseOnHover: true }).addTo(map);
    if (!c && markerC) { map.removeLayer(markerC); markerC = null; }
    if (!i && markerI) { map.removeLayer(markerI); markerI = null; }
    if (markerC && c) markerC.setLatLng([c.lat, c.lng]).bindPopup(`<b>Chayma</b><br>${escapePopup(c.city || 'Position partagée')}`);
    if (markerI && i) markerI.setLatLng([i.lat, i.lng]).bindPopup(`<b>Ilyess</b><br>${escapePopup(i.city || 'Position partagée')}`);
    if (c && i) {
      const points = [[c.lat, c.lng], [i.lat, i.lng]];
      if (!loveLine) loveLine = L.polyline(points, { color: '#E986A4', weight: 2, opacity: 0.75, dashArray: '7 9' }).addTo(map);
      else loveLine.setLatLngs(points);
    } else if (loveLine) {
      map.removeLayer(loveLine);
      loveLine = null;
    }
    if (recenter || !hasFittedOnce) {
      fitMap({ force: recenter });
      hasFittedOnce = true;
    }
    invalidateMap();
  };

  const formatDuration = (seconds) => {
    const totalMinutes = Math.max(1, Math.round(Number(seconds) / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours} h ${String(minutes).padStart(2, '0')} min` : `${minutes} min`;
  };

  const updateRouteStats = async () => {
    const c = positions.Chayma;
    const i = positions.Ilyess;
    const requestId = ++routeRequestId;
    const desc = document.getElementById('distance-widget-desc');
    if (!c || !i) {
      setText('live-distance-value', 'En attente des deux positions');
      setText('live-time-value', 'En attente');
      if (desc) desc.textContent = c || i ? 'Une position partagée · en attente de la seconde' : 'Partagez vos positions pour afficher la carte';
      return;
    }
    if (desc) desc.textContent = `${c.city || 'Chayma'} ↔ ${i.city || 'Ilyess'}`;
    setText('live-distance-value', 'Calcul de l’itinéraire…');
    setText('live-time-value', 'Calcul…');
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${c.lng},${c.lat};${i.lng},${i.lat}?overview=false&alternatives=false&steps=false`;
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`OSRM HTTP ${response.status}`);
      const payload = await response.json();
      const route = payload?.routes?.[0];
      if (!route || requestId !== routeRequestId) throw new Error('Itinéraire introuvable');
      setText('live-distance-value', `${(route.distance / 1000).toFixed(1)} km`);
      setText('live-time-value', formatDuration(route.duration));
    } catch (error) {
      console.warn('Driving route unavailable:', error);
      if (requestId !== routeRequestId) return;
      setText('live-distance-value', 'Itinéraire indisponible');
      setText('live-time-value', 'Réessayez dans un instant');
    }
  };

  const refreshMapFromSnapshot = (snapshot) => {
    snapshot.forEach((docSnap) => {
      if (docSnap.id === 'Chayma' || docSnap.id === 'Ilyess') positions[docSnap.id] = validPosition(docSnap.data());
    });
    updateMarkers();
    updateRouteStats();
    if (!positions.Chayma || !positions.Ilyess) {
      if (statusEl) statusEl.textContent = 'Partagez chacun votre position pour afficher les deux cœurs.';
    }
  };

  onSnapshot(collection(db, 'locations'), refreshMapFromSnapshot, (error) => {
    console.error('Map locations listener error:', error);
    if (statusEl) statusEl.textContent = 'Les positions ne sont pas disponibles pour le moment.';
  });

  recenterBtn?.addEventListener('click', () => {
    invalidateMap();
    fitMap({ force: true });
    updateMarkers({ recenter: true });
    showToast(positions.Chayma && positions.Ilyess ? 'Les deux cœurs sont au centre de la carte 💕' : 'Il manque encore une position pour centrer les deux cœurs.', !positions.Chayma || !positions.Ilyess);
  });

  window.addEventListener('love-map:visible', () => {
    invalidateMap();
    window.setTimeout(() => { fitMap({ force: false }); updateMarkers(); }, 140);
  });
  window.addEventListener('resize', invalidateMap, { passive: true });

  if (!btn) return;
  btn.addEventListener('click', () => {
    const user = getUser();
    if (!user || !['Chayma', 'Ilyess'].includes(user)) {
      if (statusEl) statusEl.textContent = 'Choisissez votre identité avant de partager votre position.';
      return;
    }
    if (!navigator.geolocation) {
      if (statusEl) statusEl.textContent = 'La géolocalisation n’est pas supportée par ce navigateur.';
      return;
    }
    if (statusEl) statusEl.textContent = 'Localisation en cours… autorisez le GPS si nécessaire.';
    btn.disabled = true;
    navigator.geolocation.watchPosition(async (pos) => {
      const { latitude: lat, longitude: lng } = pos.coords;
      const now = Date.now();
      let city = positions[user]?.city;
      if (!city || now - myLastGeocodedAt > 5 * 60 * 1000) {
        const geocoded = await reverseGeocode(lat, lng);
        if (geocoded) { city = geocoded; myLastGeocodedAt = now; }
      }
      positions[user] = { lat, lng, city: city || null, updatedAt: now };
      await setDoc(doc(db, 'locations', user), { lat, lng, city: city || null, updatedAt: now }, { merge: true });
      updateMarkers({ recenter: true });
      updateRouteStats();
      if (statusEl) statusEl.textContent = `Position partagée${city ? ` — ${city}` : ''} · le cœur est à jour 💕`;
      btn.textContent = '📍 Position active';
    }, (error) => {
      console.error('Geolocation error:', error);
      if (statusEl) statusEl.textContent = 'Active la localisation dans les réglages du navigateur.';
      btn.disabled = false;
    }, { enableHighAccuracy: true, maximumAge: 60000, timeout: 15000 });
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
      if (targetViewId === 'view-emotions') {
        window.dispatchEvent(new CustomEvent('love-map:visible'));
      }
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
  const padlockOpenBtn = document.getElementById('padlock-open-btn');
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
  // La préférence « Rester connecté » est séparée de l’ancien accès permanent.
  // Ainsi, une ancienne autorisation ne contourne pas le nouveau comportement.
  const ACCESS_REMEMBER_KEY = 'cosmiclove_access_remembered';

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
  const accessSubmitBtn = document.getElementById('access-code-submit-btn');
  const accessInput = document.getElementById('access-code-input');
  const accessError = document.getElementById('access-code-error');
  const accessRememberInput = document.getElementById('access-remember-input');
  const accessCloseBtn = document.getElementById('access-code-close');
  const sessionLockBtn = document.getElementById('session-lock-btn');

  function isAccessRemembered() {
    try {
      return localStorage.getItem(ACCESS_REMEMBER_KEY) === '1';
    } catch (err) {
      return false;
    }
  }

  function renderSessionLockButton() {
    if (!sessionLockBtn) return;
    const remembered = isAccessRemembered();
    sessionLockBtn.textContent = remembered ? '🔓' : '🔒';
    sessionLockBtn.title = remembered
      ? 'Désactiver « Rester connecté » et redemander le PIN'
      : 'Le code PIN sera demandé à chaque connexion';
    sessionLockBtn.setAttribute('aria-label', sessionLockBtn.title);
  }

  function disableRememberedAccess() {
    const remembered = isAccessRemembered();
    try { localStorage.removeItem(ACCESS_REMEMBER_KEY); } catch (err) {}
    renderSessionLockButton();

    if (!remembered) {
      showToast('Le code PIN sera demandé à chaque connexion.');
      return;
    }

    showToast('« Rester connecté » est désactivé.');
    // On reverrouille immédiatement afin que la modification soit visible.
    setTimeout(() => window.location.reload(), 650);
  }

  renderSessionLockButton();
  if (sessionLockBtn) sessionLockBtn.addEventListener('click', disableRememberedAccess);

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
    if (accessRememberInput) accessRememberInput.checked = false;
    if (accessError) accessError.textContent = '';

  }

  function closeAccessModal() {
    if (!accessModal) return;
    accessModal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { accessModal.style.display = 'none'; }, 300);
  }

  const submitAccessCode = (event) => {
    event?.preventDefault();
    const value = (accessInput?.value || '').trim();
    if (value === ACCESS_CODE) {
      const rememberAccess = Boolean(accessRememberInput?.checked);
      try {
        if (rememberAccess) {
          localStorage.setItem(ACCESS_REMEMBER_KEY, '1');
        } else {
          // Sans cette case, le PIN reste obligatoire à la prochaine connexion.
          localStorage.removeItem(ACCESS_REMEMBER_KEY);
        }
      } catch (err) {}
      renderSessionLockButton();
      closeAccessModal();
      runUnlockSequence();
    } else {
      playPop();
      if (accessError) accessError.textContent = 'Ce n\'est pas le bon code… réessaie 🤍';
      accessForm?.classList.add('shake');
      setTimeout(() => accessForm?.classList.remove('shake'), 400);
      accessInput?.focus();
    }
  };

  // Le PIN est déclenché par un vrai bouton, jamais par la validation native d’un form.
  if (accessSubmitBtn) accessSubmitBtn.addEventListener('click', submitAccessCode);
  if (accessInput) {
    accessInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') submitAccessCode(event);
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

  const handlePadlockOpen = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    const padlockContainer = padlock?.parentElement;
    if (!padlockContainer || padlockContainer.classList.contains('unlocked')) return;

    const alreadyRemembered = isAccessRemembered();
    if (alreadyRemembered) {
      runUnlockSequence();
    } else {
      openAccessModal();
    }
  };

  if (padlock) padlock.addEventListener('click', handlePadlockOpen);
  if (padlockOpenBtn) padlockOpenBtn.addEventListener('click', handlePadlockOpen);
  // Le fallback mobile sait maintenant que le gestionnaire principal est prêt.
  window.cosmicloveMainReady = true;

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
function formatPreciseDate(timestamp) {
  if (!timestamp) return 'Aucune visite enregistrée';
  const value = typeof timestamp?.toMillis === 'function' ? timestamp.toMillis() : Number(timestamp);
  if (!Number.isFinite(value)) return 'Aucune visite enregistrée';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function openManagedModal(modal, closeButton) {
  if (!modal) return () => {};
  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!modal.classList.contains('open')) modal.style.display = 'none';
    }, 260);
  };
  if (closeButton) closeButton.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  return () => {
    modal.style.display = 'flex';
    modal.offsetHeight;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
}

function latestReaction(reactions) {
  if (!reactions || typeof reactions !== 'object') return '';
  return Object.values(reactions)
    .filter((item) => item && item.emoji)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0]?.emoji || '';
}

function setReactionBadge(target, emoji) {
  if (!target) return;
  target.querySelector('.reaction-badge')?.remove();
  if (!emoji) return;
  const badge = document.createElement('span');
  badge.className = 'reaction-badge';
  badge.textContent = emoji;
  badge.setAttribute('aria-label', `Réaction ${emoji}`);
  target.appendChild(badge);
}

const REACTION_CHOICES = ['💖', '🖇️', '🌷', '♾️', '😌', '🥹'];
let activeReactionMenu = null;

function closeReactionMenu() {
  activeReactionMenu?.remove();
  activeReactionMenu = null;
}

async function saveCardReaction(type, id, emoji, target) {
  if (!db || !id) return;
  const user = getUser();
  const reaction = { emoji, by: user, updatedAt: Date.now() };
  try {
    if (type === 'mood') {
      await setDoc(doc(db, 'moods', id), { reactions: { [user]: reaction } }, { merge: true });
    } else {
      await updateDoc(doc(db, 'notes', id), { [`reactions.${user}`]: reaction });
    }
    setReactionBadge(target, emoji);
    showToast(`Réaction envoyée ${emoji}`);
  } catch (error) {
    console.error('Reaction save error:', error);
    showToast('La réaction n’a pas pu être synchronisée.', true);
  }
}

function attachLongPressReaction(target) {
  if (!target || target.dataset.reactionBound === '1') return;
  target.dataset.reactionBound = '1';
  let timer = null;
  let longPressTriggered = false;

  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const openMenu = (clientX, clientY) => {
    closeReactionMenu();
    const menu = document.createElement('div');
    menu.className = 'reaction-menu';
    menu.setAttribute('role', 'menu');
    REACTION_CHOICES.forEach((emoji) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = emoji;
      button.title = `Réagir ${emoji}`;
      button.setAttribute('aria-label', `Réagir ${emoji}`);
      button.addEventListener('click', async (event) => {
        event.stopPropagation();
        await saveCardReaction(target.dataset.reactionType, target.dataset.reactionId, emoji, target);
        closeReactionMenu();
      });
      menu.appendChild(button);
    });
    document.body.appendChild(menu);
    const width = menu.offsetWidth || 250;
    const left = Math.min(Math.max(8, clientX - width / 2), window.innerWidth - width - 8);
    const top = Math.max(8, clientY - 58);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
    activeReactionMenu = menu;
  };

  target.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    longPressTriggered = false;
    timer = setTimeout(() => {
      longPressTriggered = true;
      openMenu(event.clientX, event.clientY);
      if (navigator.vibrate) navigator.vibrate(18);
    }, 500);
  });
  target.addEventListener('pointerup', cancel);
  target.addEventListener('pointerleave', cancel);
  target.addEventListener('pointercancel', cancel);
  target.addEventListener('contextmenu', (event) => event.preventDefault());
  target.addEventListener('click', (event) => {
    if (longPressTriggered) {
      event.preventDefault();
      event.stopPropagation();
      longPressTriggered = false;
    }
  }, true);
}

document.addEventListener('pointerdown', (event) => {
  if (activeReactionMenu && !activeReactionMenu.contains(event.target)) closeReactionMenu();
});

function initDynamicLetters() {
  const stack = document.getElementById('letters-stack');
  const addButton = document.getElementById('add-letter-btn');
  const editorModal = document.getElementById('letter-editor-modal');
  const editorForm = document.getElementById('letter-editor-form');
  const editorOpen = openManagedModal(editorModal, document.getElementById('letter-editor-close'));
  const editorTitle = editorModal?.querySelector('.modal-title');
  const titleInput = document.getElementById('letter-title-input');
  const bodyInput = document.getElementById('letter-body-input');
  const submitButton = editorForm?.querySelector('button[type="submit"]');
  if (!stack || !db) return;

  let editingLetterId = null;
  let expandedLetterId = null;

  const resetEditor = () => {
    editingLetterId = null;
    editorForm?.reset();
    if (editorTitle) editorTitle.textContent = 'Écrire une lettre';
    if (submitButton) submitButton.textContent = 'Sceller la lettre 💌';
  };

  addButton?.addEventListener('click', () => {
    resetEditor();
    editorOpen();
  });

  const fillLetterBody = (bodyEl, body) => {
    if (!bodyEl) return;
    bodyEl.innerHTML = '';
    String(body || 'Une lettre encore secrète…')
      .split(/\n{2,}|\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean)
      .forEach((paragraph, index) => {
        const line = document.createElement('p');
        line.style.setProperty('--line-delay', `${index * 70}ms`);
        line.textContent = paragraph;
        bodyEl.appendChild(line);
      });
  };

  const collapseCard = (card) => {
    if (!card) return;
    card.classList.remove('is-expanded');
    card.setAttribute('aria-expanded', 'false');
    const closedPaper = card.querySelector('.letter-paper-reveal');
    if (closedPaper) closedPaper.setAttribute('aria-hidden', 'true');
    const closedBody = card.querySelector('.dynamic-letter-body-content');
    if (closedBody) closedBody.scrollTop = 0;
    if (expandedLetterId === card.dataset.letterId) expandedLetterId = null;
  };

  const expandCard = (card, letter) => {
    stack.querySelectorAll('.dynamic-letter-card.is-expanded').forEach((other) => {
      if (other !== card) collapseCard(other);
    });
    card.classList.add('is-expanded');
    card.setAttribute('aria-expanded', 'true');
    const openPaper = card.querySelector('.letter-paper-reveal');
    if (openPaper) openPaper.setAttribute('aria-hidden', 'false');
    fillLetterBody(card.querySelector('.dynamic-letter-body-content'), letter.body);
    const signature = card.querySelector('.dynamic-letter-signature');
    if (signature) signature.textContent = `Avec tout mon cœur, ${letter.author || 'notre amour'} 🤍`;
    expandedLetterId = letter.id;
    window.setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  };

  const startEdit = (letter) => {
    editingLetterId = letter.id;
    if (editorTitle) editorTitle.textContent = 'Modifier la lettre';
    if (submitButton) submitButton.textContent = 'Enregistrer les changements';
    if (titleInput) titleInput.value = letter.title || '';
    if (bodyInput) bodyInput.value = letter.body || '';
    editorOpen();
  };

  const removeLetter = async (letter, card) => {
    const title = letter.title || 'cette lettre';
    if (!window.confirm(`Supprimer « ${title} » ? Cette action est définitive.`)) return;
    try {
      await deleteDoc(doc(db, 'letters', letter.id));
      if (expandedLetterId === letter.id) expandedLetterId = null;
      showToast('La lettre a été retirée avec douceur 🤍');
    } catch (error) {
      console.error('Letter delete error:', error);
      showToast('Impossible de supprimer cette lettre.', true);
    }
  };

  function renderLetters(letters) {
    stack.innerHTML = '';
    if (!letters.length) {
      stack.innerHTML = '<div class="letters-empty-state">Nos lettres vont apparaître ici… écris le premier chapitre 🤍</div>';
      return;
    }
    letters.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    letters.forEach((letter, index) => {
      const card = document.createElement('article');
      card.className = 'dynamic-letter-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-expanded', 'false');
      card.dataset.letterId = letter.id;
      const preview = String(letter.body || '').replace(/\s+/g, ' ').trim();
      card.innerHTML = `
        <div class="letter-envelope">
          <span class="letter-envelope-lining" aria-hidden="true"></span>
          <span class="letter-envelope-left-fold" aria-hidden="true"></span>
          <span class="letter-envelope-right-fold" aria-hidden="true"></span>
          <span class="letter-envelope-bottom-fold" aria-hidden="true"></span>
          <span class="letter-envelope-flap" aria-hidden="true"><svg class="letter-envelope-flap-outline" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><path d="M 0 0 L 50 100 L 100 0" /></svg></span>
          <div class="letter-envelope-content">
            <div class="letter-sheet-kicker">une lettre pour toi · ${String(index + 1).padStart(2, '0')}</div>
            <div class="letter-card-actions" aria-label="Actions de la lettre">
              <button type="button" class="letter-icon-btn letter-edit-btn" data-letter-action="edit" aria-label="Modifier la lettre" title="Modifier">✎</button>
              <button type="button" class="letter-icon-btn letter-delete-btn" data-letter-action="delete" aria-label="Supprimer la lettre" title="Supprimer">×</button>
            </div>
            <h3 class="dynamic-letter-title">${escapeHTML(letter.title || 'Sans titre')}</h3>
            <div class="dynamic-letter-meta"><span>Écrite par ${escapeHTML(letter.author || 'Anon')}</span><span>${escapeHTML(formatPreciseDate(letter.createdAt))}</span></div>
          </div>
          <div class="letter-paper-reveal" aria-hidden="true">
            <div class="letter-paper-heading">
              <span class="letter-paper-kicker">une lettre pour toi · ${String(index + 1).padStart(2, '0')}</span>
              <h3 class="letter-paper-title">${escapeHTML(letter.title || 'Sans titre')}</h3>
              <div class="letter-paper-meta"><span>Écrite par ${escapeHTML(letter.author || 'Anon')}</span><span>${escapeHTML(formatPreciseDate(letter.createdAt))}</span></div>
            </div>
            <div class="dynamic-letter-body">
              <div class="dynamic-letter-body-content" tabindex="0" aria-label="Corps de la lettre, défilement disponible"></div>
              <p class="dynamic-letter-signature"></p>
              <button type="button" class="dynamic-letter-fold">Replier doucement <span aria-hidden="true">↑</span></button>
            </div>
          </div>
          <span class="letter-envelope-seal" aria-hidden="true">♡</span>
        </div>
      `;

      const toggleCard = () => {
        if (card.classList.contains('is-expanded')) collapseCard(card);
        else expandCard(card, letter);
      };
      card.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        toggleCard();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleCard();
        }
      });
      card.querySelector('.dynamic-letter-open')?.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleCard();
      });
      card.querySelector('.dynamic-letter-fold')?.addEventListener('click', (event) => {
        event.stopPropagation();
        collapseCard(card);
      });
      card.querySelector('[data-letter-action="edit"]')?.addEventListener('click', (event) => {
        event.stopPropagation();
        startEdit(letter);
      });
      card.querySelector('[data-letter-action="delete"]')?.addEventListener('click', async (event) => {
        event.stopPropagation();
        await removeLetter(letter, card);
      });
      stack.appendChild(card);
      if (expandedLetterId === letter.id) expandCard(card, letter);
    });
  }

  onSnapshot(collection(db, 'letters'), (snapshot) => {
    const letters = [];
    snapshot.forEach((snap) => letters.push({ id: snap.id, ...snap.data() }));
    renderLetters(letters);
  }, (error) => {
    console.error('Letters listener error:', error);
    const status = document.getElementById('letters-sync-status');
    if (status) status.textContent = 'Synchronisation des lettres indisponible';
  });

  editorForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = titleInput?.value.trim() || '';
    const body = bodyInput?.value.trim() || '';
    if (!title || !body) return;
    if (submitButton) submitButton.disabled = true;
    try {
      if (editingLetterId) {
        await updateDoc(doc(db, 'letters', editingLetterId), { title, body, editedAt: Date.now() });
        showToast('La lettre a été mise à jour avec soin ✨');
      } else {
        await addDoc(collection(db, 'letters'), { title, body, author: getUser(), createdAt: Date.now() });
        showToast('Lettre scellée et synchronisée 💌');
      }
      resetEditor();
      document.getElementById('letter-editor-close')?.click();
    } catch (error) {
      console.error('Letter save error:', error);
      showToast('Impossible d’enregistrer cette lettre.', true);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

function initHeroTags() {
  const row = document.getElementById('hero-tags-row');
  const manageButton = document.getElementById('manage-hero-tags-btn');
  const modal = document.getElementById('hero-tags-modal');
  const open = openManagedModal(modal, document.getElementById('hero-tags-close'));
  const form = document.getElementById('hero-tags-form');
  const input = document.getElementById('hero-tag-input');
  const list = document.getElementById('hero-tags-editor-list');
  if (!row || !db) return;

  let tags = [];
  const render = () => {
    row.innerHTML = '';
    if (!tags.length) {
      row.innerHTML = '<span class="hero-tags-empty">Ajoute les mots doux de notre histoire…</span>';
    } else {
      tags.forEach((tag, index) => {
        const pill = document.createElement('span');
        pill.className = `keyword-pill pill-delay-${index % 5}`;
        pill.textContent = tag.text;
        row.appendChild(pill);
      });
    }
    if (!list) return;
    list.innerHTML = '';
    if (!tags.length) {
      list.innerHTML = '<p class="access-code-hint">Aucun slogan pour le moment.</p>';
      return;
    }
    tags.forEach((tag) => {
      const editorRow = document.createElement('div');
      editorRow.className = 'hero-tag-editor-row';
      editorRow.dataset.id = tag.id;
      editorRow.innerHTML = `
        <input type="text" value="${escapeHTML(tag.text)}" maxlength="40" aria-label="Modifier le slogan">
        <button type="button" data-action="save">Enregistrer</button>
        <button type="button" data-action="delete" aria-label="Supprimer le slogan">×</button>
      `;
      list.appendChild(editorRow);
    });
  };

  if (manageButton) manageButton.addEventListener('click', open);
  onSnapshot(collection(db, 'heroTags'), (snapshot) => {
    tags = [];
    snapshot.forEach((snap) => tags.push({ id: snap.id, ...snap.data() }));
    tags.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    render();
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = input?.value.trim() || '';
    if (!text) return;
    await addDoc(collection(db, 'heroTags'), { text, createdAt: Date.now(), createdBy: getUser() });
    form.reset();
  });

  list?.addEventListener('click', async (event) => {
    const button = event.target.closest('button');
    const rowEl = event.target.closest('.hero-tag-editor-row');
    if (!button || !rowEl) return;
    const id = rowEl.dataset.id;
    if (button.dataset.action === 'delete') {
      await deleteDoc(doc(db, 'heroTags', id));
      return;
    }
    if (button.dataset.action === 'save') {
      const value = rowEl.querySelector('input')?.value.trim() || '';
      if (value) await updateDoc(doc(db, 'heroTags', id), { text: value, updatedAt: Date.now() });
    }
  });
}

let pushForegroundHandlerBound = false;

function isPushConfigured() {
  return Boolean(
    FCM_VAPID_PUBLIC_KEY &&
    !FCM_VAPID_PUBLIC_KEY.startsWith('REMPLACE_CETTE_VALEUR')
  );
}

async function subscribeCurrentDeviceToPush(user, { askPermission = true } = {}) {
  if (!db || !app) throw new Error('firebase_unavailable');
  if (!isPushConfigured()) throw new Error('vapid_not_configured');
  if (!('serviceWorker' in navigator) || !('Notification' in window)) throw new Error('push_not_supported');
  if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) throw new Error('https_required');

  let permission = Notification.permission;
  if (permission !== 'granted' && askPermission) permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('permission_denied');

  if (!messaging) messaging = getMessaging(app);
  const serviceWorkerRegistration = await navigator.serviceWorker.register(PUSH_SERVICE_WORKER, { scope: new URL('./', window.location.href).pathname });
  await navigator.serviceWorker.ready;
  const token = await getToken(messaging, {
    vapidKey: FCM_VAPID_PUBLIC_KEY,
    serviceWorkerRegistration
  });
  if (!token) throw new Error('token_unavailable');

  const tokenId = encodeURIComponent(token).replace(/%/g, '_');
  await setDoc(doc(db, 'pushSubscriptions', tokenId), {
    token,
    user,
    enabled: true,
    updatedAt: Date.now(),
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'unknown'
  }, { merge: true });

  localStorage.setItem('cosmiclove_fcm_token', token);
  localStorage.setItem('cosmiclove_push_enabled', '1');

  if (!pushForegroundHandlerBound) {
    onMessage(messaging, async (payload) => {
      const data = payload?.data || {};
      const title = data.title || payload?.notification?.title || 'CosmicLove';
      const body = data.body || payload?.notification?.body || 'Quelqu’un est dans notre Univers ✨';
      showToast(body);
      if (Notification.permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        registration.showNotification(title, {
          body,
          icon: APP_ICON_URL,
          badge: APP_ICON_URL,
          tag: `cosmiclove-${data.sender || 'presence'}`,
          data: { link: data.link || '/' }
        });
      }
    });
    pushForegroundHandlerBound = true;
  }
  return token;
}

function explainPushError(error) {
  const messages = {
    vapid_not_configured: 'Ajoute la clé Web Push Firebase dans la configuration avant d’activer les notifications.',
    push_not_supported: 'Les notifications push ne sont pas prises en charge par ce navigateur.',
    https_required: 'Les notifications push nécessitent une adresse HTTPS.',
    permission_denied: 'L’autorisation des notifications a été refusée sur cet appareil.',
    token_unavailable: 'Firebase n’a pas encore fourni de jeton pour cet appareil.',
    firebase_unavailable: 'Firebase est momentanément indisponible.'
  };
  return messages[error?.message] || 'Impossible d’activer les notifications push pour le moment.';
}

function initPresence() {
  const widget = document.getElementById('presence-widget');
  const details = document.getElementById('presence-widget-details');
  const label = document.getElementById('presence-widget-label');
  const dot = document.getElementById('presence-dot');
  const notificationButton = document.getElementById('enable-notifications-btn');
  if (!widget || !db) return;
  let started = false;
  let firstSnapshot = true;
  let latestPresence = {};
  const presenceSessionId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const render = () => {
    const names = ['Chayma', 'Ilyess'];
    const current = getUser();
    const partner = current === 'Chayma' ? 'Ilyess' : 'Chayma';
    const partnerData = latestPresence[partner] || {};
    const online = partnerData.online === true;
    dot?.classList.toggle('is-online', online);
    if (label) label.textContent = online ? `${partner} est dans notre Univers ✨` : `Dernière visite de ${partner}`;
    if (details) {
      details.innerHTML = names.map((name) => {
        const data = latestPresence[name] || {};
        return `<div><strong>${escapeHTML(name)}</strong> — ${escapeHTML(formatPreciseDate(data.lastActive))}${data.online ? ' · en ligne' : ''}</div>`;
      }).join('');
    }
  };

  const notifyPartner = (partner) => {
    const message = `${partner} est en ligne dans notre Univers ✨`;
    showToast(message);
    playPing();
    // When FCM is configured, the Cloud Function sends the durable push.
    // Keep a local fallback only until the one-time FCM setup is completed.
    if (!isPushConfigured() && window.Notification && Notification.permission === 'granted') {
      try {
        navigator.serviceWorker?.ready.then((registration) => registration.showNotification('CosmicLove', {
          body: message,
          icon: APP_ICON_URL,
          badge: APP_ICON_URL,
          data: { link: window.location.href }
        }));
      } catch (error) { console.warn('Local notification error:', error); }
    }
  };

  const start = () => {
    if (started) return;
    const user = getUser();
    if (!['Chayma', 'Ilyess'].includes(user)) return;
    started = true;

    const writePresence = async (online = true) => {
      try {
        await setDoc(doc(db, 'presence', user), { online, lastActive: Date.now(), user, sessionId: presenceSessionId }, { merge: true });
      } catch (error) { console.warn('Presence write error:', error); }
    };
    const refresh = () => writePresence(document.visibilityState !== 'hidden');
    refresh();
    const interval = setInterval(refresh, 30000);
    window.addEventListener('beforeunload', () => { clearInterval(interval); writePresence(false); });
    document.addEventListener('visibilitychange', refresh);

    onSnapshot(collection(db, 'presence'), (snapshot) => {
      const next = {};
      snapshot.forEach((snap) => { next[snap.id] = snap.data(); });
      const partner = user === 'Chayma' ? 'Ilyess' : 'Chayma';
      const oldPartner = latestPresence[partner];
      latestPresence = next;
      render();
      const newPartnerSession = next[partner]?.online === true && (
        !oldPartner?.online ||
        (next[partner]?.sessionId && next[partner]?.sessionId !== oldPartner?.sessionId)
      );
      if (!firstSnapshot && newPartnerSession) notifyPartner(partner);
      firstSnapshot = false;
    });
  };

  const updatePushButtonState = () => {
    const enabled = localStorage.getItem('cosmiclove_push_enabled') === '1' && Notification.permission === 'granted';
    notificationButton?.classList.toggle('is-enabled', enabled);
    if (notificationButton) {
      notificationButton.title = enabled
        ? 'Notifications push actives sur cet appareil'
        : 'Activer les notifications push sur cet appareil';
      notificationButton.setAttribute('aria-label', notificationButton.title);
    }
  };

  notificationButton?.addEventListener('click', async () => {
    notificationButton.disabled = true;
    try {
      await subscribeCurrentDeviceToPush(getUser(), { askPermission: true });
      updatePushButtonState();
      showToast('Notifications push activées sur cet appareil 🔔');
    } catch (error) {
      console.warn('Push subscription error:', error);
      showToast(explainPushError(error), true);
    } finally {
      notificationButton.disabled = false;
    }
  });

  const silentlyRefreshPushSubscription = async () => {
    if (!isPushConfigured() || !('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      await subscribeCurrentDeviceToPush(getUser(), { askPermission: false });
      updatePushButtonState();
    } catch (error) {
      console.warn('Silent push refresh skipped:', error);
    }
  };

  window.addEventListener('cosmiclove:identity-ready', () => {
    start();
    silentlyRefreshPushSubscription();
  }, { once: true });
  if (['Chayma', 'Ilyess'].includes(getUser())) {
    start();
    updatePushButtonState();
    silentlyRefreshPushSubscription();
  }
}

function initAutonomousSurprise() {
  const content = document.getElementById('surprise-letter-content');
  const manageButton = document.getElementById('manage-surprise-btn');
  const editorModal = document.getElementById('surprise-editor-modal');
  const editorOpen = openManagedModal(editorModal, document.getElementById('surprise-editor-close'));
  const editorForm = document.getElementById('surprise-editor-form');
  const titleInput = document.getElementById('surprise-title-input');
  const bodyInput = document.getElementById('surprise-body-input');

  const render = (surprise) => {
    if (!content) return;
    content.innerHTML = '';
    const title = document.createElement('p');
    title.className = 'letter-line surprise-letter-title';
    title.style.setProperty('--d', '0');
    title.textContent = surprise?.title || 'Une surprise rien que pour toi';
    content.appendChild(title);

    const paragraphs = String(surprise?.body || 'Une petite pensée est encore en train de se préparer pour toi…')
      .split(/\n{2,}|\n/)
      .map((text) => text.trim())
      .filter(Boolean);
    paragraphs.forEach((text, index) => {
      const paragraph = document.createElement('p');
      paragraph.className = 'letter-line';
      paragraph.style.setProperty('--d', String(index + 1));
      paragraph.textContent = text;
      content.appendChild(paragraph);
    });

    const signature = document.createElement('p');
    signature.className = 'letter-line letter-signature';
    signature.style.setProperty('--d', String(paragraphs.length + 1));
    signature.textContent = surprise?.author ? `Scellée par ${surprise.author} 🤍` : 'Scellée avec amour 🤍';
    content.appendChild(signature);
  };

  if (db) {
    onSnapshot(doc(db, 'surprise', 'current'), (snapshot) => {
      render(snapshot.exists() ? snapshot.data() : null);
    }, (error) => {
      console.warn('Surprise listener error:', error);
      render(null);
    });
  } else {
    render(null);
  }

  manageButton?.addEventListener('click', () => {
    document.getElementById('modal-close')?.click();
    setTimeout(editorOpen, 180);
  });

  editorForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const title = titleInput?.value.trim() || '';
    const body = bodyInput?.value.trim() || '';
    if (!title || !body || !db) return;
    const submit = editorForm.querySelector('button[type="submit"]');
    if (submit) submit.disabled = true;
    try {
      await setDoc(doc(db, 'surprise', 'current'), {
        title,
        body,
        author: getUser(),
        updatedAt: Date.now()
      }, { merge: true });
      editorForm.reset();
      document.getElementById('surprise-editor-close')?.click();
      showToast('La surprise est scellée à part 💌');
    } catch (error) {
      console.error('Surprise save error:', error);
      showToast('Impossible de sceller la surprise.', true);
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}

function initDynamicModules() {
  initDynamicLetters();
  initAutonomousSurprise();
  initHeroTags();
  initPresence();
}

function initContentModules() {
  initDynamicModules();

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

      const isVideo = isVideoFile(file);
      const cloudName = 'zwrchxbf';
      const uploadPreset = 'cosmiclove_unsigned';
      const formData = new FormData();

      const submitBtn = uploadForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;

      try {
        if (isVideo) {
          formData.append('file', file);
        } else {
          submitBtn.textContent = 'Compression en cours... ✨';
          const compressedFile = await compressImageBeforeUpload(file);
          formData.append('file', compressedFile, 'photo.jpg');
        }
        formData.append('upload_preset', uploadPreset);

        submitBtn.textContent = 'Envoi vers les étoiles... ✨';
        submitBtn.disabled = true;

        const endpoint = isVideo ? 'video' : 'image';
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${endpoint}/upload`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Erreur Cloudinary');

        const imageUrl = data.secure_url;

        await addDoc(collection(db, 'photos'), {
          src: imageUrl,
          type: isVideo ? 'video' : 'image',
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
    const isVid = p.type === 'video' || isVideoUrl(p.src);
    const card = document.createElement('div');
    card.className = 'masonry-card';
    card.id = p.id;
    card.innerHTML = `
      <img src="${escapeHTML(isVid ? getVideoThumbnail(p.src, 500) : getOptimizedUrl(p.src, 500))}" alt="${escapeHTML(p.caption)}" loading="lazy" onerror="handleImageError(this)">
      ${isVid ? '<div class="masonry-play-icon">▶</div>' : ''}
      <button class="masonry-delete-btn" data-id="${p.id}" title="Supprimer ce souvenir">&times;</button>
      <button class="masonry-heart-btn${isFav ? ' active' : ''}" data-id="${p.id}" title="Favori">${isFav ? '❤️' : '🤍'}</button>
      <div class="masonry-overlay">
        <div class="masonry-caption">${escapeHTML(p.caption)}</div>
        <div class="masonry-tag">${escapeHTML(p.tag || '')}</div>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (e.target.closest('.masonry-heart-btn') || e.target.closest('.masonry-delete-btn')) return;
      openLightbox(p.src, p.caption, p.id, isVid);
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
        <img src="${escapeHTML(isVideoUrl(p.src) || p.type === 'video' ? getVideoThumbnail(p.src, 150) : getOptimizedUrl(p.src, 150))}" alt="${escapeHTML(p.caption)}" loading="lazy" data-id="${p.id}">
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
          openLightbox(p.src, p.caption, p.id, p.type === 'video' || isVideoUrl(p.src));
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

  function getLightboxVideoEl() {
    let vid = document.getElementById('lightbox-video-el');
    if (!vid && lightboxImg && lightboxImg.parentNode) {
      vid = document.createElement('video');
      vid.id = 'lightbox-video-el';
      vid.controls = true;
      vid.style.maxWidth = '100%';
      vid.style.maxHeight = '85vh';
      vid.style.display = 'none';
      vid.style.borderRadius = '12px';
      lightboxImg.parentNode.insertBefore(vid, lightboxImg.nextSibling);
    }
    return vid;
  }

  function openLightbox(src, caption, photoId, isVideo = false) {
    if (!lightbox) return;
    currentLightboxPhotoId = photoId;
    const videoEl = getLightboxVideoEl();

    if (isVideo) {
      if (videoEl) {
        videoEl.src = src;
        videoEl.style.display = 'block';
        videoEl.play().catch(() => {});
      }
      lightboxImg.style.display = 'none';
      lightboxImg.src = '';
    } else {
      if (videoEl) {
        videoEl.pause();
        videoEl.style.display = 'none';
        videoEl.src = '';
      }
      lightboxImg.style.display = 'block';
      lightboxImg.src = src;
    }

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
        lightboxImg.style.display = 'block';
        const videoEl = document.getElementById('lightbox-video-el');
        if (videoEl) { videoEl.pause(); videoEl.src = ''; videoEl.style.display = 'none'; }
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
  const moodCardC    = moodChaymaEl?.closest('.mood-person');
  const moodCardI    = moodIlyessEl?.closest('.mood-person');

  [
    [moodCardC, 'Chayma'],
    [moodCardI, 'Ilyess']
  ].forEach(([card, id]) => {
    if (!card) return;
    card.dataset.reactionType = 'mood';
    card.dataset.reactionId = id;
    attachLongPressReaction(card);
  });

  // Listen for both users' moods in real-time. The first snapshot is silent;
  // only a real change made by the partner creates a local notification.
  const observedMoods = {};
  const watchMood = (name, emojiEl, labelEl, card) => {
    onSnapshot(doc(db, 'moods', name), (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const previous = observedMoods[name];
      if (emojiEl) { emojiEl.textContent = data.emoji || '❓'; if (previous) bumpEl(emojiEl); }
      if (labelEl) labelEl.textContent = data.label || '—';
      setReactionBadge(card, latestReaction(data.reactions));

      const partnerChanged = previous && getUser() !== name && (
        previous.emoji !== data.emoji || previous.label !== data.label
      );
      if (partnerChanged) {
        const moodText = data.label ? `${data.label} ${data.emoji || ''}` : (data.emoji || 'a changé d’humeur');
        const message = `${name} a changé d’humeur : ${moodText}`;
        showToast(message);
        playPing();
        if (!isPushConfigured() && window.Notification && Notification.permission === 'granted') {
          navigator.serviceWorker?.ready.then((registration) => registration.showNotification(`${name} a changé d’humeur 💫`, {
            body: moodText,
            icon: APP_ICON_URL,
            badge: APP_ICON_URL,
            data: { link: window.location.href }
          })).catch(() => {});
        }
      }
      observedMoods[name] = data;
    });
  };

  watchMood('Chayma', moodChaymaEl, moodLabelC, moodCardC);
  watchMood('Ilyess', moodIlyessEl, moodLabelI, moodCardI);

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
        card.dataset.reactionType = 'note';
        card.dataset.reactionId = note.id;
        card.innerHTML = `
          ${escapeHTML(note.text)}
          <span class="note-card-author">— ${escapeHTML(note.author || 'Anon')}</span>
          <button class="note-delete-btn" data-id="${note.id}">&times;</button>
        `;
        setReactionBadge(card, latestReaction(note.reactions));
        attachLongPressReaction(card);
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