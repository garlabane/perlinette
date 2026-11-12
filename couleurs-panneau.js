'use strict';
// Un seul endroit pour les couleurs : bouton « Couleurs » (barre du haut et panneau de droite).
//  • nuancier du motif : convertir le motif vers une marque, ou vers « Mes perles » ;
//  • ajouter une couleur, garder seulement les utilisées ;
//  • gérer « Mes perles » ;
//  • couleurs des lettres (jeux et contour) quand le motif vient de « Écrire une phrase ».

function couleursDuNuancier(id) {
  if (id === 'biblio') return couleursBiblio().map(({ code, nom, nomOfficiel, hex, marque }) => ({ code, nom, nomOfficiel, hex, marque }));
  const p = paletteParId(id);
  return p ? p.couleurs.map((c) => ({ ...c, marque: nomCourt(p) })) : [];
}
function nomDuNuancier(id) {
  if (id === 'biblio') return 'Mes perles';
  return paletteParId(id) ? nomCourt(paletteParId(id)) : 'Hama Midi (5 mm)';
}

// L'outil « Couleur lettre » et les jeux respectent le nuancier du motif : une référence Hama
// est remplacée par la couleur la plus proche du nuancier choisi.
const _codeVersIndiceHama = codeVersIndice;
codeVersIndice = function (code) {
  const id = P.nuancier || 'hama-midi';
  if (id === 'hama-midi') return _codeVersIndiceHama(code);
  const cible = couleursDuNuancier(id);
  if (!cible.length) return _codeVersIndiceHama(code);
  const hex = paletteParId('hama-midi').couleurs.find((c) => c.code === code)?.hex || '#888888';
  const labs = cible.map((c) => rgbLab(hexRgb(c.hex)));
  const c = cible[plusProche(rgbLab(hexRgb(hex)), labs, [...labs.keys()])];
  let k = P.couleurs.findIndex((x) => x.code === c.code && x.hex === c.hex);
  if (k < 0) { P.couleurs.push({ ...c }); k = P.couleurs.length - 1; }
  return k;
};

function ouvrirCouleurs() {
  const dlg = document.createElement('dialog');
  dlg.className = 'large';
  const nbBiblio = couleursBiblio().length;
  const actuel = P.nuancier || 'hama-midi';
  dlg.innerHTML = `<form method="dialog">
    <h3>Couleurs</h3>
    <section class="bloc">
      <h4>Nuancier du motif</h4>
      <p class="note">Actuellement : <b>${echap(nomDuNuancier(actuel))}</b>. Convertir = chaque couleur reçoit la perle la plus proche du nuancier choisi ; un tableau te laisse changer une ligne avant d’appliquer (« Annuler » reste possible).</p>
      <div class="nu-outils">
        <select id="cpNuancier">
          <option value="biblio" ${nbBiblio ? '' : 'disabled'}>Mes perles (${nbBiblio} couleurs)</option>
          ${PALETTES_FUSIBLES.map((p) => `<option value="${p.id}">${echap(p.nom)}</option>`).join('')}
        </select>
        <button type="button" id="cpConvertir" class="principal">Convertir le motif</button>
      </div>
    </section>
    <section class="bloc">
      <h4>Couleurs du motif</h4>
      <div class="nu-outils">
        <button type="button" id="cpAjouter">+ Ajouter une couleur</button>
        <button type="button" id="cpPurger">Garder seulement les couleurs utilisées</button>
      </div>
    </section>
    <section class="bloc">
      <h4>Mes perles</h4>
      <p class="note">Les couleurs que tu as chez toi${nbBiblio ? ` : ${nbBiblio} pour l'instant` : ' : la liste est vide pour l’instant'}. Elles servent à l'import d'image, à « + Couleur » et à l'alerte de stock.</p>
      <div class="nu-outils"><button type="button" id="cpBiblio">Gérer mes perles…</button></div>
    </section>
    ${Array.isArray(P.lettres) && P.lettres.length ? `<section class="bloc">
      <h4>Lettres</h4>
      <p class="note">Jeux de couleurs prédéfinis et contour. Pour une seule lettre : outil « Couleur lettre », puis clic sur la lettre.</p>
      <div class="nu-outils"><button type="button" id="cpLettres">Couleurs des lettres…</button></div>
    </section>` : ''}
    <menu><button value="fermer" class="principal">Fermer</button></menu></form>`;
  document.body.appendChild(dlg);
  const sel = dlg.querySelector('#cpNuancier');
  sel.value = actuel === 'biblio' && !nbBiblio ? 'hama-midi' : actuel;
  // conversion : tableau « couleur du motif → perle », modifiable avant d'appliquer (adapter-perles.js)
  dlg.querySelector('#cpConvertir').onclick = () => {
    const id = sel.value;
    if (!couleursDuNuancier(id).length) { message('Ce nuancier est vide.'); return; }
    dlg.close();
    adapterMotifOuvert(id, `Convertir en « ${nomDuNuancier(id)} »`);
  };
  dlg.querySelector('#cpAjouter').onclick = () => { dlg.close(); ouvrirAjoutCouleur(); };
  dlg.querySelector('#cpPurger').onclick = () => { purgerCouleurs(); };
  dlg.querySelector('#cpBiblio').onclick = () => { dlg.close(); ouvrirBibliotheque(); };
  dlg.querySelector('#cpLettres')?.addEventListener('click', () => { dlg.close(); ouvrirCouleurLettre(-1); });
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
}
