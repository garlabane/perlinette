'use strict';
// Ajouter / retirer une plaque directement sur un côté du motif (gauche, droite, haut, bas).
// Le dessin reste à sa place : on le décale d'une plaque quand on ajoute à gauche ou en haut.
// Les lettres d'une phrase (P.lettres, P.contour) suivent le déplacement.

const COTES = {
  gauche: { axe: 'cols', avant: true }, droite: { axe: 'cols', avant: false },
  haut: { axe: 'rangs', avant: true }, bas: { axe: 'rangs', avant: false },
};

// correspondance ancien indice → nouvel indice, le dessin étant décalé de (dx, dy) en pas
function correspondance(ancienne, nouvelle, dx, dy) {
  const seau = new Map(), cle = (x, y) => Math.round(x * 2) + ',' + Math.round(y * 2);
  nouvelle.picots.forEach((q, i) => seau.set(cle(q.x, q.y), i));
  return ancienne.picots.map((q) => { const i = seau.get(cle(q.x + dx, q.y + dy)); return i === undefined ? -1 : i; });
}

async function changerPlaques(cote, delta) {
  const c = COTES[cote], cfg = { ...P.cfg, cols: P.cfg.cols || 1, rangs: P.cfg.rangs || 1 };
  const n = cfg[c.axe] + delta;
  if (n < 1) return;
  if (n > 10) { message('10 plaques au plus dans ce sens.'); return; }
  const pl = SURF.plaques[0];
  const dx = c.axe === 'cols' && c.avant ? delta * pl.larg : 0, dy = c.axe === 'rangs' && c.avant ? delta * pl.haut : 0;
  cfg[c.axe] = n;
  const nouvelle = construireSurface(formatParId(P.format), cfg);
  const carte = correspondance(SURF, nouvelle, dx, dy);
  // retrait : prévenir si des perles disparaissent (on informe, « Annuler » reste possible)
  const perdues = P.cases.reduce((s, v, i) => s + (v >= 0 && carte[i] < 0 ? 1 : 0), 0);
  if (perdues && !(await confirmer(`Retirer cette rangée de plaques enlève ${perdues} perle(s) posée(s). Continuer ? (« Annuler » reste possible ensuite.)`, 'Retirer'))) return;
  memoriser();
  const cases = new Array(nouvelle.picots.length).fill(-1);
  P.cases.forEach((v, i) => { if (carte[i] >= 0) cases[carte[i]] = v; });
  if (Array.isArray(P.lettres)) {
    P.lettres.forEach((l) => { l.cases = l.cases.map(([i, r]) => [carte[i], r]).filter(([i]) => i >= 0); });
    P.lettres = P.lettres.filter((l) => l.cases.length);
  }
  if (Array.isArray(P.contour)) P.contour = P.contour.map((i) => carte[i]).filter((i) => i >= 0);
  P.cfg = cfg; P.cases = cases; SURF = nouvelle;
  fini();
  setTimeout(() => zoomAjuster(), 0);
  message(`${cfg.cols} × ${cfg.rangs} plaque(s).`);
}

// boutons autour du dessin
(function installerBoutonsCotes() {
  const cadre = $('#toileCadre');
  for (const cote of Object.keys(COTES)) {
    const g = document.createElement('div');
    g.className = 'cote-plaque cote-' + cote;
    g.innerHTML = `<button type="button" class="ajout" title="Ajouter une plaque ${cote === 'haut' ? 'en haut' : cote === 'bas' ? 'en bas' : 'à ' + cote}">+</button>`
      + `<button type="button" class="retrait" title="Retirer les plaques ${cote === 'haut' ? 'du haut' : cote === 'bas' ? 'du bas' : 'de ' + cote}">−</button>`;
    g.querySelector('.ajout').onclick = () => changerPlaques(cote, 1);
    g.querySelector('.retrait').onclick = () => changerPlaques(cote, -1);
    cadre.appendChild(g);
  }
})();
// « − » visible seulement s'il y a plus d'une plaque dans ce sens
function majBoutonsCotes() {
  const cols = P?.cfg?.cols || 1, rangs = P?.cfg?.rangs || 1;
  $$('.cote-gauche .retrait, .cote-droite .retrait').forEach((b) => (b.hidden = cols < 2));
  $$('.cote-haut .retrait, .cote-bas .retrait').forEach((b) => (b.hidden = rangs < 2));
}
