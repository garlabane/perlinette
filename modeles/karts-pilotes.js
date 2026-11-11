'use strict';
// Kit « Course de karts » — les pilotes : huit animaux sur un même châssis de kart.
// Tous ORIGINAUX : nos animaux kawaii (même esprit que modeles/grand-animaux.js et moutons.js)
// au volant d'un kart dessiné ici.
// UN SEUL CHÂSSIS commun (vu de profil, tourné vers la droite) : mêmes roues au même endroit,
// même taille ; seules changent la couleur de carrosserie (C base, c clair, d foncé) et le numéro.
// Chaque pilote est une grille entière dessinée perle par perle, posée par-dessus le châssis
// (les `.` du pilote laissent voir le kart).
(function () {
  const PL = ['midi-carre-grand'];
  const T = 'Course de karts';
  const L = 27;            // largeur commune (hauteur : 23, 24 pour le lapin et ses oreilles)

  // Châssis : 12 rangées, posé en bas, roues comprises (arrière colonnes 2-8, avant 18-24,
  // posées sur la dernière rangée). K contour et pneus, C/c/d carrosserie (base, clair, foncé),
  // # emplacement du numéro (chiffre n peint sur la carrosserie), G gris (jante, volant, pare-chocs),
  // g gris clair (moyeu, pot d'échappement). Lettres RÉSERVÉES au châssis : K C c d n G g
  // (un pilote ne doit pas les redéfinir, sinon il recolore le kart).
  const CHASSIS = [
    '...................KKK.....',
    '...................KGK.....',
    '....................KGK....',
    '..KKKKKKKKKKKKKKKKKKKKGKK..',
    'KKKcccccccc#####cccccccccK.',
    'ggKCKKKCCCC#####CCCCKKKCCdK',
    'KKKKKKKKCCC#####CCCKKKKKCdK',
    '..KKGGGKKCC#####CCKKGGGKKGK',
    '..KKGgGKKCC#####CCKKGgGKKGK',
    '..KKGGGKKddddddddKKKGGGKKK.',
    '...KKKKKKKKKKKKKKKKKKKKK...',
    '....KKK.............KKK....',
  ];
  const CHIFFRES = {
    1: ['.K.', 'KK.', '.K.', '.K.', 'KKK'],
    2: ['KK.', '..K', '.K.', 'K..', 'KKK'],
    3: ['KK.', '..K', '.K.', '..K', 'KK.'],
    4: ['K.K', 'K.K', 'KKK', '..K', '..K'],
    5: ['KKK', 'K..', 'KK.', '..K', 'KK.'],
    6: ['.KK', 'K..', 'KK.', 'K.K', '.K.'],
    7: ['KKK', '..K', '.K.', '.K.', '.K.'],
    8: ['.K.', 'K.K', '.K.', 'K.K', '.K.'],
  };

  // Assemble le châssis (avec le numéro n, ou sans numéro) puis pose le pilote par-dessus.
  function kart(pilote, n) {
    const H = (pilote ? pilote.length : 3) + 9, g = [];
    for (let y = 0; y < H; y++) g.push(Array(L).fill('.'));
    const y0 = H - CHASSIS.length;
    CHASSIS.forEach((r, y) => [...r].forEach((ch, x) => {
      if (ch === '#') {                                   // numéro : rangées 4-8, colonnes 12-14
        const ci = CHIFFRES[n], py = y - 4, px = x - 11;
        ch = ci && px >= 1 && px <= 3 && ci[py][px - 1] === 'K' ? 'n' : (py === 0 ? 'c' : 'C');
      }
      if (ch !== '.') g[y0 + y][x] = ch;
    }));
    (pilote || []).forEach((r, y) => [...r].forEach((c, x) => { if (c !== '.') g[y][x] = c; }));
    const lignes = g.map((r) => r.join(''));
    while (/^\.+$/.test(lignes[0])) lignes.shift();   // kart vide : pas de rangées vides en haut
    return lignes;
  }
  // n = couleur du numéro (blanc par défaut, foncé sur les karts clairs)
  const carrosserie = (C, c, d, n = 'H01') => ({ K: 'H18', C, c, d, n, G: 'H17', g: 'H70' });

  // Écharpe au vent (E base, e foncé, h clair) : nouée au cou, elle flotte vers l'arrière (à gauche).
  MODELES.push(
    {
      theme: T, nom: 'Renard pilote', plaques: PL,
      // lunettes de course sur le front, museau blanc, oreilles à pointe brune ; écharpe verte
      couleurs: Object.assign(carrosserie('H04', 'H79', 'H20'),
        { O: 'H04', o: 'H79', D: 'H20', M: 'H01', W: 'H01', S: 'H12', L: 'H46', P: 'H95', E: 'H10', e: 'H102', h: 'H47' }),
      grille: kart([
        '......KK..........KK.......',
        '.....KDOK........KODK......',
        '.....KDOOKKKKKKKKOODK......',
        '.....KOoOKKKKOOKKKKDK......',
        '.....KSSKLLKKKKLLKSSK......',
        '.....KoOKKKKOOKKKKODK......',
        '.....KOOOOOOOOOOOOODK......',
        '.....KOOKWOOOOOOKWODK......',
        '.....KOOKKOOOOOOKKODK......',
        '.....KOPPMMMKKMMMPPDK......',
        'KK....KMMMMMMMMMMMMK.......',
        'KhKKKKKEEEEEEEEEEEEK.......',
        'KEEhEEEKOOMMMMOOODK........',
        '.KKKeEKKOOMMMOOOOOO........',
      ], 1),
    },
    {
      theme: T, nom: 'Panda pilote', plaques: PL,
      // casque vert à bande blanche, oreilles noires qui dépassent, taches autour des yeux ; écharpe rouge
      couleurs: Object.assign(carrosserie('H10', 'H47', 'H102'),
        { V: 'H10', v: 'H47', x: 'H102', B: 'H01', W: 'H01', b: 'H77', N: 'H71', P: 'H95', E: 'H05', e: 'H22', h: 'H44' }),
      grille: kart([
        '.....KKK..KKKKKK..KKK......',
        '.....KKKKKvvBBVVKKKKK......',
        '.....KvvVVVVBBVVVVVxK......',
        '.....KvVVVVVBBVVVVVxK......',
        '.....KxxxxxxxxxxxxxxK......',
        '.....KBNNNNBBBBNNNNbK......',
        '.....KBNKWNBBBBNKWNbK......',
        '.....KBNKKNBBBBNKKNbK......',
        '.....KBPPBBBKKBBBPPbK......',
        '.....KBBBBBBBBBBBBbbK......',
        'KK....KbBBBBBBBBBbbK.......',
        'KhKKKKKEEEEEEEEEEEEK.......',
        'KEEhEEEKNNBBBBBNNNK........',
        '.KKKeEKKNNBBBBNNNNN........',
      ], 2),
    },
    {
      theme: T, nom: 'Mouton pilote', plaques: PL,
      // petit casque bleu ciel d'où la laine bouclée déborde de partout (dessus, front, joues),
      // oreilles en ailes, frimousse beige, sourire ; écharpe jaune
      couleurs: Object.assign(carrosserie('H46', 'H97', 'H09', 'H01'),
        { S: 'H46', s: 'H97', z: 'H09', W: 'H01', N: 'H64', w: 'H77', F: 'H27', f: 'H75', M: 'H76', o: 'H78', P: 'H95',
          E: 'H03', e: 'H60', h: 'H103' }),
      grille: kart([
        '.........KKKKKKKK..........',
        '....KKK.KsSSWWSSzK.KKK.....',
        '...KWWNKsSSSWWSSSzKWNwK....',
        '..KWNNwKzzzzzzzzzzKwNNwK...',
        '..KNwWNWWNwWWNwWWNWNwNNK...',
        '..KWwNNFFFFFFFFFFFFNNwwK...',
        '.KMMMWNFKWFFFFFFKWFNWMMMK..',
        '.KMMoWNFKKFFFFFFKKFNWoMMK..',
        '..KKKWNPPFFFMMFFFPPNWKKK...',
        '...KwWNFFFFKFFKFFFfNwWK....',
        'KK..KwNwffffKKffffwNwK.....',
        'KhKKKKKEEEEEEEEEEEEKK......',
        'KEEhEEEKWNNwNNwNNwK........',
        '.KKKeEKKNwNNwNNwNNMM.......',
      ], 3),
    },
    {
      theme: T, nom: 'Pingouin pilote', plaques: PL,
      // tête sombre, lunettes de course à sangle bleue, masque blanc en cœur, bec orange ; écharpe rouge
      couleurs: Object.assign(carrosserie('H01', 'H09', 'H77', 'H08'),
        { N: 'H71', l: 'H17', S: 'H08', L: 'H46', W: 'H01', w: 'H77', O: 'H04', o: 'H21', P: 'H95',
          E: 'H05', e: 'H22', h: 'H44' }),
      grille: kart([
        '........KKKKKKKKKK.........',
        '......KKllNNNNNNNNKK.......',
        '.....KlNNNNNNNNNNNNNK......',
        '.....KNNKKKKNNKKKKNNK......',
        '.....KSSKLLKKKKLLKSSK......',
        '.....KNNKKKKNNKKKKNNK......',
        '.....KNWWWWNNNNWWWWNK......',
        '.....KNWKKWWNNWWKKWNK......',
        '.....KNPPWWOOOOWWPPNK......',
        '.....KNNWWWWooWWWWNNK......',
        'KK....KNNNwwwwwwNNNK.......',
        'KhKKKKKEEEEEEEEEEEEK.......',
        'KEEhEEEKNNWWWWWNNNK........',
        '.KKKeEKKNNWWWWNNNNN........',
      ], 4),
    },
    {
      theme: T, nom: 'Lionceau pilote', plaques: PL,
      // grosse crinière, lunettes de course sur le front, museau crème ; écharpe bleue
      couleurs: Object.assign(carrosserie('H03', 'H103', 'H60', 'H18'),
        { M: 'H20', m: 'H21', F: 'H60', U: 'H02', S: 'H12', L: 'H46', P: 'H95', W: 'H01',
          E: 'H09', e: 'H08', h: 'H46' }),
      grille: kart([
        '........KKKKKKKKKK.........',
        '......KKmmMMMMMMMMKK.......',
        '.....KmmMMMMMMMMMMMMK......',
        '....KMmFKKKKFFKKKKFMMK.....',
        '....KmMSKLLKKKKLLKSMMK.....',
        '....KMMFKKKKFFKKKKFMMK.....',
        '....KMMFKWFFFFFFKWFMMK.....',
        '....KMMFKKFFFFFFKKFMMK.....',
        '....KMMPPFUUKKUUFPPMMK.....',
        '.....KMMFFUUUUUUFFMMK......',
        'KK....KMMFFFFFFFFMMK.......',
        'KhKKKKKEEEEEEEEEEEEK.......',
        'KEEhEEEKFFUUUUFFFMK........',
        '.KKKeEKKFFUUUFFFFFF........',
      ], 5),
    },
    {
      theme: T, nom: 'Grenouille pilote', plaques: PL,
      // les lunettes de course sur ses gros yeux, grand sourire ; écharpe jaune
      couleurs: Object.assign(carrosserie('H07', 'H45', 'H82'),
        { V: 'H47', v: 'H98', x: 'H10', Y: 'H103', L: 'H46', W: 'H01', P: 'H95', E: 'H03', e: 'H60', h: 'H103' }),
      grille: kart([
        '......KKKK......KKKK.......',
        '.....KLLLLK....KLLLLK......',
        '.....KLKWLKKKKKKLKWLK......',
        '.....KLKKLKvVVVKLKKLK......',
        '....KVKLLKVVVVVVKLLKVK.....',
        '....KvVKKVVVVVVVVKKVxK.....',
        '....KVVVVVVVVVVVVVVVxK.....',
        '....KVPPVKVVVVVVKVPPxK.....',
        '....KVVVVVKKKKKKVVVVxK.....',
        '.....KVVVVVVVVVVVVVxK......',
        'KK....KVVVVVVVVVVxxK.......',
        'KhKKKKKEEEEEEEEEEEEK.......',
        'KEEhEEEKVVYYYYVVVxK........',
        '.KKKeEKKVVYYYVVVVVV........',
      ], 6),
    },
    {
      theme: T, nom: 'Lapin pilote', plaques: PL,
      // casque turquoise percé pour les grandes oreilles ; écharpe lilas
      couleurs: Object.assign(carrosserie('H06', 'H78', 'H33'),
        { T: 'H31', t: 'H46', x: 'H83', W: 'H01', w: 'H77', R: 'H06', P: 'H95', E: 'H45', e: 'H07', h: 'H96' }),
      grille: kart([
        '........KK......KK.........',
        '.......KWRK....KRWK........',
        '.......KWRK....KRWK........',
        '......KKWRKKKKKKRWKK.......',
        '.....KtKWRKTTTTKRWKxK......',
        '.....KtTTTTTTTTTTTTxK......',
        '.....KxxxxxxxxxxxxxxK......',
        '.....KWWWWWWWWWWWWWwK......',
        '.....KWWKKWWWWWWKKWwK......',
        '.....KWWKKWWWWWWKKWwK......',
        '.....KWRRWWWPPWWWRRwK......',
        'KK....KWWWWWWWWWWwwK.......',
        'KhKKKKKEEEEEEEEEEEEK.......',
        'KEEhEEEKWWWWWWWWwwK........',
        '.KKKeEKKWWWWWWWwwww........',
      ], 7),
    },
    {
      theme: T, nom: 'Ours pilote', plaques: PL,
      // casque jaune à bande rouge, oreilles rondes, museau beige ; écharpe turquoise
      couleurs: Object.assign(carrosserie('H05', 'H44', 'H22'),
        { M: 'H76', m: 'H12', U: 'H27', Y: 'H03', y: 'H103', z: 'H60', R: 'H05', P: 'H95', W: 'H01',
          E: 'H31', e: 'H83', h: 'H46' }),
      grille: kart([
        '.....KKK..KKKKKK..KKK......',
        '.....KmMKKyyYYYYKKMmK......',
        '.....KyyYYYYRRYYYYYzK......',
        '.....KyYYYYYRRYYYYYzK......',
        '.....KzzzzzzzzzzzzzzK......',
        '.....KMMMMMMMMMMMMMmK......',
        '.....KMMKWMMMMMMKWMmK......',
        '.....KMMKKMMMMMMKKMmK......',
        '.....KMPPMUUKKUUMPPmK......',
        '.....KMMMMUUUUUUMMmmK......',
        'KK....KMMMMMMMMMMmmK.......',
        'KhKKKKKEEEEEEEEEEEEK.......',
        'KEEhEEEKMMUUUUMMMmK........',
        '.KKKeEKKMMUUUMMMMMM........',
      ], 8),
    },
    {
      theme: T, nom: 'Kart vide au départ', plaques: PL,
      couleurs: carrosserie('H70', 'H77', 'H17'),
      grille: kart(null, null),
    },
    {
      theme: T, nom: 'Traînée de vitesse', plaques: ['midi-carre-petit'],
      // lignes de vent à poser derrière un kart (le vent part vers la gauche)
      couleurs: { K: 'H18', W: 'H01', w: 'H77', b: 'H46' },
      grille: [
        '......KKKKKK.',
        '.....KbbWWWWK',
        '.KKKKKKKKKKKK',
        'KbbbWWWWWWWwK',
        '.KKKKKKKKKKKK',
        '....KbbWWWwK.',
        '..KKKKKKKKKK.',
        '.KbbbWWWWWwK.',
        '..KKKKKKKKK..',
      ],
    },
  );
})();
