'use strict';
// Impression A4 à taille réelle, avec aperçu avant d'imprimer.
//  • les plaques sont dessinées en SVG avec des unités en mm : imprimé à 100 %, 1 mm = 1 mm ;
//  • plusieurs plaques par feuille quand elles tiennent (ex. 4 petits carrés de 7 cm) ;
//  • page d'ensemble pour un assemblage (repères A1, A2… + liste complète des perles) ;
//  • sur chaque plaque, flèches vers les plaques voisines ; légende des couleurs par feuille ;
//  • en-tête avec logo (Perlinette, le tien, ou aucun) et titre ; règle de contrôle 5 cm.

const FORMAT_A4 = { portrait: { w: 210, h: 297 }, paysage: { w: 297, h: 210 } };
const BORD = 10, ENTETE = 24, PIED = 14, AUTOUR_X = 7, AUTOUR_Y = 6; // mm
const CLE_LOGO = 'perlesrep.logo';
function mm(v) { return +(+v).toFixed(3); }

function optionsParDefaut() {
  return Object.assign({ couleurs: true, symboles: true, picots: true, legende: 'page', ensemble: true, regrouper: true, logo: 'perlinette', repasse: true }, reglages.impression || {});
}

// ---------- éléments de page ----------
function svgLogo(o, x, y) {
  if (o.logo === 'aucun') return { svg: '', largeur: 0 };
  if (o.logo === 'perso') {
    const img = lire(CLE_LOGO, null);
    if (img) return { svg: `<image href="${img}" x="${x}" y="${y}" width="34" height="13" preserveAspectRatio="xMinYMid meet"/>`, largeur: 36 };
  }
  const p = (cx, cy, c) => `<circle cx="${mm(x + cx)}" cy="${mm(y + cy)}" r="2.6" fill="${c}"/><circle cx="${mm(x + cx)}" cy="${mm(y + cy)}" r="0.9" fill="#fff"/>`;
  return {
    svg: p(6.5, 2.8, '#E8A498') + p(2.8, 6.5, '#E9C704') + p(10.2, 6.5, '#49AE89') + p(6.5, 10.2, '#6e2f5c')
      + `<text x="${mm(x + 15)}" y="${mm(y + 8.4)}" font-size="5" font-weight="700" fill="#6e2f5c" font-family="Segoe UI, sans-serif">Perlinette</text>`,
    largeur: 45,
  };
}
// miniature du motif entier « repassé à fond » (même rendu que l'aperçu Complète), dans un carré de côté `taille`
function svgRepasse(x, y, taille) {
  const d = DEGRES_FUSION[3], k = taille / Math.max(SURF.larg, SURF.haut);
  const ox = x + (taille - SURF.larg * k) / 2, oy = y + (taille - SURF.haut * k) / 2;
  const posee = (i) => P.cases[i] >= 0 && P.couleurs[P.cases[i]], hex = (i) => P.couleurs[P.cases[i]].hex;
  const px = (i) => mm(ox + SURF.picots[i].x * k), py = (i) => mm(oy + SURF.picots[i].y * k);
  let s = `<g stroke-linecap="butt" stroke-width="${mm(d.pont * k)}">`;
  SURF.picots.forEach((q, i) => {
    if (!posee(i)) return;
    for (const j of SURF.voisins[i]) {
      if (j < i || !posee(j)) continue;
      const mx = mm((+px(i) + +px(j)) / 2), my = mm((+py(i) + +py(j)) / 2);
      s += `<path d="M${px(i)} ${py(i)}L${mx} ${my}" stroke="${hex(i)}"/><path d="M${mx} ${my}L${px(j)} ${py(j)}" stroke="${hex(j)}"/>`;
    }
  });
  s += '</g>';
  SURF.picots.forEach((q, i) => {
    if (!posee(i)) return;
    const tr = estTransparente(P.couleurs[P.cases[i]]) ? ' fill-opacity="0.7"' : '';
    s += `<circle cx="${px(i)}" cy="${py(i)}" r="${mm(d.rayon * k)}" fill="${hex(i)}"${tr}/>`;
  });
  return s;
}
function svgEntete(page, o, titre, sousTitre) {
  const logo = svgLogo(o, BORD, 7), x = BORD + logo.largeur;
  let mini = '';
  if (o.repasse && o._repasse) {
    const T = 17, xm = page.w - BORD - T;
    mini = `<rect x="${mm(xm - 1)}" y="3.5" width="${T + 2}" height="${T + 2}" rx="1.5" fill="#f7f3ee"/>` + o._repasse
      + `<text x="${mm(xm - 3)}" y="10.5" font-size="2.6" fill="#666" text-anchor="end" font-family="Segoe UI, sans-serif">Après</text>`
      + `<text x="${mm(xm - 3)}" y="14" font-size="2.6" fill="#666" text-anchor="end" font-family="Segoe UI, sans-serif">repassage</text>`;
  }
  return mini + logo.svg
    + `<text x="${mm(x)}" y="13" font-size="5.2" font-weight="700" fill="#222" font-family="Segoe UI, sans-serif">${echap(titre)}</text>`
    + `<text x="${mm(x)}" y="19" font-size="3" fill="#666" font-family="Segoe UI, sans-serif">${echap(sousTitre)}</text>`
    + `<line x1="${BORD}" y1="22.5" x2="${page.w - BORD}" y2="22.5" stroke="#e2d8cb" stroke-width="0.3"/>`;
}
function svgPied(page, num, total) {
  const y = page.h - 8;
  let s = `<line x1="${BORD}" y1="${y}" x2="${BORD + 50}" y2="${y}" stroke="#222" stroke-width="0.35"/>`;
  for (let t = 0; t <= 5; t++) s += `<line x1="${BORD + t * 10}" y1="${y - (t % 5 ? 1.2 : 2)}" x2="${BORD + t * 10}" y2="${y}" stroke="#222" stroke-width="0.3"/>`;
  s += `<text x="${BORD + 54}" y="${y}" font-size="2.6" fill="#555" dominant-baseline="central">Ce trait doit mesurer 5 cm. Sinon, réimprime en « Taille réelle / 100 % ».</text>`;
  s += `<text x="${page.w - BORD}" y="${y}" font-size="2.8" fill="#555" text-anchor="end" dominant-baseline="central">page ${num} / ${total}</text>`;
  return s;
}
function contourSvg(forme, x, y, w, h, pas) {
  const st = 'fill="none" stroke="#999" stroke-width="0.25" stroke-dasharray="1.5 1"';
  if (forme === 'rond') return `<ellipse cx="${mm(x + w / 2)}" cy="${mm(y + h / 2)}" rx="${mm(w / 2)}" ry="${mm(h / 2)}" ${st}/>`;
  if (forme === 'hexa') {
    const m = (h / 2) / Math.sqrt(3);
    const pts = [[x + m, y], [x + w - m, y], [x + w, y + h / 2], [x + w - m, y + h], [x + m, y + h], [x, y + h / 2]];
    return `<polygon points="${pts.map(([a, b]) => mm(a) + ',' + mm(b)).join(' ')}" ${st}/>`;
  }
  if (forme === 'perso') return '';
  return `<rect x="${mm(x)}" y="${mm(y)}" width="${mm(w)}" height="${mm(h)}" rx="${mm(pas * 0.6)}" ${st}/>`;
}

// une plaque à taille réelle, coin haut-gauche en (x0, y0) mm
function svgPlaque(k, x0, y0, o) {
  const pl = SURF.plaques[k], pas = o.pas, lw = pl.larg * pas, lh = pl.haut * pas, r = pas * 0.46;
  let s = contourSvg(pl.contour.forme, x0, y0, lw, lh, pas);
  SURF.picots.forEach((q, i) => {
    if (q.b !== k) return;
    const cx = mm(x0 + (q.x - pl.x) * pas), cy = mm(y0 + (q.y - pl.y) * pas), v = P.cases[i];
    if (v < 0 || !P.couleurs[v]) { if (o.picots) s += `<circle cx="${cx}" cy="${cy}" r="${mm(pas * 0.09)}" fill="#bbb"/>`; return; }
    const hex = P.couleurs[v].hex;
    s += o.couleurs
      ? `<circle cx="${cx}" cy="${cy}" r="${mm(r)}" fill="${hex}" stroke="#0005" stroke-width="0.15"/>` + (o.symboles ? '' : `<circle cx="${cx}" cy="${cy}" r="${mm(pas * 0.16)}" fill="#fff8"/>`)
      : `<circle cx="${cx}" cy="${cy}" r="${mm(r)}" fill="none" stroke="#333" stroke-width="0.25"/>`;
    if (o.symboles) s += `<text x="${cx}" y="${cy}" font-size="${mm(pas * 0.55)}" fill="${o.couleurs && !clair(hex) ? '#fff' : '#000'}" text-anchor="middle" dominant-baseline="central" font-family="Consolas,monospace" font-weight="700">${echap(SYMBOLES[v % SYMBOLES.length])}</text>`;
  });
  if (SURF.plaques.length > 1) {
    // repère de la plaque et flèches vers ses voisines
    const cols = P.cfg.cols || 1, rangs = P.cfg.rangs || 1, bc = k % cols, br = Math.floor(k / cols);
    const nom = (c, rr) => SURF.plaques[rr * cols + c].etiquette;
    const t = (x, y, txt, ancre = 'middle', taille = 3) => `<text x="${mm(x)}" y="${mm(y)}" font-size="${taille}" fill="#6e2f5c" font-weight="700" text-anchor="${ancre}" dominant-baseline="central" font-family="Segoe UI, sans-serif">${txt}</text>`;
    s += `<rect x="${mm(x0)}" y="${mm(y0 - 5.2)}" width="9" height="4.4" rx="1" fill="#6e2f5c"/>` + `<text x="${mm(x0 + 4.5)}" y="${mm(y0 - 3)}" font-size="3" fill="#fff" font-weight="700" text-anchor="middle" dominant-baseline="central">${pl.etiquette}</text>`;
    if (bc < cols - 1) s += t(x0 + lw + 1.2, y0 + lh / 2, '→ ' + nom(bc + 1, br), 'start', 2.6);
    if (bc > 0) s += t(x0 - 1.2, y0 + lh / 2, nom(bc - 1, br) + ' ←', 'end', 2.6);
    if (br > 0) s += t(x0 + lw / 2, y0 - 2.6, '↑ ' + nom(bc, br - 1), 'middle', 2.6);
    if (br < rangs - 1) s += t(x0 + lw / 2, y0 + lh + 2.8, '↓ ' + nom(bc, br + 1), 'middle', 2.6);
  }
  return s;
}

// comptes de perles par couleur pour un ensemble de plaques
function comptesPlaques(liste) {
  const garde = new Set(liste), n = new Map();
  SURF.picots.forEach((q, i) => { const v = P.cases[i]; if (v >= 0 && garde.has(q.b)) n.set(v, (n.get(v) || 0) + 1); });
  return [...n.entries()].sort((a, b) => b[1] - a[1]);
}
// légende compacte en pastilles ; renvoie { svg, h }
function svgLegende(comptesListe, x, y, largeur, titre) {
  const lc = 47, parLigne = Math.max(1, Math.floor(largeur / lc)), lignes = Math.ceil(comptesListe.length / parLigne);
  let s = `<text x="${mm(x)}" y="${mm(y + 3)}" font-size="3.2" font-weight="700" fill="#333">${echap(titre)}</text>`;
  comptesListe.forEach(([v, nb], k) => {
    const c = P.couleurs[v], cx = x + (k % parLigne) * lc, cy = y + 9 + Math.floor(k / parLigne) * 6.4;
    s += `<circle cx="${mm(cx + 2.4)}" cy="${mm(cy)}" r="2.3" fill="${c.hex}" stroke="#0006" stroke-width="0.2"/>`
      + `<text x="${mm(cx + 2.4)}" y="${mm(cy)}" font-size="2.4" font-weight="700" fill="${clair(c.hex) ? '#000' : '#fff'}" text-anchor="middle" dominant-baseline="central" font-family="Consolas,monospace">${echap(SYMBOLES[v % SYMBOLES.length])}</text>`
      + `<text x="${mm(cx + 6)}" y="${mm(cy)}" font-size="2.6" fill="#333" dominant-baseline="central"><tspan font-weight="700">${echap(c.code || '')}</tspan> ${echap((c.nom || '').slice(0, 20))}</text>`
      + `<text x="${mm(cx + lc - 3)}" y="${mm(cy)}" font-size="2.6" fill="#333" text-anchor="end" dominant-baseline="central" font-weight="700">${nb}</text>`;
  });
  return { svg: s, h: 9 + lignes * 6.4 };
}
function hauteurLegende(nbCouleurs, largeur) { return nbCouleurs ? 9 + Math.ceil(nbCouleurs / Math.max(1, Math.floor(largeur / 47))) * 6.4 + 3 : 0; }

// ---------- mise en page ----------
function preparerPages(o) {
  const total = SURF.plaques.length, pl = SURF.plaques[0], pas = o.pas;
  const lw = pl.larg * pas, lh = pl.haut * pas, celW = lw + 2 * AUTOUR_X + 8, celH = lh + 2 * AUTOUR_Y + 4;
  const zone = (page) => ({ x: BORD, y: ENTETE + 4, w: page.w - 2 * BORD, h: page.h - ENTETE - 4 - PIED });
  const capacite = (page) => ({ c: Math.floor(zone(page).w / celW), r: Math.floor(zone(page).h / celH) });
  // orientation : celle qui met le plus de plaques par feuille (ou celle qui va à la plaque)
  let orient = lw > lh ? 'paysage' : 'portrait';
  if (o.regrouper && total > 1) {
    const cp = capacite(FORMAT_A4.portrait), cl = capacite(FORMAT_A4.paysage);
    if (cl.c * cl.r > cp.c * cp.r) orient = 'paysage'; else if (cp.c * cp.r > 0) orient = 'portrait';
  }
  const page = FORMAT_A4[orient], Z = zone(page), cap = capacite(page);
  o._repasse = o.repasse ? svgRepasse(page.w - BORD - 17, 4.5, 17) : ''; // miniature calculée une fois pour toutes les pages
  const parFeuille = o.regrouper ? Math.max(1, cap.c * Math.max(1, cap.r)) : 1;
  const depasse = lw > Z.w + 0.01 || lh > Z.h + 0.01;
  const nomFormat = formatParId(P.format).nom, ecart = String(pas).replace('.', ',');
  const pages = [];

  // page d'ensemble
  if (total > 1 && o.ensemble) {
    const tous = comptesPlaques(SURF.plaques.map((_, k) => k)), hl = o.legende === 'non' ? 0 : hauteurLegende(tous.length, Z.w);
    const aw = SURF.larg * pas, ah = SURF.haut * pas, e = Math.min(Z.w / aw, (Z.h - hl - 6) / ah, 1);
    const x0 = Z.x + (Z.w - aw * e) / 2, y0 = Z.y + 2;
    let s = '';
    SURF.plaques.forEach((p) => {
      s += `<rect x="${mm(x0 + p.x * pas * e)}" y="${mm(y0 + p.y * pas * e)}" width="${mm(p.larg * pas * e)}" height="${mm(p.haut * pas * e)}" fill="#faf7f3" stroke="#b9ab9c" stroke-width="0.3" stroke-dasharray="1.2 0.8"/>`;
    });
    SURF.picots.forEach((q, i) => { const v = P.cases[i]; if (v >= 0) s += `<circle cx="${mm(x0 + q.x * pas * e)}" cy="${mm(y0 + q.y * pas * e)}" r="${mm(pas * e * 0.47)}" fill="${P.couleurs[v].hex}"/>`; });
    SURF.plaques.forEach((p) => {
      s += `<text x="${mm(x0 + (p.x + p.larg / 2) * pas * e)}" y="${mm(y0 + (p.y + p.haut / 2) * pas * e)}" font-size="${mm(Math.min(14, p.larg * pas * e * 0.3))}" fill="#6e2f5c" fill-opacity="0.55" font-weight="700" text-anchor="middle" dominant-baseline="central">${p.etiquette}</text>`;
    });
    if (hl) s += svgLegende(tous, Z.x, y0 + ah * e + 6, Z.w, `Toutes les perles : ${tous.reduce((a, [, n]) => a + n, 0)}`).svg;
    pages.push({ type: 'ensemble', corps: s, titre: o.titre, sousTitre: `Vue d'ensemble · ${P.cfg.cols || 1} × ${P.cfg.rangs || 1} plaques (${nomFormat}) · ${echap('réduite, pas à taille réelle')}` });
  }

  // feuilles de plaques (regroupées si elles tiennent), légende de la feuille en bas
  const file = SURF.plaques.map((_, k) => k), legendesAPart = [];
  while (file.length) {
    let groupe = file.splice(0, parFeuille);
    const hl = (g) => (o.legende === 'page' ? hauteurLegende(comptesPlaques(g).length, Z.w) : 0);
    // trop haut avec la légende : on garde moins de plaques sur cette feuille
    const lignesDe = (g) => Math.ceil(g.length / Math.max(1, cap.c));
    while (groupe.length > 1 && lignesDe(groupe) * celH + hl(groupe) > Z.h) file.unshift(groupe.pop());
    const legendeIci = o.legende === 'page' && (lignesDe(groupe) * celH + hl(groupe) <= Z.h + 0.01 || depasse === false && groupe.length === 1 && lh + hl(groupe) <= Z.h);
    const cols = Math.min(groupe.length, Math.max(1, cap.c)), lignes = Math.ceil(groupe.length / cols);
    const hDispo = Z.h - (legendeIci ? hl(groupe) : 0);
    const debutX = Z.x + (Z.w - cols * celW) / 2, debutY = Z.y + Math.max(0, (hDispo - lignes * celH) / 2);
    let s = '';
    groupe.forEach((k, j) => {
      const c = j % cols, r = Math.floor(j / cols);
      // plaque plus grande que la feuille : centrée en largeur, collée en haut (les bords seront coupés)
      const x = depasse ? Z.x + (Z.w - lw) / 2 : debutX + c * celW + (celW - lw) / 2;
      const y = depasse ? Z.y + AUTOUR_Y : debutY + r * celH + (celH - lh) / 2;
      s += svgPlaque(k, x, y, o);
    });
    if (legendeIci) s += svgLegende(comptesPlaques(groupe), Z.x, Z.y + Z.h - hl(groupe) + 1, Z.w, groupe.length > 1 ? 'Couleurs de cette feuille' : 'Couleurs de cette plaque').svg;
    else if (o.legende === 'page') legendesAPart.push(groupe);
    const noms = groupe.map((k) => SURF.plaques[k].etiquette);
    const nb = comptesPlaques(groupe).reduce((a, [, n]) => a + n, 0);
    pages.push({ type: 'plaques', corps: s, titre: o.titre, sousTitre: `${nomFormat}${total > 1 ? ` · plaque${groupe.length > 1 ? 's' : ''} ${noms.join(', ')}` : ''} · écart ${ecart} mm · ${nb} perles` });
    // légende trop grande pour la feuille : page juste après
    if (o.legende === 'page' && !legendeIci) {
      pages.push({ type: 'legende', corps: svgLegende(comptesPlaques(groupe), Z.x, Z.y + 2, Z.w, `Couleurs de ${noms.join(', ')}`).svg, titre: o.titre, sousTitre: 'Légende des couleurs' });
    }
  }

  // légende complète à la fin (tableau détaillé avec le stock)
  if (o.legende === 'fin') {
    const n = comptes(), lignes = P.couleurs.map((c, i) => [c, i, n[i]]).filter(([, , nb]) => nb > 0);
    const parPage = Math.floor((Z.h - 14) / 7);
    for (let d = 0; d < lignes.length; d += parPage) {
      let s = '', y = Z.y + 6;
      const tete = (x, t, a = 'start') => `<text x="${mm(x)}" y="${mm(y)}" font-size="2.8" font-weight="700" fill="#555" text-anchor="${a}">${t}</text>`;
      s += tete(Z.x, '') + tete(Z.x + 8, 'Sym.') + tete(Z.x + 20, 'Marque') + tete(Z.x + 58, 'Réf.') + tete(Z.x + 78, 'Couleur') + tete(Z.x + Z.w - 30, 'Nombre', 'end') + tete(Z.x + Z.w, 'En stock', 'end');
      lignes.slice(d, d + parPage).forEach(([c, i, nb], k) => {
        const yy = y + 7 + k * 7, st = stockDe(c), manque = st !== null && nb > st;
        const t = (x, txt, a = 'start', g = false) => `<text x="${mm(x)}" y="${mm(yy)}" font-size="3" fill="#222" text-anchor="${a}" dominant-baseline="central"${g ? ' font-weight="700"' : ''}>${txt}</text>`;
        s += `<circle cx="${mm(Z.x + 3)}" cy="${mm(yy)}" r="2.4" fill="${c.hex}" stroke="#0006" stroke-width="0.2"/>`
          + t(Z.x + 8, echap(SYMBOLES[i % SYMBOLES.length]), 'start', true) + t(Z.x + 20, echap(marqueDe(c))) + t(Z.x + 58, echap(c.code || '—'), 'start', true)
          + t(Z.x + 78, echap(c.nom)) + t(Z.x + Z.w - 30, nb, 'end', true) + t(Z.x + Z.w, st === null ? '' : st + (manque ? ` (manque ${nb - st})` : ''), 'end');
        s += `<line x1="${Z.x}" y1="${mm(yy + 3.5)}" x2="${Z.x + Z.w}" y2="${mm(yy + 3.5)}" stroke="#eee" stroke-width="0.2"/>`;
      });
      pages.push({ type: 'legende', corps: s, titre: o.titre, sousTitre: `Perles nécessaires · ${n.reduce((a, b) => a + b, 0)} au total` });
    }
  }
  // assemblage des pages complètes (en-tête + corps + pied)
  const svgs = pages.map((p, k) => `<svg xmlns="http://www.w3.org/2000/svg" width="${page.w}mm" height="${page.h}mm" viewBox="0 0 ${page.w} ${page.h}">`
    + `<rect width="${page.w}" height="${page.h}" fill="#fff"/>` + svgEntete(page, o, p.titre, p.sousTitre) + p.corps + svgPied(page, k + 1, pages.length) + '</svg>');
  return { svgs, orient, page, parFeuille, depasse, lw, lh, Z };
}

// ---------- fenêtre d'aperçu ----------
function ouvrirImpression() {
  const o = optionsParDefaut();
  o.pas = P.pas; o.titre = P.nom;
  const dlg = document.createElement('dialog');
  dlg.className = 'tres-large impr';
  dlg.innerHTML = `<form method="dialog"><h3>Aperçu avant impression</h3>
    <div class="impr-grille">
      <div class="impr-options">
        <label>Titre sur les feuilles <input id="ipTitre"></label>
        <label>Écart entre deux picots (mm) <input id="ipPas" type="number" min="1" max="20" step="0.05"><small>Midi 5 · Mini 2,5 · Maxi 10. Mesure 10 picots et divise par 10.</small></label>
        <h4>Perles</h4>
        <label class="case"><input type="checkbox" id="ipCouleurs"> En couleur (sinon : à colorier)</label>
        <label class="case"><input type="checkbox" id="ipSymboles"> Symboles dans les perles</label>
        <label class="case"><input type="checkbox" id="ipPicots"> Picots vides visibles</label>
        <label class="case"><input type="checkbox" id="ipRepasse"> Miniature « après repassage » en haut</label>
        <h4>Légende des couleurs</h4>
        <select id="ipLegende"><option value="page">Sur chaque feuille</option><option value="fin">Tableau à la fin (avec le stock)</option><option value="non">Aucune</option></select>
        <h4>Plusieurs plaques</h4>
        <label class="case"><input type="checkbox" id="ipRegrouper"> Plusieurs plaques par feuille si elles tiennent</label>
        <label class="case"><input type="checkbox" id="ipEnsemble"> Page d'ensemble au début</label>
        <h4>Logo en haut de page</h4>
        <div class="segment" id="ipLogo"><button type="button" data-v="perlinette">Perlinette</button><button type="button" data-v="perso">Le mien</button><button type="button" data-v="aucun">Aucun</button></div>
        <div id="ipLogoPerso" class="nu-outils"><button type="button" id="ipChoisirLogo">Choisir mon logo…</button><img id="ipLogoApercu" alt=""></div>
        <p id="ipInfo" class="note"></p>
      </div>
      <div class="impr-pages" id="ipPages"></div>
    </div>
    <menu><button value="annuler" formnovalidate>Annuler</button><button value="ok" class="principal">Imprimer</button></menu></form>`;
  document.body.appendChild(dlg);
  const $d = (s) => dlg.querySelector(s);
  $d('#ipTitre').value = o.titre; $d('#ipPas').value = o.pas;
  $d('#ipCouleurs').checked = o.couleurs; $d('#ipSymboles').checked = o.symboles; $d('#ipPicots').checked = o.picots; $d('#ipRepasse').checked = o.repasse;
  $d('#ipLegende').value = o.legende; $d('#ipRegrouper').checked = o.regrouper; $d('#ipEnsemble').checked = o.ensemble;
  const multi = SURF.plaques.length > 1;
  $d('#ipEnsemble').closest('label').hidden = !multi;
  let rendu = null;
  const lireOptions = () => Object.assign(o, {
    titre: $d('#ipTitre').value.trim() || P.nom, pas: +$d('#ipPas').value || P.pas,
    couleurs: $d('#ipCouleurs').checked, symboles: $d('#ipSymboles').checked, picots: $d('#ipPicots').checked, repasse: $d('#ipRepasse').checked,
    legende: $d('#ipLegende').value, regrouper: $d('#ipRegrouper').checked, ensemble: $d('#ipEnsemble').checked,
  });
  const maj = () => {
    lireOptions();
    dlg.querySelectorAll('#ipLogo [data-v]').forEach((b) => b.classList.toggle('actif', b.dataset.v === o.logo));
    $d('#ipLogoPerso').hidden = o.logo !== 'perso';
    const img = lire(CLE_LOGO, null); $d('#ipLogoApercu').src = img || ''; $d('#ipLogoApercu').hidden = !img;
    rendu = preparerPages(o);
    $d('#ipPages').innerHTML = rendu.svgs.map((s, k) => `<div class="impr-page ${rendu.orient}" title="Page ${k + 1}">${s}</div>`).join('');
    const cm = (v) => (v / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
    $d('#ipInfo').innerHTML = `<b>${rendu.svgs.length} feuille${rendu.svgs.length > 1 ? 's' : ''}</b> A4 en ${rendu.orient}`
      + (multi ? ` · jusqu'à ${rendu.parFeuille} plaque${rendu.parFeuille > 1 ? 's' : ''} par feuille` : '')
      + ` · plaque de ${cm(rendu.lw)} × ${cm(rendu.lh)} cm à taille réelle.`
      + (rendu.depasse ? ` <b style="color:#a33">La plaque dépasse la zone imprimable d'un A4 : ses bords seront coupés.</b>` : '');
  };
  let minuterie = null;
  dlg.querySelectorAll('.impr-options input, .impr-options select').forEach((el) => (el.oninput = el.onchange = () => { clearTimeout(minuterie); minuterie = setTimeout(maj, 120); }));
  dlg.querySelectorAll('#ipLogo [data-v]').forEach((b) => (b.onclick = () => {
    o.logo = b.dataset.v;
    if (o.logo === 'perso' && !lire(CLE_LOGO, null)) $d('#ipChoisirLogo').click(); else maj();
  }));
  $d('#ipChoisirLogo').onclick = () => {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
      const fic = inp.files[0]; if (!fic) return;
      const img = new Image();
      img.onload = () => {
        // logo réduit (largeur 600 px au plus) pour rester léger dans la mémoire du navigateur
        const e = Math.min(1, 600 / img.naturalWidth), c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * e); c.height = Math.round(img.naturalHeight * e);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        if (!ecrire(CLE_LOGO, c.toDataURL('image/png'))) { message('Logo trop lourd pour être retenu.'); return; }
        o.logo = 'perso'; maj();
      };
      img.src = URL.createObjectURL(fic);
    };
    inp.click();
  };
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'ok') {
      lireOptions();
      if (o.pas !== P.pas) { P.pas = o.pas; sauverAuto(); }
      reglages.impression = { couleurs: o.couleurs, symboles: o.symboles, picots: o.picots, legende: o.legende, regrouper: o.regrouper, ensemble: o.ensemble, logo: o.logo, repasse: o.repasse };
      ecrire(CLE.reglages, reglages);
      imprimerPages(preparerPages(o));
    }
    dlg.remove();
  });
  maj();
  dlg.showModal();
}

function imprimerPages(r) {
  $('#impression').innerHTML = r.svgs.map((s) => `<div class="a4-feuille" style="width:${r.page.w}mm;height:${r.page.h}mm">${s}</div>`).join('');
  let st = $('#styleA4');
  if (!st) { st = document.createElement('style'); st.id = 'styleA4'; document.head.appendChild(st); }
  st.textContent = `@page { size: A4 ${r.orient === 'paysage' ? 'landscape' : 'portrait'}; margin: 0; }`;
  const nettoyer = () => { st.textContent = ''; window.removeEventListener('afterprint', nettoyer); };
  window.addEventListener('afterprint', nettoyer);
  setTimeout(() => window.print(), 50);
}
