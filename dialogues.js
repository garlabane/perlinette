'use strict';
// Petites fenêtres de dialogue maison (remplacent prompt / confirm / alert du navigateur,
// qui sont moches et ne marchent pas partout). Toutes renvoient une promesse.

function boite({ titre, texte = '', champs = [], ok = 'OK', annuler = 'Annuler' }) {
  return new Promise((resoudre) => {
    const dlg = document.createElement('dialog');
    dlg.innerHTML = `<form method="dialog"><h3></h3><p class="boite-texte"></p><div class="boite-champs"></div>
      <menu>${annuler ? '<button value="annuler" formnovalidate></button>' : ''}<button value="ok" class="principal"></button></menu></form>`;
    dlg.querySelector('h3').textContent = titre;
    dlg.querySelector('.boite-texte').textContent = texte;
    if (!texte) dlg.querySelector('.boite-texte').remove();
    if (annuler) dlg.querySelector('[value=annuler]').textContent = annuler;
    dlg.querySelector('[value=ok]').textContent = ok;
    const zone = dlg.querySelector('.boite-champs');
    for (const c of champs) {
      const l = document.createElement('label');
      l.textContent = c.label || '';
      let inp;
      if (c.type === 'select') {
        inp = document.createElement('select');
        for (const [v, t] of c.options || []) { const o = document.createElement('option'); o.value = v; o.textContent = t; inp.appendChild(o); }
      } else if (c.type === 'textarea') {
        inp = document.createElement('textarea');
        inp.rows = 3;
      } else {
        inp = document.createElement('input');
        inp.type = c.type || 'text';
      }
      inp.name = c.nom; inp.value = c.valeur ?? '';
      if (c.placeholder) inp.placeholder = c.placeholder;
      l.appendChild(inp); zone.appendChild(l);
    }
    document.body.appendChild(dlg);
    // Entrée = valider (sinon le navigateur prendrait le premier bouton : « Annuler »)
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); dlg.close('ok'); } });
    dlg.addEventListener('close', () => {
      const res = dlg.returnValue === 'ok' ? Object.fromEntries(champs.map((c) => [c.nom, dlg.querySelector(`[name="${c.nom}"]`).value])) : null;
      dlg.remove();
      resoudre(res);
    });
    dlg.showModal();
    const premier = zone.querySelector('textarea, input:not([type=color])');
    if (premier) { premier.focus(); premier.select(); }
  });
}
async function demander(titre, valeur, label) {
  const r = await boite({ titre, champs: [{ nom: 'v', valeur, label }] });
  return r ? r.v : null;
}
async function confirmer(texte, ok = 'Confirmer') { return !!(await boite({ titre: 'Confirmation', texte, ok })); }
function avertir(texte) { return boite({ titre: 'Information', texte, annuler: null }); }
