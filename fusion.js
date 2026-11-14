'use strict';
// Aperçu du repassage, en trois degrés (d'après le guide MakeBead) :
//   1 légère  : trous ronds, soudure seulement aux points de contact (pièce souple) ;
//   2 moyenne : trous à moitié fermés, perles bien soudées (le cas habituel) ;
//   3 complète: trous fermés, surface plate et rigide.
// Les perles ne fondent qu'avec les voisines qui les TOUCHENT : on dessine un « pont »
// de plastique entre chaque paire de voisines posées. Une perle isolée ou tenue par un
// coin n'a aucun pont vers le motif : on la montre pâlie, décalée — elle tombera.

const DEGRES_FUSION = {
  1: { rayon: 0.5, pont: 0.36, trou: 0.17 },
  2: { rayon: 0.5, pont: 0.76, trou: 0.085 },
  3: { rayon: 0.56, pont: 1.04, trou: 0 },
};

function dessinerFusion(g, z, M, surf, motif, degre, soudure) {
  const d = DEGRES_FUSION[degre], hex = (i) => motif.couleurs[motif.cases[i]]?.hex;
  const tombe = new Set([...(soudure?.isolees || []), ...(soudure?.coins || [])]);
  const pos = (i) => [M + surf.picots[i].x * z, M + surf.picots[i].y * z + (tombe.has(i) ? z * 0.18 : 0)];
  const posee = (i) => motif.cases[i] >= 0 && motif.couleurs[motif.cases[i]];

  // picots vides
  surf.picots.forEach((q, i) => {
    if (posee(i)) return;
    g.beginPath(); g.arc(M + q.x * z, M + q.y * z, Math.max(1, z * 0.13), 0, Math.PI * 2); g.fillStyle = '#d9d0c5'; g.fill();
  });
  // ponts de plastique fondu (chaque moitié de la couleur de sa perle)
  g.lineCap = 'butt';
  surf.picots.forEach((q, i) => {
    if (!posee(i)) return;
    for (const j of surf.voisins[i]) {
      if (j < i || !posee(j)) continue;
      const [x1, y1] = pos(i), [x2, y2] = pos(j), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      g.lineWidth = d.pont * z;
      g.strokeStyle = hex(i); g.beginPath(); g.moveTo(x1, y1); g.lineTo(mx, my); g.stroke();
      g.strokeStyle = hex(j); g.beginPath(); g.moveTo(mx, my); g.lineTo(x2, y2); g.stroke();
    }
  });
  // perles
  surf.picots.forEach((q, i) => {
    if (!posee(i)) return;
    const [cx, cy] = pos(i);
    g.globalAlpha = tombe.has(i) ? 0.5 : estTransparente(motif.couleurs[motif.cases[i]]) ? 0.7 : 1;
    g.beginPath(); g.arc(cx, cy, d.rayon * z, 0, Math.PI * 2); g.fillStyle = hex(i); g.fill();
    if (typeof perleTresClaire === 'function' && perleTresClaire(hex(i)) && z >= 4) { g.beginPath(); g.arc(cx, cy, d.rayon * z, 0, Math.PI * 2); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = Math.max(1, z * 0.06); g.stroke(); }
    if (d.trou > 0) { g.beginPath(); g.arc(cx, cy, d.trou * z, 0, Math.PI * 2); g.fillStyle = '#f7f3ee'; g.fill(); }
    g.globalAlpha = 1;
  });
  // léger reflet pour la surface plate
  if (degre === 3) {
    g.globalAlpha = 0.08; g.fillStyle = '#fff';
    surf.picots.forEach((q, i) => { if (posee(i) && !tombe.has(i)) { const [cx, cy] = pos(i); g.fillRect(cx - z * 0.3, cy - z * 0.42, z * 0.6, z * 0.12); } });
    g.globalAlpha = 1;
  }
}

$('#fusion').value = String(reglages.fusion || 0);
$('#fusion').onchange = (e) => { reglages.fusion = +e.target.value; ecrire(CLE.reglages, reglages); toutMettreAJour(); };
