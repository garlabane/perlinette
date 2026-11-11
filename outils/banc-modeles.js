// Banc d'essai des modèles (pour dessiner sans ouvrir l'application).
// Usage : node outils/banc-modeles.js modeles/mon-fichier.js [planche.png]
// Charge le fichier de modèles, vérifie chaque grille (largeur des rangées, couleurs connues,
// soudure : perles isolées ou tenues par un coin, nombre de pièces, taille par rapport aux
// plaques) et dessine une planche PNG de tous les modèles du fichier, dans l'ordre.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), zlib = require('zlib');

const racine = path.join(__dirname, '..');
const ctx = { console, Math, MODELES: [] };
vm.createContext(ctx);
const charger = (f) => vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f });
charger('palettes_fusibles.js');
// outils partagés des modèles (sans le DOM)
vm.runInContext(`
  var P_PETITS = ['midi-carre-petit'];
  var P_GRANDS = ['midi-carre-grand', 'mini-carre-grand'];
  var P_RONDS = ['midi-rond-grand', 'midi-rond-moyen', 'midi-hexa-grand', 'midi-hexa-moyen', 'midi-carre-petit', 'maxi-carre-grand'];
  var RONDS = ['midi-rond-grand'];
  function symetrique(gauche, largeur, ajouts = []) {
    const g = gauche.map((l) => (l + [...l.slice(0, -1)].reverse().join('')).padEnd(largeur, '.'));
    for (const [y, x, s] of ajouts) g[y] = g[y].slice(0, x) + s + g[y].slice(x + s.length);
    return g;
  }
  function detailler() {}
  var G = {}, D = {};
`, ctx);
const fichier = process.argv[2];
if (!fichier) { console.log('Usage : node outils/banc-modeles.js modeles/fichier.js [planche.png]'); process.exit(1); }
charger(fichier);

const PALS = vm.runInContext('PALETTES_FUSIBLES', ctx), pal = (id) => PALS.find((p) => p.id === id);
const codes = { Midi: new Set(pal('hama-midi').couleurs.map((c) => c.code)), Maxi: new Set(pal('hama-maxi').couleurs.map((c) => c.code)), Mini: new Set(pal('hama-mini').couleurs.map((c) => c.code)) };
const hex = Object.fromEntries(pal('hama-midi').couleurs.map((c) => [c.code, c.hex]));
const TAILLE = { 'midi-carre-grand': 29, 'midi-carre-petit': 14, 'maxi-carre-grand': 16, 'mini-carre-grand': 57 };

let erreurs = 0;
const rendus = [];
for (const m of ctx.MODELES) {
  const pb = [];
  if (!m.grille) { console.log(`-  ${m.nom} : pas de grille (recette), ignoré`); continue; }
  const g = m.grille, h = g.length, w = Math.max(...g.map((r) => r.length));
  if (g.some((r) => r.length !== w)) pb.push('rangées de longueurs différentes : ' + [...new Set(g.map((r) => r.length))].join('/'));
  const lettres = new Set(g.join('').replace(/\./g, ''));
  for (const l of lettres) if (!m.couleurs[l]) pb.push(`lettre « ${l} » sans couleur`);
  for (const [l, c] of Object.entries(m.couleurs)) {
    if (!codes.Midi.has(c)) pb.push(`${l}=${c} n'existe pas en Hama Midi`);
    if ((m.plaques || []).includes('maxi-carre-grand') && !codes.Maxi.has(c)) pb.push(`${l}=${c} n'existe pas en Maxi (la plus proche sera prise)`);
  }
  for (const p of m.plaques || []) if (TAILLE[p] && (w > TAILLE[p] || h > TAILLE[p])) pb.push(`trop grand pour ${p} (${w}×${h})`);
  // soudure (picots carrés : 4 voisins)
  const plein = (x, y) => y >= 0 && y < h && x >= 0 && x < w && g[y][x] && g[y][x] !== '.';
  const comp = g.map((r) => [...r].map(() => -1)), tailles = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!plein(x, y) || comp[y][x] >= 0) continue;
    const id = tailles.length, pile = [[x, y]]; let t = 0; comp[y][x] = id;
    while (pile.length) {
      const [a, b] = pile.pop(); t++;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (plein(a + dx, b + dy) && comp[b + dy][a + dx] < 0) { comp[b + dy][a + dx] = id; pile.push([a + dx, b + dy]); }
    }
    tailles.push(t);
  }
  const isolees = tailles.filter((t) => t === 1).length;
  if (isolees) pb.push(`${isolees} perle(s) isolée(s)`);
  if (tailles.length > 1) pb.push(`${tailles.length} pièces séparées (tailles ${tailles.join(', ')})`);
  const nbCouleurs = lettres.size;
  console.log(`${pb.length ? '✗' : '✓'} ${m.nom} — ${w}×${h}, ${nbCouleurs} couleurs, ${tailles.reduce((a, b) => a + b, 0)} perles${pb.length ? '\n     ' + pb.join('\n     ') : ''}`);
  if (pb.some((p) => !p.includes('Maxi'))) erreurs++;
  rendus.push(m);
}

// planche PNG
const sortie = process.argv[3];
if (sortie && rendus.length) {
  const T = 14, COL = Math.min(4, rendus.length), CASE = 30 * T;
  const L = COL * CASE, H = Math.ceil(rendus.length / COL) * CASE;
  const px = Buffer.alloc(L * H * 3, 255);
  const point = (x, y, [r, g2, b]) => { if (x < 0 || y < 0 || x >= L || y >= H) return; const i = (y * L + x) * 3; px[i] = r; px[i + 1] = g2; px[i + 2] = b; };
  rendus.forEach((m, k) => {
    const ox = (k % COL) * CASE, oy = Math.floor(k / COL) * CASE;
    // cadre léger
    for (let i = 0; i < CASE; i++) { point(ox + i, oy, [220, 210, 225]); point(ox, oy + i, [220, 210, 225]); }
    const g = m.grille, w = g[0].length, h = g.length, dx = ox + ((30 - w) * T) / 2, dy = oy + ((30 - h) * T) / 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const l = g[y][x]; if (l === '.') continue;
      const c = hex[m.couleurs[l]] || '#ff00ff', rgb = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
      const cx = dx + x * T + T / 2, cy = dy + y * T + T / 2;
      for (let a = -T / 2; a < T / 2; a++) for (let b = -T / 2; b < T / 2; b++) if (a * a + b * b <= (T * 0.47) ** 2) point(Math.round(cx + a), Math.round(cy + b), rgb);
    }
  });
  const brut = Buffer.alloc((L * 3 + 1) * H);
  for (let y = 0; y < H; y++) { brut[y * (L * 3 + 1)] = 0; px.copy(brut, y * (L * 3 + 1) + 1, y * L * 3, (y + 1) * L * 3); }
  const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc = (b) => { let c = -1; for (const o of b) c = crcT[(c ^ o) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  const bloc = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(L, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2;
  fs.writeFileSync(sortie, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), bloc('IHDR', ihdr), bloc('IDAT', zlib.deflateSync(brut)), bloc('IEND', Buffer.alloc(0))]));
  console.log(`Planche : ${sortie} (${rendus.length} modèles, ${COL} par rangée, dans l'ordre ci-dessus)`);
}
process.exit(erreurs ? 1 : 0);
