'use strict';
// Partager : envoyer l'image du motif, ou son fichier, par le menu de partage de l'appareil
// (message, mail, AirDrop, imprimante…). Sans menu de partage (ordinateur), le fichier est
// simplement téléchargé, comme avant.

async function partagerFichiers(fichiers, titre) {
  try {
    if (navigator.canShare && navigator.canShare({ files: fichiers })) {
      await navigator.share({ files: fichiers, title: titre });
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
  const blob = await new Promise((r) => toile.toBlob(r, 'image/png'));
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
    return `${n} × ${c.nom || ''}${c.code ? ' (' + c.code + ')' : ''}${fin}`;
  });
  return { texte: [`${P.nom} — ${total} perles, ${lignes.length} couleurs`, '', ...texte].join('\n'), nbCouleurs: lignes.length, manque };
}
async function partagerListe() {
  if (!P.cases.some((v) => v >= 0)) { avertir('Ce motif est encore vide.'); return; }
  const liste = listeDesPerles();
  try {
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: P.nom, text: liste.texte }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  let copie = false;
  try { await navigator.clipboard.writeText(liste.texte); copie = true; } catch (e) { /* presse-papiers refusé */ }
  avertir((copie ? 'Liste copiée : tu peux la coller dans un message ou une note.\n\n' : '') + liste.texte);
}

actions.partagerImage = partagerImage;
actions.partagerListe = partagerListe;
actions.partagerMotif = partagerMotif;
