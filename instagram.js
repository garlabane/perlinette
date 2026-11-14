'use strict';
// Instagram : un carrousel de 5 images 1080 × 1350 (format 4:5, le plus grand dans le fil) et son texte, pour le motif ouvert.
//  1. l'accroche (la pièce repassée)   2. avant / après   3. le patron   4. les perles nécessaires   5. le repassage + l'appel
// Règles Instagram suivies (fin 2026) : 5 mots-dièse au plus ; un lien n'est cliquable qu'en bio (on écrit l'adresse
// générale du site et le chemin vers le modèle) ; les enregistrements et les partages en message comptent le plus.
const IG = { w: 1080, h: 1350, prune: '#6e2f5c', champ: '#e9d9c3', ivoire: '#faf6f0', encre: '#4a2a40', doux: '#8a7380', rose: '#f4e3ec' };
const igPolice = (t, g = 700) => `${g} ${t}px Segoe UI, Inter, system-ui, sans-serif`;
function igToile() { const c = document.createElement('canvas'); c.width = IG.w; c.height = IG.h; return c; }
function igSvgImage(svg, w, h) {
  return new Promise((ok, ko) => {
    const im = new Image(); im.onload = () => ok(im); im.onerror = ko;
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>`);
  });
}
function igFond(g, haut) {
  g.fillStyle = IG.ivoire; g.fillRect(0, 0, IG.w, IG.h);
  const rg = g.createRadialGradient(IG.w / 2, haut, 40, IG.w / 2, haut, 760);
  rg.addColorStop(0, '#f3e6d6'); rg.addColorStop(1, 'rgba(243,230,214,0)');
  g.fillStyle = rg; g.fillRect(0, 0, IG.w, IG.h);
}
function igRond(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function igPastille(g, texte, x, y, fond, coul, t = 30) {
  g.font = igPolice(t, 800); const w = g.measureText(texte).width + t * 1.3;
  igRond(g, x, y, w, t * 1.75, t); g.fillStyle = fond; g.fill();
  g.fillStyle = coul; g.textBaseline = 'middle'; g.fillText(texte, x + t * 0.65, y + t * 0.9); g.textBaseline = 'alphabetic';
  return w;
}
function igLignes(g, t, max) {
  const mots = t.split(/\s+/), l = []; let cur = '';
  for (const m of mots) { const essai = cur ? cur + ' ' + m : m; if (cur && g.measureText(essai).width > max) { l.push(cur); cur = m; } else cur = essai; }
  if (cur) l.push(cur); return l;
}
// pied commun : logo + adresse + numéro de l'image
function igPied(g, logo, n, total = 5) {
  g.drawImage(logo, 60, IG.h - 112);
  g.font = igPolice(26, 600); g.fillStyle = IG.doux; g.textAlign = 'right';
  g.fillText('garlabane.github.io/perlinette', IG.w - 60, IG.h - 66);
  g.textAlign = 'left';
  for (let i = 0; i < total; i++) { g.beginPath(); g.arc(IG.w / 2 - (total - 1) * 12 + i * 24, IG.h - 150, i === n ? 8 : 6, 0, Math.PI * 2); g.fillStyle = i === n ? IG.prune : '#d6c6bb'; g.fill(); }
}
function igCadre(src, taille) { // place une toile dans un carré, centrée, à l'échelle
  const k = Math.min(taille / src.width, taille / src.height);
  return { k, w: src.width * k, h: src.height * k };
}

// d'où vient le motif : un modèle de la bibliothèque (on dit où le retrouver) ou une création
function contexteInsta() {
  // le modèle tel quel, ou retouché mais toujours à son nom « Nom (Thème) » : on sait où le retrouver
  const m = (typeof modeleDuMotif === 'function' && modeleDuMotif()) || MODELES.find((x) => !x.caractere && `${x.nom} (${x.theme})` === P.nom) || null;
  return { nom: m ? m.nom : (P.nom || 'Mon motif').trim(), theme: m ? m.theme : '', chemin: m ? `Modèles › ${m.theme} › ${m.nom}` : '', auteur: (reglages.auteur || '').trim() };
}

async function carrouselInsta(ctx = contexteInsta()) {
  const Pm = P, Sm = SURF; // pris tout de suite : la suite peut attendre le chargement des images
  // tout ce qui lit le motif se fait d'abord, sans attendre (le motif ne doit jamais rester remplacé)
  const I = infosMotif(), nom = ctx.nom;
  const repasse = rendreRepasse({ z: 40, brillant: true, ombre: true, fonte: 'complete' });
  const F = { x: 0, y: 0, larg: Sm.larg, haut: Sm.haut, plaque: true };
  const fen = typeof arrondirFenetre === 'function' ? arrondirFenetre(pinFenetre()) : F;
  const svgPlaque = pinPlaque(0, 0, 900, fen);
  const ids = Sm.picots.map((q, i) => i).filter((i) => Pm.cases[i] >= 0);
  const minx = Math.min(...ids.map((i) => Sm.picots[i].x)), maxx = Math.max(...ids.map((i) => Sm.picots[i].x));
  const miny = Math.min(...ids.map((i) => Sm.picots[i].y)), maxy = Math.max(...ids.map((i) => Sm.picots[i].y));
  const minutes = Math.max(10, Math.round(I.perles / 18 / 5) * 5);
  const logo = await igSvgImage(pinLogo(0, 0, 4.2, IG.prune, 46), 330, 60);
  const avant = await igSvgImage(svgPlaque, 900, 900);

  // ---------- 1. L'accroche : la pièce repassée, en grand
  const c1 = igToile(), g1 = c1.getContext('2d');
  igFond(g1, 760);
  igPastille(g1, 'MODÈLE GRATUIT', 60, 64, IG.prune, '#fff', 28);
  g1.font = igPolice(86, 800); g1.fillStyle = IG.encre;
  const l1 = igLignes(g1, nom, IG.w - 120).slice(0, 2);
  l1.forEach((l, i) => g1.fillText(l, 60, 222 + i * 96));
  const yP = 222 + (l1.length - 1) * 96 + 52;
  g1.font = igPolice(36, 500); g1.fillStyle = IG.doux; g1.fillText(`en perles à repasser · ${minutes} min environ${ctx.auteur ? ' · par ' + ctx.auteur : ''}`, 60, yP);
  const k1 = igCadre(repasse, 820); g1.drawImage(repasse, (IG.w - k1.w) / 2, yP + 30 + (820 - k1.h) / 2, k1.w, k1.h);
  g1.font = igPolice(30, 700); g1.fillStyle = IG.prune; g1.textAlign = 'right'; g1.fillText('Glisse pour le patron  →', IG.w - 60, IG.h - 190); g1.textAlign = 'left';
  igPied(g1, logo, 0);

  // ---------- 2. Avant / après
  const c2 = igToile(), g2 = c2.getContext('2d');
  igFond(g2, 600);
  g2.font = igPolice(64, 800); g2.fillStyle = IG.encre; g2.fillText('Avant / après', 60, 140);
  g2.font = igPolice(34, 500); g2.fillStyle = IG.doux; g2.fillText('Les perles sur la plaque… puis un coup de fer.', 60, 196);
  const T = 470, y2 = 300;
  igRond(g2, 50, y2 - 20, T + 20, T + 120, 28); g2.fillStyle = '#fffdf9'; g2.fill();
  igRond(g2, IG.w - 70 - T, y2 - 20, T + 20, T + 120, 28); g2.fillStyle = '#fffdf9'; g2.fill();
  g2.drawImage(avant, 60, y2, T, T);
  const k2 = igCadre(repasse, T); g2.drawImage(repasse, IG.w - 60 - T + (T - k2.w) / 2, y2 + (T - k2.h) / 2, k2.w, k2.h);
  g2.font = igPolice(34, 800); g2.fillStyle = IG.prune; g2.textAlign = 'center';
  g2.fillText('AVANT', 60 + T / 2, y2 + T + 66); g2.fillText('APRÈS', IG.w - 60 - T / 2, y2 + T + 66);
  g2.font = igPolice(70, 800); g2.fillText('→', IG.w / 2, y2 + T / 2 + 24); g2.textAlign = 'left';
  // bandeau d'infos
  const yI = y2 + T + 150, infos = [[`${I.perles}`, 'perles'], [`${I.util.length}`, 'couleurs'], [I.plaques > 1 ? `${I.plaques}` : '1', I.plaques > 1 ? 'plaques' : 'plaque'], [I.taille.replace(' cm', ''), 'cm']];
  const lc = (IG.w - 120) / 4;
  infos.forEach(([v, l], i) => {
    const x = 60 + i * lc + lc / 2; g2.textAlign = 'center';
    g2.font = igPolice(54, 800); g2.fillStyle = IG.encre; g2.fillText(v, x, yI + 60);
    g2.font = igPolice(28, 600); g2.fillStyle = IG.doux; g2.fillText(l, x, yI + 100);
  });
  g2.textAlign = 'left';
  igPied(g2, logo, 1);

  // ---------- 3. Le patron, à enregistrer
  const c3 = igToile(), g3 = c3.getContext('2d');
  igFond(g3, 700);
  g3.font = igPolice(64, 800); g3.fillStyle = IG.encre; g3.fillText('Le patron', 60, 140);
  const wP = igPastille(g3, '🔖 Enregistre-le', IG.w - 60 - 330, 92, IG.rose, IG.prune, 30);
  g3.font = igPolice(32, 500); g3.fillStyle = IG.doux; g3.fillText(`${I.forme} · ${Math.round(maxx - minx + 1)} × ${Math.round(maxy - miny + 1)} perles`, 60, 196);
  // la grille, recadrée sur le motif, avec un repère toutes les 5 perles
  const m = 1, gx0 = Math.max(0, minx - 0.5 - m), gy0 = Math.max(0, miny - 0.5 - m), gw = Math.min(Sm.larg, maxx + 0.5 + m) - gx0, gh = Math.min(Sm.haut, maxy + 0.5 + m) - gy0;
  const TP = 900, kP = TP / Math.max(gw, gh), oxP = (IG.w - gw * kP) / 2, oyP = 250 + (TP - gh * kP) / 2;
  igRond(g3, oxP - 18, oyP - 18, gw * kP + 36, gh * kP + 36, 24); g3.fillStyle = '#fffdf9'; g3.fill();
  Sm.picots.forEach((q, i) => {
    if (q.x < gx0 || q.y < gy0 || q.x > gx0 + gw || q.y > gy0 + gh) return;
    const v = Pm.cases[i], x = oxP + (q.x - gx0) * kP, y = oyP + (q.y - gy0) * kP;
    if (v < 0) { g3.beginPath(); g3.arc(x, y, Math.max(1.5, kP * 0.1), 0, Math.PI * 2); g3.fillStyle = '#e2d7ca'; g3.fill(); return; }
    g3.beginPath(); g3.arc(x, y, kP * 0.46, 0, Math.PI * 2); g3.fillStyle = Pm.couleurs[v].hex; g3.fill();
    if (perleTresClaire(Pm.couleurs[v].hex)) { g3.strokeStyle = 'rgba(0,0,0,.28)'; g3.lineWidth = 1.2; g3.stroke(); }
  });
  if (formatParId(Pm.format).type === 'carre') {
    g3.strokeStyle = 'rgba(110,47,92,.35)'; g3.lineWidth = 2;
    for (let c = Math.ceil(gx0 / 5) * 5; c <= gx0 + gw; c += 5) { const x = oxP + (c - gx0) * kP; g3.beginPath(); g3.moveTo(x, oyP); g3.lineTo(x, oyP + gh * kP); g3.stroke(); }
    for (let r = Math.ceil(gy0 / 5) * 5; r <= gy0 + gh; r += 5) { const y = oyP + (r - gy0) * kP; g3.beginPath(); g3.moveTo(oxP, y); g3.lineTo(oxP + gw * kP, y); g3.stroke(); }
  }
  igPied(g3, logo, 2);

  // ---------- 4. Ce qu'il te faut + l'appel
  const c4 = igToile(), g4 = c4.getContext('2d');
  igFond(g4, 500);
  g4.font = igPolice(64, 800); g4.fillStyle = IG.encre; g4.fillText('Ce qu’il te faut', 60, 140);
  g4.font = igPolice(32, 500); g4.fillStyle = IG.doux; g4.fillText(`Perles Hama Midi · ${I.perles} perles en tout`, 60, 196);
  const liste = I.util.slice(0, 14), deux = liste.length > 7, colW = deux ? (IG.w - 120) / 2 : IG.w - 120, ligneH = 78;
  liste.forEach((u, i) => {
    const col = deux ? Math.floor(i / Math.ceil(liste.length / 2)) : 0, row = deux ? i % Math.ceil(liste.length / 2) : i;
    const x = 60 + col * colW, y = 260 + row * ligneH;
    g4.beginPath(); g4.arc(x + 26, y + 26, 24, 0, Math.PI * 2); g4.fillStyle = u.c.hex; g4.fill();
    if (perleTresClaire(u.c.hex)) { g4.strokeStyle = 'rgba(0,0,0,.25)'; g4.lineWidth = 2; g4.stroke(); }
    g4.beginPath(); g4.arc(x + 26, y + 26, 8, 0, Math.PI * 2); g4.fillStyle = IG.ivoire; g4.fill();
    g4.font = igPolice(30, 700); g4.fillStyle = IG.encre; g4.fillText(u.c.nom, x + 68, y + 24);
    g4.font = igPolice(24, 500); g4.fillStyle = IG.doux; g4.fillText(u.c.code, x + 68, y + 54);
    g4.font = igPolice(32, 800); g4.fillStyle = IG.prune; g4.textAlign = 'right'; g4.fillText('× ' + u.n, x + colW - 24, y + 38); g4.textAlign = 'left';
  });
  if (I.util.length > liste.length) { g4.font = igPolice(26, 600); g4.fillStyle = IG.doux; g4.fillText(`+ ${I.util.length - liste.length} autres couleurs dans le patron`, 60, 260 + Math.ceil(liste.length / (deux ? 2 : 1)) * ligneH + 10); }
  // l'astuce
  const yA = IG.h - 400;
  igRond(g4, 60, yA, IG.w - 120, 190, 28); g4.fillStyle = IG.rose; g4.fill();
  g4.fillStyle = IG.prune; g4.font = igPolice(34, 800); g4.fillText('💡 Il te manque une couleur ?', 100, yA + 70);
  g4.font = igPolice(28, 500); g4.fillStyle = IG.encre;
  g4.fillText('Dans Perlinette, indique tes perles : il remplace', 100, yA + 118);
  g4.fillText('chaque couleur par la plus proche que tu as.', 100, yA + 156);
  igPied(g4, logo, 3);

  // ---------- 5. À toi de jouer : repasser, puis l'appel
  const c5 = igToile(), g5 = c5.getContext('2d');
  igFond(g5, 500);
  g5.font = igPolice(64, 800); g5.fillStyle = IG.encre; g5.fillText('À toi de jouer !', 60, 140);
  g5.font = igPolice(32, 500); g5.fillStyle = IG.doux; g5.fillText('Le repassage, en 3 étapes', 60, 196);
  const etapes = [
    ['1', 'Pose les perles', 'sur la plaque, en suivant le patron.'],
    ['2', 'Repasse', 'sous du papier cuisson, fer chaud sans vapeur,', 'par petits cercles, jusqu’à ce qu’elles fondent.'],
    ['3', 'Laisse refroidir', 'sous un livre : la pièce reste bien plate.'],
  ];
  let yE = 270;
  for (const [n, t, ...l] of etapes) {
    g5.beginPath(); g5.arc(100, yE + 34, 40, 0, Math.PI * 2); g5.fillStyle = IG.prune; g5.fill();
    g5.fillStyle = '#fff'; g5.font = igPolice(40, 800); g5.textAlign = 'center'; g5.fillText(n, 100, yE + 48); g5.textAlign = 'left';
    g5.fillStyle = IG.encre; g5.font = igPolice(38, 800); g5.fillText(t, 170, yE + 30);
    g5.fillStyle = IG.doux; g5.font = igPolice(28, 500); l.forEach((x, k) => g5.fillText(x, 170, yE + 72 + k * 36));
    yE += 70 + l.length * 36 + 40;
  }
  // l'appel
  const yC = IG.h - 520;
  igRond(g5, 60, yC, IG.w - 120, 320, 32); g5.fillStyle = IG.prune; g5.fill();
  g5.fillStyle = '#fff'; g5.font = igPolice(46, 800); g5.fillText('Patron gratuit à imprimer', 104, yC + 84);
  g5.fillText('en taille réelle 🖨️', 104, yC + 140);
  g5.font = igPolice(28, 600); g5.fillStyle = '#f1dbe8'; g5.fillText('Lien en bio · garlabane.github.io/perlinette', 104, yC + 200);
  g5.fillStyle = '#fff'; g5.font = igPolice(28, 700); g5.fillText(ctx.chemin ? `puis ${ctx.chemin}` : 'Crée tes motifs : gratuit et sans compte', 104, yC + 240);
  g5.fillStyle = '#f1dbe8'; g5.font = igPolice(28, 600); g5.fillText('📸 Montre-moi le tien : identifie-moi !', 104, yC + 288);
  igPied(g5, logo, 4);

  return [c1, c2, c3, c4, c5];
}

// le 5e mot-dièse : le sujet du modèle (thème), sinon le pixel art
const DIESES_THEMES = { 'Noël': '#noel', 'Halloween': '#halloween', 'Pâques': '#paques', 'Animaux': '#animaux', 'Kawaii': '#kawaii', 'Princesses': '#princesse',
  'Mandalas': '#mandala', 'Fruits et légumes': '#fruits', 'Gourmandises': '#gourmandise', 'Saisons': '#saisons', 'Course de karts': '#kart', 'Véhicules': '#voitures' };
function igDiese(theme) { return DIESES_THEMES[theme] || '#pixelart'; }
function texteInsta(ctx = contexteInsta()) {
  // règles Instagram récentes : 5 mots-dièse au plus ; les partages en message et les enregistrements comptent le plus ;
  // un lien n'est cliquable dans la légende qu'avec un abonnement payant : on l'écrit lisible, et il est cliquable en bio
  const I = infosMotif(), nom = ctx.nom;
  const minutes = Math.max(10, Math.round(I.perles / 18 / 5) * 5);
  const couleurs = I.util.slice(0, 6).map((u) => u.c.nom.toLowerCase()).join(', ');
  const lignes = [
    `${nom} en perles à repasser ✨ Patron gratuit !`,
    '',
    `📏 ${I.forme}${I.plaques > 1 ? ` (${I.plaques} plaques)` : ''} · ${I.perles} perles · ${I.taille}`,
    `🎨 ${I.util.length} couleurs Hama Midi : ${couleurs}${I.util.length > 6 ? '…' : ''}`,
    `⏱️ Environ ${minutes} minutes de pose`,
    '',
    '👉 Glisse pour voir l’avant/après, le patron, la liste des perles et le repassage.',
    '🔖 Enregistre ce post pour le retrouver.',
    '💌 Envoie-le à quelqu’un qui adore les perles !',
    '',
    '🖨️ Le patron gratuit, à imprimer en taille réelle (sans compte) :',
    '👉 garlabane.github.io/perlinette (lien dans ma bio)',
    ctx.chemin ? `puis ${ctx.chemin.replace(/› ([^›]*)$/, '› « $1 »')}.` : 'Tu peux aussi y créer tes propres motifs, gratuitement.',
    '',
    AVIS_THEMES[ctx.theme] ? `⚠️ ${AVIS_THEMES[ctx.theme]}` : null,
    AVIS_THEMES[ctx.theme] ? '' : null,
    'Et toi, tu le ferais dans quelles couleurs ? 💬',
    '📸 Si tu le fais, identifie-moi : je partage vos créations !',
    '',
    `#perlesarepasser #perleshama #hamabeads #perlerbeads ${igDiese(ctx.theme)}`,
  ];
  return lignes.filter((l) => l !== null).filter((l, k, t) => l !== '' || t[k - 1] !== '').join('\n');
}

// ---------- la fenêtre « Instagram » ----------
async function ouvrirInstagram() {
  if (!P.cases.some((v) => v >= 0)) { avertir('Ce motif est encore vide.'); return; }
  sauverMaintenant();
  const ctx = contexteInsta(), texte = texteInsta(ctx);
  const dlg = document.createElement('dialog');
  dlg.className = 'large insta';
  dlg.innerHTML = `<form method="dialog"><h3>Carrousel Instagram</h3>
    <p class="note">5 images au format Instagram (4:5) et le texte de la publication, prêts à publier.</p>
    <div class="insta-images"><p class="note">Préparation des images…</p></div>
    <label>Texte de la publication <textarea id="igTexte" rows="9"></textarea></label>
    <p class="note">Sur téléphone : « Enregistrer dans mes photos » ouvre le partage, choisis <b>Enregistrer les images</b>. Ou appuie longtemps sur une image › <b>Enregistrer</b> / <b>Ajouter à Photos</b>. Ensuite, dans Instagram, choisis les 5 images dans ta galerie et colle le texte.</p>
    <p class="note">Sur Instagram, un lien n'est cliquable que dans ta bio : mets-y <b>garlabane.github.io/perlinette</b>.</p>
    <menu><button value="fermer">Fermer</button><button type="button" id="igCopier">📋 Copier le texte</button><button type="button" id="igPhotos" class="principal">🖼️ Enregistrer dans mes photos</button></menu></form>`;
  document.body.appendChild(dlg);
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
  const $i = (s) => dlg.querySelector(s);
  $i('#igTexte').value = texte;
  const base = nomFichier('').replace(/\.$/, '') || 'perlinette';
  let fichiers = [];
  try {
    const toiles = await carrouselInsta(ctx);
    const blobs = await Promise.all(toiles.map((t) => new Promise((r) => t.toBlob(r, 'image/png'))));
    fichiers = blobs.map((b, k) => new File([b], `${base} - instagram ${k + 1}.png`, { type: 'image/png' }));
    $i('.insta-images').innerHTML = '';
    // les vraies images (pleine taille) : un appui long les enregistre dans la galerie du téléphone
    blobs.forEach((b, k) => { const im = document.createElement('img'); im.src = URL.createObjectURL(b); im.alt = `Image ${k + 1} du carrousel`; $i('.insta-images').appendChild(im); });
    dlg.addEventListener('close', () => $i('.insta-images').querySelectorAll('img').forEach((im) => URL.revokeObjectURL(im.src)));
  } catch (e) { $i('.insta-images').innerHTML = `<p class="note">⚠ Images impossibles à créer : ${echap(e.message || String(e))}</p>`; return; }
  const copier = async () => { try { await navigator.clipboard.writeText($i('#igTexte').value); return true; } catch (e) { return false; } };
  $i('#igCopier').onclick = async () => message(await copier() ? 'Texte copié : colle-le dans la publication.' : 'Copie refusée : sélectionne le texte à la main.', 4000);
  // le partage est appelé tout de suite (sans rien attendre avant), sinon certains téléphones le refusent
  $i('#igPhotos').onclick = () => {
    const fichiersOk = navigator.canShare && navigator.canShare({ files: fichiers });
    if (fichiersOk) {
      navigator.share({ files: fichiers }).then(() => message('Images partagées. Pense à copier le texte.', 5000)).catch((e) => {
        if (!e || e.name !== 'AbortError') message('Partage impossible : appuie longtemps sur chaque image pour l’enregistrer.', 6000);
      });
      return;
    }
    // ordinateur : les 5 images vont dans Téléchargements
    fichiers.forEach((f, k) => setTimeout(() => telecharger(f.name, f), k * 250));
    message('5 images enregistrées dans Téléchargements.', 5000);
  };
}
actions.instagram = ouvrirInstagram;
