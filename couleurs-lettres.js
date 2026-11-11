'use strict';
// Outil « Couleur lettre » : sur un motif créé avec « Écrire une phrase » (ou une lettre de la
// bibliothèque), un clic sur une lettre ouvre un nuancier de familles de couleurs. La lettre
// garde son relief : ses perles claires, de base et foncées prennent les 3 tons de la famille.
// On peut aussi appliquer un jeu prédéfini à toutes les lettres, et changer le contour.

function codeVersIndice(code) {
  let k = P.couleurs.findIndex((c) => c.code === code);
  if (k >= 0) return k;
  const pal = paletteParId('hama-midi'), c = pal.couleurs.find((x) => x.code === code);
  P.couleurs.push({ code: c.code, nom: c.nom, hex: c.hex, marque: nomCourt(pal) });
  return P.couleurs.length - 1;
}
// retire du motif les couleurs qui ne servent plus (après un changement de couleur)
function nettoyerCouleurs() {
  const n = comptes(), garde = [], carte = new Map();
  P.couleurs.forEach((c, i) => { if (n[i] > 0) { carte.set(i, garde.length); garde.push(c); } });
  P.cases = P.cases.map((v) => (v >= 0 ? carte.get(v) ?? -1 : -1));
  S.couleur = carte.get(S.couleur) ?? 0;
  P.couleurs = garde;
}
function colorierLettre(lettre, fam) {
  for (const [i, role] of lettre.cases) P.cases[i] = codeVersIndice(fam[role]);
  lettre.famille = fam.id;
}
function hexDe(code) { return paletteParId('hama-midi').couleurs.find((c) => c.code === code)?.hex || '#ccc'; }
function pastillesFamille(f) { return ['clair', 'base', 'fonce'].map((r) => `<i style="background:${hexDe(f[r])}"></i>`).join(''); }

// Lettre de la bibliothèque ouverte comme motif : on retrouve ses perles d'après leurs couleurs.
function lettresDepuisModele(motif, m) {
  if (!m.caractere) return;
  const roles = { [m.couleurs.C]: 'base', [m.relief.C[0]]: 'clair', [m.relief.C[1]]: 'fonce' };
  const fam = FAMILLES.find((f) => f.base === m.couleurs.C) || FAMILLES[0];
  const lettre = { ch: m.caractere, famille: fam.id, cases: [] };
  motif.contour = []; motif.contourCode = m.couleurs.N;
  motif.cases.forEach((v, i) => {
    if (v < 0) return;
    const code = motif.couleurs[v].code;
    if (code === m.couleurs.N) motif.contour.push(i);
    else if (roles[code]) lettre.cases.push([i, roles[code]]);
  });
  motif.lettres = [lettre];
}

function ouvrirCouleurLettre(i) {
  if (!Array.isArray(P.lettres) || !P.lettres.length) {
    message('Cet outil sert aux lettres créées avec « Écrire une phrase » (ou aux lettres de Modèles → Alphabet).', 5000);
    return;
  }
  // lettre cliquée (ou la plus proche si on a cliqué sur le contour)
  let k = P.lettres.findIndex((l) => l.cases.some((c) => c[0] === i));
  if (k < 0 && i >= 0) {
    const q = SURF.picots[i];
    let dMin = 2.2;
    P.lettres.forEach((l, n) => l.cases.forEach(([j]) => { const d = Math.hypot(SURF.picots[j].x - q.x, SURF.picots[j].y - q.y); if (d < dMin) { dMin = d; k = n; } }));
  }
  const lettre = P.lettres[k];
  const dlg = document.createElement('dialog');
  dlg.className = 'large';
  dlg.innerHTML = `<form method="dialog">
    <h3>${lettre ? `Couleur de la lettre « ${echap(lettre.ch)} »` : 'Couleurs des lettres'}</h3>
    ${lettre ? `<p class="note">Clique sur une couleur : la lettre la prend, avec son relief (ton clair, ton de base, ton foncé).</p>
    <div class="familles" id="clFamilles"></div>` : ''}
    <h4>Jeux de couleurs pour toutes les lettres</h4>
    <div class="familles" id="clJeux"></div>
    <h4>Contour de toutes les lettres</h4>
    <div class="familles" id="clContours"></div>
    <menu><button value="fermer" class="principal">Fermer</button></menu></form>`;
  document.body.appendChild(dlg);
  const majFini = () => { nettoyerCouleurs(); fini(); };
  if (lettre) {
    for (const f of FAMILLES) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'famille' + (f.id === lettre.famille ? ' choisie' : '');
      b.innerHTML = `<span class="tons">${pastillesFamille(f)}</span>${echap(f.nom)}`;
      b.onclick = () => { memoriser(); colorierLettre(lettre, f); majFini(); dlg.querySelectorAll('#clFamilles .famille').forEach((x) => x.classList.toggle('choisie', x === b)); };
      dlg.querySelector('#clFamilles').appendChild(b);
    }
  }
  for (const j of JEUX) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'famille';
    b.innerHTML = `<span class="tons">${j.familles.map((id) => `<i style="background:${hexDe(famille(id).base)}"></i>`).join('')}</span>${echap(j.nom)}`;
    b.onclick = () => { memoriser(); P.lettres.forEach((l, n) => colorierLettre(l, famille(j.familles[n % j.familles.length]))); majFini(); };
    dlg.querySelector('#clJeux').appendChild(b);
  }
  for (const c of CONTOURS) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'famille' + (c.code === P.contourCode ? ' choisie' : '');
    b.innerHTML = `<span class="tons"><i style="background:${hexDe(c.code)}"></i></span>${echap(c.nom)}`;
    b.onclick = () => {
      memoriser();
      const v = codeVersIndice(c.code);
      for (const i2 of P.contour || []) P.cases[i2] = v;
      P.contourCode = c.code; majFini();
      dlg.querySelectorAll('#clContours .famille').forEach((x) => x.classList.toggle('choisie', x === b));
    };
    dlg.querySelector('#clContours').appendChild(b);
  }
  dlg.addEventListener('close', () => dlg.remove());
  dlg.showModal();
}
