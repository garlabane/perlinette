// Liste les thèmes et les noms des modèles (JSON sur la sortie), pour outils/traduction.py.
// Usage (depuis le dossier Perlinette) : node outils/noms-modeles.js
const vm = require('vm'), fs = require('fs');
const ctx = { MODELES: [], console };
ctx.window = ctx; vm.createContext(ctx);
// les petites aides dont les fichiers de modèles ont besoin
const lire = (f) => fs.readFileSync(f, 'utf8').split(String.fromCharCode(13)).join('');
const taille = lire('modeles-taille.js'), modeles = lire('modeles.js');
const extraire = (src, debut) => { const i = src.indexOf(debut); return i < 0 ? '' : src.slice(i, src.indexOf('\n}\n', i) + 3); };
const ligne = (src, debut) => { const i = src.indexOf(debut); return i < 0 ? '' : src.slice(i, src.indexOf('\n', i) + 1); };
vm.runInContext(ligne(modeles, 'const RONDS =').replace('const', 'var') + ligne(modeles, 'const P_RONDS =').replace('const', 'var')
  + extraire(taille, 'function symetrique'), ctx);
const fichiers = lire('index.html').match(/src="modeles\/[^"]+"/g).map((s) => s.slice(5, -1));
for (const f of fichiers) {
  try { vm.runInContext(lire(f).replace(/^'use strict';/, ''), ctx, { filename: f }); } catch (e) { console.error(f, e.message); }
}
const noms = new Set();
for (const m of ctx.MODELES) {
  noms.add(m.theme);
  if (!/^(Alphabet|Accents|Chiffres)/.test(m.theme)) noms.add(m.nom);
}
process.stdout.write(JSON.stringify([...noms]));
