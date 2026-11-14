// Fabrique l'image d'épingle Pinterest de chaque modèle de Perlinette, à la publication du site.
// Usage : node outils/epingles.mjs <dossier de l'application assemblée> <dossier de sortie>
// L'application est ouverte dans le Chrome de la machine ; chaque modèle est dessiné par le code de l'appli elle-même.
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [app, sortie] = process.argv.slice(2);
mkdirSync(sortie, { recursive: true });
const nav = await chromium.launch({ channel: 'chrome' });
const page = await nav.newPage({ viewport: { width: 1200, height: 900 } });
page.on('pageerror', (e) => console.log('erreur de page :', e.message));
await page.goto(pathToFileURL(resolve(app, 'index.html')).href);
await page.waitForFunction(() => typeof epingleDeModele === 'function' && typeof MODELES !== 'undefined' && MODELES.length > 100);
const slugs = await page.evaluate(() => MODELES.filter((m) => !m.caractere).map((m) => slugModele(m)));
if (new Set(slugs).size !== slugs.length) console.log('attention : des modèles portent le même nom dans un même thème');
let faits = 0, rates = 0;
for (let i = 0; i < slugs.length; i++) {
  try {
    const url = await page.evaluate((k) => epingleDeModele(MODELES.filter((m) => !m.caractere)[k]), i);
    writeFileSync(resolve(sortie, slugs[i] + '.jpg'), Buffer.from(url.split(',')[1], 'base64'));
    faits++;
  } catch (e) { rates++; console.log('raté :', slugs[i], String(e.message).slice(0, 120)); }
}
await nav.close();
console.log(`${faits} épingles fabriquées, ${rates} ratées`);
if (faits < 100) process.exit(1);
