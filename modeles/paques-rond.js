'use strict';
// Thème Pâques — 10 modèles originaux conçus pour la plaque RONDE (picots en anneaux).
// f(x, y, r, a) : couleur au point (x, y), centre = (0, 0), y vers le bas. Outils G : modeles.js.

MODELES.push(
  {
    theme: 'Pâques', nom: 'Poussin tout rond', plaques: RONDS,
    couleurs: { J: 'H03', D: 'H60', N: 'H18', O: 'H04', P: 'H95' },
    relief: { J: ['H103', 'H60'] },
    f(x, y, r) {
      if (y < -11.8 && Math.abs(x) < 2.2) return 'D'; // houppette
      if (G.pres(x, y, [[-3.2, -2.5], [3.2, -2.5]], 1.2)) return 'N';
      if (G.tri(x, y, -1.8, 0.2, 1.8, 0.2, 0, 3.2)) return 'O';
      if (G.pres(x, y, [[-6, 1], [6, 1]], 1.2)) return 'P';
      if (r > 9 && y > 2 && Math.abs(x) > 8) return 'D'; // ailes
      return 'J';
    },
  },
  {
    theme: 'Pâques', nom: 'Lapin rond', plaques: RONDS,
    couleurs: { V: 'H47', W: 'H01', P: 'H95', N: 'H18', R: 'H06' },
    relief: { W: [null, 'H77'], V: ['H98', null] },
    f(x, y) {
      if (G.ell(Math.abs(x), y, 3.6, -8, 0.8, 3.6)) return 'P'; // intérieur des oreilles
      if (G.ell(Math.abs(x), y, 3.6, -8, 1.9, 5)) return 'W';
      if (Math.hypot(x, y - 2.5) < 8.3) {
        if (G.pres(x, y, [[-3, 1], [3, 1]], 1.1)) return 'N';
        if (G.tri(x, y, -1.2, 3.5, 1.2, 3.5, 0, 5)) return 'R';
        if (G.pres(x, y, [[-5, 4.5], [5, 4.5]], 1.2)) return 'P';
        if (G.pres(x, y, [[-0.9, 6.2], [0.9, 6.2]], 0.6)) return 'N';
        return 'W';
      }
      return 'V';
    },
  },
  {
    theme: 'Pâques', nom: 'Marguerite', plaques: RONDS,
    couleurs: { B: 'H46', W: 'H01', J: 'H03', O: 'H04', V: 'H47' },
    relief: { W: [null, 'H77'], J: ['H103', 'H60'] },
    f(x, y, r) {
      if (r > 13.5) return 'V';
      if (r < 1.5) return 'O';
      if (r < 3.4) return 'J';
      for (let k = 0; k < 12; k++) { const [u, v] = G.tourne(x, y, (k * Math.PI) / 6); if (G.ell(u, v, 7.6, 0, 4.4, 1.5)) return 'W'; }
      return 'B';
    },
  },
  {
    theme: 'Pâques', nom: 'Œuf décoré', plaques: RONDS,
    couleurs: { V: 'H47', P: 'H95', J: 'H43', L: 'H96', B: 'H46', W: 'H01' },
    relief: { P: ['H78', 'H48'], J: ['H103', 'H14'], L: ['H106', 'H74'], B: ['H97', 'H09'] },
    f(x, y) {
      if (!G.ell(x, y, 0, 0.8, 8.6, 11.8)) return 'V';
      const zig = -1 + 1.2 * Math.abs((((x / 2.4) % 2) + 2) % 2 - 1);
      if (Math.abs(y - zig) < 0.6) return 'W';
      if (y < -6) return 'P';
      if (y < -1.5) return 'J';
      if (y < 5) return G.pres(x, y, [[-5, 2], [-1.5, 3], [2.5, 2], [5.5, 3]], 1) ? 'W' : 'L';
      return 'B';
    },
  },
  {
    theme: 'Pâques', nom: 'Nid d’œufs', plaques: RONDS,
    couleurs: { B: 'H46', M: 'H12', K: 'H21', P: 'H95', J: 'H43', L: 'H96', V: 'H47' },
    relief: { P: ['H78', 'H48'], J: ['H103', 'H14'], L: ['H106', 'H74'] },
    f(x, y) {
      if (y > 3 && G.ell(x, y, 0, 6, 11.5, 5)) return Math.abs(Math.round(x * 0.7 + y)) % 2 ? 'M' : 'K'; // nid
      if (G.ell(x, y, 0, -2.5, 2.8, 3.8)) return 'J';
      if (G.ell(x, y, -5, -0.5, 2.7, 3.6)) return 'P';
      if (G.ell(x, y, 5, -0.5, 2.7, 3.6)) return 'L';
      if (y > 9.5) return 'V'; // herbe
      return 'B';
    },
  },
  {
    theme: 'Pâques', nom: 'Spirale pastel', plaques: RONDS,
    couleurs: { P: 'H95', J: 'H43', B: 'H46', V: 'H47', W: 'H01' },
    f(x, y, r, a) {
      if (r > 13.5) return 'W';
      if (r < 0.5) return 'W';
      return ['P', 'J', 'B', 'V'][G.spirale(r, a, 6, 4)];
    },
  },
  {
    theme: 'Pâques', nom: 'Rosace de printemps', plaques: RONDS,
    couleurs: { J: 'H43', P: 'H95', L: 'H96', B: 'H46', V: 'H47', W: 'H01' },
    f(x, y, r, a) {
      const k = Math.round(r), sect = (n) => Math.floor(((a + Math.PI / 2 + 4 * Math.PI) % (2 * Math.PI)) / ((2 * Math.PI) / n));
      if (k <= 1) return 'J';
      if (k <= 3) return 'P';
      if (k <= 5) return sect(12) % 2 ? 'W' : 'L';
      if (k === 6) return 'V';
      if (k <= 9) { const s = (((a + Math.PI / 2) / ((2 * Math.PI) / 12)) % 1 + 1) % 1; return Math.abs(s - 0.5) * 2 < (k - 6) / 3.5 ? 'P' : 'J'; }
      if (k === 10) return 'B';
      if (k <= 12) return sect(24) % 2 ? 'W' : 'V';
      return 'L';
    },
  },
  {
    theme: 'Pâques', nom: 'Papillon rond', plaques: RONDS,
    couleurs: { J: 'H43', L: 'H96', B: 'H97', N: 'H18', P: 'H95', W: 'H01' },
    relief: { L: ['H106', 'H74'], B: ['H73', 'H46'] },
    f(x, y, r) {
      if (r > 13.5) return 'P';
      if (Math.abs(x) < 0.8 && Math.abs(y) < 7.5) return 'N'; // corps
      if (G.seg(Math.abs(x), y, 0.5, -7, 3, -11) < 0.5) return 'N'; // antennes
      if (G.pres(Math.abs(x), y, [[5.5, -4], [4.5, 4.5]], 1.2)) return 'W';
      if (G.ell(Math.abs(x), y, 5.2, -4, 5, 4.6)) return 'L';
      if (G.ell(Math.abs(x), y, 4.5, 4.6, 4, 3.6)) return 'B';
      return 'J';
    },
  },
  {
    theme: 'Pâques', nom: 'Bouquet de tulipes', plaques: RONDS,
    couleurs: { B: 'H97', V: 'H10', P: 'H06', J: 'H43', L: 'H45', W: 'H01' },
    relief: { P: ['H72', 'H29'], J: ['H103', 'H14'], L: ['H106', 'H74'] },
    f(x, y, r) {
      if (r > 13.5) return 'W';
      const fleurs = [[-5, -2, 'J'], [0, -5.5, 'P'], [5, -2, 'L']];
      for (const [cx, cy, c] of fleurs) {
        const dans = G.ell(x, y, cx, cy, 2.3, 2.6) && y > cy - 1.2;
        const pointes = G.tri(x, y, cx - 2.3, cy - 1, cx - 1.2, cy - 1, cx - 2.2, cy - 3) || G.tri(x, y, cx - 0.6, cy - 1, cx + 0.6, cy - 1, cx, cy - 3.2) || G.tri(x, y, cx + 1.2, cy - 1, cx + 2.3, cy - 1, cx + 2.2, cy - 3);
        if (dans || pointes) return c;
      }
      if (G.seg(x, y, -5, 0.5, -1, 11) < 0.5 || G.seg(x, y, 0, -3, 0, 11) < 0.5 || G.seg(x, y, 5, 0.5, 1, 11) < 0.5) return 'V';
      if (G.ell(x, y, -4, 7.5, 1.2, 3) || G.ell(x, y, 4, 7.5, 1.2, 3)) return 'V';
      return 'B';
    },
  },
  {
    theme: 'Pâques', nom: 'Cloche à ruban', plaques: RONDS,
    couleurs: { L: 'H96', J: 'H61', D: 'H21', P: 'H95', V: 'H47', W: 'H01' },
    relief: { J: ['H03', 'H21'] },
    f(x, y, r) {
      if (r > 13.5) return 'V';
      if (Math.hypot(x, y + 10.5) < 1) return 'P';
      if (G.tri(x, y, 0, -10.5, -4.5, -12.5, -4.5, -8.5) || G.tri(x, y, 0, -10.5, 4.5, -12.5, 4.5, -8.5)) return 'P'; // nœud
      if (Math.abs(x) < 9.8 && y > 5 && y < 6.6) return 'D'; // bord
      if (Math.hypot(x, y - 8) < 1.3) return 'D'; // battant
      if (G.ell(x, y, 0, -6.5, 3.4, 2.4) || (y > -6.5 && y <= 5 && Math.abs(x) < 3.4 + (y + 6.5) * 0.52)) return Math.abs(y + 0.5) < 0.6 ? 'P' : 'J';
      if (G.pres(x, y, [[-9, -4], [9, -4], [-10, 2], [10, 2], [-6, 10], [6, 10]], 0.9)) return 'W';
      return 'L';
    },
  },
  {
    theme: 'Pâques', nom: 'Mouton kawaii rond', plaques: RONDS,
    couleurs: { S: 'H97', G: 'H47', W: 'H64', C: 'H70', F: 'H27', O: 'H78', N: 'H18', E: 'H01', R: 'H95', M: 'H76', J: 'H43', K: 'H60' },
    relief: { W: ['H01', 'H77'], F: ['H78', null], O: [null, 'H95'], G: ['H98', 'H10'], J: ['H103', null] },
    f(x, y, r, a) {
      // petite fleur posée sur la laine
      if (Math.hypot(x - 5.5, y + 8.2) < 0.9) return 'K';
      if (Math.hypot(x - 5.5, y + 8.2) < 2.1) return 'J';
      // visage
      const visage = G.ell(x, y, 0, 2, 6.8, 6.2);
      if (visage) {
        if (G.pres(x, y, [[-3.6, 0.3], [2.4, 0.3]], 0.75)) return 'E'; // reflets (en haut à gauche de chaque œil)
        if (G.ell(Math.abs(x), y, 3, 1.3, 1.7, 2.2)) return 'N'; // grands yeux
        if (G.pres(x, y, [[-5, 4.2], [5, 4.2]], 1.3)) return 'R'; // joues
        if (G.pres(x, y, [[-0.9, 5], [0.9, 5], [0, 5.8]], 0.55)) return 'M'; // bouche « ω »
        if (G.pres(x, y, [[0, 3.6]], 0.55)) return 'R'; // petit nez
        return 'F';
      }
      // oreilles
      const [u, v] = G.tourne(Math.abs(x) - 7.8, y - 0.5, 0.35);
      if (G.ell(u, v, 0, 0, 3, 1.5)) return 'O';
      // tête en laine, bord festonné en nuage
      if (r < 11.3 + 1.3 * Math.cos(10 * a)) return Math.sin(x * 1.25) + Math.cos(y * 1.25) > 1.25 ? 'C' : 'W';
      return y > 7 ? 'G' : 'S'; // herbe et ciel
    },
  },
);
