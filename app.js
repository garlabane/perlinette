'use strict';
// Perlinette — éditeur de motifs sur plaques (Hama, Perler, Artkal).
// Modules : plaques.js (catalogue + picots), app.js (état, dessin, outils, fichiers),
// image.js (image → motif), impression.js (A4 à taille réelle).

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const SYMBOLES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abdefghkmnqrtuy+=%&#@'.split('');
const CLE = { courant: 'perlesrep.courant', projets: 'perlesrep.projets', plaques: 'perlesrep.plaques', reglages: 'perlesrep.reglages' };
const MARGE = 26;

// ---------- utilitaires ----------
function lire(cle, defaut) { try { const v = localStorage.getItem(cle); return v ? JSON.parse(v) : defaut; } catch (e) { return defaut; } }
function ecrire(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); return true; } catch (e) { console.warn(e); return false; } }
function nouvelId() { return 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function echap(t) { return String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); }
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbLab([r, g, b]) {
  const f = (v) => { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; };
  const R = f(r), G = f(g), B = f(b);
  const k = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = k((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047), Y = k(R * 0.2126 + G * 0.7152 + B * 0.0722), Z = k((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
function plusProche(lab, labs, autorises) {
  let m = -1, dMin = Infinity;
  for (const i of autorises) { const L = labs[i], d = (L[0] - lab[0]) ** 2 + (L[1] - lab[1]) ** 2 + (L[2] - lab[2]) ** 2; if (d < dMin) { dMin = d; m = i; } }
  return m;
}
// perles transparentes et phosphorescentes : rendu translucide pour les reconnaître
function estTransparente(c) { return !!c && /transparent|translucent|clear/i.test(c.nom || ''); }
function estPhospho(c) { return !!c && /glow/i.test(c.nom || ''); }
function clair(hex) { const [r, g, b] = hexRgb(hex); return 0.299 * r + 0.587 * g + 0.114 * b > 150; }
function message(txt, duree = 2400) {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div'); t.id = 'toast';
    Object.assign(t.style, { position: 'fixed', bottom: '18px', left: '50%', transform: 'translateX(-50%)', background: '#2f2a26', color: '#fff', padding: '8px 14px', borderRadius: '8px', zIndex: 99, transition: 'opacity .3s', maxWidth: '80vw' });
    document.body.appendChild(t);
  }
  t.textContent = txt; t.style.opacity = 1;
  clearTimeout(t._m); t._m = setTimeout(() => (t.style.opacity = 0), duree);
}
function remplirChoix(select, html, val) { select.innerHTML = html; if (val !== undefined) select.value = val; }

// ---------- formats et palettes ----------
function plaquesPerso() { return lire(CLE.plaques, []); }
function tousFormats() { return PLAQUES.concat(plaquesPerso()); }
function formatParId(id) { return tousFormats().find((f) => f.id === id) || PLAQUES[0]; }
function paletteParId(id) { return PALETTES_FUSIBLES.find((p) => p.id === id); }
function optionsFormats() {
  const groupes = {};
  for (const f of tousFormats()) { const g = f.type === 'perso' ? 'Mes plaques' : f.gamme + ' — ' + GAMMES[f.gamme].note; (groupes[g] = groupes[g] || []).push(f); }
  return Object.entries(groupes).map(([g, fs]) => `<optgroup label="${echap(g)}">${fs.map((f) => `<option value="${f.id}">${echap(f.nom)}${f.picots ? ' — ' + f.picots + ' picots' : ''}</option>`).join('')}</optgroup>`).join('');
}
function optionsPalettes() { return PALETTES_FUSIBLES.map((p) => `<option value="${p.id}">${echap(p.nom)}</option>`).join(''); }

// ---------- état ----------
let P = null;      // motif en cours
let SURF = null;   // surface calculée (picots, plaques, voisins)
const reglages = Object.assign({ zoom: 18, symboles: false, fusion: 0, alerteSoudure: true }, lire(CLE.reglages, {}));
const S = { outil: 'crayon', couleur: 0, annuler: [], refaire: [], dessin: false, dernier: null, efface: false };

function creerMotif(nom, formatId, cfg, paletteId) {
  const f = formatParId(formatId), pal = paletteParId(paletteId) || PALETTES_FUSIBLES[0];
  const m = { id: nouvelId(), version: 1, nom, format: f.id, cfg: { ...cfg }, pas: GAMMES[f.gamme]?.pas || pal.pas || 5, couleurs: pal.couleurs.map((c) => ({ ...c })), nuancier: pal.id, cases: [], modifie: Date.now() };
  const surf = construireSurface(f, m.cfg);
  m.cases = new Array(surf.picots.length).fill(-1);
  return m;
}
function charger(m) {
  P = m;
  if (typeof franciserMotif === 'function') franciserMotif(P);
  P.cfg = P.cfg || {};
  P.pas = +P.pas || 5;
  P.couleurs = Array.isArray(P.couleurs) ? P.couleurs : [];
  SURF = construireSurface(formatParId(P.format), P.cfg);
  if (!Array.isArray(P.cases) || P.cases.length !== SURF.picots.length) P.cases = new Array(SURF.picots.length).fill(-1);
  S.annuler = []; S.refaire = []; S.couleur = 0;
  fini();
  setTimeout(() => zoomAjuster(), 0); // un motif ouvert est toujours cadré à l'écran
}

// ---------- sauvegarde ----------
let minuterie = null;
function sauverAuto() { clearTimeout(minuterie); minuterie = setTimeout(sauverMaintenant, 400); }
function sauverMaintenant() {
  P.modifie = Date.now();
  const projets = lire(CLE.projets, {});
  projets[P.id] = P;
  const ok = ecrire(CLE.projets, projets) && ecrire(CLE.courant, P.id);
  if (!ok) message('Mémoire du navigateur pleine : utilise « Exporter fichier » pour garder ce motif.', 6000);
  return ok;
}

// ---------- annuler / refaire ----------
function instantane() { return JSON.stringify({ format: P.format, cfg: P.cfg, pas: P.pas, couleurs: P.couleurs, cases: P.cases }); }
function memoriser() { S.annuler.push(instantane()); if (S.annuler.length > 150) S.annuler.shift(); S.refaire = []; }
function restaurer(json) {
  const formatAvant = P.format + JSON.stringify(P.cfg);
  Object.assign(P, JSON.parse(json));
  if (P.format + JSON.stringify(P.cfg) !== formatAvant) SURF = construireSurface(formatParId(P.format), P.cfg);
  S.couleur = Math.min(S.couleur, Math.max(0, P.couleurs.length - 1));
}
function annuler() { if (!S.annuler.length) return; S.refaire.push(instantane()); restaurer(S.annuler.pop()); fini(); }
function refaire() { if (!S.refaire.length) return; S.annuler.push(instantane()); restaurer(S.refaire.pop()); fini(); }

// ---------- dessin à l'écran ----------
const toile = $('#toile');
const ctx = toile.getContext('2d');

function cheminContour(g, pl, z, ox, oy) {
  const x = ox + pl.x * z, y = oy + pl.y * z, w = pl.larg * z, h = pl.haut * z;
  g.beginPath();
  if (pl.contour.forme === 'rond') g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  else if (pl.contour.forme === 'hexa') {
    // hexagone « pointes à gauche et à droite » englobant les picots
    const m = (h / 2) / Math.sqrt(3);
    g.moveTo(x + m, y); g.lineTo(x + w - m, y); g.lineTo(x + w, y + h / 2); g.lineTo(x + w - m, y + h); g.lineTo(x + m, y + h); g.lineTo(x, y + h / 2); g.closePath();
  } else g.roundRect(x, y, w, h, z * 0.6);
}

function rendu() {
  const z = reglages.zoom;
  toile.width = Math.ceil(SURF.larg * z + 2 * MARGE);
  toile.height = Math.ceil(SURF.haut * z + 2 * MARGE);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, toile.width, toile.height);
  // fonds de plaques
  for (const pl of SURF.plaques) {
    if (pl.contour.forme === 'perso') continue;
    cheminContour(ctx, pl, z, MARGE, MARGE);
    ctx.fillStyle = '#f7f3ee'; ctx.fill();
    ctx.strokeStyle = '#d8cfc4'; ctx.setLineDash(SURF.plaques.length > 1 ? [5, 4] : []); ctx.lineWidth = 1; ctx.stroke(); ctx.setLineDash([]);
  }
  if (SURF.plaques.length > 1) {
    ctx.fillStyle = '#b3a89c'; ctx.font = '600 12px Segoe UI, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    for (const pl of SURF.plaques) ctx.fillText(pl.etiquette, MARGE + pl.x * z + 4, MARGE + pl.y * z + 3);
  }
  const symb = reglages.symboles && z >= 11;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.round(z * 0.5)}px Consolas, monospace`;
  const r = z * 0.45;
  // vérification de soudure (perles isolées, tenues par un coin, morceaux à part)
  S.soudure = analyserSoudure(SURF, P.cases);
  if (reglages.fusion > 0) dessinerFusion(ctx, z, MARGE, SURF, P, reglages.fusion, S.soudure);
  else SURF.picots.forEach((q, i) => {
    const cx = MARGE + q.x * z, cy = MARGE + q.y * z, v = P.cases[i];
    if (v < 0 || !P.couleurs[v]) {
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1, z * 0.13), 0, Math.PI * 2); ctx.fillStyle = '#d9d0c5'; ctx.fill();
      return;
    }
    const hex = P.couleurs[v].hex, transp = estTransparente(P.couleurs[v]);
    ctx.globalAlpha = transp ? 0.62 : 1;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = hex; ctx.fill();
    ctx.globalAlpha = 1;
    if (z >= 8) { ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 1; ctx.stroke(); }
    if (transp && z >= 8) { ctx.beginPath(); ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.fill(); }
    if (estPhospho(P.couleurs[v]) && z >= 8) { ctx.strokeStyle = 'rgba(120,230,120,.8)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, r * 0.8, 0, Math.PI * 2); ctx.stroke(); }
    if (symb) { ctx.fillStyle = clair(hex) ? '#000' : '#fff'; ctx.fillText(SYMBOLES[v % SYMBOLES.length], cx, cy + 1); }
    else if (z >= 7) { ctx.beginPath(); ctx.arc(cx, cy, z * 0.15, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fill(); }
  });
  // perles à problème : cercle rouge pointillé (on informe, on ne bloque rien)
  const aSignaler = [...S.soudure.isolees, ...S.soudure.coins];
  if (aSignaler.length && reglages.alerteSoudure !== false) {
    ctx.strokeStyle = '#d0021b'; ctx.lineWidth = Math.max(1.5, z * 0.1); ctx.setLineDash([3, 2]);
    for (const i of aSignaler) { const q = SURF.picots[i]; ctx.beginPath(); ctx.arc(MARGE + q.x * z, MARGE + q.y * z, z * 0.62, 0, Math.PI * 2); ctx.stroke(); }
    ctx.setLineDash([]);
  }
  // aperçu de la forme en cours de tracé
  if (S.apercu && S.apercu.length) {
    const hex = S.efface ? '#ffffff' : (P.couleurs[S.couleur]?.hex || '#999');
    ctx.globalAlpha = 0.75;
    for (const i of S.apercu) {
      const q = SURF.picots[i];
      ctx.beginPath(); ctx.arc(MARGE + q.x * z, MARGE + q.y * z, r, 0, Math.PI * 2);
      ctx.fillStyle = hex; ctx.fill();
      ctx.strokeStyle = '#6e2f5c'; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
}

// ---------- formes : ligne, rectangle, cercle — elles suivent les picots ----------
// a et b = indices des picots de départ et d'arrivée ; carre = touche Maj.
function picotsForme(type, a, b, plein, carre) {
  const A = SURF.picots[a], B0 = SURF.picots[b];
  let bx = B0.x, by = B0.y;
  if (carre && type !== 'ligne') {
    const d = Math.max(Math.abs(bx - A.x), Math.abs(by - A.y));
    bx = A.x + Math.sign(bx - A.x || 1) * d; by = A.y + Math.sign(by - A.y || 1) * d;
  }
  if (type === 'ligne') {
    const res = new Set(), long = Math.hypot(bx - A.x, by - A.y), n = Math.max(1, Math.ceil(long * 4));
    for (let k = 0; k <= n; k++) {
      const j = picotProche(SURF, A.x + ((bx - A.x) * k) / n, A.y + ((by - A.y) * k) / n);
      if (j >= 0) res.add(j);
    }
    return [...res];
  }
  const x0 = Math.min(A.x, bx), x1 = Math.max(A.x, bx), y0 = Math.min(A.y, by), y1 = Math.max(A.y, by);
  const e = 0.01;
  let dedans;
  if (type === 'rect') {
    // le bord passe par les picots de départ et d'arrivée (à une demi-perle près pour les rangs décalés)
    dedans = (q) => q.x >= x0 - 0.5 + e && q.x <= x1 + 0.5 - e && q.y >= y0 - 0.5 + e && q.y <= y1 + 0.5 - e;
  } else {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, rx = (x1 - x0) / 2 + 0.5, ry = (y1 - y0) / 2 + 0.5;
    dedans = (q) => ((q.x - cx) / rx) ** 2 + ((q.y - cy) / ry) ** 2 <= 1 + e;
  }
  // contour (évidé) : picot de la forme dont un point situé à 1 pas, dans l'une des 8
  // directions, sort de la forme — marche quelle que soit la disposition des picots.
  const DIR = [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7071, 0.7071], [-0.7071, 0.7071], [0.7071, -0.7071], [-0.7071, -0.7071]];
  const res = [];
  SURF.picots.forEach((q, i) => {
    if (!dedans(q)) return;
    if (plein || DIR.some(([dx, dy]) => !dedans({ x: q.x + dx, y: q.y + dy }))) res.push(i);
  });
  return res;
}
const FORMES = ['ligne', 'rect', 'ellipse'];

let prevu = false;
function toutMettreAJour() {
  if (prevu) return;
  prevu = true;
  requestAnimationFrame(() => {
    prevu = false;
    rendu();
    majCouleurs();
    majInfos();
    if (typeof majBoutonsCotes === 'function') majBoutonsCotes();
  });
}
function fini() { sauverAuto(); toutMettreAJour(); }

function comptes() {
  const n = new Array(P.couleurs.length).fill(0);
  for (const v of P.cases) if (v >= 0 && v < n.length) n[v]++;
  return n;
}
function majInfos() {
  const f = formatParId(P.format), nb = SURF.plaques.length;
  const cm = (v) => (v * P.pas / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  $('#nomProjet').textContent = P.nom;
  $('#infoPlaque').innerHTML = `${echap(f.nom)}${nb > 1 ? ` × ${nb} (${P.cfg.cols || 1} × ${P.cfg.rangs || 1})` : ''}<br>
    ${SURF.picots.length} picots · ${cm(SURF.larg)} × ${cm(SURF.haut)} cm (écart ${String(P.pas).replace('.', ',')} mm)<br>
    <small>Source : ${echap(f.source || 'ma plaque')}</small>`;
  const t = texteSoudure(S.soudure || analyserSoudure(SURF, P.cases)), el = $('#soudure');
  el.textContent = t; el.className = 'soudure ' + (t.startsWith('⚠') ? 'pb' : 'ok');
  el.title = t.startsWith('⚠') ? 'Au repassage, seules les perles qui se touchent par le côté se soudent. Les perles entourées de rouge risquent de tomber ou de se détacher.' : '';
}
// majCouleurs() : voir couleurs.js

// ---------- outils ----------
function choisirOutil(o) { if (S.formeEnAttente) { S.formeEnAttente = false; S.apercu = null; toile.classList.remove('attente'); S.annuler.pop(); toutMettreAJour(); } S.outil = o; $$('.outil').forEach((b) => b.classList.toggle('actif', b.dataset.outil === o)); }
function picotSous(e) {
  const b = toile.getBoundingClientRect();
  const px = (e.clientX - b.left) * (toile.width / b.width), py = (e.clientY - b.top) * (toile.height / b.height);
  return { px, py, i: picotProche(SURF, (px - MARGE) / reglages.zoom, (py - MARGE) / reglages.zoom) };
}
function appliquer(i, effacer) {
  if (i < 0) return;
  const outil = effacer ? 'gomme' : S.outil;
  if (!P.couleurs.length && outil !== 'gomme') { message('Ajoute d’abord une couleur.'); return; }
  if (outil === 'crayon') P.cases[i] = S.couleur;
  else if (outil === 'gomme') P.cases[i] = -1;
  else if (outil === 'remplir') remplir(i, S.couleur);
  else if (outil === 'pipette') { if (P.cases[i] >= 0) { S.couleur = P.cases[i]; choisirOutil('crayon'); } }
  else if (outil === 'lettre') { ouvrirCouleurLettre(i); return; }
  else if (outil === 'remplacer') { const de = P.cases[i]; for (let k = 0; k < P.cases.length; k++) if (P.cases[k] === de) P.cases[k] = S.couleur; }
  toutMettreAJour();
}
function remplir(depart, coul) {
  const cible = P.cases[depart];
  if (cible === coul) return;
  const pile = [depart], vu = new Uint8Array(P.cases.length);
  while (pile.length) {
    const i = pile.pop();
    if (vu[i] || P.cases[i] !== cible) continue;
    vu[i] = 1; P.cases[i] = coul;
    for (const j of SURF.voisins[i]) if (!vu[j]) pile.push(j);
  }
}
toile.addEventListener('contextmenu', (e) => e.preventDefault());
// Formes (ligne, rectangle, cercle) : deux façons de faire, au choix —
//  • glisser : appuyer sur le picot de départ, relâcher sur celui d'arrivée ;
//  • deux clics : cliquer le départ, déplacer la souris (l'aperçu suit), cliquer l'arrivée.
// Échap annule la forme en cours.
function poserForme() {
  for (const i of S.apercu || []) P.cases[i] = S.efface ? -1 : S.couleur;
  S.apercu = null; S.formeEnAttente = false; S.debut = undefined; S.fin = undefined;
  toile.classList.remove('attente');
  toutMettreAJour(); sauverAuto();
}
function majApercuForme(e) {
  const p = picotSous(e);
  if (p.i < 0) return;
  S.fin = p.i;
  S.apercu = picotsForme(S.outil, S.debut, p.i, $('#optPlein').checked, e.shiftKey);
  toutMettreAJour();
}
toile.addEventListener('pointerdown', (e) => {
  if (e.button === 1) return;
  const p = picotSous(e);
  if (p.i < 0) return;
  if (FORMES.includes(S.outil)) {
    if (S.formeEnAttente) { majApercuForme(e); poserForme(); return; } // 2e clic : on pose
    if (!P.couleurs.length && e.button !== 2) { message('Ajoute d’abord une couleur.'); return; }
    toile.setPointerCapture(e.pointerId);
    memoriser();
    S.dessin = true; S.efface = e.button === 2;
    S.debut = p.i; S.fin = p.i; S.apercu = [p.i];
    toutMettreAJour();
    return;
  }
  toile.setPointerCapture(e.pointerId);
  memoriser();
  S.dessin = true; S.efface = e.button === 2; S.dernier = p;
  appliquer(p.i, S.efface);
});
toile.addEventListener('pointermove', (e) => {
  if (FORMES.includes(S.outil) && (S.dessin || S.formeEnAttente)) { majApercuForme(e); return; }
  if (!S.dessin) return;
  const outil = S.efface ? 'gomme' : S.outil;
  if (outil !== 'crayon' && outil !== 'gomme') return;
  const p = picotSous(e), a = S.dernier, z = reglages.zoom;
  const pas = Math.max(1, Math.ceil(Math.hypot(p.px - a.px, p.py - a.py) / (z / 3)));
  for (let k = 1; k <= pas; k++) {
    const j = picotProche(SURF, (a.px + ((p.px - a.px) * k) / pas - MARGE) / z, (a.py + ((p.py - a.py) * k) / pas - MARGE) / z);
    if (j >= 0) P.cases[j] = outil === 'gomme' ? -1 : S.couleur;
  }
  S.dernier = p;
  toutMettreAJour();
});
const finTrait = (e) => {
  if (!S.dessin) return;
  S.dessin = false;
  if (S.apercu) {
    // relâché sur le picot de départ = simple clic → on attend le 2e clic
    if (e && e.type === 'pointerup' && S.fin === S.debut) {
      S.formeEnAttente = true;
      toile.classList.add('attente');
      message('Clique maintenant sur le picot d’arrivée (Échap pour annuler).', 3500);
      return;
    }
    poserForme();
    return;
  }
  sauverAuto();
};
toile.addEventListener('pointerup', finTrait);
toile.addEventListener('pointercancel', finTrait);

// Correspondance de position : pour chaque picot de B, la case du picot de A au même endroit.
function transposer(surfA, casesA, surfB, transfo = (x, y) => [x, y]) {
  const seau = new Map();
  surfA.picots.forEach((q, i) => { const k = Math.round(q.x * 2) + ',' + Math.round(q.y * 2); if (!seau.has(k)) seau.set(k, []); seau.get(k).push(i); });
  return surfB.picots.map((q) => {
    const [x, y] = transfo(q.x, q.y);
    let best = -1, d = 0.3;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const i of seau.get((Math.round(x * 2) + dx) + ',' + (Math.round(y * 2) + dy)) || []) {
        const e = Math.hypot(surfA.picots[i].x - x, surfA.picots[i].y - y);
        if (e < d) { d = e; best = i; }
      }
    }
    return best >= 0 ? casesA[best] : -1;
  });
}

// ---------- actions ----------
const actions = {
  nouveau: () => ouvrirPlaque(true),
  plaque: () => ouvrirPlaque(false),
  ouvrir: ouvrirListe,
  enregistrer: () => { if (sauverMaintenant()) message('Motif enregistré dans le navigateur.'); },
  exporter: exporterFichier,
  importerFichier: () => $('#fichierProjet').click(),
  image: () => ouvrirImage(),
  png: exporterPng,
  imprimer: () => ouvrirImpression(),
  annuler, refaire,
  miroirH: () => { memoriser(); P.cases = transposer(SURF, P.cases, SURF, (x, y) => [SURF.larg - x, y]); fini(); },
  miroirV: () => { memoriser(); P.cases = transposer(SURF, P.cases, SURF, (x, y) => [x, SURF.haut - y]); fini(); },
  vider: async () => { if (!(await confirmer('Retirer toutes les perles ? (« Annuler » reste possible ensuite.)', 'Tout retirer'))) return; memoriser(); P.cases.fill(-1); fini(); },
  versPlaque: enregistrerCommePlaque,
  ajouterCouleur: () => ouvrirAjoutCouleur(),
  biblio: () => ouvrirBibliotheque(),
  modeles: () => ouvrirModeles(),
  aide: () => afficherAide(),
  couleurs: () => ouvrirCouleurs(),
  mot: () => ecrirePhrase(),
  purger: purgerCouleurs,
};
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-action]');
  if (b && actions[b.dataset.action]) actions[b.dataset.action]();
  const o = e.target.closest('[data-outil]');
  if (o) choisirOutil(o.dataset.outil);
});
document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, select, textarea, dialog[open]')) return;
  const k = e.key.toLowerCase();
  if (e.ctrlKey && k === 'z') { e.preventDefault(); annuler(); return; }
  if (e.ctrlKey && (k === 'y' || (e.shiftKey && k === 'z'))) { e.preventDefault(); refaire(); return; }
  if (e.ctrlKey && k === 's') { e.preventDefault(); actions.enregistrer(); return; }
  if (e.ctrlKey || e.altKey) return;
  if (e.key === 'Escape' && S.apercu) { S.apercu = null; S.dessin = false; S.formeEnAttente = false; toile.classList.remove('attente'); S.annuler.pop(); toutMettreAJour(); return; }
  const r = { c: 'crayon', e: 'gomme', f: 'remplir', i: 'pipette', r: 'remplacer', l: 'ligne', q: 'rect', o: 'ellipse' };
  if (r[k]) choisirOutil(r[k]);
  if (k === '+' || k === '=') zoomer(1);
  if (k === '-') zoomer(-1);
  if (k === '0') zoomAjuster();
});
// ---------- zoom ----------
// par paliers (x1,25), en gardant sous la souris le point visé ; « Ajuster » = toute la surface visible
const ZOOM_MIN = 3, ZOOM_MAX = 80;
function zoomA(z, cx, cy) {
  const zone = $('#zone'), avant = reglages.zoom;
  z = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.round(z * 10) / 10));
  if (z === avant) return;
  const b = zone.getBoundingClientRect();
  if (cx === undefined) { cx = b.left + zone.clientWidth / 2; cy = b.top + zone.clientHeight / 2; }
  // position (en pas) sous le point visé, avant le zoom
  const tb = toile.getBoundingClientRect();
  const ux = (cx - tb.left - MARGE) / avant, uy = (cy - tb.top - MARGE) / avant;
  reglages.zoom = z;
  ecrire(CLE.reglages, reglages);
  rendu(); majZoom();
  const tb2 = toile.getBoundingClientRect();
  zone.scrollLeft += tb2.left + MARGE + ux * z - cx;
  zone.scrollTop += tb2.top + MARGE + uy * z - cy;
  toutMettreAJour();
}
function zoomer(sens, cx, cy) { zoomA(reglages.zoom * (sens > 0 ? 1.25 : 0.8), cx, cy); }
function zoomAjuster() {
  const zone = $('#zone');
  const z = Math.min((zone.clientWidth - 100 - 2 * MARGE) / SURF.larg, (zone.clientHeight - 100 - 2 * MARGE) / SURF.haut); // 100 = marges + boutons des côtés
  zoomA(Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z)));
  zone.scrollLeft = 0; zone.scrollTop = 0;
}
function majZoom() { const v = $('#zoomValeur'); if (v) v.textContent = Math.round((reglages.zoom / 18) * 100) + ' %'; }
$('#zoomMoins').onclick = () => zoomer(-1);
$('#zoomPlus').onclick = () => zoomer(1);
$('#zoomAjuster').onclick = zoomAjuster;
$('#zoomValeur').onclick = () => zoomA(18);
$('#optSymboles').onchange = (e) => { reglages.symboles = e.target.checked; ecrire(CLE.reglages, reglages); toutMettreAJour(); };
$('#zone').addEventListener('wheel', (e) => { if (!e.ctrlKey) return; e.preventDefault(); zoomer(e.deltaY < 0 ? 1 : -1, e.clientX, e.clientY); }, { passive: false });
$('#nomProjet').onclick = async () => { const n = await demander('Renommer le motif', P.nom, 'Nom'); if (n && n.trim()) { P.nom = n.trim(); fini(); } };

// ---------- plaque : nouveau motif ou changement de plaque ----------
function ouvrirPlaque(nouveau) {
  const dlg = $('#dlgPlaque'), f = dlg.querySelector('form');
  $('#titrePlaque').textContent = nouveau ? 'Nouveau motif' : 'Changer de plaque / assembler';
  $('#lblNom').hidden = !nouveau;
  f.palette.closest('label').hidden = !nouveau;
  remplirChoix(f.format, optionsFormats(), nouveau ? 'midi-carre-grand' : P.format);
  remplirChoix(f.palette, (nouveau ? '' : '<option value="">(garder les couleurs du motif)</option>') + optionsPalettes(), nouveau ? 'hama-midi' : '');
  f.w.value = P?.cfg?.w || 29; f.h.value = P?.cfg?.h || 29;
  f.cols.value = nouveau ? 1 : P.cfg.cols || 1; f.rangs.value = nouveau ? 1 : P.cfg.rangs || 1;
  const maj = () => {
    const fm = formatParId(f.format.value);
    $('#tailleLibre').hidden = !fm.libre;
    $('#notePlaque').textContent = fm.type === 'rond' ? 'Picots en anneaux concentriques, déduits du nombre officiel : pose ta plaque sur une impression pour vérifier.' : (fm.type === 'perso' ? 'Plaque que tu as dessinée.' : '');
    const s = construireSurface(fm, { w: +f.w.value, h: +f.h.value, cols: +f.cols.value, rangs: +f.rangs.value });
    const pas = GAMMES[fm.gamme]?.pas || 5, cm = (v) => (v * pas / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    $('#totalPlaque').textContent = `${s.plaques.length} plaque(s), ${s.picots.length} picots, ${cm(s.larg)} × ${cm(s.haut)} cm.` + (!nouveau ? ' Le dessin est conservé à sa place (en haut à gauche).' : '');
  };
  [f.format, f.w, f.h, f.cols, f.rangs].forEach((el) => (el.oninput = el.onchange = maj));
  maj();
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok') return;
    const fm = formatParId(f.format.value);
    const cfg = { cols: Math.max(1, Math.min(10, +f.cols.value || 1)), rangs: Math.max(1, Math.min(10, +f.rangs.value || 1)) };
    if (fm.libre) { cfg.w = Math.max(1, Math.min(200, +f.w.value || 29)); cfg.h = Math.max(1, Math.min(200, +f.h.value || 29)); }
    if (nouveau) {
      charger(creerMotif(f.nom.value.trim() || 'Mon motif', fm.id, cfg, f.palette.value));
      sauverMaintenant();
      return;
    }
    memoriser();
    const nouvelle = construireSurface(fm, cfg);
    P.cases = transposer(SURF, P.cases, nouvelle);
    if (fm.format !== P.format) P.pas = GAMMES[fm.gamme]?.pas || P.pas;
    P.format = fm.id; P.cfg = cfg; SURF = nouvelle;
    if (f.palette.value) appliquerPalette(paletteParId(f.palette.value), false);
    fini();
  };
  dlg.returnValue = '';
  dlg.showModal();
}

async function enregistrerCommePlaque() {
  const idx = P.cases.map((v, i) => (v >= 0 ? i : -1)).filter((i) => i >= 0);
  if (idx.length < 3) { message('Pose d’abord des perles sur la forme de la plaque voulue (cœur, étoile…).', 4000); return; }
  const nom = await demander('Enregistrer comme plaque', 'Ma plaque', `Nom de la nouvelle plaque (${idx.length} picots)`);
  if (!nom || !nom.trim()) return;
  const xs = idx.map((i) => SURF.picots[i].x), ys = idx.map((i) => SURF.picots[i].y);
  const x0 = Math.min(...xs) - 0.5, y0 = Math.min(...ys) - 0.5;
  const fm = formatParId(P.format);
  ecrire(CLE.plaques, plaquesPerso().concat([{
    id: 'p' + nouvelId(), type: 'perso', gamme: fm.gamme || 'Midi', nom: nom.trim(), picots: idx.length, source: 'dessinée par moi',
    larg: Math.max(...xs) - x0 + 0.5, haut: Math.max(...ys) - y0 + 0.5,
    coords: idx.map((i) => [+(SURF.picots[i].x - x0).toFixed(4), +(SURF.picots[i].y - y0).toFixed(4)]),
  }]));
  message(`Plaque « ${nom} » enregistrée : elle est dans « Plaques… → Mes plaques ».`, 4500);
}

// ---------- couleurs ----------
async function modifierCouleur(i) {
  const c = P.couleurs[i];
  const r = await boite({ titre: 'Modifier la couleur', ok: 'Enregistrer', champs: [
    { nom: 'nom', label: 'Nom', valeur: c.nom },
    { nom: 'code', label: 'Référence', valeur: c.code || '' },
    { nom: 'hex', label: 'Teinte', valeur: c.hex, type: 'color' },
  ] });
  if (!r) return;
  memoriser();
  c.nom = r.nom.trim() || c.nom; c.code = r.code.trim();
  if (/^#[0-9a-f]{6}$/i.test(r.hex)) c.hex = r.hex.toUpperCase();
  fini();
}
// ouvrirAjoutCouleur() : voir couleurs.js
function ajouterAuMotif(c) {
  const deja = P.couleurs.findIndex((x) => x.code === c.code && x.hex === c.hex);
  if (deja >= 0) { S.couleur = deja; message(`« ${c.nom} » est déjà dans le motif.`); toutMettreAJour(); return; }
  memoriser(); P.couleurs.push({ ...c, marque: marqueDe(c) }); S.couleur = P.couleurs.length - 1;
  message(`« ${c.code} ${c.nom} » ajoutée.`); fini();
}
function purgerCouleurs() {
  const n = comptes(), garde = [], carte = new Map();
  P.couleurs.forEach((c, i) => { if (n[i] > 0) { carte.set(i, garde.length); garde.push(c); } });
  if (garde.length === P.couleurs.length) { message('Toutes les couleurs sont utilisées.'); return; }
  memoriser();
  P.cases = P.cases.map((v) => (v >= 0 ? carte.get(v) : -1));
  S.couleur = carte.get(S.couleur) ?? 0;
  P.couleurs = garde;
  fini();
}
function appliquerPalette(pal, avecMemo = true) {
  if (avecMemo) memoriser();
  const labs = pal.couleurs.map((c) => rgbLab(hexRgb(c.hex))), tous = [...labs.keys()];
  const carte = P.couleurs.map((c) => plusProche(rgbLab(hexRgb(c.hex)), labs, tous));
  P.cases = P.cases.map((v) => (v >= 0 ? carte[v] : -1));
  P.couleurs = pal.couleurs.map((c) => ({ ...c }));
  S.couleur = 0;
}

// ---------- fichiers ----------
function ouvrirListe() {
  sauverMaintenant();
  const dlg = $('#dlgOuvrir'), ul = $('#listeProjets');
  ul.innerHTML = '';
  for (const m of Object.values(lire(CLE.projets, {})).sort((a, b) => b.modifie - a.modifie)) {
    const li = document.createElement('li');
    const date = new Date(m.modifie).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
    li.innerHTML = `<span><b>${echap(m.nom)}</b><br><small>${echap(formatParId(m.format).nom)} · ${date}</small></span>`;
    const bt = (txt, fn, off) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; b.disabled = !!off; b.onclick = fn; li.appendChild(b); };
    bt(m.id === P.id ? 'Ouvert' : 'Ouvrir', () => { charger(m); dlg.close(); }, m.id === P.id);
    bt('Dupliquer', () => { const c = JSON.parse(JSON.stringify(m)); c.id = nouvelId(); c.nom = m.nom + ' (copie)'; charger(c); sauverMaintenant(); dlg.close(); });
    bt('Supprimer', async () => {
      if (!(await confirmer(`Supprimer définitivement « ${m.nom} » de ce navigateur ? Un fichier exporté n'est pas touché.`, 'Supprimer'))) return;
      const ps = lire(CLE.projets, {}); delete ps[m.id]; ecrire(CLE.projets, ps);
      if (m.id === P.id) charger(creerMotif('Mon motif', 'midi-carre-grand', {}, 'hama-midi'));
      li.remove();
    });
    ul.appendChild(li);
  }
  dlg.showModal();
}
function telecharger(nom, contenu, type) {
  const url = URL.createObjectURL(contenu instanceof Blob ? contenu : new Blob([contenu], { type }));
  const a = document.createElement('a'); a.href = url; a.download = nom;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
function nomFichier(ext) { return (P.nom.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'motif') + ext; }
function exporterFichier() {
  sauverMaintenant();
  // le fichier embarque la plaque perso utilisée, pour pouvoir le rouvrir ailleurs
  const f = formatParId(P.format), contenu = { ...P, plaquePerso: f.type === 'perso' ? f : undefined };
  telecharger(nomFichier('.perlinette.json'), JSON.stringify(contenu), 'application/json');
  message('Fichier exporté dans Téléchargements.');
}
$('#fichierProjet').onchange = async (e) => {
  const fic = e.target.files[0]; e.target.value = '';
  if (!fic) return;
  try {
    const m = JSON.parse(await fic.text());
    if (!m.format || !Array.isArray(m.cases)) throw new Error('format');
    if (m.plaquePerso && !plaquesPerso().some((p) => p.id === m.plaquePerso.id)) ecrire(CLE.plaques, plaquesPerso().concat([m.plaquePerso]));
    delete m.plaquePerso;
    if (lire(CLE.projets, {})[m.id]) m.id = nouvelId(); // ne jamais écraser un motif existant
    charger(m); sauverMaintenant();
    message(`« ${m.nom} » importé.`);
  } catch (err) { avertir("Ce fichier n'est pas un motif lisible."); }
};
function exporterPng() { toile.toBlob((b) => telecharger(nomFichier('.png'), b)); }

// ---------- démarrage ----------
function demarrer() {
  const id = lire(CLE.courant, null), projets = lire(CLE.projets, {});
  majZoom();
  $('#optSymboles').checked = reglages.symboles;
  charger(id && projets[id] ? projets[id] : creerMotif('Mon premier motif', 'midi-carre-grand', {}, 'hama-midi'));
}
