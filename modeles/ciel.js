'use strict';
// Thème Ciel et météo — 10 modèles originaux. Soleil, arc-en-ciel, planète et flocon en
// « recettes » (ronds, hexagones, petit carré, Maxi) ; les autres en grilles.

MODELES.push(
  {
    theme: 'Ciel et météo', nom: 'Soleil souriant', plaques: P_RONDS,
    couleurs: { S: 'H97', J: 'H03', O: 'H04', N: 'H18', P: 'H06' },
    relief: { J: ['H103', 'H60'] },
    f(x, y, r, a, R) {
      const u = x / R, v = y / R, d = r / R;
      if (d > 1.02) return '.';
      if (d < 0.58) {
        if (G.ell(u, v, -0.2, -0.12, 0.06, 0.1) || G.ell(u, v, 0.2, -0.12, 0.06, 0.1)) return 'N';
        const s = Math.hypot(u, v + 0.02);
        if (s > 0.24 && s < 0.33 && v > 0.1) return 'N';
        if (Math.hypot(Math.abs(u) - 0.36, v - 0.1) < 0.07) return 'P';
        return 'J';
      }
      for (let k = 0; k < 12; k++) {
        const t = (k * Math.PI) / 6, ecart = G.ecartAngle(a, t);
        if (d > 0.6 && d < 0.98 && ecart < 0.26 * (0.98 - d) / 0.38 + 0.02) return 'O';
      }
      return 'S';
    },
  },
  {
    theme: 'Ciel et météo', nom: 'Croissant de lune', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H01', J: 'H103', d: 'H03', P: 'H06' },
    grille: [
      '....KKK......',
      '...KlJdK.....',
      '..KlJJdK.....',
      '.KlJJdK......',
      'KlJJJdK......',
      'KlJJJJdK.....',
      'KJKKJJdK.....',
      'KPJJJJJdK..K.',
      'KJJJKJJJdKKdK',
      '.KJJJJJJJJJdK',
      '..KJdJJJJddK.',
      '...KKJdddKK..',
      '.....KKKK....',
    ],
  },
  {
    theme: 'Ciel et météo', nom: 'Étoile souriante', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H103', J: 'H03', d: 'H60', P: 'H06' },
    grille: [
      '......K......',
      '.....KlK.....',
      '....KlJdK....',
      'KKKKKlJJKKKKK',
      'KllJJJJJJJJdK',
      '.KlJKJJJKJdK.',
      '..KPJJKJJPK..',
      '...KJJJJdK...',
      '..KJJJdJJdK..',
      '..KJJdKJJdK..',
      '.KJJdK.KJJdK.',
      '.KJdK...KJdK.',
      '.KKK.....KKK.',
    ],
  },
  {
    theme: 'Ciel et météo', nom: 'Nuage', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', W: 'H01', w: 'H77', P: 'H06' },
    grille: [
      '...KKK.......',
      '..KWWwK.KK...',
      '.KWWWWwKWwK..',
      'KWWWWWWWWWwK.',
      'KWWWKWWWKWWwK',
      'KWWPWWKWWPWwK',
      'KWWWWWWWWWWwK',
      '.KWwwwwwwwwK.',
      '..KKKKKKKKK..',
    ],
  },
  {
    theme: 'Ciel et météo', nom: 'Arc-en-ciel', plaques: P_RONDS,
    couleurs: { S: 'H97', R: 'H05', O: 'H04', J: 'H03', V: 'H10', B: 'H09', L: 'H07', W: 'H01' },
    relief: { W: [null, 'H77'] },
    f(x, y, r, a, R) {
      const u = x / R, v = y / R;
      if (Math.hypot(u, v) > 1.02) return '.';
      if (G.ell(u, v, -0.6, 0.32, 0.3, 0.16) || G.ell(u, v, 0.6, 0.32, 0.3, 0.16) || Math.hypot(u + 0.62, v - 0.2) < 0.14 || Math.hypot(u - 0.58, v - 0.2) < 0.14) return 'W';
      const d = Math.hypot(u, v - 0.3);
      if (v < 0.32) for (const [r0, c] of [[0.86, 'R'], [0.75, 'O'], [0.64, 'J'], [0.53, 'V'], [0.42, 'B'], [0.31, 'L']]) if (d <= r0 && d > r0 - 0.11) return c;
      return 'S';
    },
  },
  {
    theme: 'Ciel et météo', nom: 'Éclair', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H103', J: 'H03', d: 'H60' },
    grille: [
      '....KKKKKK.',
      '...KlJJJdK.',
      '...KlJJdK..',
      '..KlJJJdK..',
      '..KlJJJKKKK',
      '.KldJJJJJdK',
      '.KKKKlJJdK.',
      '....KJJdK..',
      '...KlJdK...',
      '...KJdK....',
      '..KJdK.....',
      '..KdK......',
      '..KK.......',
    ],
  },
  {
    theme: 'Ciel et météo', nom: 'Goutte de pluie', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H01', B: 'H46', d: 'H09', P: 'H06' },
    grille: [
      '......K......',
      '.....KdK.....',
      '....KBBdK....',
      '....KlBdK....',
      '...KlBBBdK...',
      '..KlBBBBBdK..',
      '.KlBBBBBBBdK.',
      '.KBBKBBBKBdK.',
      'KlBPBBKBBPBdK',
      'KBBBBBBBBBBdK',
      '.KBBBBBBBBdK.',
      '..KBddddddK..',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Ciel et météo', nom: 'Planète', plaques: P_RONDS,
    couleurs: { N: 'H116', W: 'H01', O: 'H60', M: 'H20', J: 'H43' },
    relief: { O: ['H79', null] },
    f(x, y, r, a, R) {
      const u = x / R, v = y / R;
      if (Math.hypot(u, v) > 1.02) return '.';
      const [pu, pv] = G.tourne(u, v, -0.35), e = (pu / 0.88) ** 2 + (pv / 0.26) ** 2;
      const planete = Math.hypot(u, v) < 0.5;
      if (e > 0.72 && e < 1 && (pv > 0 || !planete)) return 'J';
      if (planete) return Math.floor((pv + 1) * 7) % 2 ? 'O' : 'M';
      if (G.pres(u, v, [[-0.7, -0.5], [0.6, -0.65], [-0.5, 0.7], [0.75, 0.55], [-0.85, 0.1], [0.1, -0.85]], Math.max(0.07, 0.5 / R))) return 'W';
      return 'N';
    },
  },
  {
    theme: 'Ciel et météo', nom: 'Parapluie', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H44', R: 'H05', r: 'H22', W: 'H01', w: 'H77', S: 'H21' },
    grille: [
      '......K......',
      '....KKrKK....',
      '...KlRWWrK...',
      '..KlRRWWRrK..',
      '.KlRRRWWRRrK.',
      'KlRRrRWWrRRrK',
      'KRrrKWWwKRrrK',
      '.KKK.KSK.KKK.',
      '....KKSK.....',
      '...KSKSK.....',
      '...KSSSK.....',
      '....KKK......',
    ],
  },
  {
    theme: 'Ciel et météo', nom: 'Flocon cristal', plaques: P_RONDS,
    couleurs: { B: 'H08', W: 'H01', C: 'H19', L: 'H97' },
    f(x, y, r, a, R) {
      const d = r / R;
      if (d > 1.02) return '.';
      if (d < 0.14) return 'L';
      for (let k = 0; k < 6; k++) {
        const t = (k * Math.PI) / 3;
        if (d < 0.92 && G.ecartAngle(a, t) * r < 0.75) return d > 0.75 ? 'C' : 'W';
        for (const base of [0.42, 0.68]) for (const s of [-1, 1]) {
          const bx = base * R * Math.cos(t), by = base * R * Math.sin(t), dd = t + s * 1.0;
          if (G.seg(x, y, bx, by, bx + 0.22 * R * Math.cos(dd), by + 0.22 * R * Math.sin(dd)) < 0.68) return 'W';
        }
      }
      return 'B';
    },
  },
);
