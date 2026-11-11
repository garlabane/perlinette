'use strict';
// Thème Emoji — 10 visages originaux, dessinés en « recettes » : ils s'adaptent à la plaque
// (grand ou moyen rond, hexagones, petit carré, Maxi). u, v = coordonnées ramenées au rayon
// de la plaque (de −1 à 1). Visage jaune avec bord orangé ; détails en noir.

function visage(x, y, R, details) {
  const u = x / R, v = y / R, d = Math.hypot(u, v);
  if (d > 1.03) return '.';
  const l = details(u, v);
  if (l) return l;
  return d > 0.86 ? 'O' : 'J';
}
const EMO = {
  oeil: (u, v, cx, cy = -0.2, rx = 0.11, ry = 0.19) => G.ell(u, v, cx, cy, rx, ry),
  reflet: (u, v, cx, cy = -0.27) => Math.hypot(u - cx, v - cy) < 0.05,
  sourire: (u, v, r1 = 0.44, r2 = 0.57, cy = -0.06, vmin = 0.14) => { const d = Math.hypot(u, v - cy); return d > r1 && d < r2 && v > vmin; },
  joue: (u, v) => Math.hypot(Math.abs(u) - 0.56, v - 0.14) < 0.1,
  coeur: (u, v, cx, cy, s) => { const X = (u - cx) / s, Y = -(v - cy) / s + 0.25; return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0; },
};
const COULEURS_EMOJI = { J: 'H03', O: 'H60', N: 'H18', W: 'H01', P: 'H06', M: 'H22', R: 'H05', B: 'H73', S: 'H04', L: 'H09' };
const RELIEF_EMOJI = { J: ['H103', null] };

MODELES.push(
  {
    theme: 'Emoji', nom: 'Sourire', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      if (EMO.reflet(u, v, -0.36) || EMO.reflet(u, v, 0.3)) return 'W';
      if (EMO.oeil(u, v, -0.33) || EMO.oeil(u, v, 0.33)) return 'N';
      if (EMO.sourire(u, v)) return 'N';
      if (EMO.joue(u, v)) return 'P';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Fou rire', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      for (const cx of [-0.33, 0.33]) { const d = Math.hypot(u - cx, v + 0.1); if (d > 0.1 && d < 0.2 && v < -0.13) return 'N'; }
      const b = Math.hypot(u, v - 0.08);
      if (v > 0.08 && b < 0.5) return v < 0.2 ? 'W' : v > 0.4 ? 'P' : 'M';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Clin d’œil', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      if (EMO.reflet(u, v, -0.36)) return 'W';
      if (EMO.oeil(u, v, -0.33)) return 'N';
      if (Math.abs(v + 0.18) < 0.05 && Math.abs(u - 0.33) < 0.15) return 'N';
      if (EMO.sourire(u, v)) return 'N';
      if (G.ell(u, v, 0.12, 0.55, 0.12, 0.09)) return 'P';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Amoureux', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      if (EMO.coeur(u, v, -0.33, -0.2, 0.17) || EMO.coeur(u, v, 0.33, -0.2, 0.17)) return 'R';
      if (EMO.sourire(u, v)) return 'N';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Surpris', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      if (EMO.reflet(u, v, -0.37, -0.31) || EMO.reflet(u, v, 0.29, -0.31)) return 'W';
      if (EMO.oeil(u, v, -0.33, -0.22, 0.13, 0.21) || EMO.oeil(u, v, 0.33, -0.22, 0.13, 0.21)) return 'N';
      const d = Math.hypot(u, v - 0.4);
      if (d < 0.17) return d < 0.08 ? 'M' : 'N';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Triste', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      if (G.ell(u, v, 0.42, 0.06, 0.08, 0.13)) return 'B';
      if (EMO.oeil(u, v, -0.33) || EMO.oeil(u, v, 0.33)) return 'N';
      const d = Math.hypot(u, v - 0.78);
      if (d > 0.33 && d < 0.44 && v < 0.5) return 'N';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Lunettes de soleil', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      if (Math.hypot(u + 0.42, v + 0.27) < 0.05 || Math.hypot(u - 0.2, v + 0.27) < 0.05) return 'W';
      if ((G.ell(u, v, -0.3, -0.2, 0.22, 0.14) || G.ell(u, v, 0.3, -0.2, 0.22, 0.14)) || (Math.abs(u) < 0.6 && Math.abs(v + 0.32) < 0.04)) return 'N';
      if (EMO.sourire(u, v, 0.4, 0.51, -0.04, 0.2) && u > -0.2) return 'N';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Bisou', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      for (const cx of [-0.33, 0.33]) { const d = Math.hypot(u - cx, v + 0.1); if (d > 0.1 && d < 0.2 && v < -0.13) return 'N'; }
      if (EMO.coeur(u, v, 0.5, 0.38, 0.12)) return 'R';
      const d = Math.hypot(u + 0.02, v - 0.4);
      if (d < 0.13 && d > 0.05) return 'N';
      if (EMO.joue(u, v)) return 'P';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Endormi', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      for (const cx of [-0.33, 0.33]) { const d = Math.hypot(u - cx, v + 0.32); if (d > 0.1 && d < 0.19 && v > -0.24) return 'N'; }
      const d = Math.hypot(u, v - 0.42);
      if (d < 0.11 && d > 0.04) return 'N';
      if (EMO.joue(u, v)) return 'P';
      if (G.poly(u, v, [[0.38, -0.78], [0.62, -0.78], [0.42, -0.6], [0.62, -0.6], [0.62, -0.53], [0.32, -0.53], [0.52, -0.71], [0.38, -0.71]])) return 'L';
      return null;
    }),
  },
  {
    theme: 'Emoji', nom: 'Étoiles dans les yeux', plaques: P_RONDS, couleurs: COULEURS_EMOJI, relief: RELIEF_EMOJI,
    f: (x, y, r, a, R) => visage(x, y, R, (u, v) => {
      if (G.poly(u, v, G.etoile(5, 0.22, 0.1, -0.33, -0.2)) || G.poly(u, v, G.etoile(5, 0.22, 0.1, 0.33, -0.2))) return 'S';
      const b = Math.hypot(u, v - 0.1);
      if (v > 0.12 && b < 0.47) return v > 0.4 ? 'P' : 'M';
      return null;
    }),
  },
);
