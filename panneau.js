'use strict';
// Panneau de droite (ordinateur, et tiroir Réglages de la tablette), réorganisé selon l'usage :
//  • en haut, la couleur en cours, en grand (nom, référence, nombre de perles, « remplacer partout ») ;
//  • au centre, « Couleurs du motif » : « + » ouvre la palette en éventail, « ⋯ » trie, ouvre le nuancier,
//    retire les couleurs inutilisées ;
//  • en bas, ce qu'on regarde de temps en temps : la soudure, la plaque, l'aperçu du repassage.
// Sur téléphone (bande des couleurs), rien ne change : ces ajouts y sont masqués par le style.

(function construirePanneau() {
  const sec = $('.couleurs-section');
  if (!sec || $('#coulEnCours')) return;
  // la couleur en cours
  sec.insertAdjacentHTML('afterbegin', '<div class="coul-encours" id="coulEnCours"></div>');
  // l'en-tête de la liste : titre + « + » + « ⋯ »
  const h2 = sec.querySelector('h2');
  const tete = document.createElement('div');
  tete.className = 'coul-entete';
  h2.replaceWith(tete);
  tete.appendChild(h2);
  tete.insertAdjacentHTML('beforeend', `<button type="button" class="coul-ajout a-options" data-options="couleurs" title="Ajouter une couleur">${svgIco('ajout')}</button>`
    + `<button type="button" class="coul-plus a-options" data-options="couleursPlus" title="Trier, nuancier, mes perles…">${svgIco('plus')}</button>`);
  h2.firstChild.nodeValue = 'Couleurs du motif ';
})();

function majCouleurEnCours() {
  const el = $('#coulEnCours'), c = P?.couleurs?.[S.couleur];
  if (!el) return;
  if (!c) { el.innerHTML = '<span class="note">Choisis une couleur dans la liste.</span>'; return; }
  const n = P.cases.filter((v) => v === S.couleur).length;
  el.innerHTML = `<span class="coul-encours-perle" style="background:${c.hex}"></span>
    <span class="coul-encours-texte"><b>${echap(nomCouleur(c))}</b><small>${echap(marqueDe(c))} ${echap(c.code || '')} · ${n} perle${n > 1 ? 's' : ''}</small></span>
    <button type="button" class="coul-remplacer" title="Remplacer cette couleur partout (outil Remplacer)">⇄</button>`;
  el.querySelector('.coul-remplacer').onclick = () => choisirOutil('remplacer');
}
// après chaque mise à jour de la liste des couleurs
if (typeof majCouleurs === 'function') {
  const majCouleursDOrigine = majCouleurs;
  majCouleurs = function () { majCouleursDOrigine(); majCouleurEnCours(); };
}

// « ⋯ » : trier, nuancier, couleurs inutilisées
const contenuOptionsBase = contenuOptions;
contenuOptions = function (type) {
  if (type !== 'couleursPlus') return contenuOptionsBase(type);
  const tri = reglages.tri || 'ref';
  return `<div class="bulle-titre">Classer par</div>`
    + Object.entries(TRIS).map(([k, v]) => ligneBulle(`data-tri="${k}"`, '', v, k === tri)).join('')
    + '<div class="bulle-sep"></div>'
    + ligneBulle('data-action="couleurs"', svgIco('reglages'), 'Nuancier, mes perles…')
    + ligneBulle('data-action="purger"', svgIco('plus'), 'Retirer les couleurs inutilisées');
};
document.addEventListener('click', (e) => {
  const b = e.target.closest && e.target.closest('.bulle-options [data-tri]');
  if (!b) return;
  reglages.tri = b.dataset.tri; ecrire(CLE.reglages, reglages);
  const sel = $('#triCouleurs'); if (sel) sel.value = reglages.tri;
  majCouleurs();
});
majCouleurEnCours();
