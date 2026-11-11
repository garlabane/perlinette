'use strict';
// Interface : menu Fichier, options des formes (plein / évidé), bouton Symboles, aperçu du
// repassage en boutons, couleur active et aide. Chargé après app.js, couleurs.js et fusion.js.

// ---------- menu Fichier ----------
const btnFichier = $('#btnFichier'), menuFichier = $('#menuFichier');
function fermerMenu() { menuFichier.hidden = true; btnFichier.setAttribute('aria-expanded', 'false'); }
btnFichier.onclick = (e) => {
  e.stopPropagation();
  menuFichier.hidden = !menuFichier.hidden;
  btnFichier.setAttribute('aria-expanded', String(!menuFichier.hidden));
};
document.addEventListener('click', (e) => { if (!e.target.closest('.menu')) fermerMenu(); });
menuFichier.addEventListener('click', (e) => { if (e.target.closest('[data-action]')) fermerMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenu(); });

// ---------- formes : plein ou évidé (visible seulement avec un outil de forme) ----------
function majOptionsForme() {
  $('#optionsForme').hidden = !FORMES.includes(S.outil);
  $$('#optionsForme [data-plein]').forEach((b) => b.classList.toggle('actif', (b.dataset.plein === '1') === $('#optPlein').checked));
}
$$('#optionsForme [data-plein]').forEach((b) => (b.onclick = () => { $('#optPlein').checked = b.dataset.plein === '1'; majOptionsForme(); }));
document.addEventListener('click', (e) => { if (e.target.closest('[data-outil]')) majOptionsForme(); });
document.addEventListener('keyup', majOptionsForme);

// ---------- Symboles (barre de zoom) ----------
function majSymboles() { $('#btnSymboles').classList.toggle('actif', $('#optSymboles').checked); }
$('#btnSymboles').onclick = () => { const c = $('#optSymboles'); c.checked = !c.checked; c.dispatchEvent(new Event('change')); majSymboles(); };

// ---------- aperçu du repassage : 4 boutons ----------
function majSegmentFusion() { $$('#segFusion [data-fusion]').forEach((b) => b.classList.toggle('actif', b.dataset.fusion === String(reglages.fusion || 0))); }
$$('#segFusion [data-fusion]').forEach((b) => (b.onclick = () => {
  const s = $('#fusion'); s.value = b.dataset.fusion; s.dispatchEvent(new Event('change')); majSegmentFusion();
}));

// ---------- couleur en cours (en haut de la colonne d'outils) ----------
function majCouleurActive() {
  const el = $('#couleurActive'), c = P?.couleurs?.[S.couleur];
  if (!el) return;
  el.innerHTML = c
    ? `<span class="pastille-grande" style="background:${c.hex}"></span><b>${echap(c.code || '')}</b><small>${echap(c.nom)}</small>`
    : '<small>Aucune couleur</small>';
}

// ---------- aide ----------
function afficherAide() {
  avertir([
    'DESSINER',
    '• Clic gauche : poser une perle. Clic droit : effacer.',
    '• Ligne, Rectangle, Cercle : cliquer le départ puis l\'arrivée (ou glisser). Maj = carré / cercle parfait. Échap = annuler la forme.',
    '',
    'SÉLECTION (S)',
    '• Cliquer un coin puis l\'autre (ou glisser) pour choisir une zone.',
    '• Ctrl+C copier · Ctrl+X couper · Ctrl+V coller (l\'aperçu suit la souris, un clic pose) · Suppr effacer · Ctrl+A tout.',
    '• ↔ ↕ retournent la copie avant de la coller. On peut coller dans un autre motif.',
    '',
    'ZOOM',
    '• Ctrl + molette (zoome là où est la souris), touches + et −, 0 = voir toute la plaque.',
    '',
    'RACCOURCIS',
    '• C crayon · E gomme · F remplir · I pipette · R remplacer · L ligne · Q rectangle · O cercle · S sélection',
    '• Ctrl+Z annuler · Ctrl+Y refaire · Ctrl+S enregistrer',
    '',
    'ASTUCES',
    '• Clique sur le nom du motif (en haut) pour le renommer.',
    '• « Exporter un fichier » (menu Fichier) = ta vraie sauvegarde.',
    '• Imprimer : choisir « Taille réelle / 100 % ».',
  ].join('\n'));
}

// état initial (après le démarrage du motif)
setTimeout(() => { majOptionsForme(); majSymboles(); majSegmentFusion(); majCouleurActive(); }, 0);

// ---------- mode enfant : version simplifiée (crayon, gomme, remplir, annuler, grosses pastilles) ----------
function appliquerModeEnfant(oui) {
  document.body.classList.toggle('enfant', oui);
  $('#btnEnfant').textContent = oui ? '↩ Quitter le mode enfant' : '🧒 Mode enfant';
  reglages.enfant = oui; ecrire(CLE.reglages, reglages);
  if (oui && !['crayon', 'gomme', 'remplir'].includes(S.outil)) choisirOutil('crayon');
  setTimeout(() => { zoomAjuster(); majCouleurs(); }, 0);
}
$('#btnEnfant').onclick = async () => {
  if (!reglages.enfant) { appliquerModeEnfant(true); return; }
  if (await confirmer('Quitter le mode enfant et revenir à toutes les fonctions ?', 'Quitter')) appliquerModeEnfant(false);
};
setTimeout(() => { if (reglages.enfant) appliquerModeEnfant(true); }, 0);
