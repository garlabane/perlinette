'use strict';
// « Je pose mes perles » : l'écran sert de guide à côté de la plaque.
//  • par couleur : la couleur en cours est en avant, celles déjà posées en clair, le reste en gris ;
//  • par rangée : la rangée en cours, avec la suite des perles à poser (« 3 × Rouge, 2 × Blanc… ») ;
//  • plaque par plaque quand le motif en a plusieurs ;
//  • l'écran reste allumé, et on reprend où l'on s'était arrêté.
// Rien n'est modifié dans le motif : seule l'avancée est retenue, par motif, dans le navigateur.

const CLE_POSE = 'perlesrep.pose';
const POSE = { mode: 'couleur', etape: 0, plaque: -1, zoom: 0, verrou: null, reel: false };

// ---------- taille réelle : la plaque transparente se pose sur l'écran ----------
// Un écran ne connaît pas sa vraie taille : on la règle une fois, avec une carte bancaire
// (85,6 mm de large, la même partout), et le réglage est retenu sur cet appareil.
const CARTE_MM = 85.6;
function pxParMm() {
  if (reglages.pxParMm > 1) return reglages.pxParMm;
  return window.matchMedia('(pointer: coarse)').matches ? 6.3 : 3.78; // valeurs courantes, avant réglage
}
function reglerTailleReelle() {
  return new Promise((fini) => {
    let dlg = $('#dlgReel');
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.id = 'dlgReel';
      dlg.innerHTML = `<form method="dialog">
        <h3>Régler la taille réelle</h3>
        <p class="note">Pose une carte bancaire (ou de fidélité) sur l'écran, contre le rectangle, puis déplace le curseur jusqu'à ce que le rectangle ait exactement sa largeur.</p>
        <div class="reel-zone"><div class="reel-carte" id="reelCarte"></div></div>
        <input type="range" id="reelCurseur" min="2" max="12" step="0.01">
        <menu><button value="annuler" formnovalidate>Annuler</button><button value="ok" class="principal">C'est réglé</button></menu>
      </form>`;
      document.body.appendChild(dlg);
    }
    const curseur = $('#reelCurseur'), carte = $('#reelCarte');
    const maj = () => { carte.style.width = (+curseur.value * CARTE_MM) + 'px'; carte.style.height = (+curseur.value * 53.98) + 'px'; };
    curseur.value = pxParMm(); curseur.oninput = maj; maj();
    dlg.onclose = () => {
      const ok = dlg.returnValue === 'ok';
      if (ok) { reglages.pxParMm = +curseur.value; ecrire(CLE.reglages, reglages); }
      fini(ok);
    };
    dlg.returnValue = '';
    dlg.showModal();
  });
}
async function basculerReel() {
  if (!POSE.reel) {
    if (!(reglages.pxParMm > 1) && !(await reglerTailleReelle())) return;
    POSE.reel = true;
    message('Pose ta plaque transparente sur l’écran, picots sur les ronds. « 🔒 » empêche l’écran de bouger.', 6000);
  } else { POSE.reel = false; verrouillerPose(false); }
  dessinerPose();
}
// verrou : l'écran ne réagit plus aux doigts ni à la plaque, jusqu'à un appui long sur le cadenas
function verrouillerPose(oui) {
  const el = $('#pose');
  if (!el) return;
  el.classList.toggle('verrouille', !!oui);
  const b = $('#poseVerrou');
  if (b) { b.textContent = oui ? '🔓 Appui long' : '🔒 Verrouiller'; b.title = oui ? 'Reste appuyé une seconde pour déverrouiller' : 'L’écran ne bouge plus quand tu poses la plaque ou la main'; }
}

function poseRetenue() { return lire(CLE_POSE, {}); }
function retenirPose() {
  const tout = poseRetenue();
  tout[P.id] = { mode: POSE.mode, etape: POSE.etape, plaque: POSE.plaque };
  const ids = Object.keys(tout);
  if (ids.length > 60) delete tout[ids[0]];
  ecrire(CLE_POSE, tout);
}

// picots concernés (toute la surface, ou une seule plaque)
function picotsPose() {
  const liste = [];
  SURF.picots.forEach((q, i) => { if (POSE.plaque < 0 || q.b === POSE.plaque) liste.push(i); });
  return liste;
}
// les étapes : une par couleur (les plus nombreuses d'abord) ou une par rangée (de haut en bas)
function etapesPose() {
  const picots = picotsPose();
  if (POSE.mode === 'couleur') {
    const nb = new Map();
    for (const i of picots) { const v = P.cases[i]; if (v >= 0) nb.set(v, (nb.get(v) || 0) + 1); }
    return [...nb.entries()].sort((a, b) => b[1] - a[1]).map(([couleur, n]) => ({ couleur, nb: n }));
  }
  const rangs = new Map();
  for (const i of picots) {
    if (P.cases[i] < 0) continue;
    const y = Math.round(SURF.picots[i].y * 100) / 100;
    if (!rangs.has(y)) rangs.set(y, []);
    rangs.get(y).push(i);
  }
  return [...rangs.entries()].sort((a, b) => a[0] - b[0]).map(([y, liste], k) => ({
    y, numero: k + 1, picots: liste.sort((a, b) => SURF.picots[a].x - SURF.picots[b].x), nb: liste.length,
  }));
}
// rangée → suite « 3 × Rouge, 2 × Blanc… » ; un trou dans la rangée est signalé
function suiteRangee(et) {
  const suite = [];
  let precedent = null;
  for (const i of et.picots) {
    const v = P.cases[i], x = SURF.picots[i].x;
    const trou = precedent !== null && x - precedent > 1.2;
    if (trou) suite.push({ vide: Math.round(x - precedent - 1) });
    const der = suite[suite.length - 1];
    if (der && !trou && der.couleur === v) der.nb++;
    else suite.push({ couleur: v, nb: 1 });
    precedent = x;
  }
  return suite;
}

function cadrePose() {
  if (POSE.plaque >= 0 && SURF.plaques[POSE.plaque]) { const p = SURF.plaques[POSE.plaque]; return { x: p.x, y: p.y, larg: p.larg, haut: p.haut }; }
  return { x: 0, y: 0, larg: SURF.larg, haut: SURF.haut };
}

function dessinerPose() {
  const cv = $('#poseToile'), boite = $('#poseVue');
  if (!cv) return;
  const etapes = etapesPose();
  POSE.etape = Math.max(0, Math.min(etapes.length - 1, POSE.etape));
  const et = etapes[POSE.etape], c = cadrePose();
  majPanneauPose(etapes, et); // d'abord le panneau du bas : sa hauteur fixe la place laissée au dessin
  const ajuste = Math.max(4, Math.min((boite.clientWidth - 16) / c.larg, (boite.clientHeight - 16) / c.haut));
  const t = POSE.reel ? (P.pas || 5) * pxParMm() : Math.max(4, Math.min(60, ajuste * (POSE.zoom ? Math.pow(1.3, POSE.zoom) : 1)));
  $('#pose').classList.toggle('reel', POSE.reel);
  $('#poseReel').classList.toggle('actif', POSE.reel);
  $('#poseReel').textContent = POSE.reel ? '📏 Taille réelle ✓' : '📏 Taille réelle';
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.ceil(c.larg * t * dpr); cv.height = Math.ceil(c.haut * t * dpr);
  cv.style.width = Math.ceil(c.larg * t) + 'px'; cv.style.height = Math.ceil(c.haut * t) + 'px';
  cv._t = t; cv._c = c;
  const g = cv.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.larg * t, c.haut * t);
  // limites des plaques
  if (POSE.plaque < 0 && SURF.plaques.length > 1) {
    g.strokeStyle = '#d8cfc4'; g.setLineDash([4, 3]);
    for (const p of SURF.plaques) g.strokeRect(p.x * t + 0.5, p.y * t + 0.5, p.larg * t - 1, p.haut * t - 1);
    g.setLineDash([]);
  }
  const fait = new Set();            // ce qui est déjà posé
  if (POSE.mode === 'couleur') etapes.slice(0, POSE.etape).forEach((e) => fait.add(e.couleur));
  const enCours = POSE.mode === 'rangee' && et ? new Set(et.picots) : null;
  if (enCours) {                      // bande de la rangée en cours
    g.fillStyle = '#f6e6ef';
    g.fillRect(0, (et.y - c.y - 0.5) * t, c.larg * t, t);
  }
  for (const i of picotsPose()) {
    const q = SURF.picots[i], v = P.cases[i], x = (q.x - c.x) * t, y = (q.y - c.y) * t;
    if (v < 0) { g.beginPath(); g.arc(x, y, Math.max(0.7, t * 0.09), 0, 7); g.fillStyle = '#d9d2ca'; g.fill(); continue; }
    const hex = P.couleurs[v].hex;
    let etat;                         // 2 = à poser maintenant, 1 = déjà posé, 0 = plus tard
    if (POSE.mode === 'couleur') etat = et && v === et.couleur ? 2 : fait.has(v) ? 1 : 0;
    else etat = enCours.has(i) ? 2 : et && q.y < et.y ? 1 : 0;
    g.beginPath(); g.arc(x, y, t * 0.45, 0, 7);
    if (etat === 2) {
      g.fillStyle = hex; g.fill();
      g.lineWidth = Math.max(1.2, t * 0.11); g.strokeStyle = '#2b1a26'; g.stroke();
    } else if (etat === 1) {
      g.globalAlpha = 0.42; g.fillStyle = hex; g.fill(); g.globalAlpha = 1;
    } else {
      g.fillStyle = '#f1ece6'; g.fill();
      g.lineWidth = 1; g.strokeStyle = '#d9d2ca'; g.stroke();
    }
  }
}

function nomCouleurPose(v) { const c = P.couleurs[v]; return c ? (c.nom || c.code || '') : ''; }

function majPanneauPose(etapes, et) {
  const total = etapes.length;
  $('#poseTitre').textContent = P.nom;
  $('#poseAvance').style.width = total ? Math.round(((POSE.etape + 1) / total) * 100) + '%' : '0%';
  $('#posePrec').disabled = POSE.etape <= 0;
  $('#poseSuiv').textContent = POSE.etape >= total - 1 ? '✓ Terminé' : 'Suivant ▶';
  $$('#poseMode button').forEach((b) => b.classList.toggle('actif', b.dataset.mode === POSE.mode));
  const info = $('#poseInfo');
  if (!et) { info.innerHTML = '<b>Ce motif est vide.</b>'; $('#poseSuite').innerHTML = ''; return; }
  if (POSE.mode === 'couleur') {
    const c = P.couleurs[et.couleur];
    info.innerHTML = `<span class="pose-pastille" style="background:${c.hex}"></span>
      <span class="pose-texte"><b>${echap(c.nom || c.code)}</b>
      <small>${echap(c.code || '')} · ${et.nb} perle${et.nb > 1 ? 's' : ''} · couleur ${POSE.etape + 1} sur ${total}</small></span>`;
    // toutes les couleurs, pour sauter de l'une à l'autre
    $('#poseSuite').innerHTML = etapes.map((e, k) => `<button type="button" data-etape="${k}" class="pose-puce${k === POSE.etape ? ' actif' : ''}${k < POSE.etape ? ' fait' : ''}" title="${echap(nomCouleurPose(e.couleur))}">
      <span style="background:${P.couleurs[e.couleur].hex}"></span>${e.nb}</button>`).join('');
  } else {
    info.innerHTML = `<span class="pose-texte"><b>Rangée ${et.numero} sur ${total}</b>
      <small>${et.nb} perle${et.nb > 1 ? 's' : ''}, de gauche à droite</small></span>`;
    $('#poseSuite').innerHTML = suiteRangee(et).map((s) => (s.vide
      ? `<span class="pose-puce vide" title="Picots laissés vides">${s.vide} vide${s.vide > 1 ? 's' : ''}</span>`
      : `<span class="pose-puce" title="${echap(nomCouleurPose(s.couleur))}"><span style="background:${P.couleurs[s.couleur].hex}"></span>${s.nb} × ${echap(nomCouleurPose(s.couleur))}</span>`)).join('');
  }
  $$('#poseSuite [data-etape]').forEach((b) => (b.onclick = () => allerPose(+b.dataset.etape)));
  const actif = $('#poseSuite .actif');
  if (actif && actif.scrollIntoView) actif.scrollIntoView({ block: 'nearest', inline: 'center' });
  // plaques
  const pl = $('#posePlaques');
  pl.hidden = SURF.plaques.length < 2;
  if (!pl.hidden) {
    pl.innerHTML = `<button type="button" data-plaque="-1" class="${POSE.plaque < 0 ? 'actif' : ''}">Toutes</button>` +
      SURF.plaques.map((p, k) => `<button type="button" data-plaque="${k}" class="${POSE.plaque === k ? 'actif' : ''}">${echap(p.etiquette)}</button>`).join('');
    $$('#posePlaques button').forEach((b) => (b.onclick = () => { POSE.plaque = +b.dataset.plaque; POSE.etape = 0; POSE.zoom = 0; retenirPose(); dessinerPose(); }));
  }
}

function allerPose(k) { POSE.etape = k; retenirPose(); dessinerPose(); }

async function garderEcranAllume(oui) {
  try {
    if (oui && 'wakeLock' in navigator && !POSE.verrou) {
      POSE.verrou = await navigator.wakeLock.request('screen');
      POSE.verrou.addEventListener('release', () => { POSE.verrou = null; });
    } else if (!oui && POSE.verrou) { await POSE.verrou.release(); POSE.verrou = null; }
  } catch (e) { POSE.verrou = null; } // refusé (batterie faible…) : tant pis
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && $('#pose') && !$('#pose').hidden) garderEcranAllume(true); });

function fermerPose() {
  const el = $('#pose');
  if (el) el.hidden = true;
  document.body.classList.remove('pose-ouverte');
  garderEcranAllume(false);
}

function ouvrirPose() {
  if (!P.cases.some((v) => v >= 0)) { avertir('Ce motif est encore vide : choisis un modèle ou dessine d’abord.'); return; }
  sauverMaintenant();
  let el = $('#pose');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pose'; el.className = 'pose';
    el.innerHTML = `
      <header class="pose-haut">
        <button type="button" id="poseFermer" title="Revenir au motif">✕ Quitter</button>
        <strong id="poseTitre"></strong>
        <div class="segment pose-mode" id="poseMode">
          <button type="button" data-mode="couleur">Par couleur</button>
          <button type="button" data-mode="rangee">Par rangée</button>
        </div>
      </header>
      <div class="pose-outils">
        <button type="button" id="poseReel" title="Affiche le motif à sa vraie taille, pour poser la plaque transparente sur l'écran">📏 Taille réelle</button>
        <button type="button" id="poseRegler" class="reel-seul" title="Refaire le réglage avec une carte">Régler</button>
        <button type="button" id="poseVerrou" class="reel-seul">🔒 Verrouiller</button>
        <div class="pose-plaques" id="posePlaques" hidden></div>
      </div>
      <div class="pose-vue" id="poseVue"><canvas id="poseToile"></canvas></div>
      <div class="pose-zoom"><button type="button" id="poseMoins" title="Plus petit">−</button><button type="button" id="posePlus" title="Plus grand">+</button></div>
      <footer class="pose-bas">
        <div class="pose-barre"><div id="poseAvance"></div></div>
        <div class="pose-info" id="poseInfo"></div>
        <div class="pose-suite" id="poseSuite"></div>
        <div class="pose-boutons">
          <button type="button" id="posePrec">◀ Précédent</button>
          <button type="button" id="poseSuiv" class="principal">Suivant ▶</button>
        </div>
      </footer>`;
    document.body.appendChild(el);
    $('#poseFermer').onclick = fermerPose;
    $('#posePrec').onclick = () => allerPose(POSE.etape - 1);
    $('#poseSuiv').onclick = () => {
      const total = etapesPose().length;
      if (POSE.etape >= total - 1) { fermerPose(); message('Bravo, tout est posé ! Il ne reste plus qu’à repasser.', 5000); return; }
      allerPose(POSE.etape + 1);
    };
    $$('#poseMode button').forEach((b) => (b.onclick = () => { POSE.mode = b.dataset.mode; POSE.etape = 0; retenirPose(); dessinerPose(); }));
    $('#poseReel').onclick = basculerReel;
    $('#poseRegler').onclick = async () => { if (await reglerTailleReelle()) dessinerPose(); };
    // cadenas : un toucher verrouille ; pour déverrouiller, rester appuyé une seconde
    let appui = null;
    const cadenas = $('#poseVerrou');
    cadenas.onclick = () => { if (!el.classList.contains('verrouille')) verrouillerPose(true); };
    cadenas.onpointerdown = () => { if (el.classList.contains('verrouille')) appui = setTimeout(() => { verrouillerPose(false); appui = 'fait'; }, 900); };
    cadenas.onpointerup = cadenas.onpointerleave = cadenas.onpointercancel = () => { if (appui && appui !== 'fait') clearTimeout(appui); setTimeout(() => { appui = null; }, 50); };
    cadenas.addEventListener('click', (e) => { if (appui === 'fait') e.stopImmediatePropagation(); }, true);
    $('#poseMoins').onclick = () => { POSE.zoom = Math.max(-2, Math.round(POSE.zoom) - 1); dessinerPose(); };
    $('#posePlus').onclick = () => { POSE.zoom = Math.min(7, Math.round(POSE.zoom) + 1); dessinerPose(); };
    // deux doigts sur le dessin : écarter / pincer pour agrandir ou réduire (un doigt fait défiler)
    const vue = $('#poseVue'), doigts = new Map();
    let pince = null, enAttente = false;
    const ecart = () => { const [a, b] = [...doigts.values()]; return { d: Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)), cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 }; };
    vue.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch' || POSE.reel) return;
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (doigts.size === 2) pince = { ...ecart(), zoom: POSE.zoom };
    });
    vue.addEventListener('pointermove', (e) => {
      if (!doigts.has(e.pointerId)) return;
      doigts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!pince || doigts.size < 2) return;
      e.preventDefault();
      const m = ecart(), cv = $('#poseToile'), b = cv.getBoundingClientRect();
      // le point sous les doigts reste sous les doigts
      const ux = (m.cx - b.left) / cv._t, uy = (m.cy - b.top) / cv._t;
      POSE.zoom = Math.max(-2, Math.min(7, pince.zoom + Math.log(m.d / pince.d) / Math.log(1.3)));
      if (enAttente) return;
      enAttente = true;
      requestAnimationFrame(() => {
        enAttente = false;
        dessinerPose();
        const b2 = cv.getBoundingClientRect();
        vue.scrollLeft += b2.left + ux * cv._t - m.cx; vue.scrollTop += b2.top + uy * cv._t - m.cy;
      });
    }, { passive: false });
    const leve = (e) => { doigts.delete(e.pointerId); if (doigts.size < 2) pince = null; };
    vue.addEventListener('pointerup', leve); vue.addEventListener('pointercancel', leve);
    // toucher une perle : aller à sa couleur (ou à sa rangée)
    $('#poseToile').addEventListener('click', (e) => {
      const cv = e.currentTarget, b = cv.getBoundingClientRect();
      const x = (e.clientX - b.left) / cv._t + cv._c.x, y = (e.clientY - b.top) / cv._t + cv._c.y;
      const i = picotProche(SURF, x, y);
      if (i < 0 || P.cases[i] < 0) return;
      const etapes = etapesPose();
      const k = POSE.mode === 'couleur' ? etapes.findIndex((s) => s.couleur === P.cases[i]) : etapes.findIndex((s) => s.picots.includes(i));
      if (k >= 0) allerPose(k);
    });
    window.addEventListener('resize', () => { if (!el.hidden) dessinerPose(); });
    document.addEventListener('keydown', (e) => {
      if (el.hidden || e.target.closest('dialog[open]')) return;
      e.stopPropagation(); // les raccourcis de dessin ne doivent pas agir derrière
      if (e.key === 'Escape') fermerPose();
      else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); $('#poseSuiv').click(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); if (POSE.etape > 0) allerPose(POSE.etape - 1); }
    }, true);
  }
  const retenue = poseRetenue()[P.id];
  POSE.mode = retenue?.mode === 'rangee' ? 'rangee' : 'couleur';
  POSE.plaque = Number.isInteger(retenue?.plaque) && retenue.plaque < SURF.plaques.length ? retenue.plaque : -1;
  POSE.etape = retenue?.etape || 0;
  POSE.zoom = 0; POSE.reel = false;
  verrouillerPose(false);
  el.hidden = false;
  document.body.classList.add('pose-ouverte');
  if (typeof fermerMenuMobile === 'function') fermerMenuMobile();
  garderEcranAllume(true);
  dessinerPose();
}

actions.poser = ouvrirPose;
