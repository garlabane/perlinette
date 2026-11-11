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
    theme: 'Gourmandises', nom: 'Glace', plaques: P_PETITS,
    couleurs: { R: 'H05', P: 'H06', C: 'H02', M: 'H75', K: 'H21' },
    relief: { P: ['H95', null], C: [null, 'H27'] },
    grille: [
      '....R....',
      '...PPP...',
      '..PPPPP..',
      '.PPPPPPP.',
      '.CCCCCCC.',
      'CCCCCCCCC',
      '.CCCCCCC.',
      '.MMMMMMM.',
      '..MKMKM..',
      '..MMMMM..',
      '...MKM...',
      '...MMM...',
      '....M....',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Cupcake', plaques: P_PETITS,
    couleurs: { R: 'H05', P: 'H95', W: 'H01', M: 'H46', K: 'H09' },
    relief: { P: ['H78', 'H48'] },
    grille: [
      '.....R.....',
      '....PPP....',
      '..PPPPPPP..',
      '.PPWPPPWPP.',
      'PPPPPWPPPPP',
      '.PPPPPPPPP.',
      '.MKMKMKMKM.',
      '.MKMKMKMKM.',
      '..MKMKMKM..',
      '..MKMKMKM..',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Part de pizza', plaques: P_PETITS,
    couleurs: { M: 'H21', J: 'H43', R: 'H05' },
    relief: { M: [null, 'H20'], R: [null, 'H22'] },
    grille: [
      'MMMMMMMMMMM',
      'MJJJJJJJJJM',
      '.JRRJJJRRJ.',
      '.JRRJJJRRJ.',
      '..JJJJJJJ..',
      '..JJRRJJJ..',
      '...JRRJJ...',
      '...JJJJJ...',
      '....JJJ....',
      '....JJJ....',
      '.....J.....',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Fraise', plaques: P_PETITS,
    couleurs: { R: 'H05', J: 'H43', V: 'H10' },
    relief: { V: ['H47', null] },
    grille: [
      '...VVV...',
      '.VVVVVVV.',
      '.RRRRRRR.',
      'RRJRRRJRR',
      'RRRRJRRRR',
      'RJRRRRRJR',
      '.RRRJRRR.',
      '..RJRRR..',
      '...RRR...',
      '....R....',
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
    theme: 'Gourmandises', nom: 'Cerises', plaques: P_PETITS,
    couleurs: { R: 'H05', N: 'H28', V: 'H10', W: 'H01' },
    relief: { R: ['H44', 'H22'] },
    grille: [
      '.....NNVV..',
      '....NN.N...',
      '...NN..N...',
      '.RRRR.RRRR.',
      'RWRRR.RWRRR',
      'RRRRR.RRRRR',
      'RRRRR.RRRRR',
      '.RRR...RRR.',
    ],
  },
  {
    theme: 'Gourmandises', nom: 'Macaron', plaques: P_PETITS,
    couleurs: { P: 'H95', K: 'H48', W: 'H02' },
    relief: { P: ['H78', null] },
    grille: [
      '..PPPPPPP..',
      '.PPPPPPPPP.',
      'PPPPPPPPPPP',
      'KKKKKKKKKKK',
      'WWWWWWWWWWW',
      'KKKKKKKKKKK',
      'PPPPPPPPPPP',
      '.PPPPPPPPP.',
      '..PPPPPPP..',
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
    theme: 'Gourmandises', nom: 'Burger', plaques: P_PETITS,
    couleurs: { M: 'H21', W: 'H02', V: 'H10', L: 'H47', R: 'H05', J: 'H03', N: 'H12' },
    relief: { M: ['H60', 'H20'] },
    grille: [
      '...MMMMMMM...',
      '.MMWMMMMWMMM.',
      'MMMMMMWMMMMMM',
      'VVLVVLVVLVVLV',
      'RRRRRRRRRRRRR',
      'JJJJJJJJJJJJJ',
      'NNNNNNNNNNNNN',
      '.NNNNNNNNNNN.',
      'MMMMMMMMMMMMM',
      '.MMMMMMMMMMM.',
    ],
  },
);
