'use strict';
// Adapter un modèle à la plaque (demande de Sophie) : un modèle doit REMPLIR sa plaque,
// avec un niveau de détail qui dépend de la taille des perles.
//   • Maxi (10 mm, plaques enfants) : dessin simple, couleurs franches, pas de dégradés ;
//   • Midi (5 mm) : petit carré = dessin de base ; grandes plaques = dessin agrandi et travaillé ;
//   • Mini (2,5 mm) : beaucoup plus de perles → version détaillée.
// Deux mécanismes :
//   1. agrandissement « lissé » (méthode Scale2x) des modèles en grille : les diagonales
//      restent des escaliers propres au lieu de gros pavés ;
//   2. un modèle peut fournir `dessin(u, v, n, D)` : un dessin en coordonnées (-1…1) rendu
//      à la résolution de la plaque, qui ajoute ses détails seulement s'il y a la place (n = perles de large).

// Taille utile (en perles) d'une plaque pour un modèle
function tailleUtile(surf) { return Math.min(surf.larg, surf.haut) - 1; }

function niveauPlaque(fmt) {
  if (fmt.gamme === 'Maxi') return 'maxi';
  if (fmt.gamme === 'Mini') return 'mini';
  return 'midi';
}

// Scale2x / EPX sur une grille de lettres
function agrandir2x(grille) {
  const h = grille.length, w = grille[0].length, at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? '.' : grille[y][x]);
  const res = Array.from({ length: h * 2 }, () => []);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const P = at(x, y), A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
    let e0 = P, e1 = P, e2 = P, e3 = P;
    if (C === A && C !== D && A !== B) e0 = A;
    if (A === B && A !== C && B !== D) e1 = B;
    if (D === C && D !== B && C !== A) e2 = C;
    if (B === D && B !== A && D !== C) e3 = D;
    res[2 * y][2 * x] = e0; res[2 * y][2 * x + 1] = e1; res[2 * y + 1][2 * x] = e2; res[2 * y + 1][2 * x + 1] = e3;
  }
  return res.map((r) => r.join(''));
}

// Outils pour les dessins détaillés
const D = {
  // éclairage d'un volume rond (ellipse vue comme une demi-sphère) : 0 (ombre) → 1 (lumière)
  boule(u, v, cx, cy, rx, ry) {
    const nx = (u - cx) / rx, ny = (v - cy) / ry, nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));
    const dot = -0.45 * nx - 0.55 * ny + 0.7 * nz; // lumière en haut à gauche, un peu de face
    return dot > 0.96 ? 0.9 : dot > 0.86 ? 0.75 : dot < 0.12 ? 0.2 : 0.5;
  },
  // lettre avec ton : base, base+ (clair), base- (foncé), base* (reflet)
  ton(l, e, n) {
    if (n < 20) return l;
    if (e > 0.86 && n >= 34) return l + '*';
    if (e > 0.68) return l + '+';
    if (e < 0.3) return l + '-';
    return l;
  },
};

// une perle, en unités du dessin ; un trait d'environ une perle d'épaisseur
D.px = (n) => 2 / n;
D.trait = (d, n, ep = 0.55) => d < ep * D.px(n);
// dégradé vertical simple (objets plats éclairés d'en haut) : 0 en bas, 1 en haut
D.haut = (v, y0, y1) => Math.max(0, Math.min(1, (y1 - v) / (y1 - y0)));
// œil kawaii : reflet blanc, pupille noire, iris coloré si la place le permet
D.oeil = (u, v, cx, cy, rx, ry, n, iris) => {
  if (!G.ell(u, v, cx, cy, rx, ry)) return null;
  if (G.ell(u, v, cx - rx * 0.35, cy - ry * 0.4, Math.max(rx * 0.32, D.px(n) * 0.75), Math.max(ry * 0.26, D.px(n) * 0.75))) return 'W';
  if (n >= 44 && iris && !G.ell(u, v, cx, cy + ry * 0.08, rx * 0.62, ry * 0.7)) return iris;
  return 'N';
};
// frimousse kawaii centrée en (cx, cy), taille s : yeux avec reflet, joues roses, sourire
D.frimousse = (u, v, cx, cy, s, n, bouche = 'sourire') => {
  const au = Math.abs(u - cx);
  const o = D.oeil(au, v, 0.3 * s, cy, 0.085 * s, 0.11 * s, n, null); if (o) return o;
  if (n >= 30 && G.ell(au, v, 0.5 * s, cy + 0.16 * s, 0.1 * s, 0.055 * s)) return 'P';
  const r = Math.hypot(u - cx, (v - cy - 0.06 * s) * 1.1);
  if (bouche === 'sourire' && Math.abs(r - 0.11 * s) < Math.max(D.px(n) * 0.5, 0.02 * s) && v > cy + 0.08 * s) return 'N';
  if (bouche === 'o' && G.ell(u, v, cx, cy + 0.17 * s, 0.05 * s, 0.06 * s)) return 'N';
  return null;
};
// Dessin symétrique : on écrit la moitié gauche (colonne du milieu comprise), elle est
// recopiée en miroir ; `ajouts` = [rangée, colonne, texte] pour les parties asymétriques (queue…).
function symetrique(gauche, largeur, ajouts = []) {
  const g = gauche.map((l) => (l + [...l.slice(0, -1)].reverse().join('')).padEnd(largeur, '.'));
  for (const [y, x, s] of ajouts) g[y] = g[y].slice(0, x) + s + g[y].slice(x + s.length);
  return g;
}

// ajoute une version détaillée à un modèle existant
function detailler(theme, nom, contour, couleursDessin, dessin) {
  const m = MODELES.find((x) => x.theme === theme && x.nom === nom);
  if (!m) { console.warn('Modèle introuvable pour le détail :', theme, nom); return; }
  Object.assign(m, { dessin, contourDessin: contour, couleursDessin });
}

// Contour intérieur : les perles du bord du dessin prennent la lettre de contour
function contourner(surf, lettres, l, sauf = []) {
  return lettres.map((x, i) => {
    if (!x || sauf.includes(x[0])) return x;
    return surf.voisins[i].length < 4 || surf.voisins[i].some((j) => !lettres[j]) ? l : x;
  });
}

// Répare la soudure : une perle sans voisine par le côté est rattachée (on ajoute une perle
// de sa couleur dans le vide qui la relie au reste) ou retirée si rien n'est possible.
function souderLettres(surf, lettres) {
  const res = lettres.slice();
  for (let passe = 0; passe < 4; passe++) {
    const cases = res.map((l) => (l ? 0 : -1)), a = analyserSoudure(surf, cases);
    const fautives = [...a.isolees, ...a.coins];
    if (!fautives.length) break;
    // composante principale de chaque plaque
    for (const i of fautives) {
      if (!res[i]) continue;
      const q = surf.picots[i];
      // un vide voisin par le côté qui touche aussi une autre perle déjà bien soudée
      let choix = -1, meilleur = 0;
      for (const j of surf.voisins[i]) {
        if (res[j]) continue;
        const nb = surf.voisins[j].filter((k) => k !== i && res[k] && !fautives.includes(k)).length;
        if (nb > meilleur) { meilleur = nb; choix = j; }
      }
      if (choix >= 0) res[choix] = res[i];
      else if (passe === 3) res[i] = null;
      void q;
    }
  }
  return res;
}

// au-dessous, l'agrandissement lissé du dessin de base est plus net qu'un dessin calculé
const SEUIL_DESSIN = 40;

// Un modèle détaillé doit sortir d'une seule pièce : les petits morceaux détachés
// (moins de 6 % de la pièce principale) sont retirés, car ils tomberaient au repassage.
function garderUnePiece(surf, lettres) {
  const n = lettres.length, comp = new Int32Array(n).fill(-1), tailles = [];
  for (let i = 0; i < n; i++) {
    if (!lettres[i] || comp[i] >= 0) continue;
    const id = tailles.length, pile = [i]; let t = 0; comp[i] = id;
    while (pile.length) { const k = pile.pop(); t++; for (const j of surf.voisins[k]) if (lettres[j] && comp[j] < 0) { comp[j] = id; pile.push(j); } }
    tailles.push(t);
  }
  const max = Math.max(0, ...tailles);
  return lettres.map((l, i) => (l && tailles[comp[i]] < max * 0.06 ? null : l));
}

// Calcule les lettres d'un modèle pour une plaque, à la bonne taille. Renvoie null pour
// laisser faire la pose habituelle (grille posée telle quelle).
function lettresAdaptees(m, fmt, surf) {
  const niveau = niveauPlaque(fmt), S = tailleUtile(surf);
  if (m.caractere || m.tailleFixe || m.f) return null; // lettres de l'alphabet, recettes : déjà à la bonne taille
  // 1. dessin détaillé, quand la plaque est assez grande
  if (m.dessin && niveau !== 'maxi' && S >= SEUIL_DESSIN) {
    const cx = surf.larg / 2, cy = surf.haut / 2, demi = S / 2;
    let l = surf.picots.map((q) => {
      const u = (q.x - cx) / demi, v = (q.y - cy) / demi;
      const r = m.dessin(u, v, S, D);
      return !r || r === '.' ? null : r;
    });
    if (m.contourDessin) l = contourner(surf, l, m.contourDessin, m.sansContour || []);
    return garderUnePiece(surf, souderLettres(surf, l));
  }
  // 2. agrandissement lissé de la grille
  if (!m.grille || fmt.type !== 'carre') return null;
  let g = m.grille, cote = Math.max(g.length, g[0].length);
  while (cote * 2 <= S) { g = agrandir2x(g); cote *= 2; }
  if (g === m.grille) return null;
  const gh = g.length, gw = g[0].length, ox = Math.round((surf.larg - gw) / 2), oy = Math.round((surf.haut - gh) / 2);
  const l = surf.picots.map((q) => {
    const gx = Math.floor(q.x - ox), gy = Math.floor(q.y - oy);
    return gx < 0 || gy < 0 || gx >= gw || gy >= gh || g[gy][gx] === '.' ? null : g[gy][gx];
  });
  return souderLettres(surf, l);
}
