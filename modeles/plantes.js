'use strict';
// Thème Plantes et fleurs — 10 modèles originaux.
// Grilles (≤ 13 de large) pour les carrés ; tournesol et fleur à 6 pétales en « recettes »
// pour les ronds et les hexagones (f reçoit R = rayon utile de la plaque).

const fleurRond = (x, y, R) => [x / R, y / R, Math.hypot(x, y) / R];

MODELES.push(
  {
    theme: 'Plantes et fleurs', nom: 'Cactus en pot', plaques: P_PETITS,
    couleurs: { V: 'H10', D: 'H28', R: 'H06', T: 'H20' },
    relief: { V: ['H47', 'H28'], T: ['H79', null] },
    grille: [
      '.....R.....',
      '....RRR....',
      '....VVV....',
      '.V..VVV..V.',
      '.VV.VDV.VV.',
      '..VVVVVVV..',
      '....VVV....',
      '....VDV....',
      '....VVV....',
      '..TTTTTTT..',
      '...TTTTT...',
      '...TTTTT...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Plante en pot', plaques: P_PETITS,
    couleurs: { V: 'H10', W: 'H01', P: 'H95' },
    relief: { V: ['H47', 'H28'], W: [null, 'H77'] },
    grille: [
      '.....V.....',
      '..V..V..V..',
      '..VV.V.VV..',
      '...VVVVV...',
      '.VV..V..VV.',
      '..VVVVVVV..',
      '.....V.....',
      '..PPPPPPP..',
      '..WWWWWWW..',
      '...WWWWW...',
      '...WWWWW...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Rose', plaques: P_PETITS,
    couleurs: { R: 'H05', D: 'H22', V: 'H10' },
    relief: { R: ['H44', null], V: ['H47', 'H28'] },
    grille: [
      '...RRRRR...',
      '..RRDDDRR..',
      '.RRDRRRDRR.',
      '.RDRRDRRDR.',
      '.RRDRRRDRR.',
      '..RRDDDRR..',
      '...RRRRR...',
      '.....V.....',
      '.VV..V.....',
      '..VVVV..VV.',
      '.....VVVV..',
      '.....V.....',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Feuille', plaques: P_PETITS,
    couleurs: { V: 'H10', D: 'H28' },
    relief: { V: ['H47', null] },
    grille: [
      '.....V.....',
      '....VVV....',
      '...VVDVV...',
      '..VVVDVVV..',
      '.VVDVDVDVV.',
      '.VVVDDDVVV.',
      'VVDVVDVVDVV',
      '.VVVVDVVVV.',
      '..VVVDVVV..',
      '...VVDVV...',
      '....VDV....',
      '.....D.....',
      '.....D.....',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Champignon', plaques: P_PETITS,
    couleurs: { R: 'H05', W: 'H01', C: 'H02', N: 'H18' },
    relief: { R: ['H44', 'H22'], C: [null, 'H27'] },
    grille: [
      '...RRRRR...',
      '..RRWRRRR..',
      '.RWWRRRRWR.',
      'RRRRRRWWRRR',
      'RRWRRRWWRRR',
      '.CCCCCCCCC.',
      '...CCCCC...',
      '...CNCNC...',
      '...CCCCC...',
      '....CCC....',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Arbre', plaques: P_PETITS,
    couleurs: { V: 'H10', L: 'H104', M: 'H76', G: 'H47' },
    relief: { V: ['H47', 'H28'], M: [null, 'H12'] },
    grille: [
      '....VVVVV....',
      '..VVVVLVVVV..',
      '.VVLVVVVVLVV.',
      'VVVVVVLVVVVVV',
      'VLVVVVVVVVLVV',
      'VVVVLVVVLVVVV',
      '.VVVVVVVVVVV.',
      '..VVVVMVVVV..',
      '.....MMM.....',
      '.....MMM.....',
      '....MMMMM....',
      '...GGGGGGG...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Trèfle à quatre feuilles', plaques: P_PETITS,
    couleurs: { V: 'H10', L: 'H47' },
    relief: { V: ['H47', 'H28'] },
    grille: [
      '..VV...VV..',
      '.VVVV.VVVV.',
      '.VVVVVVVVV.',
      '..VVVVVVV..',
      '..VVVLVVV..',
      '.VVVVVVVVV.',
      '.VVVVVVVVV.',
      '..VV.V.VV..',
      '.....V.....',
      '.....VV....',
      '......V....',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Lavande', plaques: P_PETITS,
    couleurs: { L: 'H45', V: 'H10', R: 'H95' },
    relief: { L: ['H106', 'H07'] },
    grille: [
      '....L....',
      '...LLL...',
      '.L..L..L.',
      'LLL.L.LLL',
      '.L.LLL.L.',
      'LLL.L.LLL',
      '.L.LLL.L.',
      '.V..V..V.',
      '.V..V..V.',
      '.VVRRRVV.',
      '..VVVVV..',
      '...VVV...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Tournesol', plaques: P_RONDS,
    couleurs: { S: 'H97', J: 'H03', O: 'H60', M: 'H12', K: 'H76' },
    relief: { J: ['H103', null] },
    f(x, y, r, a, R) {
      const [u, v, d] = fleurRond(x, y, R);
      if (d > 1.02) return '.';
      if (d < 0.4) return (Math.floor(x * 0.9 + 50) + Math.floor(y * 0.9 + 50)) % 2 ? 'M' : 'K';
      for (let k = 0; k < 12; k++) { const [pu, pv] = G.tourne(u, v, (k * Math.PI) / 6); if (G.ell(pu, pv, 0.66, 0, 0.32, 0.14)) return 'J'; }
      for (let k = 0; k < 12; k++) { const [pu, pv] = G.tourne(u, v, (k * Math.PI) / 6 + Math.PI / 12); if (G.ell(pu, pv, 0.58, 0, 0.26, 0.12)) return 'O'; }
      return 'S';
    },
  },
  {
    theme: 'Plantes et fleurs', nom: 'Fleur à six pétales', plaques: P_RONDS,
    couleurs: { G: 'H47', P: 'H95', J: 'H03', W: 'H01' },
    relief: { P: ['H78', 'H48'], G: ['H98', null] },
    f(x, y, r, a, R) {
      const [u, v, d] = fleurRond(x, y, R);
      if (d > 1.02) return '.';
      if (d < 0.22) return 'J';
      // six pétales en goutte, séparés par du vert
      for (let k = 0; k < 6; k++) { const t = -Math.PI / 2 + (k * Math.PI) / 3; const [pu, pv] = G.tourne(u, v, t); if (G.ell(pu, pv, 0.56, 0, 0.36, 0.2)) return 'P'; }
      return 'G';
    },
  },
);
