'use strict';
// Tablettes : une disposition pensée pour le doigt, comme les applis de dessin.
//  • « tactile » : dès que l'écran se pilote au doigt (pointer: coarse), ou au premier toucher ;
//    on peut aussi le forcer (Réglages de la disposition, ou « ?tactile=1 / 0 » dans l'adresse).
//  • trois paliers de place : compact (< 700 px), moyen (700 à 1100), large (≥ 1100).
//    Jusqu'à 900 px de large, la mise en page « téléphone » (barres en bas) reste celle de tactile.js ;
//    au-delà, sur un écran tactile (tablette tenue à l'horizontale…), on passe en « tablette » :
//      – en haut : Modèles, Menu, le nom du motif, Poser, Imprimer, Partager, Réglages ;
//      – à gauche, sous le pouce : un rail d'outils en grosses icônes avec un mot ;
//      – à droite, sous l'autre pouce : les couleurs du motif en grosses pastilles ;
//      – le tiroir « Réglages » : le panneau complet (plaque, aperçu du repassage, couleurs détaillées).
//  • une touche = l'action ; toucher une 2e fois l'outil déjà choisi, ou garder le doigt appuyé,
//    ouvre ses options juste à côté (un petit triangle dans le coin montre qu'il y en a).
//  • « Je suis gaucher » inverse les deux rails.
// La version ordinateur n'est pas touchée : tout ici ne vaut que pour body.tablette / body.tactile.

const TB = { tactile: false, bulle: null, appui: null };
// l'élément touché (un évènement peut viser le document lui-même)
const cible = (e) => (e.target instanceof Element ? e.target : document.body);

function choixDisposition() {
  const q = new URLSearchParams(location.search).get('tactile');
  if (q === '1') return true;
  if (q === '0') return false;
  if (reglages.disposition === 'tactile') return true;
  if (reglages.disposition === 'ordinateur') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}
function palierEcran() { const w = window.innerWidth; return w < 700 ? 'compact' : w < 1100 ? 'moyen' : 'large'; }

function majDisposition(recadrer) {
  const b = document.body, avant = b.classList.contains('tablette');
  b.classList.toggle('tactile', TB.tactile);
  b.dataset.palier = palierEcran();
  b.classList.toggle('tablette', TB.tactile && window.innerWidth > 900 && !b.classList.contains('enfant'));
  b.classList.toggle('gaucher', !!reglages.gaucher);
  if (!b.classList.contains('tablette')) { b.classList.remove('tiroir-ouvert'); fermerBulle(); }
  else b.classList.toggle('tiroir-ouvert', b.dataset.palier === 'large' && !!reglages.tiroirOuvert);
  majBoutonTiroir();
  if ((recadrer || avant !== b.classList.contains('tablette')) && typeof SURF !== 'undefined' && SURF) setTimeout(zoomAjuster, 30);
}

// ---------- icônes (même dessin que les outils existants : trait prune, remplissage clair .f) ----------
const ICO = {
  modeles: '<path class="f" d="M4 4h7v7H4zM13 13h7v7h-7z"/><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  poser: '<path class="f" d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11"/><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4.5a1.5 1.5 0 0 1 3 0v6M14 10.5V6a1.5 1.5 0 0 1 3 0v8c0 4-2.5 7-6 7-2.5 0-4-1.200-5.500-3.500L3.700 14.600a1.500 1.500 0 0 1 2.500-1.700L8 15"/>',
  imprimer: '<path class="f" d="M6 14h12v7H6z"/><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2M6 14h12v7H6z"/>',
  partager: '<path d="M12 3v12M12 3l-4 4M12 3l4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
  reglages: '<path class="f" d="M9 6a2 2 0 1 0 4 0 2 2 0 1 0-4 0M13 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/><path d="M4 6h5M13 6h7M9 6a2 2 0 1 0 4 0 2 2 0 1 0-4 0M4 18h9M17 18h3M13 18a2 2 0 1 0 4 0 2 2 0 1 0-4 0M4 12h2M10 12h10M6 12a2 2 0 1 0 4 0 2 2 0 1 0-4 0"/>',
  formes: '<path class="f" d="M3 13h8v8H3z"/><path d="M3 13h8v8H3zM17.5 3a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7M5 9l5-6"/>',
  plus: '<path d="M5 12h.01M12 12h.01M19 12h.01"/><path d="M4 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0M11 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0M18 12a1 1 0 1 0 2 0 1 1 0 1 0-2 0"/>',
  texte: '<path class="f" d="M5 5h14v4H5z"/><path d="M5 8V5h14v3M12 5v14M9 19h6"/>',
  ajout: '<path d="M12 5v14M5 12h14"/>',
  contour: '<path class="f" d="M8 8h8v8H8z"/><path d="M8 8h8v8H8zM4 4h16v16H4z"/>',
  contourPlus: '<path class="f" d="M9 9h6v6H9z"/><path d="M9 9h6v6H9zM4 4h16v16H4zM19 1v4M17 3h4"/>',
  contourMoins: '<path class="f" d="M9 9h6v6H9z"/><path d="M9 9h6v6H9zM4 4h16v16H4" stroke-dasharray="2 2.5"/><path d="M17 3h4"/>',
};
const svgIco = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICO[k]}</svg>`;
const svgDe = (sel) => { const s = document.querySelector(`.outils ${sel} svg`); return s ? s.outerHTML : ''; };

// ---------- le rail des outils ----------
const TB_FORMES = [['ligne', 'Ligne'], ['rect', 'Rectangle'], ['ellipse', 'Cercle']];
function construireRail() {
  if ($('#railTactile')) return;
  const rail = document.createElement('aside');
  rail.id = 'railTactile'; rail.className = 'rail-tactile'; rail.setAttribute('aria-label', 'Outils');
  const forme = TB_FORMES.some(([o]) => o === reglages.forme) ? reglages.forme : 'rect';
  const outil = (o, mot, opt) => `<button type="button" class="outil${opt ? ' a-options' : ''}" data-outil="${o}" data-options="${opt || ''}" title="${mot}">${svgDe(`[data-outil="${o}"]`)}<span>${mot}</span></button>`;
  rail.innerHTML = `
    <button type="button" data-action="annuler" class="a-options" data-options="annuler" title="Annuler">${svgDe('[data-action="annuler"]')}<span>Annuler</span></button>
    <span class="rail-sep"></span>
    ${outil('crayon', 'Crayon')}
    ${outil('gomme', 'Gomme')}
    ${outil('remplir', 'Remplir')}
    ${outil('pipette', 'Pipette')}
    <button type="button" class="outil a-options" data-outil="${forme}" data-options="formes" id="railForme" title="Formes">${svgDe(`[data-outil="${forme}"]`)}<span>Formes</span></button>
    <button type="button" class="a-options" data-options="texte" id="railTexte" title="Texte">${svgIco('texte')}<span>Texte</span></button>
    ${outil('selection', 'Sélection')}
    ${outil('main', 'Déplacer')}
    <button type="button" class="a-options" data-options="plus" title="Plus d'outils">${svgIco('plus')}<span>Plus</span></button>`;
  $('#app').appendChild(rail);
  // l'outil en cours reste en surbrillance (choisirOutil met à jour toutes les « .outil »)
  if (typeof S !== 'undefined') $$('#railTactile .outil').forEach((b) => b.classList.toggle('actif', b.dataset.outil === S.outil));
}

// ---------- les mêmes outils sur ordinateur et téléphone : Formes regroupées, Texte ----------
function svgForme(o) { return svgDe(`[data-outil="${o}"]`) || ''; }
function majBoutonsFormes(o) {
  $$('[data-options="formes"]').forEach((b) => {
    if (b.dataset.outil === o) return;
    b.dataset.outil = o;
    const ancien = b.querySelector('svg'); if (ancien) ancien.outerHTML = svgForme(o);
  });
  if (typeof S !== 'undefined') setTimeout(() => $$('[data-options="formes"]').forEach((b) => b.classList.toggle('actif', S.outil === o)), 0);
}
function construireOutilsCommuns() {
  const grille = $('.grille-outils');
  if (!grille || grille.querySelector('[data-options="formes"]')) return;
  const forme = TB_FORMES.some(([o]) => o === reglages.forme) ? reglages.forme : 'rect';
  grille.querySelector('[data-outil="ellipse"]').insertAdjacentHTML('afterend',
    `<button class="outil a-options" data-outil="${forme}" data-options="formes" title="Formes : ligne, rectangle, cercle — clique encore pour choisir (L, Q, O)">${svgForme(forme)}<span>Formes</span></button>`
    + `<button class="a-options" data-options="texte" title="Texte : écrire sur la plaque (T)">${svgIco('texte')}<span>Texte</span></button>`
    + `<button class="a-options" data-options="contour" title="Contour : ajouter un anneau de perles autour du dessin, ou retirer le plus extérieur">${svgIco('contour')}<span>Contour</span></button>`);
  TB_FORMES.forEach(([o]) => grille.querySelector(`.outil[data-outil="${o}"]:not([data-options])`)?.classList.add('forme-seule'));
  // « + Couleur » ouvre la palette en éventail (le nuancier complet reste au bout)
  const plusC = $('.cote .ligne-boutons [data-action="ajouterCouleur"]');
  if (plusC) { plusC.removeAttribute('data-action'); plusC.classList.add('a-options'); plusC.dataset.options = 'couleurs'; }
}
// un outil de forme choisi au clavier (L, Q, O) : le bouton Formes le suit
if (typeof choisirOutil === 'function') {
  const choisirOutilDOrigine = choisirOutil;
  choisirOutil = function (o) { if (TB_FORMES.some(([f]) => f === o)) { reglages.forme = o; majBoutonsFormes(o); } choisirOutilDOrigine(o); };
}
// T : l'outil Texte, au clavier
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() !== 't' || e.ctrlKey || e.metaKey || e.altKey || cible(e).closest('input, textarea, select, dialog[open], #panneauTexte')) return;
  if (document.body.classList.contains('enfant') || document.body.classList.contains('pose-ouverte')) return;
  e.preventDefault(); ouvrirPanneauTexte();
});

// ---------- l'en-tête ----------
function construireEntete() {
  if ($('#tbModeles')) return;
  const bouton = (id, ico, mot, attrs = '') => `<button type="button" id="${id}" class="tb" ${attrs}>${svgIco(ico)}<span>${mot}</span></button>`;
  $('#btnMenu').insertAdjacentHTML('beforebegin', bouton('tbModeles', 'modeles', 'Modèles', 'data-action="modeles"'));
  $('.barre [data-action="partager"]').insertAdjacentHTML('beforebegin', bouton('tbPoser', 'poser', 'Poser', 'data-action="poser"'));
  $('.barre [data-action="imprimer"]').insertAdjacentHTML('afterend', bouton('tbReglages', 'reglages', 'Réglages', 'aria-expanded="false"'));
  $('#tbReglages').onclick = () => basculerTiroir();
}
function basculerTiroir(ouvrir) {
  const ouvert = document.body.classList.toggle('tiroir-ouvert', ouvrir);
  if (document.body.dataset.palier === 'large') { reglages.tiroirOuvert = ouvert; ecrire(CLE.reglages, reglages); }
  majBoutonTiroir();
  fermerBulle();
}
function majBoutonTiroir() { const b = $('#tbReglages'); if (b) { b.setAttribute('aria-expanded', document.body.classList.contains('tiroir-ouvert')); b.classList.toggle('actif', document.body.classList.contains('tiroir-ouvert')); } }

// ---------- le rail des couleurs : un « + » en bas ----------
function construireRailCouleurs() {
  if ($('#railPlus')) return;
  const sec = $('.couleurs-section');
  sec.insertAdjacentHTML('beforeend', `<button type="button" id="railPlus" class="rail-plus a-options" data-options="couleurs" title="Ajouter une couleur">${svgIco('ajout')}</button>`);
}

// ---------- les bulles d'options ----------
function fermerBulle() { if (TB.bulle) { TB.bulle.remove(); TB.bulle = null; } }
function ouvrirBulle(ancre, contenu) {
  fermerBulle();
  const b = document.createElement('div');
  b.className = 'bulle-options'; b.setAttribute('role', 'menu');
  b.innerHTML = contenu;
  document.body.appendChild(b);
  const r = ancre.getBoundingClientRect(), w = b.offsetWidth, h = b.offsetHeight, m = 8;
  const aDroite = r.left < window.innerWidth / 2;               // ancre à gauche : la bulle s'ouvre vers la droite
  let x = aDroite ? r.right + m : r.left - w - m, y = r.bottom - h;
  if (ancre.closest('.barre')) { x = Math.min(window.innerWidth - w - m, Math.max(m, r.left + r.width / 2 - w / 2)); y = r.bottom + m; }
  else if (r.bottom > window.innerHeight - 140 && r.width > 0 && !ancre.closest('.cote')) { x = r.left + r.width / 2 - w / 2; y = r.top - h - m; } // barre du bas : au-dessus
  b.style.left = Math.round(Math.max(m, Math.min(window.innerWidth - w - m, x))) + 'px';
  b.style.top = Math.round(Math.max(m, Math.min(window.innerHeight - h - m, y))) + 'px';
  TB.bulle = b;
  // un choix dans la bulle : l'action se fait (délégation globale de app.js), puis la bulle se ferme
  b.addEventListener('click', (e) => { const x2 = cible(e).closest('button'); if (x2 && !x2.dataset.garder) setTimeout(fermerBulle, 0); });
  return b;
}
const ligneBulle = (attrs, ico, mot, actif) => `<button type="button" ${attrs}${actif ? ' class="actif"' : ''}>${ico}<span>${mot}</span></button>`;

function contenuOptions(type) {
  if (type === 'annuler') return ligneBulle('data-action="annuler"', svgDe('[data-action="annuler"]'), 'Annuler')
    + ligneBulle('data-action="refaire"', svgDe('[data-action="refaire"]'), 'Refaire');
  if (type === 'formes') {
    const plein = $('#optPlein').checked;
    return TB_FORMES.map(([o, mot]) => ligneBulle(`data-outil="${o}" data-forme="${o}"`, svgDe(`[data-outil="${o}"]`), mot, S.outil === o)).join('')
      + `<div class="bulle-segment">${ligneBulle('data-plein="0" data-garder="1"', '', 'Évidé', !plein)}${ligneBulle('data-plein="1" data-garder="1"', '', 'Plein', plein)}</div>`;
  }
  if (type === 'plus') return [
    ['data-outil="remplacer"', svgDe('[data-outil="remplacer"]'), 'Remplacer'],
    ['data-outil="lettre"', svgDe('[data-outil="lettre"]'), 'Couleur lettre'],
    ['data-action="contourPlus"', svgIco('contourPlus'), 'Ajouter un contour'],
    ['data-action="contourMoins"', svgIco('contourMoins'), 'Retirer le contour'],
    ['data-action="miroirH"', svgDe('[data-action="miroirH"]'), 'Miroir ↔'],
    ['data-action="miroirV"', svgDe('[data-action="miroirV"]'), 'Miroir ↕'],
    ['data-action="ajuster"', svgDe('[data-action="ajuster"]'), 'Tout voir'],
    ['data-action="repasser"', svgDe('[data-action="repasser"]'), 'Repasser'],
    ['data-action="versPlaque"', svgDe('[data-action="versPlaque"]'), 'Créer une plaque'],
    ['data-action="vider" class="danger"', svgDe('[data-action="vider"]'), 'Tout effacer'],
  ].map(([a, i, m]) => ligneBulle(a, i, m)).join('');
  if (type === 'contour') {
    const c = P.couleurs[S.couleur];
    return `<div class="bulle-titre">Contour, couche par couche</div>`
      + ligneBulle('data-action="contourPlus"', svgIco('contourPlus'), `Ajouter un contour <small>${c ? `<i class="bulle-perle" style="background:${c.hex}"></i>${echap(nomCouleur(c))}` : ''}</small>`)
      + ligneBulle('data-action="contourMoins"', svgIco('contourMoins'), 'Retirer le contour extérieur');
  }
  if (type === 'texte') {
    const t0 = reglages.texteTaille || '1';
    return `<div class="bulle-titre">Taille des lettres <small>${echap(styleLettres().info)}</small></div>`
      + [['1', 'Petites', '7 rangées'], ['2', 'Moyennes', '13 rangées'], ['3', 'Grandes', '19 rangées']]
        .map(([v, mot, rg]) => ligneBulle(`data-taille="${v}"`, `<b class="bulle-a" style="font-size:${10 + 4 * v}px">A</b>`, `${mot} <small>${rg}</small>`, v === t0)).join('');
  }
  return '';
}
function ouvrirOptions(bouton) {
  const type = bouton.dataset.options;
  if (!type) return;
  if (type === 'couleurs') { ouvrirEventail(bouton); return; }
  if (type === 'texte' && TB.appui !== 'long') { ouvrirPanneauTexte(); return; }
  if (type === 'texte') {
    const b = ouvrirBulle(bouton, contenuOptions('texte'));
    b.querySelectorAll('[data-taille]').forEach((x) => x.addEventListener('click', () => { reglages.texteTaille = x.dataset.taille; ecrire(CLE.reglages, reglages); ouvrirPanneauTexte(); }));
    return;
  }
  const b = ouvrirBulle(bouton, contenuOptions(type));
  if (type === 'formes') {
    b.querySelectorAll('[data-forme]').forEach((x) => x.addEventListener('click', () => {
      reglages.forme = x.dataset.forme; ecrire(CLE.reglages, reglages);
      majBoutonsFormes(x.dataset.forme);
    }));
    b.querySelectorAll('[data-plein]').forEach((x) => x.addEventListener('click', () => {
      $('#optPlein').checked = x.dataset.plein === '1';
      b.querySelectorAll('[data-plein]').forEach((y) => y.classList.toggle('actif', y === x));
      if (typeof majOptionsForme === 'function') majOptionsForme();
    }));
  }
}

// toucher une 2e fois l'outil déjà choisi, ou garder le doigt appuyé : ses options
document.addEventListener('pointerdown', (e) => {
  if (TB.bulle && !cible(e).closest('.bulle-options') && !cible(e).closest('.a-options')) fermerBulle();
  const b = cible(e).closest('.a-options');
  if (!b) return;
  b.dataset.dejaActif = b.classList.contains('actif') ? '1' : '';
  clearTimeout(TB.appui);
  TB.appui = setTimeout(() => { TB.appui = 'long'; if (navigator.vibrate) navigator.vibrate(12); ouvrirOptions(b); }, 450);
}, true);
['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => document.addEventListener(ev, () => { if (TB.appui !== 'long') clearTimeout(TB.appui); }, true));
document.addEventListener('click', (e) => {
  const b = cible(e).closest('.a-options');
  if (!b) return;
  if (TB.appui === 'long') { TB.appui = null; e.stopPropagation(); e.preventDefault(); return; }   // l'appui long a déjà ouvert la bulle
  // sans outil propre (Plus, +) : la bulle s'ouvre à la première touche ; sinon à la 2e touche
  if (!b.dataset.outil && b.dataset.options !== 'annuler') { e.stopPropagation(); if (TB.bulle) fermerBulle(); else ouvrirOptions(b); return; }
  if (b.dataset.dejaActif === '1') { if (TB.bulle) fermerBulle(); else setTimeout(() => ouvrirOptions(b), 0); }
}, true);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') fermerBulle(); });

// ---------- l'outil Texte ----------
// le style des lettres suit la plaque : droites sur une grille carrée, en quinconce sur une plaque
// hexagonale ou ronde (les rangées y sont décalées d'un demi-picot : des lettres droites ne tomberaient pas sur les picots)
function styleLettres() {
  const f = formatParId(P.format), tri = !['carre', 'perso'].includes(f.type);
  const nom = { hexa: 'Plaque hexagonale', rond: 'Plaque ronde', carre: 'Plaque carrée', perso: 'Plaque carrée' }[f.type] || 'Plaque';
  return { tri, info: `${nom} → lettres ${tri ? 'en quinconce' : 'droites'}` };
}
function largeurTexteMax() {
  const f = formatParId(P.format);
  if ((P.cfg.cols || 1) * (P.cfg.rangs || 1) > 1) return null;
  if (f.type === 'hexa') return (h) => (2 * f.cote - 1) - Math.ceil(h / 2) - 1;
  if (f.type === 'rond') return (h) => Math.floor(2 * Math.sqrt(Math.max(0, f.anneaux * f.anneaux - ((h * 0.866) / 2) ** 2))) - 1;
  return null;
}
function ouvrirPanneauTexte() {
  fermerBulle();
  $('#panneauTexte')?.remove();
  const st = styleLettres(), etat = { texte: TB.dernierTexte || '', taille: reglages.texteTaille || '1', couleur: reglages.texteCouleur || 'jeu:arc', relief: reglages.texteRelief !== false, lettres: reglages.texteLettres || 'soudees', contour: reglages.texteContour ?? 'H18' };
  const p = document.createElement('div');
  p.id = 'panneauTexte'; p.className = 'panneau-texte';
  const jeux = JEUX.map((j) => `<button type="button" class="tx-coul" data-c="jeu:${j.id}" title="${echap(j.nom)}">${j.familles.slice(0, 4).map((f) => `<i style="background:${hexDe(famille(f).base)}"></i>`).join('')}<span>${echap(j.nom)}</span></button>`).join('');
  const fams = FAMILLES.map((f) => `<button type="button" class="tx-fam" data-c="fam:${f.id}" title="${echap(f.nom)}" style="background:${hexDe(f.base)}"></button>`).join('');
  p.innerHTML = `
    <div class="tx-haut"><b>Texte</b><small>${echap(st.info)}</small><button type="button" class="tx-fermer" aria-label="Fermer">✕</button></div>
    <input type="text" id="txSaisie" autocomplete="off" autocapitalize="characters" placeholder="Ton texte" maxlength="40">
    <div class="tx-ligne" id="txTaille">${[['1', 'Petites'], ['2', 'Moyennes'], ['3', 'Grandes']].map(([v, m]) => `<button type="button" data-v="${v}">${m}</button>`).join('')}</div>
    <div class="tx-ligne tx-jeux">${jeux}</div>
    <div class="tx-familles">${fams}</div>
    <div class="tx-ligne" id="txLettres"><button type="button" data-v="soudees">Un mot = une pièce</button><button type="button" data-v="separees">Une pièce par lettre</button></div>
    <div class="tx-contours"><span>Contour</span><button type="button" class="tx-cont" data-v="" title="Sans contour"><i style="background:#fff;border:1px dashed #999"></i></button>${CONTOURS.map((c) => `<button type="button" class="tx-cont" data-v="${c.code}" title="${echap(c.nom)}"><i style="background:${hexDe(c.code)}"></i></button>`).join('')}</div>
    <div class="tx-ligne"><button type="button" id="txRelief">Relief</button></div>
    <div class="tx-apercu"><canvas id="txApercu"></canvas><small id="txInfo"></small></div>
    <div class="tx-ligne tx-actions"><button type="button" class="tx-fermer">Fermer</button><button type="button" class="principal" id="txPlacer">Placer sur la plaque</button></div>`;
  document.body.appendChild(p);
  const saisie = p.querySelector('#txSaisie'), info = p.querySelector('#txInfo'), cv = p.querySelector('#txApercu');
  saisie.value = etat.texte;
  let rr = null;
  const maj = () => {
    p.querySelectorAll('#txTaille [data-v]').forEach((b) => b.classList.toggle('actif', b.dataset.v === etat.taille));
    p.querySelectorAll('[data-c]').forEach((b) => b.classList.toggle('actif', b.dataset.c === etat.couleur));
    p.querySelector('#txRelief').classList.toggle('actif', etat.relief);
    p.querySelectorAll('#txLettres [data-v]').forEach((b) => b.classList.toggle('actif', b.dataset.v === etat.lettres));
    p.querySelectorAll('.tx-cont').forEach((b) => b.classList.toggle('actif', b.dataset.v === etat.contour));
    p.querySelector('#txRelief').textContent = etat.relief ? 'Avec relief' : 'Sans relief';
    rr = etat.texte.trim() ? construireReseau({ texte: etat.texte, taille: +etat.taille, tri: st.tri, couleur: etat.couleur, contour: etat.contour, lettres: etat.lettres, relief: etat.relief, largeurMax: largeurTexteMax() }) : null;
    p.querySelector('#txPlacer').disabled = !rr || !!rr.erreur;
    if (!rr || rr.erreur) { cv.width = cv.height = 0; info.textContent = rr ? rr.erreur : 'Tape ton texte : l’aperçu apparaît ici.'; return; }
    vignette(cv, { surf: rr.surf, cases: rr.cases, couleurs: rr.couleurs }, 300);
    info.textContent = `${rr.larg} × ${rr.haut} perles · ${rr.nb} perles` + (rr.depasse ? ' · un peu trop large pour la plaque' : '');
  };
  const fermer = () => p.remove();
  p.querySelectorAll('.tx-fermer').forEach((b) => (b.onclick = fermer));
  saisie.oninput = () => { etat.texte = saisie.value; TB.dernierTexte = saisie.value; maj(); };
  saisie.onkeydown = (e) => { if (e.key === 'Enter' && rr && !rr.erreur) p.querySelector('#txPlacer').click(); if (e.key === 'Escape') fermer(); };
  p.querySelectorAll('#txTaille [data-v]').forEach((b) => (b.onclick = () => { etat.taille = b.dataset.v; reglages.texteTaille = etat.taille; ecrire(CLE.reglages, reglages); maj(); }));
  p.querySelectorAll('[data-c]').forEach((b) => (b.onclick = () => { etat.couleur = b.dataset.c; reglages.texteCouleur = etat.couleur; ecrire(CLE.reglages, reglages); maj(); }));
  p.querySelectorAll('#txLettres [data-v]').forEach((b) => (b.onclick = () => { etat.lettres = b.dataset.v; reglages.texteLettres = etat.lettres; ecrire(CLE.reglages, reglages); maj(); }));
  p.querySelectorAll('.tx-cont').forEach((b) => (b.onclick = () => { etat.contour = b.dataset.v; reglages.texteContour = etat.contour; ecrire(CLE.reglages, reglages); maj(); }));
  p.querySelector('#txRelief').onclick = () => { etat.relief = !etat.relief; reglages.texteRelief = etat.relief; ecrire(CLE.reglages, reglages); maj(); };
  // « Placer » : le texte devient une copie qui suit le doigt ; on le pose en relevant le doigt
  p.querySelector('#txPlacer').onclick = () => {
    if (!rr || rr.erreur) return;
    const x0 = Math.floor(Math.min(...rr.perles.map((q) => q.dx)));
    ecrirePP({ perles: rr.perles.map((q) => ({ ...q, dx: q.dx - x0 })), centre: true });
    fermer();
    TB.retourOutil = S.outil === 'selection' ? 'crayon' : S.outil; // après la pose, on revient à l'outil d'avant
    commencerCollage();
    message('Touche la plaque là où tu veux le texte : appuie, déplace, relève. « Annuler » l’enlève.', 6000);
  };
  maj();
  setTimeout(() => saisie.focus(), 50);
}

// après avoir posé le texte, on revient à l'outil d'avant (au lieu de rester sur Sélection)
if (typeof poserCollage === 'function') {
  const poserCollageDOrigine = poserCollage;
  poserCollage = function () { poserCollageDOrigine(); if (TB.retourOutil && !SEL.collage) { const o = TB.retourOutil; TB.retourOutil = null; choisirOutil(o); } };
}

// ---------- la palette en éventail : récentes, mes perles, toutes ----------
function retenirRecente(c) {
  if (!c || !c.hex) return;
  const l = (reglages.recentes || []).filter((x) => !(x.code === c.code && x.hex === c.hex));
  l.unshift({ code: c.code, nom: c.nom, nomOfficiel: c.nomOfficiel, hex: c.hex, marque: c.marque });
  reglages.recentes = l.slice(0, 18); ecrire(CLE.reglages, reglages);
}
document.addEventListener('click', (e) => { if (cible(e).closest('#listeCouleurs .coul')) setTimeout(() => retenirRecente(P.couleurs[S.couleur]), 0); });
function ouvrirEventail(ancre) {
  const onglet = TB.ongletPalette || ((reglages.recentes || []).length ? 'recentes' : 'toutes');
  const listes = {
    recentes: () => reglages.recentes || [],
    biblio: () => (typeof couleursBiblio === 'function' ? couleursBiblio() : []),
    toutes: () => couleursDesPalettes([P.nuancier || 'hama-midi']),
  };
  const dessiner = (o) => {
    TB.ongletPalette = o;
    const l = listes[o]();
    return `<div class="eventail-onglets">${[['recentes', 'Récentes'], ['biblio', 'Mes perles'], ['toutes', 'Toutes']].map(([k, m]) => `<button type="button" data-onglet="${k}" data-garder="1" class="${k === o ? 'actif' : ''}">${m}</button>`).join('')}</div>
      <div class="eventail-grille">${l.length ? l.map((c, i) => `<button type="button" class="eventail-perle" data-i="${i}" title="${echap(nomCouleur(c))} ${echap(c.code || '')}" style="background:${c.hex}"></button>`).join('') : `<p class="note">${o === 'recentes' ? 'Les couleurs que tu choisis viendront ici.' : 'Aucune perle enregistrée dans « Mes perles ».'}</p>`}</div>
      <button type="button" class="eventail-tout" data-action="ajouterCouleur">Nuancier complet…</button>`;
  };
  const b = ouvrirBulle(ancre, dessiner(onglet));
  b.classList.add('eventail');
  const brancher = () => {
    b.querySelectorAll('[data-onglet]').forEach((x) => (x.onclick = () => { b.innerHTML = dessiner(x.dataset.onglet); brancher(); }));
    b.querySelectorAll('.eventail-perle').forEach((x) => (x.onclick = () => {
      const c = listes[TB.ongletPalette]()[+x.dataset.i];
      ajouterAuMotif({ code: c.code, nom: c.nom, nomOfficiel: c.nomOfficiel, hex: c.hex, marque: c.marque });
      retenirRecente(c);
      if (S.outil === 'gomme' || S.outil === 'pipette') choisirOutil('crayon');
    }));
  };
  brancher();
}
// appui long sur une pastille du rail des couleurs : l'éventail s'ouvre là
document.addEventListener('pointerdown', (e) => {
  const c = cible(e).closest('body.tablette:not(.tiroir-ouvert) #listeCouleurs .coul');
  if (!c) return;
  clearTimeout(TB.appuiCoul);
  TB.appuiCoul = setTimeout(() => { if (navigator.vibrate) navigator.vibrate(12); ouvrirEventail(c); TB.coulLong = true; }, 450);
}, true);
['pointerup', 'pointercancel'].forEach((ev) => document.addEventListener(ev, () => clearTimeout(TB.appuiCoul), true));
document.addEventListener('click', (e) => { if (TB.coulLong && cible(e).closest('#listeCouleurs .coul')) { TB.coulLong = false; e.stopPropagation(); } }, true);

// ---------- réglages de la disposition (dans le tiroir Réglages) ----------
function construireReglagesDisposition() {
  if ($('#tbDispo')) return;
  const sec = document.createElement('section');
  sec.id = 'tbDispo'; sec.className = 'tb-dispo';
  sec.innerHTML = `<h2>Disposition</h2>
    <label class="case"><input type="checkbox" id="tbGaucher"> <span>Je suis gaucher <small>(outils à droite, couleurs à gauche)</small></span></label>
    <button type="button" id="tbOrdi">Passer en disposition ordinateur</button>
    <button type="button" id="tbRevoirAide">Revoir les astuces</button>`;
  $('.cote').append(sec); // à la fin : la mise en page « téléphone » cache la 1re section (la plaque) dans la bande
  $('#tbGaucher').checked = !!reglages.gaucher;
  $('#tbGaucher').onchange = (e) => { reglages.gaucher = e.target.checked; ecrire(CLE.reglages, reglages); majDisposition(true); };
  $('#tbOrdi').onclick = () => { reglages.disposition = 'ordinateur'; ecrire(CLE.reglages, reglages); TB.tactile = false; majDisposition(true); message('Disposition ordinateur. Pour revenir : menu ☰ › Fichier › « Disposition tactile ».', 6000); };
  $('#tbRevoirAide').onclick = () => { basculerTiroir(false); montrerAstuces(true); };
  // et pour revenir au tactile depuis la disposition ordinateur : une ligne dans le menu Fichier
  $('#menuFichier').insertAdjacentHTML('beforeend', '<button type="button" id="tbVersTactile">🖐 Disposition tactile</button>');
  $('#tbVersTactile').onclick = () => { reglages.disposition = 'tactile'; ecrire(CLE.reglages, reglages); TB.tactile = true; majDisposition(true); };
}

// ---------- les astuces, une seule fois (puis « Revoir les astuces ») ----------
function montrerAstuces(forcer) {
  if (!document.body.classList.contains('tablette') || (reglages.astucesVues && !forcer)) return;
  const etapes = [
    { cible: '#railForme', texte: 'Touche une 2e fois un outil, ou garde le doigt appuyé : ses options s’ouvrent. Le petit triangle ◢ montre ceux qui en ont.' },
    { cible: '#toile', texte: 'Deux doigts : écarter pour zoomer, glisser pour déplacer la plaque. Toucher avec deux doigts : annuler.' },
    { cible: '#railPlus', texte: 'Garde le doigt sur une couleur, ou touche « + » : la palette s’ouvre (récentes, mes perles, toutes).' },
  ];
  let k = 0;
  const bulle = document.createElement('div');
  bulle.className = 'astuce'; document.body.appendChild(bulle);
  const montrer = () => {
    const e = etapes[k], cible = $(e.cible);
    bulle.innerHTML = `<p>${e.texte}</p><div><small>${k + 1} / ${etapes.length}</small><button type="button" class="principal">${k < etapes.length - 1 ? 'Suivant' : 'C’est compris'}</button></div>`;
    const r = cible ? cible.getBoundingClientRect() : { left: innerWidth / 2, right: innerWidth / 2, top: innerHeight / 2, bottom: innerHeight / 2, width: 0, height: 0 };
    const w = Math.min(320, innerWidth - 24); bulle.style.width = w + 'px';
    let x = r.right + 12, y = r.top + r.height / 2 - bulle.offsetHeight / 2;
    if (x + w > innerWidth - 12) x = r.left - w - 12;
    if (e.cible === '#toile') { x = r.left + r.width / 2 - w / 2; y = r.top + 20; }
    bulle.style.left = Math.round(Math.max(12, Math.min(innerWidth - w - 12, x))) + 'px';
    bulle.style.top = Math.round(Math.max(12, Math.min(innerHeight - bulle.offsetHeight - 12, y))) + 'px';
    bulle.querySelector('button').onclick = () => { k++; if (k < etapes.length) montrer(); else { bulle.remove(); reglages.astucesVues = true; ecrire(CLE.reglages, reglages); } };
  };
  montrer();
}

// ---------- démarrage ----------
construireRail();
construireEntete();
construireRailCouleurs();
construireOutilsCommuns();
construireReglagesDisposition();
TB.tactile = choixDisposition();
majDisposition();
// les astuces : après l'accueil (on attend qu'aucune fenêtre ne soit ouverte)
(function attendreAstuces(n) {
  if (n > 120) return;
  if (document.querySelector('dialog[open]') || !document.body.classList.contains('tablette')) { setTimeout(() => attendreAstuces(n + 1), 1000); return; }
  setTimeout(() => montrerAstuces(false), 600);
})(0);
// au premier vrai toucher (écran hybride), on passe en tactile
window.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'touch' || TB.tactile || reglages.disposition === 'ordinateur') return;
  TB.tactile = true; majDisposition(true);
}, true);
window.addEventListener('resize', () => majDisposition());
// le mode enfant garde sa propre mise en page
new MutationObserver(() => {
  const doit = TB.tactile && window.innerWidth > 900 && !document.body.classList.contains('enfant');
  if (doit !== document.body.classList.contains('tablette')) majDisposition(true);
}).observe(document.body, { attributes: true, attributeFilter: ['class'] });
