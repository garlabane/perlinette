'use strict';
// Outil « Sélection » : choisir une zone du motif puis la copier, la couper, la coller
// (dans le même motif ou dans un autre), la retourner, la supprimer.
//  • sélectionner : cliquer un coin puis l'autre, ou glisser ;
//  • Ctrl+C copier · Ctrl+X couper · Ctrl+V coller · Suppr effacer · Échap annuler ;
//  • en collage, l'aperçu suit la souris : un clic pose la copie (doigt : on lève le doigt à l'endroit voulu) ;
//  • ⟲ ⟳ ↔ ↕ tournent / retournent la zone sélectionnée (ou la copie) avant de la poser.
// Le presse-papiers est gardé dans le navigateur : on peut coller dans un autre motif.

const CLE_PP = 'perlesrep.pressepapier';
const SEL = { rect: null, coin: null, glisse: false, depart: null, collage: false, cible: null };

function pos(e) {
  const b = toile.getBoundingClientRect();
  const px = (e.clientX - b.left) * (toile.width / b.width), py = (e.clientY - b.top) * (toile.height / b.height);
  return { x: (px - MARGE) / reglages.zoom, y: (py - MARGE) / reglages.zoom };
}
function rectDe(a, b) { return { x0: Math.min(a.x, b.x), y0: Math.min(a.y, b.y), x1: Math.max(a.x, b.x), y1: Math.max(a.y, b.y) }; }
function picotsDans(r) {
  const res = [];
  SURF.picots.forEach((q, i) => { if (q.x >= r.x0 - 0.5 && q.x <= r.x1 + 0.5 && q.y >= r.y0 - 0.5 && q.y <= r.y1 + 0.5) res.push(i); });
  return res;
}
function lirePP() { try { return JSON.parse(localStorage.getItem(CLE_PP) || 'null'); } catch (e) { return null; } }
function ecrirePP(pp) { try { localStorage.setItem(CLE_PP, JSON.stringify(pp)); } catch (e) { /* trop gros : reste en mémoire */ } SEL.pp = pp; }
function presse() { return SEL.pp || lirePP(); }

function copier(couper) {
  if (!SEL.rect) { message('Sélectionne d’abord une zone (outil Sélection).'); return false; }
  const ids = picotsDans(SEL.rect).filter((i) => P.cases[i] >= 0);
  if (!ids.length) { message('Il n’y a aucune perle dans la sélection.'); return false; }
  const x0 = Math.min(...ids.map((i) => SURF.picots[i].x)), y0 = Math.min(...ids.map((i) => SURF.picots[i].y));
  const perles = ids.map((i) => ({ dx: SURF.picots[i].x - x0, dy: SURF.picots[i].y - y0, c: { ...P.couleurs[P.cases[i]] } }));
  ecrirePP({ perles });
  if (couper) { memoriser(); for (const i of ids) P.cases[i] = -1; fini(); }
  message(`${perles.length} perle${perles.length > 1 ? 's' : ''} ${couper ? 'coupée' : 'copiée'}${perles.length > 1 ? 's' : ''}. Ctrl+V pour coller.`);
  return true;
}
function effacerSel() {
  if (!SEL.rect) return;
  const ids = picotsDans(SEL.rect).filter((i) => P.cases[i] >= 0);
  if (!ids.length) return;
  memoriser(); for (const i of ids) P.cases[i] = -1; fini();
}
function commencerCollage() {
  const pp = presse();
  if (!pp || !pp.perles.length) { message('Rien à coller : copie d’abord une sélection.'); return; }
  if (S.outil !== 'selection') choisirOutil('selection');
  SEL.collage = true; SEL.rect = null; SEL.coin = null;
  toile.classList.add('attente');
  message('Déplace la souris et clique pour poser la copie (Échap pour annuler).', 3500);
  majBarreSel(); toutMettreAJour();
}
// Retourner / tourner la copie. S'il y a une zone sélectionnée, on la copie d'abord :
// « sélectionner, ↻, cliquer où poser » suffit (l'original reste en place ; Couper pour le déplacer).
function transformerPP(op) {
  if (SEL.rect && !SEL.collage && !copier(false)) return;
  let pp = presse();
  if (!pp || !pp.perles.length) { message('Sélectionne d’abord une zone, ou copie-la.'); return; }
  if ((op === 'd' || op === 'g') && !pp.perles.every((q) => Number.isInteger(q.dx) && Number.isInteger(q.dy))) {
    message('La rotation marche sur les plaques carrées ; ici, utilise ↔ et ↕.', 3500); return;
  }
  pp = { perles: pp.perles.map((q) => ({ dx: q.dx, dy: q.dy, c: q.c })) };
  const W = Math.max(...pp.perles.map((q) => q.dx)), H = Math.max(...pp.perles.map((q) => q.dy));
  for (const q of pp.perles) {
    const { dx, dy } = q;
    if (op === 'h') q.dx = W - dx;
    else if (op === 'v') q.dy = H - dy;
    else if (op === 'd') { q.dx = H - dy; q.dy = dx; }
    else if (op === 'g') { q.dx = dy; q.dy = W - dx; }
  }
  ecrirePP(pp);
  if (!SEL.collage) commencerCollage();
  else { if (SEL.dernier) SEL.cible = cibleCollage(SEL.dernier); toutMettreAJour(); }
}
// picots visés par le collage (ancre = le picot sous la souris)
function cibleCollage(e) {
  const pp = presse(); if (!pp) return null;
  const p = pos(e), a = picotProche(SURF, p.x, p.y, 0.8);
  if (a < 0) return null;
  const ax = SURF.picots[a].x, ay = SURF.picots[a].y, res = [];
  if (!SEL.seau || SEL.seauDe !== SURF) {
    SEL.seau = new Map(); SEL.seauDe = SURF;
    SURF.picots.forEach((q, i) => SEL.seau.set(Math.round(q.x * 2) + ',' + Math.round(q.y * 2), i));
  }
  for (const pe of pp.perles) {
    const i = SEL.seau.get(Math.round((ax + pe.dx) * 2) + ',' + Math.round((ay + pe.dy) * 2));
    if (i !== undefined) res.push([i, pe.c]);
  }
  return res;
}
function poserCollage() {
  if (!SEL.cible || !SEL.cible.length) return;
  memoriser();
  for (const [i, c] of SEL.cible) {
    let k = P.couleurs.findIndex((x) => x.code === c.code && x.hex === c.hex);
    if (k < 0) { P.couleurs.push({ ...c, marque: c.marque || (typeof marqueDe === 'function' ? marqueDe(c) : '') }); k = P.couleurs.length - 1; }
    P.cases[i] = k;
  }
  const n = SEL.cible.length;
  SEL.collage = false; SEL.pose = false; SEL.cible = null; toile.classList.remove('attente');
  fini(); majBarreSel();
  message(`${n} perle${n > 1 ? 's' : ''} collée${n > 1 ? 's' : ''}. Ctrl+V pour coller encore.`);
}
function annulerSel() { SEL.rect = null; SEL.coin = null; SEL.collage = false; SEL.pose = false; SEL.cible = null; SEL.glisse = false; toile.classList.remove('attente'); majBarreSel(); toutMettreAJour(); }

// --- évènements : interceptés avant ceux du dessin quand l'outil Sélection est actif ---
const zone = document.getElementById('zone');
zone.addEventListener('pointerdown', (e) => {
  if (S.outil !== 'selection' || e.target !== toile || e.button === 1) return;
  e.stopPropagation(); e.preventDefault();
  if (SEL.collage) {
    SEL.dernier = { clientX: e.clientX, clientY: e.clientY };
    SEL.cible = cibleCollage(e);
    // doigt ou stylet : on voit l'aperçu sous le doigt, la copie se pose quand on le lève
    if (e.pointerType && e.pointerType !== 'mouse') { SEL.pose = true; try { toile.setPointerCapture(e.pointerId); } catch (x) { /* ignoré */ } toutMettreAJour(); }
    else poserCollage();
    return;
  }
  const p = pos(e);
  if (SEL.coin) { SEL.rect = rectDe(SEL.coin, p); SEL.coin = null; toile.classList.remove('attente'); majBarreSel(); toutMettreAJour(); return; }
  SEL.depart = p; SEL.glisse = true; SEL.rect = rectDe(p, p);
  toile.setPointerCapture(e.pointerId);
  toutMettreAJour();
}, true);
zone.addEventListener('pointermove', (e) => {
  if (S.outil !== 'selection' || e.target !== toile) return;
  e.stopPropagation();
  if (SEL.collage) {
    SEL.dernier = { clientX: e.clientX, clientY: e.clientY };
    if (e.pointerType === 'mouse' || SEL.pose) { SEL.cible = cibleCollage(e); toutMettreAJour(); }
    return;
  }
  const p = pos(e);
  if (SEL.glisse) { SEL.rect = rectDe(SEL.depart, p); toutMettreAJour(); }
  else if (SEL.coin) { SEL.rect = rectDe(SEL.coin, p); toutMettreAJour(); }
}, true);
zone.addEventListener('pointerup', (e) => {
  if (S.outil !== 'selection' || e.target !== toile) return;
  e.stopPropagation();
  if (SEL.pose) { SEL.pose = false; if (SEL.cible && SEL.cible.length) poserCollage(); else toutMettreAJour(); return; }
  if (!SEL.glisse) return;
  SEL.glisse = false;
  const p = pos(e);
  if (Math.hypot(p.x - SEL.depart.x, p.y - SEL.depart.y) < 0.6) {
    // simple clic : on attend le coin opposé
    SEL.coin = SEL.depart; toile.classList.add('attente');
    message('Clique maintenant le coin opposé de la zone (Échap pour annuler).', 3000);
  } else SEL.rect = rectDe(SEL.depart, p);
  majBarreSel(); toutMettreAJour();
}, true);

document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, select, textarea, dialog[open]')) return;
  const k = e.key.toLowerCase();
  if (e.ctrlKey && k === 'c' && S.outil === 'selection') { e.preventDefault(); copier(false); return; }
  if (e.ctrlKey && k === 'x' && S.outil === 'selection') { e.preventDefault(); copier(true); return; }
  if (e.ctrlKey && k === 'v') { e.preventDefault(); commencerCollage(); return; }
  if (e.ctrlKey && k === 'a' && S.outil === 'selection') { e.preventDefault(); SEL.rect = { x0: 0, y0: 0, x1: SURF.larg, y1: SURF.haut }; majBarreSel(); toutMettreAJour(); return; }
  if (S.outil === 'selection' && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); effacerSel(); return; }
  if (e.key === 'Escape' && (SEL.rect || SEL.coin || SEL.collage)) { annulerSel(); return; }
  if (!e.ctrlKey && !e.altKey && k === 's' && !e.target.closest('input')) choisirOutil('selection');
});

// --- dessin par-dessus le rendu ---
const renduSansSel = rendu;
rendu = function () {
  renduSansSel();
  if (S.outil !== 'selection') return;
  const z = reglages.zoom;
  if (SEL.rect) {
    const r = SEL.rect;
    ctx.save();
    ctx.strokeStyle = '#6e2f5c'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.fillStyle = 'rgba(110,47,92,.08)';
    const x = MARGE + (r.x0 - 0.5) * z, y = MARGE + (r.y0 - 0.5) * z, w = (r.x1 - r.x0 + 1) * z, h = (r.y1 - r.y0 + 1) * z;
    ctx.fillRect(x, y, w, h); ctx.strokeRect(x, y, w, h);
    ctx.restore();
  }
  if (SEL.collage && SEL.cible) {
    ctx.save(); ctx.globalAlpha = 0.8;
    for (const [i, c] of SEL.cible) {
      const q = SURF.picots[i];
      ctx.beginPath(); ctx.arc(MARGE + q.x * z, MARGE + q.y * z, z * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = c.hex; ctx.fill(); ctx.strokeStyle = '#6e2f5c'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  }
};

// --- petite barre d'actions, visible avec l'outil Sélection ---
const barreSel = document.createElement('div');
barreSel.id = 'barreSel'; barreSel.className = 'barre-sel'; barreSel.hidden = true;
barreSel.innerHTML = `
  <span class="barre-sel-titre">Sélection</span>
  <button type="button" data-sel="copier" title="Copier (Ctrl+C)">Copier</button>
  <button type="button" data-sel="couper" title="Couper (Ctrl+X)">Couper</button>
  <button type="button" data-sel="coller" title="Coller (Ctrl+V)">Coller</button>
  <button type="button" data-sel="g" title="Tourner d’un quart de tour vers la gauche">⟲</button>
  <button type="button" data-sel="d" title="Tourner d’un quart de tour vers la droite">⟳</button>
  <button type="button" data-sel="h" title="Miroir gauche/droite">↔</button>
  <button type="button" data-sel="v" title="Miroir haut/bas">↕</button>
  <button type="button" data-sel="effacer" title="Effacer les perles sélectionnées (Suppr)">Effacer</button>
  <button type="button" data-sel="tout" title="Tout sélectionner (Ctrl+A)">Tout</button>`;
document.body.appendChild(barreSel);
barreSel.addEventListener('click', (e) => {
  const b = e.target.closest('[data-sel]'); if (!b) return;
  const a = b.dataset.sel;
  if (a === 'copier') copier(false);
  else if (a === 'couper') copier(true);
  else if (a === 'coller') commencerCollage();
  else if (a === 'h' || a === 'v' || a === 'g' || a === 'd') transformerPP(a);
  else if (a === 'effacer') effacerSel();
  else if (a === 'tout') { SEL.rect = { x0: 0, y0: 0, x1: SURF.larg, y1: SURF.haut }; majBarreSel(); toutMettreAJour(); }
});
function majBarreSel() {
  barreSel.hidden = S.outil !== 'selection';
  const pp = presse(), aSel = !!SEL.rect;
  barreSel.querySelector('[data-sel="copier"]').disabled = !aSel;
  barreSel.querySelector('[data-sel="couper"]').disabled = !aSel;
  barreSel.querySelector('[data-sel="effacer"]').disabled = !aSel;
  barreSel.querySelector('[data-sel="coller"]').disabled = !pp;
  for (const t of ['h', 'v', 'g', 'd']) barreSel.querySelector(`[data-sel="${t}"]`).disabled = !pp && !aSel;
}
// changer d'outil : on range la sélection
const choisirOutilSansSel = choisirOutil;
choisirOutil = function (o) {
  if (o !== 'selection') { SEL.rect = null; SEL.coin = null; SEL.collage = false; SEL.pose = false; SEL.cible = null; toile.classList.remove('attente'); }
  choisirOutilSansSel(o);
  majBarreSel();
  if (typeof majOptionsForme === 'function') majOptionsForme();
  toutMettreAJour();
};
setTimeout(majBarreSel, 0);
