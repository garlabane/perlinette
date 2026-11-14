'use strict';
// Liste de courses : pour le motif en cours, combien de perles de chaque couleur, combien de sachets
// acheter (en tenant compte de « Mes perles »), et ce que ça coûte à peu près.
// Les prix sont indicatifs et modifiables (réglages retenus) ; ils partent de ce qu'on voit en magasin :
// un sachet de 1000 perles Midi unies à environ 2,49 €.

const COURSES_DEFAUT = { taille: 1000, prix: 2.49, marge: 10 };
const eur = (v) => v.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

function reglagesCourses() {
  const r = reglages.courses || {};
  return {
    taille: Math.max(1, +r.taille || COURSES_DEFAUT.taille),
    prix: r.prix >= 0 ? +r.prix : COURSES_DEFAUT.prix,
    marge: r.marge >= 0 ? +r.marge : COURSES_DEFAUT.marge,
    parCode: r.parCode || {},
  };
}
function retenirCourses(r) { reglages.courses = r; ecrire(CLE.reglages, reglages); }

// lignes de la liste : une par couleur utilisée
function lignesCourses() {
  const r = reglagesCourses();
  const nb = new Array(P.couleurs.length).fill(0);
  for (const v of P.cases) if (v >= 0) nb[v]++;
  return P.couleurs.map((c, i) => ({ c, n: nb[i] })).filter((l) => l.n > 0).sort((a, b) => b.n - a.n).map(({ c, n }) => {
    const besoin = Math.ceil(n * (1 + r.marge / 100));
    const stock = typeof stockDe === 'function' ? stockDe(c) : null;
    const manque = Math.max(0, besoin - (stock || 0));
    const sachets = manque > 0 ? Math.ceil(manque / r.taille) : 0;
    const cle = (c.marque || '') + '|' + (c.code || c.nom);
    const prix = r.parCode[cle] >= 0 ? +r.parCode[cle] : r.prix;
    return { c, n, besoin, stock, manque, sachets, cle, prix, cout: sachets * prix };
  });
}

function texteCourses(lignes) {
  const r = reglagesCourses();
  const total = lignes.reduce((t, l) => t + l.cout, 0), sachets = lignes.reduce((t, l) => t + l.sachets, 0);
  const achat = lignes.filter((l) => l.sachets > 0);
  const deja = lignes.filter((l) => l.sachets === 0);
  const out = [`Liste de courses — ${P.nom}`, `${lignes.reduce((t, l) => t + l.n, 0)} perles, ${lignes.length} couleurs (marge de ${r.marge} % pour les perles perdues ou ratées)`, ''];
  if (achat.length) {
    out.push('À acheter :');
    for (const l of achat) out.push(`• ${l.sachets} × sachet de ${r.taille} — ${l.c.nom || ''}${l.c.code ? ' (' + l.c.code + ')' : ''} — il faut ${l.besoin} perles${l.stock ? `, j'en ai ${l.stock}` : ''} — ${eur(l.cout)}`);
    out.push('', `Total : ${sachets} sachet${sachets > 1 ? 's' : ''}, environ ${eur(total)}`);
  } else out.push('Rien à acheter : tout est déjà dans « Mes perles ».');
  if (deja.length && achat.length) { out.push('', 'Déjà à la maison :'); for (const l of deja) out.push(`• ${l.c.nom || ''}${l.c.code ? ' (' + l.c.code + ')' : ''} — ${l.besoin} perles`); }
  return out.join('\n');
}

function ouvrirCourses() {
  if (!P.cases.some((v) => v >= 0)) { avertir('Ce motif est encore vide.'); return; }
  let dlg = $('#dlgCourses');
  if (!dlg) {
    dlg = document.createElement('dialog'); dlg.id = 'dlgCourses'; dlg.className = 'tres-large';
    dlg.innerHTML = `<form method="dialog"><h3>🛒 Liste de courses</h3>
      <p class="note" id="coursesRes"></p>
      <div class="courses-reglages">
        <label>Perles par sachet <input id="coursesTaille" type="number" min="100" step="100"></label>
        <label>Prix du sachet (€) <input id="coursesPrix" type="number" min="0" step="0.01"></label>
        <label>Marge (%) <input id="coursesMarge" type="number" min="0" max="50" step="5" title="Perles en plus, pour celles qui tombent ou qu'on rate"></label>
      </div>
      <div class="courses-table"><table id="coursesTable"></table></div>
      <p class="note">Prix indicatifs (sachet de 1000 Midi uni vu à environ 2,49 € en magasin) : tu peux les corriger, par couleur aussi. Les perles déjà dans « Mes perles » sont retirées.</p>
      <menu>
        <button type="button" id="coursesCopier">Partager / copier la liste</button>
        <button value="ok" class="principal">Fermer</button>
      </menu></form>`;
    document.body.appendChild(dlg);
  }
  const r = reglagesCourses();
  $('#coursesTaille').value = r.taille; $('#coursesPrix').value = r.prix; $('#coursesMarge').value = r.marge;
  const dessiner = () => {
    const lignes = lignesCourses(), rg = reglagesCourses();
    const total = lignes.reduce((t, l) => t + l.cout, 0), sachets = lignes.reduce((t, l) => t + l.sachets, 0);
    $('#coursesRes').innerHTML = sachets
      ? `<b>${sachets} sachet${sachets > 1 ? 's' : ''}</b> à acheter, environ <b>${eur(total)}</b>.`
      : '<b>Rien à acheter</b> : tout est déjà dans « Mes perles ».';
    $('#coursesTable').innerHTML = '<thead><tr><th>Couleur</th><th>Perles</th><th>Chez moi</th><th>Sachets</th><th>Prix</th><th>Total</th></tr></thead><tbody>' +
      lignes.map((l) => `<tr class="${l.sachets ? '' : 'ok'}"><td><i style="background:${echap(l.c.hex)}"></i>${echap(l.c.code || '')} <small>${echap(l.c.nom || '')}</small></td>
        <td>${l.besoin}</td><td>${l.stock === null ? '—' : l.stock}</td><td><b>${l.sachets}</b></td>
        <td><input class="prix-ligne" data-cle="${echap(l.cle)}" type="number" min="0" step="0.01" value="${l.prix}"></td><td>${l.sachets ? eur(l.cout) : '—'}</td></tr>`).join('') + '</tbody>';
    dlg._lignes = lignes; dlg._rg = rg;
  };
  const surReglage = () => {
    const rg = reglagesCourses();
    rg.taille = Math.max(1, +$('#coursesTaille').value || COURSES_DEFAUT.taille);
    rg.prix = Math.max(0, +$('#coursesPrix').value || 0);
    rg.marge = Math.max(0, +$('#coursesMarge').value || 0);
    retenirCourses(rg); dessiner();
  };
  ['coursesTaille', 'coursesPrix', 'coursesMarge'].forEach((id) => ($('#' + id).onchange = surReglage));
  $('#coursesTable').onchange = (e) => {
    const inp = e.target.closest('.prix-ligne'); if (!inp) return;
    const rg = reglagesCourses(); rg.parCode[inp.dataset.cle] = Math.max(0, +inp.value || 0);
    retenirCourses(rg); dessiner();
  };
  $('#coursesCopier').onclick = async () => {
    const texte = texteCourses(lignesCourses());
    try { if (navigator.share && window.matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: 'Liste de courses — ' + P.nom, text: texte }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    let copie = false;
    try { await navigator.clipboard.writeText(texte); copie = true; } catch (e) { /* presse-papiers refusé */ }
    message(copie ? 'Liste copiée : colle-la dans un message ou une note.' : 'Copie impossible : sélectionne le texte du tableau.');
  };
  dessiner();
  dlg.returnValue = '';
  dlg.showModal();
}
actions.courses = ouvrirCourses;
