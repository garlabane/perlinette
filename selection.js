'use strict';
// Outil « Sélection » : choisir une zone du motif puis la copier, la couper, la coller
// (dans le même motif ou dans un autre), la retourner, la supprimer.
//  • sélectionner : cliquer un coin puis l'autre, ou glisser ;
//  • Ctrl+C copier · Ctrl+X couper · Ctrl+V coller · Suppr effacer · Échap annuler ;
//  • en collage, l'aperçu suit la souris : un clic pose la copie (doigt : on lève le doigt à l'endroit voulu) ;
//  • ⟲ ⟳ ↔ ↕ tournent / retournent la zone sélectionnée (ou la copie) avant de la poser.
// Le presse-papiers est gardé dans le navigateur : on peut coller dans un autre motif.

const CLE_PP = 'perlesrep.pressepapier';
const SEL = { rect: null, ids: null, coin: null, glisse: false, depart: null, collage: false, cible: null };
// mode de sélection : « zone » (encadrer), « baguette » (une touche : tout ce qui se touche),
// « couleur » (une touche : les perles de cette couleur qui se touchent)
SEL.mode = ['zone', 'baguette', 'couleur'].includes(reglages.selMode) ? reglages.selMode : 'zone';
// les picots sélectionnés, quelle que soit la façon de les avoir choisis
function idsSel() { return SEL.ids ? [...SEL.ids] : SEL.rect ? picotsDans(SEL.rect) : []; }
function aSelection() { return !!(SEL.rect || (SEL.ids && SEL.ids.size)); }
// baguette magique : les perles reliées à celle touchée (par un côté, comme elles se soudent)
function baguette(i, memeCouleur) {
  const vu = new Set([i]), pile = [i], c0 = P.cases[i];
  while (pile.length) {
    const k = pile.pop();
    for (const j of SURF.voisins[k]) {
      if (vu.has(j) || P.cases[j] < 0 || (memeCouleur && P.cases[j] !== c0)) continue;
      vu.add(j); pile.push(j);
    }
  }
  return vu;
}

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

function copier(couper, silencieux) {
  if (!aSelection()) { message('Sélectionne d’abord une zone ou touche une perle avec la baguette (outil Sélection).'); return false; }
  const ids = idsSel().filter((i) => P.cases[i] >= 0);
  if (!ids.length) { message('Il n’y a aucune perle dans la sélection.'); return false; }
  const x0 = Math.min(...ids.map((i) => SURF.picots[i].x)), y0 = Math.min(...ids.map((i) => SURF.picots[i].y));
  const perles = ids.map((i) => ({ dx: SURF.picots[i].x - x0, dy: SURF.picots[i].y - y0, c: { ...P.couleurs[P.cases[i]] } }));
  ecrirePP({ perles });
  if (couper) { memoriser(); for (const i of ids) P.cases[i] = -1; fini(); }
  if (!silencieux) message(`${perles.length} perle${perles.length > 1 ? 's' : ''} ${couper ? 'coupée' : 'copiée'}${perles.length > 1 ? 's' : ''}. Ctrl+V pour coller.`);
  return true;
}
function effacerSel() {
  if (!aSelection()) return;
  const ids = idsSel().filter((i) => P.cases[i] >= 0);
  if (!ids.length) return;
  memoriser(); for (const i of ids) P.cases[i] = -1; fini();
}
function commencerCollage() {
  const pp = presse();
  if (!pp || !pp.perles.length) { message('Rien à coller : copie d’abord une sélection.'); return; }
  if (S.outil !== 'selection') choisirOutil('selection');
  SEL.collage = true; SEL.rect = null; SEL.ids = null; SEL.coin = null;
  toile.classList.add('attente');
  message('Déplace la souris et clique pour poser la copie (Échap pour annuler).', 3500);
  majBarreSel(); toutMettreAJour();
}
// Retourner / tourner la copie. S'il y a une zone sélectionnée, on la copie d'abord :
// « sélectionner, ↻, cliquer où poser » suffit (l'original reste en place ; Couper pour le déplacer).
function transformerPP(op) {
  if (aSelection() && !SEL.collage) { if (!copier(true, true)) return; SEL.coupe = true; }
  let pp = presse();
  if (!pp || !pp.perles.length) { message('Sélectionne d’abord une zone, ou copie-la.'); return; }
  if ((op === 'd' || op === 'g') && !pp.perles.every((q) => Number.isInteger(q.dx) && Number.isInteger(q.dy))) {
    message('La rotation marche sur les plaques carrées ; ici, utilise ↔ et ↕.', 3500); return;
  }
  pp = { perles: pp.perles.map((q) => ({ dx: q.dx, dy: q.dy, c: q.c })), centre: pp.centre };
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
  const p = pos(e), a = picotProche(SURF, p.x, p.y, pp.centre ? 1.5 : 0.8);
  if (a < 0) return null;
  if (!SEL.seau || SEL.seauDe !== SURF) {
    SEL.seau = new Map(); SEL.seauDe = SURF;
    SURF.picots.forEach((q, i) => SEL.seau.set(Math.round(q.x * 2) + ',' + Math.round(q.y * 2), i));
  }
  // rangées décalées (plaque hexagonale…) : les pas verticaux valent √3/2 au lieu de 1
  const decale = pp.perles.some((q) => !Number.isInteger(q.dy)), pasY = decale ? Math.sqrt(3) / 2 : 1;
  let ax = SURF.picots[a].x, ay = SURF.picots[a].y;
  // une image ou un texte ajouté se tient par son milieu (la souris est au centre), une copie par son coin
  if (pp.centre) {
    if (!pp.larg) { pp.larg = Math.max(...pp.perles.map((q) => q.dx)); pp.haut = Math.max(...pp.perles.map((q) => q.dy)); }
    // le coin haut-gauche est souvent hors de la plaque (coins d'un hexagone) : on le calcule sur la grille virtuelle,
    // dont les rangées sont décalées d'un demi-picot une sur deux
    const kRangs = Math.round(pp.haut / 2 / pasY);
    ax -= Math.round(pp.larg / 2) - (decale && kRangs % 2 ? 0.5 : 0);
    ay -= kRangs * pasY;
  }
  const poser = (x, y) => {
    const r = [];
    for (const pe of pp.perles) {
      const i = SEL.seau.get(Math.round((x + pe.dx) * 2) + ',' + Math.round((y + pe.dy) * 2));
      if (i !== undefined) r.push([i, pe.c]);
    }
    return r;
  };
  // la copie ne tombe sur des picots que si l'ancre est sur une rangée de même parité : on essaie l'ancre et ses voisines
  let res = poser(ax, ay);
  if (res.length < pp.perles.length) {
    for (const [dx, dy] of decale ? [[1, 0], [-1, 0], [0.5, pasY], [-0.5, pasY], [0.5, -pasY], [-0.5, -pasY]] : [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const r = poser(ax + dx, ay + dy); if (r.length > res.length) res = r;
    }
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
  const n = SEL.cible.length, perdues = (presse()?.perles.length || n) - n;
  SEL.collage = false; SEL.pose = false; SEL.cible = null; SEL.coupe = false; toile.classList.remove('attente');
  fini(); majBarreSel();
  message(`${n} perle${n > 1 ? 's' : ''} collée${n > 1 ? 's' : ''}.` + (perdues > 0 ? ` ${perdues} dépassai${perdues > 1 ? 'ent' : 't'} de la plaque : Annuler, puis recolle plus à gauche ou plus haut.` : ' Ctrl+V pour coller encore.'), perdues > 0 ? 7000 : undefined);
}
function annulerSel() { if (SEL.coupe && SEL.collage) { SEL.coupe = false; SEL.collage = false; annuler(); } SEL.rect = null; SEL.ids = null; SEL.coin = null; SEL.collage = false; SEL.pose = false; SEL.cible = null; SEL.glisse = false; toile.classList.remove('attente'); majBarreSel(); toutMettreAJour(); }

// --- déplacer la sélection : on attrape une de ses perles et on fait glisser (l'original s'en va) ---
function seauSurf() {
  if (!SEL.seau || SEL.seauDe !== SURF) {
    SEL.seau = new Map(); SEL.seauDe = SURF;
    SURF.picots.forEach((q, i) => SEL.seau.set(Math.round(q.x * 2) + ',' + Math.round(q.y * 2), i));
  }
  return SEL.seau;
}
function commencerDeplacement(e, i0, ids) {
  memoriser();
  const g = SURF.picots[i0];
  SEL.deplace = { perles: ids.map((i) => ({ dx: SURF.picots[i].x - g.x, dy: SURF.picots[i].y - g.y, v: P.cases[i] })), cible: null };
  for (const i of ids) P.cases[i] = -1;
  SEL.rect = null; SEL.ids = null; SEL.coin = null;
  SEL.deplace.cible = cibleDeplacement(i0);
  try { toile.setPointerCapture(e.pointerId); } catch (x) { /* ignoré */ }
  toutMettreAJour();
}
// la translation d'un picot à un autre garde la forme (aussi sur une plaque à rangées décalées)
function cibleDeplacement(a) {
  const sx = seauSurf(), q = SURF.picots[a], r = [];
  for (const pe of SEL.deplace.perles) {
    const i = sx.get(Math.round((q.x + pe.dx) * 2) + ',' + Math.round((q.y + pe.dy) * 2));
    if (i !== undefined) r.push([i, pe.v]);
  }
  return r;
}
function finirDeplacement() {
  const d = SEL.deplace; SEL.deplace = null;
  const ids = new Set();
  for (const [i, v] of d.cible || []) { P.cases[i] = v; ids.add(i); }
  const perdues = d.perles.length - ids.size;
  SEL.ids = ids.size ? ids : null;
  fini(); majBarreSel();
  if (perdues > 0) message(`${perdues} perle${perdues > 1 ? 's' : ''} hors de la plaque. « Annuler » pour revenir.`, 5000);
}

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
  // une perle de la sélection attrapée : toute la sélection se déplace avec le doigt ou la souris
  if (aSelection()) {
    const i0 = picotProche(SURF, p.x, p.y), ids = idsSel().filter((i) => P.cases[i] >= 0);
    if (i0 >= 0 && ids.includes(i0)) { commencerDeplacement(e, i0, ids); return; }
  }
  if (SEL.mode !== 'zone') {
    const i = picotProche(SURF, p.x, p.y);
    if (i < 0 || P.cases[i] < 0) { if (!e.shiftKey) { SEL.ids = null; majBarreSel(); toutMettreAJour(); } message('Touche une perle du motif.'); return; }
    const ens = baguette(i, SEL.mode === 'couleur');
    if (e.shiftKey && SEL.ids) for (const k of ens) SEL.ids.add(k); else SEL.ids = ens;
    SEL.rect = null;
    majBarreSel(); toutMettreAJour();
    message(`${SEL.ids.size} perle${SEL.ids.size > 1 ? 's' : ''} sélectionnée${SEL.ids.size > 1 ? 's' : ''}. Maj + clic pour en ajouter.`, 2500);
    return;
  }
  SEL.ids = null;
  if (SEL.coin) { SEL.rect = rectDe(SEL.coin, p); SEL.coin = null; toile.classList.remove('attente'); majBarreSel(); toutMettreAJour(); return; }
  SEL.depart = p; SEL.glisse = true; SEL.rect = rectDe(p, p);
  toile.setPointerCapture(e.pointerId);
  toutMettreAJour();
}, true);
zone.addEventListener('pointermove', (e) => {
  if (S.outil !== 'selection' || e.target !== toile) return;
  e.stopPropagation();
  if (SEL.deplace) {
    const pd = pos(e), a = picotProche(SURF, pd.x, pd.y, 1.5);
    if (a >= 0) { SEL.deplace.cible = cibleDeplacement(a); toutMettreAJour(); }
    return;
  }
  // au survol d'une perle sélectionnée, le curseur montre qu'on peut la déplacer
  if (!SEL.glisse && !SEL.coin && !SEL.collage && e.pointerType === 'mouse') {
    const pm = pos(e), im = picotProche(SURF, pm.x, pm.y);
    toile.style.cursor = aSelection() && im >= 0 && P.cases[im] >= 0 && (SEL.ids ? SEL.ids.has(im) : idsSel().includes(im)) ? 'move' : '';
  }
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
  if (SEL.deplace) { finirDeplacement(); return; }
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
  if (e.ctrlKey && k === 'a' && S.outil === 'selection') { e.preventDefault(); toutSelectionner(); return; }
  if (S.outil === 'selection' && (e.key === 'Delete' || e.key === 'Backspace')) { e.preventDefault(); effacerSel(); return; }
  if (e.key === 'Escape' && (SEL.rect || SEL.ids || SEL.coin || SEL.collage)) { annulerSel(); return; }
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
  if (SEL.ids && SEL.ids.size) {
    ctx.save();
    ctx.strokeStyle = '#6e2f5c'; ctx.lineWidth = Math.max(1.5, z * 0.12); ctx.fillStyle = 'rgba(110,47,92,.18)';
    for (const i of SEL.ids) {
      const q = SURF.picots[i];
      ctx.beginPath(); ctx.arc(MARGE + q.x * z, MARGE + q.y * z, z * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    ctx.restore();
  }
  if (SEL.deplace && SEL.deplace.cible) {
    ctx.save(); ctx.globalAlpha = 0.85;
    for (const [i, v] of SEL.deplace.cible) {
      const q = SURF.picots[i], c = P.couleurs[v];
      ctx.beginPath(); ctx.arc(MARGE + q.x * z, MARGE + q.y * z, z * 0.45, 0, Math.PI * 2);
      ctx.fillStyle = c ? c.hex : '#999'; ctx.fill(); ctx.strokeStyle = '#6e2f5c'; ctx.lineWidth = 1.5; ctx.stroke();
    }
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
  <span class="sel-modes" role="group" aria-label="Façon de sélectionner">
    <button type="button" data-mode-sel="zone" title="Encadrer une zone (glisser, ou cliquer deux coins)">▭ Zone</button>
    <button type="button" data-mode-sel="baguette" title="Baguette magique : une touche choisit tout le motif qui se touche">✨ Baguette</button>
    <button type="button" data-mode-sel="couleur" title="Une touche choisit les perles de cette couleur qui se touchent">🎨 Même couleur</button>
  </span>
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
function toutSelectionner() {
  const ids = new Set(); P.cases.forEach((v, i) => { if (v >= 0) ids.add(i); });
  SEL.ids = ids.size ? ids : null; SEL.rect = null; majBarreSel(); toutMettreAJour();
}
barreSel.addEventListener('click', (e) => {
  const m = e.target.closest('[data-mode-sel]');
  if (m) {
    SEL.mode = m.dataset.modeSel; reglages.selMode = SEL.mode; ecrire(CLE.reglages, reglages);
    SEL.coin = null; toile.classList.remove('attente');
    majBarreSel();
    message(SEL.mode === 'zone' ? 'Glisse pour encadrer une zone.' : SEL.mode === 'baguette' ? 'Touche une perle : tout le motif qui se touche est choisi.' : 'Touche une perle : sa couleur, là où elle se touche, est choisie.', 3000);
    return;
  }
  const b = e.target.closest('[data-sel]'); if (!b) return;
  const a = b.dataset.sel;
  if (a === 'copier') copier(false);
  else if (a === 'couper') copier(true);
  else if (a === 'coller') commencerCollage();
  else if (a === 'h' || a === 'v' || a === 'g' || a === 'd') transformerPP(a);
  else if (a === 'effacer') effacerSel();
  else if (a === 'tout') toutSelectionner();
});
function majBarreSel() {
  barreSel.hidden = S.outil !== 'selection';
  const pp = presse(), aSel = aSelection();
  barreSel.querySelectorAll('[data-mode-sel]').forEach((b) => b.classList.toggle('actif', b.dataset.modeSel === SEL.mode));
  barreSel.querySelector('[data-sel="copier"]').disabled = !aSel;
  barreSel.querySelector('[data-sel="couper"]').disabled = !aSel;
  barreSel.querySelector('[data-sel="effacer"]').disabled = !aSel;
  barreSel.querySelector('[data-sel="coller"]').disabled = !pp;
  for (const t of ['h', 'v', 'g', 'd']) barreSel.querySelector(`[data-sel="${t}"]`).disabled = !pp && !aSel;
}
// changer d'outil : on range la sélection
const choisirOutilSansSel = choisirOutil;
choisirOutil = function (o) {
  if (o !== 'selection' && SEL.deplace) finirDeplacement();
  if (o !== 'selection' && SEL.coupe && SEL.collage) { SEL.coupe = false; SEL.collage = false; annuler(); }
  if (o !== 'selection') { toile.style.cursor = ''; SEL.rect = null; SEL.ids = null; SEL.coin = null; SEL.collage = false; SEL.pose = false; SEL.cible = null; toile.classList.remove('attente'); }
  choisirOutilSansSel(o);
  majBarreSel();
  if (typeof majOptionsForme === 'function') majOptionsForme();
  toutMettreAJour();
};
setTimeout(majBarreSel, 0);
