'use strict';
// Modèles pour la plaque Maxi 16 × 16 (grosses perles 10 mm, pour les petits).
// Formes simples et franches, 3 à 5 couleurs, uniquement les 25 couleurs Hama Maxi,
// contour noir quand il aide la lecture. Au plus 14 × 14 perles (passe aussi sur le petit carré Midi).
// Lettres : K noir H18 · W blanc H01 · Y jaune H03 · R rouge H05 · V violet H07 · B bleu H09
// G vert H10 · g gris H17 · M brun roux H20 · P vieux rose H26 · F fuchsia H32 · O orange fluo H38
// J jaune pastel H43 · E rouge pastel H44 · U violet pastel H45 · L bleu pastel H46
// l vert pastel H47 · N rose pastel H48 · T brun ourson H60 · A abricot H79
(function () {
  const PL = ['maxi-carre-grand', 'midi-carre-petit'];
  const M = (theme, nom, couleurs, grille) => MODELES.push({ theme, nom: nom + ' (Maxi)', plaques: PL, couleurs, grille });

  // ---------- Animaux ----------
  const A = 'Animaux';
  M(A, 'Chat', { K: 'H18', T: 'H60', W: 'H01', P: 'H26' }, symetrique([
    'KK.....',
    'KTK....',
    'KPTK...',
    'KTTTKKK',
    'KTTTTTT',
    'KTTTTTT',
    'KTTKTTT',
    'KTTKTTT',
    'KPPTTWK',
    'KTTTWWW',
    '.KTTTTT',
    '..KKKKK',
  ], 13));

  M(A, 'Chien', { K: 'H18', T: 'H60', M: 'H20', W: 'H01', E: 'H44' }, symetrique([
    '...KKKK',
    '.KKTTTT',
    'KMMTTTT',
    'KMMTTTT',
    'KMMTKTT',
    'KMMTKTT',
    'KMMTTWW',
    '.KMTWKK',
    '..KTWWW',
    '...KWWE',
    '....KKE',
    '......K',
  ], 13));

  M(A, 'Lapin', { K: 'H18', W: 'H01', P: 'H26' }, symetrique([
    '..KKK..',
    '.KWPWK.',
    '.KWPWK.',
    '.KWPWK.',
    '.KKWKKK',
    'KWWWWWW',
    'KWWWWWW',
    'KWWKWWW',
    'KWWKWWW',
    'KPPWWWP',
    '.KWWWWW',
    '..KKKKK',
  ], 13));

  M(A, 'Ours', { K: 'H18', M: 'H20', T: 'H60', P: 'H26' }, symetrique([
    '.KKK...',
    'KMTMKKK',
    'KMMMMMM',
    'KMMMMMM',
    'KMMMKMM',
    'KMMMKMM',
    'KMMMTTT',
    'KMPTTKK',
    'KMMMTTK',
    '.KMMMMM',
    '..KKKKK',
  ], 13));

  M(A, 'Poussin', { K: 'H18', Y: 'H03', O: 'H38', P: 'H26' }, symetrique([
    '....KKK',
    '..KKYYY',
    '.KYYYYY',
    '.KYYYYY',
    'KYYKYYY',
    'KYYKYOO',
    'KPYYYYO',
    'KYYYYYY',
    'KYYYYYY',
    '.KYYYYY',
    '..KKKKK',
    '...KOK.',
  ], 13));

  M(A, 'Poisson', { K: 'H18', L: 'H46', B: 'H09', W: 'H01' }, [
    '.....KKK......',
    '...KKBBBKK....',
    '..KLLLLLLLK.KK',
    '.KLWKLLLLLLKBK',
    'KLLKKLLLLLLKBK',
    'KLLLLLLLLLLBBK',
    'KLLLLLLLLLLKBK',
    '.KLLLLLLLLLKBK',
    '..KLLLLLLLK.KK',
    '...KKBBBKK....',
    '.....KKK......',
  ]);

  M(A, 'Coccinelle', { K: 'H18', R: 'H05', W: 'H01' }, symetrique([
    '....KKK',
    '...KWKK',
    '..KKKKK',
    '.KRRRRK',
    'KRRRRRK',
    'KRKKRRK',
    'KRKKRRK',
    'KRRRRRK',
    'KRRKKRK',
    'KRRKKRK',
    '.KRRRRK',
    '..KKKKK',
  ], 13));

  M(A, 'Papillon', { K: 'H18', F: 'H32', Y: 'H03', U: 'H45' }, symetrique([
    '..KK...',
    '...KK..',
    '....KKK',
    '.KKKK.K',
    'KFFFFKK',
    'KFYYFFK',
    'KFYYFFK',
    'KFFFFFK',
    '.KKFFFK',
    '.KUUUUK',
    'KUUYUUK',
    'KUUUUUK',
    '.KKKKKK',
  ], 13));

  M(A, 'Escargot', { K: 'H18', T: 'H60', M: 'H20', J: 'H43' }, [
    '..KKKKK.......',
    '.KTTTTTK......',
    'KTTMMMTTK.....',
    'KTMTTTMTK.K.K.',
    'KTMTMTMTK.K.K.',
    'KTMTMMMTKKKKKK',
    'KTMTTTTTKJKJJK',
    'KTMMMMMTKJJJJK',
    'KKKKKKKKKJJJJK',
    'KJJJJJJJJJJJJK',
    '.KKKKKKKKKKKK.',
  ]);

  M(A, 'Grenouille', { K: 'H18', l: 'H47', W: 'H01', P: 'H26' }, symetrique([
    '.KKKK..',
    'KWWWWK.',
    'KWKKWKK',
    'KWKKWll',
    'Kllllll',
    'Kllllll',
    'KPKllll',
    'KllKKKK',
    'Kllllll',
    '.Klllll',
    '..KKKKK',
  ], 13));

  // ---------- Kawaii ----------
  const K = 'Kawaii';
  M(K, 'Cœur', { K: 'H18', R: 'H05', W: 'H01', E: 'H44' }, symetrique([
    '.KKKK..',
    'KRRRRKK',
    'KRWRRRR',
    'KRWRRRR',
    'KRRRKRR',
    'KREERRK',
    '.KRRRRR',
    '..KRRRR',
    '...KRRR',
    '....KRR',
    '.....KR',
    '......K',
  ], 13));

  M(K, 'Étoile', { K: 'H18', Y: 'H03', E: 'H44' }, symetrique([
    '......K',
    '.....KY',
    '....KYY',
    '....KYY',
    'KKKKKYY',
    'KYYYYYY',
    '.KYYKYY',
    '..KYKYY',
    '..KEYYK',
    '.KYYYYY',
    '.KYYYKK',
    'KYYKK..',
    'KKK....',
  ], 13));

  M(K, 'Diamant', { K: 'H18', W: 'H01', L: 'H46', B: 'H09' }, symetrique([
    '..KKKKK',
    '.KWWLLL',
    'KLLLLLL',
    'KKKKKKK',
    '.KBLLLL',
    '..KBLLL',
    '...KBLL',
    '....KBL',
    '.....KL',
    '......K',
  ], 13));

  M(K, 'Couronne', { K: 'H18', Y: 'H03', R: 'H05', B: 'H09' }, symetrique([
    'KK...KK',
    'KYK.KYY',
    'KYYKYYY',
    'KYYYYYY',
    'KYYYYYY',
    'KYRYYYB',
    'KYYYYYY',
    'KKKKKKK',
  ], 13));

  M(K, 'Ballon', { K: 'H18', R: 'H05', W: 'H01' }, [
    '...KKKKKKK...',
    '..KRRRRRRRK..',
    '.KRWRRRRRRRK.',
    'KRWRRRRRRRRRK',
    'KRWRRRRRRRRRK',
    'KRRRRRRRRRRRK',
    'KRRRRRRRRRRRK',
    '.KRRRRRRRRRK.',
    '..KRRRRRRRK..',
    '...KKRRRKK...',
    '.....KRK.....',
    '.....KKK.....',
    '......KK.....',
    '.......K.....',
  ]);

  M(K, 'Smiley', { K: 'H18', Y: 'H03', E: 'H44' }, symetrique([
    '....KKK',
    '..KKYYY',
    '.KYYYYY',
    '.KYYYYY',
    'KYYKYYY',
    'KYYKYYY',
    'KYYYYYY',
    'KEEYYYY',
    'KYKYYYY',
    '.KYKKKK',
    '.KYYYYY',
    '..KKYYY',
    '....KKK',
  ], 13));

  M(K, 'Note de musique', { K: 'H18', V: 'H07', U: 'H45' }, [
    '...KKKKKKKKK',
    '...KVVVVVVVK',
    '...KVVVVVVVK',
    '...KVKKKKKVK',
    '...KVK...KVK',
    '...KVK...KVK',
    '...KVK...KVK',
    '.KKKVK.KKKVK',
    'KVVVVKKVVVVK',
    'KVUVVKKVUVVK',
    'KVVVVKKVVVVK',
    '.KKKK..KKKK.',
  ]);

  M(K, 'Maison', { K: 'H18', R: 'H05', J: 'H43', L: 'H46', M: 'H20' }, symetrique([
    '......K',
    '.....KR',
    '....KRR',
    '...KRRR',
    '..KRRRR',
    '.KRRRRR',
    'KKKKKKK',
    '.KJJJJJ',
    '.KLLJJJ',
    '.KLLJMM',
    '.KJJJMM',
    '.KJJJMM',
    '.KKKKKK',
  ], 13));

  // ---------- Ciel et météo ----------
  const C = 'Ciel et météo';
  M(C, 'Soleil', { K: 'H18', Y: 'H03', O: 'H38', E: 'H44' }, [
    '......O......',
    '.O...OOO...O.',
    '.OO.KKKKK.OO.',
    '..OKYYYYYKO..',
    '..KYYYYYYYK..',
    '.OKYKYYYKYKO.',
    'OOKYKYYYKYKOO',
    '.OKYYYYYYYKO.',
    '..KYEYKYEYK..',
    '..OKYYYYYKO..',
    '.OO.KKKKK.OO.',
    '.O...OOO...O.',
    '......O......',
  ]);

  M(C, 'Lune', { K: 'H18', J: 'H43', E: 'H44' }, [
    '...KKKKK....',
    '.KKJJJJK....',
    '.KJJJJK.....',
    'KJJJJJK.....',
    'KJJJJJJK....',
    'KJKKJJJK....',
    'KJJJJJJJK...',
    'KJEJJJJJJK..',
    '.KJJJJJJJJKK',
    '.KJJJJJJJJJK',
    '..KKJJJJJKK.',
    '....KKKKK...',
  ]);

  M(C, 'Nuage', { K: 'H18', W: 'H01', L: 'H46', P: 'H26' }, symetrique([
    '.....KK',
    '....KWW',
    '.KKKWWW',
    'KWWWWWW',
    'KWWWWWW',
    'KWWWKWW',
    'KWPWWWK',
    'KWWWWWW',
    '.KLLLLL',
    '..KKKKK',
  ], 13));

  M(C, 'Arc-en-ciel', { R: 'H05', O: 'H38', Y: 'H03', G: 'H10', B: 'H46' }, symetrique([
    '...RRRR',
    '..RROOO',
    '.ROOYYY',
    '.ROYYGG',
    'ROYGGBB',
    'ROYGB..',
    'ROYGB..',
    'ROYGB..',
  ], 13));

  M(C, 'Goutte', { K: 'H18', L: 'H46', W: 'H01', P: 'H26' }, symetrique([
    '......K',
    '.....KL',
    '....KLL',
    '...KLLL',
    '..KWLLL',
    '.KWLLLL',
    '.KWLKLL',
    'KLLLKLL',
    'KLPLLLK',
    'KLLLLLL',
    '.KLLLLL',
    '..KKKKK',
  ], 13));

  // ---------- Plantes et fleurs ----------
  const F = 'Plantes et fleurs';
  M(F, 'Fleur', { K: 'H18', F: 'H32', Y: 'H03', G: 'H10' }, [
    '...KKK.KKK...',
    '..KFFFKFFFK..',
    '.KFFFFFFFFFK.',
    'KKFFFYYYFFFKK',
    'KFFFYYYYYFFFK',
    '.KFFYYYYYFFK.',
    'KFFFYYYYYFFFK',
    'KKFFFYYYFFFKK',
    '.KFFFFFFFFFK.',
    '..KFFFKFFFK..',
    '...KKKGKKK...',
    '.GG...G...GG.',
    '..GGG.G.GGG..',
    '....GGGGG....',
  ]);

  M(F, 'Arbre', { K: 'H18', G: 'H10', R: 'H05', M: 'H20' }, symetrique([
    '...KKKK',
    '.KKGGGG',
    'KGGGGGG',
    'KGGGGGG',
    'KGGRGGG',
    'KGGGGGG',
    'KGGGGRG',
    '.KGGGGG',
    '..KKKMM',
    '....KMM',
    '....KMM',
    '...KMMM',
    '...KKKK',
  ], 13));

  M(F, 'Feuille', { K: 'H18', l: 'H37', G: 'H10' }, [
    '.......KKKKK',
    '.....KKllllK',
    '....KllllGlK',
    '...KllllGllK',
    '..KllllGlllK',
    '..KlllGllllK',
    '.KlllGllllK.',
    '.KllGllllK..',
    '.KlGllllK...',
    '.KGllKKK....',
    'KGKKK.......',
    'KK..........',
  ]);

  M(F, 'Champignon', { K: 'H18', R: 'H05', W: 'H01', P: 'H26' }, symetrique([
    '...KKKK',
    '.KKRRWW',
    'KRRRRWW',
    'KRWWRRR',
    'KRWWRRR',
    'KRRRRRR',
    'KKKKKKK',
    '...KWWW',
    '...KWKW',
    '...KPWW',
    '...KWWW',
    '...KKKK',
  ], 13));

  // ---------- Gourmandises ----------
  const G = 'Gourmandises';
  M(G, 'Pomme', { K: 'H18', R: 'H05', W: 'H01', G: 'H10', M: 'H20' }, [
    '......KKKK...',
    '.....KMKGGGK.',
    '..KKKKMKKKK..',
    '.KRRRRMRRRRK.',
    'KRWRRRRRRRRRK',
    'KRWRRRRRRRRRK',
    'KRRRRRRRRRRRK',
    'KRRRRRRRRRRRK',
    'KRRRRRRRRRRRK',
    '.KRRRRRRRRRK.',
    '.KRRRRRRRRRK.',
    '..KRRRKRRRK..',
    '...KKK.KKK...',
  ]);

  M(G, 'Fraise', { K: 'H18', R: 'H05', Y: 'H43', G: 'H10' }, [
    '.....KKK.....',
    '..KKKKGKKKK..',
    '.KGGGGGGGGGK.',
    'KRGGRGGGRGGRK',
    'KRYRRRYRRRYRK',
    'KRRRYRRRYRRRK',
    '.KYRRRYRRRYK.',
    '.KRRYRRRYRRK.',
    '..KRRRYRRRK..',
    '...KYRRRYK...',
    '....KRRRK....',
    '.....KKK.....',
  ]);

  M(G, 'Glace', { K: 'H18', R: 'H05', N: 'H48', W: 'H01', T: 'H60' }, symetrique([
    '.....KK',
    '....KRR',
    '..KKKKK',
    '.KNNNNN',
    'KNWNNNN',
    'KNNNNNN',
    'KNNNKNN',
    'KNNNNNN',
    'KKKKKKK',
    '.KTTTTT',
    '..KTTTT',
    '...KTTT',
    '....KTT',
    '.....KK',
  ], 13));

  M(G, 'Sucette', { K: 'H18', F: 'H32', W: 'H01', g: 'H70' }, [
    '...KKKKKKK...',
    '.KKFFFFFFFKK.',
    '.KFFWWWWWFFK.',
    'KFFWWFFFWWFFK',
    'KFWWFFWFFWWFK',
    'KFWFFWWWFFWFK',
    'KFWWFFWFFWWFK',
    'KFFWWFFFWWFFK',
    '.KFFWWWWWFFK.',
    '.KKFFFFFFFKK.',
    '...KKKgKKK...',
    '.....KgK.....',
    '.....KgK.....',
    '.....KKK.....',
  ]);

  M(G, 'Cupcake', { K: 'H18', R: 'H05', N: 'H48', L: 'H46', B: 'H09' }, symetrique([
    '.....KK',
    '....KRR',
    '..KKKKK',
    '.KNNNNN',
    'KNNNNNN',
    'KNNNNNN',
    'KNNNNNN',
    'KKKKKKK',
    '.KLBLBL',
    '.KLBLBL',
    '..KBLBL',
    '..KBLBL',
    '..KKKKK',
  ], 13));

  // ---------- Véhicules ----------
  const V = 'Véhicules';
  M(V, 'Voiture', { K: 'H18', R: 'H05', L: 'H46', g: 'H17', Y: 'H03' }, [
    '....KKKKKK....',
    '...KLLKLLLK...',
    '..KLLLKLLLLK..',
    '.KRRRRRRRRRRK.',
    'KRRRRRRRRRRRYK',
    'KRRRRRRRRRRRRK',
    'KRKKKKRRKKKKRK',
    'KKKggKKKKggKKK',
    '..KggK..KggK..',
    '..KKKK..KKKK..',
  ]);

  M(V, 'Bateau', { K: 'H18', R: 'H05', W: 'H01', B: 'H09' }, [
    '......KKK....',
    '......KRRK...',
    '......KKKK...',
    '......KWK....',
    '.....KKWWK...',
    '....KWKWWWK..',
    '...KWWKWWWWK.',
    '..KWWWKWWWWWK',
    'KKKKKKKKKKKKK',
    'KBBBBBBBBBBBK',
    '.KBBBBBBBBBK.',
    '..KKKKKKKKK..',
  ]);

  M(V, 'Fusée', { K: 'H18', W: 'H01', R: 'H05', L: 'H46', O: 'H38' }, symetrique([
    '......K',
    '.....KR',
    '....KRR',
    '....KWW',
    '...KWWW',
    '...KWLL',
    '...KWLL',
    '...KWWW',
    '...KWWW',
    '.KRKWWW',
    'KRRKWWW',
    'KRRKKKK',
    'KKK.OOO',
    '.....OO',
  ], 13));

  // ---------- Halloween ----------
  const H = 'Halloween';
  M(H, 'Citrouille', { K: 'H18', O: 'H38', G: 'H10' }, symetrique([
    '.....KK',
    '.....KG',
    '.KKKKKG',
    'KOOOOOO',
    'KOOOOOO',
    'KOOOKOO',
    'KOOOKOO',
    'KOOOOOO',
    'KOKOOOO',
    'KOOKKKK',
    '.KOOOOO',
    '..KKKKK',
  ], 13));

  M(H, 'Fantôme', { K: 'H18', W: 'H01', P: 'H26' }, symetrique([
    '...KKKK',
    '..KWWWW',
    '.KWWWWW',
    'KWWWWWW',
    'KWWWKWW',
    'KWWWKWW',
    'KWPWWWK',
    'KWWWWWW',
    'KWWWWWW',
    'KWWWWWW',
    'KWWKWWW',
    'KKK.KKK',
  ], 13));

  // ---------- Noël ----------
  M('Noël', 'Sapin', { K: 'H18', Y: 'H03', G: 'H10', R: 'H05', M: 'H20' }, symetrique([
    '.....KK',
    '....KYY',
    '.....KY',
    '.....KG',
    '....KGG',
    '...KGGG',
    '..KGGRG',
    '..KKGGG',
    '..KGGGG',
    '.KGRGGG',
    'KGGGGRG',
    'KKKKKMM',
    '....KMM',
    '....KKK',
  ], 13));

  M('Noël', 'Bonhomme de neige', { K: 'H18', W: 'H01', R: 'H05', O: 'H38' }, symetrique([
    '....KKK',
    '....KKK',
    '..KKKKK',
    '...KWWW',
    '...KWKW',
    '...KWWO',
    '...KWWW',
    '..KRRRR',
    '.KWWWWW',
    'KWWWWWK',
    'KWWWWWW',
    'KWWWWWK',
    '.KWWWWW',
    '..KKKKK',
  ], 13));

  // ---------- Pâques ----------
  M('Pâques', 'Œuf de Pâques', { K: 'H18', L: 'H46', Y: 'H43', N: 'H48' }, symetrique([
    '...KKK',
    '..KLLL',
    '.KLLLL',
    '.KYYYY',
    'KLLLLL',
    'KNNNNN',
    'KNYNNY',
    'KNNNNN',
    'KLLLLL',
    'KYYYYY',
    '.KLLLL',
    '.KLLLL',
    '..KLLL',
    '...KKK',
  ], 11));
})();
