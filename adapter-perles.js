'use strict';
// Adapter un motif à des perles données (« Mes perles » ou un nuancier) : chaque couleur du
// motif reçoit une perle, calculée uniquement depuis la couleur des perles (aucune table
// écrite à la main). Trois règles s'ajoutent à la simple « couleur la plus proche » :
//  1. deux couleurs du motif qui se touchent (contour / remplissage, tons d'un relief) ne
//     tombent pas sur la même perle tant qu'une autre perle convient ;
//  2. une transparente cherche d'abord une transparente, une phosphorescente une phosphorescente ;
//  3. une perle dont le stock (s'il est renseigné) ne suffit pas passe après les autres.
// Rien n'est bloquant : une couleur seulement approchée ou un stock court est signalé.

const ECART_PROCHE = 16;   // au-delà (ΔE), la perle n'est qu'« approchée »
const PENALITE_GENRE = 40; // opaque ↔ transparente / phosphorescente

// genre d'une perle, d'après son nom (traduit) ou son nom officiel
function genreDe(c) {
  const t = `${c.nom || ''} ${c.nomOfficiel || ''}`;
  if (/glow|phospho/i.test(t)) return 'phospho';
  return /transparent|translucent|clear/i.test(t) ? 'transparente' : 'opaque';
}
function ecartLab(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }
// même famille de teinte (pour qu'un vert pâle ne devienne pas crème, ni un rouge rose)
function teinteCompatible(a, b) {
  const ca = Math.hypot(a[1], a[2]), cb = Math.hypot(b[1], b[2]);
  if (ca < 12) return cb < 25;                 // gris / blanc / noir : rester neutre
  if (cb < ca * 0.45) return false;            // couleur vive → perle presque grise : non
  let d = Math.abs(Math.atan2(a[2], a[1]) - Math.atan2(b[2], b[1])) * 180 / Math.PI;
  if (d > 180) d = 360 - d;
  return d <= 20;
}

// source : couleurs du motif ; cases : indices ; voisins : voisins de chaque picot ;
// cible : perles disponibles ({hex, code, nom, qte?}). Renvoie, pour chaque couleur source,
// l'indice de la perle choisie (−1 si la couleur n'est pas utilisée).
function rapprocherCouleurs(source, cases, voisins, cible) {
  const n = source.map(() => 0);
  for (const v of cases) if (v >= 0) n[v]++;
  // quelles couleurs du motif se touchent
  const touche = source.map(() => new Set());
  cases.forEach((v, i) => { if (v < 0) return; for (const j of voisins[i] || []) { const w = cases[j]; if (w >= 0 && w !== v) touche[v].add(w); } });
  const labS = source.map((c) => rgbLab(hexRgb(c.hex))), labC = cible.map((c) => rgbLab(hexRgb(c.hex)));
  const genresC = cible.map(genreDe), restant = cible.map((c) => (c.qte == null || c.qte === '' ? Infinity : +c.qte));
  const carte = source.map(() => -1);
  // les couleurs les plus présentes choisissent d'abord ; les détails s'adaptent ensuite
  const ordre = [...source.keys()].filter((k) => n[k] > 0).sort((a, b) => n[b] - n[a]);
  for (const s of ordre) {
    const g = genreDe(source[s]), existeGenre = g !== 'opaque' && genresC.includes(g);
    const cout = (p) => {
      let c = ecartLab(labS[s], labC[p]);
      if (genresC[p] !== g && (g === 'opaque' || existeGenre)) c += g === 'opaque' ? PENALITE_GENRE : 1000;
      return c;
    };
    const tries = [...cible.keys()].sort((a, b) => cout(a) - cout(b));
    if (!tries.length) continue;
    // on ne quitte la perle la plus proche que pour une autre qui « convient » aussi :
    // assez proche, ou à peine plus loin et de la même famille de teinte
    const meilleur = ecartLab(labS[s], labC[tries[0]]);
    const convient = (p) => { const e = ecartLab(labS[s], labC[p]); return p === tries[0] || e <= ECART_PROCHE || (e <= meilleur + 6 && teinteCompatible(labS[s], labC[p])); };
    const prise = (p) => [...touche[s]].some((t) => carte[t] === p);
    const assez = (p) => restant[p] >= n[s];
    const choix = tries.find((p) => convient(p) && !prise(p) && assez(p))   // idéal
      ?? tries.find((p) => convient(p) && !prise(p))                       // voisines d'abord
      ?? tries.find((p) => convient(p) && assez(p))
      ?? tries[0];
    carte[s] = choix;
    restant[choix] -= n[s];
  }
  return carte;
}

// état de chaque ligne pour une correspondance donnée (pour l'affichage)
function etatCorrespondance(source, cases, voisins, cible, carte) {
  const n = source.map(() => 0);
  for (const v of cases) if (v >= 0) n[v]++;
  const besoin = cible.map(() => 0);
  carte.forEach((p, s) => { if (p >= 0) besoin[p] += n[s]; });
  const touche = source.map(() => new Set());
  cases.forEach((v, i) => { if (v < 0) return; for (const j of voisins[i] || []) { const w = cases[j]; if (w >= 0 && w !== v) touche[v].add(w); } });
  return source.map((c, s) => {
    const p = carte[s];
    if (p < 0) return null;
    const ecart = ecartLab(rgbLab(hexRgb(c.hex)), rgbLab(hexRgb(cible[p].hex))), q = cible[p].qte;
    return {
      n: n[s], ecart, approchee: ecart > ECART_PROCHE,
      genre: genreDe(c) !== genreDe(cible[p]) ? genreDe(c) : null,
      stockCourt: q != null && q !== '' && +q < besoin[p] ? { qte: +q, besoin: besoin[p] } : null,
      confondue: [...touche[s]].some((t) => carte[t] === p),
    };
  });
}

// applique une correspondance au motif ouvert (« Annuler » reste possible)
function appliquerCorrespondance(cible, carte, nuancier) {
  memoriser();
  const garde = [], nouvel = new Map();
  carte.forEach((p) => { if (p >= 0 && !nouvel.has(p)) { nouvel.set(p, garde.length); const { code, nom, nomOfficiel, hex, marque } = cible[p]; garde.push({ code, nom, nomOfficiel, hex, marque }); } });
  P.cases = P.cases.map((v) => (v >= 0 && carte[v] >= 0 ? nouvel.get(carte[v]) : -1));
  P.couleurs = garde.length ? garde : P.couleurs;
  if (nuancier) P.nuancier = nuancier;
  S.couleur = 0;
  fini();
}

// variante « vignette » : renvoie un motif recoloré sans toucher au motif ouvert
function recolorerPose(pose, cible) {
  const carte = rapprocherCouleurs(pose.couleurs, pose.cases, pose.surf.voisins, cible);
  const etat = etatCorrespondance(pose.couleurs, pose.cases, pose.surf.voisins, cible, carte);
  return { ...pose, couleurs: pose.couleurs.map((c, s) => (carte[s] >= 0 ? cible[carte[s]] : c)), etat: etat.filter(Boolean) };
}

// Tableau « couleur du motif → ta perle », modifiable ligne par ligne. Résout avec la carte
// choisie, ou null si on annule.
function tableauCorrespondance({ titre, intro, source, cases, voisins, cible, ok = 'Appliquer' }) {
  return new Promise((resoudre) => {
    let carte = rapprocherCouleurs(source, cases, voisins, cible);
    const labC = cible.map((c) => rgbLab(hexRgb(c.hex)));
    const dlg = document.createElement('dialog'); dlg.className = 'large';
    dlg.innerHTML = `<form method="dialog"><h3></h3><p class="note"></p>
      <div class="corresp-tete"><span>Couleur du modèle</span><span></span><span>Ta perle</span></div>
      <div class="corresp-liste"></div>
      <p class="note corresp-resume"></p>
      <menu><button type="button" value="annuler">Annuler</button><button type="button" value="ok" class="principal"></button></menu></form>`;
    dlg.querySelector('h3').textContent = titre;
    dlg.querySelector('p.note').textContent = intro || 'Chaque couleur reçoit la perle la plus proche. Tu peux changer une ligne avant d’appliquer.';
    dlg.querySelector('[value=ok]').textContent = ok;
    const liste = dlg.querySelector('.corresp-liste');
    const pastille = (c) => `<i class="corresp-pastille${estTransparente(c) ? ' transp' : ''}" style="background:${c.hex}"></i>`;
    const libelle = (c) => `${c.code ? echap(c.code) + ' · ' : ''}${echap(c.nom || '')}${c.marque ? ` <small>${echap(c.marque)}</small>` : ''}`;
    const lignes = [];
    source.forEach((c, s) => {
      if (carte[s] < 0) return;
      const lab = rgbLab(hexRgb(c.hex));
      const options = [...cible.keys()].sort((a, b) => ecartLab(lab, labC[a]) - ecartLab(lab, labC[b]));
      const ligne = document.createElement('div'); ligne.className = 'corresp-ligne';
      ligne.innerHTML = `<span class="corresp-src">${pastille(c)}<span>${libelle(c)}</span></span><span class="corresp-fleche">→</span>
        <span class="corresp-dst"><i class="corresp-pastille"></i><select></select></span><span class="corresp-info"></span>`;
      const sel = ligne.querySelector('select');
      sel.innerHTML = options.map((p) => `<option value="${p}">${echap(cible[p].code || '')} ${echap(cible[p].nom || '')}${cible[p].marque ? ' (' + echap(cible[p].marque) + ')' : ''}</option>`).join('');
      sel.value = String(carte[s]);
      sel.onchange = () => { carte[s] = +sel.value; maj(); };
      liste.appendChild(ligne); lignes.push([s, ligne]);
    });
    const maj = () => {
      const etat = etatCorrespondance(source, cases, voisins, cible, carte);
      let nAppr = 0, nStock = 0;
      for (const [s, ligne] of lignes) {
        const e = etat[s], p = carte[s], d = ligne.querySelector('.corresp-dst .corresp-pastille');
        d.style.background = cible[p].hex; d.classList.toggle('transp', estTransparente(cible[p]));
        const notes = [`${e.n} perle${e.n > 1 ? 's' : ''}`];
        if (e.approchee) { notes.push('<b class="corresp-alerte">couleur approchée</b>'); nAppr++; }
        if (e.genre) notes.push(`<b class="corresp-alerte">pas de perle ${e.genre === 'phospho' ? 'phosphorescente' : 'transparente'} chez toi</b>`);
        if (e.stockCourt) { notes.push(`<b class="corresp-alerte">stock : ${e.stockCourt.qte} pour ${e.stockCourt.besoin}</b>`); nStock++; }
        if (e.confondue) notes.push('<span class="corresp-doux">même perle qu’une couleur voisine</span>');
        ligne.querySelector('.corresp-info').innerHTML = notes.join(' · ');
      }
      const utilisees = new Set(carte.filter((p) => p >= 0)).size;
      dlg.querySelector('.corresp-resume').textContent = `${lignes.length} couleur${lignes.length > 1 ? 's' : ''} du modèle → ${utilisees} perle${utilisees > 1 ? 's' : ''} différente${utilisees > 1 ? 's' : ''}`
        + (nAppr ? ` · ${nAppr} approchée${nAppr > 1 ? 's' : ''}` : '') + (nStock ? ` · ${nStock} stock${nStock > 1 ? 's' : ''} court${nStock > 1 ? 's' : ''}` : '') + '.';
    };
    maj();
    document.body.appendChild(dlg);
    // fin par les boutons (et Échap / fermeture en secours) ; une seule fois
    let fini_ = false;
    const finir = (valide) => { if (fini_) return; fini_ = true; if (dlg.open) dlg.close(); dlg.remove(); resoudre(valide ? carte.slice() : null); };
    dlg.querySelector('[value=ok]').onclick = () => finir(true);
    dlg.querySelector('[value=annuler]').onclick = () => finir(false);
    dlg.addEventListener('cancel', (e) => { e.preventDefault(); finir(false); });
    dlg.addEventListener('close', () => finir(false));
    dlg.showModal();
  });
}

// perles cibles : « Mes perles » garde la quantité (pour la règle du stock)
function perlesCibles(id) {
  if (id === 'biblio') return couleursBiblio().map(({ code, nom, nomOfficiel, hex, marque, qte }) => ({ code, nom, nomOfficiel, hex, marque, qte }));
  return couleursDuNuancier(id);
}

// « Convertir le motif » (panneau Couleurs) et ouverture d'un modèle « avec mes perles »
async function adapterMotifOuvert(id, titre, intro) {
  const cible = perlesCibles(id);
  if (!cible.length) { message('Ce nuancier est vide.'); return false; }
  const carte = await tableauCorrespondance({ titre, intro, source: P.couleurs, cases: P.cases, voisins: SURF.voisins, cible });
  if (!carte) return false;
  appliquerCorrespondance(cible, carte, id);
  message(`Motif adapté à « ${nomDuNuancier(id)} ». « Annuler » remet les couleurs d’avant.`, 3500);
  return true;
}
