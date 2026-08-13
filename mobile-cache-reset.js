(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('clear') !== '1') return;

  const cleanUrl = new URL(location.href);
  cleanUrl.searchParams.delete('clear');
  cleanUrl.searchParams.set('v23', '1');

  const clearCaches = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
    } catch (error) {
      console.warn('CosmicLove cache reset skipped:', error);
    }
    try { sessionStorage.setItem('cosmiclove_cache_reset_v23', '1'); } catch {}
    location.replace(cleanUrl.href);
  };

  let alreadyReset = false;
  try { alreadyReset = sessionStorage.getItem('cosmiclove_cache_reset_v23') === '1'; } catch {}
  if (!alreadyReset) clearCaches();
  else location.replace(cleanUrl.href);
})();
