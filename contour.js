'use strict';
// Contour concentrique, couche par couche :
//  • « Ajouter un contour » : chaque picot vide qui touche une perle reçoit la couleur en cours
//    → un anneau d'une perle tout autour du dessin (on peut recommencer pour un 2e anneau) ;
//  • « Retirer le contour » : la couche de perles la plus à l'extérieur s'en va (celles qui touchent
//    un picot vide ou le bord de la plaque) → l'inverse exact d'un ajout.
// Voisins : sur une grille carrée, les 8 autour (diagonales comprises, sinon les coins de l'anneau manquent) ;
// sur une plaque hexagonale ou ronde (rangées décalées), les 6 autour.

function prochesDe(surf) {
  if (surf._proches) return surf._proches;
  const pic = surf.picots, seau = new Map(), cle = (x, y) => Math.floor(x) + ',' + Math.floor(y);
  pic.forEach((q, i) => { const k = cle(q.x, q.y); if (!seau.has(k)) seau.set(k, []); seau.get(k).push(i); });
  surf._proches = pic.map((q, i) => {
    const v = [];
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      for (const j of seau.get(Math.floor(q.x) + dx + ',' + (Math.floor(q.y) + dy)) || []) {
        if (j !== i && Math.hypot(pic[j].x - q.x, pic[j].y - q.y) <= 1.45) v.push(j);
      }
    }
    return v;
  });
  surf._prochesMax = Math.max(...surf._proches.map((v) => v.length));
  return surf._proches;
}

function ajouterContour() {
  const c = P.couleurs[S.couleur];
  if (!c) { message('Choisis d’abord la couleur du contour.'); return; }
  const v = prochesDe(SURF), cibles = [];
  P.cases.forEach((x, i) => { if (x < 0 && v[i].some((j) => P.cases[j] >= 0)) cibles.push(i); });
  if (!cibles.length) { message(P.cases.some((x) => x >= 0) ? 'Il n’y a plus de place autour du dessin.' : 'Dessine d’abord quelque chose à entourer.'); return; }
  memoriser();
  for (const i of cibles) P.cases[i] = S.couleur;
  fini();
  message(`Contour ajouté en ${nomCouleur(c)} : ${cibles.length} perles. « Annuler » l’enlève.`, 4000);
}

function retirerContour() {
  const v = prochesDe(SURF), max = SURF._prochesMax, cibles = [];
  P.cases.forEach((x, i) => { if (x >= 0 && (v[i].length < max || v[i].some((j) => P.cases[j] < 0))) cibles.push(i); });
  if (!cibles.length) { message('Il n’y a aucune perle à retirer.'); return; }
  memoriser();
  for (const i of cibles) P.cases[i] = -1;
  fini();
  message(`Contour retiré : ${cibles.length} perles. « Annuler » les remet.`, 4000);
}

actions.contourPlus = ajouterContour;
actions.contourMoins = retirerContour;
