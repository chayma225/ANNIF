(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('debug') !== '1') return;

  const state = {
    events: [],
    errors: [],
    startedAt: new Date().toLocaleTimeString('fr-FR'),
  };

  const escapeHTML = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const style = document.createElement('style');
  style.textContent = `
    #cosmic-debug-launcher {
      position: fixed;
      right: 12px;
      bottom: 12px;
      z-index: 2147483646;
      min-height: 42px;
      padding: 10px 15px;
      border: 1px solid rgba(255,255,255,.88);
      border-radius: 999px;
      background: linear-gradient(135deg, #ff77ad, #d84d84);
      box-shadow: 0 8px 22px rgba(110, 28, 72, .28);
      color: #fff;
      font: 700 12px/1.2 system-ui, sans-serif;
      letter-spacing: .02em;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
    #cosmic-debug-panel {
      position: fixed;
      right: 10px;
      bottom: 64px;
      z-index: 2147483647;
      display: none;
      width: min(420px, calc(100vw - 20px));
      max-height: min(78vh, 650px);
      overflow: auto;
      box-sizing: border-box;
      padding: 15px;
      border: 1px solid rgba(255, 204, 226, .9);
      border-radius: 18px;
      background: rgba(43, 12, 36, .97);
      box-shadow: 0 18px 48px rgba(30, 0, 20, .45);
      color: #fff8fc;
      font: 12px/1.45 system-ui, sans-serif;
      -webkit-overflow-scrolling: touch;
    }
    #cosmic-debug-panel.is-open { display: block; }
    #cosmic-debug-panel * { box-sizing: border-box; }
    .cosmic-debug-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
    .cosmic-debug-title { color:#ffc1dc; font-size:15px; font-weight:800; }
    .cosmic-debug-subtitle { margin:2px 0 0; color:rgba(255,255,255,.66); font-size:10px; }
    .cosmic-debug-close { width:30px; height:30px; border:0; border-radius:50%; background:rgba(255,255,255,.12); color:#fff; font-size:18px; cursor:pointer; }
    .cosmic-debug-grid { display:grid; grid-template-columns: 1fr; gap:6px; }
    .cosmic-debug-row { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding:8px 10px; border-radius:10px; background:rgba(255,255,255,.08); }
    .cosmic-debug-label { color:rgba(255,255,255,.68); }
    .cosmic-debug-value { max-width:62%; color:#fff; font-weight:700; text-align:right; overflow-wrap:anywhere; }
    .cosmic-debug-value.ok { color:#9ff0be; }
    .cosmic-debug-value.bad { color:#ff9eae; }
    .cosmic-debug-actions { display:flex; flex-wrap:wrap; gap:7px; margin:11px 0; }
    .cosmic-debug-actions button { min-height:34px; padding:7px 10px; border:1px solid rgba(255,255,255,.18); border-radius:999px; background:rgba(255,255,255,.1); color:#fff; font:600 11px system-ui,sans-serif; cursor:pointer; }
    .cosmic-debug-log { max-height:180px; overflow:auto; margin:0; padding:9px; border-radius:10px; background:#180817; color:#ffd4e6; white-space:pre-wrap; overflow-wrap:anywhere; font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace; }
    @media (max-width:480px) {
      #cosmic-debug-launcher { right:9px; bottom:9px; min-height:44px; padding:11px 14px; }
      #cosmic-debug-panel { right:7px; bottom:62px; width:calc(100vw - 14px); max-height:74vh; padding:12px; }
    }
  `;
  document.head.appendChild(style);

  const launcher = document.createElement('button');
  launcher.id = 'cosmic-debug-launcher';
  launcher.type = 'button';
  launcher.textContent = 'Diagnostic';
  launcher.setAttribute('aria-label', 'Ouvrir le diagnostic');

  const panel = document.createElement('section');
  panel.id = 'cosmic-debug-panel';
  panel.setAttribute('aria-label', 'Diagnostic CosmicLove');
  panel.innerHTML = `
    <div class="cosmic-debug-head">
      <div>
        <div class="cosmic-debug-title">Diagnostic CosmicLove</div>
        <p class="cosmic-debug-subtitle">Mode téléphone · aucune donnée PIN affichée</p>
      </div>
      <button class="cosmic-debug-close" type="button" aria-label="Fermer le diagnostic">×</button>
    </div>
    <div class="cosmic-debug-grid" id="cosmic-debug-grid"></div>
    <div class="cosmic-debug-actions">
      <button type="button" data-debug-action="refresh">Actualiser</button>
      <button type="button" data-debug-action="copy">Copier le rapport</button>
      <button type="button" data-debug-action="clear">Effacer les logs</button>
    </div>
    <pre class="cosmic-debug-log" id="cosmic-debug-log">Initialisation…</pre>
  `;

  const grid = panel.querySelector('#cosmic-debug-grid');
  const logEl = panel.querySelector('#cosmic-debug-log');
  const addEvent = (label, detail = '') => {
    const time = new Date().toLocaleTimeString('fr-FR');
    state.events.push(`${time} · ${label}${detail ? ` · ${detail}` : ''}`);
    if (state.events.length > 80) state.events.shift();
    renderLog();
  };
  const addError = (detail) => {
    state.errors.push(String(detail));
    if (state.errors.length > 30) state.errors.shift();
    addEvent('ERREUR', detail);
  };
  const renderLog = () => {
    if (!logEl) return;
    const lines = [...state.errors.map((error) => `ERREUR · ${error}`), ...state.events];
    logEl.textContent = lines.slice(-80).join('\n') || 'Aucun événement enregistré.';
  };
  const getState = () => {
    const button = document.getElementById('padlock-open-btn');
    const lock = document.getElementById('main-padlock');
    const lockContainer = lock?.parentElement;
    const modal = document.getElementById('access-code-modal');
    const form = document.getElementById('access-code-form');
    const input = document.getElementById('access-code-input');
    const main = document.getElementById('main-content');
    const gate = document.getElementById('countdown-gate');
    const wrapper = document.getElementById('padlock-wrapper');
    const remembered = (() => {
      try { return localStorage.getItem('cosmiclove_access_remembered') === '1'; } catch { return false; }
    })();
    const rect = (element) => {
      if (!element) return 'absent';
      const box = element.getBoundingClientRect();
      return `${Math.round(box.width)}×${Math.round(box.height)} px`;
    };
    return {
      bouton: button ? `présent · ${rect(button)}` : 'ABSENT',
      boutonVisible: button ? `${getComputedStyle(button).display} / ${getComputedStyle(button).visibility}` : '—',
      cadenas: lock ? `présent · ${lockContainer?.className || 'sans conteneur'}` : 'ABSENT',
      porte: wrapper?.classList.contains('visible') ? 'visible' : 'masquée',
      pin: modal?.classList.contains('open') ? 'OUVERTE' : 'fermée',
      pinChamp: input ? (document.activeElement === input ? 'focus actif' : 'présent') : 'ABSENT',
      formulaire: form ? 'présent' : 'ABSENT',
      site: main ? `${getComputedStyle(main).display} · ${main.classList.contains('visible') ? 'visible' : 'non visible'}` : 'ABSENT',
      compteur: gate ? getComputedStyle(gate).display : 'ABSENT',
      resteConnecte: remembered ? 'activé' : 'désactivé',
      largeur: `${window.innerWidth}px`,
      enLigne: navigator.onLine ? 'oui' : 'non',
    };
  };
  const render = () => {
    if (!grid) return;
    const data = getState();
    grid.innerHTML = Object.entries(data).map(([label, value]) => {
      const bad = String(value).includes('ABSENT') || String(value).includes('non visible');
      return `<div class="cosmic-debug-row"><span class="cosmic-debug-label">${escapeHTML(label)}</span><span class="cosmic-debug-value ${bad ? 'bad' : 'ok'}">${escapeHTML(value)}</span></div>`;
    }).join('');
    renderLog();
  };

  window.addEventListener('error', (event) => addError(`${event.message || 'Erreur'} (${event.filename || 'page'}:${event.lineno || '?'})`));
  window.addEventListener('unhandledrejection', (event) => addError(`Promise rejetée : ${event.reason?.message || event.reason || 'inconnue'}`));
  const originalConsoleError = console.error;
  console.error = (...args) => {
    addError(args.map((arg) => arg instanceof Error ? arg.message : String(arg)).join(' '));
    originalConsoleError.apply(console, args);
  };

  document.addEventListener('click', (event) => {
    const target = event.target.closest?.('#padlock-open-btn, #main-padlock, #access-code-form button[type="submit"], #access-code-close');
    if (!target) return;
    addEvent(`Clic : #${target.id || target.className}`);
    setTimeout(render, 80);
  }, true);
  document.addEventListener('submit', (event) => {
    if (event.target?.id === 'access-code-form') {
      addEvent('Soumission du formulaire PIN');
      setTimeout(render, 120);
    }
  }, true);
  window.addEventListener('online', () => { addEvent('Connexion réseau rétablie'); render(); });
  window.addEventListener('offline', () => { addEvent('Connexion réseau perdue'); render(); });

  launcher.addEventListener('click', () => {
    panel.classList.toggle('is-open');
    addEvent(panel.classList.contains('is-open') ? 'Panneau ouvert' : 'Panneau fermé');
    render();
  });
  panel.querySelector('.cosmic-debug-close')?.addEventListener('click', () => panel.classList.remove('is-open'));
  panel.querySelector('[data-debug-action="refresh"]')?.addEventListener('click', () => { addEvent('Actualisation manuelle'); render(); });
  panel.querySelector('[data-debug-action="clear"]')?.addEventListener('click', () => { state.events.length = 0; state.errors.length = 0; addEvent('Logs effacés'); render(); });
  panel.querySelector('[data-debug-action="copy"]')?.addEventListener('click', async () => {
    const report = JSON.stringify({ url: location.href, updatedAt: new Date().toISOString(), state: getState(), errors: state.errors, events: state.events }, null, 2);
    try {
      await navigator.clipboard.writeText(report);
      addEvent('Rapport copié');
    } catch {
      addError('Copie impossible : autorisation du navigateur refusée');
    }
    render();
  });

  const mount = () => {
    if (!document.body || document.getElementById('cosmic-debug-launcher')) return;
    document.body.append(launcher, panel);
    addEvent('Mode debug activé');
    render();
    const observer = new MutationObserver(() => render());
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
    window.setInterval(render, 900);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
})();
