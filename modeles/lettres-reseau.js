'use strict';
// Lettres « réseau » : un alphabet dessiné pour la grille de perles elle-même.
//
// Sur une plaque hexagonale, les rangées sont décalées d'un demi-picot et plus serrées : un trait vertical
// y devient naturellement un petit zigzag, et les seuls traits « droits » sont l'horizontale et les deux
// diagonales à 60°. Plutôt que de recopier une police carrée, chaque lettre est donc décrite par son squelette
// (quelques points reliés par des traits) et « posée » sur le réseau de la plaque, rangée par rangée :
//   • une même lettre existe en trois tailles (7, 13 ou 19 rangées de haut), traits de 1, 2 ou 3 perles ;
//   • le même alphabet sert sur les plaques carrées (rangées alignées), hexagonales et rondes (rangées décalées) ;
//   • les accents sont de petits traits posés au-dessus (ou la cédille dessous).
// Squelette : x en perles (0 = bord gauche), y en rangées (0 = haut de la lettre, 6 = bas) ; w = largeur du corps.

const SQ = {
  A: { w: 3, t: [[[0, 6], [1.5, 0], [3, 6]], [[0.7, 4], [2.3, 4]]] },
  B: { w: 3, t: [[[0, 0], [0, 6]], [[0, 0], [2, 0], [3, 1], [3, 2], [2, 3], [0, 3]], [[0, 3], [2, 3], [3, 4], [3, 5], [2, 6], [0, 6]]] },
  C: { w: 3, t: [[[3, 1], [2, 0], [1, 0], [0, 1], [0, 5], [1, 6], [2, 6], [3, 5]]] },
  D: { w: 3, t: [[[0, 0], [0, 6]], [[0, 0], [2, 0], [3, 1], [3, 5], [2, 6], [0, 6]]] },
  E: { w: 3, t: [[[3, 0], [0, 0], [0, 6], [3, 6]], [[0, 3], [2, 3]]] },
  F: { w: 3, t: [[[3, 0], [0, 0], [0, 6]], [[0, 3], [2, 3]]] },
  G: { w: 3, t: [[[3, 1], [2, 0], [1, 0], [0, 1], [0, 5], [1, 6], [2, 6], [3, 5], [3, 3], [1.5, 3]]] },
  H: { w: 3, t: [[[0, 0], [0, 6]], [[3, 0], [3, 6]], [[0, 3], [3, 3]]] },
  I: { w: 2, t: [[[0, 0], [2, 0]], [[1, 0], [1, 6]], [[0, 6], [2, 6]]] },
  J: { w: 3, t: [[[3, 0], [3, 5], [2, 6], [1, 6], [0, 5]]] },
  K: { w: 3, t: [[[0, 0], [0, 6]], [[3, 0], [0, 3]], [[0.8, 2.4], [3, 6]]] },
  L: { w: 3, t: [[[0, 0], [0, 6], [3, 6]]] },
  M: { w: 4, t: [[[0, 6], [0, 0], [2, 3.2], [4, 0], [4, 6]]] },
  N: { w: 3, t: [[[0, 6], [0, 0], [3, 6], [3, 0]]] },
  O: { w: 3, t: [[[1, 0], [2, 0], [3, 1], [3, 5], [2, 6], [1, 6], [0, 5], [0, 1], [1, 0]]] },
  P: { w: 3, t: [[[0, 0], [0, 6]], [[0, 0], [2, 0], [3, 1], [3, 2], [2, 3], [0, 3]]] },
  Q: { w: 3, t: [[[1, 0], [2, 0], [3, 1], [3, 5], [2, 6], [1, 6], [0, 5], [0, 1], [1, 0]], [[2, 4.4], [3.4, 6.4]]] },
  R: { w: 3, t: [[[0, 0], [0, 6]], [[0, 0], [2, 0], [3, 1], [3, 2], [2, 3], [0, 3]], [[1.6, 3], [3, 6]]] },
  S: { w: 3, t: [[[3, 1], [2, 0], [1, 0], [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [2, 6], [1, 6], [0, 5]]] },
  T: { w: 4, t: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]] },
  U: { w: 3, t: [[[0, 0], [0, 5], [1, 6], [2, 6], [3, 5], [3, 0]]] },
  V: { w: 3, t: [[[0, 0], [1.5, 6], [3, 0]]] },
  W: { w: 4, t: [[[0, 0], [1, 6], [2, 3], [3, 6], [4, 0]]] },
  X: { w: 3, t: [[[0, 0], [3, 6]], [[3, 0], [0, 6]]] },
  Y: { w: 3, t: [[[0, 0], [1.5, 3], [3, 0]], [[1.5, 3], [1.5, 6]]] },
  Z: { w: 3, t: [[[0, 0], [3, 0], [0, 6], [3, 6]]] },
  0: { w: 3, t: [[[1, 0], [2, 0], [3, 1], [3, 5], [2, 6], [1, 6], [0, 5], [0, 1], [1, 0]]] },
  1: { w: 3, t: [[[0.5, 1], [2, 0], [2, 6]], [[0.5, 6], [3.5, 6]]] },
  2: { w: 3, t: [[[0, 1], [1, 0], [2, 0], [3, 1], [3, 2], [0, 6], [3, 6]]] },
  3: { w: 3, t: [[[0, 0], [3, 0], [1.6, 2.6]], [[1.6, 3], [2, 3], [3, 4], [3, 5], [2, 6], [0, 6]]] },
  4: { w: 3, t: [[[2, 0], [0, 4], [3, 4]], [[2, 0], [2, 6]]] },
  5: { w: 3, t: [[[3, 0], [0, 0], [0, 3], [2, 3], [3, 4], [3, 5], [2, 6], [0, 6]]] },
  6: { w: 3, t: [[[3, 0], [1, 0], [0, 1], [0, 5], [1, 6], [2, 6], [3, 5], [3, 4], [2, 3], [0, 3]]] },
  7: { w: 3, t: [[[0, 0], [3, 0], [1, 6]]] },
  8: { w: 3, t: [[[1, 0], [2, 0], [3, 1], [3, 2], [2, 3], [1, 3], [0, 2], [0, 1], [1, 0]], [[1, 3], [2, 3], [3, 4], [3, 5], [2, 6], [1, 6], [0, 5], [0, 4], [1, 3]]] },
  9: { w: 3, t: [[[0, 6], [2, 6], [3, 5], [3, 1], [2, 0], [1, 0], [0, 1], [0, 2], [1, 3], [3, 3]]] },
  '!': { w: 0, t: [[[0, 0], [0, 4]], [[0, 6]]] },
  '?': { w: 3, t: [[[0, 1], [1, 0], [2, 0], [3, 1], [3, 2], [1.5, 3.6], [1.5, 4]], [[1.5, 6]]] },
  '.': { w: 0, t: [[[0, 6]]] },
  ',': { w: 0, t: [[[0, 6], [-0.6, 7.4]]] },
  '-': { w: 2, t: [[[0, 3], [2, 3]]] },
  "'": { w: 0, t: [[[0, 0], [0, 1.6]]] },
  '♥': { w: 4, plein: [[[0, 0.6], [1, 0], [2, 1], [3, 0], [4, 0.6], [4, 2], [2, 5.6], [0, 2]]] },
};

// accents : traits posés au-dessus de la lettre (y négatif) ou sous elle ; c = milieu de la lettre
const ACCENTS_SQ = {
  aigu: (c) => [[[c - 0.5, -2], [c + 0.7, -3.6]]],
  grave: (c) => [[[c + 0.5, -2], [c - 0.7, -3.6]]],
  circonflexe: (c) => [[[c - 1, -2], [c, -3.6], [c + 1, -2]]],
  trema: (c) => [[[c - 1, -2.6]], [[c + 1, -2.6]]],
  cedille: (c) => [[[c, 6.6], [c, 7.6], [c - 0.9, 8.6]]],
};

function connuReseau(ch) { return !!(SQ[ch] || (typeof ACCENTUEES !== 'undefined' && ACCENTUEES[ch] && SQ[ACCENTUEES[ch][0]])); }

// Pose un trait (suite de points) sur le réseau : pour chaque rangée qu'il traverse, les perles dont la bande
// de la rangée contient le trait. thick = épaisseur en perles (traits et rangées).
function poserTrait(cells, pts, s, thick, tri) {
  const e = (thick - 1) / 2;
  for (let n = 0; n < Math.max(1, pts.length - 1); n++) {
    const p = pts[n], q = pts[Math.min(n + 1, pts.length - 1)];
    for (let k = 0; k < thick; k++) {
      const dy = k - e, ax = p[0] * s, ay = p[1] * s + dy, bx = q[0] * s, by = q[1] * s + dy, dS = by - ay;
      const j0 = Math.floor(Math.min(ay, by) + 0.5), j1 = Math.floor(Math.max(ay, by) + 0.5);
      for (let j = j0; j <= j1; j++) {
        let xa, xb;
        if (Math.abs(dS) < 1e-9) { xa = Math.min(ax, bx); xb = Math.max(ax, bx); }
        else {
          let t0 = (j - 0.5 - ay) / dS, t1 = (j + 0.5 - ay) / dS;
          if (t0 > t1) [t0, t1] = [t1, t0];
          t0 = Math.max(0, t0); t1 = Math.min(1, t1);
          if (t0 > t1) continue;
          const x0 = ax + (bx - ax) * t0, x1 = ax + (bx - ax) * t1;
          xa = Math.min(x0, x1); xb = Math.max(x0, x1);
        }
        const off = tri ? (((j % 2) + 2) % 2) * 0.5 : 0;
        let i0 = Math.ceil(xa - e - off - 1e-9), i1 = Math.floor(xb + e - off + 1e-9);
        if (i1 < i0) { i0 = Math.floor((xa + xb) / 2 - off - e + 0.5); i1 = i0 + thick - 1; }
        for (let i = i0; i <= i1; i++) cells.set(j + '|' + (i + off) * 2, { j, x: i + off });
      }
    }
  }
}
// Traits épais (tailles moyenne et grande) : les perles à moins d'une demi-épaisseur du trait, mesurée sur la plaque.
// Le trait est décalé d'un quart de perle (ou d'une demi-rangée) pour tomber à plat sur la grille : une tige verticale
// fait alors exactement 2 ou 3 perles de large à chaque rangée, au lieu d'alterner 3 et 2.
function poserCapsule(cells, pts, s, thick, tri) {
  const K = tri ? Math.sqrt(3) / 2 : 1, r0 = thick * 0.5 - 0.1;
  const dxs = tri ? 0.25 : (thick % 2 ? 0 : 0.5), dys = thick % 2 ? 0 : 0.5;
  const P = pts.map(([x, y]) => [x * s + dxs, (y * s + dys) * K]);
  for (let n = 0; n < Math.max(1, P.length - 1); n++) {
    const a = P[n], b = P[Math.min(n + 1, P.length - 1)];
    const vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy;
    // un trait en biais paraît plus gras qu'une tige : on le dégraisse pour que toutes les lettres aient la même « couleur »
    const lg = Math.sqrt(L2), r = lg > 2.4 * s ? r0 * (0.35 + 0.65 * Math.max(Math.abs(vx), Math.abs(vy)) / lg) : r0; // seulement les longs traits en biais : les petits coins gardent tout leur poids
    const j0 = Math.floor(Math.min(a[1], b[1]) / K - r / K - 1), j1 = Math.ceil(Math.max(a[1], b[1]) / K + r / K + 1);
    for (let j = j0; j <= j1; j++) {
      const off = tri ? (((j % 2) + 2) % 2) * 0.5 : 0, y = j * K;
      for (let i = Math.floor(Math.min(a[0], b[0]) - r - 1); i <= Math.ceil(Math.max(a[0], b[0]) + r + 1); i++) {
        const x = i + off;
        const t = L2 ? Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / L2)) : 0;
        if (Math.hypot(x - (a[0] + vx * t), y - (a[1] + vy * t)) <= r) cells.set(j + '|' + x * 2, { j, x });
      }
    }
  }
}
function poserPlein(cells, poly, s, tri) {
  const pts = poly.map(([x, y]) => [x * s, y * s]);
  const ys = pts.map((p) => p[1]);
  for (let j = Math.ceil(Math.min(...ys)); j <= Math.floor(Math.max(...ys)); j++) {
    const xs = [];
    for (let n = 0; n < pts.length; n++) {
      const a = pts[n], b = pts[(n + 1) % pts.length];
      if ((a[1] <= j && b[1] > j) || (b[1] <= j && a[1] > j)) xs.push(a[0] + ((j - a[1]) / (b[1] - a[1])) * (b[0] - a[0]));
    }
    xs.sort((m, o) => m - o);
    const off = tri ? (((j % 2) + 2) % 2) * 0.5 : 0;
    for (let k = 0; k + 1 < xs.length; k += 2) for (let i = Math.ceil(xs[k] - off - 1e-9); i <= Math.floor(xs[k + 1] - off + 1e-9); i++) cells.set(j + '|' + (i + off) * 2, { j, x: i + off });
  }
}

const CACHE_RESEAU = new Map();
// Cellules d'une lettre : { cells: [{j, x}], x0, x1 } (x0 = bord gauche entier)
function lettreReseau(ch, s, tri) {
  const cle = ch + '|' + s + '|' + (tri ? 1 : 0);
  if (CACHE_RESEAU.has(cle)) return CACHE_RESEAU.get(cle);
  const [base, accent] = (typeof ACCENTUEES !== 'undefined' && ACCENTUEES[ch]) || [ch, null];
  const sq = SQ[base], cells = new Map();
  (sq.t || []).forEach((t) => (s >= 2 ? poserCapsule : poserTrait)(cells, t, s, s, tri));
  (sq.plein || []).forEach((poly) => poserPlein(cells, poly, s, tri));
  if (accent) ACCENTS_SQ[accent](sq.w / 2).forEach((t) => (s >= 2 ? poserCapsule : poserTrait)(cells, t, s, s, tri));
  const liste = [...cells.values()], xs = liste.map((c) => c.x);
  const g = { cells: liste, x0: Math.floor(Math.min(...xs)), x1: Math.max(...xs) };
  CACHE_RESEAU.set(cle, g);
  return g;
}

// Texte → pièce : { cases, couleurs, surf, perles, nb, ignores } ou { erreur }.
// r = { texte, taille: 1|2|3, tri: bool, couleur: 'jeu:<id>'|'fam:<id>', contour: code|'' }
function construireReseau(r) {
  const s = r.taille, tri = !!r.tri;
  let t = r.texte.toUpperCase();
  for (const [a, b] of Object.entries(EQUIVALENTS)) t = t.split(a).join(b);
  const ignores = new Set();
  const lignes = t.split(/\r?\n/).map((l) => l.split(/\s+/).filter(Boolean).map((mot) => [...mot].filter((c) => (connuReseau(c) ? true : (ignores.add(c), false)))).filter((m) => m.length)).filter((l) => l.length);
  if (!lignes.length) return { erreur: 'Tape au moins une lettre ou un chiffre.' };
  const gap = s, espace = 3 * s, pas = 2 * Math.ceil((11 * s + 2) / 2);
  const glyphes = (mot) => mot.map((ch) => lettreReseau(ch, s, tri));
  const largeurMot = (mot) => glyphes(mot).reduce((a, g) => a + Math.ceil(g.x1) - g.x0 + 1 + gap, -gap);
  // mise en page : à la main (retours à la ligne) et, sur une plaque à contour (hexagone, rond), les mots passent
  // à la ligne d'eux-mêmes pour rester dans la plaque : r.largeurMax(hauteur en rangées) donne la place disponible
  const mettreEnPage = (maxi) => lignes.flatMap((mots) => {
    if (!maxi) return [mots];
    const res = []; let cur = [], w = 0;
    for (const mot of mots) {
      const wm = largeurMot(mot);
      if (cur.length && w + espace + wm > maxi) { res.push(cur); cur = []; w = 0; }
      w += (cur.length ? espace : 0) + wm; cur.push(mot);
    }
    if (cur.length) res.push(cur);
    return res;
  });
  const hauteurBloc = (nb) => (nb - 1) * pas + 6 * s + 1;
  let rangees = mettreEnPage(0);
  if (r.largeurMax) for (let essai = 0; essai < 3; essai++) rangees = mettreEnPage(Math.max(4, r.largeurMax(hauteurBloc(rangees.length))));
  const posees = [], largeurs = [];
  let k = 0;
  rangees.forEach((mots, n) => {
    let x = 0;
    mots.forEach((mot, m) => {
      if (m) x += espace - gap;
      mot.forEach((ch) => {
        const g = lettreReseau(ch, s, tri);
        for (const c of g.cells) posees.push({ j: c.j + n * pas, x: c.x - g.x0 + x, L: k, ligne: n });
        x += Math.ceil(g.x1) - g.x0 + 1 + gap; k++;
      });
    });
    largeurs.push(x - gap);
  });
  const W = Math.max(...largeurs);
  const depasse = r.largeurMax ? Math.max(0, W - r.largeurMax(hauteurBloc(rangees.length))) : 0;
  posees.forEach((c) => { c.x += Math.floor((W - largeurs[c.ligne]) / 2); });
  // contour : les voisines vides des perles de lettre
  const cle = (j, x) => j + '|' + x * 2, plein = new Map(posees.map((c) => [cle(c.j, c.x), c]));
  const voisines = tri ? [[0, -1], [0, 1], [-1, -0.5], [-1, 0.5], [1, -0.5], [1, 0.5]] : [[0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [-1, 1], [1, -1], [1, 1]];
  const contour = new Map();
  if (r.contour) for (const c of posees) for (const [dj, dx] of voisines) { const kk = cle(c.j + dj, c.x + dx); if (!plein.has(kk) && !contour.has(kk)) contour.set(kk, { j: c.j + dj, x: c.x + dx, L: -1 }); }
  const toutes = [...posees, ...contour.values()];
  const decJ = -2 * Math.floor(Math.min(...toutes.map((c) => c.j)) / 2), decX = -Math.floor(Math.min(...toutes.map((c) => c.x)));
  toutes.forEach((c) => { c.j += decJ; c.x += decX; });
  const R = Math.max(...toutes.map((c) => c.j)) + 1, C = Math.floor(Math.max(...toutes.map((c) => c.x))) + 2;
  if (R > 120 || C > 120) return { erreur: 'Texte trop long : coupe-le en plusieurs lignes ou choisis une taille plus petite.' };
  // couleurs
  const pal = paletteParId('hama-midi'), couleurs = [], indice = new Map();
  const coul = (code) => {
    if (!indice.has(code)) { const c = pal.couleurs.find((x) => x.code === code); indice.set(code, couleurs.length); couleurs.push({ ...c, marque: nomCourt(pal) }); }
    return indice.get(code);
  };
  const [genre, id] = r.couleur.split(':'), jeu = JEUX.find((j) => j.id === id);
  const cases = new Array(R * C).fill(-1), perles = [];
  // relief, comme sur les grandes lettres : lumière sur les bords haut et gauche, ombre sur les bords bas et droite
  const pl = new Set(posees.map((c) => c.j + '|' + c.x * 2)), a = (c, dj, dx) => pl.has((c.j + dj) + '|' + (c.x + dx) * 2);
  const role = (c) => {
    if (r.relief === false) return 'base';
    const hg = tri ? a(c, -1, -0.5) : a(c, -1, 0), bd = tri ? a(c, 1, 0.5) : a(c, 1, 0);
    const eclaire = !hg || !a(c, 0, -1), ombre = !bd || !a(c, 0, 1);
    return eclaire && !ombre ? 'clair' : ombre && !eclaire ? 'fonce' : 'base';
  };
  for (const c of toutes) {
    const code = c.L < 0 ? r.contour : (genre === 'jeu' ? famille(jeu.familles[c.L % jeu.familles.length]) : famille(id))[role(c)];
    const rang = c.j, col = Math.round(c.x - (tri && rang % 2 ? 0.5 : 0));
    cases[rang * C + col] = coul(code);
    perles.push({ dx: c.x, dy: tri ? c.j * (Math.sqrt(3) / 2) : c.j, c: { ...couleurs[indice.get(code)] } });
  }
  const surf = construireSurface(formatParId(tri ? 'libre-quinconce' : 'libre-carre'), { w: C, h: R, cols: 1, rangs: 1 });
  return { cases, couleurs, surf, perles, nb: perles.length, nbLettres: k, ignores: [...ignores], larg: C, haut: R, depasse, lignes: rangees.length };
}
