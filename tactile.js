'use strict';
// Téléphones et tablettes.
//  • deux doigts sur la plaque : écarter / pincer pour zoomer, glisser pour se déplacer ;
//  • outil « Déplacer » (la main) : un seul doigt fait glisser la plaque ;
//  • petits écrans : le menu se range sous ☰, les couleurs deviennent une bande de pastilles
//    (le bouton « ▲ » ouvre le panneau complet) et les outils une barre en bas.
// La mise en page elle-même est dans styles.css (« Petits écrans »).

const DOIGTS = new Map(); // pointeurs tactiles posés sur la zone de dessin
let PINCE = null;         // geste à deux doigts en cours
let GLISSE = null;        // déplacement à un doigt (outil « Déplacer »)

// un trait commencé avec le premier doigt est repris quand le deuxième se pose
function reprendreTraitEnCours() {
  if (S.dessin) {
    S.dessin = false; S.apercu = null;
    const avant = S.annuler.pop();
    if (avant) restaurer(avant);
    toutMettreAJour();
  }
  if (typeof SEL !== 'undefined' && SEL.glisse) annulerSel();
}

function mesurePince() {
  const [a, b] = [...DOIGTS.values()];
  return { d: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
}

window.addEventListener('pointerdown', (e) => {
  // menu ouvert : toucher ailleurs le referme, sans poser de perle
  if (document.body.classList.contains('menu-ouvert') && e.target.closest && !e.target.closest('.barre')) {
    e.stopPropagation(); e.preventDefault(); fermerMenuMobile(); return;
  }
  const dansZone = e.target.closest && e.target.closest('#zone');
  if (!dansZone) return;
  if (e.pointerType === 'touch') {
    DOIGTS.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (DOIGTS.size >= 2) {
      e.stopPropagation(); e.preventDefault();
      if (DOIGTS.size === 2) { reprendreTraitEnCours(); GLISSE = null; PINCE = { ...mesurePince(), zoom: reglages.zoom }; }
      return;
    }
  }
  if (S.outil === 'main' && e.target.closest('#toileCadre')) {
    e.stopPropagation(); e.preventDefault();
    const zone = $('#zone');
    GLISSE = { id: e.pointerId, x: e.clientX, y: e.clientY, gauche: zone.scrollLeft, haut: zone.scrollTop };
  }
}, true);

window.addEventListener('pointermove', (e) => {
  if (DOIGTS.has(e.pointerId)) DOIGTS.set(e.pointerId, { x: e.clientX, y: e.clientY });
  const zone = $('#zone');
  if (PINCE && DOIGTS.size >= 2) {
    e.stopPropagation(); e.preventDefault();
    const m = mesurePince();
    const vise = PINCE.zoom * (m.d / PINCE.d);
    if (Math.abs(vise - reglages.zoom) / reglages.zoom > 0.03) zoomA(vise, m.cx, m.cy);
    zone.scrollLeft -= m.cx - PINCE.cx; zone.scrollTop -= m.cy - PINCE.cy;
    PINCE.cx = m.cx; PINCE.cy = m.cy;
    return;
  }
  if (GLISSE && GLISSE.id === e.pointerId) {
    e.stopPropagation(); e.preventDefault();
    zone.scrollLeft = GLISSE.gauche - (e.clientX - GLISSE.x);
    zone.scrollTop = GLISSE.haut - (e.clientY - GLISSE.y);
  }
}, true);

function finDoigt(e) {
  const etaitPince = !!PINCE, etaitGlisse = GLISSE && GLISSE.id === e.pointerId;
  DOIGTS.delete(e.pointerId);
  if (PINCE && DOIGTS.size < 2) PINCE = null;
  if (etaitGlisse) GLISSE = null;
  if (etaitPince || etaitGlisse) e.stopPropagation();
}
window.addEventListener('pointerup', finDoigt, true);
window.addEventListener('pointercancel', finDoigt, true);

// ---------- petits écrans : menu, panneau des couleurs, place des barres ----------
const PETIT = window.matchMedia('(max-width: 900px)');

function fermerMenuMobile() { document.body.classList.remove('menu-ouvert'); $('#btnMenu').setAttribute('aria-expanded', 'false'); }
$('#btnMenu').onclick = (e) => {
  e.stopPropagation();
  const ouvert = document.body.classList.toggle('menu-ouvert');
  $('#btnMenu').setAttribute('aria-expanded', ouvert);
};
document.addEventListener('click', (e) => {
  if (!document.body.classList.contains('menu-ouvert')) return;
  if (e.target.closest('#btnFichier')) return;           // « Fichier » déplie sa liste, le menu reste ouvert
  if (e.target.closest('.barre nav [data-action]') || !e.target.closest('.barre nav')) fermerMenuMobile();
});

function basculerCote(ouvrir) {
  const ouvert = document.body.classList.toggle('cote-ouverte', ouvrir);
  const b = $('#btnCote');
  b.textContent = ouvert ? '✕ Fermer' : '▲';
  b.title = ouvert ? 'Revenir au dessin' : 'Toutes les couleurs, la plaque et l’aperçu du repassage';
  b.setAttribute('aria-expanded', ouvert);
  majPlaceBarres();
}
$('#btnCote').onclick = () => basculerCote();
// dans le panneau ouvert, choisir une couleur ramène au dessin
$('#listeCouleurs').addEventListener('click', (e) => {
  if (document.body.classList.contains('cote-ouverte') && e.target.closest('.coul')) setTimeout(() => basculerCote(false), 120);
});

// la barre de zoom se pose juste au-dessus des barres du bas
function majPlaceBarres() {
  if (!PETIT.matches) { document.documentElement.style.removeProperty('--bas'); return; }
  const h = (sel) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect().height : 0; };
  const cote = document.body.classList.contains('cote-ouverte') ? 0 : h('.cote');
  document.documentElement.style.setProperty('--bas', Math.round(cote + h('.outils')) + 'px');
}
let ecranAvant = PETIT.matches;
function surTaille() {
  if (window.innerWidth > 1280) fermerMenuMobile();
  if (!PETIT.matches && document.body.classList.contains('cote-ouverte')) basculerCote(false);
  majPlaceBarres();
  // en passant d'une mise en page à l'autre (rotation…), on recadre la plaque
  if (PETIT.matches !== ecranAvant) { ecranAvant = PETIT.matches; if (typeof SURF !== 'undefined' && SURF) zoomAjuster(); }
}
window.addEventListener('resize', surTaille);
window.addEventListener('orientationchange', () => setTimeout(surTaille, 250));
setTimeout(surTaille, 0);
