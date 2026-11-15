'use strict';
// « Montrer les touches » : pour filmer l'écran (vidéos de présentation), chaque toucher fait apparaître
// un rond à l'endroit du doigt, et un appui long remplit un anneau. Activé par ?demo=1 ou dans Réglages › Disposition.

const TOUCHES = { actif: false, appui: null };

function majTouchesVisibles() {
  const q = new URLSearchParams(location.search).get('demo');
  TOUCHES.actif = q === '1' || (q !== '0' && !!reglages.montrerTouches);
  document.body.classList.toggle('touches-visibles', TOUCHES.actif);
}

function rondTouche(x, y) {
  const d = document.createElement('div');
  d.className = 'touche-rond';
  d.style.left = x + 'px'; d.style.top = y + 'px';
  document.body.appendChild(d);
  return d;
}

document.addEventListener('pointerdown', (e) => {
  if (!TOUCHES.actif || !e.isPrimary) return;
  const d = rondTouche(e.clientX, e.clientY);
  d.classList.add('appui');
  TOUCHES.appui = { d, x: e.clientX, y: e.clientY, t: performance.now() };
  // appui long : l'anneau se remplit (même délai que l'ouverture des options, 450 ms)
  TOUCHES.appui.minuterie = setTimeout(() => d.classList.add('long'), 120);
}, true);

document.addEventListener('pointermove', (e) => {
  const a = TOUCHES.appui;
  if (!a || !e.isPrimary) return;
  a.d.style.left = e.clientX + 'px'; a.d.style.top = e.clientY + 'px';
  if (Math.hypot(e.clientX - a.x, e.clientY - a.y) > 12) { clearTimeout(a.minuterie); a.d.classList.remove('long'); }
}, true);

function finTouche(e) {
  const a = TOUCHES.appui;
  if (!a || (e && !e.isPrimary)) return;
  clearTimeout(a.minuterie);
  TOUCHES.appui = null;
  a.d.classList.remove('appui', 'long');
  a.d.classList.add('fin');
  setTimeout(() => a.d.remove(), 450);
}
document.addEventListener('pointerup', finTouche, true);
document.addEventListener('pointercancel', finTouche, true);

majTouchesVisibles();
