'use strict';
// Thème Mandalas — 10 rosaces originales, générées à partir d'une palette de 5 couleurs, d'un
// nombre de secteurs (6 ou 12 : les anneaux d'une plaque ronde ont 6, 12, 18… picots) et d'un « style ». Faites pour les ronds et les hexagones (et les carrés).
// Les anneaux sont calculés en proportion du rayon : la rosace s'adapte à toutes les tailles.

function mandala(nSecteurs, style) {
  return function (x, y, r, a, R) {
    const d = r / R;
    if (d > 1.02) return '.';
    const k = Math.min(11, Math.round(d * 11)), fr = Math.min(1, Math.max(0, d * 11 - k + 0.5));
    const s = (((a + Math.PI / 2) / ((2 * Math.PI) / nSecteurs)) % 1 + 1) % 1; // position dans le secteur (0 → 1)
    const sect = Math.floor(((a + Math.PI / 2 + 4 * Math.PI) % (2 * Math.PI)) / ((2 * Math.PI) / nSecteurs));
    const C = ['A', 'B', 'C', 'D', 'E'];
    const forme = (k + style) % 5;
    if (k === 0) return 'A';
    if (k === 11) return 'E';
    if (forme === 0) return C[(k + style) % 5];                                   // anneau plein
    if (forme === 1) return sect % 2 ? C[(k + 1) % 5] : C[(k + 3) % 5];           // secteurs alternés
    if (forme === 2) return Math.abs(s - 0.5) * 2 < fr ? C[(k + 2) % 5] : C[(k + style + 4) % 5]; // pétales
    if (forme === 3) return Math.abs(s - 0.5) < 0.18 ? C[(k + 4) % 5] : C[(k + 1) % 5];         // rayons
    return fr < 0.5 ? C[(k + 3) % 5] : C[(k + 2) % 5];                             // anneau double
  };
}
const PALETTES_MANDALA = [
  ['Coucher de soleil', 6, 0, { A: 'H03', B: 'H04', C: 'H05', D: 'H82', E: 'H60' }],
  ['Océan', 12, 1, { A: 'H01', B: 'H97', C: 'H09', D: 'H31', E: 'H08' }],
  ['Forêt', 6, 2, { A: 'H43', B: 'H47', C: 'H10', D: 'H28', E: 'H76' }],
  ['Bonbon', 12, 3, { A: 'H01', B: 'H95', C: 'H46', D: 'H43', E: 'H06' }],
  ['Arc-en-ciel', 12, 0, { A: 'H03', B: 'H05', C: 'H10', D: 'H09', E: 'H07' }],
  ['Nuit étoilée', 6, 4, { A: 'H03', B: 'H09', C: 'H08', D: 'H01', E: 'H116' }],
  ['Printemps', 6, 1, { A: 'H43', B: 'H98', C: 'H95', D: 'H96', E: 'H46' }],
  ['Feu', 12, 2, { A: 'H03', B: 'H38', C: 'H04', D: 'H05', E: 'H22' }],
  ['Glace', 6, 3, { A: 'H01', B: 'H19', C: 'H97', D: 'H46', E: 'H70' }],
  ['Bohème', 6, 4, { A: 'H02', B: 'H95', C: 'H75', D: 'H84', E: 'H76' }],
];
for (const [nom, n, style, couleurs] of PALETTES_MANDALA) {
  MODELES.push({ theme: 'Mandalas', nom: 'Mandala ' + nom.toLowerCase(), plaques: P_RONDS, couleurs, f: mandala(n, style) });
}
