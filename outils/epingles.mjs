// À la publication du site, pour chaque modèle de Perlinette, en français ET en anglais :
//   • son image d'épingle Pinterest   →  <site>/epingles/<nom>.jpg          (anglais : <site>/en/pins/<name>.jpg)
//   • sa page (titre, description…)   →  <site>/modeles/<nom>/             (anglais : <site>/en/patterns/<name>/)
// et la galerie de tous les modèles   →  <site>/modeles/                   (anglais : <site>/en/patterns/)
// Pinterest lit le titre et la description d'une épingle sur la page vers laquelle elle pointe (balises « og: ») :
// sans page propre à chaque modèle, toutes les épingles s'appelaient « Sans titre ».
// Usage : node outils/epingles.mjs <dossier du site assemblé>
// L'application est ouverte dans le Chrome de la machine (une fois en français, une fois en anglais) ;
// chaque modèle est dessiné par le code de l'appli elle-même, dans sa langue.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const site = process.argv[2];
const SITE = 'https://garlabane.github.io/perlinette/';
const e = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const u = encodeURIComponent;
const ancre = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// ---------- les textes des pages, dans chaque langue ----------
const TEXTES = {
  fr: {
    lang: 'fr', locale: 'fr_FR', dossierPins: 'epingles', dossierPages: 'modeles', racineSite: '',
    nav: (r) => `<a href="${r}modeles/">Modèles</a><a href="${r}tutoriels.html">Tutoriels</a><a href="${r}app/">Ouvrir Perlinette</a><a href="${r}en/patterns/" lang="en"><svg class="drapeau" viewBox="0 0 60 30" aria-hidden="true"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg> English</a>`,
    titre: (f) => `${f.nom} en perles à repasser — modèle gratuit (${f.theme})`,
    description: (f) => `Modèle « ${f.nom} » pour perles à repasser Hama : ${f.perles} perles, ${f.couleurs} couleurs, ${f.taille}, sur ${f.plaque}. À ouvrir dans Perlinette pour l'imprimer en taille réelle avec le guide des couleurs. Gratuit, sans compte.`,
    pin: (f) => `${f.nom} en perles à repasser : ${f.perles} perles, ${f.couleurs} couleurs. Modèle gratuit à imprimer en taille réelle avec Perlinette. #perlesàrepasser #hama #perler #fusebeads #pixelart #DIY`,
    alt: (f) => `${f.nom} : modèle de perles à repasser`, pinCourt: (f) => `${f.nom} en perles à repasser, modèle gratuit Perlinette`,
    h1: (f) => `${f.nom} en perles à repasser`, ouvrir: 'Ouvrir ce modèle dans Perlinette', enregistrer: '📌 Enregistrer sur Pinterest',
    liste: (f) => `<li><b>${f.perles}</b> perles, <b>${f.couleurs}</b> couleurs</li>
      <li>Taille : ${e(f.taille)} — ${e(f.plaque)}</li>
      <li>Couleurs Hama : ${e(f.refs.join(', '))}${f.couleurs > f.refs.length ? '…' : ''}</li>`,
    apres: 'Dans Perlinette, tu peux changer les couleurs pour celles que tu as, voir le motif une fois repassé, puis l\'imprimer à taille réelle pour le glisser sous ta plaque.',
    tous: '← Tous les modèles',
    galTitre: (n) => `${n} modèles gratuits de perles à repasser — Perlinette`,
    galDescription: (n, th) => `${n} modèles de perles à repasser Hama, classés par thème (${th.slice(0, 6).join(', ')}…). Chaque modèle s'ouvre dans Perlinette pour être imprimé en taille réelle. Gratuit, sans compte.`,
    galH1: (n) => `${n} modèles de perles à repasser`,
    galIntro: 'Choisis un modèle : il s\'ouvre dans Perlinette, où tu peux le modifier et l\'imprimer à taille réelle. Gratuit, sans compte.',
  },
  en: {
    lang: 'en', locale: 'en_US', dossierPins: 'en/pins', dossierPages: 'en/patterns', racineSite: 'en/',
    nav: (r) => `<a href="${r}en/patterns/">Patterns</a><a href="${r}en/">About</a><a href="${r}app/?lang=en">Open Perlinette</a><a href="${r}modeles/" lang="fr"><svg class="drapeau" viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#002654"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#CE1126"/></svg> Français</a>`,
    titre: (f) => `${f.nom} fuse bead pattern — free (${f.theme})`,
    description: (f) => `Free “${f.nom}” fuse bead pattern (Hama, Perler, Artkal): ${f.perles} beads, ${f.couleurs} colors, ${f.pouces} in (${f.taille}), on a ${f.plaque} pegboard. Open it in Perlinette to print it at actual size (A4 or US Letter) with the color guide. Free, no account needed.`,
    pin: (f) => `${f.nom} fuse bead pattern: ${f.perles} beads, ${f.couleurs} colors. Free pattern to print at actual size with Perlinette. #perlerbeads #hamabeads #fusebeads #perlerbeadpatterns #pixelart #DIY`,
    alt: (f) => `${f.nom}: fuse bead pattern`, pinCourt: (f) => `${f.nom} fuse bead pattern, free from Perlinette`,
    h1: (f) => `${f.nom} fuse bead pattern`, ouvrir: 'Open this pattern in Perlinette', enregistrer: '📌 Save on Pinterest',
    liste: (f) => `<li><b>${f.perles}</b> beads, <b>${f.couleurs}</b> colors</li>
      <li>Size: ${e(f.pouces)} in (${e(f.taille)}) — ${e(f.plaque)}</li>
      <li>Hama colors: ${e(f.refs.join(', '))}${f.couleurs > f.refs.length ? '…' : ''}</li>`,
    apres: 'In Perlinette, you can swap the colors for the ones you have, see the design once ironed, then print it at actual size and slide it under your clear pegboard.',
    tous: '← All patterns',
    galTitre: (n) => `${n} free fuse bead patterns (Perler, Hama) — Perlinette`,
    galDescription: (n, th) => `${n} free fuse bead patterns (Perler, Hama, Artkal) by theme (${th.slice(0, 6).join(', ')}…). Each pattern opens in Perlinette to print at actual size. Free, no account needed.`,
    galH1: (n) => `${n} free fuse bead patterns`,
    galIntro: 'Pick a pattern: it opens in Perlinette, where you can edit it and print it at actual size. Free, no account needed.',
  },
};

// ---------- les fiches et les épingles, en ouvrant l'appli dans la langue voulue ----------
const nav = await chromium.launch({ channel: 'chrome' });
async function fabriquer(langue) {
  const T = TEXTES[langue];
  mkdirSync(resolve(site, T.dossierPins), { recursive: true });
  const page = await nav.newPage({ viewport: { width: 1200, height: 900 } });
  page.on('pageerror', (er) => console.log(`[${langue}] erreur de page :`, er.message));
  await page.goto(pathToFileURL(resolve(site, 'app', 'index.html')).href + '?lang=' + langue);
  await page.waitForFunction(() => typeof epingleDeModele === 'function' && typeof MODELES !== 'undefined' && MODELES.length > 100);
  const avis = await page.evaluate(() => Object.fromEntries(Object.entries(typeof AVIS_THEMES === 'object' ? AVIS_THEMES : {}).map(([k, v]) => [k, t(v)])));
  // la fiche de chaque modèle : nom, thème, plaque, perles, couleurs (traduits par l'appli elle-même)
  const fiches = await page.evaluate(() => MODELES.filter((m) => !m.caractere).map((m) => {
    const fid = (m.plaques || ['midi-carre-grand'])[0], r = poserModele(m, fid), f = formatParId(fid);
    const pas = (GAMMES[f.gamme] || { pas: 5 }).pas, en = LANGUE === 'en';
    const cm = (v) => (v * pas / 10).toLocaleString(en ? 'en-US' : 'fr-FR', { maximumFractionDigits: 1 });
    const po = (v) => (v * pas / 25.4).toLocaleString('en-US', { maximumFractionDigits: 1 });
    return { slugFr: slugModele(m), nom: t(m.nom), themeFr: m.theme, theme: t(m.theme), plaque: (r.surf.plaques.length > 1 ? `${r.surf.plaques.length} × ` : '') + t(f.nom),
      perles: r.cases.filter((v) => v >= 0).length, couleurs: r.couleurs.length, taille: `${cm(r.surf.larg)} × ${cm(r.surf.haut)} cm`, pouces: `${po(r.surf.larg)} × ${po(r.surf.haut)}`,
      refs: r.couleurs.map((c) => `${en ? (c.nomOfficiel || t(c.nom)) : c.nom} (${c.code})`).slice(0, 14) };
  }));
  // l'adresse : le nom du modèle dans la langue de la page (en anglais, un numéro départage deux noms identiques)
  const vus = new Map();
  for (const f of fiches) {
    let s = langue === 'fr' ? f.slugFr : (ancre(f.nom) || f.slugFr);
    if (langue === 'en') { const n = (vus.get(s) || 0) + 1; vus.set(s, n); if (n > 1) s += '-' + n; }
    f.slug = s;
  }
  if (new Set(fiches.map((f) => f.slug)).size !== fiches.length) console.log(`[${langue}] attention : des modèles portent la même adresse`);
  let faits = 0, rates = 0;
  for (let i = 0; i < fiches.length; i++) {
    try {
      const url = await page.evaluate((k) => epingleDeModele(MODELES.filter((m) => !m.caractere)[k]), i);
      writeFileSync(resolve(site, T.dossierPins, fiches[i].slug + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
      fiches[i].image = true; faits++;
    } catch (er) { rates++; console.log(`[${langue}] raté :`, fiches[i].slug, String(er.message).slice(0, 120)); }
  }
  await page.close();
  console.log(`[${langue}] ${faits} épingles fabriquées, ${rates} ratées`);
  return { fiches, avis, faits };
}
const R = { fr: await fabriquer('fr'), en: await fabriquer('en') };
await nav.close();

// les deux versions d'un même modèle se répondent (hreflang)
const enParFr = new Map(R.en.fiches.map((f) => [f.slugFr, f.slug]));
const adresses = (slugFr) => ({ fr: `${SITE}modeles/${slugFr}/`, en: enParFr.has(slugFr) ? `${SITE}en/patterns/${enParFr.get(slugFr)}/` : null });

// ---------- les pages ----------
const tete = (T, titre, description, adresse, image, racine, alt) => `<!doctype html>
<html lang="${T.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(titre)}</title>
<meta name="description" content="${e(description)}">
<link rel="canonical" href="${adresse}">
${alt ? Object.entries(alt).filter(([, a]) => a).map(([l, a]) => `<link rel="alternate" hreflang="${l}" href="${a}">`).join('\n') + '\n' : ''}<meta property="og:type" content="article">
<meta property="og:site_name" content="Perlinette">
<meta property="og:locale" content="${T.locale}">
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
${T.lang === 'en' ? "<script>try { localStorage.setItem('perlinette-langue', 'en'); } catch (e) {}</script>\n" : ''}</head>
<body>
<header class="entete"><div class="conteneur">
  <a class="marque" href="${racine}${T.racineSite}"><img src="${racine}logo.svg" alt="">Perlinette</a>
  <nav>${T.nav(racine)}</nav>
</div></header>
<main><div class="conteneur">`;
const pied = `</div></main>
</body>
</html>
`;

const plan = [SITE, `${SITE}en/`];
for (const langue of ['fr', 'en']) {
  const T = TEXTES[langue], { fiches, avis } = R[langue];
  const ok = fiches.filter((f) => f.image);
  for (const f of ok) {
    const a = adresses(f.slugFr), adresse = langue === 'fr' ? a.fr : a.en;
    const image = `${SITE}${T.dossierPins}/${f.slug}.jpg`, app = `${SITE}app/?modele=${f.slugFr}${langue === 'en' ? '&lang=en' : ''}`;
    const description = T.description(f);
    const pin = `https://www.pinterest.com/pin/create/button/?url=${u(adresse)}&media=${u(image)}&description=${u(T.pin(f))}`;
    const dossier = resolve(site, T.dossierPages, f.slug);
    const racine = langue === 'fr' ? '../../' : '../../../';
    mkdirSync(dossier, { recursive: true });
    writeFileSync(resolve(dossier, 'index.html'), tete(T, T.titre(f), description, adresse, image, racine, a) + `
<article class="mod-page">
  <img src="${racine}${T.dossierPins}/${f.slug}.jpg" alt="${e(T.alt(f))}" width="800" height="1200" data-pin-description="${e(T.pinCourt(f))}" data-pin-url="${adresse}">
  <div>
    <a class="theme" href="../#${ancre(f.theme)}">${e(f.theme)}</a>
    <h1>${e(T.h1(f))}</h1>
    <p>${e(description)}</p>
    ${avis[f.themeFr] ? `<p class="mod-avis">⚠ ${e(avis[f.themeFr])}</p>` : ''}
    <div class="mod-actions">
      <a class="bouton plein" href="${app}">${T.ouvrir}</a>
      <a class="bouton vide" href="${pin}" target="_blank" rel="noopener">${T.enregistrer}</a>
    </div>
    <ul>
      ${T.liste(f)}
    </ul>
    <p>${e(T.apres)}</p>
    <p><a href="../">${T.tous}</a></p>
  </div>
</article>` + pied);
    plan.push(adresse);
  }
  // la galerie, par thème
  const themes = [...new Set(ok.map((f) => f.theme))];
  const adresseG = `${SITE}${T.dossierPages}/`;
  writeFileSync(resolve(site, T.dossierPages, 'index.html'), tete(T, T.galTitre(ok.length), T.galDescription(ok.length, themes),
    adresseG, ok[0] ? `${SITE}${T.dossierPins}/${ok[0].slug}.jpg` : '', langue === 'fr' ? '../' : '../../', { fr: `${SITE}modeles/`, en: `${SITE}en/patterns/` }) + `
<section class="mod-gal">
  <h1>${e(T.galH1(ok.length))}</h1>
  <p>${e(T.galIntro)}</p>
  <div class="mod-themes">${themes.map((th) => `<a href="#${ancre(th)}">${e(th)}</a>`).join('')}</div>
  ${themes.map((th) => {
    const fr = ok.find((f) => f.theme === th).themeFr;
    return `<h2 id="${ancre(th)}">${e(th)}</h2>
  ${avis[fr] ? `<p class="mod-avis">⚠ ${e(avis[fr])}</p>` : ''}
  <div class="grille">${ok.filter((f) => f.theme === th).map((f) => `<a class="carte" href="${f.slug}/"><img src="${langue === 'fr' ? '../' : '../../'}${T.dossierPins}/${f.slug}.jpg" alt="${e(f.nom)}" loading="lazy" width="800" height="1200">${e(f.nom)}</a>`).join('')}</div>`;
  }).join('\n  ')}
</section>` + pied);
  plan.push(adresseG);
  console.log(`[${langue}] ${ok.length} pages de modèles, ${themes.length} thèmes`);
}
// plan du site, pour les moteurs de recherche
writeFileSync(resolve(site, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
  + plan.map((a) => `<url><loc>${a}</loc></url>`).join('\n') + '\n</urlset>\n');
if (R.fr.faits < 100 || R.en.faits < 100) process.exit(1);
