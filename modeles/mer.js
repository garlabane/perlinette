'use strict';
// Thème Mer et océan — 10 modèles originaux. Étoile de mer et bouée en « recettes ».

MODELES.push(
  {
    theme: 'Mer et océan', nom: 'Poisson tropical', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', o: 'H105', O: 'H79', D: 'H04', W: 'H01', w: 'H77', P: 'H06' },
    grille: [
      '...KKKKK.....',
      '..KoKWKDK....',
      '.KoOKWKODK.KK',
      'KoOOKWKOODKDK',
      'KOKOKWKOOOODK',
      'KOOOKWKOOOODK',
      'KKPOKWKOOODDK',
      'KOOOKWKOODKDK',
      '.KOOKWKODK.KK',
      '..KOKwKDK....',
      '...KKKKK.....',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Baleine', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', W: 'H46', w: 'H01', B: 'H46', D: 'H09', C: 'H01', c: 'H77', P: 'H06' },
    grille: [
      '..K.K........',
      '.KWKwK.......',
      '.KWWWK.......',
      '..KWKKK...KK.',
      '.KBBBBDK.KBDK',
      'KBBBBBBDKKBDK',
      'KBBKBBBBBKDK.',
      'KBPBKBBBBBDK.',
      'KBBBBBBBBDK..',
      'KCCCCCCCDK...',
      '.KCcccccK....',
      '..KKKKKK.....',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Pieuvre', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', p: 'H78', P: 'H06', Q: 'H95', J: 'H33', s: 'H01' },
    grille: [
      '....KKKKK....',
      '..KKpPPPQKK..',
      '.KppPPPPPPQK.',
      '.KpPPPPPPPQK.',
      'KpPPKPPPKPPQK',
      'KPPJPPKPPJPQK',
      'KPPPPPPPPPPQK',
      'KPPPPPPPPPPQK',
      'KPPKPPKPPKPQK',
      'KsPKPsKPsKPsK',
      'KPPKPPKPPKPQK',
      'KPQKPQKPQKPQK',
      '.KK.KK.KK.KK.',
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
    theme: 'Mer et océan', nom: 'Coquillage', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', P: 'H78', R: 'H79', p: 'H105', r: 'H04', J: 'H06' },
    grille: [
      '...K.K.K.K...',
      '..KrKrKrKrK..',
      '.KPRPRPRPRpK.',
      'KRPRKRPRKRPrK',
      'KRJRPRKRPRJrK',
      'KRPRPRPRPRPrK',
      '.KPRPRPRPRpK.',
      '..KRPRPRPrK..',
      '...KPRPRpK...',
      '...KKRPRKK...',
      '..KPppppppK..',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Crabe', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H44', R: 'H33', r: 'H05', P: 'H06' },
    grille: [
      '.KKK.....KKK.',
      'KlRrK...KRRrK',
      'KRKK.....KKrK',
      'KRRrK...KRRrK',
      '.KrK.....KrK.',
      '.KRKKKKKKKrK.',
      '.KRlRRRRRRrK.',
      'KKRRKRRRKRRKK',
      '.KRPRRKRRPrK.',
      'KKrRRRRRRRrKK',
      '.KKRrrrrrrKK.',
      '...KKKKKKK...',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Méduse', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', l: 'H01', L: 'H96', M: 'H107', J: 'H06', T: 'H45', t: 'H07' },
    grille: [
      '....KKKKK....',
      '..KKlLLLMKK..',
      '.KlLLLLLLLMK.',
      '.KLLLKLKLLMK.',
      'KlLLJLLLLJLMK',
      'KLLLLLKLLLLMK',
      'KLLLLLLLLLLMK',
      '.KTTKTTKTTKK.',
      '.KTTKTTKTtK..',
      '..KTTKTTKTtK.',
      '..KTtKTtKTtK.',
      '.KTtKTtKTtK..',
      '..KK.KK.KK...',
    ],
  },
  {
    theme: 'Mer et océan', nom: 'Ancre', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', a: 'H01', A: 'H70', D: 'H17' },
    grille: [
      '....KKKK....',
      '...KaAADK...',
      '...KAKKDK...',
      '...KAAADK...',
      '.KKKKAAKKKK.',
      'KaDDAAAADDDK',
      '.KKKKAAKKKK.',
      'K...KADK...K',
      'KDK.KADK.KDK',
      'KADKKAAKKADK',
      '.KADAAAADDK.',
      '..KKADDDKK..',
      '....KKKK....',
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
    theme: 'Mer et océan', nom: 'Phare', plaques: ['midi-carre-petit'],
    couleurs: { K: 'H18', R: 'H05', r: 'H22', W: 'H01', w: 'H77', J: 'H103', j: 'H03', G: 'H17', g: 'H71' },
    grille: [
      '....KKK....',
      '...KRRrK...',
      '..KRRRRrK..',
      '..KJKJKjK..',
      '.KGGGGGGgK.',
      '..KKWWWKK..',
      '...KRRrK...',
      '..KWWWWwK..',
      '..KRRKRrK..',
      '..KWWWWwK..',
      '.KRRRKRRrK.',
      '.KRrrKrrrK.',
      '.KKKKKKKKK.',
    ],
  },
);
