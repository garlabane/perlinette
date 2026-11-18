'use strict';
// Calque : l'image de départ, posée en transparence sur la plaque pour aider à corriger les perles.
//  • gardée à l'import d'une image (image.js appelle garderCalque), à la place exacte où elle a été convertie ;
//  • à l'ÉCRAN SEULEMENT : c'est une image posée par-dessus la toile, jamais dessinée dedans,
//    donc elle n'apparaît ni à l'impression, ni dans les images partagées, ni dans les fichiers exportés ;
//  • rangée dans ce navigateur, à part du motif (une petite image par motif) ;
//  • un bouton l'affiche ou la cache, un curseur règle sa transparence, × la retire.

const CLE_CALQUE = 'perlesrep.calque.';
const calqueImg = document.createElement('img');
calqueImg.id = 'calque'; calqueImg.className = 'calque'; calqueImg.alt = ''; calqueImg.hidden = true;
calqueImg.setAttribute('aria-hidden', 'true');
$('#toileCadre').appendChild(calqueImg);
let calqueCourant = { id: null, data: null };

function lireCalque(id) {
  if (calqueCourant.id !== id) calqueCourant = { id, data: lire(CLE_CALQUE + id, null) };
  return calqueCourant.data;
}

// même géométrie que convertirImage : l'image (sa partie utile) posée dans la surface, en pas
function garderCalque(img, surf, cadre) {
  try {
    const b = cadre.boite || { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
    const ech = Math.min(surf.larg / b.w, surf.haut / b.h) * (cadre.zoom || 1);
    const w = b.w * ech, h = b.h * ech;
    const pos = { x: (surf.larg - w) / 2 + (cadre.dx || 0), y: (surf.haut - h) / 2 + (cadre.dy || 0), w, h };
    // une copie réduite (au plus 480 pixels de côté) : assez nette pour comparer, légère à garder
    const k = Math.min(1, 480 / Math.max(b.w, b.h));
    const cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.round(b.w * k)); cv.height = Math.max(1, Math.round(b.h * k));
    const g = cv.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(img, b.x, b.y, b.w, b.h, 0, 0, cv.width, cv.height);
    let src = cv.toDataURL('image/webp', 0.85);
    if (!src.startsWith('data:image/webp')) src = cv.toDataURL('image/png');
    const data = { src, ...pos, visible: true };
    if (!ecrire(CLE_CALQUE + P.id, data)) { message('Mémoire du navigateur pleine : le calque de l’image n’a pas pu être gardé.', 5000); return; }
    calqueCourant = { id: P.id, data };
    majCalque();
    message('L’image de départ est gardée en calque : bouton « Calque » pour l’afficher par-dessus et corriger.', 5000);
  } catch (e) { /* sans calque, l'import reste valable */ }
}

function retirerCalque() {
  try { localStorage.removeItem(CLE_CALQUE + P.id); } catch (e) { /* rien */ }
  calqueCourant = { id: P.id, data: null };
  majCalque();
}

// ---------- la petite barre : Calque (afficher / cacher), transparence, retirer ----------
const barreCalque = document.createElement('div');
barreCalque.id = 'barreCalque'; barreCalque.className = 'barre-calque'; barreCalque.hidden = true;
barreCalque.innerHTML = `
  <button type="button" class="calque-bascule" aria-pressed="false" title="Afficher l’image de départ en transparence sur la plaque (à l’écran seulement, rien ne s’imprime)">🖼 Calque</button>
  <input type="range" class="calque-opacite" min="10" max="90" step="5" aria-label="Transparence du calque" title="Plus ou moins visible">
  <button type="button" class="calque-verif" aria-pressed="false" title="Entourer les perles dont la couleur s’éloigne de l’image (à l’écran seulement)">🔍 À vérifier</button>
  <span class="calque-compte" hidden></span>
  <button type="button" class="calque-corriger" hidden title="Donner à chaque perle entourée la couleur du motif la plus proche de l’image (Annuler pour revenir)">Tout corriger</button>
  <button type="button" class="calque-retirer" aria-label="Retirer le calque" title="Retirer le calque de ce motif">×</button>`;
if ($('#onglets')) $('#onglets').after(barreCalque); else $('#zone').prepend(barreCalque);
const opaciteCalque = () => Math.min(0.9, Math.max(0.1, +reglages.calqueOpacite || 0.5));
barreCalque.querySelector('.calque-opacite').value = Math.round(opaciteCalque() * 100);
barreCalque.querySelector('.calque-bascule').onclick = () => {
  const d = lireCalque(P.id); if (!d) return;
  d.visible = !d.visible; ecrire(CLE_CALQUE + P.id, d); majCalque();
};
barreCalque.querySelector('.calque-opacite').oninput = (e) => {
  reglages.calqueOpacite = +e.target.value / 100; ecrire(CLE.reglages, reglages);
  const d = lireCalque(P.id);
  if (d && !d.visible) { d.visible = true; ecrire(CLE_CALQUE + P.id, d); }
  majCalque();
};
barreCalque.querySelector('.calque-retirer').onclick = async () => {
  if (await confirmer('Retirer le calque de ce motif ? Les perles ne changent pas.')) retirerCalque();
};

function majCalque() {
  const d = P && P.id ? lireCalque(P.id) : null;
  barreCalque.hidden = !d;
  if (!d) { calqueImg.hidden = true; majVerif(null); return; }
  majVerif(d);
  const vu = d.visible !== false;
  const bas = barreCalque.querySelector('.calque-bascule');
  bas.classList.toggle('actif', vu); bas.setAttribute('aria-pressed', String(vu));
  calqueImg.hidden = !vu;
  if (!vu) return;
  if (calqueImg.getAttribute('src') !== d.src) calqueImg.src = d.src;
  // la toile peut être affichée plus petite ou plus grande que ses pixels : on suit sa taille réelle
  const z = reglages.zoom, k = toile.width ? toile.clientWidth / toile.width : 1;
  Object.assign(calqueImg.style, {
    left: (toile.offsetLeft + (MARGE + d.x * z) * k) + 'px',
    top: (toile.offsetTop + (MARGE + d.y * z) * k) + 'px',
    width: (d.w * z * k) + 'px',
    height: (d.h * z * k) + 'px',
    opacity: String(opaciteCalque()),
  });
}

// suivre la plaque : chaque nouveau dessin (zoom, motif changé, plaques ajoutées) replace le calque
const renduSansCalque = rendu;
rendu = function () { renduSansCalque(); majCalque(); };
addEventListener('resize', () => majCalque());

// ménage : les calques de motifs supprimés ne restent pas dans le navigateur
try {
  const projets = lire(CLE.projets, {});
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CLE_CALQUE) && !projets[k.slice(CLE_CALQUE.length)]) localStorage.removeItem(k);
  }
} catch (e) { /* rien */ }


// ---------- Perles à vérifier ----------
// On lit la couleur de l'image sous chaque picot (comme à l'import), puis on entoure les perles
// pour lesquelles une autre couleur DU MOTIF serait nettement plus proche de l'image, et celles
// posées là où l'image est vide. Les cercles sont dessinés sur une couche à part : écran seulement.
const SEUIL_VERIF = 14;   // écart (Lab) au-delà duquel une meilleure couleur du motif vaut la peine
const verifCv = document.createElement('canvas');
verifCv.className = 'calque-verif-couche'; verifCv.hidden = true; verifCv.setAttribute('aria-hidden', 'true');
$('#toileCadre').appendChild(verifCv);
let verifActive = false, verifCache = { cle: null, labs: null }, verifRes = { autres: [], enTrop: [] };

function couleursImageSous(d) {
  const cle = `${P.id}|${d.src.length}|${d.x}|${d.y}|${d.w}|${d.h}|${SURF.picots.length}|${SURF.larg}|${SURF.haut}`;
  if (verifCache.cle === cle) return verifCache.labs;
  if (!verifCache.img || verifCache.src !== d.src) {
    const im = new Image(); verifCache.img = im; verifCache.src = d.src; verifCache.pret = false;
    im.onload = () => { verifCache.pret = true; majVerif(lireCalque(P.id)); };
    im.src = d.src;
  }
  if (!verifCache.pret) return null;
  const RES = 6, W = Math.ceil(SURF.larg * RES), H = Math.ceil(SURF.haut * RES);
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.imageSmoothingQuality = 'high';
  g.drawImage(verifCache.img, d.x * RES, d.y * RES, d.w * RES, d.h * RES);
  const px = g.getImageData(0, 0, W, H).data, rr = Math.max(1, Math.floor(RES * 0.4));
  const labs = SURF.picots.map((q) => {
    const cx = Math.round(q.x * RES), cy = Math.round(q.y * RES);
    let r = 0, gg = 0, b = 0, a = 0, k = 0;
    for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) {
      if (dx * dx + dy * dy > rr * rr) continue;
      k++; const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const o = (y * W + x) * 4, al = px[o + 3] / 255;
      r += px[o] * al; gg += px[o + 1] * al; b += px[o + 2] * al; a += al;
    }
    if (a / k < 0.5) return null; // image vide (transparente) à cet endroit
    return rgbLab([r / a, gg / a, b / a]);
  });
  verifCache.cle = cle; verifCache.labs = labs;
  return labs;
}

function calculerVerif(labs) {
  const pal = P.couleurs.map((c) => (c && c.hex ? rgbLab(hexRgb(c.hex)) : null));
  const utilisees = [...new Set(P.cases.filter((v) => v >= 0))].filter((v) => pal[v]);
  const ec = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const autres = [], enTrop = [];
  P.cases.forEach((v, i) => {
    if (v < 0 || !pal[v]) return;
    const L = labs[i];
    if (!L) { enTrop.push(i); return; }
    const dPerle = ec(pal[v], L);
    let mieux = v, dMieux = dPerle;
    for (const u of utilisees) { const du = ec(pal[u], L); if (du < dMieux) { dMieux = du; mieux = u; } }
    if (mieux !== v && dPerle - dMieux > SEUIL_VERIF) autres.push([i, mieux]);
  });
  return { autres, enTrop };
}

function majVerif(d) {
  const bv = barreCalque.querySelector('.calque-verif'), compte = barreCalque.querySelector('.calque-compte'), corr = barreCalque.querySelector('.calque-corriger');
  bv.classList.toggle('actif', verifActive); bv.setAttribute('aria-pressed', String(verifActive));
  if (!d || !verifActive) { verifCv.hidden = true; compte.hidden = true; corr.hidden = true; return; }
  const labs = couleursImageSous(d);
  if (!labs) { compte.hidden = false; compte.textContent = '…'; return; }
  verifRes = calculerVerif(labs);
  const n = verifRes.autres.length + verifRes.enTrop.length;
  compte.hidden = false;
  compte.textContent = n ? `${n} à vérifier` : '✓ Tout va bien';
  compte.title = n ? `${verifRes.autres.length} d’une autre couleur que l’image, ${verifRes.enTrop.length} là où l’image est vide (pointillés)` : '';
  corr.hidden = !verifRes.autres.length;
  // les cercles, sur une couche de la taille de la toile
  const z = reglages.zoom, k = toile.width ? toile.clientWidth / toile.width : 1;
  verifCv.width = toile.width; verifCv.height = toile.height;
  Object.assign(verifCv.style, { left: toile.offsetLeft + 'px', top: toile.offsetTop + 'px', width: toile.clientWidth + 'px', height: toile.clientHeight + 'px' });
  const g = verifCv.getContext('2d');
  g.clearRect(0, 0, verifCv.width, verifCv.height);
  g.lineWidth = Math.max(2, z * 0.12);
  const cercle = (i, tirets) => {
    const q = SURF.picots[i];
    g.setLineDash(tirets ? [z * 0.18, z * 0.14] : []);
    g.beginPath(); g.arc(MARGE + q.x * z, MARGE + q.y * z, z * 0.56, 0, Math.PI * 2);
    g.strokeStyle = '#fff'; g.lineWidth = Math.max(3, z * 0.2); g.stroke();
    g.strokeStyle = '#e0245e'; g.lineWidth = Math.max(2, z * 0.12); g.stroke();
  };
  for (const [i] of verifRes.autres) cercle(i, false);
  for (const i of verifRes.enTrop) cercle(i, true);
  verifCv.hidden = false;
}

barreCalque.querySelector('.calque-verif').onclick = () => { verifActive = !verifActive; majCalque(); };
barreCalque.querySelector('.calque-corriger').onclick = () => {
  if (!verifRes.autres.length) return;
  memoriser();
  for (const [i, c] of verifRes.autres) P.cases[i] = c;
  const n = verifRes.autres.length;
  fini();
  message(`Perles corrigées : ${n}. « Annuler » pour revenir en arrière.`, 4000);
};

// premier affichage (à la fin : toutes les déclarations ci-dessus doivent exister)
majCalque();
