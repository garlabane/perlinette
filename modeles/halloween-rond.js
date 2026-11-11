'use strict';
// Thème Halloween — 10 modèles originaux conçus POUR LA PLAQUE RONDE (picots en anneaux).
// Au lieu d'une grille de carrés, chaque modèle est une petite « recette » géométrique :
// f(x, y, r, a) renvoie la lettre de la couleur au point (x, y) — en pas, centre de la
// plaque = (0, 0), y vers le bas, r = distance au centre, a = angle. Les formes rondes
// (cercles, anneaux, rayons, spirales) suivent ainsi parfaitement les anneaux de picots.

// (outils G et RONDS : voir modeles.js)

MODELES.push(
  {
    theme: 'Halloween', nom: 'Toile d’araignée', plaques: RONDS,
    couleurs: { N: 'H18', W: 'H55', O: 'H04', V: 'H07' },
    f(x, y, r, a) {
      if (r > 13.5) return 'O';
      if (r < 0.5) return 'V';
      for (const k of [4, 8, 12]) if (Math.abs(r - k) < 0.3) return 'W';
      for (let m = 0; m < 6; m++) if (G.ecartAngle(a, -Math.PI / 2 + (m * Math.PI) / 3) * r < 0.4) return 'W';
      if (Math.hypot(x - 3.5, y + 5.5) < 1.5) return 'V'; // petite araignée violette
      return 'N';
    },
  },
  {
    theme: 'Halloween', nom: 'Œil de monstre', plaques: RONDS,
    couleurs: { W: 'H01', R: 'H05', D: 'H22', V: 'H10', L: 'H16', N: 'H18' },
    relief: { W: [null, 'H77'], V: ['H11', 'H28'] },
    f(x, y, r, a) {
      if (r > 13.5) return 'R';
      if (Math.hypot(x + 1.8, y + 1.8) < 1.2) return 'W'; // reflet
      if (r < 3.5) return 'N';
      if (r < 5.5) return 'V';
      if (r < 7.5) return 'L';
      // veines
      if (r > 8.5) for (const ang of [0.3, 2.4, 4.3]) if (G.ecartAngle(a, ang + 0.15 * Math.sin(r)) * r < 0.5) return 'D';
      return 'W';
    },
  },
  {
    theme: 'Halloween', nom: 'Sucette spirale', plaques: RONDS,
    couleurs: { O: 'H04', P: 'H07', N: 'H18' },
    relief: { O: ['H79', 'H20'], P: ['H45', 'H82'] },
    f(x, y, r, a) {
      if (r > 13.5) return 'N';
      if (r < 0.5) return 'N';
      const t = (a / (2 * Math.PI) + r / 5 + 10) % 1;
      return t < 0.5 ? 'O' : 'P';
    },
  },
  {
    theme: 'Halloween', nom: 'Citrouille lumineuse', plaques: RONDS,
    couleurs: { O: 'H04', D: 'H20', J: 'H03', G: 'H10' },
    relief: { O: ['H79', 'H20'], J: ['H103', 'H14'] },
    f(x, y, r) {
      if (y < -11.5 && Math.abs(x) < 1.6) return 'G'; // tige
      if (G.tri(x, y, -7.5, -0.5, -2, -0.5, -4.8, -6.2) || G.tri(x, y, 7.5, -0.5, 2, -0.5, 4.8, -6.2)) return 'J'; // yeux
      if (G.tri(x, y, 0, 0.5, -1.7, 3, 1.7, 3)) return 'J'; // nez
      const haut = 4.5 + 0.02 * x * x, bas = 9.5 - 0.045 * x * x;
      if (Math.abs(x) < 8.6 && y > haut && y < bas) {
        if ((Math.abs(x - 3.5) < 1.1 && y < haut + 1.6) || (Math.abs(x + 3.5) < 1.1 && y > bas - 1.6)) return 'O'; // dents
        return 'J';
      }
      if (r > 3 && Math.abs(Math.abs(x) - 6.5 * Math.sqrt(Math.max(0, 1 - (y / 14) ** 2))) < 0.45) return 'D'; // côtes
      return 'O';
    },
  },
  {
    theme: 'Halloween', nom: 'Lune et chauve-souris', plaques: RONDS,
    couleurs: { B: 'H116', J: 'H43', N: 'H18', W: 'H55' },
    relief: { J: ['H103', 'H14'], N: ['H71', null] },
    f(x, y, r) {
      const bx = Math.abs(x), by = y - 0.5;
      // chauve-souris : corps, oreilles, ailes relevées aux pointes, bord bas festonné
      if (G.ell(x, y, 0, 0.8, 1.4, 2.4)) return 'N';
      if (G.tri(bx, by, 0.1, -1.5, 1.3, -1.5, 1.0, -3.6)) return 'N';
      if (bx > 1 && bx < 8) {
        const haut = -1.2 - 0.55 * (bx - 1), bas = 1.8 - 0.55 * (bx - 1) - 1.5 * Math.abs(Math.sin((Math.PI * (bx - 1)) / 2.33));
        if (by > haut && by < bas) return 'N';
      }
      if (r < 10.5) return 'J'; // pleine lune
      if (G.pres(x, y, [[-11, -6], [-8, 10], [11, -6], [-12, 3], [12, 4], [0, -12.5], [7, 11]])) return 'W'; // étoiles
      return 'B';
    },
  },
  {
    theme: 'Halloween', nom: 'Tête de mort ronde', plaques: RONDS,
    couleurs: { V: 'H07', W: 'H01', N: 'H18', O: 'H04' },
    relief: { W: [null, 'H70'], V: ['H45', 'H82'] },
    f(x, y, r) {
      if (r > 13.5) return 'O';
      const crane = Math.hypot(x, y + 2.5) < 8.3, machoire = Math.abs(x) < 4.6 && y >= 3 && y < 9.3;
      if (!crane && !machoire) return 'V';
      if (Math.hypot(Math.abs(x) - 3.4, y + 1.5) < 2.4) return 'N'; // orbites
      if (G.tri(x, y, 0, 2, -1.3, 4.2, 1.3, 4.2)) return 'N'; // nez
      if (y > 5.8 && y < 9 && [-2, 0, 2].some((c) => Math.abs(x - c) < 0.4)) return 'N'; // dents
      return 'W';
    },
  },
  {
    theme: 'Halloween', nom: 'Chat dans la lune', plaques: RONDS,
    couleurs: { J: 'H43', N: 'H18', L: 'H42', P: 'H07' },
    relief: { J: ['H103', 'H14'], N: ['H71', null] },
    f(x, y, r) {
      if (r > 13.5) return 'P';
      if (G.pres(x, y, [[-1.5, -2.5], [1.5, -2.5]], 0.75)) return 'L'; // yeux
      const chat = G.ell(x, y, 0, 6.5, 5, 5.5) || Math.hypot(x, y + 2) < 3.9
        || G.tri(x, y, -3.6, -3.6, -1, -4.8, -3.4, -7.6) || G.tri(x, y, 3.6, -3.6, 1, -4.8, 3.4, -7.6)
        || G.seg(x, y, 4, 10.5, 8, 9) < 0.8 || G.seg(x, y, 8, 9, 9.5, 5) < 0.8 || G.seg(x, y, 9.5, 5, 8.5, 2.5) < 0.8;
      return chat ? 'N' : 'J';
    },
  },
  {
    theme: 'Halloween', nom: 'Fantôme dans la nuit', plaques: RONDS,
    couleurs: { B: 'H116', W: 'H55', N: 'H18', R: 'H06', J: 'H03' },
    relief: { W: [null, 'H57'] },
    f(x, y, r) {
      if (r > 13.5) return 'N';
      const tete = Math.hypot(x, y + 3) < 7, corps = Math.abs(x) < 7 && y >= -3 && y < 6.5 + 1.6 * Math.cos((x * Math.PI) / 2.4);
      if (tete || corps) {
        if (G.ell(x, y, -2.6, -3, 1.1, 1.8) || G.ell(x, y, 2.6, -3, 1.1, 1.8)) return 'N';
        if (G.ell(x, y, 0, 1.8, 1.5, 2)) return 'N';
        if (G.pres(x, y, [[-4.6, -0.5], [4.6, -0.5]], 0.7)) return 'R';
        return 'W';
      }
      if (G.pres(x, y, [[-10, -6], [9, -8], [-8, 9], [10, 6], [-2, -12], [3, 12]])) return 'J';
      return 'B';
    },
  },
  {
    theme: 'Halloween', nom: 'Rosace d’Halloween', plaques: RONDS,
    couleurs: { N: 'H18', O: 'H04', P: 'H07', L: 'H104', J: 'H14' },
    f(x, y, r, a) {
      const k = Math.round(r), secteur = (n) => Math.floor(((a + Math.PI / 2 + 4 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI / n));
      if (k === 0) return 'J';
      if (k === 1) return 'O';
      if (k === 2) return 'P';
      if (k === 3) return 'N';
      if (k <= 5) return secteur(12) % 2 ? 'N' : 'O';
      if (k === 6) return 'P';
      if (k <= 9) { const s = (((a + Math.PI / 2) / (2 * Math.PI / 12)) % 1 + 1) % 1; return Math.abs(s - 0.5) * 2 < (k - 6) / 3.5 ? 'N' : 'L'; }
      if (k === 10) return 'O';
      if (k <= 12) return secteur(24) % 2 ? 'P' : 'N';
      if (k === 13) return 'O';
      return 'N';
    },
  },
  {
    theme: 'Halloween', nom: 'Chaudron bouillonnant', plaques: RONDS,
    couleurs: { P: 'H07', N: 'H18', G: 'H17', L: 'H16', V: 'H10', O: 'H38', J: 'H14' },
    relief: { N: ['H71', null], G: ['H70', 'H71'], P: ['H45', null] },
    f(x, y, r) {
      if (r > 13.5) return 'N';
      // flammes sous la marmite
      if (y > 9.5 && y < 13.5 && Math.abs(x) < 6) {
        const pointe = 13.5 - 2.4 * Math.abs(Math.sin((Math.PI * (x + 6)) / 4));
        if (y > pointe - 1.2) return y > 11.8 ? 'J' : 'O';
      }
      if (y >= -2 && y <= 0 && Math.abs(x) < 10.5) return 'G'; // rebord
      if (y > 0 && G.ell(x, y, 0, 3, 9.5, 7)) return 'N'; // marmite
      if (G.pres(x, y, [[-4, -4], [1, -6], [5, -3.5]], 1.8) || G.pres(x, y, [[-2, -9.5], [3.5, -10]], 1)) return 'L'; // bulles
      if (y > -3.5 && y < -2 && Math.abs(x) < 9.5) return 'V'; // potion
      return 'P';
    },
  },
);
