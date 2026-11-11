'use strict';
// Thème Gourmandises — 10 modèles originaux. Donut, pastèque et cookie en « recettes »
// (ronds, hexagones, petit carré, Maxi) ; les autres en grilles.

MODELES.push(
  {
    theme: 'Gourmandises', nom: 'Donut', plaques: P_RONDS,
    couleurs: { T: 'H75', P: 'H06', J: 'H03', B: 'H09', V: 'H11', W: 'H01' },
    relief: { T: ['H27', 'H76'], P: ['H95', null] },
    f(x, y, r, a, R) {
      const d = r / R;
      if (d > 1.02 || d < 0.3) return '.';
      const vague = 0.82 + 0.06 * Math.sin(a * 7);
      if (d > 0.36 && d < vague) {
        const k = Math.floor((a + Math.PI) * 9) % 5;
        if ((Math.round(d * R * 2) + Math.round((a + Math.PI) * 6)) % 7 === 0) return ['J', 'B', 'V', 'W', 'J'][k];
        return 'P';
      }
      return 'T';
    },
  },
  {
    theme: 'Gourmandises', nom: 'Glace', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', p: 'H78', P: 'H06', Q: 'H95', J: 'H33', C: 'H27', c: 'H21', D: 'H75' },
    grille: [
      '....KKKKK....',
      '..KKpPPPQKK..',
      '.KppPPPPPPQK.',
      'KpPPKPPPKPPQK',
      'KPPJPPKPPJPQK',
      'KPPPPPPPPPPQK',
      'KKPPPPPPPPQKK',
      '..KcCcCcCcK..',
      '..KCcCCCcDK..',
      '...KCcCcDK...',
      '...KCCcCDK...',
      '....KcDcK....',
      '.....KKK.....',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Cupcake', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', W: 'H01', R: 'H05', r: 'H22', p: 'H78', P: 'H06', Q: 'H95', B: 'H46', b: 'H09', J: 'H06' },
    grille: [
      '.....KKK.....',
      '....KWRrK....',
      '...KKRRRKK...',
      '..KpPPPPPQK..',
      '.KpPPPPPPPQK.',
      '.KQQQQQQQQQK.',
      'KpPPPPPPPPPQK',
      'KPPPPPPPPPPQK',
      'KKKKKKKKKKKKK',
      '.KBBKBBBKBbK.',
      '.KBJBBKBBJbK.',
      '..KBbbbbbbK..',
      '..KKKKKKKKK..',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Part de pizza', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', c: 'H27', C: 'H21', D: 'H20', J: 'H03', j: 'H60', R: 'H05', r: 'H22', P: 'H06' },
    grille: [
      '.KKKKKKKKKKK.',
      'KccCCCCCCCCDK',
      'KCCCCCCCCCCDK',
      'KJRRJJJJJRRjK',
      '.KRRJJJJJRrK.',
      '.KJJKJJJKJjK.',
      '..KPJJKJJPK..',
      '..KJJJJJJjK..',
      '...KJRRJjK...',
      '...KJRRJjK...',
      '....KJJjK....',
      '.....KjK.....',
      '......K......',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Fraise', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', g: 'H47', G: 'H10', V: 'H102', l: 'H44', R: 'H33', r: 'H05', S: 'H43', P: 'H06' },
    grille: [
      '.....KKK.....',
      '..KKKKGKKKK..',
      '.KggGGGGGGVK.',
      'KlRgGGGGGGRrK',
      'KlRRgRGRGRRrK',
      'KlRSRRRRRRSrK',
      'KRRRKRRRKRRrK',
      'KRSPRRKRRPRrK',
      '.KRRRRRRRSrK.',
      '.KRSRRRRRRrK.',
      '..KRRRRSRrK..',
      '...KRrrrrK...',
      '....KKKKK....',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Pastèque', plaques: P_RONDS,
    couleurs: { V: 'H10', W: 'H01', R: 'H05', N: 'H18' },
    relief: { V: [null, 'H28'], R: ['H44', null] },
    f(x, y, r, a, R) {
      const d = r / R;
      if (d > 1.02) return '.';
      if (d > 0.88) return 'V';
      if (d > 0.8) return 'W';
      for (let k = 0; k < 8; k++) { const t = (k * Math.PI) / 4 + 0.3; if (G.ell(...G.tourne(x / R - 0.5 * Math.cos(t), y / R - 0.5 * Math.sin(t), t), 0, 0, 0.09, 0.05)) return 'N'; }
      return 'R';
    },
  },
  {
    theme: 'Gourmandises', nom: 'Cerises', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', S: 'H102', g: 'H47', G: 'H10', l: 'H44', R: 'H33', r: 'H05', P: 'H06' },
    grille: [
      '.......KKKK..',
      '......KSKgGK.',
      '.....KSKKGGGK',
      '....KSKSKKKK.',
      '....KSKKSK...',
      '...KKSKKSKK..',
      '.KKlRRKKlRrK.',
      'KlRRRRKlRRRrK',
      'KRKRKRKRKRKrK',
      'KRPKPRKRPKPrK',
      'KRRRRrKRRRRrK',
      '.KRrrK.KRrrK.',
      '..KKK...KKK..',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Macaron', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', p: 'H78', P: 'H06', Q: 'H95', F: 'H02', f: 'H27', J: 'H33' },
    grille: [
      '...KKKKKKK...',
      '.KKpPPPPPQKK.',
      'KpPPPPPPPPPQK',
      'KpPPKPPPKPPQK',
      'KPPJPPKPPJPQK',
      'KPPPPPPPPPPQK',
      'KpPpPpPpPPPQK',
      'KFFFFFFFFFFfK',
      'KFFFFFFFFFFfK',
      'KpPpPpPpPPPQK',
      'KPQPPPPPPPQQK',
      '.KKPQQQQQQKK.',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Cookie', plaques: P_RONDS,
    couleurs: { T: 'H21', M: 'H12' },
    relief: { T: ['H75', 'H20'] },
    f(x, y, r, a, R) {
      const d = r / R;
      if (d > 1.02) return '.';
      const pepites = [[-0.4, -0.35], [0.2, -0.5], [0.5, 0], [-0.1, 0.1], [-0.55, 0.25], [0.25, 0.45], [-0.15, 0.62], [0.05, -0.15]];
      if (G.pres(x / R, y / R, pepites, Math.max(0.11, 1.5 / R))) return 'M';
      return 'T';
    },
  },
  {
    theme: 'Gourmandises', nom: 'Burger', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', b: 'H27', B: 'H60', D: 'H21', W: 'H02', G: 'H47', g: 'H10', T: 'H44', t: 'H05', J: 'H03', M: 'H76', m: 'H12', P: 'H06' },
    grille: [
      '...KKKKKKK...',
      '.KKbBWBBBDKK.',
      'KbBBBBBWBBBDK',
      'KBWBKBBBKBBDK',
      'KBBPBBKBBPBDK',
      'KBBBBBBBBBBDK',
      'KgGgGgGgGgGgK',
      'KTTTTTTTTTTtK',
      'KJJJJJJJJJJJK',
      'KMJMMMJMMMJmK',
      'KMMMMMMMMMMmK',
      'KbDDDDDDDDDDK',
      '.KKKKKKKKKKK.',
    ],
  },
);
