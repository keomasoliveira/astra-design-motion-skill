// Disclosure navigation: the visual transition lives in CSS; this module owns state.
// The same links work with mouse, keyboard and touch. No menu roles or roving tabindex.
const root = document.querySelector('[data-disclosure]');
const trigger = root?.querySelector('[data-disclosure-trigger]');
const panel = root?.querySelector('[data-disclosure-panel]');
const motionToggle = root?.querySelector('[data-motion-toggle]');

if (root && trigger && panel) {
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)');
  let closeTimer = 0;
  let openSource = null;
  root.dataset.pageVisible = document.hidden ? 'false' : 'true';
  root.dataset.motion = 'running';
  root.dataset.inView = 'false';

  const observer = new IntersectionObserver(([entry]) => {
    root.dataset.inView = entry.isIntersecting ? 'true' : 'false';
  }, { threshold: 0.05 });
  observer.observe(panel);
  document.addEventListener('visibilitychange', () => {
    root.dataset.pageVisible = document.hidden ? 'false' : 'true';
  });
  motionToggle?.addEventListener('click', () => {
    const paused = root.dataset.motion !== 'paused';
    root.dataset.motion = paused ? 'paused' : 'running';
    motionToggle.setAttribute('aria-pressed', String(paused));
    motionToggle.textContent = paused ? 'Retomar diagramas' : 'Pausar diagramas';
  });

  const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';
  const stopPendingClose = () => {
    window.clearTimeout(closeTimer);
    closeTimer = 0;
  };

  function open(source) {
    stopPendingClose();
    if (source === 'activation') openSource = 'activation';
    else if (!isOpen()) openSource = 'hover';
    if (isOpen()) return;
    panel.inert = false;
    trigger.setAttribute('aria-expanded', 'true');
    root.dataset.open = 'true';
  }

  function close({ restoreFocus = false, focusTarget = null } = {}) {
    stopPendingClose();
    if (!isOpen()) return;
    // If focus is inside the soon-to-be inert panel, send it somewhere useful.
    if (focusTarget) focusTarget.focus({ preventScroll: true });
    else if (restoreFocus) trigger.focus();
    else if (panel.contains(document.activeElement)) document.activeElement.blur();
    trigger.setAttribute('aria-expanded', 'false');
    root.dataset.open = 'false';
    panel.inert = true;
    openSource = null;
  }

  trigger.addEventListener('click', () => {
    if (isOpen() && openSource === 'activation') close();
    else open('activation');
  });

  root.addEventListener('pointerenter', (event) => {
    if (fineHover.matches && event.pointerType === 'mouse') open('hover');
  });
  root.addEventListener('pointerleave', (event) => {
    if (fineHover.matches && event.pointerType === 'mouse' && openSource === 'hover') {
      stopPendingClose();
      closeTimer = window.setTimeout(() => {
        if (!root.contains(document.activeElement)) close();
      }, 140);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      close({ restoreFocus: root.contains(document.activeElement) });
    }
  });

  root.addEventListener('focusout', () => {
    queueMicrotask(() => {
      if (!root.contains(document.activeElement) && openSource === 'hover') close();
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!root.contains(event.target)) close();
  });

  panel.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const destination = link.hash ? document.getElementById(decodeURIComponent(link.hash.slice(1))) : null;
    close({ focusTarget: destination });
  });

  // Moving from mouse to touch / tablet must never leave a hover-open panel stuck.
  fineHover.addEventListener('change', () => close());
}
