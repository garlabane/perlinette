'use strict';
// Image → motif. On choisit la plaque (et combien), le cadrage et les références
// autorisées ; l'image est échantillonnée à l'emplacement de chaque picot, quelle que
// soit la forme de la plaque (carré, hexagone, rond, plaque dessinée…).

let imageChargee = null, resultatImage = null, surfaceImage = null, nomImage = null;
// placement de l'image sur les plaques : taille (1 = image entière, la plus grande possible),
// décalage en pas, et la partie utile de l'image (sans ses bords vides)
let cadreImage = { zoom: 1, dx: 0, dy: 0 }, boiteImage = null;
const borner = (v, a, b) => Math.max(a, Math.min(b, v));

// La partie utile d'une image : sans ses bords transparents (ou d'une couleur unie).
function boiteContenu(img) {
  const k = Math.min(1, 600 / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0, w, h);
  let d;
  try { d = g.getImageData(0, 0, w, h).data; } catch (e) { return null; }
  let opaque = true;
  for (let i = 3; i < d.length; i += 4) if (d[i] < 250) { opaque = false; break; }
  const vide = (o) => (opaque ? Math.abs(d[o] - d[0]) + Math.abs(d[o + 1] - d[1]) + Math.abs(d[o + 2] - d[2]) < 30 : d[o + 3] < 24);
  // image sans transparence : on ne retire un fond que si les quatre coins ont la même couleur
  if (opaque && ![(w - 1) * 4, (h - 1) * w * 4, (h * w - 1) * 4].every(vide)) return null;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (vide((y * w + x) * 4)) continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  if (x1 < 0) return null;
  x0 = Math.max(0, x0 - 1); y0 = Math.max(0, y0 - 1); x1 = Math.min(w - 1, x1 + 1); y1 = Math.min(h - 1, y1 + 1);
  return { x: x0 / k, y: y0 / k, w: (x1 - x0 + 1) / k, h: (y1 - y0 + 1) / k };
}
function boiteUtile(rogner) {
  return rogner && boiteImage ? boiteImage : { x: 0, y: 0, w: imageChargee.naturalWidth, h: imageChargee.naturalHeight };
}

// choix des références, retenu d'une fois sur l'autre
function refsImage() {
  const r = reglages.refsImage || {};
  return { palettes: Array.isArray(r.palettes) && r.palettes.length ? r.palettes : ['hama-midi'], exclues: new Set(r.exclues || []) };
}
function retenirRefs(r) { reglages.refsImage = { palettes: r.palettes, exclues: [...r.exclues] }; ecrire(CLE.reglages, reglages); }

function ouvrirImage() {
  const dlg = $('#dlgImage'), f = dlg.querySelector('form');
  dlg._retirees = new Set(); // couleurs retirées pour cet import (remplacées automatiquement par les plus proches)
  // plaque : par défaut celle du motif
  remplirChoix(f.format, optionsFormats(), P.format);
  f.w.value = P.cfg.w || 29; f.h.value = P.cfg.h || 29;
  f.cols.value = P.cfg.cols || 1; f.rangs.value = P.cfg.rangs || 1;
  // références
  const refs = refsImage();
  $('#imgMarques').innerHTML = '<span class="note">Marques :</span>' + PALETTES_FUSIBLES.map((p) =>
    `<label class="case"><input type="checkbox" value="${p.id}" ${refs.palettes.includes(p.id) ? 'checked' : ''}> ${echap(nomCourt(p))}</label>`).join('');
  remplirChoix($('#imgTri'), optionsTri('quantite'), reglages.tri && reglages.tri !== 'quantite' ? reglages.tri : 'ref');

  const majRefs = () => {
    const liste = couleursDesPalettes(refs.palettes);
    dessinerNuancier($('#imgRefs'), liste, {
      tri: $('#imgTri').value, recherche: $('#imgCherche').value,
      cocher: (cle) => !refs.exclues.has(cle),
      change: (cle, oui) => { if (oui) refs.exclues.delete(cle); else refs.exclues.add(cle); retenirRefs(refs); majCompte(); relancer(); },
    });
    majCompte();
  };
  const majCompte = () => {
    if ($('#imgSource').value === 'biblio') { $('#nbRefs').textContent = `— ${couleursBiblio().length} couleur(s) de « Mes perles »`; return; }
    const liste = couleursDesPalettes(refs.palettes), ok = liste.filter((c) => !refs.exclues.has(c.cle)).length;
    $('#nbRefs').textContent = `— ${ok} sur ${liste.length}`;
  };
  // source des références : ma bibliothèque, ou un choix fait ici
  const nbBiblio = couleursBiblio().length, source = $('#imgSource');
  source.value = reglages.sourceImage && (reglages.sourceImage !== 'biblio' || nbBiblio) ? reglages.sourceImage : (nbBiblio ? 'biblio' : 'manuel');
  const majSource = () => {
    $('#refsManuel').hidden = source.value === 'biblio';
    $('#imgNoteBiblio').innerHTML = source.value !== 'biblio' ? '' : nbBiblio
      ? 'Seules les couleurs que tu as chez toi seront utilisées. Pour changer la liste : bouton « Mes perles ».'
      : '<b>Ta bibliothèque est vide</b> : remplis-la avec le bouton « Mes perles », ou choisis « Un choix fait ici ».';
    majCompte();
  };
  source.onchange = () => { reglages.sourceImage = source.value; ecrire(CLE.reglages, reglages); majSource(); relancer(); };
  $$('#imgMarques input').forEach((cb) => (cb.onchange = () => {
    refs.palettes = $$('#imgMarques input').filter((x) => x.checked).map((x) => x.value);
    retenirRefs(refs); majRefs(); relancer();
  }));
  $('#imgTri').onchange = majRefs;
  $('#imgCherche').oninput = majRefs;
  // « tout cocher / décocher » agit sur les couleurs affichées (recherche comprise)
  const visibles = () => couleursDesPalettes(refs.palettes).filter((c) => { const q = $('#imgCherche').value.trim().toLowerCase(); return !q || (c.code + ' ' + c.nom + ' ' + c.marque).toLowerCase().includes(q); });
  $('#imgTout').onclick = () => { for (const c of visibles()) refs.exclues.delete(c.cle); retenirRefs(refs); majRefs(); relancer(); };
  $('#imgRien').onclick = () => { for (const c of visibles()) refs.exclues.add(c.cle); retenirRefs(refs); majRefs(); relancer(); };

  const relancer = () => {
    const fm = formatParId(f.format.value);
    $('#imgTailleLibre').hidden = !fm.libre;
    const cfg = { cols: Math.max(1, Math.min(10, +f.cols.value || 1)), rangs: Math.max(1, Math.min(10, +f.rangs.value || 1)) };
    if (fm.libre) { cfg.w = Math.max(1, Math.min(200, +f.w.value || 29)); cfg.h = Math.max(1, Math.min(200, +f.h.value || 29)); }
    surfaceImage = { format: fm, cfg, surf: construireSurface(fm, cfg) };
    const brute = source.value === 'biblio' ? couleursBiblio() : couleursDesPalettes(refs.palettes).filter((c) => !refs.exclues.has(c.cle));
    let palette = brute.map(({ code, nom, hex, marque }) => ({ code, nom, hex, marque }));
    dlg._noteGris = '';
    if (reglages.teintesImage === 'gris') {
      // noir, gris, blanc : on ne garde que les couleurs sans teinte
      // (et pas les perles spéciales : transparentes, phosphorescentes, métallisées, pailletées)
      const speciale = (c) => /transparent|translucent|clear|incolore|glow|phospho|argent|silver|bronze|\bor\b|gold|m[ée]tal|nacr|pearl|paillet|glitter/i.test(`${c.nom || ''} ${c.nomOfficiel || ''}`);
      const neutre = (c) => { if (speciale(c)) return false; const l = rgbLab(hexRgb(c.hex)); return Math.hypot(l[1], l[2]) < 10; };
      let gris = palette.filter(neutre);
      if (gris.length < 2) { // pas assez de gris dans ce choix : on prend ceux du nuancier
        gris = couleursDesPalettes(refs.palettes).filter(neutre).map(({ code, nom, hex, marque }) => ({ code, nom, hex, marque }));
        dlg._noteGris = ' Tes références n’ont pas assez de gris : ceux du nuancier sont utilisés.';
      }
      palette = gris;
    }
    if (dlg._retirees.size) { const reste = palette.filter((x) => !dlg._retirees.has(cleCouleur(x))); if (reste.length) palette = reste; }
    calculerImage(f, palette);
  };
  $('#imgUtilisees').onclick = (e) => {
    if (e.target.closest('.util-tout')) { dlg._retirees.clear(); relancer(); return; }
    const b = e.target.closest('.puce-util'); if (!b) return;
    const cle = b.dataset.cle;
    if (dlg._retirees.has(cle)) dlg._retirees.delete(cle); else dlg._retirees.add(cle);
    relancer();
  };
  // nettoyage facultatif : options retenues, version choisie au-dessus de l'aperçu
  const optN = Object.assign({}, NETTOYAGE_DEFAUT, reglages.nettoyage || {});
  for (const k of Object.keys(NETTOYAGE_DEFAUT)) f['n_' + k].checked = !!optN[k];
  const majVersion = () => $$('#imgVersion button').forEach((b) => b.classList.toggle('actif', b.dataset.version === (reglages.versionImage || 'brute')));
  $$('#imgVersion button').forEach((b) => (b.onclick = () => { reglages.versionImage = b.dataset.version; ecrire(CLE.reglages, reglages); majVersion(); relancer(); }));
  majVersion();
  const surNettoyage = () => {
    reglages.nettoyage = Object.fromEntries(Object.keys(NETTOYAGE_DEFAUT).map((k) => [k, f['n_' + k].checked]));
    ecrire(CLE.reglages, reglages);
    if ((reglages.versionImage || 'brute') === 'brute') { reglages.versionImage = 'nette'; majVersion(); } // on montre l'effet du réglage touché
    relancer();
  };
  for (const k of Object.keys(NETTOYAGE_DEFAUT)) f['n_' + k].onchange = surNettoyage;
  [f.format, f.w, f.h, f.cols, f.rangs, f.max, f.tramage, f.transp, f.rogner].forEach((el) => (el.oninput = el.onchange = relancer));
  dlg.querySelectorAll('.pas-a-pas button').forEach((b) => (b.onclick = () => {
    const champ = b.parentElement.querySelector('input');
    champ.value = borner((+champ.value || 1) + +b.dataset.pas, +champ.min, +champ.max);
    relancer();
  }));
  // placer l'image : taille, déplacement en faisant glisser l'aperçu
  let attente = false;
  const vite = () => { if (attente) return; attente = true; requestAnimationFrame(() => { attente = false; relancer(); }); };
  const majTaille = () => { const pc = Math.round(cadreImage.zoom * 100); f.taille.value = pc; $('#imgTailleVal').textContent = pc + ' %'; };
  f.taille.oninput = () => { cadreImage.zoom = (+f.taille.value || 100) / 100; $('#imgTailleVal').textContent = f.taille.value + ' %'; vite(); };
  $('#imgAjuster').onclick = () => { cadreImage = { zoom: 1, dx: 0, dy: 0 }; majTaille(); relancer(); };
  $('#imgCentrer').onclick = () => { cadreImage.dx = 0; cadreImage.dy = 0; relancer(); };
  $('#imgRemplir').onclick = () => {
    if (!imageChargee) return;
    const b = boiteUtile(f.rogner.checked), su = surfaceImage.surf, a = su.larg / b.w, c = su.haut / b.h;
    cadreImage = { zoom: borner(Math.max(a, c) / Math.min(a, c), 0.3, 4), dx: 0, dy: 0 };
    majTaille(); relancer();
  };
  const ap = $('#apercuImage');
  let prise = null;
  ap.onpointerdown = (e) => {
    if (!imageChargee) return;
    e.preventDefault();
    try { ap.setPointerCapture(e.pointerId); } catch (err) { /* pointeur déjà relâché */ }
    prise = { x: e.clientX, y: e.clientY, dx: cadreImage.dx, dy: cadreImage.dy };
  };
  ap.onpointermove = (e) => {
    if (!prise) return;
    const parPas = ap.clientWidth / surfaceImage.surf.larg; // pixels d'écran pour un pas
    cadreImage.dx = prise.dx + (e.clientX - prise.x) / parPas;
    cadreImage.dy = prise.dy + (e.clientY - prise.y) / parPas;
    vite();
  };
  ap.onpointerup = ap.onpointercancel = () => { prise = null; };
  ap.onwheel = (e) => { if (!imageChargee) return; e.preventDefault(); cadreImage.zoom = borner(cadreImage.zoom * (e.deltaY < 0 ? 1.1 : 0.9), 0.3, 4); majTaille(); vite(); };
  // couleurs ou noir et blanc
  const majTeintes = () => $$('#imgTeintes button').forEach((b) => b.classList.toggle('actif', b.dataset.teinte === (reglages.teintesImage === 'gris' ? 'gris' : 'couleur')));
  $$('#imgTeintes button').forEach((b) => (b.onclick = () => { reglages.teintesImage = b.dataset.teinte; ecrire(CLE.reglages, reglages); majTeintes(); relancer(); }));
  majTeintes();
  dlg._majTaille = majTaille;
  majTaille();
  // sur petit écran, les réglages secondaires sont repliés
  const petit = window.matchMedia('(max-width: 900px)').matches;
  ['imgPliCouleurs', 'imgPliNettoyage', 'imgPliRefs'].forEach((id) => { $('#' + id).open = !petit; });
  dlg._relancer = relancer;
  majRefs();
  majSource();
  relancer();

  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok' || !resultatImage) return;
    // un motif déjà commencé n'est jamais écrasé : l'image s'ouvre dans un nouvel onglet
    if (P.cases.some((v) => v >= 0)) {
      charger(creerMotif(nomImage || 'Image', surfaceImage.format.id, surfaceImage.cfg, P.nuancier || 'hama-midi'));
      message('L’image s’ouvre dans un nouvel onglet : ton motif précédent reste ouvert à côté.', 4000);
    }
    memoriser();
    const { format, cfg, surf } = surfaceImage;
    if (format.id !== P.format) P.pas = GAMMES[format.gamme]?.pas || P.pas;
    P.format = format.id; P.cfg = cfg; SURF = surf;
    P.cases = resultatImage.cases;
    P.couleurs = resultatImage.couleurs;
    S.couleur = 0;
    fini();
  };
  dlg.returnValue = '';
  dlg.showModal();
}

$('#fichierImage').onchange = (e) => {
  const fic = e.target.files[0];
  if (!fic) return;
  const img = new Image();
  img.onload = () => {
    $('#dlgImage')._retirees = new Set();
    imageChargee = img; nomImage = fic.name.replace(/\.[^.]+$/, '').slice(0, 40);
    boiteImage = boiteContenu(img);
    cadreImage = { zoom: 1, dx: 0, dy: 0 };
    $('#imgNom').textContent = fic.name;
    const dlg = $('#dlgImage');
    if (dlg._majTaille) dlg._majTaille();
    dlg._relancer();
  };
  img.onerror = () => avertir('Image illisible.');
  img.src = URL.createObjectURL(fic);
};

const cleCouleur = (c) => `${c.marque || ''}|${c.code}|${c.hex}`;
// Couleurs réellement utilisées par le motif, avec leur nombre de perles : un toucher en retire une,
// ses perles prennent alors automatiquement la couleur la plus proche parmi les autres.
function majUtilisees() {
  const dlg = $('#dlgImage'), zone = $('#imgUtilisees'), retirees = dlg._retirees || new Set();
  const res = resultatImage;
  const util = [];
  if (res) {
    const nb = new Array(res.couleurs.length).fill(0);
    for (const v of res.cases) if (v >= 0) nb[v]++;
    res.couleurs.forEach((c, i) => util.push({ c, n: nb[i] }));
    util.sort((a, b) => b.n - a.n);
  }
  $('#nbUtilisees').textContent = res ? `— ${util.length}` : '';
  const puce = (c, n, retiree) => `<button type="button" class="puce-util${retiree ? ' retiree' : ''}" data-cle="${echap(cleCouleur(c))}" title="${retiree ? 'Remettre cette couleur' : 'Retirer cette couleur : ses perles prendront la couleur la plus proche'}"><i style="background:${echap(c.hex)}"></i><b>${echap(c.code)}</b> ${echap(c.nom || '')}${n === null ? '' : ` <small>${n}</small>`}<span aria-hidden="true">${retiree ? '↺' : '✕'}</span></button>`;
  let html = util.map(({ c, n }) => puce(c, n, false)).join('');
  if (retirees.size) {
    const tous = [...retirees].map((k) => dlg._tous && dlg._tous.get(k)).filter(Boolean);
    html += `<div class="util-retirees"><span class="note">Retirées :</span> ${tous.map((c) => puce(c, null, true)).join('')} <button type="button" class="util-tout">Tout remettre</button></div>`;
  }
  zone.innerHTML = res ? html : '<span class="note">Choisis une image pour voir les couleurs utilisées.</span>';
  dlg._utilisees = util.map((u) => u.c);
}
function calculerImage(f, palette) {
  const info = $('#infoImage'), apercu = $('#apercuImage'), surf = surfaceImage.surf;
  const cm = (v) => (v * (GAMMES[surfaceImage.format.gamme]?.pas || 5) / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  const taille = `${surf.plaques.length} plaque(s) · ${surf.picots.length} picots · ${cm(surf.larg)} × ${cm(surf.haut)} cm`;
  resultatImage = null;
  apercu.width = 0; apercu.height = 0;
  if (!imageChargee) { info.textContent = taille + '. Choisis une image pour voir le motif ici.'; return; }
  if (!palette.length) { info.textContent = 'Aucune référence autorisée : coche au moins une couleur.'; return; }
  const brut = convertirImage(imageChargee, surf, { ...cadreImage, boite: boiteUtile(f.rogner.checked), gris: reglages.teintesImage === 'gris' }, +f.max.value || 0, f.tramage.checked, f.transp.value === '1', palette);
  { const d = $('#dlgImage'); d._tous = d._tous || new Map(); for (const c of palette) d._tous.set(cleCouleur(c), c); }
  const optN = Object.fromEntries(Object.keys(NETTOYAGE_DEFAUT).map((k) => [k, f['n_' + k].checked]));
  const net = nettoyerImage(surf, brut, optN);
  const versionNette = (reglages.versionImage || 'brute') === 'nette';
  resultatImage = versionNette ? net : brut;
  const t = Math.max(2, Math.min(14, Math.floor(440 / Math.max(surf.larg, surf.haut))));
  apercu.width = Math.ceil(surf.larg * t); apercu.height = Math.ceil(surf.haut * t);
  const g = apercu.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, apercu.width, apercu.height);
  if (surf.plaques.length > 1) {
    g.strokeStyle = '#d8cfc4'; g.setLineDash([4, 3]);
    for (const pl of surf.plaques) g.strokeRect(pl.x * t + 0.5, pl.y * t + 0.5, pl.larg * t - 1, pl.haut * t - 1);
    g.setLineDash([]);
  }
  surf.picots.forEach((q, i) => {
    const v = resultatImage.cases[i];
    g.beginPath(); g.arc(q.x * t, q.y * t, v >= 0 ? t * 0.47 : Math.max(0.6, t * 0.12), 0, Math.PI * 2);
    g.fillStyle = v >= 0 ? resultatImage.couleurs[v].hex : '#ddd'; g.fill();
  });
  const nb = resultatImage.cases.filter((v) => v >= 0).length;
  majUtilisees();
  // place réellement occupée par le dessin, en perles
  let gx = Infinity, gy = Infinity, dx = -Infinity, dy = -Infinity;
  surf.picots.forEach((q, i) => { if (resultatImage.cases[i] < 0) return; gx = Math.min(gx, q.x); dx = Math.max(dx, q.x); gy = Math.min(gy, q.y); dy = Math.max(dy, q.y); });
  const occupe = nb ? ` Le dessin occupe ${Math.round(dx - gx + 1)} × ${Math.round(dy - gy + 1)} perles sur ${Math.round(surf.larg)} × ${Math.round(surf.haut)}.` : '';
  const pl = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;
  info.textContent = `${taille} · ${resultatImage.couleurs.length} couleurs · ${nb} perles.${occupe} ` +
    ($('#dlgImage')._noteGris || '') +
    (versionNette ? `Nettoyage : ${pl(net.changees, 'perle')} ${net.changees > 1 ? 'modifiées' : 'modifiée'}.` : `(Le nettoyage modifierait ${pl(net.changees, 'perle')}.)`);
}

function convertirImage(img, surf, cadre, max, tramage, transp, palette) {
  // 1) image posée dans la surface : sa partie utile (cadre.boite), à la taille voulue
  //    (cadre.zoom, 1 = entière et la plus grande possible), décalée de cadre.dx / cadre.dy pas
  const RES = 6; // pixels par pas
  const W = Math.ceil(surf.larg * RES), H = Math.ceil(surf.haut * RES);
  const b = cadre.boite || { x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight };
  const ech = Math.min(W / b.w, H / b.h) * (cadre.zoom || 1);
  const dw = b.w * ech, dh = b.h * ech;
  let src = document.createElement('canvas');
  src.width = Math.max(1, Math.round(b.w)); src.height = Math.max(1, Math.round(b.h));
  src.getContext('2d').drawImage(img, b.x, b.y, b.w, b.h, 0, 0, src.width, src.height);
  let sw = src.width, sh = src.height;
  while (sw / 2 >= dw * 1.5 && sh / 2 >= dh * 1.5) { // réduction par moitiés = vraie moyenne
    const c = document.createElement('canvas');
    c.width = Math.floor(sw / 2); c.height = Math.floor(sh / 2);
    const g = c.getContext('2d'); g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, sw, sh, 0, 0, c.width, c.height);
    src = c; sw = c.width; sh = c.height;
  }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d', { willReadFrequently: true });
  g.imageSmoothingQuality = 'high';
  g.drawImage(src, 0, 0, sw, sh, (W - dw) / 2 + (cadre.dx || 0) * RES, (H - dh) / 2 + (cadre.dy || 0) * RES, dw, dh);
  const px = g.getImageData(0, 0, W, H).data;

  // 2) couleur moyenne autour de chaque picot
  const n = surf.picots.length, rgb = new Float32Array(n * 3), vide = new Uint8Array(n);
  const rr = Math.max(1, Math.floor(RES * 0.4));
  surf.picots.forEach((q, i) => {
    const cx = Math.round(q.x * RES), cy = Math.round(q.y * RES);
    let r = 0, gg = 0, b = 0, a = 0, k = 0;
    for (let dy = -rr; dy <= rr; dy++) for (let dx = -rr; dx <= rr; dx++) {
      if (dx * dx + dy * dy > rr * rr) continue;
      const x = cx + dx, y = cy + dy;
      k++;
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const o = (y * W + x) * 4, al = px[o + 3] / 255;
      r += px[o] * al; gg += px[o + 1] * al; b += px[o + 2] * al; a += al;
    }
    if (a / k < 0.5 && transp) { vide[i] = 1; return; }
    const blanc = k - a; // transparent compté comme blanc
    rgb[i * 3] = (r + 255 * blanc) / k; rgb[i * 3 + 1] = (gg + 255 * blanc) / k; rgb[i * 3 + 2] = (b + 255 * blanc) / k;
  });

  // 2 bis) noir et blanc : chaque picot devient un gris, et le contraste est étiré
  //        (le plus sombre de l'image vers le noir, le plus clair vers le blanc)
  if (cadre.gris) {
    const lum = [];
    for (let i = 0; i < n; i++) {
      if (vide[i]) continue;
      const y = 0.299 * rgb[i * 3] + 0.587 * rgb[i * 3 + 1] + 0.114 * rgb[i * 3 + 2];
      rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = y;
      lum.push(y);
    }
    if (lum.length > 8) {
      lum.sort((a, b) => a - b);
      const bas = lum[Math.floor(lum.length * 0.02)], haut = lum[Math.floor(lum.length * 0.98)];
      if (haut - bas > 20) for (let i = 0; i < n; i++) {
        if (vide[i]) continue;
        const y = Math.max(0, Math.min(255, ((rgb[i * 3] - bas) / (haut - bas)) * 255));
        rgb[i * 3] = rgb[i * 3 + 1] = rgb[i * 3 + 2] = y;
      }
    }
  }

  // 3) couleurs les plus utilisées parmi les références autorisées
  const labs = palette.map((c) => rgbLab(hexRgb(c.hex))), rgbs = palette.map((c) => hexRgb(c.hex)), tous = [...palette.keys()];
  const nb = new Array(palette.length).fill(0);
  for (let i = 0; i < n; i++) if (!vide[i]) nb[plusProche(rgbLab([rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]]), labs, tous)]++;
  let autorises = tous.filter((i) => nb[i] > 0);
  if (max > 0 && autorises.length > max) autorises = autorises.sort((a, b) => nb[b] - nb[a]).slice(0, max);

  // 4) attribution ; tramage = erreur répartie sur les voisins pas encore traités
  const ordreP = [...Array(n).keys()].sort((a, b) => (surf.picots[a].y - surf.picots[b].y) || (surf.picots[a].x - surf.picots[b].x));
  const rang = new Int32Array(n); ordreP.forEach((i, k) => (rang[i] = k));
  const cases = new Array(n).fill(-1);
  for (const i of ordreP) {
    if (vide[i]) continue;
    const c = [0, 1, 2].map((k) => Math.max(0, Math.min(255, rgb[i * 3 + k])));
    const v = plusProche(rgbLab(c), labs, autorises);
    cases[i] = v;
    if (tramage) {
      const suiv = surf.voisins[i].filter((j) => rang[j] > rang[i] && !vide[j]);
      if (suiv.length) for (let k = 0; k < 3; k++) { const e = (c[k] - rgbs[v][k]) / suiv.length; for (const j of suiv) rgb[j * 3 + k] += e * 0.9; }
    }
  }
  // 5) ne garder que les couleurs posées
  const utilisees = [...new Set(cases.filter((v) => v >= 0))].sort((a, b) => a - b);
  const carte = new Map(utilisees.map((v, i) => [v, i]));
  return { cases: cases.map((v) => (v >= 0 ? carte.get(v) : -1)), couleurs: utilisees.map((i) => ({ ...palette[i] })) };
}
