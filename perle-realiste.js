'use strict';
// Une perle qui ressemble à une perle : anneau bombé, éclairé en haut à gauche, trou au milieu
// (on y voit le fond de la plaque). Dessinée une fois par couleur et par taille, puis recopiée.

const SPRITES_PERLES = new Map();

function melanger(hex, vers, k) { // mélange la couleur avec du blanc (255) ou du noir (0), k entre 0 et 1
  const [r, g, b] = hexRgb(hex);
  const f = (v) => Math.round(v + (vers - v) * k);
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}

// d = diamètre en pixels de l'image de la perle
function spritePerle(hex, d, transp) {
  const cle = hex + '|' + d + '|' + (transp ? 1 : 0);
  let c = SPRITES_PERLES.get(cle);
  if (c) return c;
  if (SPRITES_PERLES.size > 500) SPRITES_PERLES.clear();
  c = document.createElement('canvas'); c.width = c.height = d;
  const g = c.getContext('2d'), R = d / 2;
  g.translate(R, R);
  g.globalAlpha = transp ? 0.72 : 1;
  // corps : dégradé qui donne le volume
  const corps = g.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R);
  corps.addColorStop(0, melanger(hex, 255, 0.38));
  corps.addColorStop(0.55, hex);
  corps.addColorStop(1, melanger(hex, 0, 0.32));
  g.beginPath(); g.arc(0, 0, R * 0.97, 0, Math.PI * 2); g.fillStyle = corps; g.fill();
  g.lineWidth = Math.max(1, R * 0.06); g.strokeStyle = 'rgba(0,0,0,.30)'; g.stroke();
  // reflet sur le haut de l'anneau
  g.globalAlpha = transp ? 0.55 : 0.4;
  g.beginPath(); g.ellipse(-R * 0.38, -R * 0.52, R * 0.3, R * 0.14, -0.6, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
  g.globalAlpha = transp ? 0.72 : 1;
  // trou : ombre en haut à gauche, un peu de lumière sur la paroi en bas à droite
  const rt = R * 0.36;
  g.beginPath(); g.arc(0, 0, rt, 0, Math.PI * 2); g.fillStyle = 'rgba(214,205,194,1)'; g.fill();           // le fond (plaque)
  const ombre = g.createLinearGradient(-rt, -rt, rt, rt);
  ombre.addColorStop(0, 'rgba(40,28,24,.78)'); ombre.addColorStop(0.55, 'rgba(40,28,24,.12)'); ombre.addColorStop(1, 'rgba(255,255,255,.25)');
  g.beginPath(); g.arc(0, 0, rt, 0, Math.PI * 2); g.fillStyle = ombre; g.fill();
  g.lineWidth = Math.max(1, R * 0.05); g.strokeStyle = 'rgba(0,0,0,.35)'; g.stroke();
  SPRITES_PERLES.set(cle, c);
  return c;
}
