'use strict';
// Relire une épingle Perlinette : une épingle enregistrée (depuis Pinterest, un message…) redevient un motif.
//
// L'épingle porte, dans son bandeau, un petit carré de cases claires et foncées. Il ne contient pas le dessin,
// seulement de quoi le relire sans se tromper : la plaque, le cadrage, et la liste exacte des couleurs utilisées.
// À l'import, Perlinette retrouve la grille grâce à lui, regarde chaque picot de l'image (perle ou vide ?) et
// donne à chaque perle la couleur la plus proche PARMI celles de la liste : Pinterest a beau réduire et
// compresser l'image, deux rouges voisins ne se confondent que s'ils sont tous les deux dans le motif.

const CODE_PIN = { x: 736, y0: 26, c: 8, cols: 30, rows: 25, magie: 0xA5, version: 1 }; // y0 : depuis le haut du bandeau
const carteEpingle = (deuxLignes) => (deuxLignes ? 660 : 700);            // côté du cadre de la plaque
const hautCarteEpingle = (deuxLignes) => 262 + (deuxLignes ? 70 : 0) + 36; // son bord haut

function crc8(octets) {
  let c = 0;
  for (const o of octets) { c ^= o; for (let k = 0; k < 8; k++) c = c & 0x80 ? ((c << 1) ^ 0x07) & 0xff : (c << 1) & 0xff; }
  return c;
}
function ecrivainBits() {
  const bits = [];
  return { bits, met(v, n) { for (let k = n - 1; k >= 0; k--) bits.push((v >> k) & 1); } };
}
function octetsDe(bits) {
  const o = [];
  for (let i = 0; i < bits.length; i += 8) { let v = 0; for (let k = 0; k < 8; k++) v = (v << 1) | (bits[i + k] || 0); o.push(v); }
  return o;
}

// Cadrage arrondi au demi-picot : le code doit pouvoir le redire exactement
function arrondirFenetre(F) {
  if (F.plaque) return F;
  const x = Math.floor(F.x * 2) / 2, y = Math.floor(F.y * 2) / 2;
  return { x, y, larg: Math.ceil((F.x + F.larg - x) * 2) / 2, haut: Math.ceil((F.y + F.haut - y) * 2) / 2, plaque: false };
}

// Le code de l'épingle en cours : tableau de bits, ou null si le motif ne s'y prête pas (plaque faite main, trop de couleurs)
function codeEpingle(F, deuxLignes) {
  const iFmt = PLAQUES.findIndex((p) => p.id === P.format), iPal = Math.max(0, PALETTES_FUSIBLES.findIndex((p) => p.id === (P.nuancier || 'hama-midi')));
  if (iFmt < 0 || iFmt > 62) return null;
  const pal = PALETTES_FUSIBLES[iPal], nb = new Array(P.couleurs.length).fill(0);
  for (const v of P.cases) if (v >= 0) nb[v]++;
  const util = P.couleurs.filter((c, i) => nb[i] > 0);
  if (!util.length || util.length > 63) return null;
  const e = ecrivainBits();
  e.met(CODE_PIN.magie, 8); e.met(CODE_PIN.version, 4); e.met(iFmt, 6);
  e.met(Math.min(15, P.cfg.cols || 1), 4); e.met(Math.min(15, P.cfg.rangs || 1), 4); e.met(Math.min(255, P.cfg.w || 0), 8); e.met(Math.min(255, P.cfg.h || 0), 8);
  e.met(iPal, 4); e.met(deuxLignes ? 1 : 0, 1); e.met(F.plaque ? 1 : 0, 1);
  if (!F.plaque) for (const v of [F.x, F.y, F.larg, F.haut]) e.met(Math.min(2047, Math.round(v * 2)), 11);
  e.met(util.length, 6);
  for (const c of util) {
    const k = pal.couleurs.findIndex((x) => x.code === c.code && x.hex.toLowerCase() === String(c.hex).toLowerCase());
    if (k >= 0 && k < 256) { e.met(0, 1); e.met(k, 8); } else { e.met(1, 1); e.met(parseInt(String(c.hex).slice(1), 16) & 0xffffff, 24); }
  }
  while (e.bits.length % 8) e.bits.push(0);
  e.met(crc8(octetsDe(e.bits)), 8);
  if (e.bits.length > CODE_PIN.cols * CODE_PIN.rows) return null;
  return e.bits;
}

// Le dessin du code dans le bandeau (yb = haut du bandeau)
function svgCodeEpingle(bits, yb, clair, fonce) {
  const { x, y0, c, cols, rows } = CODE_PIN, y = yb + y0;
  let s = `<rect x="${x - 10}" y="${y - 10}" width="${cols * c + 20}" height="${rows * c + 20}" rx="12" fill="${fonce}" stroke="${clair}" stroke-width="3"/>`;
  for (let i = 0; i < cols * rows; i++) {
    // après les données : un damier, pour que le carré ait toujours le même aspect
    const b = i < bits.length ? bits[i] : ((i % cols) + Math.floor(i / cols)) % 2;
    if (b) s += `<rect x="${x + (i % cols) * c}" y="${y + Math.floor(i / cols) * c}" width="${c}" height="${c}" fill="${clair}"/>`;
  }
  return s;
}

// ---------- lecture ----------
function lireEpingle(img) {
  const w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  if (!w || !h || Math.abs(h / w - 1.5) > 0.03 || w < 380) return null;
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0);
  const D = g.getImageData(0, 0, w, h).data, s = w / 1000;
  // couleur moyenne autour d'un point (coordonnées de l'épingle 1000 × 1500), sur un petit carré
  const lit = (X, Y, r = 1) => {
    const cx = Math.round(X * s), cy = Math.round(Y * s); let R = 0, G = 0, B = 0, n = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= w || y >= h) continue;
      const k = (y * w + x) * 4; R += D[k]; G += D[k + 1]; B += D[k + 2]; n++;
    }
    return n ? [R / n, G / n, B / n] : [0, 0, 0];
  };
  const lum = (c) => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2];
  // 1. le code
  const { x, y0, c, cols, rows } = CODE_PIN, yb = 1500 - 250, r = s * c >= 5 ? 1 : 0;
  const lums = []; for (let i = 0; i < cols * rows; i++) lums.push(lum(lit(x + (i % cols + 0.5) * c, yb + y0 + (Math.floor(i / cols) + 0.5) * c, r)));
  const seuil = (Math.min(...lums) + Math.max(...lums)) / 2;
  if (Math.max(...lums) - Math.min(...lums) < 60) return null;
  const bits = lums.map((l) => (l > seuil ? 1 : 0));
  let p = 0; const prend = (n) => { let v = 0; for (let k = 0; k < n; k++) v = (v << 1) | bits[p++]; return v; };
  if (prend(8) !== CODE_PIN.magie || prend(4) !== CODE_PIN.version) return null;
  const iFmt = prend(6), cfg = { cols: prend(4) || 1, rangs: prend(4) || 1 }, cw = prend(8), ch = prend(8), iPal = prend(4), deux = !!prend(1), plein = !!prend(1);
  let F = null; if (!plein) F = { x: prend(11) / 2, y: prend(11) / 2, larg: prend(11) / 2, haut: prend(11) / 2, plaque: false };
  const n = prend(6), fmt = PLAQUES[iFmt], pal = PALETTES_FUSIBLES[iPal];
  if (!fmt || !pal || !n) return null;
  const couleurs = [];
  for (let k = 0; k < n; k++) {
    if (p + 9 > bits.length) return null;
    if (prend(1)) {
      const hex = '#' + prend(24).toString(16).padStart(6, '0').toUpperCase();
      let trouve = null;
      for (const q of PALETTES_FUSIBLES) { const cc = q.couleurs.find((z) => z.hex.toUpperCase() === hex); if (cc) { trouve = { code: cc.code, nom: cc.nom, nomOfficiel: cc.nomOfficiel, hex: cc.hex, marque: nomCourt(q) }; break; } }
      couleurs.push(trouve || { code: '', nom: 'Couleur', hex, marque: 'Mes couleurs' });
    } else {
      const cc = pal.couleurs[prend(8)]; if (!cc) return null;
      couleurs.push({ code: cc.code, nom: cc.nom, nomOfficiel: cc.nomOfficiel, hex: cc.hex, marque: nomCourt(pal) });
    }
  }
  while (p % 8) p++;
  const somme = crc8(octetsDe(bits.slice(0, p)));
  if (prend(8) !== somme) return null;
  // 2. la grille, placée comme sur l'épingle
  if (fmt.libre) { cfg.w = cw || 29; cfg.h = ch || 29; }
  const surf = construireSurface(fmt, cfg);
  if (!F) F = { x: 0, y: 0, larg: surf.larg, haut: surf.haut, plaque: true };
  const carte = carteEpingle(deux), cy = hautCarteEpingle(deux), taille = carte - 48, X0 = (1000 - carte) / 2 + 24, Y0 = cy + 24;
  const k = taille / Math.max(F.larg, F.haut), ox = X0 + (taille - F.larg * k) / 2 - F.x * k, oy = Y0 + (taille - F.haut * k) / 2 - F.y * k;
  // 3. chaque picot : perle (et laquelle) ou vide
  const labs = couleurs.map((cc) => rgbLab(hexRgb(cc.hex))), fond = rgbLab([255, 253, 249]);
  // la clarté compte triple : la compression abîme surtout la teinte (mesuré sur une centaine de modèles, image réduite comme sur Pinterest)
  const wL = 3, rr = 0.32;
  const d = (a, b) => Math.hypot((a[0] - b[0]) * wL, a[1] - b[1], a[2] - b[2]);
  const cases = surf.picots.map((q) => {
    // cadrage serré : toutes les perles sont dans le cadre ; les picots dessinés dans sa marge sont vides
    const b = F.plaque ? -0.5 : 0;
    if (q.x < F.x + b || q.x > F.x + F.larg - b || q.y < F.y + b || q.y > F.y + F.haut - b) return -1;
    const X = ox + q.x * k, Y = oy + q.y * k;
    // l'anneau de la perle (entre le trou et le bord) : douze points, dont on garde la valeur médiane
    // (la compression fait baver les perles voisines les unes sur les autres : la médiane écarte les points salis)
    const pts = [];
    for (let a = 0; a < 12; a++) { const t = (a * Math.PI) / 6 + 0.26; pts.push(lit(X + Math.cos(t) * k * rr, Y + Math.sin(t) * k * rr, 0)); }
    const med = (j) => { const v = pts.map((c) => c[j]).sort((m, n) => m - n); return (v[5] + v[6]) / 2; };
    const R = [med(0), med(1), med(2)];
    const lab = rgbLab(R); let best = -1, bd = 1e9;
    labs.forEach((l, i) => { const e = d(lab, l); if (e < bd) { bd = e; best = i; } });
    const dFond = d(lab, fond);
    if (dFond < bd) {
      // l'anneau a la couleur de la plaque : c'est un picot vide… ou une perle très claire (son trou est alors plus clair que l'anneau,
      // alors qu'un picot vide a un point foncé au centre)
      const centre = lum(lit(X, Y, 0)), anneau = lum(R);
      if (centre < anneau - 8 || bd > 14) return -1;
    }
    return best;
  });
  if (!cases.some((v) => v >= 0)) return null;
  // on ne garde que les couleurs réellement relues
  const vues = new Set(cases.filter((v) => v >= 0)), carteC = new Map(); const gardees = [];
  couleurs.forEach((cc, i) => { if (vues.has(i)) { carteC.set(i, gardees.length); gardees.push(cc); } });
  return { format: fmt.id, cfg, nuancier: pal.id, surf, cases: cases.map((v) => (v >= 0 ? carteC.get(v) : -1)), couleurs: gardees, attendues: n, petite: w < 700 };
}

// Ouvre le motif relu
function ouvrirEpingleLue(r, nom) {
  const motif = creerMotif(nom || 'Épingle Perlinette', r.format, r.cfg, r.nuancier);
  motif.cases = r.cases; motif.couleurs = r.couleurs;
  charger(motif); sauverMaintenant();
  if (typeof zoomAjuster === 'function') zoomAjuster();
  const nb = r.cases.filter((v) => v >= 0).length;
  message(`Épingle Perlinette reconnue : motif recréé (${nb} perles, ${r.couleurs.length} couleurs).` + (r.petite ? ' L’image est petite : quelques couleurs voisines ont pu être confondues, vérifie-les.' : ' Vérifie-le d’un coup d’œil.'), 8000);
}
