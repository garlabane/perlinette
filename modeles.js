'use strict';
// Bibliothèque de modèles prêts à l'emploi. Les thèmes sont dans le dossier « modeles/ »
// (un fichier par thème, qui ajoute ses modèles à MODELES). Un modèle est une petite
// grille de lettres ; il se pose, centré, sur la plaque choisie — carrée ou ronde.

const MODELES = [];

// Outils de dessin pour les modèles « recette » (plaques rondes), partagés par tous les thèmes.
const G = {
  tri(x, y, ax, ay, bx, by, cx, cy) { // point dans un triangle
    const s = (px, py, qx, qy, rx, ry) => (px - rx) * (qy - ry) - (qx - rx) * (py - ry);
    const d1 = s(x, y, ax, ay, bx, by), d2 = s(x, y, bx, by, cx, cy), d3 = s(x, y, cx, cy, ax, ay);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  },
  ell(x, y, cx, cy, rx, ry) { return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1; },
  seg(x, y, x1, y1, x2, y2) { // distance au segment
    const dx = x2 - x1, dy = y2 - y1, t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - x1 - t * dx, y - y1 - t * dy);
  },
  ecartAngle(a, b) { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; },
  pres(x, y, pts, d = 0.6) { return pts.some(([px, py]) => Math.hypot(x - px, y - py) < d); },
  poly(x, y, pts) { // point dans un polygone quelconque
    let dedans = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dedans = !dedans;
    }
    return dedans;
  },
  etoile(n, rExt, rInt, cx = 0, cy = 0) { // sommets d'une étoile à n branches, pointe en haut
    const pts = [];
    for (let k = 0; k < 2 * n; k++) { const r = k % 2 ? rInt : rExt, a = -Math.PI / 2 + (k * Math.PI) / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return pts;
  },
  // repère tourné : u le long de la direction a, v en travers
  tourne(x, y, a) { return [x * Math.cos(a) + y * Math.sin(a), -x * Math.sin(a) + y * Math.cos(a)]; },
  spirale(r, a, pas, n) { return Math.floor(((a / (2 * Math.PI) + r / pas) % 1 + 1) % 1 * n); },
};
const RONDS = ['midi-rond-grand'];
// listes de plaques pour les nouveaux thèmes
const P_PETITS = ['midi-carre-petit']; // petit carré : modèles ≤ 13 perles (chaque plaque a ses propres modèles)
const P_GRANDS = ['midi-carre-grand', 'mini-carre-grand'];                                        // motifs jusqu'à 19 perles
const P_RONDS = ['midi-rond-grand', 'midi-rond-moyen', 'midi-hexa-grand', 'midi-hexa-moyen', 'midi-carre-petit'];
// nuancier selon la taille de perle de la plaque
const NUANCIER_GAMME = { Midi: 'hama-midi', Mini: 'hama-mini', Maxi: 'hama-maxi' };

// Pose un modèle sur une plaque : chaque picot reçoit la lettre (couleur) qui est dessous,
// puis on ajoute le relief, puis on traduit les lettres en vraies couleurs Hama.
function poserModele(m, formatId) {
  const fmt = formatParId(formatId), surf = construireSurface(fmt, {});
  const pal = paletteParId(NUANCIER_GAMME[fmt.gamme] || 'hama-midi'), palMidi = paletteParId('hama-midi');
  let lettres = surf.picots.map(() => null);
  // modèle adapté à la plaque (agrandi lissé ou dessin détaillé) — voir modeles-taille.js
  const adaptees = typeof lettresAdaptees === 'function' ? lettresAdaptees(m, fmt, surf) : null;
  const viaDessin = adaptees && m.dessin && fmt.gamme !== 'Maxi' && tailleUtile(surf) >= SEUIL_DESSIN;
  if (adaptees) {
    lettres = adaptees;
  } else if (m.f) {
    // modèle « recette » : la couleur est calculée à l'emplacement de chaque picot
    // R = rayon utile de la plaque (en pas) : les recettes récentes s'en servent pour s'adapter à la taille
    const cx = surf.larg / 2, cy = surf.haut / 2, R = Math.min(surf.larg, surf.haut) / 2 - 0.5;
    lettres = surf.picots.map((q) => { const x = q.x - cx, y = q.y - cy, l = m.f(x, y, Math.hypot(x, y), Math.atan2(y, x), R); return !l || l === '.' ? null : l; });
  } else {
    const gh = m.grille.length, gw = m.grille[0].length;
    const ox = (surf.larg - gw) / 2, oy = (surf.haut - gh) / 2;
    const cellule = (gx, gy) => (gx < 0 || gy < 0 || gx >= gw || gy >= gh || m.grille[gy][gx] === '.' ? null : m.grille[gy][gx]);
    lettres = surf.picots.map((q) => cellule(Math.floor(q.x - ox), Math.floor(q.y - oy)));
    // plaques non quadrillées : chaque case dessinée « réclame » le picot le plus proche ;
    // en cas de conflit, la couleur la plus rare (les détails) gagne.
    if (fmt.type !== 'carre') {
      const freq = {};
      for (const l of m.grille.join('')) if (l !== '.') freq[l] = (freq[l] || 0) + 1;
      const reclame = new Map();
      for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
        const l = cellule(gx, gy);
        if (!l) continue;
        const i = picotProche(surf, gx + ox + 0.5, gy + oy + 0.5, 0.75);
        if (i < 0) continue;
        const deja = reclame.get(i);
        if (deja === undefined || freq[l] < freq[deja]) reclame.set(i, l);
      }
      for (const [i, l] of reclame) if (!lettres[i] || freq[l] < freq[lettres[i]]) lettres[i] = l;
    }
  }
  const codes = { ...m.couleurs, ...(viaDessin ? m.couleursDessin : {}) };
  // Maxi (plaques enfants) : couleurs franches, sans dégradés
  if (m.relief && !viaDessin && fmt.gamme !== 'Maxi') lettres = appliquerRelief(surf, lettres, m.relief, codes);
  // traduction lettres → couleurs Hama
  const ordreL = [...new Set(lettres.filter(Boolean))];
  // les modèles sont écrits en références Hama Midi ; en Mini / Maxi on prend la même référence
  // si elle existe dans ce nuancier, sinon la couleur la plus proche.
  const labsPal = pal.couleurs.map((c) => rgbLab(hexRgb(c.hex)));
  const couleurs = ordreL.map((l) => {
    let c = pal.couleurs.find((x) => x.code === codes[l]);
    if (!c) {
      const ref = palMidi.couleurs.find((x) => x.code === codes[l]);
      if (!ref) throw new Error(`Modèle « ${m.nom} » : couleur inconnue pour « ${l} » (${codes[l]})`);
      c = pal.couleurs[plusProche(rgbLab(hexRgb(ref.hex)), labsPal, [...labsPal.keys()])];
    }
    return { code: c.code, nom: c.nom, nomOfficiel: c.nomOfficiel, hex: c.hex, marque: nomCourt(pal) };
  });
  // deux lettres peuvent viser la même référence : on fusionne
  const parCode = new Map(), carte = ordreL.map((l, k) => { const code = couleurs[k].code; if (!parCode.has(code)) parCode.set(code, parCode.size); return parCode.get(code); });
  const uniques = [...parCode.keys()].map((code) => couleurs.find((c) => c.code === code));
  const idx = new Map(ordreL.map((l, k) => [l, carte[k]]));
  return { fmt, surf, cases: lettres.map((l) => (l ? idx.get(l) : -1)), couleurs: uniques };
}

// Relief : la lumière vient d'en haut à gauche. Une perle dont le côté éclairé donne sur
// une autre couleur (ou le vide) prend le ton clair ; côté ombre, le ton foncé. Les parties
// d'une seule perle d'épaisseur (éclairées ET dans l'ombre) gardent leur couleur.
// relief = { lettre: ['clair', 'foncé'] } (référence Hama, ou null pour ne pas changer).
const LUMIERE = [-0.6, -0.8];
function appliquerRelief(surf, lettres, relief, codes) {
  const res = lettres.slice();
  surf.picots.forEach((q, i) => {
    const l = lettres[i];
    if (!l || !relief[l]) return;
    let eclaire = false, ombre = false;
    for (const j of surf.voisins[i]) {
      const dx = surf.picots[j].x - q.x, dy = surf.picots[j].y - q.y, n = Math.hypot(dx, dy);
      const p = (dx * LUMIERE[0] + dy * LUMIERE[1]) / n;
      if (lettres[j] === l) continue;
      if (p > 0.3) eclaire = true;
      if (p < -0.3) ombre = true;
    }
    const [clair, fonce] = relief[l];
    if (eclaire && !ombre && clair) { res[i] = l + '+'; codes[l + '+'] = clair; }
    if (ombre && !eclaire && fonce) { res[i] = l + '-'; codes[l + '-'] = fonce; }
  });
  return res;
}

function vignette(canvas, pose, taille) {
  const { surf, cases, couleurs } = pose, t = taille / Math.max(surf.larg, surf.haut);
  canvas.width = Math.ceil(surf.larg * t); canvas.height = Math.ceil(surf.haut * t);
  const g = canvas.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height);
  surf.picots.forEach((q, i) => {
    const v = cases[i];
    g.globalAlpha = v >= 0 && estTransparente(couleurs[v]) ? 0.62 : 1;
    g.beginPath(); g.arc(q.x * t, q.y * t, v >= 0 ? t * 0.47 : Math.max(0.5, t * 0.1), 0, Math.PI * 2);
    g.fillStyle = v >= 0 ? couleurs[v].hex : '#ddd'; g.fill();
    g.globalAlpha = 1;
    if (v >= 0 && couleurs[v].hex.toUpperCase() > '#E0E0E0') { g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 0.6; g.stroke(); }
  });
}

function ouvrirModeles() {
  let dlg = $('#dlgModeles');
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.id = 'dlgModeles'; dlg.className = 'tres-large';
    dlg.innerHTML = `<form method="dialog"><h3>Modèles prêts à l'emploi</h3>
      <div class="nu-outils">
        <label class="case">Thème <select id="modTheme"></select></label>
        <label class="case">Plaque <select id="modPlaque"></select></label>
        <span style="flex:1"></span>
        <button type="button" id="modMot" class="principal">✏️ Écrire une phrase…</button>
      </div>
      <p class="note">Clique sur un modèle : il s'ouvre comme un <b>nouveau motif</b> (ton motif actuel n'est pas touché), que tu peux ensuite modifier.</p>
      <div id="modListe" class="mod-liste"></div>
      <menu><button value="fermer">Fermer</button></menu></form>`;
    document.body.appendChild(dlg);
    $('#modPlaque').onchange = majModeles;
    $('#modTheme').onchange = () => { majPlaquesTheme(); majModeles(); };
    $('#modMot').onclick = () => ecrirePhrase();
  }
  const themes = [...new Set(MODELES.map((m) => m.theme))];
  remplirChoix($('#modTheme'), themes.map((t) => `<option>${echap(t)}</option>`).join(''), $('#modTheme').value || themes[0]);
  majPlaquesTheme();
  majModeles();
  dlg.showModal();
}
// plaques proposées pour le thème choisi (avec le nombre de modèles pour chacune)
function majPlaquesTheme() {
  const theme = $('#modTheme').value, compte = new Map();
  for (const m of MODELES.filter((x) => x.theme === theme)) for (const p of m.plaques || ['midi-carre-grand']) compte.set(p, (compte.get(p) || 0) + 1);
  const avant = $('#modPlaque').value;
  remplirChoix($('#modPlaque'), [...compte.entries()].map(([id, n]) => {
    const f = formatParId(id);
    return `<option value="${id}">${echap(f.gamme)} · ${echap(f.nom)} (${n})</option>`;
  }).join(''), compte.has(avant) ? avant : [...compte.keys()][0]);
}
function majModeles() {
  const theme = $('#modTheme').value, plaque = $('#modPlaque').value;
  const liste = $('#modListe');
  liste.innerHTML = '';
  // chaque modèle dit sur quelles plaques il est prévu (par défaut : le grand carré)
  for (const m of MODELES.filter((x) => x.theme === theme && (x.plaques || ['midi-carre-grand']).includes(plaque))) {
    const pose = poserModele(m, plaque), nb = pose.cases.filter((v) => v >= 0).length;
    const carte = document.createElement('button');
    carte.type = 'button'; carte.className = 'mod-carte';
    const cv = document.createElement('canvas');
    vignette(cv, pose, 150);
    carte.appendChild(cv);
    const soud = analyserSoudure(pose.surf, pose.cases);
    carte.insertAdjacentHTML('beforeend', `<b>${echap(m.nom)}</b><small>${nb} perles · ${pose.couleurs.length} couleurs</small><small class="soudure ${soud.ok ? 'ok' : 'pb'}">${echap(texteSoudure(soud))}</small>`);
    carte.onclick = () => {
      const motif = creerMotif(`${m.nom} (${theme})`, plaque, {}, NUANCIER_GAMME[pose.fmt.gamme] || 'hama-midi');
      motif.cases = pose.cases; motif.couleurs = pose.couleurs;
      if (m.caractere && typeof lettresDepuisModele === 'function') lettresDepuisModele(motif, m);
      charger(motif); sauverMaintenant();
      $('#dlgModeles').close();
      message(`« ${m.nom} » ouvert sur la plaque ${pose.fmt.nom}. Il est enregistré dans « Ouvrir ».`, 4000);
    };
    liste.appendChild(carte);
  }
}
