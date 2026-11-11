'use strict';
// Thème Mer et océan — 10 modèles originaux. Étoile de mer et bouée en « recettes ».

MODELES.push(
  {
    theme: 'Mer et océan', nom: 'Poisson tropical', plaques: P_PETITS,
    couleurs: { O: 'H04', W: 'H01', N: 'H18' },
    relief: { O: [null, 'H20'] },
    grille: [
      '....OOOO.....',
      '..OOWOOOW..OO',
      '.OOOWOOOWOOOO',
      'ONOOWOOOWOOO.',
      'OOOOWOOOWOOO.',
      '.OOOWOOOWOOOO',
      '..OOWOOOW..OO',
      '....OOOO.....',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Baleine', plaques: P_PETITS,
    couleurs: { B: 'H09', W: 'H01', N: 'H18', L: 'H46' },
    relief: { B: ['H46', 'H08'] },
    grille: [
      '..LL.LL......',
      '...LLL.......',
      '....L........',
      '..BBBBBB.....',
      '.BBBBBBBBB..B',
      'BBNBBBBBBBBBB',
      'BBBBBBBBBBBB.',
      'WWWWWWWWWWBB.',
      '.WWWWWWWW....',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Pieuvre', plaques: P_PETITS,
    couleurs: { P: 'H06', N: 'H18' },
    relief: { P: ['H95', null] },
    grille: [
      '...PPPPP...',
      '..PPPPPPP..',
      '.PPPPPPPPP.',
      '.PPNNPNNPP.',
      '.PPPPPPPPP.',
      '.PPPPPPPPP.',
      'PP.PP.PP.PP',
      'P..P..P..P.',
      'PP.PP.PP.PP',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Étoile de mer', plaques: P_RONDS,
    couleurs: { S: 'H46', O: 'H04', J: 'H43' },
    relief: { O: ['H79', 'H20'] },
    f(x, y, r, a, R) {
      const u = x / R, v = y / R;
      if (Math.hypot(u, v) > 1.02) return '.';
      if (G.poly(u, v, G.etoile(5, 0.95, 0.4))) {
        const dots = [];
        for (let k = 0; k < 5; k++) { const t = -Math.PI / 2 + (k * 2 * Math.PI) / 5; dots.push([0.55 * Math.cos(t), 0.55 * Math.sin(t)]); }
        return G.pres(u, v, dots, Math.max(0.08, 0.7 / R)) || Math.hypot(u, v) < 0.12 ? 'J' : 'O';
      }
      return 'S';
    },
  },
  {
    theme: 'Mer et océan', nom: 'Coquillage', plaques: P_PETITS,
    couleurs: { P: 'H78', K: 'H95' },
    grille: [
      '...PPPPP...',
      '..PPKPKPP..',
      '.PPKPKPKPP.',
      'PPKPPKPPKPP',
      'PKPPPKPPPKP',
      'PKPPPKPPPKP',
      '.PKPPKPPKP.',
      '..PKPKPKP..',
      '...PPKPP...',
      '....PPP....',
      '...PPPPP...',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Crabe', plaques: P_PETITS,
    couleurs: { R: 'H05', W: 'H01', N: 'H18' },
    relief: { R: ['H44', 'H22'] },
    grille: [
      '.RRR.W.W.RRR.',
      '.RRR.N.N.RRR.',
      '..R..N.N..R..',
      '..RRRRRRRRR..',
      '.RRRRRRRRRRR.',
      'RRRRRRRRRRRRR',
      '.RRRRRRRRRRR.',
      '.R.R.R.R.R.R.',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Méduse', plaques: P_PETITS,
    couleurs: { L: 'H96', N: 'H18', P: 'H06', T: 'H74' },
    relief: { L: ['H106', 'H74'] },
    grille: [
      '...LLLLL...',
      '.LLLLLLLLL.',
      'LLLNLLLNLLL',
      'LLPLLLLLPLL',
      'LLLLLLLLLLL',
      'T.T.T.T.T.T',
      'T.T.T.T.T.T',
      'T.T.T.T.T.T',
      '..T...T....',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Ancre', plaques: P_PETITS,
    couleurs: { N: 'H08' },
    relief: { N: ['H09', 'H116'] },
    grille: [
      '....NNN....',
      '....N.N....',
      '....NNN....',
      '.....N.....',
      '..NNNNNNN..',
      '.....N.....',
      '.....N.....',
      'N....N....N',
      'NN...N...NN',
      '.NN..N..NN.',
      '..NNNNNNN..',
      '....NNN....',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Bouée', plaques: P_RONDS,
    couleurs: { R: 'H05', W: 'H01', B: 'H46' },
    relief: { R: [null, 'H22'], W: [null, 'H77'] },
    f(x, y, r, a, R) {
      const d = r / R;
      if (d > 1.02) return '.';
      if (d < 0.42) return 'B';
      return Math.floor(((a + Math.PI) / (2 * Math.PI)) * 8 + 0.5) % 2 ? 'W' : 'R';
    },
  },
  {
    theme: 'Mer et océan', nom: 'Phare', plaques: P_PETITS,
    couleurs: { N: 'H18', J: 'H03', R: 'H05', W: 'H01', M: 'H17' },
    relief: { R: ['H44', 'H22'], W: [null, 'H70'], M: ['H70', 'H71'] },
    grille: [
      '...NNN...',
      '...JJJ...',
      '..NNNNN..',
      '...RRR...',
      '...WWW...',
      '...RRR...',
      '..WWWWW..',
      '..RRRRR..',
      '..WWWWW..',
      '.RRRRRRR.',
      'MMMMMMMMM',
      '.MMMMMMM.',
    ],
  },
);
