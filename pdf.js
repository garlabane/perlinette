'use strict';
// Les feuilles A4 en PDF, à partager ou à enregistrer : pour imprimer ailleurs, envoyer à
// quelqu'un qui a une imprimante, ou garder le patron.
//  • chaque feuille (déjà dessinée pour l'impression) devient une image, posée pleine page ;
//  • la page du PDF a exactement la taille de la feuille : imprimé à 100 %, le patron reste
//    à taille réelle ;
//  • aucun outil extérieur : le fichier PDF est écrit ici, octet par octet.

const PDF_POINTS_PAR_MM = 72 / 25.4;
const PDF_PIXELS_PAR_MM = 200 / 25.4; // 200 points par pouce : net à l'impression, léger à envoyer

// une feuille (SVG) → image JPEG
async function feuilleEnJpeg(svg, page) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = () => ko(new Error('feuille illisible')); img.src = url; });
    const c = document.createElement('canvas');
    c.width = Math.round(page.w * PDF_PIXELS_PAR_MM); c.height = Math.round(page.h * PDF_PIXELS_PAR_MM);
    const g = c.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
    g.drawImage(img, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
    return { octets: new Uint8Array(await blob.arrayBuffer()), w: c.width, h: c.height };
  } finally { URL.revokeObjectURL(url); }
}

// images JPEG → fichier PDF (une image par page)
function ecrirePdf(images, page) {
  const enc = new TextEncoder(), morceaux = [], debuts = [];
  let taille = 0;
  const ajouter = (x) => { const o = typeof x === 'string' ? enc.encode(x) : x; morceaux.push(o); taille += o.length; };
  const objet = (n, corps) => { debuts[n] = taille; ajouter(`${n} 0 obj\n`); corps(); ajouter('\nendobj\n'); };
  const W = (page.w * PDF_POINTS_PAR_MM).toFixed(2), H = (page.h * PDF_POINTS_PAR_MM).toFixed(2);
  const nb = images.length, total = 2 + nb * 3; // catalogue, liste des pages, puis page + dessin + image
  ajouter('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  objet(1, () => ajouter('<< /Type /Catalog /Pages 2 0 R >>'));
  objet(2, () => ajouter(`<< /Type /Pages /Count ${nb} /Kids [${images.map((_, k) => `${3 + k * 3} 0 R`).join(' ')}] >>`));
  images.forEach((im, k) => {
    const p = 3 + k * 3, dessin = `q ${W} 0 0 ${H} 0 0 cm /Im0 Do Q`;
    objet(p, () => ajouter(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>`));
    objet(p + 1, () => ajouter(`<< /Length ${dessin.length} >>\nstream\n${dessin}\nendstream`));
    objet(p + 2, () => {
      ajouter(`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.octets.length} >>\nstream\n`);
      ajouter(im.octets);
      ajouter('\nendstream');
    });
  });
  const table = taille;
  ajouter(`xref\n0 ${total + 1}\n0000000000 65535 f \n`);
  for (let n = 1; n <= total; n++) ajouter(String(debuts[n]).padStart(10, '0') + ' 00000 n \n');
  ajouter(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${table}\n%%EOF\n`);
  return new Blob(morceaux, { type: 'application/pdf' });
}

// r = résultat de preparerPages() : { svgs, page }
async function creerPdf(r, surAvance) {
  const images = [];
  for (let k = 0; k < r.svgs.length; k++) {
    if (surAvance) surAvance(k + 1, r.svgs.length);
    images.push(await feuilleEnJpeg(r.svgs[k], r.page));
    await new Promise((s) => setTimeout(s, 0)); // laisse l'écran respirer entre deux feuilles
  }
  return ecrirePdf(images, r.page);
}

// Fabrique le PDF, puis propose de le partager ou de l'enregistrer.
// (Le partage doit suivre un toucher : on prépare d'abord, on demande ensuite.)
async function proposerPdf(r) {
  const dlg = document.createElement('dialog');
  dlg.className = 'pdf-pret';
  dlg.innerHTML = '<form method="dialog"><h3>PDF du patron</h3><p id="pdfEtat" class="note">Préparation…</p><menu id="pdfBoutons" hidden></menu></form>';
  document.body.appendChild(dlg);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
  let blob;
  try {
    blob = await creerPdf(r, (k, n) => { dlg.querySelector('#pdfEtat').textContent = `Préparation de la feuille ${k} sur ${n}…`; });
  } catch (e) {
    dlg.querySelector('#pdfEtat').textContent = 'Le PDF n’a pas pu être créé sur cet appareil. Tu peux utiliser « Imprimer », puis « Enregistrer en PDF ».';
    dlg.querySelector('#pdfBoutons').hidden = false;
    dlg.querySelector('#pdfBoutons').innerHTML = '<button value="fermer" class="principal">Fermer</button>';
    return;
  }
  const fichier = new File([blob], nomFichier('.pdf'), { type: 'application/pdf' });
  const n = r.svgs.length, ko = Math.max(1, Math.round(blob.size / 1024));
  const peutPartager = !!(navigator.canShare && navigator.canShare({ files: [fichier] }));
  dlg.querySelector('#pdfEtat').textContent = `Ton PDF est prêt : ${n} feuille${n > 1 ? 's' : ''} A4, ${ko > 1024 ? (ko / 1024).toFixed(1).replace('.', ',') + ' Mo' : ko + ' Ko'}. Imprimé à 100 % (sans « ajuster à la page »), il est à taille réelle.`;
  const boutons = dlg.querySelector('#pdfBoutons');
  boutons.hidden = false;
  boutons.innerHTML = `<button value="fermer">Fermer</button>
    <button type="button" id="pdfEnregistrer"${peutPartager ? '' : ' class="principal"'}>Enregistrer</button>
    ${peutPartager ? '<button type="button" id="pdfPartager" class="principal">Partager…</button>' : ''}`;
  dlg.querySelector('#pdfEnregistrer').onclick = () => { telecharger(fichier.name, blob); message('PDF enregistré dans Téléchargements.'); dlg.close(); };
  if (peutPartager) dlg.querySelector('#pdfPartager').onclick = async () => {
    try { await navigator.share({ files: [fichier], title: P.nom }); dlg.close(); } catch (e) { if (!e || e.name !== 'AbortError') message('Partage impossible : utilise « Enregistrer ».', 4000); }
  };
}
