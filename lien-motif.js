'use strict';
// Le lien du motif : une adresse qui contient TOUT le motif (plaque, perles, références), sous forme de code.
//   https://garlabane.github.io/perlinette/app/#motif=z…
// Qui l'ouvre retrouve le motif exact dans Perlinette, sans fichier à joindre et sans rien lire sur une image.
// On peut le coller partout : message, mail, description ou « lien » d'une épingle Pinterest.
// Le code : un petit en-tête (plaque, nuancier, nom, couleurs par référence) puis une case par picot,
// le tout compressé et écrit avec des lettres et des chiffres.

const ADRESSE_APP = 'https://garlabane.github.io/perlinette/app/';

const b64url = (o) => { let s = ''; for (const v of o) s += String.fromCharCode(v); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
const deB64url = (t) => { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/')); const o = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) o[i] = s.charCodeAt(i); return o; };
async function passer(octets, flux) {
  const w = flux.writable.getWriter(); w.write(octets); w.close();
  return new Uint8Array(await new Response(flux.readable).arrayBuffer());
}

// Le code du motif en cours (ou null : plaque dessinée à la main, motif vide)
async function codeDuMotif() {
  const f = formatParId(P.format);
  if (f.type === 'perso' || !P.cases.some((v) => v >= 0)) return null;
  const nb = new Array(P.couleurs.length).fill(0);
  for (const v of P.cases) if (v >= 0) nb[v]++;
  const rang = new Map(), couleurs = [], palM = PALETTES_FUSIBLES.find((p) => p.id === (P.nuancier || 'hama-midi')) || PALETTES_FUSIBLES[0];
  P.couleurs.forEach((c, i) => {
    if (!(nb[i] > 0) || couleurs.length >= 254) return;
    rang.set(i, couleurs.length + 1);
    // une couleur du nuancier du motif : son numéro suffit ; sinon sa référence et sa teinte
    const k = palM.couleurs.findIndex((z) => z.code === c.code && z.hex.toUpperCase() === String(c.hex).toUpperCase());
    couleurs.push(k >= 0 ? k : (c.code || '') + String(c.hex).toUpperCase());
  });
  const tete = new TextEncoder().encode(JSON.stringify({ v: 1, n: String(P.nom || '').slice(0, 40), f: P.format, c: P.cfg, p: palM.id, k: couleurs }));
  const brut = new Uint8Array(2 + tete.length + P.cases.length);
  brut[0] = tete.length >> 8; brut[1] = tete.length & 255; brut.set(tete, 2);
  P.cases.forEach((v, i) => { brut[2 + tete.length + i] = v >= 0 ? rang.get(v) || 0 : 0; });
  if (typeof CompressionStream === 'function') {
    try { return 'z' + b64url(await passer(brut, new CompressionStream('deflate-raw'))); } catch (e) { /* on envoie sans compresser */ }
  }
  return 'r' + b64url(brut);
}
async function lienDuMotif() { const c = await codeDuMotif(); return c ? ADRESSE_APP + '#motif=' + c : null; }

// Code → motif (ou null s'il est abîmé)
async function motifDepuisCode(code) {
  try {
    let brut = deB64url(code.slice(1));
    if (code[0] === 'z') brut = await passer(brut, new DecompressionStream('deflate-raw'));
    else if (code[0] !== 'r') return null;
    const lt = (brut[0] << 8) | brut[1], t = JSON.parse(new TextDecoder().decode(brut.slice(2, 2 + lt)));
    const f = PLAQUES.find((p) => p.id === t.f);
    if (!f || t.v !== 1) return null;
    const cfg = { cols: Math.max(1, Math.min(10, +t.c.cols || 1)), rangs: Math.max(1, Math.min(10, +t.c.rangs || 1)) };
    if (f.libre) { cfg.w = Math.max(1, Math.min(200, +t.c.w || 29)); cfg.h = Math.max(1, Math.min(200, +t.c.h || 29)); }
    const pal = PALETTES_FUSIBLES.find((p) => p.id === t.p) || PALETTES_FUSIBLES[0];
    const motif = creerMotif(String(t.n || 'Motif reçu').slice(0, 40), f.id, cfg, pal.id);
    const cases = brut.slice(2 + lt);
    if (cases.length !== motif.cases.length) return null;
    motif.couleurs = t.k.map((s) => {
      if (typeof s === 'number') { const c = pal.couleurs[s]; if (!c) throw new Error('couleur'); return { code: c.code, nom: c.nom, nomOfficiel: c.nomOfficiel, hex: c.hex, marque: nomCourt(pal) }; }
      const i = s.lastIndexOf('#'), ref = s.slice(0, i), hex = s.slice(i);
      if (!/^#[0-9A-F]{6}$/.test(hex)) throw new Error('couleur');
      // la référence d'abord dans le nuancier du motif, puis dans les autres marques
      for (const q of [pal, ...PALETTES_FUSIBLES]) {
        const c = q.couleurs.find((z) => z.code === ref && z.hex.toUpperCase() === hex);
        if (c) return { code: c.code, nom: c.nom, nomOfficiel: c.nomOfficiel, hex: c.hex, marque: nomCourt(q) };
      }
      return { code: ref, nom: ref ? 'Couleur ' + ref : 'Couleur', hex, marque: 'Mes couleurs' };
    });
    motif.cases = Array.from(cases, (v) => (v > 0 && v <= motif.couleurs.length ? v - 1 : -1));
    return motif;
  } catch (e) { return null; }
}

// Ouvrir le motif d'une adresse « …#motif=… » (à l'arrivée sur la page, ou si l'adresse change)
async function ouvrirLienRecu() {
  const m = /[#&]motif=([A-Za-z0-9_-]+)/.exec(location.hash);
  if (!m) return;
  const motif = await motifDepuisCode(m[1]);
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* adresse inchangée */ }
  if (!motif) { avertir('Ce lien de motif est abîmé ou incomplet : redemande-le à la personne qui te l’a envoyé.'); return; }
  document.querySelectorAll('dialog[open]').forEach((d) => d.close());
  charger(motif); sauverMaintenant();
  if (typeof zoomAjuster === 'function') zoomAjuster();
  message(`« ${motif.nom} » est ouvert : ${motif.cases.filter((v) => v >= 0).length} perles, ${motif.couleurs.length} couleurs.`, 6000);
}
window.addEventListener('load', () => setTimeout(ouvrirLienRecu, 400));
window.addEventListener('hashchange', ouvrirLienRecu);

// Partager le lien : menu de partage du téléphone, ou copie sur ordinateur
async function partagerLien() {
  if (!P.cases.some((v) => v >= 0)) { avertir('Ce motif est encore vide.'); return; }
  sauverMaintenant();
  const lien = await lienDuMotif();
  if (!lien) { avertir('Ce motif est sur une plaque dessinée à la main : envoie-le plutôt avec « Envoyer le motif ».'); return; }
  try {
    if (navigator.share && window.matchMedia('(pointer: coarse)').matches) { await navigator.share({ title: P.nom, text: `${P.nom}, un motif de perles à repasser à ouvrir dans Perlinette :`, url: lien }); return; }
  } catch (e) { if (e && e.name === 'AbortError') return; }
  let copie = false;
  try { await navigator.clipboard.writeText(lien); copie = true; } catch (e) { /* presse-papiers refusé */ }
  avertir((copie ? 'Lien copié : colle-le dans un message, un mail ou une épingle. ' : '') + `Qui l’ouvre retrouve ce motif dans Perlinette.\n\n${lien.length > 300 ? lien.slice(0, 300) + '…' : lien}`);
}
actions.partagerLien = partagerLien;
