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
      gateButton.addEventListener('click', gateAction, { capture: true });
    }

    const submitButton = document.getElementById('access-code-submit-btn');
    if (submitButton && submitButton.dataset.fallbackBound !== '1') {
      submitButton.dataset.fallbackBound = '1';
      submitButton.addEventListener('click', pinAction, { capture: true });
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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind, { once: true });
  else bind();
})();
