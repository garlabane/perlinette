// À la publication du site, pour chaque modèle de Perlinette :
//   • son image d'épingle Pinterest           →  <site>/epingles/<nom>.jpg
//   • sa page (titre, description, image)     →  <site>/modeles/<nom>/
// et la galerie de tous les modèles           →  <site>/modeles/
// Pinterest lit le titre et la description d'une épingle sur la page vers laquelle elle pointe (balises « og: ») :
// sans page propre à chaque modèle, toutes les épingles s'appelaient « Sans titre ».
// Usage : node outils/epingles.mjs <dossier du site assemblé>
// L'application est ouverte dans le Chrome de la machine ; chaque modèle est dessiné par le code de l'appli elle-même.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const site = process.argv[2];
const SITE = 'https://garlabane.github.io/perlinette/';
const sortie = resolve(site, 'epingles');
mkdirSync(sortie, { recursive: true });
const nav = await chromium.launch({ channel: 'chrome' });
const page = await nav.newPage({ viewport: { width: 1200, height: 900 } });
page.on('pageerror', (e) => console.log('erreur de page :', e.message));
await page.goto(pathToFileURL(resolve(site, 'app', 'index.html')).href);
await page.waitForFunction(() => typeof epingleDeModele === 'function' && typeof MODELES !== 'undefined' && MODELES.length > 100);
// la fiche de chaque modèle : nom, thème, plaque, perles, couleurs
const AVIS = await page.evaluate(() => (typeof AVIS_THEMES === 'object' ? AVIS_THEMES : {}));
const fiches = await page.evaluate(() => MODELES.filter((m) => !m.caractere).map((m) => {
  const fid = (m.plaques || ['midi-carre-grand'])[0], r = poserModele(m, fid), f = formatParId(fid);
  const pas = (GAMMES[f.gamme] || { pas: 5 }).pas, cm = (v) => (v * pas / 10).toLocaleString('fr-FR', { maximumFractionDigits: 1 });
  return { slug: slugModele(m), nom: m.nom, theme: m.theme, plaque: (r.surf.plaques.length > 1 ? `${r.surf.plaques.length} × ` : '') + f.nom, perles: r.cases.filter((v) => v >= 0).length, couleurs: r.couleurs.length, taille: `${cm(r.surf.larg)} × ${cm(r.surf.haut)} cm`,
    refs: r.couleurs.map((c) => `${c.nom} (${c.code})`).slice(0, 14) };
}));
if (new Set(fiches.map((f) => f.slug)).size !== fiches.length) console.log('attention : des modèles portent le même nom dans un même thème');
let faits = 0, rates = 0;
for (let i = 0; i < fiches.length; i++) {
  try {
    const url = await page.evaluate((k) => epingleDeModele(MODELES.filter((m) => !m.caractere)[k]), i);
    writeFileSync(resolve(sortie, fiches[i].slug + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
    fiches[i].image = true; faits++;
  } catch (e) { rates++; console.log('raté :', fiches[i].slug, String(e.message).slice(0, 120)); }
}
await nav.close();
console.log(`${faits} épingles fabriquées, ${rates} ratées`);

// ---------- les pages ----------
const e = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const u = encodeURIComponent;
const tete = (titre, description, adresse, image, racine) => `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(titre)}</title>
<meta name="description" content="${e(description)}">
<link rel="canonical" href="${adresse}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Perlinette">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="${e(titre)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:url" content="${adresse}">
${image ? `<meta property="og:image" content="${image}">\n<meta property="og:image:width" content="800">\n<meta property="og:image:height" content="1200">` : ''}
<meta property="article:author" content="Perlinette">
<meta name="pinterest-rich-pin" content="true">
<link rel="icon" href="${racine}logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="${racine}style.css">
<style>
.mod-page { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: 28px; align-items: start; padding: 28px 0 48px; }
.mod-page img { width: 100%; height: auto; border-radius: 14px; box-shadow: 0 6px 24px rgba(0,0,0,.14); }
.mod-page h1 { margin: 0 0 6px; } .mod-page .theme { color: #6e2f5c; font-weight: 600; text-decoration: none; }
.mod-page ul { padding-left: 18px; line-height: 1.7; } .mod-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0; }
.mod-gal h2 { margin: 28px 0 10px; } .mod-gal .grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 14px; }
.mod-gal a.carte { display: block; text-decoration: none; color: inherit; font-weight: 600; font-size: 14px; text-align: center; }
.mod-gal a.carte img { width: 100%; height: auto; aspect-ratio: 2 / 3; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,.12); display: block; margin-bottom: 6px; background: #f1e8dc; }
.mod-themes { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; } .mod-themes a { padding: 6px 12px; border-radius: 999px; background: #f1e3ec; color: #6e2f5c; text-decoration: none; font-weight: 600; font-size: 14px; }
.mod-avis { background: #fdf0e6; border: 1px solid #e8b48c; color: #7a3a10; border-radius: 10px; padding: 10px 14px; font-weight: 600; }
@media (max-width: 760px) { .mod-page { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<header class="entete"><div class="conteneur">
  <a class="marque" href="${racine}"><img src="${racine}logo.svg" alt="">Perlinette</a>
  <nav><a href="${racine}modeles/">Modèles</a><a href="${racine}tutoriels.html">Tutoriels</a><a href="${racine}app/">Ouvrir Perlinette</a></nav>
</div></header>
<main><div class="conteneur">`;
const pied = `</div></main>
</body>
</html>
`;
const ancre = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const ok = fiches.filter((f) => f.image);
for (const f of ok) {
  const adresse = `${SITE}modeles/${f.slug}/`, image = `${SITE}epingles/${f.slug}.jpg`, app = `${SITE}app/?modele=${f.slug}`;
  const titre = `${f.nom} en perles à repasser — modèle gratuit (${f.theme})`;
  const description = `Modèle « ${f.nom} » pour perles à repasser Hama : ${f.perles} perles, ${f.couleurs} couleurs, ${f.taille}, sur ${f.plaque}. À ouvrir dans Perlinette pour l'imprimer en taille réelle avec le guide des couleurs. Gratuit, sans compte.`;
  const pin = `https://www.pinterest.com/pin/create/button/?url=${u(adresse)}&media=${u(image)}&description=${u(`${f.nom} en perles à repasser : ${f.perles} perles, ${f.couleurs} couleurs. Modèle gratuit à imprimer en taille réelle avec Perlinette. #perlesàrepasser #hama #perler #fusebeads #pixelart #DIY`)}`;
  const dossier = resolve(site, 'modeles', f.slug);
  mkdirSync(dossier, { recursive: true });
  writeFileSync(resolve(dossier, 'index.html'), tete(titre, description, adresse, image, '../../') + `
<article class="mod-page">
  <img src="../../epingles/${f.slug}.jpg" alt="${e(f.nom)} : modèle de perles à repasser" width="800" height="1200" data-pin-description="${e(f.nom)} en perles à repasser, modèle gratuit Perlinette" data-pin-url="${adresse}">
  <div>
    <a class="theme" href="../#${ancre(f.theme)}">${e(f.theme)}</a>
    <h1>${e(f.nom)} en perles à repasser</h1>
    <p>${e(description)}</p>
    ${AVIS[f.theme] ? `<p class="mod-avis">⚠ ${e(AVIS[f.theme])}</p>` : ''}
    <div class="mod-actions">
      <a class="bouton plein" href="${app}">Ouvrir ce modèle dans Perlinette</a>
      <a class="bouton vide" href="${pin}" target="_blank" rel="noopener">📌 Enregistrer sur Pinterest</a>
    </div>
    <ul>
      <li><b>${f.perles}</b> perles, <b>${f.couleurs}</b> couleurs</li>
      <li>Taille : ${e(f.taille)} — ${e(f.plaque)}</li>
      <li>Couleurs Hama : ${e(f.refs.join(', '))}${f.couleurs > f.refs.length ? '…' : ''}</li>
    </ul>
    <p>Dans Perlinette, tu peux changer les couleurs pour celles que tu as, voir le motif une fois repassé, puis l'imprimer à taille réelle pour le glisser sous ta plaque.</p>
    <p><a href="../">← Tous les modèles</a></p>
  </div>
</article>` + pied);
}
// la galerie, par thème
const themes = [...new Set(ok.map((f) => f.theme))];
const adresseG = `${SITE}modeles/`;
writeFileSync(resolve(site, 'modeles', 'index.html'), tete(`${ok.length} modèles gratuits de perles à repasser — Perlinette`,
  `${ok.length} modèles de perles à repasser Hama, classés par thème (${themes.slice(0, 6).join(', ')}…). Chaque modèle s'ouvre dans Perlinette pour être imprimé en taille réelle. Gratuit, sans compte.`,
  adresseG, ok[0] ? `${SITE}epingles/${ok[0].slug}.jpg` : '', '../') + `
<section class="mod-gal">
  <h1>${ok.length} modèles de perles à repasser</h1>
  <p>Choisis un modèle : il s'ouvre dans Perlinette, où tu peux le modifier et l'imprimer à taille réelle. Gratuit, sans compte.</p>
  <div class="mod-themes">${themes.map((t) => `<a href="#${ancre(t)}">${e(t)}</a>`).join('')}</div>
  ${themes.map((t) => `<h2 id="${ancre(t)}">${e(t)}</h2>
  ${AVIS[t] ? `<p class="mod-avis">⚠ ${e(AVIS[t])}</p>` : ''}
  <div class="grille">${ok.filter((f) => f.theme === t).map((f) => `<a class="carte" href="${f.slug}/"><img src="../epingles/${f.slug}.jpg" alt="${e(f.nom)}" loading="lazy" width="800" height="1200">${e(f.nom)}</a>`).join('')}</div>`).join('\n  ')}
</section>` + pied);
// plan du site, pour les moteurs de recherche
writeFileSync(resolve(site, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + [SITE, adresseG, ...ok.map((f) => `${SITE}modeles/${f.slug}/`)].map((a) => `<url><loc>${a}</loc></url>`).join('\n') + '\n</urlset>\n');
console.log(`${ok.length} pages de modèles, ${themes.length} thèmes`);
if (faits < 100) process.exit(1);
