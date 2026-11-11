'use strict';
// Noms des couleurs en français. Les nuanciers (palettes_fusibles.js) portent les noms
// officiels anglais, ceux imprimés sur les sachets : on les garde dans « nomOfficiel » et on
// affiche un nom français dans « nom ». Hama : traduction faite à la main, couleur par couleur.
// Perler / Artkal : traduction mot à mot (les noms inventés, comme « Evergreen », restent tels quels).

const NOMS_HAMA = {
  H01: 'Blanc', H02: 'Crème', H03: 'Jaune', H04: 'Orange', H05: 'Rouge', H06: 'Rose', H07: 'Violet',
  H08: 'Bleu', H09: 'Bleu clair', H10: 'Vert', H11: 'Vert clair', H12: 'Marron',
  H13: 'Rouge transparent', H14: 'Jaune transparent', H15: 'Bleu transparent', H16: 'Vert transparent',
  H17: 'Gris', H18: 'Noir', H19: 'Incolore transparent', H20: 'Brun roux', H21: 'Marron clair', H22: 'Rouge foncé',
  H24: 'Violet translucide', H25: 'Brun translucide', H26: 'Vieux rose mat', H27: 'Beige', H28: 'Vert foncé',
  H29: 'Bordeaux', H30: 'Bordeaux foncé', H31: 'Turquoise', H32: 'Fuchsia fluo', H33: 'Cerise',
  H34: 'Jaune fluo', H35: 'Rouge fluo', H36: 'Bleu fluo', H37: 'Vert fluo', H38: 'Orange fluo',
  H39: 'Jaune fluorescent', H40: 'Orange fluorescent', H41: 'Bleu fluorescent', H42: 'Vert fluorescent',
  H43: 'Jaune pastel', H44: 'Rouge pastel', H45: 'Violet pastel', H46: 'Bleu pastel', H47: 'Vert pastel',
  H48: 'Rose orchidée', H49: 'Azur', H55: 'Phosphorescent vert', H56: 'Phosphorescent rouge', H57: 'Phosphorescent bleu',
  H60: 'Brun ourson', H61: 'Or', H62: 'Argent', H63: 'Bronze', H64: 'Nacré', H70: 'Gris clair', H71: 'Gris foncé',
  H72: 'Rose translucide', H73: 'Aqua translucide', H74: 'Lilas translucide', H75: 'Caramel', H76: 'Nougat',
  H77: 'Blanc nuageux', H78: 'Pêche clair', H79: 'Abricot', H82: 'Prune', H83: 'Bleu pétrole', H84: 'Vert olive',
  H95: 'Rose poudré', H96: 'Lilas pastel', H97: 'Bleu glacier', H98: 'Menthe pastel', H101: 'Eucalyptus',
  H102: 'Vert forêt', H103: 'Jaune clair', H104: 'Citron vert', H105: 'Abricot clair', H106: 'Lavande claire',
  H107: 'Lavande', H108: 'Aubergine', H109: 'Gris nuageux', H110: 'Matcha', H111: 'Rose terre foncé', H112: 'Rose terre',
  H113: 'Aqua', H114: 'Rouge cerise', H115: 'Vert vif', H116: 'Bleu nuit', H117: 'Gris taupe', H118: 'Rouge marron',
  H119: 'Bleu ciel',
};

// traduction mot à mot : couleurs (noms) puis qualificatifs placés après, à la française
const MOTS_COULEUR = {
  white: 'blanc', black: 'noir', red: 'rouge', pink: 'rose', purple: 'violet', violet: 'violet', blue: 'bleu', green: 'vert',
  yellow: 'jaune', orange: 'orange', brown: 'marron', grey: 'gris', gray: 'gris', gold: 'or', silver: 'argent', cream: 'crème',
  beige: 'beige', peach: 'pêche', apricot: 'abricot', lavender: 'lavande', lilac: 'lilas', mint: 'menthe', turquoise: 'turquoise',
  teal: 'bleu canard', navy: 'bleu marine', sky: 'ciel', cherry: 'cerise', raspberry: 'framboise', plum: 'prune', olive: 'olive',
  lime: 'citron vert', rust: 'rouille', tan: 'caramel', sand: 'sable', coral: 'corail', salmon: 'saumon', magenta: 'magenta',
  fuchsia: 'fuchsia', aqua: 'aqua', mustard: 'moutarde', burgundy: 'bordeaux', maroon: 'bordeaux', wine: 'lie-de-vin',
  rose: 'rose', blush: 'rose terre', cocoa: 'cacao', chocolate: 'chocolat', coffee: 'café', caramel: 'caramel', honey: 'miel',
  butterscotch: 'caramel au beurre', marshmallow: 'guimauve', cranberry: 'canneberge', tangerine: 'mandarine',
  cheddar: 'cheddar', kiwi: 'kiwi', shamrock: 'trèfle', evergreen: 'sapin', forest: 'forêt', denim: 'denim', periwinkle: 'pervenche',
  midnight: 'minuit', ocean: 'océan', sea: 'mer', ice: 'glace', snow: 'neige', pearl: 'nacré', bronze: 'bronze', copper: 'cuivre',
  copper_: 'cuivre', clear: 'incolore', flesh: 'chair', skin: 'chair', bubblegum: 'chewing-gum', grape: 'raisin', orchid: 'orchidée',
  mauve: 'mauve', taupe: 'taupe', charcoal: 'anthracite', slate: 'ardoise', khaki: 'kaki', jade: 'jade', emerald: 'émeraude',
  cobalt: 'cobalt', azure: 'azur', cyan: 'cyan', sapphire: 'saphir', ruby: 'rubis', amber: 'ambre', ivory: 'ivoire',
  creme: 'crème', tomato: 'tomate', flamingo: 'flamant rose', fern: 'fougère', mist: 'brume', spice: 'épice', sherbet: 'sorbet',
  lagoon: 'lagon', pewter: 'étain', fawn: 'faon', poppy: 'coquelicot', banana: 'banane', lemon: 'citron', strawberry: 'fraise',
  watermelon: 'pastèque', blueberry: 'myrtille', pistachio: 'pistache', avocado: 'avocat', mango: 'mangue', melon: 'melon',
  lilly: 'lys', lily: 'lys', rosewood: 'bois de rose', sandstone: 'grès', butter: 'beurre', vanilla: 'vanille', cinnamon: 'cannelle',
  pumpkin: 'citrouille', carrot: 'carotte', moss: 'mousse', leaf: 'feuille', grass: 'herbe', smoke: 'fumée',
};
const MOTS_QUALIF = {
  toasted: 'grillé', light: 'clair', dark: 'foncé', pastel: 'pastel', neon: 'fluo', fluorescent: 'fluorescent', transparent: 'transparent',
  translucent: 'translucide', bright: 'vif', pale: 'pâle', deep: 'profond', soft: 'doux', hot: 'vif', matt: 'mat', matte: 'mat',
  glitter: 'pailleté', glow: 'phosphorescent', metallic: 'métallisé', cloudy: 'nuageux', dusty: 'poudré', warm: 'chaud', cool: 'froid',
};
function traduireNom(nom) {
  const mots = String(nom).replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  const noms = [], qualifs = [];
  for (const m of mots) {
    const k = m.toLowerCase();
    if (['in', 'the'].includes(k)) continue;
    if (k === 'dark' && mots.some((x) => x.toLowerCase() === 'glow')) continue;
    if (MOTS_QUALIF[k]) qualifs.push(MOTS_QUALIF[k]);
    else if (MOTS_COULEUR[k]) noms.push(MOTS_COULEUR[k]);
    else return nom; // un mot inconnu : on garde le nom officiel plutôt qu'un mélange
  }
  if (!noms.length) return nom;
  const s = [...noms, ...qualifs].join(' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function nomFrancais(code, nomOfficiel) {
  return NOMS_HAMA[code] || traduireNom(nomOfficiel);
}
// on francise tous les nuanciers au chargement
for (const p of PALETTES_FUSIBLES) for (const c of p.couleurs) {
  if (!c.nomOfficiel) { c.nomOfficiel = c.nom; c.nom = nomFrancais(c.code, c.nom); }
}
// un motif enregistré avant la francisation : on retrouve ses couleurs par référence
function franciserMotif(m) {
  for (const c of m.couleurs || []) {
    if (c.nomOfficiel) continue;
    const ref = PALETTES_FUSIBLES.flatMap((p) => p.couleurs).find((x) => x.code === c.code && x.hex === c.hex);
    if (ref) { c.nomOfficiel = ref.nomOfficiel; c.nom = ref.nom; }
  }
}
