"""Recettes de cadres : chacune s'adapte à la taille du trou (format de photo)."""
import math
from gen import Cadre

def ech(c):  # échelle des décors selon le format
    return {'id': 0.8, 'mini': 1.0, 'carre': 1.25, '9x13': 1.7, '10x15': 1.9}[c.fmt]

def b_(c):  # épaisseur de la bande de base
    return {'id': 2, 'mini': 2, 'carre': 3, '9x13': 3, '10x15': 3}[c.fmt]


# ---------- nature ----------
def nuage(fmt, fond='H01', bord='H46', joue='H06'):
    c = Cadre(fmt); s = ech(c); b = b_(c) + 1
    x0, y0, x1, y1 = c.bande(b, 'A', r=2)
    r = 2.6 * s
    for k, t in enumerate([0.22, 0.78]):
        c.disque(x0 + (x1 - x0) * t, y0 - 0.2 * s, r * (1.0 if k else 1.15), 'A')
    n = max(2, round((y1 - y0) / (5 * s)))
    for k in range(n):
        yy = y0 + 1.5 * s + (y1 - y0 - 3 * s) * k / max(1, n - 1)
        c.disque(x0 + 0.2 * s, yy, r * 0.95, 'A'); c.disque(x1 - 0.2 * s, yy, r * 0.95, 'A')
    c.peindre(lambda x, y: y > y1, '.')  # dessous plat
    c.detail(lambda x, y: y == y1 - 1 and x in (c.L - 1, c.R + 1), 'J')
    c.finir(contour='B')
    return c, {'A': fond, 'B': bord, 'J': joue}


def fleur(fmt, petale='H01', coeur='H03', trait='H70', n=None):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    c.bande(b, 'C', r=1)
    n = n or (10 if fmt in ('id', 'mini', 'carre') else 14)
    ex, ey = c.tw / 2 + b + 1.6 * s, c.th / 2 + b + 1.6 * s
    pts = [(c.mx + math.cos(2 * math.pi * k / n + math.pi / n) * ex, c.my + math.sin(2 * math.pi * k / n + math.pi / n) * ey) for k in range(n)]
    rp = 2.5 * s
    idx = {}
    for x, y in c.cases():
        if c.g[y][x] != '.':
            continue
        d = [math.hypot(x - px, y - py) for px, py in pts]
        k = min(range(n), key=d.__getitem__)
        if d[k] < rp:
            c.g[y][x] = 'P'; idx[(x, y)] = k
    sep = {(x, y) for (x, y), k in idx.items() for dx, dy in ((1, 0), (0, 1)) if idx.get((x + dx, y + dy), k) != k}
    c.detail(lambda x, y: (x, y) in sep, 'S')
    c.finir(contour='S', garder_contour='C')
    return c, {'C': coeur, 'P': petale, 'S': trait}


def feuillage(fmt, feuilles=('H10', 'H47', 'H102'), branche='H21', bord='H28'):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    c.bande(b, 'T', r=1.5)
    n = 12 if fmt in ('id', 'mini', 'carre') else 16
    ex, ey = c.tw / 2 + b + 0.8 * s, c.th / 2 + b + 0.8 * s
    lettres = 'FGH'
    for k in range(n):
        a = 2 * math.pi * k / n
        px, py = c.mx + math.cos(a) * ex, c.my + math.sin(a) * ey
        c.ellipse(px, py, 2.3 * s, 1.4 * s, lettres[k % 3], a=a + 0.6)
    c.finir(contour='K', garder_contour='T')
    return c, {'T': branche, 'F': feuilles[0], 'G': feuilles[1], 'H': feuilles[2], 'K': bord}


def soleil(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    c.bande(b, 'J', r=2)
    n = 12 if fmt in ('id', 'mini') else 16
    ex, ey = c.tw / 2 + b, c.th / 2 + b
    for k in range(n):
        a = 2 * math.pi * k / n
        cx, cy = c.mx + math.cos(a) * ex, c.my + math.sin(a) * ey
        tx, ty = c.mx + math.cos(a) * (ex + 3.2 * s), c.my + math.sin(a) * (ey + 3.2 * s)
        pa = a + math.pi / 2; w = 1.9 * s
        c.poly([(cx + math.cos(pa) * w, cy + math.sin(pa) * w), (tx, ty), (cx - math.cos(pa) * w, cy - math.sin(pa) * w)], 'O')
    c.finir(contour='R', interieur='O')
    return c, {'J': 'H03', 'O': 'H38', 'R': 'H04'}


def arc_en_ciel(fmt):
    c = Cadre(fmt, dy=2 if fmt in ('id', 'mini', 'carre') else 3); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'W', r=1.5)
    cols = 'RODJVB'
    rmax = (x1 - x0) / 2 + 0.5 * s
    cy = y0 + 2
    ep = max(1.0, rmax / 8)
    for i, l in enumerate(cols):
        R = rmax - i * ep
        c.peindre(lambda x, y, R=R: y <= cy and math.hypot(x - c.mx, (y - cy) * 1.0) <= R, l)
    c.peindre(lambda x, y: y <= cy and math.hypot(x - c.mx, y - cy) <= rmax - len(cols) * ep, 'W')
    # nuages aux pieds de l'arc
    for sx in (x0 + 0.5, x1 - 0.5):
        c.disque(sx, cy + 0.5, 1.9 * s, 'N')
    c.finir(contour='K', garder_contour='')
    return c, {'R': 'H05', 'O': 'H38', 'D': 'H03', 'J': 'H03', 'V': 'H10', 'B': 'H09', 'W': 'H01', 'N': 'H01', 'K': 'H70'}


def vagues(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c) + 1
    x0, y0, x1, y1 = c.bande(b, 'M', r=1)
    am, per = 1.0 * s, 4.5 * s
    def ondule(x, y):
        # bord extérieur ondulé
        if not (x0 - 2 <= x <= x1 + 2 and y0 - 2 <= y <= y1 + 2): return False
        dx = min(x - (x0 - 1), (x1 + 1) - x); dy = min(y - (y0 - 1), (y1 + 1) - y)
        if dx < dy:
            return dx >= am * math.sin(2 * math.pi * y / per)
        return dy >= am * math.sin(2 * math.pi * x / per)
    c.peindre(ondule, 'M')
    c.finir(contour='F', interieur='E')
    return c, {'M': 'H49', 'F': 'H01', 'E': 'H83'}


def nuage_pluie(fmt):
    c, coul = None, None
    c = Cadre(fmt, dy=-2); s = ech(c); b = b_(c) + 1
    x0, y0, x1, y1 = c.bande(b, 'A', r=2)
    r = 2.5 * s
    for t in (0.2, 0.5, 0.8):
        c.disque(x0 + (x1 - x0) * t, y0, r, 'A')
    c.peindre(lambda x, y: y > y1, '.')
    # gouttes accrochées sous le nuage
    k = 0
    for gx in range(int(x0 + 2), int(x1 - 1), int(3 * s) + 2):
        L = 2 + (k % 2) * 1.5 * s
        c.peindre(lambda x, y, gx=gx, L=L: gx <= x <= gx + 1 and y1 < y <= y1 + L, 'G')
        k += 1
    c.finir(contour='B', garder_contour='G')
    return c, {'A': 'H01', 'B': 'H70', 'G': 'H46'}


# ---------- animaux ----------
def chat(fmt, pelage='H60', bord='H12', interieur='H06'):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'O', r=1.7)
    h = 4 * s
    for sx, d in ((x0, 1), (x1, -1)):
        c.poly([(sx - 0.5 * d, y0 + 1), (sx + 0.3 * d, y0 - h), (sx + (5 * s) * d, y0 + 1)], 'O')
        c.detail(lambda x, y, sx=sx, d=d: (y < y0 + 0.5) and (0 <= (x - sx) * d <= 2.6 * s - (y0 - y) * 0.6) and (y > y0 - h + 1.6), 'P')
    # pattes
    for px in (c.L + c.tw * 0.15, c.R - c.tw * 0.15 - 2 * s):
        c.peindre(lambda x, y, px=px: px <= x <= px + 2 * s + 0.5 and y1 - 1 <= y <= y1 + 1.6 * s, 'W')
    c.finir(contour='D', garder_contour='')
    c.detail(lambda x, y: False, 'P')
    return c, {'O': pelage, 'D': bord, 'P': interieur, 'W': 'H01'}


def ours(fmt, pelage='H21', bord='H12', interieur='H27', panda=False):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'O', r=2)
    re = 2.4 * s
    for sx in (x0 + 1.2 * s, x1 - 1.2 * s):
        c.disque(sx, y0 - 0.6 * s, re, 'E')
        c.detail(lambda x, y, sx=sx: math.hypot(x - sx, y - (y0 - 0.6 * s)) <= re - 1.3 and y < y0, 'I')
    for px in (c.L + c.tw * 0.12, c.R - c.tw * 0.12 - 2.4 * s):
        c.peindre(lambda x, y, px=px: px <= x <= px + 2.4 * s and y1 - 1 <= y <= y1 + 1.5 * s, 'E')
    c.finir(contour='D')
    col = {'O': pelage, 'D': bord, 'I': interieur, 'E': pelage}
    if panda:
        col.update({'O': 'H01', 'E': 'H18', 'D': 'H18', 'I': 'H71'})
    return c, col


def lapin(fmt, pelage='H01', bord='H70', interieur='H06'):
    c = Cadre(fmt, dy=4 if fmt in ('id', 'mini', 'carre') else 6); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'O', r=2)
    h = 6 * s
    for sx, a in ((c.mx - 2.2 * s, -0.18), (c.mx + 2.2 * s, 0.18)):
        c.ellipse(sx, y0 - h / 2 + 0.5, 1.7 * s, h / 2 + 0.5, 'O', a=a)
        c.detail(lambda x, y, sx=sx: abs(x - sx) <= 0.6 * s and y0 - h + 1.5 * s <= y <= y0 - 1, 'P')
    c.finir(contour='D')
    return c, {'O': pelage, 'D': bord, 'P': interieur}


def renard(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'O', r=1.5)
    h = 4.5 * s
    for sx, d in ((x0, 1), (x1, -1)):
        c.poly([(sx - 0.5 * d, y0 + 1), (sx + 0.5 * d, y0 - h), (sx + 4.5 * s * d, y0 + 1)], 'O')
        c.detail(lambda x, y, sx=sx, d=d: y < y0 - h + 2 * s, 'N')
    # joues blanches en bas
    c.detail(lambda x, y: y > c.B - 1.5 * s and ((x < c.L and y - c.B > x - c.L - 1) or (x > c.R and y - c.B > c.R - x - 1)), 'W')
    c.finir(contour='D')
    return c, {'O': 'H04', 'N': 'H18', 'W': 'H01', 'D': 'H20'}


def grenouille(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'V', r=2)
    for sx in (x0 + 2 * s, x1 - 2 * s):
        c.disque(sx, y0 - 0.5 * s, 2.6 * s, 'V')
        c.detail(lambda x, y, sx=sx: math.hypot(x - sx, y - (y0 - 0.8 * s)) <= 1.6 * s, 'W')
        c.detail(lambda x, y, sx=sx: math.hypot(x - sx, y - (y0 - 0.5 * s)) <= 0.8 * s, 'N')
    c.detail(lambda x, y: y == y1 - 1 and (x in (c.L - 1, c.R + 1)), 'J')
    c.finir(contour='D')
    return c, {'V': 'H37', 'W': 'H01', 'N': 'H18', 'J': 'H06', 'D': 'H10'}


def chouette(fmt):
    c = Cadre(fmt, dy=3); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'O', r=2, haut=b + round(2.5 * s))
    for sx, d in ((x0, 1), (x1, -1)):
        c.poly([(sx - 0.3 * d, y0 + 2), (sx, y0 - 2.5 * s), (sx + 3.5 * s * d, y0 + 2)], 'O')
    ey = (y0 + c.T) / 2 - 0.2
    for sx in (c.mx - 2.3 * s - 0.3, c.mx + 2.3 * s + 0.3):
        c.detail(lambda x, y, sx=sx: math.hypot(x - sx, y - ey) <= 1.9 * s, 'W')
        c.detail(lambda x, y, sx=sx: math.hypot(x - sx, y - ey) <= 0.8 * s, 'N')
    c.detail(lambda x, y: abs(x - c.mx) <= 0.5 and ey <= y <= ey + 1.2 * s, 'J')
    c.finir(contour='D')
    return c, {'O': 'H76', 'D': 'H12', 'W': 'H01', 'N': 'H18', 'J': 'H38'}


def mouton(fmt):
    c = Cadre(fmt, dy=1); s = ech(c); b = b_(c) + 1
    x0, y0, x1, y1 = c.bande(b, 'A', r=2)
    n = max(3, round((x1 - x0) / (3 * s)))
    for k in range(n):
        t = k / (n - 1)
        c.disque(x0 + (x1 - x0) * t, y0, 1.6 * s, 'A'); c.disque(x0 + (x1 - x0) * t, y1, 1.6 * s, 'A')
    m = max(3, round((y1 - y0) / (3 * s)))
    for k in range(m):
        t = k / (m - 1)
        c.disque(x0, y0 + (y1 - y0) * t, 1.6 * s, 'A'); c.disque(x1, y0 + (y1 - y0) * t, 1.6 * s, 'A')
    # oreilles noires sur les côtés en haut
    for sx, d in ((x0 - 1.4 * s, -1), (x1 + 1.4 * s, 1)):
        c.ellipse(sx, y0 + 2.5 * s, 2.0 * s, 1.2 * s, 'N', a=0.5 * d)
    c.finir(contour='G', garder_contour='N')
    return c, {'A': 'H01', 'G': 'H70', 'N': 'H18'}


def herisson(fmt):
    c = Cadre(fmt); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'B', r=0)
    x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
    # piquants en dents de scie : pointe de 2 perles posée sur une base de 4
    for x in range(x0 + 1, x1 - 1, 4):
        for (yb, yp) in ((y0 - 1, y0 - 2), (y1 + 1, y1 + 2)):
            for X in range(x - 1, x + 3):
                if x0 <= X <= x1: c.g[yb][X] = 'P'
            c.g[yp][x] = c.g[yp][x + 1] = 'P'
    for y in range(y0 + 1, y1 - 1, 4):
        for (xb, xp) in ((x0 - 1, x0 - 2), (x1 + 1, x1 + 2)):
            for Y in range(y - 1, y + 3):
                if y0 <= Y <= y1: c.g[Y][xb] = 'P'
            c.g[y][xp] = c.g[y + 1][xp] = 'P'
    c.finir(contour='D', interieur='C', garder_contour='P')
    return c, {'B': 'H76', 'P': 'H12', 'D': 'H12', 'C': 'H27'}


def dino(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'V', r=1.5)
    n = max(3, round((x1 - x0) / (4 * s)))
    w = (x1 - x0) / n
    for k in range(n):
        a = x0 + k * w
        c.poly([(a, y0 + 1), (a + w / 2, y0 - 2.8 * s), (a + w, y0 + 1)], 'E')
    c.detail(lambda x, y: (x + y) % 4 == 0 and c.plein(x, y) and c.g[y][x] == 'V' and (x < c.L - 1 or x > c.R + 1 or y > c.B + 1), 'T')
    c.finir(contour='D', garder_contour='E')
    return c, {'V': 'H37', 'E': 'H38', 'T': 'H47', 'D': 'H10'}


def papillon(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'C', r=1.5)
    for d in (-1, 1):
        sx = x0 if d < 0 else x1
        c.ellipse(sx + d * 1.6 * s, c.my - (c.th / 4), 2.8 * s, (c.th / 4) + 1.8 * s, 'A', a=d * 0.3)
        c.ellipse(sx + d * 1.3 * s, c.my + (c.th / 4) + 0.5, 2.3 * s, (c.th / 5) + 1.4 * s, 'B', a=-d * 0.3)
        c.detail(lambda x, y, sx=sx, d=d: math.hypot(x - (sx + d * 2.2 * s), y - (c.my - c.th / 4)) <= 1.0 * s, 'P')
    c.finir(contour='D', garder_contour='C')
    return c, {'C': 'H18', 'A': 'H45', 'B': 'H48', 'P': 'H43', 'D': 'H07'}


# ---------- objets ----------
def timbre(fmt, fond='H02', filet='H05'):
    c = Cadre(fmt); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'C', r=0)
    # dentelure : deux perles, un creux
    for i, x in enumerate(range(x0, x1 + 1)):
        if i % 3 != 2:
            c.g[y0 - 1][x] = c.g[y1 + 1][x] = 'C'
    for i, y in enumerate(range(y0, y1 + 1)):
        if i % 3 != 2:
            c.g[y][x0 - 1] = c.g[y][x1 + 1] = 'C'
    c.finir(interieur='F')
    return c, {'C': fond, 'F': filet}


def polaroid(fmt, fond='H01', bord='H70', deco='H06'):
    c = Cadre(fmt, dy=-2 if fmt in ('id', 'mini', 'carre') else -3); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=0.6, bas=b + round(3.5 * s))
    c.detail(lambda x, y: y == y1 - round(1.6 * s) and c.L <= x <= c.R and (x - c.L) % 3 != 2, 'P')
    c.finir(contour='G')
    return c, {'A': fond, 'G': bord, 'P': deco}


def tele(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'M', r=2, droite=b + round(3.5 * s))
    # antennes en V, épaisses
    for d in (-1, 1):
        def ant(x, y, d=d):
            t = (y0 - y)
            return 0 <= t <= 3.2 * s and abs((x - c.mx) - d * t * 0.9) <= 1.1
        c.peindre(ant, 'N')
    # pieds
    for px in (x0 + 2, x1 - 3):
        c.peindre(lambda x, y, px=px: px <= x <= px + 1 and y1 < y <= y1 + 1.5, 'N')
    kx = c.R + b + 1.6 * s + 0.5
    for ky in (c.T + 1.8 * s, c.T + 5 * s):
        c.detail(lambda x, y, ky=ky: math.hypot(x - kx, y - ky) <= 1.1 * s, 'B')
    c.finir(contour='D', interieur='G', garder_contour='N')
    return c, {'M': 'H21', 'D': 'H12', 'G': 'H71', 'N': 'H18', 'B': 'H61'}


def maison(fmt):
    c = Cadre(fmt, dy=3 if fmt in ('id', 'mini', 'carre') else 5); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'M', r=0)
    h = 5 * s
    c.poly([(x0 - 2, y0 + 1), (c.mx, y0 - h), (x1 + 2, y0 + 1)], 'T')
    c.peindre(lambda x, y: x1 - 4 * s <= x <= x1 - 2 * s and y0 - h * 0.85 <= y <= y0 - 1, 'H')
    c.detail(lambda x, y: c.g[y][x] == 'T' and (y - int(y0)) % 2 == 0, 'U')
    c.finir(contour='D', interieur='B', garder_contour='')
    return c, {'M': 'H27', 'T': 'H05', 'U': 'H22', 'H': 'H20', 'D': 'H12', 'B': 'H01'}


def chateau(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'P', r=0)
    # créneaux 2 perles, creux 1 (ou 2 en grand)
    w = 2 if s < 1.5 else 3
    i = 0
    x = int(x0)
    while x <= x1:
        if i % 2 == 0:
            c.peindre(lambda X, Y, x=x: x <= X <= min(x + w - 1, x1) and y0 - 2 <= Y < y0, 'P')
        x += w if i % 2 == 0 else 1 + (1 if s >= 1.5 else 0)
        i += 1
    c.detail(lambda x, y: (y - int(y0)) % 3 == 2 and (x + (y // 3) * 2) % 4 == 0, 'G')
    c.finir(contour='D', interieur='D')
    return c, {'P': 'H17', 'G': 'H70', 'D': 'H71'}


def pellicule(fmt):
    c = Cadre(fmt); b = b_(c) + 1
    x0, y0, x1, y1 = c.bande(b, 'N', r=0, gauche=5, droite=5)
    # perforations : un trou d'une perle tous les 3 rangs, avec 2 perles pleines de chaque côté
    c.finir()
    for y in range(int(y0) + 2, int(y1) - 1, 3):
        for x in (int(x0) + 2, int(x1) - 2):
            c.g[y][x] = '.'
    return c, {'N': 'H18'}


def enveloppe(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=0, haut=b + round(2.5 * s))
    c.detail(lambda x, y: y < c.T and abs((y - y0) - abs(x - c.mx) * 0 - (abs(x - c.mx) * -0.6 + (c.T - y0 - 1))) < 0.6, 'R')
    c.detail(lambda x, y: math.hypot(x - c.mx, y - (c.T - 1.6 * s)) <= 1.2 * s, 'C')
    c.finir(contour='G')
    return c, {'A': 'H02', 'G': 'H75', 'R': 'H75', 'C': 'H05'}


def couronne(fmt):
    c = Cadre(fmt, dy=3); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'J', r=1)
    n = 3 if s < 1.5 else 5
    w = (x1 - x0) / (n - 1)
    for k in range(n):
        px = x0 + k * w
        c.poly([(px - w / 2 - 0.5, y0 + 1), (px - 0.8, y0 - 5 * s), (px + 0.8, y0 - 5 * s), (px + w / 2 + 0.5, y0 + 1)], 'J')
        c.detail(lambda x, y, px=px: abs(x - px) <= 0.6 and y0 - 2.2 * s <= y <= y0 - 1.2 * s + 0.5, 'R' if k % 2 == 0 else 'B')
    c.finir(contour='D')
    return c, {'J': 'H03', 'D': 'H61', 'R': 'H05', 'B': 'H09'}


def bonbon(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'R', r=2)
    for d, sx in ((-1, x0), (1, x1)):
        c.poly([(sx, c.my), (sx + d * 4 * s, c.my - 3.5 * s), (sx + d * 4 * s, c.my + 3.5 * s)], 'E')
    c.detail(lambda x, y: c.g[y][x] == 'R' and ((x + y) // 2) % 2 == 0, 'W')
    c.finir(contour='D', garder_contour='')
    return c, {'R': 'H06', 'W': 'H01', 'E': 'H48', 'D': 'H82'}


def gateau(fmt):
    c = Cadre(fmt, dy=3); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'G', r=0.5)
    # glaçage qui coule
    c.detail(lambda x, y: c.g[y][x] == 'G' and y <= y0 + 1 + (1 if (x // 2) % 3 == 0 else 0), 'I')
    n = 3 if s < 1.5 else 5
    for k in range(n):
        px = round(x0 + 2 + k * (x1 - x0 - 4) / (n - 1))
        hb = round(1.6 * s)
        c.peindre(lambda x, y, px=px, hb=hb: px <= x <= px + 1 and y0 - hb <= y < y0, 'B')
        c.peindre(lambda x, y, px=px, hb=hb: px <= x <= px + 1 and y0 - hb - 2 <= y < y0 - hb, 'F')
    c.finir(contour='D', garder_contour='BF')
    return c, {'G': 'H27', 'I': 'H06', 'B': 'H09', 'F': 'H38', 'D': 'H76'}


def ballons(fmt):
    c = Cadre(fmt, dy=3); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1.5)
    cols = 'RJB'
    n = 3
    for k in range(n):
        px = x0 + 1.5 * s + k * (x1 - x0 - 3 * s) / (n - 1)
        c.ellipse(px, y0 - 1.6 * s, 2.0 * s, 2.5 * s, cols[k])
        c.detail(lambda x, y, px=px: math.hypot(x - (px - 0.7 * s), y - (y0 - 2.6 * s)) <= 0.6 * s, 'W')
    c.finir(contour='D', garder_contour='')
    return c, {'A': 'H09', 'R': 'H05', 'J': 'H03', 'B': 'H10', 'W': 'H01', 'D': 'H08'}


# ---------- motifs ----------
def coeurs_coins(fmt, fond='H01', coeur='H05', bord='H22'):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1)
    for sx in (x0 + 0.5, x1 - 0.5):
        for sy in (y0 + 0.5, y1 - 0.5):
            c.coeur(sx, sy, 2.5 * s, 'C')
    c.finir(contour='D', garder_contour='')
    return c, {'A': fond, 'C': coeur, 'D': bord}


def etoiles_coins(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1)
    for sx in (x0 + 0.5, x1 - 0.5):
        for sy in (y0 + 0.5, y1 - 0.5):
            pts = []
            for k in range(10):
                r = (3.4 if k % 2 == 0 else 1.6) * s
                a = -math.pi / 2 + k * math.pi / 5
                pts.append((sx + r * math.cos(a), sy + r * math.sin(a)))
            c.poly(pts, 'E')
    c.finir(contour='D', garder_contour='')
    return c, {'A': 'H08', 'E': 'H03', 'D': 'H116'}


def pois(fmt, fond='H05', pois_='H01', bord='H22'):
    c = Cadre(fmt); b = b_(c) + 1
    c.bande(b, 'A', r=1.5)
    c.detail(lambda x, y: (x % 4 == 1 and y % 4 == 1) or (x % 4 == 3 and y % 4 == 3), 'P')
    c.finir(contour='D')
    return c, {'A': fond, 'P': pois_, 'D': bord}


def sucre_orge(fmt):
    c = Cadre(fmt); b = b_(c) + 1
    c.bande(b, 'A', r=1)
    c.detail(lambda x, y: ((x + y) // 2) % 2 == 0, 'R')
    c.finir()
    return c, {'A': 'H01', 'R': 'H05'}


def damier(fmt, a='H18', b2='H01'):
    c = Cadre(fmt); b = b_(c) + 1
    c.bande(b, 'A', r=0)
    c.detail(lambda x, y: ((x // 2) + (y // 2)) % 2 == 0, 'B')
    c.finir()
    return c, {'A': a, 'B': b2}


def rayures_arc(fmt):
    c = Cadre(fmt); b = 6 if fmt in ('id', 'mini', 'carre') else 6
    cols = 'RODVBP'
    for i, l in enumerate(cols):
        c.bande(b - i, l, r=max(0, 2 - i * 0.4))
    c.finir()
    return c, {'R': 'H05', 'O': 'H38', 'D': 'H03', 'V': 'H10', 'B': 'H09', 'P': 'H07'}


def festons(fmt, fond='H95', bord='H82', oeil=True):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=0.5)
    r = 1.6 * s
    for side in range(4):
        if side < 2:
            L = x1 - x0; n = max(2, round(L / (2 * r + 0.3)))
            for k in range(n + 1):
                px = x0 + L * k / n
                c.disque(px, y0 if side == 0 else y1, r, 'A')
                if oeil and s >= 1.2:
                    c.detail(lambda x, y, px=px, py=(y0 - r * 0.5 if side == 0 else y1 + r * 0.5): (x, y) == (round(px), round(py)), '.')
        else:
            L = y1 - y0; n = max(2, round(L / (2 * r + 0.3)))
            for k in range(n + 1):
                py = y0 + L * k / n
                c.disque(x0 if side == 2 else x1, py, r, 'A')
    c.finir(contour='D')
    return c, {'A': fond, 'D': bord}


# ---------- saisons ----------
def citrouille(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c) + 1
    x0, y0, x1, y1 = c.bande(b, 'O', r=3)
    for d in (-1, 1):
        c.ellipse(c.mx + d * (c.tw / 2 + b - 0.5), c.my, 2.2 * s, (c.th / 2 + b) * 0.85, 'O')
    c.peindre(lambda x, y: c.mx - 1 - 0.3 * s <= x <= c.mx + 1 + 0.3 * s and y0 - 2.5 * s <= y < y0 + 1, 'T')
    c.ellipse(c.mx + 2.6 * s, y0 - 1.0 * s, 2.0 * s, 1.0 * s, 'F', a=-0.4)
    c.detail(lambda x, y: c.g[y][x] == 'O' and (abs(x - (c.L - 1)) < 0.5 or abs(x - (c.R + 1)) < 0.5) and (y < c.T - 1 or y > c.B + 1), 'C')
    c.finir(contour='D', garder_contour='TF')
    return c, {'O': 'H04', 'C': 'H20', 'T': 'H12', 'F': 'H10', 'D': 'H20'}


def sapin(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'V', r=0)
    # étages de sapin en zigzag sur les côtés
    n = 3
    hh = (y1 - y0 + 6 * s) / n
    top = y0 - 5 * s
    for k in range(n):
        ya = top + k * hh * 0.85
        yb = ya + hh * 1.2
        half = (x1 - x0) / 2 + 1 + (k + 1) * 1.2 * s
        c.poly([(c.mx, ya), (c.mx - half, yb), (c.mx + half, yb)], 'V')
    c.peindre(lambda x, y: abs(x - c.mx) <= 1.5 * s and y1 <= y <= y1 + 2.4 * s, 'T')
    boules = 'RJB'
    c.detail(lambda x, y: c.g[y][x] == 'V' and (x * 7 + y * 3) % 11 == 0, 'R')
    c.detail(lambda x, y: c.g[y][x] == 'V' and (x * 5 + y * 9) % 13 == 0, 'J')
    c.finir(contour='D', garder_contour='TRJ')
    return c, {'V': 'H10', 'T': 'H12', 'R': 'H05', 'J': 'H03', 'D': 'H28'}


def coeur_grand(fmt, fond='H06', bord='H29'):
    c = Cadre(fmt, dy=1); s = ech(c)
    sc = max(c.tw, c.th) * 0.85 + 4
    c.coeur(c.mx, c.my - 0.2 * sc + 1, sc * 0.75, 'A')
    c.bande(2, 'A', r=0)
    c.finir(contour='D')
    return c, {'A': fond, 'D': bord}


def etoile_grande(fmt):
    c = Cadre(fmt, dy=1)
    R = max(c.tw, c.th) * 0.95 + 5
    pts = []
    for k in range(10):
        r = R if k % 2 == 0 else R * 0.55
        a = -math.pi / 2 + k * math.pi / 5
        pts.append((c.mx + r * math.cos(a), c.my + 1.5 + r * math.sin(a)))
    c.poly(pts, 'J')
    c.bande(2, 'J', r=0)
    c.finir(contour='D')
    return c, {'J': 'H03', 'D': 'H61'}


def flocons(fmt):
    c = Cadre(fmt); b = 5
    x0, y0, x1, y1 = c.bande(b, 'A', r=1.5)
    centres = []
    yy = int(y0) + 2
    while yy <= y1 - 2:
        centres += [(int(x0) + 2, yy), (int(x1) - 2, yy)]
        yy += 6
    xx = int(x0) + 8
    while xx <= x1 - 6:
        centres += [(xx, int(y0) + 2), (xx, int(y1) - 2)]
        xx += 6
    def flocon(x, y):
        for fx, fy in centres:
            dx, dy = x - fx, y - fy
            if max(abs(dx), abs(dy)) <= 1 and (dx == 0 or dy == 0) or (abs(dx) == abs(dy) == 1 and False):
                return True
        return False
    c.detail(flocon, 'W')
    c.finir(contour='D')
    return c, {'A': 'H46', 'W': 'H01', 'D': 'H09'}
