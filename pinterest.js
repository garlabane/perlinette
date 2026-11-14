'use strict';
// Partager sur Pinterest : une « épingle » prête à publier.
//  • format 2:3 (1000 × 1500), celui que Pinterest met en avant dans son fil ;
//  • le motif repassé en grand, sur fond doux ; titre, couleurs et nombre de perles ;
//  • la marque toujours visible : logo en haut, et un bandeau « Perlinette » en pied qui ne se rogne pas ;
//  • un texte de description prêt à coller (avec le lien et les mots-clés) ; Pinterest n'accepte pas de lien
//    préparé pour une image fabriquée sur l'appareil : on copie le texte et le lien, puis on ouvre Pinterest.
// Tout est calculé sur l'appareil ; rien n'est envoyé nulle part avant que la personne choisisse de publier.

const LIEN_PERLINETTE = 'https://garlabane.github.io/perlinette/app/';
const PIN = { w: 1000, h: 1500, prune: '#6e2f5c', champagne: '#e9d9c3', ivoire: '#faf6f0', encre: '#4a2a40' };

function pinLogo(x, y, k, texte, taille) {
  const p = (cx, cy, c) => `<circle cx="${x + cx * k}" cy="${y + cy * k}" r="${2.6 * k}" fill="${c}"/><circle cx="${x + cx * k}" cy="${y + cy * k}" r="${0.9 * k}" fill="${PIN.ivoire}"/>`;
  return p(6.5, 2.8, '#E8A498') + p(2.8, 6.5, '#E9C704') + p(10.2, 6.5, '#49AE89') + p(6.5, 10.2, texte === '#fff' ? '#d9a3c8' : PIN.prune)
    + `<text x="${x + 15 * k}" y="${y + 8.6 * k}" font-size="${taille}" font-weight="700" fill="${texte}" font-family="Segoe UI, Inter, system-ui, sans-serif">Perlinette</text>`;
}

// coupe un titre en lignes d'au plus n caractères
function pinLignes(t, n) {
  const mots = t.split(/\s+/), l = []; let cur = '';
  for (const m of mots) { if (cur && (cur + ' ' + m).length > n) { l.push(cur); cur = m; } else cur = cur ? cur + ' ' + m : m; }
  if (cur) l.push(cur);
  return l.slice(0, 2);
}

// le motif tel qu'on le pose : la plaque avec ses picots, et les perles rondes (avec leur trou) dessus
// On cadre sur le motif (avec quelques picots autour) quand il n'occupe qu'un coin de la plaque : il se lit mieux.
function pinFenetre() {
  const pos = []; SURF.picots.forEach((q, i) => { if (P.cases[i] >= 0) pos.push(q); });
  const tout = { x: 0, y: 0, larg: SURF.larg, haut: SURF.haut, plaque: true };
  if (!pos.length) return tout;
  const m = 2, x0 = Math.min(...pos.map((q) => q.x)) - m, x1 = Math.max(...pos.map((q) => q.x)) + m, y0 = Math.min(...pos.map((q) => q.y)) - m, y1 = Math.max(...pos.map((q) => q.y)) + m;
  let l = Math.max(x1 - x0, 12), h = Math.max(y1 - y0, 12);
  if (l * h > 0.85 * SURF.larg * SURF.haut) return tout;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const x = Math.max(0, Math.min(SURF.larg - l, cx - l / 2)), y = Math.max(0, Math.min(SURF.haut - h, cy - h / 2));
  return { x, y, larg: l, haut: h, plaque: false };
}

function pinPlaque(x, y, taille, F) {
  const k = taille / Math.max(F.larg, F.haut), ox = x + (taille - F.larg * k) / 2 - F.x * k, oy = y + (taille - F.haut * k) / 2 - F.y * k;
  const r2 = (v) => +v.toFixed(2);
  let s = '';
  if (!F.plaque) s += `<rect x="${r2(x + (taille - F.larg * k) / 2)}" y="${r2(y + (taille - F.haut * k) / 2)}" width="${r2(F.larg * k)}" height="${r2(F.haut * k)}" rx="22" fill="#fffdf9" stroke="#cdbfae" stroke-width="3"/>`;
  for (const pl of F.plaque ? SURF.plaques : []) {
    const px = ox + pl.x * k, py = oy + pl.y * k, w = pl.larg * k, h = pl.haut * k, f = pl.contour.forme;
    const st = 'fill="#fffdf9" stroke="#cdbfae" stroke-width="3"';
    if (f === 'rond') s += `<ellipse cx="${r2(px + w / 2)}" cy="${r2(py + h / 2)}" rx="${r2(w / 2)}" ry="${r2(h / 2)}" ${st}/>`;
    else if (f === 'hexa') { const m = (h / 2) / Math.sqrt(3); s += `<polygon points="${[[px + m, py], [px + w - m, py], [px + w, py + h / 2], [px + w - m, py + h], [px + m, py + h], [px, py + h / 2]].map((q) => r2(q[0]) + ',' + r2(q[1])).join(' ')}" ${st}/>`; }
    else s += `<rect x="${r2(px)}" y="${r2(py)}" width="${r2(w)}" height="${r2(h)}" rx="${r2(k * 0.6)}" ${st}/>`;
  }
  SURF.picots.forEach((q, i) => {
    if (q.x < F.x - 0.5 || q.x > F.x + F.larg + 0.5 || q.y < F.y - 0.5 || q.y > F.y + F.haut + 0.5) return;
    const cx = r2(ox + q.x * k), cy = r2(oy + q.y * k), v = P.cases[i];
    if (v < 0) { s += `<circle cx="${cx}" cy="${cy}" r="${r2(k * 0.13)}" fill="#d9cdbd"/>`; return; }
    const c = P.couleurs[v];
    s += `<circle cx="${cx}" cy="${cy}" r="${r2(k * 0.47)}" fill="${c.hex}" stroke="#0005" stroke-width="${r2(Math.max(1, k * 0.04))}"/><circle cx="${cx}" cy="${cy}" r="${r2(k * 0.17)}" fill="#fffdf9" fill-opacity="0.9" stroke="#0002" stroke-width="1"/>`;
  });
  return s;
}

function infosMotif() {
  const nb = new Array(P.couleurs.length).fill(0);
  for (const v of P.cases) if (v >= 0) nb[v]++;
  const util = P.couleurs.map((c, i) => ({ c, n: nb[i] })).filter((u) => u.n > 0).sort((a, b) => b.n - a.n);
  const perles = util.reduce((t, u) => t + u.n, 0);
  const cm = (v) => (v * P.pas / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  return { util, perles, taille: `${cm(SURF.larg)} × ${cm(SURF.haut)} cm`, plaques: SURF.plaques.length, forme: formatParId(P.format).nom };
}

function epingleSvg() {
  const I = infosMotif(), W = PIN.w, H = PIN.h, FEN = pinFenetre();
  const titre = pinLignes((P.nom || 'Mon motif').trim(), 22);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + `<rect width="${W}" height="${H}" fill="${PIN.ivoire}"/>`
    + pinLogo(150, 56, 5.6, PIN.prune, 42)
    + `<text x="${W / 2}" y="196" font-size="30" font-weight="700" letter-spacing="3" fill="#a07c5b" text-anchor="middle" font-family="Segoe UI, Inter, system-ui, sans-serif">MOTIF POUR PERLES À REPASSER</text>`
    + titre.map((l, i) => `<text x="${W / 2}" y="${262 + i * 70}" font-size="60" font-weight="700" fill="${PIN.encre}" text-anchor="middle" font-family="Segoe UI, Inter, system-ui, sans-serif">${echap(l)}</text>`).join('');
  const carte = 700, cy = 262 + (titre.length - 1) * 70 + 36;
  s += `<rect x="${(W - carte) / 2}" y="${cy}" width="${carte}" height="${carte}" rx="40" fill="#f1e8dc"/>`
    + pinPlaque((W - carte) / 2 + 24, cy + 24, carte - 48, FEN);
  // le même motif une fois repassé, en vignette : on voit tout de suite le « avant / après »
  const vt = 180, vx = 750, vy = cy + carte - vt + 84; // déborde de la plaque : ne cache pas le motif
  s += `<rect x="${vx - 12}" y="${vy - 12}" width="${vt + 24}" height="${vt + 56}" rx="22" fill="#fff" stroke="#cdbfae" stroke-width="3"/>`
    + svgRepasse(vx, vy, vt, FEN)
    + `<text x="${vx + vt / 2}" y="${vy + vt + 30}" font-size="30" font-weight="700" fill="${PIN.prune}" text-anchor="middle" font-family="Segoe UI, Inter, system-ui, sans-serif">repassé</text>`;
  // pastille « imprimable » : à taille réelle sur A4, avec le guide des couleurs (la fonction qui distingue Perlinette)
  const bw = 350, bx = W - 150 - bw, by = 44, // les coins du haut restent libres : Pinterest y pose ses boutons
     im = (x, y) => `<g transform="translate(${x} ${y}) scale(1.05)" fill="none" stroke="#fff" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"><path d="M10 14V3h20v11"/><rect x="2" y="14" width="36" height="18" rx="4"/><rect x="10" y="24" width="20" height="14" fill="${PIN.prune}"/><circle cx="32" cy="20" r="1.6" fill="#fff"/></g>`;
  s += `<g><rect x="${bx}" y="${by}" width="${bw}" height="96" rx="48" fill="${PIN.prune}"/>`
    + im(bx + 24, by + 26)
    + `<text x="${bx + 84}" y="${by + 44}" font-size="34" font-weight="700" fill="#fff" font-family="Segoe UI, Inter, system-ui, sans-serif">Imprimable A4</text>`
    + `<text x="${bx + 84}" y="${by + 76}" font-size="23" fill="${PIN.champagne}" font-family="Segoe UI, Inter, system-ui, sans-serif">taille réelle + guide</text></g>`;
  // les couleurs les plus utilisées
  const yc = cy + carte + 62, pastilles = I.util.slice(0, 8), pas = 62, xm = 385, x0 = xm - (pastilles.length - 1) * pas / 2; // centré à gauche de la vignette « repassé »
  s += pastilles.map((u, i) => `<circle cx="${x0 + i * pas}" cy="${yc}" r="25" fill="${u.c.hex}" stroke="#0003" stroke-width="2"/>`).join('');
  s += `<text x="${xm}" y="${yc + 76}" font-size="36" fill="#6b5a66" text-anchor="middle" font-family="Segoe UI, Inter, system-ui, sans-serif">${I.perles} perles · ${I.util.length} couleurs · ${echap(I.taille)}</text>`;
  // bandeau de marque : jamais rogné, lisible en miniature
  const hb = 250, yb = H - hb;
  s += `<rect y="${yb}" width="${W}" height="${hb}" fill="${PIN.prune}"/>`
    + pinLogo(60, yb + 34, 8, '#fff', 92)
    + `<text x="64" y="${yb + 172}" font-size="38" fill="${PIN.champagne}" font-family="Segoe UI, Inter, system-ui, sans-serif">Crée le tien : gratuit, sans compte</text>`
    + `<text x="64" y="${yb + 222}" font-size="38" fill="#fff" font-weight="700" font-family="Segoe UI, Inter, system-ui, sans-serif">garlabane.github.io/perlinette</text>`;
  return s + '</svg>';
}

async function epingleCanvas() {
  const svg = epingleSvg(), url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = await new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ko(new Error('image')); i.src = url; });
    const c = document.createElement('canvas'); c.width = PIN.w; c.height = PIN.h;
    c.getContext('2d').drawImage(img, 0, 0, PIN.w, PIN.h);
    return c;
  } finally { URL.revokeObjectURL(url); }
}
async function epinglePng() { const c = await epingleCanvas(); return new Promise((r) => c.toBlob(r, 'image/png')); }

function descriptionPin() {
  const I = infosMotif();
  return `${P.nom} : un motif de perles à repasser de ${I.perles} perles et ${I.util.length} couleurs (${I.taille}). `
    + `Patron à imprimer en taille réelle (A4) avec le guide des couleurs. Fait avec Perlinette, gratuit et sans compte : ${LIEN_PERLINETTE}\n#perlesàrepasser #hama #perler #artkal #fusebeads #pixelart #DIY #loisirscréatifs`;
}

async function partagerPinterest() {
  if (!P.cases.some((v) => v >= 0)) { avertir('Ce motif est encore vide.'); return; }
  sauverMaintenant();
  // un modèle de Perlinette, tel quel : Pinterest reçoit l'image du site, la description et le lien « Visiter le site »
  const mod = EPINGLES_EN_LIGNE ? modeleDuMotif() : null;
  if (mod) {
    const s = slugModele(mod), e = encodeURIComponent;
    const adresse = 'https://www.pinterest.com/pin/create/button/?url=' + e(SITE_PERLINETTE + 'app/?modele=' + s)
      + '&media=' + e(SITE_PERLINETTE + 'epingles/' + s + '.jpg') + '&description=' + e(descriptionPin());
    window.open(adresse, '_blank', 'noopener');
    message('Pinterest s’ouvre : choisis ton tableau. Le lien vers Perlinette est déjà mis.', 6000);
    return;
  }
  let blob;
  try { blob = await epinglePng(); } catch (e) { blob = null; }
  if (!blob) { avertir('Impossible de créer l’image pour Pinterest.'); return; }
  const fichier = new File([blob], nomFichier('-pinterest.png'), { type: 'image/png' });
  // Téléphone : un seul geste. Le menu de partage de l'appareil s'ouvre avec l'image, son titre, sa description et le lien ;
  // on choisit Pinterest, puis son tableau. La description est aussi copiée, au cas où l'app ne la reprendrait pas.
  if (window.matchMedia('(pointer: coarse)').matches && navigator.canShare && navigator.canShare({ files: [fichier] })) {
    const texte = descriptionPin();
    try { await navigator.clipboard.writeText(texte); } catch (e) { /* presse-papiers refusé : tant pis */ }
    // on donne aussi l'adresse du site à part : certaines applications (dont Pinterest) s'en servent comme lien de l'épingle
    const avecLien = { files: [fichier], title: P.nom, text: texte, url: LIEN_PERLINETTE };
    const complet = navigator.canShare(avecLien) ? avecLien : { files: [fichier], title: P.nom, text: texte };
    try {
      await navigator.share(navigator.canShare(complet) ? complet : { files: [fichier], title: P.nom });
      message('Si la description manque dans Pinterest, colle-la : elle est copiée.', 6000);
      return;
    } catch (e) {
      if (e && e.name === 'AbortError') return; // partage refermé
    }
  }
  const apercu = URL.createObjectURL(blob);
  const dlg = document.createElement('dialog');
  dlg.className = 'pinterest';
  dlg.innerHTML = `<form method="dialog">
    <h3>Partager sur Pinterest</h3>
    <div class="pin-grille">
      <img src="${apercu}" alt="Aperçu de l'épingle" class="pin-apercu">
      <div class="pin-texte">
        <p class="note">Une image au format Pinterest (2:3), avec ton motif repassé et la marque Perlinette en pied. Tout est fait sur ton appareil.</p>
        <label>Description à coller <textarea id="pinDescription" rows="7"></textarea></label>
        <div class="ligne-boutons">
          <button type="button" id="pinCopier">Copier la description</button>
          <button type="button" id="pinImage" class="principal">Partager / enregistrer l’image</button>
        </div>
        <ol class="note pin-etapes">
          <li>Enregistre ou partage l’image (sur téléphone, choisis l’app Pinterest).</li>
          <li>Sur Pinterest, crée une épingle avec cette image, colle la description.</li>
          <li>Dans « Lien de destination », mets : <b>${LIEN_PERLINETTE}</b></li>
        </ol>
        <div class="ligne-boutons"><button type="button" id="pinOuvrir">Ouvrir Pinterest</button> <button type="button" id="pinLien">Copier le lien</button></div>
      </div>
    </div>
    <menu><button value="fermer">Fermer</button></menu>
  </form>`;
  document.body.appendChild(dlg);
  const zone = dlg.querySelector('#pinDescription'); zone.value = descriptionPin();
  const copier = async (t, ok) => { try { await navigator.clipboard.writeText(t); message(ok); } catch (e) { zone.focus(); zone.select(); message('Copie impossible : le texte est sélectionné, fais Ctrl+C.'); } };
  dlg.querySelector('#pinCopier').onclick = () => copier(zone.value, 'Description copiée.');
  dlg.querySelector('#pinLien').onclick = () => copier(LIEN_PERLINETTE, 'Lien copié.');
  dlg.querySelector('#pinImage').onclick = async () => {
    if (await partagerFichiers([fichier], P.nom)) return;
    telecharger(fichier.name, blob);
    message('Image enregistrée dans Téléchargements.');
  };
  dlg.querySelector('#pinOuvrir').onclick = () => window.open('https://www.pinterest.com/pin-builder/', '_blank', 'noopener');
  dlg.addEventListener('close', () => { URL.revokeObjectURL(apercu); dlg.remove(); });
  dlg.showModal();
}
actions.pinterest = partagerPinterest;

// ---------- Modèles de Perlinette : une épingle avec le lien vers le site ----------
// Pinterest n'affiche « Visiter le site » que si l'épingle vient d'une adresse internet. Pour chaque modèle,
// l'image de l'épingle est donc fabriquée à la publication du site (outils/epingles.mjs) et rangée à une adresse fixe ;
// le bouton Pinterest donne alors à Pinterest l'image, la description et le lien, qui rouvre ce modèle dans Perlinette.
const SITE_PERLINETTE = 'https://garlabane.github.io/perlinette/';
function slugModele(m) {
  return (m.theme + '-' + m.nom).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
// les images des épingles sont-elles bien sur le site ? (vérifié une fois ; sinon on garde le partage de l'image)
let EPINGLES_EN_LIGNE = false;
window.addEventListener('load', () => {
  fetch(SITE_PERLINETTE + 'epingles/noel-sapin.jpg', { method: 'HEAD' }).then((r) => { EPINGLES_EN_LIGNE = r.ok; }).catch(() => {});
});
const plaqueDeBase = (m) => (m.plaques || ['midi-carre-grand'])[0];
// Le modèle de Perlinette que montre le motif en cours, s'il n'a pas été modifié (sinon null)
function modeleDuMotif() {
  const m = MODELES.find((x) => !x.caractere && `${x.nom} (${x.theme})` === P.nom);
  if (!m || P.format !== plaqueDeBase(m) || SURF.plaques.length !== 1) return null;
  let r; try { r = poserModele(m, P.format); } catch (e) { return null; }
  if (r.cases.length !== P.cases.length) return null;
  for (let i = 0; i < r.cases.length; i++) {
    const a = r.cases[i], b = P.cases[i];
    if ((a < 0) !== (b < 0) || (a >= 0 && r.couleurs[a].hex !== P.couleurs[b].hex)) return null;
  }
  return m;
}
// L'image d'un modèle, sans toucher au motif ouvert (sert à la fabrication des épingles du site)
async function epingleDeModele(m) {
  const gp = P, gs = SURF, fid = plaqueDeBase(m), r = poserModele(m, fid);
  try {
    P = creerMotif(m.nom, fid, { cols: 1, rangs: 1 }, 'hama-midi'); P.cases = r.cases; P.couleurs = r.couleurs; SURF = r.surf;
    // 800 × 1200 en JPEG : net sur Pinterest, et léger (il y a plus de 500 modèles)
    const c = await epingleCanvas(), r2 = document.createElement('canvas'); r2.width = 800; r2.height = 1200;
    const g = r2.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(c, 0, 0, 800, 1200);
    return r2.toDataURL('image/jpeg', 0.78);
  } finally { P = gp; SURF = gs; }
}
// Adresse « …/app/?modele=… » : on ouvre ce modèle à l'arrivée (c'est le lien des épingles)
window.addEventListener('load', () => {
  const s = new URLSearchParams(location.search).get('modele');
  if (!s) return;
  const m = MODELES.find((x) => !x.caractere && slugModele(x) === s);
  if (!m) return;
  setTimeout(() => {
    const fid = plaqueDeBase(m), pose = poserModele(m, fid);
    const motif = creerMotif(`${m.nom} (${m.theme})`, fid, {}, 'hama-midi');
    motif.cases = pose.cases; motif.couleurs = pose.couleurs;
    document.querySelectorAll('dialog[open]').forEach((d) => d.close());
    charger(motif); sauverMaintenant();
    if (typeof zoomAjuster === 'function') zoomAjuster();
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* adresse inchangée */ }
    message(`« ${m.nom} » est ouvert : à toi de jouer !`, 5000);
  }, 400);
});
