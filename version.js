'use strict';
// Numéro de version et avis de mise à jour.
//  • VERSION est écrit ici, et le même numéro est publié dans docs/version.json (le site) ;
//  • au démarrage, au plus une fois par jour, Perlinette lit ce fichier sur le site : si une
//    version plus récente existe, un bandeau discret le dit (rien n'est téléchargé tout seul) ;
//  • sans Internet, rien ne se passe. Le bandeau se ferme, et ne revient pas pour la même version.

const VERSION = '1.1.0';
const URL_VERSION = 'https://garlabane.github.io/perlinette/version.json';
const URL_TELECHARGER = 'https://github.com/garlabane/perlinette/archive/refs/heads/main.zip';
const CLE_MAJ = 'perlesrep.maj';

// « 1.10.0 » > « 1.9.2 » : on compare nombre par nombre
function versionPlusRecente(a, b) {
  const x = String(a).split('.').map((n) => +n || 0), y = String(b).split('.').map((n) => +n || 0);
  for (let i = 0; i < Math.max(x.length, y.length); i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0); }
  return false;
}

function afficherVersion() {
  const el = $('#versionApp');
  if (el) { el.textContent = 'v' + VERSION; el.title = `Perlinette ${VERSION}`; }
}

function bandeauMaj(info) {
  if ($('#bandeauMaj')) return;
  const b = document.createElement('div');
  b.id = 'bandeauMaj'; b.className = 'bandeau-maj'; b.setAttribute('role', 'status');
  const nouveautes = Array.isArray(info.nouveautes) ? info.nouveautes.slice(0, 6) : [];
  b.innerHTML = `<span>✨ <b>Perlinette ${echap(info.version)}</b> est disponible (tu as la ${echap(VERSION)}).</span>
    ${nouveautes.length ? '<button type="button" class="maj-voir">Voir les nouveautés</button>' : ''}
    <a class="maj-dl" href="${URL_TELECHARGER}" target="_blank" rel="noopener">Télécharger</a>
    <button type="button" class="maj-fermer" aria-label="Fermer">×</button>`;
  b.querySelector('.maj-fermer').onclick = () => {
    const m = lire(CLE_MAJ, {}); m.ignoree = info.version; ecrire(CLE_MAJ, m); b.remove();
  };
  b.querySelector('.maj-voir')?.addEventListener('click', () => avertir(
    [`Nouveautés de la version ${info.version} :`, '', ...nouveautes.map((n) => '• ' + n), '',
      'Pour mettre à jour : télécharge le fichier, décompresse-le à la place de l’ancien dossier Perlinette, puis rouvre Perlinette.bat. Tes motifs et « Mes perles » restent dans le navigateur.'].join('\n')));
  document.body.appendChild(b);
}

async function verifierMaj(forcer = false) {
  const m = lire(CLE_MAJ, {}), maintenant = Date.now();
  if (!forcer && m.verifie && maintenant - m.verifie < 24 * 3600 * 1000) {
    if (m.derniere && versionPlusRecente(m.derniere.version, VERSION) && m.ignoree !== m.derniere.version) bandeauMaj(m.derniere);
    return null;
  }
  try {
    const r = await fetch(URL_VERSION + '?t=' + maintenant, { cache: 'no-store' });
    if (!r.ok) return null;
    const info = await r.json();
    ecrire(CLE_MAJ, { ...m, verifie: maintenant, derniere: info });
    if (versionPlusRecente(info.version, VERSION) && (forcer || m.ignoree !== info.version)) bandeauMaj(info);
    return info;
  } catch (e) { return null; } // pas d'Internet : on réessaiera une autre fois
}

afficherVersion();
setTimeout(() => verifierMaj(), 1500);
