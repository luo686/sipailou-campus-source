(() => {
  'use strict';
  let dispose = () => {};
  function mount() {
    dispose();
    const directory = document.querySelector('.directory');
    if (!directory) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const controller = new AbortController();
    const pending = new Set();
    const animations = new Map();
    function finish(element) {
      observer.unobserve(element);
      pending.delete(element);
      animations.get(element)?.cancel();
      animations.delete(element);
      element.style.opacity = '1';
      element.style.willChange = 'auto';
    }
    async function enter(element) {
      observer.unobserve(element);
      const image = element.querySelector('img');
      if (image) {
        image.loading = 'eager';
        try { await image.decode(); } catch (_) { /* Keep the link usable if an image fails. */ }
      }
      if (controller.signal.aborted || !element.isConnected || !pending.has(element)) return;
      if (reduced.matches) { finish(element); return; }
      const animation = element.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 1000,
        easing: 'cubic-bezier(.42, 0, .58, 1)',
        fill: 'both'
      });
      animations.set(element, animation);
      animation.finished.then(() => finish(element)).catch(() => {});
    }
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) enter(entry.target);
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    function collect() {
      for (const element of pending) if (!element.isConnected) finish(element);
      directory.querySelectorAll('.building-card').forEach(element => {
        if (element.hasAttribute('data-progressive-reveal')) return;
        element.setAttribute('data-progressive-reveal', '');
        element.style.opacity = '0';
        pending.add(element);
        if (reduced.matches) finish(element);
        else observer.observe(element);
      });
    }
    const mutations = new MutationObserver(collect);
    mutations.observe(directory.querySelector('#building-results'), { childList: true, subtree: true });
    reduced.addEventListener('change', () => {
      if (reduced.matches) [...pending].forEach(finish);
    }, { signal: controller.signal });
    directory.addEventListener('focusin', event => {
      const card = event.target.closest('.building-card');
      if (card) finish(card);
    }, { signal: controller.signal });
    collect();
    dispose = () => {
      controller.abort(); mutations.disconnect(); observer.disconnect();
      animations.forEach(animation => animation.cancel()); animations.clear(); pending.clear();
    };
  }
  document.getElementById('app').addEventListener('campus:render', mount);
  mount();
})();
