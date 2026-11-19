"""Générateur des cadres photo Perlinette.
Chaque cadre : on peint des formes, on découpe le trou de la photo, on élague les perles
fragiles (tenues par un seul côté, traits d'une perle de large, morceaux détachés),
puis on pose le contour et les détails. Couleurs = vraies références Hama Midi."""
import math

FORMATS = {
    'id':    dict(nom="Photo d'identité", taille='3,5 × 4,5 cm', tw=6, th=8, W=29, H=29),
    'mini':  dict(nom='Instax mini', taille='5,4 × 8,6 cm', tw=8, th=11, W=29, H=29),
    'carre': dict(nom='Photo carrée', taille='Instax Square, 7,2 × 8,6 cm', tw=11, th=11, W=29, H=29),
    '9x13':  dict(nom='Tirage 9 × 13', taille='9 × 13 cm', tw=16, th=24, W=29, H=58),
    '10x15': dict(nom='Tirage 10 × 15', taille='10 × 15 cm', tw=18, th=28, W=29, H=58),
}
V4 = ((1, 0), (-1, 0), (0, 1), (0, -1))


class Cadre:
    def __init__(self, fmt, dy=0):
        f = FORMATS[fmt]
        self.fmt = fmt
        self.W, self.H, self.tw, self.th = f['W'], f['H'], f['tw'], f['th']
        self.L = (self.W - self.tw) // 2
        self.T = (self.H - self.th) // 2 + dy
        self.R = self.L + self.tw - 1
        self.B = self.T + self.th - 1
        self.mx = (self.L + self.R) / 2
        self.my = (self.T + self.B) / 2
        self.g = [['.'] * self.W for _ in range(self.H)]
        self.details = []
        self.couleurs = {}

    # --- peinture -------------------------------------------------------
    def cases(self):
        for y in range(self.H):
            for x in range(self.W):
                yield x, y

    def peindre(self, test, l):
        for x, y in self.cases():
            if test(x, y):
                self.g[y][x] = l

    def recolorer(self, test, l):  # seulement là où il y a déjà une perle
        for x, y in self.cases():
            if self.g[y][x] not in '.#' and test(x, y):
                self.g[y][x] = l

    def bande(self, b, l, r=1.5, haut=None, bas=None, gauche=None, droite=None):
        """Rectangle arrondi autour du trou, b perles d'épaisseur (ou épaisseurs par côté)."""
        x0, x1 = self.L - (gauche if gauche is not None else b), self.R + (droite if droite is not None else b)
        y0, y1 = self.T - (haut if haut is not None else b), self.B + (bas if bas is not None else b)
        self.peindre(lambda x, y: rect_arrondi(x, y, x0, y0, x1, y1, r), l)
        return x0, y0, x1, y1

    def disque(self, cx, cy, r, l):
        self.peindre(lambda x, y: math.hypot(x - cx, y - cy) <= r, l)

    def ellipse(self, cx, cy, rx, ry, l, a=0.0):
        ca, sa = math.cos(a), math.sin(a)
        def t(x, y):
            dx, dy = x - cx, y - cy
            u, v = dx * ca + dy * sa, -dx * sa + dy * ca
            return (u / rx) ** 2 + (v / ry) ** 2 <= 1
        self.peindre(t, l)

    def poly(self, pts, l):
        self.peindre(lambda x, y: dans_poly(x, y, pts), l)

    def coeur(self, cx, cy, s, l):
        self.peindre(lambda x, y: est_coeur(x, y, cx, cy, s), l)

    def detail(self, test, l):
        self.details.append((test, l))

    # --- finition -------------------------------------------------------
    def plein(self, x, y):
        return 0 <= x < self.W and 0 <= y < self.H and self.g[y][x] not in '.#'

    def finir(self, contour=None, interieur=None, garder_contour=''):
        g = self.g
        for y in range(self.T, self.B + 1):
            for x in range(self.L, self.R + 1):
                g[y][x] = '#'
        self.elaguer()
        if contour:
            out = [r[:] for r in g]
            for x, y in self.cases():
                if self.plein(x, y) and g[y][x] not in garder_contour:
                    for dx, dy in V4:
                        X, Y = x + dx, y + dy
                        if not (0 <= X < self.W and 0 <= Y < self.H) or g[Y][X] == '.':
                            out[y][x] = contour
                            break
            self.g = g = out
        if interieur:
            for x, y in self.cases():
                if self.plein(x, y) and any(0 <= x + dx < self.W and 0 <= y + dy < self.H and g[y + dy][x + dx] == '#' for dx, dy in V4):
                    g[y][x] = interieur
        for test, l in self.details:
            for x, y in self.cases():
                if self.plein(x, y) and test(x, y):
                    g[y][x] = l
        self.elaguer()  # un détail « vide » ne doit pas laisser de perle fragile
        return self

    def elaguer(self):
        g = self.g
        while True:
            enlever = []
            for x, y in self.cases():
                if not self.plein(x, y):
                    continue
                n = [self.plein(x + dx, y + dy) for dx, dy in V4]
                if sum(n) < 2 or (sum(n) == 2 and ((n[0] and n[1]) or (n[2] and n[3]))):
                    enlever.append((x, y))
            # morceaux détachés du cadre
            vu, comp = set(), []
            for x, y in self.cases():
                if self.plein(x, y) and (x, y) not in vu:
                    pile, c = [(x, y)], []
                    vu.add((x, y))
                    while pile:
                        a, b = pile.pop(); c.append((a, b))
                        for dx, dy in V4:
                            if self.plein(a + dx, b + dy) and (a + dx, b + dy) not in vu:
                                vu.add((a + dx, b + dy)); pile.append((a + dx, b + dy))
                    comp.append(c)
            comp.sort(key=len, reverse=True)
            for c in comp[1:]:
                enlever += c
            if not enlever:
                return
            for x, y in set(enlever):
                g[y][x] = '.'

    def grille(self):
        """Grille rognée au plus juste, trou compris."""
        ys = [y for y in range(self.H) if any(c != '.' for c in self.g[y])]
        xs = [x for x in range(self.W) if any(self.g[y][x] != '.' for y in range(self.H))]
        return [''.join(self.g[y][min(xs):max(xs) + 1]) for y in range(min(ys), max(ys) + 1)]


# --- géométrie --------------------------------------------------------------
def rect_arrondi(x, y, x0, y0, x1, y1, r):
    if not (x0 <= x <= x1 and y0 <= y <= y1):
        return False
    cx = min(max(x, x0 + r), x1 - r)
    cy = min(max(y, y0 + r), y1 - r)
    return math.hypot(x - cx, y - cy) <= r + 0.2


def dans_poly(x, y, pts):
    d = False
    for i in range(len(pts)):
        (xi, yi), (xj, yj) = pts[i], pts[i - 1]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            d = not d
    return d


def est_coeur(x, y, cx, cy, s):
    X = (x - cx) / s
    Y = -(y - cy) / s + 0.25
    return (X * X + Y * Y - 1) ** 3 - X * X * Y ** 3 <= 0


# --- contrôle ---------------------------------------------------------------
def controle(grille):
    h, w = len(grille), len(grille[0])
    p = lambda x, y: 0 <= x < w and 0 <= y < h and grille[y][x] not in '.#'
    soucis = []
    for y in range(h):
        for x in range(w):
            if not p(x, y):
                continue
            n = [p(x + dx, y + dy) for dx, dy in V4]
            if sum(n) < 2:
                soucis.append(f'perle tenue par {sum(n)} côté en {x},{y}')
            elif sum(n) == 2 and ((n[0] and n[1]) or (n[2] and n[3])):
                soucis.append(f'trait d\'une perle en {x},{y}')
    # épaisseur autour du trou
    mini = 99
    for y in range(h):
        for x in range(w):
            if grille[y][x] != '#':
                continue
            for dx, dy in V4:
                X, Y, k = x + dx, y + dy, 0
                while p(X, Y):
                    X += dx; Y += dy; k += 1
                if k:
                    mini = min(mini, k)
    if mini < 2:
        soucis.append(f'bord de {mini} perle autour du trou')
    # le trou doit être entièrement entouré de perles
    for y in range(h):
        for x in range(w):
            if grille[y][x] == '#':
                for dx, dy in V4:
                    X, Y = x + dx, y + dy
                    if not (0 <= X < w and 0 <= Y < h) or grille[Y][X] == '.':
                        soucis.append(f'trou ouvert en {x},{y}')
    return soucis, mini
