'use strict';
// En-tête de la version ordinateur : 13 boutons ne tenaient pas sur un portable (1366 à 1680 px de large :
// Imprimer et Partager sortaient de l'écran). Sur grand écran, on les regroupe donc en menus, comme les
// logiciels de dessin :  Fichier ▾ · Modèles · Créer ▾ · Mon motif ▾ · Poser mes perles.
// Les boutons d'origine restent dans le menu ☰ (téléphone, tablette, petit portable), où ils sont en liste.

function menuDeroulant(id, titre, actions) {
  const div = document.createElement('div');
  div.className = 'menu menu-bureau'; div.id = id;
  div.innerHTML = `<button type="button" class="ouvre-menu" aria-haspopup="true" aria-expanded="false">${titre} ▾</button><div class="menu-liste" hidden></div>`;
  const liste = div.querySelector('.menu-liste');
  for (const a of actions) {
    const b = document.querySelector(`.barre nav > [data-action="${a}"]`);
    if (!b) continue;
    const c = b.cloneNode(true);
    c.removeAttribute('data-g');
    // dans la liste, l'explication s'affiche en clair sous le libellé (pas seulement au survol)
    if (b.title) { c.innerHTML = `${b.innerHTML}<small class="menu-aide">${echap(b.title)}</small>`; c.removeAttribute('title'); }
    liste.appendChild(c);
  }
  return div;
}
function fermerMenusBureau(sauf) {
  document.querySelectorAll('.menu-bureau').forEach((m) => {
    if (m === sauf) return;
    m.querySelector('.menu-liste').hidden = true;
    m.querySelector('.ouvre-menu').setAttribute('aria-expanded', 'false');
  });
}
// la hauteur de l'en-tête, pour placer la barre de zoom dans la rangée des onglets (styles.css)
function majHautBarre() { const b = document.querySelector('.barre'); if (b) document.documentElement.style.setProperty('--haut-barre', b.offsetHeight + 'px'); }
window.addEventListener('resize', majHautBarre);
setTimeout(majHautBarre, 0);

(function construireEnteteBureau() {
  const nav = document.querySelector('.barre nav');
  if (!nav || $('#menuCreer')) return;
  const modeles = nav.querySelector(':scope > [data-action="modeles"]');
  modeles.after(menuDeroulant('menuCreer', 'Créer', ['mot', 'image', 'imageAjout', 'motAjout']));
  const couleurs = nav.querySelector(':scope > [data-action="couleurs"]');
  couleurs.after(menuDeroulant('menuMonMotif', 'Mon motif', ['plaque', 'couleurs']));
  nav.addEventListener('click', (e) => {
    const o = e.target.closest('.ouvre-menu');
    if (o) {
      const m = o.closest('.menu-bureau'), l = m.querySelector('.menu-liste');
      e.stopPropagation();
      fermerMenusBureau(m);
      if (typeof fermerMenu === 'function') fermerMenu();     // le menu Fichier
      l.hidden = !l.hidden; o.setAttribute('aria-expanded', String(!l.hidden));
      return;
    }
    if (e.target.closest('.menu-bureau [data-action]')) setTimeout(() => fermerMenusBureau(), 0);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest || !e.target.closest('.menu-bureau')) fermerMenusBureau(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerMenusBureau(); });
  // ouvrir Fichier ferme les autres menus
  $('#btnFichier')?.addEventListener('click', () => fermerMenusBureau());
})();
