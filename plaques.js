'use strict';
// Catalogue des plaques et géométrie des picots.
//
// Une plaque = une liste de picots {x, y} exprimés en « pas » (1 = écart entre deux
// picots voisins). On peut donc gérer n'importe quelle disposition : carré, quinconce,
// hexagone, anneaux concentriques (plaques rondes) ou plaque dessinée à la main.
//
// Sources (relevées le 2026-11-10) :
//  - hama.dk (fiches officielles) : Midi grand carré 841, petit carré 196, rond 631 / 397 / 169,
//    Mini grand carré 3249 (57 × 57, assemblable), Maxi grand carré 256.
//  - revendeurs (LindeHobby) : Midi hexagone 721 / 469 / 169. Le 721 = 16 picots de côté,
//    identique aux grilles hexagonales de 16 de côté couramment utilisées.
//  - Les nombres « hexagonaux » (169 = 1+6+12+…+42) montrent que les plaques rondes ont leurs
//    picots en anneaux concentriques (anneau k = 6k picots). Disposition à vérifier sur la plaque.
//  - Cœur, étoile, animaux… : seul le nombre de picots est publié, pas leur plan. On ne
//    l'invente pas : on les dessine soi-même (« Enregistrer comme plaque »).

const GAMMES = {
  Midi: { pas: 5,   note: 'perles 5 mm (Hama Midi, Perler, Artkal S)' },
  Mini: { pas: 2.5, note: 'perles 2,5 mm (Hama Mini, Artkal mini)' },
  Maxi: { pas: 10,  note: 'perles 10 mm (Hama Maxi)' },
};

const PLAQUES = [
  { id: 'midi-carre-grand', gamme: 'Midi', nom: 'Grand carré 29 × 29',  type: 'carre', w: 29, h: 29, picots: 841, source: 'hama.dk' },
  { id: 'midi-carre-petit', gamme: 'Midi', nom: 'Petit carré 14 × 14',  type: 'carre', w: 14, h: 14, picots: 196, source: 'hama.dk' },
  { id: 'midi-hexa-grand',  gamme: 'Midi', nom: 'Grand hexagone (16 de côté)', type: 'hexa', cote: 16, picots: 721, source: 'revendeur' },
  { id: 'midi-hexa-moyen',  gamme: 'Midi', nom: 'Hexagone moyen (13 de côté)', type: 'hexa', cote: 13, picots: 469, source: 'revendeur' },
  { id: 'midi-hexa-petit',  gamme: 'Midi', nom: 'Petit hexagone (8 de côté)',  type: 'hexa', cote: 8,  picots: 169, source: 'revendeur' },
  { id: 'midi-rond-grand',  gamme: 'Midi', nom: 'Grand rond (14 anneaux)',     type: 'rond', anneaux: 14, picots: 631, source: 'hama.dk — disposition déduite' },
  { id: 'midi-rond-moyen',  gamme: 'Midi', nom: 'Rond moyen (11 anneaux)',     type: 'rond', anneaux: 11, picots: 397, source: 'hama.dk — disposition déduite' },
  { id: 'midi-rond-petit',  gamme: 'Midi', nom: 'Petit rond (7 anneaux)',      type: 'rond', anneaux: 7,  picots: 169, source: 'hama.dk — disposition déduite' },
  { id: 'mini-carre-grand', gamme: 'Mini', nom: 'Grand carré 57 × 57',  type: 'carre', w: 57, h: 57, picots: 3249, source: 'hama.dk' },
  { id: 'maxi-carre-grand', gamme: 'Maxi', nom: 'Grand carré 16 × 16',  type: 'carre', w: 16, h: 16, picots: 256, source: 'hama.dk' },
  { id: 'libre-carre',      gamme: 'Midi', nom: 'Grille carrée libre',          type: 'carre', libre: true, source: '—' },
  { id: 'libre-quinconce',  gamme: 'Midi', nom: 'Grille en quinconce libre',    type: 'quinconce', libre: true, source: '—' },
];

// Formes vendues dont le plan n'est pas publié : à recréer à la main si besoin.
const PLAQUES_SANS_PLAN = [
  'Grand cœur Midi (591 picots)', 'Œuf Midi (384)', 'Chat Midi (321)', 'Étoile', 'Petit cœur', 'Animaux, lettres…',
];

const RAC3 = Math.sqrt(3) / 2;

// Picots d'UNE plaque, origine en haut à gauche, + son contour (pour le dessin).
function picotsFormat(f, w, h) {
  const p = [];
  if (f.type === 'carre') {
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) p.push({ x: c + 0.5, y: r + 0.5 });
    return { picots: p, larg: w, haut: h, contour: { forme: 'rect' } };
  }
  if (f.type === 'quinconce') {
    for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) p.push({ x: c + 0.5 + (r % 2 ? 0.5 : 0), y: r * RAC3 + 0.5 });
    return { picots: p, larg: w + 0.5, haut: (h - 1) * RAC3 + 1, contour: { forme: 'rect' } };
  }
  if (f.type === 'hexa') {
    const n = f.cote, lignes = 2 * n - 1;
    for (let i = 0; i < lignes; i++) {
      const nb = n + Math.min(i, lignes - 1 - i), debut = (lignes - nb) / 2;
      for (let k = 0; k < nb; k++) p.push({ x: debut + k + 0.5, y: i * RAC3 + 0.5 });
    }
    return { picots: p, larg: lignes, haut: (lignes - 1) * RAC3 + 1, contour: { forme: 'hexa' } };
  }
  if (f.type === 'rond') {
    const R = f.anneaux, c = R + 0.5;
    p.push({ x: c, y: c });
    for (let k = 1; k <= R; k++) for (let j = 0; j < 6 * k; j++) {
      const a = (2 * Math.PI * j) / (6 * k) - Math.PI / 2;
      p.push({ x: c + k * Math.cos(a), y: c + k * Math.sin(a) });
    }
    return { picots: p, larg: 2 * R + 1, haut: 2 * R + 1, contour: { forme: 'rond' } };
  }
  if (f.type === 'perso') {
    for (const [x, y] of f.coords) p.push({ x, y });
    return { picots: p, larg: f.larg, haut: f.haut, contour: { forme: 'perso' } };
  }
  throw new Error('Type de plaque inconnu : ' + f.type);
}

// Surface complète = la plaque répétée en colonnes × rangées (assemblage côte à côte).
// Renvoie { picots:[{x,y,b}], plaques:[{x,y,larg,haut,etiquette,contour}], larg, haut }
function construireSurface(f, cfg) {
  const base = picotsFormat(f, cfg.w || f.w, cfg.h || f.h);
  const cols = Math.max(1, cfg.cols || 1), rangs = Math.max(1, cfg.rangs || 1);
  const picots = [], plaques = [];
  for (let br = 0; br < rangs; br++) for (let bc = 0; bc < cols; bc++) {
    const b = plaques.length, ox = bc * base.larg, oy = br * base.haut;
    plaques.push({ x: ox, y: oy, larg: base.larg, haut: base.haut, contour: base.contour, etiquette: String.fromCharCode(65 + br) + (bc + 1) });
    for (const q of base.picots) picots.push({ x: q.x + ox, y: q.y + oy, b });
  }
  return { picots, plaques, larg: cols * base.larg, haut: rangs * base.haut, voisins: voisinsDe(picots) };
}

// Voisins (distance ≤ 1,15 pas) — sert au remplissage et au tramage.
function voisinsDe(picots) {
  const seau = new Map(), cle = (x, y) => Math.floor(x) + ',' + Math.floor(y);
  picots.forEach((q, i) => { const k = cle(q.x, q.y); if (!seau.has(k)) seau.set(k, []); seau.get(k).push(i); });
  return picots.map((q, i) => {
    const v = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const j of seau.get(Math.floor(q.x) + dx + ',' + (Math.floor(q.y) + dy)) || []) {
        if (j !== i && Math.hypot(picots[j].x - q.x, picots[j].y - q.y) <= 1.15) v.push(j);
      }
    }
    return v;
  });
}

// Picot le plus proche d'un point (en pas), ou -1 si trop loin.
function picotProche(surface, x, y, max = 0.6) {
  let best = -1, d = max;
  for (let i = 0; i < surface.picots.length; i++) {
    const q = surface.picots[i], e = Math.hypot(q.x - x, q.y - y);
    if (e < d) { d = e; best = i; }
  }
  return best;
}
