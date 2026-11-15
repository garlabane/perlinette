'use strict';
// « À propos » : qui a fait Perlinette, et pourquoi elle est gratuite (texte de Sophie, en français et en anglais).
// Ouvert depuis le menu Fichier et le bas de l'écran d'accueil.

const APROPOS = {
  fr: `<h3>Bonjour, moi c’est Sophie 👋</h3>
    <p>J’habite dans le sud de la France, j’ai deux enfants, et j’adore créer de mes mains.</p>
    <p>Les perles à repasser, c’est une de nos activités préférées : on choisit un modèle, on pose les perles une à une… et il y a toujours ce petit moment magique quand on soulève le papier après le coup de fer.</p>
    <p>Mais je ne trouvais pas d’outil simple pour préparer nos motifs et les imprimer à la bonne taille. Alors j’ai créé <b>Perlinette</b> : d’abord pour nous, puis pour vous.</p>
    <p><b>Perlinette est gratuite, sans publicité et sans compte, et elle le restera.</b> Créer, ça doit rester un plaisir à partager.</p>
    <p>Si elle te plaît, montre-moi tes créations ! Et si tu as envie de participer, tu peux m’offrir un café ☕ : il m’aide à payer les abonnements qui me servent à la créer et à la tenir à jour. Merci 🧡</p>`,
  en: `<h3>Hi, I’m Sophie 👋</h3>
    <p>I live in the south of France, I have two children, and I love making things with my hands.</p>
    <p>Fuse beads are one of our favorite activities: we pick a pattern, place the beads one by one… and there’s always that little magic moment when you lift the paper after ironing.</p>
    <p>But I couldn’t find a simple tool to prepare our designs and print them at the right size. So I made <b>Perlinette</b>: first for us, then for you.</p>
    <p><b>Perlinette is free, with no ads and no account, and it will stay that way.</b> Making things should be a joy to share.</p>
    <p>If you like it, show me your creations! And if you’d like to chip in, you can buy me a coffee ☕: it helps pay for the subscriptions I use to build it and keep it up to date. Thank you 🧡</p>`,
};

function ouvrirAPropos() {
  let dlg = $('#dlgAPropos');
  if (!dlg) { dlg = document.createElement('dialog'); dlg.id = 'dlgAPropos'; dlg.className = 'apropos'; document.body.appendChild(dlg); }
  dlg.innerHTML = `<form method="dialog" translate="no">
    <div class="apropos-texte">${APROPOS[LANGUE] || APROPOS.fr}</div>
    <menu>
      <button value="ok">${LANGUE === 'en' ? 'Close' : 'Fermer'}</button>
      <a class="bouton-cafe" href="https://buymeacoffee.com/garlabane" target="_blank" rel="noopener">☕ ${LANGUE === 'en' ? 'Buy me a coffee' : 'M’offrir un café'}</a>
    </menu></form>`;
  dlg.showModal();
}
actions.aPropos = ouvrirAPropos;
