'use strict';
// Couleurs : marque, tri (référence, nom, marque, teinte, quantité), panneau du motif,
// ajout de couleur et sélecteur de références (utilisé par l'import d'image).

function nomCourt(p) { return p.nom.split(' — ')[0]; }
const INDEX_COUL = new Map();
for (const p of PALETTES_FUSIBLES) for (const c of p.couleurs) { const k = c.code + '|' + c.hex; if (!INDEX_COUL.has(k)) INDEX_COUL.set(k, p); }
function marqueDe(c) {
  if (c.marque) return c.marque;
  const p = INDEX_COUL.get(c.code + '|' + c.hex) || PALETTES_FUSIBLES.find((x) => x.couleurs.some((y) => y.code && y.code === c.code));
  return p ? nomCourt(p) : 'Autre';
}

// clé de teinte : gris d'abord (du clair au foncé), puis le cercle chromatique
function cleTeinte(hex) {
  const [r, g, b] = hexRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2, d = max - min;
  if (d < 0.08) return [0, 0, -l];
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [1, Math.round(h / 15), -l];
}
const TRIS = {
  ref: 'Référence', nom: 'Nom', marque: 'Marque', teinte: 'Teinte', quantite: 'Quantité utilisée',
};
const naturel = (a, b) => String(a || '').localeCompare(String(b || ''), 'fr', { numeric: true, sensitivity: 'base' });
function comparateur(tri, liste, n) {
  return (i, j) => {
    const a = liste[i], b = liste[j];
    if (tri === 'nom') return naturel(a.nom, b.nom) || naturel(a.code, b.code);
    if (tri === 'marque') return naturel(marqueDe(a), marqueDe(b)) || naturel(a.code, b.code);
    if (tri === 'teinte') { const x = cleTeinte(a.hex), y = cleTeinte(b.hex); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; }
    if (tri === 'quantite' && n) return (n[j] || 0) - (n[i] || 0) || naturel(a.code, b.code);
    return naturel(a.code, b.code) || naturel(a.nom, b.nom);
  };
}
function ordre(liste, tri, n) { return [...liste.keys()].sort(comparateur(tri, liste, n)); }
function optionsTri(sans) { return Object.entries(TRIS).filter(([k]) => k !== sans).map(([k, v]) => `<option value="${k}">${v}</option>`).join(''); }

// ---------- panneau des couleurs du motif ----------
function majCouleurs() {
  const n = comptes(), boite = $('#listeCouleurs'), tri = reglages.tri || 'ref';
  boite.innerHTML = '';
  let marquePrec = null;
  for (const i of ordre(P.couleurs, tri, n)) {
    const c = P.couleurs[i];
    if (tri === 'marque' && marqueDe(c) !== marquePrec) {
      marquePrec = marqueDe(c);
      const t = document.createElement('div'); t.className = 'coul-titre'; t.textContent = marquePrec; boite.appendChild(t);
    }
    const el = document.createElement('div');
    el.className = 'coul' + (i === S.couleur ? ' choisie' : '');
    // stock : on informe, on ne bloque rien
    const st = typeof stockDe === 'function' ? stockDe(c) : null, manque = st !== null && n[i] > st;
    el.title = `${marqueDe(c)}${st !== null ? ` — en stock : ${st}` : ''}${manque ? ` — il en manque ${n[i] - st}` : ''} — clic : choisir, double-clic : modifier`;
    el.className += reglages.symboles ? '' : ' sans-sym';
    el.title = `${c.nom}${c.nomOfficiel && c.nomOfficiel !== c.nom ? ' — « ' + c.nomOfficiel + ' » sur le sachet' : ''} · ${el.title}`;
    el.innerHTML = `<span class="pastille" style="background:${c.hex}"></span>${reglages.symboles ? `<span class="sym">${SYMBOLES[i % SYMBOLES.length]}</span>` : ''}
      <span class="lib">${echap(c.nom)} <small>${echap(c.code || '')}</small></span><span class="nb${manque ? ' manque' : ''}">${manque ? '⚠ ' : ''}${n[i] || ''}</span>`;
    el.onclick = () => { S.couleur = i; if (S.outil === 'gomme' || S.outil === 'pipette') choisirOutil('crayon'); majCouleurs(); };
    el.ondblclick = () => modifierCouleur(i);
    boite.appendChild(el);
  }
  $('#totalPerles').textContent = `· ${n.reduce((a, b) => a + b, 0)} perles`;
  if (typeof majCouleurActive === 'function') majCouleurActive();
}
$('#triCouleurs').innerHTML = optionsTri();
$('#triCouleurs').value = reglages.tri || 'ref';
$('#triCouleurs').onchange = (e) => { reglages.tri = e.target.value; ecrire(CLE.reglages, reglages); majCouleurs(); };

// ---------- nuancier : liste filtrable/triable ----------
// opts : { palettes:[ids], tri, recherche, cocher:(cle)=>bool|undefined, clic:(couleur, cle)=>void, change:(cle, coche)=>void }
function cleRef(p, c) { return p.id + '|' + c.code; }
function couleursDesPalettes(ids) {
  const vues = new Set(), res = [];
  for (const id of ids) {
    if (id === 'biblio') { for (const c of couleursBiblio()) if (!vues.has(c.code + '|' + c.hex + '|' + c.marque)) { vues.add(c.code + '|' + c.hex + '|' + c.marque); res.push(c); } continue; }
    const p = paletteParId(id);
    if (!p) continue;
    for (const c of p.couleurs) {
      const k = c.code + '|' + c.hex;
      if (vues.has(k)) continue; // Midi et Mini partagent les mêmes références
      vues.add(k);
      res.push({ ...c, marque: nomCourt(p), cle: cleRef(p, c) });
    }
  }
  return res;
}
function dessinerNuancier(boite, liste, opts) {
  const q = (opts.recherche || '').trim().toLowerCase();
  boite.innerHTML = '';
  let marquePrec = null;
  for (const i of ordre(liste, opts.tri || 'ref')) {
    const c = liste[i];
    if (q && !(c.code + ' ' + c.nom + ' ' + (c.nomOfficiel || '') + ' ' + c.marque).toLowerCase().includes(q)) continue;
    if (opts.tri === 'marque' && c.marque !== marquePrec) {
      marquePrec = c.marque;
      const t = document.createElement('div'); t.className = 'nu-titre'; t.textContent = marquePrec; boite.appendChild(t);
    }
    const el = document.createElement(opts.cocher ? 'label' : 'button');
    el.className = 'nu-puce';
    el.title = `${c.marque} ${c.code} ${c.nom}`;
    if (!opts.cocher) el.type = 'button';
    const coche = opts.cocher ? opts.cocher(c.cle) : false;
    el.innerHTML = `${opts.cocher ? `<input type="checkbox" ${coche ? 'checked' : ''}>` : ''}<i style="background:${c.hex}"></i><b>${echap(c.code)}</b> ${echap(c.nom)}`;
    if (opts.cocher) el.querySelector('input').onchange = (e) => opts.change(c.cle, e.target.checked);
    else el.onclick = () => opts.clic(c);
    if (opts.cocher && !coche) el.classList.add('exclue');
    boite.appendChild(el);
  }
  if (!boite.children.length) boite.innerHTML = '<p class="note">Aucune couleur ne correspond.</p>';
}

// ---------- ajouter une couleur au motif ----------
function ouvrirAjoutCouleur() {
  let dlg = $('#dlgAjout');
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.id = 'dlgAjout'; dlg.className = 'large';
    dlg.innerHTML = `<form method="dialog"><h3>Ajouter une couleur au motif</h3>
      <div class="nu-outils">
        <select id="ajoutPal"></select>
        <select id="ajoutTri" title="Classer par">${optionsTri('quantite')}</select>
        <input id="ajoutCherche" type="search" placeholder="Chercher (réf. ou nom)…">
      </div>
      <div id="ajoutPastilles" class="nu-liste"></div>
      <menu><button value="fermer">Fermer</button></menu></form>`;
    document.body.appendChild(dlg);
    const maj = () => dessinerNuancier($('#ajoutPastilles'), couleursDesPalettes($('#ajoutPal').value === 'tout' ? ['biblio', ...PALETTES_FUSIBLES.map((p) => p.id)] : [$('#ajoutPal').value]),
      { tri: $('#ajoutTri').value, recherche: $('#ajoutCherche').value, clic: (c) => ajouterAuMotif({ code: c.code, nom: c.nom, hex: c.hex, marque: c.marque }) });
    $('#ajoutPal').onchange = $('#ajoutTri').onchange = maj;
    $('#ajoutCherche').oninput = maj;
    dlg._maj = maj;
  }
  const nbBiblio = couleursBiblio().length;
  remplirChoix($('#ajoutPal'), `<option value="biblio">Mes perles (${nbBiblio})</option><option value="tout">Toutes les marques</option>` + optionsPalettes(),
    $('#ajoutPal').value || (nbBiblio ? 'biblio' : 'hama-midi'));
  $('#ajoutTri').value = reglages.tri && reglages.tri !== 'quantite' ? reglages.tri : 'ref';
  dlg._maj();
  dlg.showModal();
}
