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
let STYLET = false;       // un stylet a servi : il dessine, et le doigt déplace la plaque
let LONG = null;          // appui long en attente (pipette)
let TAPE2 = null;         // deux doigts posés puis relevés aussitôt = annuler

function annulerAppuiLong() { if (LONG) { clearTimeout(LONG.minuterie); LONG = null; } }
// appui long sur une perle : on reprend sa couleur, sans rien poser
function pipetteAppuiLong(e) {
  const p = picotSous(e);
  annulerAppuiLong();
  if (!S.dessin || p.i < 0 || !S.annuler.length) return;
  // la perle telle qu'elle était AVANT ce trait ; sur un picot vide, l'appui long pose simplement la perle
  let avant = -1;
  try { avant = JSON.parse(S.annuler[S.annuler.length - 1]).cases[p.i]; } catch (err) { return; }
  if (!(avant >= 0)) return;
  reprendreTraitEnCours();
  S.couleur = avant;
  if (S.outil !== 'crayon' && S.outil !== 'remplir') choisirOutil('crayon');
  toutMettreAJour();
  if (navigator.vibrate) navigator.vibrate(15);
  const c = P.couleurs[avant];
  message(`Couleur reprise : ${c ? (c.nom || c.code) : ''}`, 1800);
}

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
  if (e.pointerType === 'pen') STYLET = true;
  if (e.pointerType === 'touch') {
    DOIGTS.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (DOIGTS.size >= 2) {
      e.stopPropagation(); e.preventDefault();
      annulerAppuiLong();
      if (DOIGTS.size === 2) {
        reprendreTraitEnCours(); GLISSE = null;
        PINCE = { ...mesurePince(), zoom: reglages.zoom };
        TAPE2 = { t: Date.now(), bouge: 0, zoom: reglages.zoom };
      } else TAPE2 = null;
      return;
    }
    // appui long (sans bouger) sur la plaque = pipette
    if (e.target === toile && !STYLET && S.outil !== 'main' && S.outil !== 'selection') {
      const x = e.clientX, y = e.clientY, id = e.pointerId;
      LONG = { id, x, y, minuterie: setTimeout(() => pipetteAppuiLong({ clientX: x, clientY: y }), 550) };
    }
  }
  if ((S.outil === 'main' || (STYLET && e.pointerType === 'touch')) && e.target.closest('#toileCadre')) {
    e.stopPropagation(); e.preventDefault();
    const zone = $('#zone');
    GLISSE = { id: e.pointerId, x: e.clientX, y: e.clientY, gauche: zone.scrollLeft, haut: zone.scrollTop };
  }
}, true);

window.addEventListener('pointermove', (e) => {
  if (DOIGTS.has(e.pointerId)) DOIGTS.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (LONG && LONG.id === e.pointerId && Math.hypot(e.clientX - LONG.x, e.clientY - LONG.y) > 8) annulerAppuiLong();
  const zone = $('#zone');
  if (PINCE && DOIGTS.size >= 2) {
    e.stopPropagation(); e.preventDefault();
    const m = mesurePince();
    const vise = PINCE.zoom * (m.d / PINCE.d);
    if (Math.abs(vise - reglages.zoom) / reglages.zoom > 0.03) zoomA(vise, m.cx, m.cy);
    if (TAPE2) TAPE2.bouge += Math.abs(m.cx - PINCE.cx) + Math.abs(m.cy - PINCE.cy);
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
  if (LONG && LONG.id === e.pointerId) annulerAppuiLong();
  DOIGTS.delete(e.pointerId);
  if (PINCE && DOIGTS.size < 2) {
    PINCE = null;
    // deux doigts posés et relevés aussitôt, sans zoomer ni glisser : on annule le dernier geste
    if (TAPE2 && e.type === 'pointerup' && Date.now() - TAPE2.t < 320 && TAPE2.bouge < 12 && Math.abs(reglages.zoom - TAPE2.zoom) < 0.01 && S.annuler.length) {
      annuler(); message('Annulé', 1200);
    }
    TAPE2 = null;
  }
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

// boutons − / + autour d'un nombre (plaques côte à côte, rangées…) : plus simple qu'un clavier
document.addEventListener('click', (e) => {
  const b = e.target.closest('.pas-a-pas button');
  if (!b || b.onclick) return;               // la fenêtre d'import gère déjà les siens
  const champ = b.parentElement.querySelector('input');
  const v = Math.max(+champ.min || 1, Math.min(+champ.max || 99, (+champ.value || 1) + +b.dataset.pas));
  champ.value = v;
  champ.dispatchEvent(new Event('input', { bubbles: true }));
  champ.dispatchEvent(new Event('change', { bubbles: true }));
});
