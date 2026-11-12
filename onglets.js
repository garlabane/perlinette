'use strict';
// Onglets : plusieurs motifs ouverts en même temps, comme dans un traitement de texte.
//  • « Nouveau motif », un modèle, une phrase, « Ouvrir »… ouvrent un onglet de plus :
//    le motif précédent reste ouvert à côté, et il est enregistré avant de changer ;
//  • chaque onglet garde son « Annuler / Refaire » tant que la page est ouverte ;
//  • fermer un onglet ne supprime rien : le motif reste dans Fichier › Ouvrir.

const CLE_ONGLETS = 'perlesrep.onglets';
let ONGLETS = lire(CLE_ONGLETS, []);
const HISTO = new Map(); // id → { annuler, refaire } (en mémoire seulement)

function sauverOnglets() { ecrire(CLE_ONGLETS, ONGLETS); }

// charger() ouvre maintenant le motif dans un onglet, sans rien perdre de celui d'avant
const _chargerSansOnglet = charger;
charger = function (m) {
  if (P && P.id !== m.id) {
    clearTimeout(minuterie);
    sauverMaintenant(); // les dernières retouches du motif quitté sont enregistrées
    HISTO.set(P.id, { annuler: S.annuler, refaire: S.refaire });
  }
  _chargerSansOnglet(m);
  const h = HISTO.get(P.id);
  if (h) { S.annuler = h.annuler; S.refaire = h.refaire; }
  if (!ONGLETS.includes(P.id)) { ONGLETS.push(P.id); sauverOnglets(); }
  dessinerOnglets();
};

// les noms des onglets suivent les renommages
const _finiSansOnglet = fini;
fini = function () { _finiSansOnglet(); dessinerOnglets(); };

function fermerOnglet(id) {
  const k = ONGLETS.indexOf(id);
  if (k < 0) return;
  if (id === P.id) { clearTimeout(minuterie); sauverMaintenant(); }
  ONGLETS.splice(k, 1); sauverOnglets(); HISTO.delete(id);
  if (id === P.id) {
    const projets = lire(CLE.projets, {}), suivant = ONGLETS[Math.min(k, ONGLETS.length - 1)];
    if (suivant && projets[suivant]) charger(projets[suivant]);
    else charger(creerMotif('Mon motif', 'midi-carre-grand', {}, 'hama-midi'));
  } else dessinerOnglets();
  message('Onglet fermé. Le motif reste dans Fichier › Ouvrir.', 3000);
}

function dessinerOnglets() {
  const barre = $('#onglets');
  if (!barre || !P) return;
  const projets = lire(CLE.projets, {});
  // un motif supprimé (Fichier › Ouvrir › Supprimer) disparaît des onglets
  const avant = ONGLETS.length;
  ONGLETS = ONGLETS.filter((id) => id === P.id || projets[id]);
  if (ONGLETS.length !== avant) sauverOnglets();
  barre.innerHTML = '';
  for (const id of ONGLETS) {
    const m = id === P.id ? P : projets[id];
    const o = document.createElement('div');
    o.className = 'onglet' + (id === P.id ? ' actif' : '');
    o.setAttribute('role', 'tab'); o.setAttribute('aria-selected', id === P.id);
    o.innerHTML = '<button type="button" class="onglet-nom"></button><button type="button" class="onglet-fermer" title="Fermer l’onglet (le motif reste dans Fichier › Ouvrir)" aria-label="Fermer l’onglet">×</button>';
    const nom = o.querySelector('.onglet-nom');
    nom.textContent = m.nom || 'Motif'; nom.title = m.nom || 'Motif';
    nom.onclick = () => { if (id !== P.id) charger(lire(CLE.projets, {})[id] || m); };
    o.querySelector('.onglet-fermer').onclick = () => fermerOnglet(id);
    barre.appendChild(o);
  }
  const plus = document.createElement('button');
  plus.type = 'button'; plus.className = 'onglet-plus'; plus.textContent = '+'; plus.title = 'Nouveau motif dans un nouvel onglet';
  plus.onclick = () => ouvrirPlaque(true);
  barre.appendChild(plus);
}
