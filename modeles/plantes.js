'use strict';
// Thème Plantes et fleurs — 10 modèles originaux.
// Grilles (≤ 13 de large) pour les carrés ; tournesol et fleur à 6 pétales en « recettes »
// pour les ronds et les hexagones (f reçoit R = rayon utile de la plaque).

const fleurRond = (x, y, R) => [x / R, y / R, Math.hypot(x, y) / R];

MODELES.push(
  {
    theme: 'Plantes et fleurs', nom: 'Cactus en pot', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', P: 'H06', J: 'H03', l: 'H101', V: 'H115', D: 'H102', o: 'H79', T: 'H04', R: 'H20' },
    grille: [
      '.....KKK.....',
      '....KPJPK....',
      '.KK.KVlDK.KK.',
      'KVDKKVVDKKVDK',
      'KVlKKVlDKKVDK',
      'KDDDDVVVDDDDK',
      '.KKKKVlDKKKK.',
      '....KDDDK....',
      '.KKKKKKKKKKK.',
      '.KooooTTTTRK.',
      '.KKTTTTTTRKK.',
      '..KRRRRRRRK..',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Plante en pot', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', V: 'H47', D: 'H10', P: 'H26', p: 'H112', W: 'H01', w: 'H77' },
    grille: [
      '.....KKK.....',
      '.KK.KVVDK.KK.',
      'KVDKKVVDKKVDK',
      'KVVDKVVDKVVDK',
      'KDVDKVVDKVVDK',
      '.KDDVKDKVDDK.',
      '..KKDDKDDKK..',
      '.KKKKKKKKKKK.',
      '.KPPPPPPPPpK.',
      '.KwWWWWWWWwK.',
      '..KWWWWWWwK..',
      '..KwwwwwwwK..',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Rose', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H44', R: 'H05', D: 'H22', S: 'H30', V: 'H37', v: 'H10' },
    grille: [
      '...KKKKKKK...',
      '..KlRRSSRDK..',
      '.KlRSRRRSRDK.',
      '.KRSRSSRSRDK.',
      '.KRSRRSRSRDK.',
      '.KDRSSSSRRDK.',
      '..KDDDRRDDK..',
      '..KKKKVvKKK..',
      '.KK..KVvK....',
      'KVvK.KVvK.KK.',
      'KvVvKKVvKKVvK',
      '.KvvvvvvvvvK.',
      '..KKKKKKKKK..',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Feuille', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', V: 'H37', D: 'H10', N: 'H47' },
    grille: [
      '.......KKKKK.',
      '.....KKVVVNK.',
      '....KVVVVNDK.',
      '...KVVVVNVDK.',
      '..KVVVVNVVDK.',
      '..KVVVNVVVDK.',
      '.KVVVNVVVDK..',
      '.KVVNVVVDK...',
      '.KVNVVDDK....',
      '.KNDDDKK.....',
      '.KNKKK.......',
      'KNK..........',
      'KK...........',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Champignon', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H44', R: 'H05', D: 'H22', W: 'H01', w: 'H77', C: 'H02', c: 'H27', P: 'H06' },
    grille: [
      '....KKKKK....',
      '..KKlRRRRDKK.',
      '.KlWWRRRRWDK.',
      'KRRWWRRRRWWDK',
      'KDDDDDwDDDDDK',
      'KKKKKKKKKKKKK',
      '...KCCCCcK...',
      '..KCKCCCKcK..',
      '..KPCCKCCPK..',
      '..KcCCCCCcK..',
      '...KcccccK...',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Arbre', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H47', V: 'H37', D: 'H10', R: 'H05', M: 'H21', m: 'H76' },
    grille: [
      '....KKKKK....',
      '..KKlVVVDKK..',
      '.KllVVVVVVDK.',
      'KlVVVVVVVRVDK',
      'KVVRVVVVVVVDK',
      'KDVVVVVVVVVDK',
      '.KDDVVVVVRDK.',
      '..KKDVVVDKK..',
      '...KKMMmKK...',
      '....KMMmK....',
      '....KMMmK....',
      '...KmmmmmK...',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Trèfle à quatre feuilles', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H47', V: 'H37', D: 'H10' },
    grille: [
      '.KK.KK.KK.KK.',
      'KlDKVDKVDKVDK',
      'KVVVVDKVVVVDK',
      'KDVVVDKVVVVDK',
      '.KDDDDKDDDDK.',
      '..KKKKKKKKK..',
      '.KVVVDKVVVDK.',
      'KVVVVDKVVVVDK',
      'KVVDVDKVVDVDK',
      'KDDKDDKDDKDDK',
      '.KK.KKDKK.KK.',
      '.....KKDK....',
      '......KKK....',
    ],
  },
  {
    theme: 'Plantes et fleurs', nom: 'Lavande', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H106', L: 'H45', D: 'H07', V: 'H115', v: 'H102', R: 'H95', r: 'H112' },
    grille: [
      '.....KKK.....',
      '....KlLDK....',
      '..KKKLLDKKK..',
      '.KlDKlLDKLDK.',
      '.KLDKLLDKLDK.',
      '.KlDKlLDKLDK.',
      '.KDDKDLDKLDK.',
      '.KKvKKvKKvKK.',
      '...KvKvKvK...',
      '..KrrRRRrrK..',
      '...KKVVvKK...',
      '....KvvvK....',
      '....KKKKK....',
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
