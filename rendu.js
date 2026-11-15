'use strict';
// Rendu « repassé » (léger, moyen ou complet), SANS fond ni plaque, à enregistrer en PNG transparent.
// Un vrai relief éclairé : chaque perle est un petit plateau de plastique qui fond avec ses voisines
// (il ne reste que de petits creux entre elles), puis la pièce est éclairée d'en haut à gauche :
// lumière diffuse, reflet brillant facultatif, épaisseur sur le bord et ombre portée douce facultative.

const TAILLES_RENDU = { normale: 24, grande: 40, tres: 64 }; // pixels par perle
// les degrés de fonte : rayon de la perle fondue, plateau (plus il est grand, plus le dessus est plat),
// trou au centre (vrai trou, transparent), et force du relief à l'éclairage
const FONTES_RENDU = {
  legere: { R: 0.56, plat: 2.4, trou: 0.17, relief: 0.13 },
  moyenne: { R: 0.64, plat: 2.8, trou: 0.1, relief: 0.15 },
  complete: { R: 0.74, plat: 3.2, trou: 0, relief: 0.32 },
};

function toileVide(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
// silhouette unie d'une toile
function silhouette(src, couleur) {
  const c = toileVide(src.width, src.height), g = c.getContext('2d');
  g.drawImage(src, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = couleur; g.fillRect(0, 0, c.width, c.height);
  return c;
}
// moyenne glissante horizontale puis verticale : le plastique fondu s'arrondit
function adoucir(h, W, H, r) {
  const t = new Float32Array(W * H), o = new Float32Array(W * H), n = 2 * r + 1;
  for (let y = 0; y < H; y++) { let s = 0; const b = y * W; for (let x = -r; x <= r; x++) s += h[b + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { t[b + x] = s / n; s += h[b + Math.min(W - 1, x + r + 1)] - h[b + Math.max(0, x - r)]; } }
  for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += t[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { o[y * W + x] = s / n; s += t[Math.min(H - 1, y + r + 1) * W + x] - t[Math.max(0, y - r) * W + x]; } }
  return o;
}

// La pièce repassée, éclairée, pour les perles `ids` d'un motif posé sur `surf`, à `z` pixels par perle.
// Renvoie la toile (fond transparent) et sa position : le picot (x, y) y est en (M + (x − x0)·z, M + (y − y0)·z).
function pieceRepassee(surf, motif, ids, z, M, { fonte = 'complete', brillant = true } = {}) {
  const F = FONTES_RENDU[fonte] || FONTES_RENDU.complete;
  const xs = ids.map((i) => surf.picots[i].x), ys = ids.map((i) => surf.picots[i].y);
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const W = Math.ceil((Math.max(...xs) - x0) * z + 2 * M), H = Math.ceil((Math.max(...ys) - y0) * z + 2 * M);

  // 1) le relief : un plateau arrondi par perle, assez large pour fondre avec ses voisines
  const R = F.R * z, T = F.trou * z, haut = new Float32Array(W * H), qui = new Int32Array(W * H).fill(-1);
  const rgb = (hex) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
  let graine = 7; const alea = () => ((graine = (graine * 16807) % 2147483647) / 2147483647);
  // une très légère variation par perle : le plastique n'est jamais parfaitement uni
  const coul = (i) => motif.couleurs[motif.cases[i]];
  const cols = ids.map((i) => { const v = 1 + (alea() - 0.5) * 0.06; return rgb(coul(i).hex).map((x) => Math.min(255, x * v)); });
  const opac = ids.map((i) => (estTransparente(coul(i)) ? 0.7 : 1));
  ids.forEach((i, n) => {
    const cx = M + (surf.picots[i].x - x0) * z, cy = M + (surf.picots[i].y - y0) * z;
    for (let y = Math.max(0, Math.floor(cy - R)); y <= Math.min(H - 1, Math.ceil(cy + R)); y++)
      for (let x = Math.max(0, Math.floor(cx - R)); x <= Math.min(W - 1, Math.ceil(cx + R)); x++) {
        const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy); if (d >= R || d < T) continue;
        let h = Math.min(1, (1 - (d / R) ** 2) * F.plat) ** 0.5;
        if (T) h *= Math.min(1, (d - T) / (z * 0.08) + 0.35); // le bord du trou s'arrondit vers l'intérieur
        const k = y * W + x;
        if (h > haut[k]) { haut[k] = h; qui[k] = n; }
      }
  });
  const lisse = adoucir(haut, W, H, Math.max(1, Math.round(z * 0.06)));

  // 2) l'éclairage, pixel par pixel
  const piece = toileVide(W, H), g = piece.getContext('2d'), im = g.createImageData(W, H), D = im.data;
  const L = [-0.45, -0.6, 0.66], Hl = [L[0], L[1], L[2] + 1].map((a, _, v) => a / Math.hypot(...v)), relief = z * F.relief;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const k = y * W + x; if (qui[k] < 0) continue;
    const gx = (lisse[k + 1] - lisse[k - 1]) * relief / 2, gy = (lisse[k + W] - lisse[k - W]) * relief / 2;
    const nn = Math.hypot(gx, gy, 1), nx = -gx / nn, ny = -gy / nn, nz = 1 / nn;
    const dif = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]), sp = Math.max(0, nx * Hl[0] + ny * Hl[1] + nz * Hl[2]);
    const spec = brillant ? sp ** 40 * 0.45 + sp ** 8 * 0.06 : 0, lum = 0.42 + 0.72 * dif, c = cols[qui[k]];
    for (let j = 0; j < 3; j++) D[k * 4 + j] = Math.min(255, c[j] * lum + 255 * spec);
    D[k * 4 + 3] = 255 * Math.min(1, haut[k] * 6) * opac[qui[k]]; // bord adouci
  }
  g.putImageData(im, 0, 0);
  return { piece, x0, y0, W, H };
}

// ombre portée (facultative), épaisseur de la pièce, puis la pièce elle-même
function poserPiece(piece, z, ombre) {
  const W = piece.width, H = piece.height, sortie = toileVide(W, H), o = sortie.getContext('2d');
  if (ombre) {
    o.globalAlpha = 0.35; o.filter = `blur(${z * 0.3}px)`;
    o.drawImage(silhouette(piece, '#2a1d24'), z * 0.12, z * 0.25);
    o.filter = 'none'; o.globalAlpha = 1;
  }
  const flanc = toileVide(W, H), q = flanc.getContext('2d');
  q.drawImage(piece, 0, 0); q.globalCompositeOperation = 'source-atop'; q.fillStyle = 'rgba(0,0,0,.45)'; q.fillRect(0, 0, W, H);
  for (let t = Math.max(2, z * 0.1); t > 0; t -= 1) o.drawImage(flanc, t * 0.35, t);
  o.drawImage(piece, 0, 0);
  return sortie;
}

function rendreRepasse({ z = 24, brillant = true, ombre = true, fonte = 'complete' } = {}) {
  const ids = SURF.picots.map((q, i) => i).filter((i) => P.cases[i] >= 0 && P.couleurs[P.cases[i]]);
  if (!ids.length) return null;
  // cadre serré autour des perles posées, avec une marge pour l'épaisseur et l'ombre
  const r = pieceRepassee(SURF, P, ids, z, Math.ceil(z * (ombre ? 1.2 : 0.9)), { fonte, brillant });
  return poserPiece(r.piece, z, ombre);
}

// ---------- fenêtre « Rendu repassé » ----------
function ouvrirRendu() {
  if (!P.cases.some((c) => c >= 0)) { avertir("Le motif est vide : pose quelques perles d'abord."); return; }
  const r = Object.assign({ brillant: true, ombre: true, taille: 'grande', fonte: 'complete' }, reglages.rendu || {});
  const dlg = document.createElement('dialog');
  dlg.className = 'large';
  dlg.innerHTML = `<form method="dialog"><h3>Rendu repassé, sans fond</h3>
    <div class="rendu-apercu"><img alt="Aperçu du motif repassé"></div>
    <div class="rendu-options">
      <label class="case">Repassage <select name="fonte"><option value="legere">léger (trous ouverts)</option><option value="moyenne">moyen</option><option value="complete">complet (bien fondu)</option></select></label>
      <label class="case"><input type="checkbox" name="brillant"> Reflet brillant</label>
      <label class="case"><input type="checkbox" name="ombre"> Ombre portée</label>
      <label class="case">Taille <select name="taille"><option value="normale">normale</option><option value="grande">grande</option><option value="tres">très grande</option></select></label>
    </div>
    <p class="note">La pièce repassée, seule : ni plaque ni fond (PNG transparent). À poser sur une photo, une publication, une carte…</p>
    <menu><button value="fermer">Fermer</button><button value="png" class="principal">Enregistrer en PNG</button></menu></form>`;
  const f = dlg.querySelector('form'), img = dlg.querySelector('img');
  f.brillant.checked = r.brillant; f.ombre.checked = r.ombre; f.taille.value = r.taille; f.fonte.value = FONTES_RENDU[r.fonte] ? r.fonte : 'complete';
  let toileRendu = null;
  const maj = () => {
    Object.assign(r, { brillant: f.brillant.checked, ombre: f.ombre.checked, taille: f.taille.value, fonte: f.fonte.value });
    reglages.rendu = r; ecrire(CLE.reglages, reglages);
    toileRendu = rendreRepasse({ z: TAILLES_RENDU[r.taille] || 40, brillant: r.brillant, ombre: r.ombre, fonte: r.fonte });
    img.src = toileRendu.toDataURL('image/png');
  };
  f.addEventListener('change', maj);
  f.addEventListener('submit', (e) => {
    if (e.submitter?.value !== 'png') return;
    e.preventDefault();
    signerImage(toileRendu).then((c) => c.toBlob((b) => { telecharger(nomFichier(' - repasse.png'), b); message('Rendu enregistré dans Téléchargements.'); }));
  });
  dlg.addEventListener('close', () => dlg.remove());
  document.body.appendChild(dlg);
  maj(); dlg.showModal();
}
