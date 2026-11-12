'use strict';
// Rendu « repassé à fond », SANS fond ni plaque, à enregistrer en PNG transparent.
//  • la pièce seule, recadrée au plus juste (les picots vides et la plaque disparaissent) ;
//  • effet plastique facultatif : reflet en biais, bord éclairé en haut à gauche, bord ombré
//    en bas à droite, petit éclat sur chaque perle — l'aspect brillant des perles fondues ;
//  • ombre portée douce facultative, pour que la pièce « tienne » posée sur n'importe quel fond.

const TAILLES_RENDU = { normale: 24, grande: 40, tres: 64 }; // pixels par perle

function toileVide(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// silhouette unie (blanche ou noire) d'une toile
function silhouette(src, couleur) {
  const c = toileVide(src.width, src.height), g = c.getContext('2d');
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = couleur; g.fillRect(0, 0, c.width, c.height);
  return c;
}
// bord de la forme du côté (dx, dy) : forme moins la forme décalée
function bord(masque, dx, dy, couleur) {
  const c = silhouette(masque, couleur), g = c.getContext('2d');
  g.globalCompositeOperation = 'destination-out'; g.drawImage(masque, dx, dy);
  return c;
}
function flou(src, r) {
  const c = toileVide(src.width, src.height), g = c.getContext('2d');
  g.filter = `blur(${r}px)`; g.drawImage(src, 0, 0); g.filter = 'none';
  return c;
}

function rendreRepasse({ z = 24, brillant = true, ombre = true } = {}) {
  const d = DEGRES_FUSION[3], posee = (i) => P.cases[i] >= 0 && P.couleurs[P.cases[i]], hex = (i) => P.couleurs[P.cases[i]].hex;
  const ids = SURF.picots.map((q, i) => i).filter(posee);
  if (!ids.length) return null;
  // cadre serré autour des perles posées, avec une marge pour l'ombre
  const xs = ids.map((i) => SURF.picots[i].x), ys = ids.map((i) => SURF.picots[i].y);
  const M = Math.ceil(z * (ombre ? 0.9 : 0.15) + d.rayon * z);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const W = Math.ceil((Math.max(...xs) - x0) * z + 2 * M), H = Math.ceil((Math.max(...ys) - y0) * z + 2 * M);
  const pos = (i) => [M + (SURF.picots[i].x - x0) * z, M + (SURF.picots[i].y - y0) * z];

  // 1) la pièce fondue : ponts de plastique entre voisines, puis les perles (trous fermés)
  const forme = toileVide(W, H), g = forme.getContext('2d');
  g.lineCap = 'butt'; g.lineWidth = d.pont * z;
  for (const i of ids) for (const j of SURF.voisins[i]) {
    if (j < i || !posee(j)) continue;
    const [x1, y1] = pos(i), [x2, y2] = pos(j), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    g.strokeStyle = hex(i); g.beginPath(); g.moveTo(x1, y1); g.lineTo(mx, my); g.stroke();
    g.strokeStyle = hex(j); g.beginPath(); g.moveTo(mx, my); g.lineTo(x2, y2); g.stroke();
  }
  for (const i of ids) {
    const [cx, cy] = pos(i);
    g.globalAlpha = estTransparente(P.couleurs[P.cases[i]]) ? 0.7 : 1;
    g.beginPath(); g.arc(cx, cy, d.rayon * z, 0, Math.PI * 2); g.fillStyle = hex(i); g.fill();
  }
  g.globalAlpha = 1;

  // 2) effet plastique, peint UNIQUEMENT sur la pièce (source-atop)
  if (brillant) {
    const masque = silhouette(forme, '#fff'), s = Math.max(1.5, z * 0.11);
    g.globalCompositeOperation = 'source-atop';
    // petit éclat sur chaque perle : la texture des perles reste lisible sous le vernis
    for (const i of ids) {
      const [cx, cy] = pos(i), r = d.rayon * z, hx = cx - r * 0.32, hy = cy - r * 0.36;
      const rg = g.createRadialGradient(hx, hy, 0, hx, hy, r * 0.62);
      rg.addColorStop(0, 'rgba(255,255,255,.30)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = rg; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    // bords : lumière en haut à gauche, ombre en bas à droite (épaisseur bombée)
    g.globalAlpha = 0.75; g.drawImage(flou(bord(masque, s, s, '#fff'), s * 0.7), 0, 0);
    g.globalAlpha = 0.35; g.drawImage(flou(bord(masque, -s, -s, '#000'), s * 0.9), 0, 0);
    g.globalAlpha = 1;
    // reflet général en biais + une bande de lumière : l'aspect « plastifié »
    const lg = g.createLinearGradient(0, 0, W, H);
    lg.addColorStop(0, 'rgba(255,255,255,.28)'); lg.addColorStop(0.42, 'rgba(255,255,255,.04)');
    lg.addColorStop(0.5, 'rgba(255,255,255,.16)'); lg.addColorStop(0.56, 'rgba(255,255,255,.02)');
    lg.addColorStop(1, 'rgba(0,0,0,.10)');
    g.fillStyle = lg; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
  }

  // 3) assemblage final sur fond transparent, avec l'ombre portée
  const sortie = toileVide(W, H), o = sortie.getContext('2d');
  if (ombre) {
    o.globalAlpha = 0.32; o.filter = `blur(${z * 0.28}px)`;
    o.drawImage(silhouette(forme, '#2a1d24'), z * 0.08, z * 0.18);
    o.filter = 'none'; o.globalAlpha = 1;
  }
  o.drawImage(forme, 0, 0);
  return sortie;
}

// ---------- fenêtre « Rendu repassé » ----------
function ouvrirRendu() {
  if (!P.cases.some((c) => c >= 0)) { avertir("Le motif est vide : pose quelques perles d'abord."); return; }
  const r = Object.assign({ brillant: true, ombre: true, taille: 'grande' }, reglages.rendu || {});
  const dlg = document.createElement('dialog');
  dlg.className = 'large';
  dlg.innerHTML = `<form method="dialog"><h3>Rendu repassé, sans fond</h3>
    <div class="rendu-apercu"><img alt="Aperçu du motif repassé"></div>
    <div class="rendu-options">
      <label class="case"><input type="checkbox" name="brillant"> Effet plastique brillant</label>
      <label class="case"><input type="checkbox" name="ombre"> Ombre portée</label>
      <label class="case">Taille <select name="taille"><option value="normale">normale</option><option value="grande">grande</option><option value="tres">très grande</option></select></label>
    </div>
    <p class="note">La pièce repassée à fond, seule : ni plaque ni fond (PNG transparent). À poser sur une photo, une publication, une carte…</p>
    <menu><button value="fermer">Fermer</button><button value="png" class="principal">Enregistrer en PNG</button></menu></form>`;
  const f = dlg.querySelector('form'), img = dlg.querySelector('img');
  f.brillant.checked = r.brillant; f.ombre.checked = r.ombre; f.taille.value = r.taille;
  let toileRendu = null;
  const maj = () => {
    Object.assign(r, { brillant: f.brillant.checked, ombre: f.ombre.checked, taille: f.taille.value });
    reglages.rendu = r; ecrire(CLE.reglages, reglages);
    toileRendu = rendreRepasse({ z: TAILLES_RENDU[r.taille] || 40, brillant: r.brillant, ombre: r.ombre });
    img.src = toileRendu.toDataURL('image/png');
  };
  f.addEventListener('change', maj);
  f.addEventListener('submit', (e) => {
    if (e.submitter?.value !== 'png') return;
    e.preventDefault();
    toileRendu.toBlob((b) => { telecharger(nomFichier(' - repasse.png'), b); message('Rendu enregistré dans Téléchargements.'); });
  });
  dlg.addEventListener('close', () => dlg.remove());
  document.body.appendChild(dlg);
  maj(); dlg.showModal();
}
