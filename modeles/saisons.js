'use strict';
// Thème Saisons — 10 modèles originaux : printemps, été, automne, hiver.

MODELES.push(
  {
    theme: 'Saisons', nom: 'Arrosoir (printemps)', plaques: P_PETITS,
    couleurs: { G: 'H31', P: 'H06' },
    relief: { G: ['H97', 'H83'] },
    grille: [
      '..GGGGG......',
      '..G...G......',
      'GGGGGGGGG....',
      'GGGGGGGGG..GG',
      'GGGGGGGGGGGG.',
      'GGGPGGGGG....',
      'GGGGGGGGG....',
      '.GGGGGGG.....',
    ],
  },
  {
    theme: 'Saisons', nom: 'Bottes de pluie (printemps)', plaques: P_PETITS,
    couleurs: { J: 'H03', N: 'H18', W: 'H01' },
    relief: { J: ['H103', 'H60'] },
    grille: [
      '..WWWW...',
      '..JJJJ...',
      '..JJJJ...',
      '..JJJJ...',
      '..JJJJJJ.',
      '.JJJJJJJJ',
      '.NNNNNNNN',
    ],
  },
  {
    theme: 'Saisons', nom: 'Cerf-volant (printemps)', plaques: ['midi-carre-grand', 'maxi-carre-grand', 'mini-carre-grand'],
    couleurs: { R: 'H05', J: 'H03', B: 'H09', V: 'H10', N: 'H18', P: 'H06' },
    relief: { R: [null, 'H22'], J: [null, 'H60'], B: [null, 'H08'], V: [null, 'H28'] },
    grille: [
      '.....J.....',
      '....RJJ....',
      '...RRJJJ...',
      '..RRRJJJJ..',
      '.RRRRJJJJJ.',
      'RRRRRNJJJJJ',
      '.BBBBVVVVV.',
      '..BBBVVVV..',
      '...BBVVV...',
      '....BVV....',
      '.....V.....',
      '.....N.....',
      '.....NN....',
      '......P....',
      '......N....',
    ],
  },
  {
    theme: 'Saisons', nom: 'Lunettes de soleil (été)', plaques: P_GRANDS,
    couleurs: { N: 'H18', B: 'H15', W: 'H01' },
    grille: [
      'NNNNNNNNNNNNNNN',
      'NBWBBNNNNNBWBBN',
      'NBBBBN...NBBBBN',
      '.NBBN.....NBBN.',
      '..NN.......NN..',
    ],
  },
  {
    theme: 'Saisons', nom: 'Château de sable (été)', plaques: P_PETITS,
    couleurs: { M: 'H27', N: 'H76', K: 'H21' },
    relief: { M: [null, 'H75'] },
    grille: [
      'M.M.M...M.M.M',
      'MMMMM...MMMMM',
      'MMNMM...MMNMM',
      'MMMMMMMMMMMMM',
      'MMMMMNNNMMMMM',
      'MMMMMNNNMMMMM',
      'KKKKKKKKKKKKK',
    ],
  },
  {
    theme: 'Saisons', nom: 'Coucher de soleil sur la mer (été)', plaques: P_RONDS,
    couleurs: { O: 'H04', R: 'H44', P: 'H82', J: 'H03', B: 'H08', L: 'H09', W: 'H43' },
    f(x, y, r, a, R) {
      const u = x / R, v = y / R;
      if (Math.hypot(u, v) > 1.02) return '.';
      if (v < 0.2) {
        if (Math.hypot(u, v - 0.2) < 0.38) return 'J';
        return v < -0.45 ? 'P' : v < -0.1 ? 'R' : 'O';
      }
      if (Math.abs(u) < 0.32 - (v - 0.2) * 0.4 && Math.round(v * R) % 2 === 0) return 'W';
      return Math.round(v * R * 0.7 + u * 2) % 3 ? 'B' : 'L';
    },
  },
  {
    theme: 'Saisons', nom: 'Feuille d’érable (automne)', plaques: P_PETITS,
    couleurs: { O: 'H04', M: 'H76' },
    relief: { O: ['H79', 'H22'] },
    grille: [
      '.....O.....',
      '....OOO....',
      '.O..OOO..O.',
      '.OO.OOO.OO.',
      'OOOOOOOOOOO',
      '.OOOOOOOOO.',
      '..OOOOOOO..',
      '.OOOOOOOOO.',
      '.O..OOO..O.',
      '.....M.....',
      '.....M.....',
    ],
  },
  {
    theme: 'Saisons', nom: 'Gland (automne)', plaques: P_PETITS,
    couleurs: { M: 'H76', K: 'H12', O: 'H21' },
    relief: { O: ['H60', 'H20'] },
    grille: [
      '....M....',
      '..MMMMM..',
      '.MKMKMKM.',
      'MMMMMMMMM',
      '.OOOOOOO.',
      '.OOOOOOO.',
      '..OOOOO..',
      '...OOO...',
      '....O....',
    ],
  },
  {
    theme: 'Saisons', nom: 'Bonnet (hiver)', plaques: P_PETITS,
    couleurs: { W: 'H01', R: 'H05' },
    relief: { R: ['H44', 'H22'], W: [null, 'H77'] },
    grille: [
      '....WWW....',
      '....WWW....',
      '...RRRRR...',
      '..RRRRRRR..',
      '.RRWRRRWRR.',
      '.RRRRRRRRR.',
      'WWWWWWWWWWW',
      'WWWWWWWWWWW',
    ],
  },
  {
    theme: 'Saisons', nom: 'Moufle (hiver)', plaques: P_PETITS,
    couleurs: { B: 'H09', W: 'H01' },
    relief: { B: ['H46', 'H08'], W: [null, 'H77'] },
    grille: [
      '...BBBB..',
      '..BBBBBB.',
      'B.BBBBBB.',
      'BBBBBBBB.',
      'BBBWBBBB.',
      '.BBBBBBB.',
      '.BBBBBBB.',
      '.WWWWWWW.',
      '.WWWWWWW.',
    ],
  },
);
