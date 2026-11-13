'use strict';
// Perlinette hors ligne (version en ligne installée sur l'écran d'accueil).
// Réseau d'abord : on prend toujours la dernière version quand il y a Internet, et on en garde
// une copie ; sans Internet, on sert cette copie. L'adresse est rangée sans son « ?v=… ».
const CACHE = 'perlinette-1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== self.location.origin || u.pathname.endsWith('version.json')) return;
  const cle = u.origin + u.pathname;
  e.respondWith(
    fetch(r).then((rep) => {
      if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then((c) => c.put(cle, copie)); }
      return rep;
    }).catch(() => caches.open(CACHE).then((c) => c.match(cle)).then((x) => x || Response.error()))
  );
});
