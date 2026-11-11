'use strict';
// Thèmes « Snacks du monde » et « Boissons » — dessinés perle par perle.
// Grand carré Midi (agrandi ×2 sur la Mini) + quelques modèles pour le petit carré.
// On dessine l'INTÉRIEUR du sujet ; `cerner` ajoute le contour noir continu (K).
// `relief` pose l'ombre : une bande foncée de 1 à 2 perles le long du bord droit et du bas
// qui suit la forme, et un reflet clair sur le bord haut-gauche.
// Frimousse seulement sur l'onigiri, la tartine, l'œuf et la brique de lait.
(function () {
  const PL = ['midi-carre-grand', 'mini-carre-grand'];
  const PP = ['midi-carre-petit'];
  const SN = 'Snacks du monde', BO = 'Boissons';

  function cerner(lignes) {
    const w = Math.max(...lignes.map((l) => l.length)) + 2;
    const g = ['', ...lignes, ''].map((l) => ('.' + l).padEnd(w, '.').split(''));
    const h = g.length;
    const plein = (x, y) => y >= 0 && y < h && x >= 0 && x < w && g[y][x] !== '.' && g[y][x] !== '#';
    const res = g.map((r) => r.slice());
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (g[y][x] === '.' && (plein(x - 1, y) || plein(x + 1, y) || plein(x, y - 1) || plein(x, y + 1))) res[y][x] = 'K';
    }
    return res.map((r) => r.join('').replace(/#/g, 'K'));
  }
  const sym = (gauche) => gauche.map((l) => l + [...l.slice(0, -1)].reverse().join(''));
  function poser(lignes, ajouts) {
    const g = lignes.slice();
    for (const [y, x, s] of ajouts) g[y] = g[y].slice(0, x) + s + g[y].slice(x + s.length);
    return g;
  }
  // table : { lettre: [clair|null, foncé|null] }.
  // o.sep : une autre couleur compte comme un bord (sinon seul le vide compte) ;
  // o.ign : lettres traversées sans faire de bord (yeux, décors) ; o.dx / o.dy : épaisseur de l'ombre.
  function relief(lignes, table, o = {}) {
    const dx = o.dx ?? 2, dy = o.dy ?? 2, sep = !!o.sep, ign = new Set(((o.ign || '') + 'K#').split(''));
    const h = lignes.length;
    const at = (x, y) => (y < 0 || y >= h || x < 0 ? '.' : lignes[y][x] || '.');
    const dehors = (L, x, y) => {
      const c = at(x, y);
      if (c === '.') return true;
      if (ign.has(c)) return false;
      return sep && c !== L;
    };
    // boîte englobante de chaque zone d'une même lettre (pour placer le reflet en haut à gauche)
    const zone = lignes.map((l) => [...l].map(() => null));
    for (let y = 0; y < h; y++) for (let x = 0; x < lignes[y].length; x++) {
      const L = lignes[y][x];
      if (!table[L] || zone[y][x]) continue;
      const b = { x0: x, y0: y, x1: x, y1: y }, pile = [[x, y]];
      zone[y][x] = b;
      while (pile.length) {
        const [a, c] = pile.pop();
        b.x0 = Math.min(b.x0, a); b.x1 = Math.max(b.x1, a); b.y0 = Math.min(b.y0, c); b.y1 = Math.max(b.y1, c);
        for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = a + ex, ny = c + ey;
          if (at(nx, ny) === L && !zone[ny][nx]) { zone[ny][nx] = b; pile.push([nx, ny]); }
        }
      }
    }
    return lignes.map((l, y) => [...l].map((L, x) => {
      const t = table[L];
      if (!t) return L;
      let fonce = false;
      for (let k = 1; k <= dx; k++) if (dehors(L, x + k, y)) fonce = true;
      for (let k = 1; k <= dy; k++) if (dehors(L, x, y + k)) fonce = true;
      if (fonce && t[1]) return t[1];
      const b = zone[y][x];
      if (t[0] && !fonce && (dehors(L, x - 1, y) || dehors(L, x, y - 1)) &&
        (x - b.x0) + (y - b.y0) < 0.45 * ((b.x1 - b.x0) + (b.y1 - b.y0) + 2)) return t[0];
      return L;
    }).join(''));
  }
  // nid de spaghettis : brins clairs croisés de traits plus foncés
  const nid = (lignes) => lignes.map((l, y) => l.replace(/p/g, (m, x) =>
    ((x * 2 + y * 3) % 7 === 0 || (x * 2 - y * 3 + 70) % 7 === 0 ? 'O' : (y + x) % 5 === 0 ? 'y' : 'Y')));

  MODELES.push(
    // ───────────── SNACKS DU MONDE ─────────────
    {
      theme: SN, nom: 'Cornet de frites', plaques: PL,
      couleurs: { K: 'H18', y: 'H103', Y: 'H03', O: 'H60', R: 'H33', r: 'H44', D: 'H05' },
      grille: cerner(relief([
        '.......yY........',
        '....yY.yY.yY.....',
        '....yY.yY.yY.YO..',
        '.yY.yY.yY.yY.YO..',
        '.yY.yY.yY.yY.YO..',
        'RRR.yY.yY.yY..RRR',
        'RRRRRRRRRRRRRRRRR',
        '.RRRRRRRRRRRRRRR.',
        '.RRRRRRRRRRRRRRR.',
        '..RRRRRRRRRRRRR..',
        '..RRRRRRRRRRRRR..',
        '...RRRRRRRRRRR...',
        '...RRRRRRRRRRR...',
        '....RRRRRRRRR....',
        '....RRRRRRRRR....',
        '.....RRRRRRR.....',
      ], { R: ['r', 'D'] }, { sep: true })),
    },
    {
      theme: SN, nom: 'Hot-dog', plaques: PL,
      couleurs: { K: 'H18', b: 'H105', B: 'H60', C: 'H21', l: 'H78', S: 'H44', s: 'H114', m: 'H03' },
      grille: cerner(relief(relief([
        '.....BBBBBBBBBBB.....',
        '...BBBBBBBBBBBBBBB...',
        '.SSSSSSSSSSSSSSSSSSS.',
        'SSmmSSSSmmSSSSmmSSSSS',
        'SSSSmmSSSSmmSSSSmmSSS',
        '.SSBBBBBBBBBBBBBBBSS.',
        '...BBBBBBBBBBBBBBB...',
        '....BBBBBBBBBBBBB....',
        '......BBBBBBBBB......',
      ], { S: ['l', 's'] }, { sep: true, ign: 'm', dy: 1 }), { B: ['b', 'C'] }, { sep: true, ign: 'm', dy: 1 })),
    },
    {
      theme: SN, nom: 'Pop-corn', plaques: PL,
      couleurs: { K: 'H18', W: 'H01', c: 'H02', y: 'H103', R: 'H05', r: 'H44', D: 'H22', b: 'H01', w: 'H77' },
      grille: cerner(relief([
        '....WWW...ccc......',
        '...WWWWWyccccc.WW..',
        '.ccWWWWyyyccccWWWW.',
        'cccccWWyyyWWccWWWyy',
        'ccccWWWWyWWWWccyyyy',
        'cRRRRRRRRRRRRRRRRRy',
        ...sym([
          '.RRbbRRbbR',
          '.RRbbRRbbR',
          '..RbbRRbbR',
          '..RbbRRbbR',
          '...bbRRbbR',
          '...bbRRbbR',
          '....bRRbbR',
          '....bRRbbR',
          '.....RRbbR',
        ]),
      ], { R: ['r', 'D'], b: [null, 'w'] }, { dy: 1 })),
    },
    {
      theme: SN, nom: 'Pancakes au sirop', plaques: PL,
      couleurs: { K: 'H18', y: 'H103', Y: 'H03', O: 'H60', S: 'H20', s: 'H118', c: 'H105', C: 'H79', e: 'H21', E: 'H76', W: 'H01', w: 'H77', B: 'H97', z: 'H107' },
      grille: cerner(poser([
        '........yYYO........',
        '........YYOO........',
        '...SSSSSSSSSSSSss...',
        '.SSSSSSSSSSSSSSSSss.',
        '.ccccccccccccccccCC.',
        'eeeeeeeeeeeeeeeeeeEE',
        '.ccccccccccccccccCC.',
        'eeeeeeeeeeeeeeeeeeEE',
        '.ccccccccccccccccCC.',
        'eeeeeeeeeeeeeeeeeeEE',
        '.ccccccccccccccccCC.',
        'eeeeeeeeeeeeeeeeeeEE',
        'WWWWWWWWWWWWWWWWWWww',
        '.BBBBBBBBBBBBBBBBzz.',
      ], [[4, 3, 'S'], [5, 3, 'S'], [6, 3, 'S'], [4, 7, 'S'], [5, 7, 'S'],
        [4, 12, 'S'], [5, 12, 'S'], [6, 12, 'S'], [7, 12, 'S'], [4, 16, 's'], [5, 16, 's']])),
    },
    {
      theme: SN, nom: 'Taco', plaques: PL,
      couleurs: { K: 'H18', g: 'H47', G: 'H10', R: 'H05', m: 'H76', h: 'H103', y: 'H103', Y: 'H03', O: 'H60', o: 'H60' },
      grille: cerner(poser(relief([
        '..gGg..RRR..hh..gGg..',
        '.gGGgGgRRRmhhhmgGGGg.',
        'gGGmmmmmmmmmmmmmmmGGg',
        'YYYYYYYYYYYYYYYYYYYYY',
        'YYYYYYYYYYYYYYYYYYYYY',
        '.YYYYYYYYYYYYYYYYYYY.',
        '.YYYYYYYYYYYYYYYYYYY.',
        '..YYYYYYYYYYYYYYYYY..',
        '...YYYYYYYYYYYYYYY...',
        '....YYYYYYYYYYYYY....',
        '......YYYYYYYYY......',
        '........YYYYY........',
      ], { Y: ['y', 'O'] }), [[3, 0, 'yyyyyyyyyyyyyyyyyyyyy'], [5, 6, 'o'], [6, 11, 'o'], [7, 5, 'o'], [5, 14, 'o'], [8, 9, 'o']])),
    },
    {
      theme: SN, nom: 'Onigiri', plaques: PL,
      couleurs: { K: 'H18', W: 'H01', w: 'H77', N: 'H28', n: 'H102', P: 'H95' },
      grille: cerner(relief(sym([
        '.......WW',
        '......WWW',
        '.....WWWW',
        '....WWWWW',
        '....WWWWW',
        '...WWWWWW',
        '...WKWWWW',
        '..WWKWWWW',
        '..WPWWWKW',
        '.WWWWWWWK',
        '.WWWWNNNN',
        'WWWWWNNNN',
        'WWWWWNNNN',
        '.WWWWNNNN',
      ]), { W: [null, 'w'], N: ['n', null] }, { sep: true, ign: 'P' })),
    },
    {
      theme: SN, nom: 'Assiette de spaghettis', plaques: PL,
      couleurs: { K: 'H18', q: 'H21', M: 'H76', m: 'H12', R: 'H05', r: 'H44', D: 'H22', y: 'H103', Y: 'H03', O: 'H60', g: 'H10', W: 'H01', w: 'H77', B: 'H97', z: 'H107' },
      grille: cerner(relief(nid([
        '..........g...........',
        '.......qMmRRqMm.......',
        '.....RRMMmRRMMmRR.....',
        '...ppRRMmmRRMmmRRpp...',
        '..ppppRRRRRRRRRRpppp..',
        '..pppppRpppppRppppppp.',
        '.WWpppppppppppppppppWW',
        'WWWWpppppppppppppppWWW',
        'WWWWWWppppppppppWWWWWW',
        '.WWWWWWWWWWWWWWWWWWWW.',
        '...BBBBBBBBBBBBBBBB...',
      ]), { R: ['r', 'D'], W: [null, 'w'], B: [null, 'z'] }, { sep: true, ign: 'qMmyYOpg', dx: 1, dy: 1 })),
    },
    {
      theme: SN, nom: 'Coupe glacée', plaques: PL,
      couleurs: { K: 'H18', W: 'H01', w: 'H77', c: 'H05', C: 'H22', h: 'H01', P: 'H06', p: 'H78', d: 'H48', M: 'H98', n: 'H113', X: 'H21', x: 'H60', Z: 'H76', G: 'H97', g: 'H107' },
      grille: cerner(poser(relief([
        '..........#........',
        '........hcc........',
        '........ccC........',
        '......WWWWWWW......',
        '.....WWWWWWWWW.....',
        '.....XXXXXXXXX.....',
        '....XXXXXXXXXXX....',
        '.PPPPXXXXXXXXXMMMM.',
        'PPPPPPXXXXXXXMMMMMM',
        'PPPPPPPPP.MMMMMMMMM',
        'PPPPPPPPP.MMMMMMMMM',
        '.PPPPPPP...MMMMMMM.',
        'GGGGGGGGGGGGGGGGGGG',
        '.GGGGGGGGGGGGGGGGG.',
        '...GGGGGGGGGGGGG...',
        '.......GGGGG.......',
        '........GGG........',
        '........GGG........',
        '.....GGGGGGGGG.....',
      ], { W: [null, 'w'], P: ['p', 'd'], M: [null, 'n'], X: ['x', 'Z'], G: [null, 'g'] }, { sep: true, ign: 'hcC', dy: 1 }),
      [[12, 1, 'h'], [13, 2, 'h']])),
    },
    {
      theme: SN, nom: 'Tartine grillée', plaques: PL,
      couleurs: { K: 'H18', c: 'H21', C: 'H76', t: 'H27', T: 'H75', l: 'H02', y: 'H103', Y: 'H03', P: 'H95' },
      grille: cerner(poser(relief(sym([
        '...cccccc',
        '.cccccccc',
        'ccttttttt',
        'ctttttttt',
        'ctttttttt',
        '.cttttttt',
        '.ctttKttt',
        '.ctttKttt',
        '.cttPttKt',
        '.cttttttK',
        '.cttttttt',
        '.cttttttt',
        '.cccccccc',
      ]), { t: ['l', 'T'], c: [null, 'C'] }, { sep: true, ign: 'P' }), [[2, 7, 'yyY'], [3, 7, 'yYY']])),
    },

    // ── petit carré ──
    {
      theme: SN, nom: 'Œuf au plat (petit)', plaques: PP,
      couleurs: { K: 'H18', W: 'H01', w: 'H77', y: 'H103', Y: 'H03', O: 'H60' },
      grille: cerner([
        '..WWWW.....',
        '.WWWWWWWw..',
        'WWWyyYYYWWw',
        'WWyYYYYYOWw',
        'WWYKYYYKOWw',
        'WWYYYKYOOWw',
        '.WWYYYOOWww',
        '..WWWWWWww.',
        '...WWWww...',
      ]),
    },
    {
      theme: SN, nom: 'Onigiri (petit)', plaques: PP,
      couleurs: { K: 'H18', W: 'H01', w: 'H77', N: 'H28', P: 'H95' },
      grille: cerner(relief(sym([
        '....WW',
        '...WWW',
        '..WWWW',
        '..WKWW',
        '.WPWWK',
        '.WWNNN',
        'WWWNNN',
        'WWWNNN',
      ]), { W: [null, 'w'] }, { sep: true, ign: 'P', dx: 1, dy: 1 })),
    },
    {
      theme: SN, nom: 'Tablette de chocolat (petit)', plaques: PP,
      couleurs: { K: 'H18', l: 'H21', M: 'H76', m: 'H12', f: 'H70', F: 'H17', R: 'H33', D: 'H05', W: 'H01', w: 'H77' },
      grille: cerner([
        'lMmlMm..',
        'MMmMMmM.',
        'mmmmmmmm',
        'lMmlMmlM',
        'MMmMMmMm',
        'ffffffFF',
        'RRRRRRDD',
        'WWWWWWww',
        'RRRRRRDD',
        'RRRRRRDD',
        'DDDDDDDD',
      ]),
    },
    {
      theme: SN, nom: 'Tartine grillée (petit)', plaques: PP,
      couleurs: { K: 'H18', c: 'H21', C: 'H76', t: 'H27', T: 'H75', P: 'H95' },
      grille: cerner(relief(sym([
        '..cccc',
        '.ccccc',
        'cctttt',
        'ctKttt',
        'ctPttK',
        '.ctttt',
        '.ctttt',
        '.ccccc',
      ]), { t: [null, 'T'], c: [null, 'C'] }, { sep: true, ign: 'P', dx: 1, dy: 1 })),
    },

    // ───────────── BOISSONS ─────────────
    {
      theme: BO, nom: 'Théière', plaques: PL,
      couleurs: { K: 'H18', k: 'H06', L: 'H06', l: 'H95', T: 'H46', t: 'H97', D: 'H119', H: 'H119', W: 'H01' },
      grille: cerner(poser(relief([
        '.........kkk.........',
        '.......LLLLLLL.......',
        '......LLLLLLLLL......',
        '.....TTTTTTTTTTT.....',
        '....TTTTTTTTTTTTTHHH.',
        'TT.TTTTTTTTTTTTTT..H.',
        'TT.TTTTTTTTTTTTTT..H.',
        '.TTTTTTTTTTTTTTTT..H.',
        '..TTTTTTTTTTTTTTTHHH.',
        '....TTTTTTTTTTTTT....',
        '.....TTTTTTTTTTT.....',
        '......LLLLLLLLL......',
      ], { T: ['t', 'D'], L: [null, 'l'] }, { sep: true }), [[4, 8, 'W'], [5, 12, 'W'], [7, 6, 'W'], [8, 10, 'W'], [9, 13, 'W'], [3, 11, 'W'], [6, 4, 'W']])),
    },
    {
      theme: BO, nom: 'Milkshake', plaques: PL,
      couleurs: { K: 'H18', R: 'H33', W: 'H01', w: 'H77', c: 'H05', C: 'H22', h: 'H01', G: 'H97', g: 'H19', P: 'H06', D: 'H33' },
      grille: cerner(relief([
        '.............RW..',
        '............WR...',
        '.......hcc.RW....',
        '.......ccCWR.....',
        '....WWWWWRWWW....',
        '..WWWWWWWWWWWW...',
        '.WWWWWWWWWWWWWW..',
        '..GPWPPPPPWPPPG..',
        '..GhPPPPPPPPPPG..',
        '..GhPPPPPPPPPPG..',
        '..GPPPPPPPPPPPG..',
        '...GPPPPPPPPPG...',
        '...GPPPPPPPPPG...',
        '...GPPPPPPPPPG...',
        '...ggggggggggg...',
      ], { W: [null, 'w'], P: [null, 'D'] }, { sep: true, ign: 'hRcC', dy: 1 })),
    },
    {
      theme: BO, nom: 'Verre de jus d’orange', plaques: PL,
      couleurs: { K: 'H18', S: 'H06', W: 'H01', O: 'H04', o: 'H60', w: 'H105', G: 'H19', g: 'H97', v: 'H19', j: 'H105', J: 'H60', D: 'H04', h: 'H01' },
      grille: cerner(relief([
        '....SS.....OOO...',
        '....WW....OoooO..',
        '....SS....OowoO..',
        'GvvvWWvvvvOoooOG.',
        'GvvvSSvvvvvvvvvG.',
        'GjjjWWjjjjjjjjjG.',
        'GJJJSSJJJJJJJJJG.',
        'GhJJJJJJJJJJJJJG.',
        'GhJJJJJJJJJJJJJG.',
        'GhJJJJJJJJJJJJJG.',
        'GJJJJJJJJJJJJJJG.',
        '.GJJJJJJJJJJJJG..',
        '.GJJJJJJJJJJJJG..',
        '.gggggggggggggg..',
      ], { J: [null, 'D'] }, { sep: true, ign: 'Sh', dy: 1 })),
    },
    {
      theme: BO, nom: 'Brique de lait', plaques: PL,
      couleurs: { K: 'H18', f: 'H01', F: 'H77', b: 'H97', B: 'H46', D: 'H119', W: 'H01', w: 'H77', P: 'H95' },
      grille: cerner(poser(relief(sym([
        '......ff',
        '......ff',
        '.....bbb',
        '....bbbb',
        '...bbbbb',
        '..bbbbbb',
        '.bbbbbbb',
        'BBBBBBBB',
        'WWWWWWWW',
        'WWWKWWWW',
        'WWWKWWWW',
        'WWPWWWKW',
        'WWWWWWWK',
        'BBBBBBBB',
        'BBBBBBBB',
        'BBBBBBBB',
      ]), { W: [null, 'w'], B: [null, 'D'], b: [null, 'B'], f: [null, 'F'] }, { sep: true, ign: 'P' }),
      [[13, 7, 'W'], [14, 6, 'WWW'], [15, 7, 'W']])),
    },
    {
      theme: BO, nom: 'Chocolat chaud et guimauves', plaques: PL,
      couleurs: { K: 'H18', v: 'H77', m: 'H95', W: 'H01', C: 'H76', c: 'H12', M: 'H46', l: 'H97', N: 'H119', H: 'H119', h: 'H06' },
      grille: cerner(relief([
        '.....vv..vv........',
        '....vv....vv.......',
        '.....vv..vv........',
        '..mm..WW..mm.......',
        'CCmmCCWWCCmmCCC....',
        'MMMMMMMMMMMMMMMHHHH',
        'MMMMMMMMMMMMMMM..HH',
        'MMMMMhhMhhMMMMM..HH',
        'MMMMMhhhhhMMMMM..HH',
        'MMMMMMhhhMMMMMM..HH',
        'MMMMMMMhMMMMMMMHHHH',
        '.MMMMMMMMMMMMM.....',
        '..MMMMMMMMMMM......',
      ], { M: ['l', 'N'], C: [null, 'c'] }, { sep: true, ign: 'hmW' })),
    },
    {
      theme: BO, nom: 'Carafe de limonade', plaques: PL,
      couleurs: { K: 'H18', G: 'H97', g: 'H107', v: 'H19', L: 'H103', D: 'H43', i: 'H01', Y: 'H03', f: 'H103', w: 'H01', W: 'H01', h: 'H01' },
      grille: cerner(relief([
        'GGGGGGGGGGGGG......',
        '.GvvvvvvvvvvGGGG...',
        '.GvvvvvvvvvvG..GG..',
        'GLLLLLLLLLLLLG.GG..',
        'GLiiLLLLLLLLLG.GG..',
        'GLiiLLLYYYLLLG.GG..',
        'GhLLLLYfffYLLGGG...',
        'GhLLLLYfwfYLLG.....',
        'GhLLLLYfffYiiG.....',
        'GLLLLLLYYYLiiG.....',
        '.GLLWLLLLLWLG......',
        '..gggggggggg.......',
      ], { L: [null, 'D'] }, { sep: true, ign: 'iYfwWh', dy: 1 })),
    },
    {
      theme: BO, nom: 'Smoothie à étages', plaques: PL,
      couleurs: { K: 'H18', g: 'H47', G: 'H10', R: 'H05', y: 'H103', W: 'H01', V: 'H97', v: 'H19', h: 'H01', P: 'H06', p: 'H48', Y: 'H03', O: 'H60', a: 'H47', A: 'H115', S: 'H33' },
      grille: cerner(relief([
        '...gGg.......SW..',
        '..RRRRR.....SW...',
        '..RyRRR....SW....',
        'VVRRyRRVVVSWVVVV.',
        'VvvRRRvvvSWvvvvV.',
        'VhPPPPPPSWPPPPPV.',
        'VhPPPPPWSPPPPPPV.',
        '.VhYYYYYYYYYYYV..',
        '.VYYYYYYYYYYYYV..',
        '.VYYYYYYYYYYYYV..',
        '..VaaaaaaaaaaV...',
        '..VaaaaaaaaaaV...',
        '..VaaaaaaaaaaV...',
        '...VVVVVVVVVV....',
      ], { P: [null, 'p'], Y: [null, 'O'], a: [null, 'A'] }, { sep: true, ign: 'SWh', dy: 0 })),
    },
    {
      theme: BO, nom: 'Mug de café fumant', plaques: PL,
      couleurs: { K: 'H18', v: 'H77', W: 'H02', w: 'H27', l: 'H01', C: 'H76', f: 'H01', b: 'H21', B: 'H76', H: 'H27' },
      grille: cerner(relief([
        '....vv....vv.......',
        '.....vv..vv........',
        '....vv....vv.......',
        '.WWWWWWWWWWWWW.....',
        'WCCCCCfCfCCCCCW....',
        'WCCCCCfffCCCCCW....',
        'WWCCCCCfCCCCCWWHHH.',
        'WWWWWWWWWWWWWWW..H.',
        'bbbbbbbbbbbbbbb..H.',
        'WWWWWWWWWWWWWWW..H.',
        'bbbbbbbbbbbbbbbHHH.',
        '.WWWWWWWWWWWWW.....',
        '..WWWWWWWWWWW......',
      ], { W: ['l', 'w'], b: [null, 'B'] }, { ign: 'Cf' })),
    },
    {
      theme: BO, nom: 'Cocktail de fruits', plaques: PL,
      couleurs: { K: 'H18', p: 'H06', W: 'H01', a: 'H04', o: 'H60', w: 'H105', G: 'H97', y: 'H103', Y: 'H03', u: 'H60', U: 'H79', r: 'H33', R: 'H05', h: 'H01' },
      grille: cerner(relief([
        '..........pWp....',
        '.........pWpWp...',
        '.aaa....pWpWpWp..',
        'aowoa......#.....',
        'GGGGGGGGGGGGGGGGG',
        'GhyyyyyyyyyyyyyyG',
        '.GhyyyyyyyyyyyyG.',
        '.GuuuuuuuuuuuuuG.',
        '..GuuuuuuuuuuuG..',
        '...GrrrrrrrrrG...',
        '....GrrrrrrrG....',
        '......GGGGG......',
        '.......GGG.......',
        '.......GGG.......',
        '....GGGGGGGGG....',
      ], { y: [null, 'Y'], u: [null, 'U'], r: [null, 'R'] }, { sep: true, ign: 'h', dy: 0 })),
    },

    // ── petit carré ──
    {
      theme: BO, nom: 'Brique de lait (petit)', plaques: PP,
      couleurs: { K: 'H18', f: 'H01', F: 'H77', b: 'H97', B: 'H46', D: 'H119', W: 'H01', w: 'H77', P: 'H95' },
      grille: cerner(relief(sym([
        '....ff',
        '...bbb',
        '..bbbb',
        '.bbbbb',
        'BBBBBB',
        'WWWWWW',
        'WWWKWW',
        'WWPWWK',
        'BBBBBB',
        'BBBBBB',
      ]), { W: [null, 'w'], B: [null, 'D'], b: [null, 'B'], f: [null, 'F'] }, { sep: true, ign: 'P', dx: 1, dy: 1 })),
    },
    {
      theme: BO, nom: 'Bouteille d’eau (petit)', plaques: PP,
      couleurs: { K: 'H18', c: 'H09', C: 'H08', v: 'H19', V: 'H97', w: 'H46', W: 'H01', h: 'H01', L: 'H06', l: 'H48', D: 'H119' },
      grille: cerner(poser(relief(sym([
        '...cc',
        '...vv',
        '..vvv',
        '.vvvv',
        'wwwww',
        'LLLLL',
        'LLLLL',
        'wwwww',
        'wwwww',
        '.wwww',
      ]), { c: [null, 'C'], v: [null, 'V'], w: [null, 'D'], L: [null, 'l'] }, { sep: true, dx: 1, dy: 1 }), [[3, 1, 'h'], [7, 1, 'h']])),
    },
    {
      theme: BO, nom: 'Mug de café (petit)', plaques: PP,
      couleurs: { K: 'H18', v: 'H77', C: 'H76', c: 'H12', M: 'H44', N: 'H05', H: 'H05', W: 'H01' },
      grille: cerner([
        '..v..v.....',
        '..v..v.....',
        '...........',
        'CCCCCCcc...',
        'MMMMMMNNHHH',
        'MWMWMMNN..H',
        'MWWWMMNN..H',
        'MMWMMMNNHHH',
        '.MMMMNN....',
      ]),
    },
    {
      theme: BO, nom: 'Thermos (petit)', plaques: PP,
      couleurs: { K: 'H18', c: 'H05', C: 'H22', s: 'H70', S: 'H17', T: 'H31', D: 'H83', W: 'H01', w: 'H77' },
      grille: cerner(relief(sym([
        '.cccc',
        'ccccc',
        '.ssss',
        'TTTTT',
        'TTTTT',
        'WWWWW',
        'TTTTT',
        'TTTTT',
        'WWWWW',
        'TTTTT',
        '.TTTT',
      ]), { T: [null, 'D'], c: [null, 'C'], s: [null, 'S'], W: [null, 'w'] }, { dx: 1, dy: 1 })),
    }
  );
})();
