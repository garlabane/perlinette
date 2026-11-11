'use strict';
// Thème Noël — 10 modèles originaux conçus pour la plaque RONDE (picots en anneaux).
// f(x, y, r, a) : couleur au point (x, y), centre = (0, 0), y vers le bas. Outils G : modeles.js.

MODELES.push(
  {
    theme: 'Noël', nom: 'Couronne', plaques: RONDS,
    couleurs: { W: 'H01', V: 'H10', F: 'H28', R: 'H05', D: 'H22' },
    relief: { W: [null, 'H97'], R: ['H44', 'H22'] },
    f(x, y, r, a) {
      if (r > 13.5) return 'R';
      if (Math.hypot(x, y - 10) < 1.1) return 'D'; // nœud
      if (G.tri(x, y, 0, 10, -4.5, 7.5, -4.5, 12.5) || G.tri(x, y, 0, 10, 4.5, 7.5, 4.5, 12.5)) return 'R'; // ruban
      if (r > 7.5 && r < 12.5) {
        const baies = [];
        for (let k = 0; k < 8; k++) { const t = -Math.PI / 2 + 0.4 + (k * Math.PI) / 4; baies.push([10 * Math.cos(t), 10 * Math.sin(t)]); }
        if (G.pres(x, y, baies, 1)) return 'R';
        return Math.floor(((a + 4 * Math.PI) % (2 * Math.PI)) / (Math.PI / 10)) % 2 ? 'V' : 'F';
      }
      return 'W';
    },
  },
  {
    theme: 'Noël', nom: 'Flocon de neige', plaques: RONDS,
    couleurs: { B: 'H08', W: 'H01', C: 'H09' },
    relief: { W: [null, 'H97'] },
    f(x, y, r, a) {
      if (r > 13.5) return 'C';
      if (r < 1.5) return 'W';
      for (let m = 0; m < 6; m++) {
        const t = -Math.PI / 2 + (m * Math.PI) / 3;
        if (r < 12.2 && G.ecartAngle(a, t) * r < 0.45) return 'W';
        for (const base of [5, 9]) for (const s of [-1, 1]) {
          const bx = base * Math.cos(t), by = base * Math.sin(t), d = t + s * 0.9;
          if (G.seg(x, y, bx, by, bx + 2.6 * Math.cos(d), by + 2.6 * Math.sin(d)) < 0.5) return 'W';
        }
      }
      return 'B';
    },
  },
  {
    theme: 'Noël', nom: 'Étoile du berger', plaques: RONDS,
    couleurs: { N: 'H116', J: 'H03', O: 'H61', D: 'H61', W: 'H34' },
    relief: { J: ['H103', 'H60'] },
    f(x, y, r) {
      if (r > 13.5) return 'D';
      if (G.poly(x, y, G.etoile(5, 6, 2.6))) return 'O';
      if (G.poly(x, y, G.etoile(5, 11.5, 4.6))) return 'J';
      if (G.pres(x, y, [[-10, -7], [10, -7], [-11, 5], [11, 5], [0, 12], [-6, 10], [6, 10]])) return 'W';
      return 'N';
    },
  },
  {
    theme: 'Noël', nom: 'Boule décorée', plaques: RONDS,
    couleurs: { R: 'H05', J: 'H61', W: 'H01', G: 'H17' },
    relief: { R: ['H44', 'H22'] },
    f(x, y, r) {
      if (y < -11.5 && Math.abs(x) < 3) return 'G'; // attache
      if (Math.hypot(x + 6, y + 6.5) < 1.6) return 'W'; // reflet
      if (Math.abs(y + 4) < 0.6 || Math.abs(y - 4) < 0.6) return 'J';
      const zig = 2 * Math.abs((((x / 3) % 2) + 2) % 2 - 1) - 1;
      if (Math.abs(y - zig) < 0.6) return 'W';
      return 'R';
    },
  },
  {
    theme: 'Noël', nom: 'Sapin sous la neige', plaques: RONDS,
    couleurs: { N: 'H116', W: 'H01', V: 'H10', M: 'H12', J: 'H03', R: 'H13' },
    relief: { V: ['H47', 'H28'], W: [null, 'H97'] },
    f(x, y) {
      if (Math.hypot(x, y + 11.6) < 1.3) return 'J'; // étoile
      if (G.pres(x, y, [[-2, -5], [3, -1], [-4, 2], [5, 5], [-1, 4], [-6, 6]], 0.7)) return 'R'; // boules
      if (G.tri(x, y, 0, -11, -5.5, -3, 5.5, -3) || G.tri(x, y, 0, -7, -8, 2.5, 8, 2.5) || G.tri(x, y, 0, -3, -10, 7.5, 10, 7.5)) return 'V';
      if (Math.abs(x) < 1.6 && y >= 7.5 && y < 10) return 'M';
      if (y > 9.5) return 'W'; // neige au sol
      if (G.pres(x, y, [[-10, -6], [9, -9], [-6, -11], [11, -2], [-12, 1], [7, -4]])) return 'W';
      return 'N';
    },
  },
  {
    theme: 'Noël', nom: 'Bonhomme de neige rond', plaques: RONDS,
    couleurs: { B: 'H08', W: 'H01', N: 'H18', O: 'H04', R: 'H05' },
    relief: { W: [null, 'H97'], N: ['H71', null], R: [null, 'H22'] },
    f(x, y) {
      if (Math.abs(x) < 4.2 && y > -7.4 && y < -6.2) return 'N'; // bord du chapeau
      if (Math.abs(x) < 2.6 && y > -11 && y <= -7.4) return 'N'; // chapeau
      if (y > -0.9 && y < 0.7 && Math.abs(x) < 3.9) return 'R'; // écharpe
      if (G.pres(x, y, [[-1.4, -4], [1.4, -4], [0, 3.5], [0, 6], [0, 8.5]], 0.7)) return 'N';
      if (y > -3.4 && y < -2.4 && x > 0 && x < 3) return 'O'; // nez carotte
      if (Math.hypot(x, y + 3.3) < 3.9 || Math.hypot(x, y - 5.8) < 5.2) return 'W';
      if (y > 10.5) return 'W'; // neige
      if (G.pres(x, y, [[-9, -8], [8, -10], [-11, 0], [10, -2], [-7, 5], [8, 6]])) return 'W';
      return 'B';
    },
  },
  {
    theme: 'Noël', nom: 'Spirale sucre d’orge', plaques: RONDS,
    couleurs: { R: 'H05', W: 'H01', V: 'H10' },
    relief: { R: [null, 'H22'] },
    f(x, y, r, a) {
      if (r > 13.5) return 'V';
      if (r < 0.5) return 'R';
      return G.spirale(r, a, 4.5, 2) ? 'W' : 'R';
    },
  },
  {
    theme: 'Noël', nom: 'Rosace de Noël', plaques: RONDS,
    couleurs: { R: 'H05', V: 'H10', W: 'H01', J: 'H61', F: 'H28' },
    f(x, y, r, a) {
      const k = Math.round(r), sect = (n) => Math.floor(((a + Math.PI / 2 + 4 * Math.PI) % (2 * Math.PI)) / ((2 * Math.PI) / n));
      if (k === 0) return 'J';
      if (k <= 2) return 'R';
      if (k === 3) return 'W';
      if (k <= 5) return sect(12) % 2 ? 'V' : 'R';
      if (k === 6) return 'J';
      if (k <= 9) { const s = (((a + Math.PI / 2) / ((2 * Math.PI) / 12)) % 1 + 1) % 1; return Math.abs(s - 0.5) * 2 < (k - 6) / 3.5 ? 'F' : 'W'; }
      if (k === 10) return 'R';
      if (k <= 12) return sect(24) % 2 ? 'W' : 'V';
      if (k === 13) return 'J';
      return 'R';
    },
  },
  {
    theme: 'Noël', nom: 'Cadeau rond', plaques: RONDS,
    couleurs: { R: 'H05', V: 'H10', J: 'H61' },
    relief: { R: ['H44', 'H22'], V: ['H47', 'H28'] },
    f(x, y, r) {
      if (r > 13.5) return 'J';
      if (r < 1.6) return 'J';
      // nœud : quatre boucles en diagonale
      for (const s of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) if (G.ell(x * s[0], y * s[1], 2.4, 2.4, 1.6, 1.6)) return 'V';
      if (Math.abs(x) < 1.3 || Math.abs(y) < 1.3) return 'V';
      return 'R';
    },
  },
  {
    theme: 'Noël', nom: 'Bougie', plaques: RONDS,
    couleurs: { N: 'H116', R: 'H05', W: 'H01', J: 'H14', O: 'H38', P: 'H103', V: 'H10', D: 'H61' },
    relief: { R: ['H44', 'H22'] },
    f(x, y) {
      if (Math.hypot(x, y) > 13.5) return 'D';
      if (G.ell(x, y, 0, -5, 0.8, 1.4)) return 'O'; // cœur de la flamme
      if (G.ell(x, y, 0, -5.5, 1.7, 3)) return 'J'; // flamme
      if (Math.abs(x) < 0.5 && y > -2.6 && y < -1.6) return 'N'; // mèche
      if (Math.abs(x) < 3.2 && y >= -1.6 && y < 11) return (y < 0.2 && Math.abs(x) < 2.6) || (y < 1.6 && Math.abs(x + 1.8) < 0.6) ? 'W' : 'R';
      if (G.pres(x, y, [[-5, 10], [-6.5, 9], [5, 10], [6.5, 9]], 0.9)) return 'V'; // houx
      if (G.pres(x, y, [[-4.6, 8.4], [4.6, 8.4]], 0.7)) return 'R';
      if (Math.hypot(x, y + 5.5) < 5.5) return 'P'; // halo
      return 'N';
    },
  },
);
