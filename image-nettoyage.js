'use strict';
// Nettoyage FACULTATIF d'une image transformée en perles. Chaque réglage se coche à part,
// et on choisit ensuite la version à garder (« Sans nettoyage » / « Avec nettoyage ») :
// le nettoyage n'est jamais imposé, car il arrive que le résultat brut soit meilleur.
//  • parasites : une perle entourée d'une autre couleur prend la couleur de ses voisines ;
//  • détails   : on garde quand même les perles très contrastées (yeux, reflets, bouche) ;
//  • teintes   : les couleurs presque identiques sont regroupées (aplats plus propres) ;
//  • contour   : le bord du sujet devient un contour de la couleur la plus foncée ;
//  • soudure   : les perles seules, qui tomberaient au repassage, sont retirées.

const NETTOYAGE_DEFAUT = { parasites: true, details: true, teintes: true, contour: false, soudure: true };

function ecartCouleurs(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }

function nettoyerImage(surf, res, o) {
  const cases = res.cases.slice(), couleurs = res.couleurs.map((c) => ({ ...c }));
  const labs = couleurs.map((c) => rgbLab(hexRgb(c.hex)));
  const vois = surf.voisins;

  // 1) perles parasites
  if (o.parasites) {
    for (let passe = 0; passe < 2; passe++) {
      const avant = cases.slice();
      for (let i = 0; i < cases.length; i++) {
        const c = avant[i];
        if (c < 0) continue;
        const nb = vois[i].map((j) => avant[j]).filter((v) => v >= 0);
        if (nb.length < 3 || nb.includes(c)) continue;          // pas isolée dans sa couleur
        const compte = new Map();
        for (const v of nb) compte.set(v, (compte.get(v) || 0) + 1);
        const [maj, n] = [...compte.entries()].sort((a, b) => b[1] - a[1])[0];
        if (n < Math.ceil(nb.length / 2)) continue;              // pas de couleur dominante autour
        if (o.details && ecartCouleurs(labs[c], labs[maj]) > 30) continue; // vrai détail : on le garde
        cases[i] = maj;
      }
    }
  }

  // 2) teintes très proches regroupées (la moins utilisée rejoint la plus utilisée)
  if (o.teintes) {
    const nb = new Array(couleurs.length).fill(0);
    for (const v of cases) if (v >= 0) nb[v]++;
    const vers = couleurs.map((_, k) => k);
    const ordre = [...couleurs.keys()].sort((a, b) => nb[b] - nb[a]);
    for (let x = 0; x < ordre.length; x++) for (let y = x + 1; y < ordre.length; y++) {
      const a = ordre[x], b = ordre[y];
      if (vers[a] !== a || vers[b] !== b || !nb[b]) continue;
      if (ecartCouleurs(labs[a], labs[b]) < 9) vers[b] = a;
    }
    for (let i = 0; i < cases.length; i++) if (cases[i] >= 0) cases[i] = vers[cases[i]];
  }

  // 3) contour foncé autour du sujet
  if (o.contour) {
    // fond = perles vides, ou à défaut la couleur la plus présente sur le bord de la surface
    const bord = new Map(), maxV = Math.max(...vois.map((v) => v.length));
    surf.picots.forEach((q, i) => { if (vois[i].length < maxV && cases[i] >= 0) bord.set(cases[i], (bord.get(cases[i]) || 0) + 1); });
    const fond = cases.includes(-1) ? -1 : ([...bord.entries()].sort((a, b) => b[1] - a[1])[0] || [-2])[0];
    const utilisees = [...new Set(cases.filter((v) => v >= 0 && v !== fond))];
    if (utilisees.length) {
      const fonce = utilisees.sort((a, b) => labs[a][0] - labs[b][0])[0];
      const avant = cases.slice();
      for (let i = 0; i < cases.length; i++) {
        if (avant[i] < 0 || avant[i] === fond) continue;
        if (vois[i].some((j) => avant[j] === fond)) cases[i] = fonce;
      }
    }
  }

  // 4) perles seules retirées
  if (o.soudure) {
    for (let i = 0; i < cases.length; i++) if (cases[i] >= 0 && !vois[i].some((j) => cases[j] >= 0)) cases[i] = -1;
  }

  // ne garder que les couleurs encore posées
  const utilisees = [...new Set(cases.filter((v) => v >= 0))].sort((a, b) => a - b);
  const carte = new Map(utilisees.map((v, k) => [v, k]));
  let changees = 0;
  const finales = cases.map((v) => (v >= 0 ? carte.get(v) : -1));
  for (let i = 0; i < cases.length; i++) {
    const a = res.cases[i] >= 0 ? res.couleurs[res.cases[i]].hex : '', b = finales[i] >= 0 ? couleurs[utilisees[finales[i]]].hex : '';
    if (a !== b) changees++;
  }
  return { cases: finales, couleurs: utilisees.map((v) => couleurs[v]), changees };
}
