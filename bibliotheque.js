'use strict';
// « Mes perles » : la bibliothèque personnelle. On y coche, une fois pour toutes, les
// couleurs qu'on a chez soi (toutes marques), avec la quantité si on veut, et on peut
// y ajouter ses propres couleurs (perles sans marque, lot acheté ailleurs…).
// Elle sert ensuite à l'import d'image, au bouton « + Couleur » et à l'alerte de stock.

const CLE_BIBLIO = 'perlesrep.bibliotheque';
function biblio() { const b = lire(CLE_BIBLIO, {}); return { cles: b.cles || {}, perso: b.perso || [] }; }
let cacheBiblio = null; // relu après chaque modification
function sauverBiblio(b) { ecrire(CLE_BIBLIO, b); cacheBiblio = null; }

// toutes les couleurs de la bibliothèque, prêtes à l'emploi
function couleursBiblio() {
  if (cacheBiblio) return cacheBiblio;
  const b = biblio(), res = (cacheBiblio = []);
  for (const p of PALETTES_FUSIBLES) for (const c of p.couleurs) {
    const k = cleRef(p, c);
    if (b.cles[k]) res.push({ ...c, marque: nomCourt(p), cle: k, qte: b.cles[k].qte ?? null });
  }
  for (const c of b.perso) res.push({ code: c.code, nom: c.nom, hex: c.hex, marque: c.marque || 'Mes couleurs', cle: 'perso|' + c.id, qte: c.qte ?? null });
  return res;
}
// stock connu d'une couleur du motif (null = non renseigné)
function stockDe(c) {
  const m = marqueDe(c);
  const t = couleursBiblio().find((x) => x.code === c.code && x.hex === c.hex && x.marque === m) || couleursBiblio().find((x) => x.code === c.code && x.marque === m);
  return t ? t.qte : null;
}

function ouvrirBibliotheque() {
  let dlg = $('#dlgBiblio');
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.id = 'dlgBiblio'; dlg.className = 'tres-large';
    dlg.innerHTML = `<form method="dialog"><h3>Mes perles</h3>
      <p class="note">Coche les couleurs que tu as chez toi. La quantité est facultative : elle sert seulement à te prévenir quand un motif en demande plus.</p>
      <p id="biblioResume" class="biblio-resume"></p>
      <div class="nu-outils">
        <select id="biblioPal"></select>
        <select id="biblioTri" title="Classer par">${optionsTri('quantite')}</select>
        <input id="biblioCherche" type="search" placeholder="Chercher (réf. ou nom)…">
        <label class="case"><input type="checkbox" id="biblioSeules"> seulement celles que j'ai</label>
        <button type="button" id="biblioTout">Tout cocher</button>
        <button type="button" id="biblioRien">Tout décocher</button>
      </div>
      <div id="biblioListe" class="biblio-liste"></div>
      <details class="biblio-perso"><summary>Ajouter une couleur à moi (hors nuancier)</summary>
        <div class="nu-outils">
          <input type="color" id="persoHex" value="#C27F86">
          <input id="persoMarque" placeholder="Marque (ex. Action)" size="12">
          <input id="persoCode" placeholder="Référence" size="8">
          <input id="persoNom" placeholder="Nom (ex. Vieux rose)" size="16">
          <button type="button" id="persoAjout">Ajouter</button>
        </div>
      </details>
      <menu>
        <button type="button" id="biblioExport">Sauvegarder ma liste (fichier)</button>
        <button type="button" id="biblioImport">Recharger une liste</button>
        <span style="flex:1"></span>
        <button value="fermer" class="principal">Fermer</button>
      </menu></form>`;
    document.body.appendChild(dlg);
    $('#biblioPal').onchange = $('#biblioTri').onchange = $('#biblioSeules').onchange = majBiblio;
    $('#biblioCherche').oninput = majBiblio;
    $('#biblioTout').onclick = () => cocherVisibles(true);
    $('#biblioRien').onclick = () => cocherVisibles(false);
    $('#persoAjout').onclick = () => {
      const b = biblio(), nom = $('#persoNom').value.trim();
      if (!nom) { message('Donne un nom à ta couleur.'); return; }
      b.perso.push({ id: nouvelId(), hex: $('#persoHex').value.toUpperCase(), marque: $('#persoMarque').value.trim() || 'Mes couleurs', code: $('#persoCode').value.trim(), nom, qte: null });
      sauverBiblio(b);
      $('#persoNom').value = ''; $('#persoCode').value = '';
      $('#biblioPal').value = 'perso';
      majBiblio();
    };
    $('#biblioExport').onclick = () => telecharger('Mes perles.json', JSON.stringify(biblio(), null, 1), 'application/json');
    $('#biblioImport').onclick = () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
      inp.onchange = async () => {
        try {
          const b = JSON.parse(await inp.files[0].text());
          if (!b || typeof b.cles !== 'object') throw new Error();
          if (!(await confirmer('Remplacer ta liste actuelle par celle de ce fichier ?', 'Remplacer'))) return;
          sauverBiblio({ cles: b.cles, perso: b.perso || [] }); majBiblio(); message('Liste rechargée.');
        } catch (e) { avertir("Ce fichier n'est pas une liste « Mes perles »."); }
      };
      inp.click();
    };
  }
  remplirChoix($('#biblioPal'), '<option value="tout">Toutes les marques</option>' + optionsPalettes() + '<option value="perso">Mes couleurs à moi</option>', $('#biblioPal').value || 'tout');
  majBiblio();
  dlg.showModal();
}

// lignes affichées selon le filtre
function lignesBiblio() {
  const b = biblio(), choix = $('#biblioPal').value, q = $('#biblioCherche').value.trim().toLowerCase(), lignes = [];
  if (choix !== 'perso') {
    for (const p of PALETTES_FUSIBLES) {
      if (choix !== 'tout' && p.id !== choix) continue;
      for (const c of p.couleurs) lignes.push({ ...c, marque: nomCourt(p), cle: cleRef(p, c), a: !!b.cles[cleRef(p, c)], qte: b.cles[cleRef(p, c)]?.qte ?? null });
    }
  }
  if (choix === 'tout' || choix === 'perso') for (const c of b.perso) lignes.push({ ...c, cle: 'perso|' + c.id, a: true, perso: true });
  return lignes.filter((c) => (!q || (c.code + ' ' + c.nom + ' ' + c.marque).toLowerCase().includes(q)) && (!$('#biblioSeules').checked || c.a));
}
function cocherVisibles(oui) {
  const b = biblio();
  for (const c of lignesBiblio()) {
    if (c.perso) continue;
    if (oui && !b.cles[c.cle]) b.cles[c.cle] = { qte: null };
    if (!oui) delete b.cles[c.cle];
  }
  sauverBiblio(b); majBiblio();
}
function majBiblio() {
  const liste = lignesBiblio(), boite = $('#biblioListe'), defile = boite.scrollTop;
  requestAnimationFrame(() => (boite.scrollTop = defile)); // garder sa place dans la liste
  // résumé par marque
  const parMarque = {};
  for (const c of couleursBiblio()) parMarque[c.marque] = (parMarque[c.marque] || 0) + 1;
  const total = Object.values(parMarque).reduce((a, b) => a + b, 0);
  $('#biblioResume').textContent = total ? `Tu as ${total} couleur(s) : ` + Object.entries(parMarque).map(([m, n]) => `${m} ${n}`).join(' · ') : 'Ta bibliothèque est vide pour l’instant.';
  boite.innerHTML = '';
  let marquePrec = null;
  const tri = $('#biblioTri').value;
  for (const i of ordre(liste, tri)) {
    const c = liste[i];
    if ((tri === 'marque' || $('#biblioPal').value === 'tout') && c.marque !== marquePrec && tri !== 'teinte') {
      marquePrec = c.marque;
      const t = document.createElement('div'); t.className = 'nu-titre'; t.textContent = marquePrec; boite.appendChild(t);
    }
    const el = document.createElement('div');
    el.className = 'biblio-ligne' + (c.a ? '' : ' exclue');
    el.innerHTML = `<input type="checkbox" ${c.a ? 'checked' : ''} ${c.perso ? 'disabled' : ''} title="Je l'ai">
      <i style="background:${c.hex}"></i><span><b>${echap(c.code || '')}</b> ${echap(c.nom)}</span>
      <input type="number" min="0" step="50" placeholder="qté" value="${c.qte ?? ''}" ${c.a ? '' : 'disabled'} title="Quantité (facultatif)">
      ${c.perso ? '<button type="button" title="Retirer">✕</button>' : ''}`;
    const [cb, qte] = el.querySelectorAll('input');
    cb.onchange = () => {
      const b = biblio();
      if (cb.checked) b.cles[c.cle] = { qte: null }; else delete b.cles[c.cle];
      sauverBiblio(b); majBiblio();
    };
    qte.onchange = () => {
      const b = biblio(), v = qte.value === '' ? null : Math.max(0, +qte.value);
      if (c.perso) { const x = b.perso.find((p) => 'perso|' + p.id === c.cle); if (x) x.qte = v; } else if (b.cles[c.cle]) b.cles[c.cle].qte = v;
      sauverBiblio(b); majBiblio();
    };
    const sup = el.querySelector('button');
    if (sup) sup.onclick = () => { const b = biblio(); b.perso = b.perso.filter((p) => 'perso|' + p.id !== c.cle); sauverBiblio(b); majBiblio(); };
    boite.appendChild(el);
  }
  if (!liste.length) boite.innerHTML = '<p class="note">Aucune couleur ne correspond.</p>';
  if (typeof majCouleurs === 'function' && P) majCouleurs();
}
