'use strict';
// Écran d'accueil : « Que veux-tu faire ? », avec quatre grands choix.
//  • il s'ouvre au démarrage quand le motif ouvert est encore vide ;
//  • on le retrouve en touchant le logo « Perlinette ».
// Sur un téléphone, c'est le chemin le plus court vers un modèle, une photo ou un prénom.

const ACCUEIL_CHOIX = [
  { id: 'modeles', icone: '🧩', titre: 'Choisir un modèle', texte: 'Plus de 500 motifs prêts à repasser' },
  { id: 'image', icone: '📷', titre: 'Transformer une image', texte: 'Une photo ou un dessin devient un motif' },
  { id: 'mot', icone: '🔤', titre: 'Écrire un prénom', texte: 'Des lettres épaisses, sur le moins de plaques possible' },
  { id: 'dessiner', icone: '🎨', titre: 'Dessiner', texte: 'Perle par perle, sur une plaque vide' },
];

// installer Perlinette sur l'écran d'accueil (proposé par le navigateur quand c'est possible)
let INVITE_INSTALLER = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); INVITE_INSTALLER = e; });
window.addEventListener('appinstalled', () => { INVITE_INSTALLER = null; });
function dejaInstallee() { return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
function surIos() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }

function ouvrirAccueil() {
  let dlg = $('#dlgAccueil');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'dlgAccueil'; dlg.className = 'accueil';
    document.body.appendChild(dlg);
  }
  if (dlg.open) return;
  const nbMotifs = Object.values(lire(CLE.projets, {})).filter((m) => Array.isArray(m.cases) && m.cases.some((v) => v >= 0)).length;
  dlg.innerHTML = `<form method="dialog">
    <h3>Que veux-tu faire ?</h3>
    <div class="accueil-choix">${ACCUEIL_CHOIX.map((c) => `<button type="button" data-choix="${c.id}">
      <span class="accueil-icone" aria-hidden="true">${c.icone}</span><span class="accueil-texte"><b>${echap(c.titre)}</b><small>${echap(c.texte)}</small></span></button>`).join('')}</div>
    ${nbMotifs ? `<button type="button" class="accueil-reprendre" data-choix="ouvrir">📂 Reprendre un de mes motifs <small>(${nbMotifs})</small></button>` : ''}
    ${INVITE_INSTALLER ? '<button type="button" class="accueil-reprendre" id="accueilInstaller">📲 Installer Perlinette sur cet appareil <small>(icône, plein écran, sans Internet)</small></button>' : ''}
    ${!INVITE_INSTALLER && typeof EN_LIGNE !== 'undefined' && EN_LIGNE && surIos() && !dejaInstallee() ? '<p class="note">📲 Pour l’avoir comme une appli : touche « Partager », puis « Sur l’écran d’accueil ».</p>' : ''}
    <p class="note">${typeof EN_LIGNE !== 'undefined' && EN_LIGNE
      ? 'Tes motifs sont enregistrés tout seuls dans ce navigateur, sur cet appareil : rien n’est envoyé sur Internet. Pense à les exporter de temps en temps (menu Fichier).'
      : 'Tes motifs sont enregistrés tout seuls. Tu retrouves cet écran en touchant le logo Perlinette.'}</p>
  </form>`;
  dlg.querySelectorAll('[data-choix]').forEach((b) => (b.onclick = () => {
    const choix = b.dataset.choix;
    dlg.close();
    if (choix === 'dessiner') { commencerADessiner(); return; }
    if (actions[choix]) actions[choix]();
  }));
  const installer = dlg.querySelector('#accueilInstaller');
  if (installer) installer.onclick = async () => { const inv = INVITE_INSTALLER; INVITE_INSTALLER = null; installer.remove(); try { await inv.prompt(); } catch (e) { /* refusé */ } };
  // le rappel « pense à exporter » de la version en ligne est dit ici : inutile de le redire après
  if (typeof EN_LIGNE !== 'undefined' && EN_LIGNE) { const m = lire(CLE_MAJ, {}); if (!m.rappelWeb) ecrire(CLE_MAJ, { ...m, rappelWeb: Date.now() }); }
  dlg.showModal();
}

// « Dessiner » : sur petit écran, on agrandit pour que le doigt vise bien une perle
function commencerADessiner() {
  choisirOutil('crayon');
  if (!window.matchMedia('(max-width: 900px)').matches) return;
  zoomA(18);
  const zone = $('#zone');
  zone.scrollLeft = (zone.scrollWidth - zone.clientWidth) / 2;
  zone.scrollTop = Math.max(0, (zone.scrollHeight - zone.clientHeight) / 2);
  message('Un doigt pour poser les perles. Deux doigts pour agrandir et déplacer.', 5000);
}

document.querySelector('.barre .marque').addEventListener('click', ouvrirAccueil);
document.querySelector('.barre .marque').style.cursor = 'pointer';
document.querySelector('.barre .marque').title = 'Accueil : modèles, image, prénom, dessin';

// au démarrage : seulement si le motif ouvert est vide
setTimeout(() => {
  if (typeof P === 'undefined' || !P || P.cases.some((v) => v >= 0)) return;
  if (reglages.enfant) return; // le mode enfant garde son écran tout simple
  if ([...document.querySelectorAll('dialog')].some((d) => d.open)) return;
  ouvrirAccueil();
}, 150);
