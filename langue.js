'use strict';
// Langue de l'interface : français ou anglais.
//  • Au premier passage, on suit la langue du navigateur : français s'il est réglé en français
//    (France, Belgique, Suisse, Québec…), anglais partout ailleurs.
//  • Le choix fait à la main (accueil, menu Fichier) est gardé dans ce navigateur.
// L'application reste écrite en français ; en anglais, chaque texte affiché est remplacé par sa
// traduction (dictionnaire TRAD_EN, fichier traduction-en.js), au moment où il apparaît à l'écran.
// Les données (motifs, modèles, couleurs) ne sont jamais modifiées : seul l'affichage change.

const CLE_LANGUE = 'perlinette-langue';
const LANGUE = (() => {
  try {
    const l = new URLSearchParams(location.search).get('lang') || localStorage.getItem(CLE_LANGUE);
    if (l === 'fr' || l === 'en') return l;
  } catch (e) { /* stockage bloqué : on suit le navigateur */ }
  const prefs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'fr'];
  return /^fr\b/i.test(prefs[0] || 'fr') ? 'fr' : 'en';
})();
document.documentElement.lang = LANGUE;

function changerLangue(l) {
  try { localStorage.setItem(CLE_LANGUE, l); } catch (e) { /* tant pis : le choix vaudra pour cette page */ }
  const u = new URL(location.href); u.searchParams.delete('lang');
  location.href = u.toString();
}

// ---------- le dictionnaire ----------
const TRAD = new Map();          // texte français exact → anglais
const TRAD_MOTIFS = [];          // textes avec des valeurs (« ${x} perles ») → expressions régulières
const TRAD_CACHE = new Map();    // textes déjà cherchés (trouvés ou non)

// « · jusqu'à ${x} plaques » est aussi rangé sans son séparateur de tête, car l'écran
// découpe les phrases à ces séparateurs (voir traduireTexte)
const SEP_TETE = /^(?:· |— |– |, |\. |: )/;
function ajouterTraductions(dico) {
  const entrees = Object.entries(dico || {});
  for (const [fr, en] of entrees) {
    if (typeof en === 'string' && SEP_TETE.test(fr) && SEP_TETE.test(en)) {
      const f2 = fr.replace(SEP_TETE, ''), e2 = en.replace(SEP_TETE, '');
      if (f2 && !(f2 in dico)) entrees.push([f2, e2]);
    }
  }
  for (const [fr, en] of entrees) {
    if (en == null || en === '' || en === fr) continue;
    if (fr.includes('${')) {
      const lettres = fr.replace(/\$\{x\}/g, '').replace(/[^A-Za-zÀ-ÿ]/g, '');
      if (lettres.length < 3) continue; // « ${x}${x} » attraperait tout
      const morceaux = fr.split('${x}').map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      TRAD_MOTIFS.push({ re: new RegExp('^' + morceaux.join('(.*?)') + '$', 's'), en, poids: lettres.length });
    } else TRAD.set(fr, en);
  }
  TRAD_MOTIFS.sort((a, b) => b.poids - a.poids);
  TRAD_CACHE.clear();
}

// traduit un texte (sans les espaces autour) ; rend le texte tel quel s'il n'est pas connu
function traduireTexte(s) {
  if (TRAD.has(s)) return TRAD.get(s);
  if (TRAD_CACHE.has(s)) return TRAD_CACHE.get(s);
  let r = s;
  if (/[A-Za-zÀ-ÿ]{2}/.test(s)) {
    for (const m of TRAD_MOTIFS) {
      const v = m.re.exec(s);
      if (!v) continue;
      // les valeurs doivent rester des valeurs (nombre, nom…) : un modèle trop vague comme
      // « ${x} plaque${x} » ne doit pas avaler toute une phrase qui contient le mot « plaque »
      const lettresTotal = s.replace(/[^A-Za-zÀ-ÿ]/g, '').length;
      const maxi = m.poids < 10 ? 12 : 48; // un modèle très court (« ${x} perles ») n'accepte que de petites valeurs
      if (v.slice(1).some((x) => x.includes('\n') || x.length > maxi) || m.poids < 0.2 * lettresTotal) continue;
      // les valeurs elles-mêmes peuvent être du texte (« Grand carré 29 × 29 ») : on les traduit aussi
      const vals = v.slice(1).map((x) => { const c = x.trim(); if (!c || c.length >= s.length) return x; const tc = traduireTexte(c); return tc === c ? x : x.replace(c, tc); });
      let k = 0;
      r = m.en.replace(/\$\{(x|\d+)\}/g, (_, n) => (n === 'x' ? vals[k++] : vals[Number(n) - 1]) ?? '');
      break;
    }
    // un texte fait de plusieurs morceaux (« Grand carré 29 × 29 — 841 picots ») : morceau par morceau
    // (on coupe d'abord aux grands séparateurs, puis, dans chaque morceau, aux plus petits)
    // « Nom du modèle (Thème) » : le nom et la parenthèse finale, chacun de son côté
    const fin = r === s && /^(.+) \(([^()]+)\)$/.exec(s);
    if (fin) {
      const a = traduireTexte(fin[1]), b = traduireTexte(fin[2]);
      if (a !== fin[1] || b !== fin[2]) r = `${a} (${b})`;
    }
    if (r === s) {
      for (const sep of [/(\n+)/, /( — | · | – | → | › )/, /(\. |: |, )/, /( \(|\))/]) {
        const parts = s.split(sep);
        if (parts.length < 3 || parts.length > 80) continue;
        const fait = parts.map((p, i) => {
          const c = p.trim();
          if (i % 2 || !c) return p;
          const tc = traduireTexte(c);
          return tc === c ? p : p.replace(c, tc);
        }).join('');
        if (fait !== s) r = fait;
        break;
      }
    }
  }
  if (TRAD_CACHE.size > 5000) TRAD_CACHE.clear();
  TRAD_CACHE.set(s, r);
  return r;
}

// t('texte français') : la version affichée dans la langue choisie
function t(s) {
  if (LANGUE === 'fr' || s == null) return s;
  const str = String(s), coeur = str.trim();
  if (!coeur) return str;
  const tr = traduireTexte(coeur);
  return tr === coeur ? str : str.replace(coeur, tr);
}

// le nom d'une couleur à afficher : en anglais, le nom officiel (celui du sachet)
function nomCouleur(c) { return !c ? '' : LANGUE === 'en' ? (c.nomOfficiel || t(c.nom || '')) : (c.nom || ''); }

// les textes d'une image SVG fabriquée en texte (épingle, feuilles du PDF) : elle ne passe pas
// par l'écran, on la traduit donc avant de la dessiner
function traduireSvg(svg) {
  if (LANGUE === 'fr' || !svg) return svg;
  const dec = (x) => x.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  const enc = (x) => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return svg.replace(/(<(?:text|tspan)\b[^>]*>)([^<]+)(?=<)/g, (m, balise, txt) => { const tr = t(dec(txt)); return tr === dec(txt) ? m : balise + enc(tr); });
}

// ---------- traduction de la page, au fil de l'eau ----------
const ATTRS_TRAD = ['title', 'placeholder', 'aria-label', 'alt', 'data-court']; // data-court : mot court affiché par le style (::after)
function horsTraduction(el) {
  return !el || el.closest('script,style,textarea,[translate="no"],[contenteditable="true"]');
}
function traduireNoeud(n) {
  if (n.nodeType === 3) {
    if (horsTraduction(n.parentElement)) return;
    const v = n.nodeValue, tv = t(v);
    if (tv !== v) n.nodeValue = tv;
    return;
  }
  if (n.nodeType !== 1 || horsTraduction(n)) return;
  for (const a of ATTRS_TRAD) if (n.hasAttribute(a)) { const v = n.getAttribute(a), tv = t(v); if (tv !== v) n.setAttribute(a, tv); }
  if (n.tagName === 'INPUT' && /^(button|submit)$/.test(n.type) && n.value) { const tv = t(n.value); if (tv !== n.value) n.value = tv; }
  // on parcourt le sous-arbre, en sautant les zones à ne pas traduire (champs de saisie…)
  const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
    acceptNode: (x) => (x.nodeType === 1 && (/^(SCRIPT|STYLE|TEXTAREA)$/.test(x.tagName) || x.getAttribute('translate') === 'no' || x.getAttribute('contenteditable') === 'true')
      ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let x = w.nextNode(); x; x = w.nextNode()) {
    if (x.nodeType === 1) {
      for (const a of ATTRS_TRAD) if (x.hasAttribute(a)) { const v = x.getAttribute(a), tv = t(v); if (tv !== v) x.setAttribute(a, tv); }
      if (x.tagName === 'INPUT' && /^(button|submit)$/.test(x.type) && x.value) { const tv = t(x.value); if (tv !== x.value) x.value = tv; }
    } else { const v = x.nodeValue, tv = t(v); if (tv !== v) x.nodeValue = tv; }
  }
}

function demarrerTraduction() {
  if (LANGUE === 'fr') return;
  traduireNoeud(document.body);
  document.title = t(document.title);
  new MutationObserver((liste) => {
    for (const m of liste) {
      if (m.type === 'childList') m.addedNodes.forEach(traduireNoeud);
      else if (m.type === 'characterData') traduireNoeud(m.target);
      else if (m.type === 'attributes') { const v = m.target.getAttribute(m.attributeName); const tv = v == null ? v : t(v); if (tv !== v && !horsTraduction(m.target)) m.target.setAttribute(m.attributeName, tv); }
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS_TRAD });
  // les fenêtres du navigateur et les textes dessinés (aperçus, images, impression)
  for (const f of ['alert', 'confirm', 'prompt']) {
    const orig = window[f].bind(window);
    window[f] = (msg, ...r) => orig(t(msg), ...r);
  }
  const C = CanvasRenderingContext2D.prototype;
  for (const f of ['fillText', 'strokeText', 'measureText']) {
    const orig = C[f];
    C[f] = function (txt, ...r) { return orig.call(this, typeof txt === 'string' && txt.length > 1 ? t(txt) : txt, ...r); };
  }
}

// les boutons « English / Français » (menu Fichier, accueil) : ils montrent l'autre langue
function brancherBoutonsLangue(racine = document) {
  racine.querySelectorAll('.bouton-langue').forEach((b) => {
    b.textContent = LANGUE === 'fr' ? '🇬🇧 English' : '🇫🇷 Français';
    b.lang = LANGUE === 'fr' ? 'en' : 'fr';
    b.onclick = (e) => { e.preventDefault(); changerLangue(LANGUE === 'fr' ? 'en' : 'fr'); };
  });
}
brancherBoutonsLangue();

if (LANGUE === 'en' && typeof TRAD_EN !== 'undefined') ajouterTraductions(TRAD_EN);
if (LANGUE === 'en') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', demarrerTraduction);
  else demarrerTraduction();
}
