// Keep tracking out of the rendering path; initialize on interaction or idle.
(() => {
  let started = false;
  let timer;
  const events = ['pointerdown', 'keydown', 'scroll'];
  const start = () => {
    if (started) return;
    started = true;
    clearTimeout(timer);
    events.forEach(event => window.removeEventListener(event, start));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const load = src => { const script = document.createElement('script'); script.async = true; script.src = src; document.head.append(script); };
    load('https://www.googletagmanager.com/gtm.js?id=GTM-M2WWM6Z8');
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-E656M3BKBS');
    load('https://www.googletagmanager.com/gtag/js?id=G-E656M3BKBS');
  };
  events.forEach(event => window.addEventListener(event, start, { once: true, passive: true }));
  timer = setTimeout(() => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(start, { timeout: 2000 });
    else start();
  }, 5000);
})();
