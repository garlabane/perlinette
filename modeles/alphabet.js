'use strict';
// Alphabet, chiffres et signes — police 5 × 7 agrandie 2 fois (traits de 2 perles), contour
// noir d'une perle, relief 3 tons. Toutes les lettres ont la même largeur (12) et le même
// corps (16 de haut) ; les accents ajoutent des rangs au-dessus (la cédille, en dessous),
// séparés de la lettre par une rangée de contour : ils se soudent avec elle.
// + « Écrire une phrase » : mise en page sur le moins de plaques possible.

const POLICE = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '10001', '11001', '10101', '10011', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '!': ['00100', '00100', '00100', '00100', '00100', '00000', '00100'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
  '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
  "'": ['00110', '00110', '00100', '00000', '00000', '00000', '00000'],
  '♥': ['01010', '11111', '11111', '11111', '01110', '00100', '00000'],
};
// accents : perles (rang, colonne) du corps de l'accent, en coordonnées « perles » de la lettre
// (corps de la lettre : rangs 0–13, colonnes 0–9). Une rangée vide les sépare de la lettre :
// elle devient du contour et soude l'accent à la lettre.
const FORMES_ACCENT = {
  aigu: [[-3, 6], [-3, 7], [-2, 5], [-2, 6]],
  grave: [[-3, 2], [-3, 3], [-2, 3], [-2, 4]],
  circonflexe: [[-3, 4], [-3, 5], [-2, 2], [-2, 3], [-2, 6], [-2, 7]],
  trema: [[-3, 2], [-3, 3], [-2, 2], [-2, 3], [-3, 6], [-3, 7], [-2, 6], [-2, 7]],
  cedille: [[15, 4], [15, 5], [16, 3], [16, 4]],
};
const ACCENTUEES = {
  É: ['E', 'aigu'], È: ['E', 'grave'], Ê: ['E', 'circonflexe'], Ë: ['E', 'trema'],
  À: ['A', 'grave'], Â: ['A', 'circonflexe'], Ä: ['A', 'trema'],
  Î: ['I', 'circonflexe'], Ï: ['I', 'trema'], Ô: ['O', 'circonflexe'], Ö: ['O', 'trema'],
  Ù: ['U', 'grave'], Û: ['U', 'circonflexe'], Ü: ['U', 'trema'], Ç: ['C', 'cedille'],
};
const EQUIVALENTS = { '’': "'", '❤': '♥', '♡': '♥', '—': '-', '–': '-', Œ: 'OE', Æ: 'AE' };

// Familles de couleurs pour les lettres : base, ton clair (lumière), ton foncé (ombre).
// Références Hama Midi. Le relief garde ces trois tons ensemble quand on change de couleur.
const FAMILLES = [
  { id: 'rouge', nom: 'Rouge', base: 'H05', clair: 'H44', fonce: 'H22' },
  { id: 'orange', nom: 'Orange', base: 'H04', clair: 'H79', fonce: 'H20' },
  { id: 'jaune', nom: 'Jaune', base: 'H03', clair: 'H103', fonce: 'H60' },
  { id: 'vert', nom: 'Vert', base: 'H10', clair: 'H47', fonce: 'H28' },
  { id: 'bleu', nom: 'Bleu', base: 'H09', clair: 'H46', fonce: 'H08' },
  { id: 'violet', nom: 'Violet', base: 'H07', clair: 'H45', fonce: 'H82' },
  { id: 'rose', nom: 'Rose', base: 'H06', clair: 'H95', fonce: 'H29' },
  { id: 'fuchsia', nom: 'Fuchsia', base: 'H32', clair: 'H48', fonce: 'H29' },
  { id: 'bordeaux', nom: 'Bordeaux', base: 'H29', clair: 'H05', fonce: 'H30' },
  { id: 'rose-pastel', nom: 'Rose pastel', base: 'H95', clair: 'H78', fonce: 'H48' },
  { id: 'peche', nom: 'Pêche', base: 'H105', clair: 'H78', fonce: 'H79' },
  { id: 'jaune-pastel', nom: 'Jaune pastel', base: 'H43', clair: 'H103', fonce: 'H14' },
  { id: 'menthe', nom: 'Menthe', base: 'H98', clair: 'H47', fonce: 'H113' },
  { id: 'bleu-pastel', nom: 'Bleu pastel', base: 'H46', clair: 'H97', fonce: 'H09' },
  { id: 'lilas', nom: 'Lilas', base: 'H96', clair: 'H106', fonce: 'H74' },
  { id: 'turquoise', nom: 'Turquoise', base: 'H31', clair: 'H97', fonce: 'H83' },
  { id: 'bleu-nuit', nom: 'Bleu nuit', base: 'H08', clair: 'H09', fonce: 'H116' },
  { id: 'sapin', nom: 'Vert sapin', base: 'H102', clair: 'H10', fonce: 'H28' },
  { id: 'marron', nom: 'Marron', base: 'H76', clair: 'H75', fonce: 'H12' },
  { id: 'dore', nom: 'Doré', base: 'H61', clair: 'H03', fonce: 'H21' },
  { id: 'argent', nom: 'Argent', base: 'H70', clair: 'H77', fonce: 'H17' },
  { id: 'blanc', nom: 'Blanc', base: 'H01', clair: 'H01', fonce: 'H77' },
  { id: 'noir', nom: 'Noir', base: 'H18', clair: 'H71', fonce: 'H18' },
];
const famille = (id) => FAMILLES.find((f) => f.id === id);
// Jeux de couleurs prédéfinis : la 1re lettre prend la 1re famille, la 2e la 2e, etc.
const JEUX = [
  { id: 'arc', nom: 'Arc-en-ciel', familles: ['rouge', 'orange', 'jaune', 'vert', 'bleu', 'violet', 'rose'] },
  { id: 'pastel', nom: 'Pastel', familles: ['rose-pastel', 'jaune-pastel', 'menthe', 'bleu-pastel', 'lilas', 'peche'] },
  { id: 'bonbon', nom: 'Bonbon', familles: ['fuchsia', 'rose-pastel', 'turquoise', 'jaune-pastel', 'lilas'] },
  { id: 'princesse', nom: 'Princesse', familles: ['rose', 'lilas', 'dore', 'rose-pastel'] },
  { id: 'noel', nom: 'Noël', familles: ['rouge', 'sapin', 'blanc', 'dore'] },
  { id: 'halloween', nom: 'Halloween', familles: ['orange', 'violet', 'vert'] },
  { id: 'paques', nom: 'Pâques', familles: ['jaune-pastel', 'rose-pastel', 'menthe', 'lilas', 'bleu-pastel'] },
  { id: 'ocean', nom: 'Océan', familles: ['bleu-nuit', 'bleu', 'turquoise', 'bleu-pastel'] },
  { id: 'foret', nom: 'Forêt', familles: ['sapin', 'vert', 'menthe', 'marron'] },
  { id: 'soleil', nom: 'Soleil', familles: ['rouge', 'orange', 'jaune'] },
  { id: 'or-argent', nom: 'Or et argent', familles: ['dore', 'argent'] },
];
const CONTOURS = [
  { code: 'H18', nom: 'Noir' }, { code: 'H01', nom: 'Blanc' }, { code: 'H71', nom: 'Gris anthracite' },
  { code: 'H12', nom: 'Marron' }, { code: 'H116', nom: 'Bleu nuit' }, { code: 'H82', nom: 'Prune' },
];
// arc-en-ciel : couleurs des lettres de la bibliothèque
const TEINTES = JEUX[0].familles.map(famille);

function connu(ch) { return !!(POLICE[ch] || ACCENTUEES[ch]); }

// Glyphe : grille de lettres (C = corps, N = contour), 12 de large ; « haut » = nombre de rangs
// au-dessus du corps (1 pour une lettre simple, 4 avec un accent).
const CACHE_GLYPHES = new Map();
function glyphe(ch) {
  if (CACHE_GLYPHES.has(ch)) return CACHE_GLYPHES.get(ch);
  const [base, accent] = ACCENTUEES[ch] || [ch, null];
  const pix = new Set(), cle = (r, c) => r + ',' + c;
  POLICE[base].forEach((ligne, r) => [...ligne].forEach((b, c) => {
    if (b === '1') for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) pix.add(cle(2 * r + dy, 2 * c + dx));
  }));
  if (accent) for (const [r, c] of FORMES_ACCENT[accent]) pix.add(cle(r, c));
  const rangs = [...pix].map((k) => +k.split(',')[0]);
  const haut = Math.max(1, 1 - Math.min(...rangs)), bas = Math.max(14, Math.max(...rangs) + 1);
  const grille = [];
  for (let r = -haut; r <= bas; r++) {
    let ligne = '';
    for (let c = -1; c <= 10; c++) {
      if (pix.has(cle(r, c))) { ligne += 'C'; continue; }
      let pres = false;
      for (let dy = -1; dy <= 1 && !pres; dy++) for (let dx = -1; dx <= 1; dx++) if (pix.has(cle(r + dy, c + dx))) { pres = true; break; }
      ligne += pres ? 'N' : '.';
    }
    grille.push(ligne);
  }
  const g = { grille, haut, bas: grille.length - haut - 14 };
  CACHE_GLYPHES.set(ch, g);
  return g;
}

function modeleCaractere(ch, teinte, theme) {
  return {
    theme, nom: String(ch), caractere: String(ch),
    couleurs: { C: teinte.base, N: 'H18' },
    relief: { C: [teinte.clair, teinte.fonce] },
    grille: glyphe(ch).grille,
  };
}
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((ch, k) => MODELES.push(modeleCaractere(ch, TEINTES[k % TEINTES.length], 'Alphabet')));
Object.keys(ACCENTUEES).forEach((ch, k) => MODELES.push(modeleCaractere(ch, TEINTES[k % TEINTES.length], 'Accents et signes')));
['!', '?', '.', '-', "'", '♥'].forEach((ch, k) => MODELES.push(modeleCaractere(ch, TEINTES[(k + 3) % TEINTES.length], 'Accents et signes')));
'0123456789'.split('').forEach((ch, k) => MODELES.push(modeleCaractere(ch, TEINTES[k % TEINTES.length], 'Chiffres')));

// ---------- Écrire une phrase : mise en page optimisée ----------
const PLAQUE = 29, LARG = 12; // grand carré Midi ; largeur d'une lettre (contour compris)

// Texte → lignes de mots ; chaque mot = liste de caractères connus.
function preparerTexte(texte) {
  let t = texte.toUpperCase();
  for (const [a, b] of Object.entries(EQUIVALENTS)) t = t.split(a).join(b);
  const ignores = new Set();
  const lignes = t.split(/\r?\n/).map((l) => l.split(/\s+/).filter(Boolean).map((mot) => [...mot].filter((c) => (connu(c) ? true : (ignores.add(c), false)))).filter((m) => m.length));
  return { lignes: lignes.filter((l) => l.length), ignores: [...ignores] };
}

// Mode « séparées » : 2 lettres par plaque au plus, aucune lettre coupée par un bord de plaque.
function pageSeparees(lignes, maxCols) {
  const rangees = []; // chaque rangée = liste de plaques ; plaque = liste de caractères
  for (const ligne of lignes) {
    let rangee = [];
    for (const mot of ligne) {
      for (let i = 0; i < mot.length; i += 2) {
        if (rangee.length === maxCols) { rangees.push(rangee); rangee = []; }
        rangee.push(mot.slice(i, i + 2));
      }
    }
    if (rangee.length) rangees.push(rangee);
  }
  const cols = Math.max(...rangees.map((r) => r.length)), rangs = rangees.length;
  const places = []; // { ch, x, y } en perles, y = haut du corps de la lettre
  rangees.forEach((rangee, br) => {
    const decal = Math.floor((cols - rangee.length) / 2); // rangée plus courte : centrée
    rangee.forEach((plaque, k) => {
      const bc = k + decal, w = plaque.length * LARG + (plaque.length - 1);
      const haut = Math.max(...plaque.map((c) => glyphe(c).haut)), bas = Math.max(...plaque.map((c) => glyphe(c).bas));
      const h = haut + 14 + bas;
      const x0 = bc * PLAQUE + Math.floor((PLAQUE - w) / 2) + 1, y0 = br * PLAQUE + Math.floor((PLAQUE - h) / 2) + haut;
      plaque.forEach((ch, j) => places.push({ ch, x: x0 + j * (LARG + 1), y: y0 }));
    });
  });
  return { cols, rangs, places };
}

// Mode « soudées » : les lettres d'un mot se chevauchent d'une colonne (contours communs) et
// forment une seule pièce ; on choisit le nombre de plaques par rangée qui en utilise le moins.
function pageSoudees(lignes) {
  const avance = LARG - 1, espace = 6;
  const largeurMot = (mot) => mot.length * avance + 1;
  const hautL = Math.max(1, ...lignes.flat(2).map((c) => glyphe(c).haut)), basL = Math.max(1, ...lignes.flat(2).map((c) => glyphe(c).bas));
  const hLigne = hautL + 14 + basL, ecart = 2;
  let meilleur = null;
  for (let cols = 1; cols <= 10; cols++) {
    const maxL = cols * PLAQUE - 2, rangeesTexte = [];
    let possible = true;
    for (const ligne of lignes) {
      let cur = [], w = 0;
      for (const mot of ligne) {
        const lm = largeurMot(mot);
        if (lm > maxL) { possible = false; break; }
        if (cur.length && w + espace + lm > maxL) { rangeesTexte.push({ mots: cur, w }); cur = []; w = 0; }
        w += (cur.length ? espace : 0) + lm; cur.push(mot);
      }
      if (!possible) break;
      if (cur.length) rangeesTexte.push({ mots: cur, w });
    }
    if (!possible) continue;
    const hTotal = rangeesTexte.length * hLigne + (rangeesTexte.length - 1) * ecart + 2;
    const rangs = Math.ceil(hTotal / PLAQUE);
    if (rangs > 10) continue;
    const n = cols * rangs;
    if (!meilleur || n < meilleur.n || (n === meilleur.n && rangs < meilleur.rangs)) meilleur = { n, cols, rangs, rangeesTexte, hTotal };
  }
  if (!meilleur) return null;
  const { cols, rangs, rangeesTexte, hTotal } = meilleur, places = [];
  let y = Math.floor((rangs * PLAQUE - hTotal) / 2) + 1 + hautL;
  for (const { mots, w } of rangeesTexte) {
    let x = Math.floor((cols * PLAQUE - w) / 2) + 1;
    for (const mot of mots) {
      mot.forEach((ch, j) => places.push({ ch, x: x + j * avance, y }));
      x += largeurMot(mot) + espace;
    }
    y += hLigne + ecart;
  }
  return { cols, rangs, places };
}

// Construit le motif d'une phrase (sans l'ouvrir) — sert à l'aperçu et à la création.
// r = { texte, mode: 'separees'|'soudees', couleur: 'jeu:<id>'|'fam:<id>', contour: code }
function construirePhrase(r) {
  const { lignes, ignores } = preparerTexte(r.texte);
  const nbLettres = lignes.flat(2).length;
  if (!nbLettres) return { erreur: 'Tape au moins une lettre ou un chiffre.' };
  const page = r.mode === 'soudees' ? pageSoudees(lignes) : pageSeparees(lignes, 10);
  if (!page || page.cols > 10 || page.rangs > 10) return { erreur: 'Texte trop long pour 10 × 10 plaques : coupe-le en plusieurs motifs.' };
  const motif = creerMotif(r.texte.replace(/\s+/g, ' ').trim().slice(0, 40), 'midi-carre-grand', { cols: page.cols, rangs: page.rangs }, 'hama-midi');
  motif.couleurs = [];
  const pal = paletteParId('hama-midi'), indice = new Map();
  const coul = (code) => {
    if (!indice.has(code)) { const c = pal.couleurs.find((x) => x.code === code); indice.set(code, motif.couleurs.length); motif.couleurs.push({ ...c, marque: nomCourt(pal) }); }
    return indice.get(code);
  };
  const largeurTotale = page.cols * PLAQUE;
  const poser = (X, Y, v, seulementVide) => {
    if (X < 0 || Y < 0 || X >= largeurTotale || Y >= page.rangs * PLAQUE) return -1;
    const bc = Math.floor(X / PLAQUE), br = Math.floor(Y / PLAQUE);
    const i = (br * page.cols + bc) * PLAQUE * PLAQUE + (Y % PLAQUE) * PLAQUE + (X % PLAQUE);
    if (seulementVide && motif.cases[i] >= 0) return -1;
    motif.cases[i] = v;
    return i;
  };
  // on retient chaque lettre (ses perles et leur rôle : base, clair, foncé) pour pouvoir la recolorier
  motif.lettres = []; motif.contour = []; motif.contourCode = r.contour;
  const [genre, id] = r.couleur.split(':'), jeu = JEUX.find((j) => j.id === id);
  page.places.forEach(({ ch, x, y }, k) => {
    const fam = genre === 'jeu' ? famille(jeu.familles[k % jeu.familles.length]) : famille(id);
    const { grille, haut } = glyphe(ch), est = (rr, cc) => grille[rr]?.[cc] === 'C';
    const lettre = { ch, famille: fam.id, cases: [] };
    grille.forEach((ligne, rr) => [...ligne].forEach((l, cc) => {
      const X = x - 1 + cc, Y = y - haut + rr;
      if (l === 'N') { const i = poser(X, Y, coul(r.contour), true); if (i >= 0) motif.contour.push(i); }
      if (l !== 'C') return;
      // relief : lumière en haut à gauche
      const eclaire = !est(rr - 1, cc) || !est(rr, cc - 1), ombre = !est(rr + 1, cc) || !est(rr, cc + 1);
      const role = eclaire && !ombre ? 'clair' : ombre && !eclaire ? 'fonce' : 'base';
      const i = poser(X, Y, coul(fam[role]), false);
      if (i >= 0) lettre.cases.push([i, role]);
    }));
    motif.lettres.push(lettre);
  });
  const dansLettre = new Set(motif.lettres.flatMap((l) => l.cases.map((c) => c[0])));
  motif.contour = [...new Set(motif.contour)].filter((i) => !dansLettre.has(i));
  return { motif, page, nbLettres, ignores };
}

// Fenêtre « Écrire une phrase » : choix par pastilles et aperçu en direct.
function ecrirePhrase() {
  const etat = { texte: '', mode: 'separees', couleur: 'jeu:arc', contour: 'H18' };
  const dlg = document.createElement('dialog');
  dlg.className = 'tres-large phrase';
  const pastilles = (codes) => codes.map((c) => `<i style="background:${hexDe(c)}"></i>`).join('');
  dlg.innerHTML = `<form method="dialog">
    <h3>Écrire une phrase</h3>
    <div class="phrase-grille">
      <div>
        <label>Texte <small>(retour à la ligne = nouvelle ligne ; accents, chiffres et ! ? . - ' ♥ acceptés)</small>
          <textarea id="phTexte" rows="3" placeholder="ex. BRAVO"></textarea></label>
        <h4>Pièces</h4>
        <div class="choix-cartes" id="phMode">
          <button type="button" data-v="separees"><b>Une pièce par lettre</b><small>Jamais coupée, 2 lettres par plaque. Chaque plaque se repasse seule.</small></button>
          <button type="button" data-v="soudees"><b>Un mot = une pièce</b><small>Lettres soudées entre elles. Plaques assemblées et repassées ensemble.</small></button>
        </div>
        <h4>Jeux de couleurs</h4>
        <div class="familles" id="phJeux">${JEUX.map((j) => `<button type="button" class="famille" data-v="jeu:${j.id}"><span class="tons">${pastilles(j.familles.map((f) => famille(f).base))}</span>${echap(j.nom)}</button>`).join('')}</div>
        <h4>Ou une seule couleur</h4>
        <div class="familles" id="phFamilles">${FAMILLES.map((f) => `<button type="button" class="famille mini" data-v="fam:${f.id}" title="${echap(f.nom)}"><span class="tons">${pastilles([f.clair, f.base, f.fonce])}</span>${echap(f.nom)}</button>`).join('')}</div>
        <h4>Contour</h4>
        <div class="familles" id="phContours">${CONTOURS.map((c) => `<button type="button" class="famille" data-v="${c.code}"><span class="tons">${pastilles([c.code])}</span>${echap(c.nom)}</button>`).join('')}</div>
      </div>
      <div class="phrase-apercu">
        <canvas id="phApercu"></canvas>
        <p id="phInfo" class="note"></p>
      </div>
    </div>
    <menu><button value="annuler" formnovalidate>Annuler</button><button value="ok" class="principal" id="phCreer">Créer le motif</button></menu>
  </form>`;
  document.body.appendChild(dlg);
  const maj = () => {
    dlg.querySelectorAll('#phMode [data-v]').forEach((b) => b.classList.toggle('choisie', b.dataset.v === etat.mode));
    dlg.querySelectorAll('#phJeux [data-v], #phFamilles [data-v]').forEach((b) => b.classList.toggle('choisie', b.dataset.v === etat.couleur));
    dlg.querySelectorAll('#phContours [data-v]').forEach((b) => b.classList.toggle('choisie', b.dataset.v === etat.contour));
    const res = etat.texte.trim() ? construirePhrase(etat) : { erreur: 'Tape ton texte : l’aperçu apparaît ici.' };
    const cv = dlg.querySelector('#phApercu'), info = dlg.querySelector('#phInfo');
    dlg.querySelector('#phCreer').disabled = !!res.erreur;
    if (res.erreur) { cv.width = cv.height = 0; info.textContent = res.erreur; return; }
    const surf = construireSurface(formatParId('midi-carre-grand'), res.motif.cfg);
    vignette(cv, { surf, cases: res.motif.cases, couleurs: res.motif.couleurs }, 420);
    const n = res.page.cols * res.page.rangs, soud = analyserSoudure(surf, res.motif.cases);
    info.innerHTML = `<b>${n} plaque${n > 1 ? 's' : ''}</b> (${res.page.cols} × ${res.page.rangs}) au lieu de ${res.nbLettres} avec une lettre par plaque · ${res.motif.cases.filter((v) => v >= 0).length} perles<br>${echap(texteSoudure(soud))}`
      + (res.ignores.length ? `<br>Caractères ignorés : ${echap(res.ignores.join(' '))}` : '');
  };
  let minuterie = null;
  dlg.querySelector('#phTexte').oninput = (e) => { etat.texte = e.target.value; clearTimeout(minuterie); minuterie = setTimeout(maj, 150); };
  dlg.querySelectorAll('#phMode [data-v]').forEach((b) => (b.onclick = () => { etat.mode = b.dataset.v; maj(); }));
  dlg.querySelectorAll('#phJeux [data-v], #phFamilles [data-v]').forEach((b) => (b.onclick = () => { etat.couleur = b.dataset.v; maj(); }));
  dlg.querySelectorAll('#phContours [data-v]').forEach((b) => (b.onclick = () => { etat.contour = b.dataset.v; maj(); }));
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'ok') {
      const res = construirePhrase(etat);
      if (!res.erreur) {
        charger(res.motif); sauverMaintenant();
        $('#dlgModeles')?.close();
        zoomAjuster();
        const n = res.page.cols * res.page.rangs;
        message(`${res.nbLettres} caractère(s) sur ${n} plaque(s). Outil « Couleur lettre » pour changer la couleur d'une lettre.`, 6000);
      }
    }
    dlg.remove();
  });
  maj();
  dlg.showModal();
  dlg.querySelector('#phTexte').focus();
}
