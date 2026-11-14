'use strict';
// Mode enfant : le bouton « Repasser ».
// Une feuille de papier se pose sur la plaque, un fer passe dessus en zigzag, les perles fondent
// (trois degrés, comme dans l'aperçu du repassage), puis le papier s'en va et la pièce est prête.
// Ce n'est qu'un jeu à l'écran : rien n'est modifié dans le motif, et un toucher passe l'animation.

const FER_SVG = `<svg viewBox="0 0 220 150" aria-hidden="true">
  <defs><linearGradient id="ferCorps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9bec6"/><stop offset="1" stop-color="#7d838d"/></linearGradient></defs>
  <path d="M10 118 Q10 96 46 84 L178 64 Q214 62 214 100 L214 118 Q214 128 200 128 L24 128 Q10 128 10 118Z" fill="url(#ferCorps)" stroke="#4d525a" stroke-width="3"/>
  <path d="M52 84 Q58 30 112 26 L150 28 Q176 30 178 64 L100 76Z" fill="#6e2f5c" stroke="#4a1f3e" stroke-width="3"/>
  <path d="M84 70 Q92 46 118 44 L142 46 Q156 48 156 62Z" fill="#f4e9ee" opacity=".85"/>
  <circle cx="190" cy="98" r="9" fill="#e8a498" stroke="#4d525a" stroke-width="2"/>
  <path d="M30 118 L200 118" stroke="#9aa0a9" stroke-width="3" opacity=".7"/>
</svg>`;

let REPASSE = null; // animation en cours

function repasserFin(restaurer) {
  if (!REPASSE) return;
  cancelAnimationFrame(REPASSE.raf);
  REPASSE.couche.remove();
  const avant = REPASSE.avant;
  REPASSE = null;
  if (restaurer) { reglages.fusion = avant; toutMettreAJour(); }
}

function lancerRepassage() {
  if (REPASSE) return;
  if (!P.cases.some((v) => v >= 0)) { message('Pose quelques perles d’abord, puis repasse-les !'); return; }
  const avant = reglages.fusion || 0;
  const r = toile.getBoundingClientRect(), zr = document.getElementById('zone').getBoundingClientRect();
  // la zone visible de la plaque (la toile peut dépasser de l'écran)
  const x0 = Math.max(r.left, zr.left), y0 = Math.max(r.top, zr.top), x1 = Math.min(r.right, zr.right), y1 = Math.min(r.bottom, zr.bottom);
  const L = x1 - x0, H = y1 - y0;
  const couche = document.createElement('div');
  couche.className = 'repasse-couche';
  couche.style.cssText = `left:${x0}px;top:${y0}px;width:${L}px;height:${H}px`;
  couche.innerHTML = `<div class="repasse-papier"></div><div class="repasse-fer" style="width:${Math.min(L * 0.5, 260)}px">${FER_SVG}</div>
    <div class="repasse-msg" role="status"></div>`;
  document.body.appendChild(couche);
  const papier = couche.querySelector('.repasse-papier'), fer = couche.querySelector('.repasse-fer'), msg = couche.querySelector('.repasse-msg');
  REPASSE = { couche, avant, raf: 0 };
  reglages.fusion = 0; toutMettreAJour();
  const calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DUREE = calme ? 600 : 7000;
  const debut = performance.now();
  const ease = (t) => t * t * (3 - 2 * t);
  let degre = 0;
  const termine = () => {
    msg.innerHTML = '<b>Ta pièce est prête !</b> <button type="button" class="repasse-bouton">↩ Revoir les perles</button>';
    msg.classList.add('visible');
    msg.querySelector('button').onclick = (e) => { e.stopPropagation(); repasserFin(true); };
    fer.style.opacity = '0'; papier.style.opacity = '0';
    couche.classList.add('termine');
    REPASSE.raf = 0;
  };
  const passer = () => { reglages.fusion = 3; toutMettreAJour(); termine(); };
  couche.addEventListener('click', () => { if (couche.classList.contains('termine')) return; passer(); }); // un toucher : on saute à la fin
  const pas = (t) => {
    if (!REPASSE) return;
    const p = Math.min(1, (t - debut) / DUREE);
    // 0 – 12 % : le papier se pose ; 12 – 88 % : le fer passe en zigzag ; 88 – 100 % : il s'en va
    papier.style.opacity = String(Math.min(0.5, p / 0.12 * 0.5));
    papier.style.transform = `translateY(${(1 - Math.min(1, p / 0.12)) * -24}px)`;
    const q = Math.max(0, Math.min(1, (p - 0.12) / 0.76));
    const lignes = 4, tri = Math.abs(((q * lignes) % 2) - 1); // va-et-vient
    const fx = 0.1 + 0.8 * (Math.floor(q * lignes) % 2 ? 1 - ((q * lignes) % 1) : (q * lignes) % 1);
    const fy = 0.12 + 0.76 * q;
    const out = p > 0.88 ? ease((p - 0.88) / 0.12) : 0;
    const w = fer.offsetWidth, h = fer.offsetHeight;
    fer.style.transform = `translate(${fx * (L - w) + out * L * 0.6}px, ${fy * (H - h)}px) rotate(${-8 + (Math.floor(q * lignes) % 2 ? 6 : -6) * (1 - tri)}deg)`;
    fer.style.opacity = p < 0.12 ? String(p / 0.12) : String(1 - out);
    const d = q < 0.34 ? 1 : q < 0.7 ? 2 : 3;
    if (p > 0.12 && d !== degre) { degre = d; reglages.fusion = d; toutMettreAJour(); msg.textContent = d === 1 ? 'Ça chauffe…' : d === 2 ? 'Les perles fondent…' : 'Presque fini !'; msg.classList.add('visible'); }
    if (p >= 1) { termine(); return; }
    REPASSE.raf = requestAnimationFrame(pas);
  };
  REPASSE.raf = requestAnimationFrame(pas);
}
actions.repasser = lancerRepassage;

// changer de motif, quitter le mode enfant ou toucher un outil : on range l'animation
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && REPASSE) repasserFin(true); });
