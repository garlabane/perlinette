'use strict';
// Image → motif. On choisit la plaque (et combien), le cadrage et les références
// autorisées ; l'image est échantillonnée à l'emplacement de chaque picot, quelle que
// soit la forme de la plaque (carré, hexagone, rond, plaque dessinée…).

let imageChargee = null, resultatImage = null, surfaceImage = null;

// choix des références, retenu d'une fois sur l'autre
function refsImage() {
  const r = reglages.refsImage || {};
  return { palettes: Array.isArray(r.palettes) && r.palettes.length ? r.palettes : ['hama-midi'], exclues: new Set(r.exclues || []) };
}
function retenirRefs(r) { reglages.refsImage = { palettes: r.palettes, exclues: [...r.exclues] }; ecrire(CLE.reglages, reglages); }

function ouvrirImage() {
  const dlg = $('#dlgImage'), f = dlg.querySelector('form');
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
    const palette = brute.map(({ code, nom, hex, marque }) => ({ code, nom, hex, marque }));
    calculerImage(f, palette);
  };
  [f.format, f.w, f.h, f.cols, f.rangs, f.cadrage, f.max, f.tramage, f.transp].forEach((el) => (el.oninput = el.onchange = relancer));
  dlg._relancer = relancer;
  majRefs();
  majSource();
  relancer();

  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok' || !resultatImage) return;
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
  img.onload = () => { imageChargee = img; $('#dlgImage')._relancer(); };
  img.onerror = () => avertir('Image illisible.');
  img.src = URL.createObjectURL(fic);
};

function calculerImage(f, palette) {
  const info = $('#infoImage'), apercu = $('#apercuImage'), surf = surfaceImage.surf;
  const cm = (v) => (v * (GAMMES[surfaceImage.format.gamme]?.pas || 5) / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  const taille = `${surf.plaques.length} plaque(s) · ${surf.picots.length} picots · ${cm(surf.larg)} × ${cm(surf.haut)} cm`;
  resultatImage = null;
  apercu.width = 0; apercu.height = 0;
  if (!imageChargee) { info.textContent = taille + '. Choisis une image (dessin, logo, photo…) : les dessins simples donnent les meilleurs résultats.'; return; }
  if (!palette.length) { info.textContent = 'Aucune référence autorisée : coche au moins une couleur.'; return; }
  resultatImage = convertirImage(imageChargee, surf, f.cadrage.value, +f.max.value || 0, f.tramage.checked, f.transp.value === '1', palette);
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
  info.textContent = `${taille} · ${resultatImage.couleurs.length} couleurs · ${nb} perles.`;
}

function convertirImage(img, surf, cadrage, max, tramage, transp, palette) {
  // 1) image posée dans la surface : entière (contenir) ou en remplissant tout (remplir)
  const RES = 6; // pixels par pas
  const W = Math.ceil(surf.larg * RES), H = Math.ceil(surf.haut * RES);
  const ech = (cadrage === 'remplir' ? Math.max : Math.min)(W / img.naturalWidth, H / img.naturalHeight);
  const dw = img.naturalWidth * ech, dh = img.naturalHeight * ech;
  let src = img, sw = img.naturalWidth, sh = img.naturalHeight;
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
  g.drawImage(src, 0, 0, sw, sh, (W - dw) / 2, (H - dh) / 2, dw, dh);
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
