'use strict';
// Partager : envoyer l'image du motif, ou son fichier, par le menu de partage de l'appareil
// (message, mail, AirDrop, imprimante…). Sans menu de partage (ordinateur), le fichier est
// simplement téléchargé, comme avant.

// ---------- la signature : qu'on reconnaisse Perlinette partout où un motif est partagé ----------
const MOT_DIESE = '#perlinetteapp';
const ADRESSE_SITE = 'garlabane.github.io/perlinette';
function auteurPartage() { return (reglages.auteur || '').trim(); }
// une ligne à ajouter au bas des textes partagés (listes, messages)
function signatureTexte() {
  const au = auteurPartage();
  return (LANGUE === 'en'
    ? `\n\n${au ? 'Created by ' + au + ' · ' : ''}Made with Perlinette ✨ ${ADRESSE_SITE} ${MOT_DIESE}`
    : `\n\n${au ? 'Créé par ' + au + ' · ' : ''}Fait avec Perlinette ✨ ${ADRESSE_SITE} ${MOT_DIESE}`);
}
// l'image + un bandeau au bas : logo Perlinette, adresse, auteur et #perlinetteapp
async function signerImage(src) {
  const w = src.width, H = Math.round(Math.min(130, Math.max(64, w * 0.1)));
  const c = document.createElement('canvas'); c.width = w; c.height = src.height + H;
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, src.height); g.drawImage(src, 0, 0);
  g.fillStyle = '#faf6f0'; g.fillRect(0, src.height, w, H);
  g.fillStyle = '#e9d9c3'; g.fillRect(0, src.height, w, Math.max(2, H * 0.03));
  const pad = H * 0.3, k = H / 24, taille = H * 0.36, lw = 15 * k + taille * 5, lh = 13 * k;
  try {
    const logo = await igSvgImage(pinLogo(0, 0, k, '#6e2f5c', taille), Math.ceil(lw), Math.ceil(lh));
    g.drawImage(logo, pad, src.height + (H - lh) / 2 + H * 0.02);
  } catch (e) { /* sans logo : le texte suffit */ }
  // à droite : l'adresse, puis l'auteur et le mot-dièse (rétrécis si la place manque)
  const au = auteurPartage(), place = w - lw - pad * 3;
  const l1 = ADRESSE_SITE, l2 = `${au ? (LANGUE === 'en' ? 'by ' : 'par ') + au + '  ·  ' : ''}${MOT_DIESE}`;
  let f1 = H * 0.24, f2 = H * 0.21;
  const police = (px, gras) => `${gras ? 700 : 500} ${px}px "Segoe UI", Inter, system-ui, sans-serif`;
  g.font = police(f1, true); const m1 = g.measureText(l1).width;
  g.font = police(f2, false); const m2 = g.measureText(l2).width;
  const r = Math.min(1, place / Math.max(m1, m2, 1)); f1 *= r; f2 *= r;
  g.textAlign = 'right'; g.textBaseline = 'alphabetic';
  if (f1 >= 9) {
    g.fillStyle = '#6e2f5c'; g.font = police(f1, true); g.fillText(l1, w - pad, src.height + H * 0.47);
    g.fillStyle = '#8a7380'; g.font = police(f2, false); g.fillText(l2, w - pad, src.height + H * 0.8);
  }
  return c;
}

async function partagerFichiers(fichiers, titre) {
  try {
    if (navigator.canShare && navigator.canShare({ files: fichiers })) {
      const avecTexte = { files: fichiers, title: titre, text: signatureTexte().trim() };
      await navigator.share(navigator.canShare(avecTexte) ? avecTexte : { files: fichiers, title: titre });
      return true;
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return true; // partage refermé par la personne : rien à faire
  }
  return false;
}

// l'image : le motif tel qu'il est affiché
async function partagerImage() {
  sauverMaintenant();
  const blob = await new Promise(async (r) => (await signerImage(toile)).toBlob(r, 'image/png'));
  if (!blob) { avertir('Impossible de créer l’image.'); return; }
  const fichier = new File([blob], nomFichier('.png'), { type: 'image/png' });
  if (await partagerFichiers([fichier], P.nom)) return;
  telecharger(fichier.name, blob);
  message('Image enregistrée dans Téléchargements.');
}

// le fichier du motif : pour le rouvrir dans Perlinette sur un autre appareil (Fichier › Importer)
async function partagerMotif() {
  sauverMaintenant();
  const f = formatParId(P.format), contenu = { ...P, plaquePerso: f.type === 'perso' ? f : undefined };
  const texte = JSON.stringify(contenu);
  // certains téléphones ne partagent que les types de fichiers courants : on l'envoie comme du texte
  const fichier = new File([texte], nomFichier('.perlinette.json'), { type: 'application/json' });
  if (await partagerFichiers([fichier], P.nom)) return;
  const secours = new File([texte], nomFichier('.perlinette.txt'), { type: 'text/plain' });
  if (await partagerFichiers([secours], P.nom)) return;
  exporterFichier();
}

// la liste des perles du motif, en texte : à garder sous la main au magasin
function listeDesPerles() {
  const nb = new Array(P.couleurs.length).fill(0);
  for (const v of P.cases) if (v >= 0) nb[v]++;
  const lignes = P.couleurs.map((c, i) => ({ c, n: nb[i] })).filter((l) => l.n > 0).sort((a, b) => b.n - a.n);
  const total = lignes.reduce((t, l) => t + l.n, 0);
  let manque = 0;
  const texte = lignes.map(({ c, n }) => {
    const stock = typeof stockDe === 'function' ? stockDe(c) : null;
    let fin = '';
    if (stock !== null && stock !== undefined) {
      if (stock < n) { manque++; fin = ` — j'en ai ${stock}, il en manque ${n - stock}`; } else fin = ` — j'en ai ${stock}`;
    }
    return `${n} × ${nomCouleur(c)}${c.code ? ' (' + c.code + ')' : ''}${fin}`;
  });
  return { texte: t([`${P.nom} — ${total} perles, ${lignes.length} couleurs`, '', ...texte].join('\n')), nbCouleurs: lignes.length, manque };
}
async function partagerListe() {
  if (!P.cases.some((v) => v >= 0)) { avertir('Ce motif est encore vide.'); return; }
  const liste = listeDesPerles();
  try {
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: P.nom, text: liste.texte + signatureTexte() }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  let copie = false;
  try { await navigator.clipboard.writeText(liste.texte + signatureTexte()); copie = true; } catch (e) { /* presse-papiers refusé */ }
  avertir((copie ? 'Liste copiée : tu peux la coller dans un message ou une note.\n\n' : '') + liste.texte);
}

// Tout ce qui se partage, au même endroit, en gros boutons (pratique au doigt)
function ouvrirPartage() {
  const dlg = document.createElement('dialog');
  dlg.className = 'partage';
  const l = [
    ['imprimer', '🖨️', 'Imprimer ou PDF', 'Le patron à taille réelle, avec la légende'],
    ['instagram', '📸', 'Instagram', 'Un carrousel de 5 images et son texte'],
    ['pinterest', '📌', 'Pinterest', 'Une épingle prête à publier'],
    ['partagerImage', '🖼️', 'Image du motif', 'Par message, mail… ou l’enregistrer'],
    ['courses', '🛒', 'Liste de courses', 'Sachets à acheter et prix'],
    ['partagerListe', '📋', 'Liste des perles', 'Le nombre de perles par couleur'],
    ['partagerLien', '🔗', 'Lien du motif', 'Un lien qui rouvre ce motif dans Perlinette'],
    ['partagerMotif', '✉️', 'Envoyer le fichier du motif', 'Pour l’importer dans Perlinette ailleurs'],
  ];
  dlg.innerHTML = `<form method="dialog"><h3>Imprimer et partager</h3>
    <label class="partage-auteur">Créé par <small>(facultatif : ton prénom, ton compte Instagram ou Pinterest…)</small>
      <input id="ptAuteur" maxlength="40" placeholder="@mon.compte" autocomplete="nickname"></label><div class="partage-liste">${l.map(([a, i, t, d]) => `<button type="button" data-partage="${a}"><i>${i}</i><b>${t}</b><small>${d}</small></button>`).join('')}</div><menu><button value="fermer">Fermer</button></menu></form>`;
  document.body.appendChild(dlg);
  const au = dlg.querySelector('#ptAuteur');
  au.value = reglages.auteur || '';
  au.onchange = au.oninput = () => { reglages.auteur = au.value.trim().slice(0, 40); ecrire(CLE.reglages, reglages); };
  dlg.querySelectorAll('[data-partage]').forEach((b) => (b.onclick = () => { dlg.close(); actions[b.dataset.partage](); }));
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
}
actions.partager = ouvrirPartage;
actions.partagerImage = partagerImage;
actions.partagerListe = partagerListe;
actions.partagerMotif = partagerMotif;
