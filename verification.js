'use strict';
// Vérification « est-ce que ça va se souder ? »
// Au repassage, deux perles ne fondent ensemble que si elles se TOUCHENT par le côté
// (picots voisins : distance d'un pas — 4 voisins en carré, 6 en hexagone/rond).
// En diagonale sur une plaque carrée, il reste un vide : elles ne se soudent pas.
// On signale (sans rien bloquer) :
//   • perle isolée : aucune voisine qui la touche → elle tombe ;
//   • partie tenue seulement par un coin (diagonale) → elle se détache ;
//   • morceaux séparés → le motif sort en plusieurs pièces.

function analyserSoudure(surf, cases) {
  const n = surf.picots.length, comp = new Int32Array(n).fill(-1), morceaux = [];
  for (let i = 0; i < n; i++) {
    if (cases[i] < 0 || comp[i] >= 0) continue;
    const id = morceaux.length, pile = [i], membres = [];
    comp[i] = id;
    while (pile.length) {
      const k = pile.pop();
      membres.push(k);
      for (const j of surf.voisins[k]) if (cases[j] >= 0 && comp[j] < 0) { comp[j] = id; pile.push(j); }
    }
    morceaux.push(membres);
  }
  // sur un assemblage, chaque plaque se repasse à part (ex. une lettre par plaque) :
  // la pièce principale = le plus gros morceau DE CHAQUE PLAQUE
  const principaux = new Map();
  morceaux.forEach((m, k) => {
    const b = surf.picots[m[0]].b || 0, p = principaux.get(b);
    if (p === undefined || m.length > morceaux[p].length) principaux.set(b, k);
  });
  const estPrincipal = new Set(principaux.values());

  // morceaux qui ne touchent un autre que par un coin (distance ~1,41 pas)
  const parCoin = new Set();
  if (morceaux.length > 1) {
    const seau = new Map(), cle = (x, y) => Math.floor(x) + ',' + Math.floor(y);
    for (let i = 0; i < n; i++) if (cases[i] >= 0) { const k = cle(surf.picots[i].x, surf.picots[i].y); if (!seau.has(k)) seau.set(k, []); seau.get(k).push(i); }
    for (let i = 0; i < n; i++) {
      if (cases[i] < 0) continue;
      const q = surf.picots[i];
      for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) for (const j of seau.get((Math.floor(q.x) + dx) + ',' + (Math.floor(q.y) + dy)) || []) {
        if (comp[j] === comp[i]) continue;
        const d = Math.hypot(surf.picots[j].x - q.x, surf.picots[j].y - q.y);
        if (d < 1.6) { parCoin.add(comp[i]); parCoin.add(comp[j]); }
      }
    }
  }
  const isolees = [], coins = [], separes = [];
  morceaux.forEach((m, k) => {
    if (estPrincipal.has(k)) return;
    if (m.length === 1) isolees.push(m[0]);
    else if (parCoin.has(k)) coins.push(...m);
    else separes.push(...m);
  });
  // une perle isolée qui touche un coin reste « isolée » (c'est le cas le plus grave)
  // plusieurs pièces séparées peuvent être voulues (une lettre, un mot…) : ce n'est pas une
  // erreur. Seules les perles isolées ou tenues par un coin tomberont.
  const pieces = morceaux.length - isolees.length - new Set(coins.map((i) => comp[i])).size;
  return { morceaux: morceaux.length, pieces, isolees, coins, separes, ok: !isolees.length && !coins.length };
}

function texteSoudure(a) {
  if (a.morceaux === 0) return '';
  if (a.ok) return a.pieces > 1 ? `✓ ${a.pieces} pièces, chacune d’un seul tenant` : '✓ Se soude d’un seul tenant';
  const p = [];
  if (a.isolees.length) p.push(`${a.isolees.length} perle${a.isolees.length > 1 ? 's' : ''} isolée${a.isolees.length > 1 ? 's' : ''}`);
  if (a.coins.length) p.push(`${a.coins.length} perle${a.coins.length > 1 ? 's' : ''} tenue${a.coins.length > 1 ? 's' : ''} par un coin`);
  if (a.pieces > 1) p.push(`${a.pieces} pièces`);
  return '⚠ ' + p.join(' · ');
}
