(() => {
  const ACCESS_CODE = '0104';
  let lastGateAction = 0;

  const remembered = () => {
    try { return localStorage.getItem('cosmiclove_access_remembered') === '1'; } catch { return false; }
  };

  const openPin = () => {
    const modal = document.getElementById('access-code-modal');
    const input = document.getElementById('access-code-input');
    if (!modal) return false;
    modal.style.display = 'flex';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => input?.focus({ preventScroll: true }), 120);
    return true;
  };

  const unlockWithoutModule = () => {
    const gate = document.getElementById('countdown-gate');
    const main = document.getElementById('main-content');
    const modal = document.getElementById('access-code-modal');
    if (modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
    if (gate) {
      gate.classList.remove('fade-out');
      gate.style.display = 'none';
    }
    if (main) {
      main.style.display = 'block';
      main.classList.add('visible');
    }
    document.body.style.overflow = '';
  };

  const gateAction = (event) => {
    if (window.cosmicloveMainReady === true) return;
    const now = Date.now();
    if (now - lastGateAction < 450) return;
    lastGateAction = now;
    event.preventDefault();
    event.stopPropagation();
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    if (remembered()) unlockWithoutModule();
    else openPin();
  };

  const pinAction = (event) => {
    if (window.cosmicloveMainReady === true) return;
    event?.preventDefault();
    event?.stopPropagation();
    const input = document.getElementById('access-code-input');
    const error = document.getElementById('access-code-error');
    const remember = document.getElementById('access-remember-input');
    const value = (input?.value || '').trim();
    if (value !== ACCESS_CODE) {
      if (error) error.textContent = 'Ce n\'est pas le bon code… réessaie 🤍';
      input?.focus({ preventScroll: true });
      return false;
    }
    try {
      if (remember?.checked) localStorage.setItem('cosmiclove_access_remembered', '1');
      else localStorage.removeItem('cosmiclove_access_remembered');
    } catch {}
    unlockWithoutModule();
    return true;
  };

  const bind = () => {
    const gateButton = document.getElementById('padlock-open-btn');
    if (gateButton && gateButton.dataset.fallbackBound !== '1') {
      gateButton.dataset.fallbackBound = '1';
      gateButton.addEventListener('pointerup', gateAction, { capture: true });
      gateButton.addEventListener('click', gateAction, { capture: true });
      gateButton.addEventListener('touchend', gateAction, { capture: true, passive: false });
    }

    // Couverture élargie : le cadenas lui-même (l'icône coeur) doit aussi ouvrir
    // le PIN, pas seulement le texte "Ouvrir notre univers". Sur certains
    // téléphones le doigt touche l'icône et pas le bouton texte.
    const padlockIcon = document.getElementById('main-padlock');
    if (padlockIcon && padlockIcon.dataset.fallbackBound !== '1') {
      padlockIcon.dataset.fallbackBound = '1';
      padlockIcon.addEventListener('pointerup', gateAction, { capture: true });
      padlockIcon.addEventListener('click', gateAction, { capture: true });
      padlockIcon.addEventListener('touchend', gateAction, { capture: true, passive: false });
    }

    const submitButton = document.getElementById('access-code-submit-btn');
    if (submitButton && submitButton.dataset.fallbackBound !== '1') {
      submitButton.dataset.fallbackBound = '1';
      submitButton.addEventListener('pointerup', pinAction, { capture: true });
      submitButton.addEventListener('click', pinAction, { capture: true });
      submitButton.addEventListener('touchend', pinAction, { capture: true, passive: false });
    }

    const form = document.getElementById('access-code-form');
    if (form && form.dataset.fallbackBound !== '1') {
      form.dataset.fallbackBound = '1';
      form.addEventListener('submit', pinAction, { capture: true });
    }

    const input = document.getElementById('access-code-input');
    if (input && input.dataset.fallbackBound !== '1') {
      input.dataset.fallbackBound = '1';
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') pinAction(event);
      }, { capture: true });
    }
  };

  // Filet de sécurité supplémentaire : délégation sur tout le bloc du cadenas.
  // Même si le bouton exact change ou si le binding direct rate sur un
  // téléphone particulier, un tap n'importe où dans #padlock-wrapper doit
  // quand même ouvrir le PIN (tant que le site principal n'est pas prêt).
  const delegatedGateAction = (event) => {
    if (window.cosmicloveMainReady === true) return;
    const wrapper = event.target.closest?.('#padlock-wrapper');
    if (!wrapper) return;
    gateAction(event);
  };
  document.addEventListener('click', delegatedGateAction, { capture: true });
  document.addEventListener('touchend', delegatedGateAction, { capture: true, passive: false });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
