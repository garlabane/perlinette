"""Cadres floraux et kawaii."""
import math
from gen import Cadre
from recettes import ech, b_, fleur


# ---------- outils ----------
def fleurette(c, cx, cy, petale, coeur='h'):
    """Petite fleur de 5 perles (croix) peinte en détail sur la bande."""
    cx, cy = round(cx), round(cy)
    c.detail(lambda x, y: (x, y) in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)), petale)
    c.detail(lambda x, y: (x, y) == (cx, cy), coeur)


def le_long_de_la_bande(c, b, pas):
    """Points régulièrement espacés sur la ligne médiane de la bande, en tournant."""
    m = b // 2
    x0, y0, x1, y1 = c.L - m, c.T - m, c.R + m, c.B + m
    per = 2 * ((x1 - x0) + (y1 - y0))
    n = max(4, round(per / pas))
    pts = []
    for k in range(n):
        d = per * k / n
        if d < x1 - x0: pts.append((x0 + d, y0))
        elif d < (x1 - x0) + (y1 - y0): pts.append((x1, y0 + d - (x1 - x0)))
        elif d < 2 * (x1 - x0) + (y1 - y0): pts.append((x1 - (d - (x1 - x0) - (y1 - y0)), y1))
        else: pts.append((x0, y1 - (d - 2 * (x1 - x0) - (y1 - y0))))
    return pts


def fleur_ronde(c, cx, cy, r, petale, coeur, n=5):
    """Fleur à pétales ronds (n disques autour d'un cœur)."""
    for k in range(n):
        a = -math.pi / 2 + 2 * math.pi * k / n
        c.disque(cx + math.cos(a) * r * 0.6, cy + math.sin(a) * r * 0.6, r * 0.55, petale)
    c.disque(cx, cy, r * 0.38, coeur)


def visage(c, cx, cy, s, yeux='N', joues='J', bouche='N', museau=None):
    """Visage kawaii : deux yeux, deux joues roses, petite bouche (ou museau). Symétrique au pas près."""
    e = 2 if s < 1.2 else 3
    cx = round(cx * 2) / 2
    g = e + (0.5 if cx % 1 else 1)          # demi-écart des yeux, tombe sur des colonnes entières
    ox = (cx - g, cx + g)
    jx = (cx - g - 2, cx + g + 2)
    haut = 1 if s >= 1.5 else 0              # grands formats : yeux de 2 perles de haut
    c.detail(lambda x, y: x in ox and cy - haut <= y <= cy, yeux)
    c.detail(lambda x, y: x in jx and y == cy + 1, joues)
    if museau:
        c.detail(lambda x, y: abs(x - cx) <= 1.6 and cy + 1 <= y <= cy + 2, museau)
        nar = (cx - 0.5, cx + 0.5) if cx % 1 else (cx - 1, cx + 1)
        c.detail(lambda x, y: x in nar and y == cy + 1, 'N')
    else:
        c.detail(lambda x, y: abs(x - cx) <= 0.6 and y == cy + 1, bouche)


def bande_visage(c, b, l, r=2, extra=None):
    """Bande avec un bas plus large pour poser le visage ; renvoie la ligne des yeux."""
    s = ech(c)
    extra = extra if extra is not None else (3 if s < 1.2 else 4 if s < 1.5 else 5)
    x0, y0, x1, y1 = c.bande(b, l, r=r, bas=b + extra)
    cy = c.B + 1 + (b + extra) / 2 - 1
    return x0, y0, x1, y1, round(cy)


# ---------- fleurs ----------
def semis(fmt, fond='H10', fleurs=('H01',), coeur='H03', bord='H28', pas=4):
    c = Cadre(fmt); b = 4
    c.bande(b, 'A', r=1.5)
    lettres = 'PQRS'
    for k, (x, y) in enumerate(le_long_de_la_bande(c, b, pas)):
        fleurette(c, x, y, lettres[k % len(fleurs)], 'h')
    c.finir(contour='D')
    col = {'A': fond, 'h': coeur, 'D': bord}
    for i, f in enumerate(fleurs): col[lettres[i]] = f
    return c, col


def coins_fleuris(fmt, fond='H02', bord='H75', fleurs=('H06', 'H44'), coeur='H03', feuille='H10'):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1)
    r = 3.6 * s
    for (cx, cy, d) in ((x0 + 1, y0 + 1, 1), (x1 - 1, y1 - 1, -1)):
        c.ellipse(cx + d * r * 1.15, cy - d * r * 0.25, r * 0.65, r * 0.35, 'V', a=0.3)
        c.ellipse(cx - d * r * 0.25, cy + d * r * 1.15, r * 0.35, r * 0.65, 'V', a=0.3)
        fleur_ronde(c, cx, cy, r, 'P', 'h')
        fleur_ronde(c, cx + d * r * 0.95, cy + d * r * 0.95, r * 0.6, 'Q', 'h')
    c.finir(contour='D', garder_contour='VPQh')
    return c, {'A': fond, 'D': bord, 'P': fleurs[0], 'Q': fleurs[1], 'h': coeur, 'V': feuille}


def tulipes(fmt, couleurs=('H05', 'H06', 'H03', 'H07'), fond='H47', bord='H10'):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1)
    x0, y0, x1, y1 = int(x0), int(y0), int(x1), int(y1)
    big = s >= 1.5
    w = 3 if big else 2            # demi-largeur de la tête
    hauteur = 4 if big else 3
    n = max(2, (x1 - x0 + 2) // (2 * w + 2))
    lettres = 'PQRS'
    for side in (0, 1):
        for k in range(n):
            cx = round(x0 + w + 1 + (x1 - x0 - 2 * w - 2) * k / (n - 1))
            l = lettres[(k + side) % len(couleurs)]
            d = -1 if side == 0 else 1
            yb = y0 if side == 0 else y1
            for x in (cx, cx + 1):                   # tige
                c.g[yb + d][x] = 'V'
            for j in range(hauteur):                 # coupe
                y = yb + d * (2 + j)
                for x in range(cx - w + 1 + (j == 0), cx + w + 1 - (j == 0)):
                    c.g[y][x] = l
            ytop = yb + d * (2 + hauteur)
            for x in (cx - w + 1, cx - w + 2, cx + w - 1, cx + w):   # deux pointes
                c.g[ytop][x] = l
    c.finir(contour='D', garder_contour='PQRSV')
    col = {'A': fond, 'D': bord, 'V': 'H10'}
    for i, f in enumerate(couleurs): col[lettres[i]] = f
    return c, col


def lavande(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1)
    h = (y1 - y0) * 0.7 + 3 * s
    for cx in (x0 - 0.3, x1 + 0.3):
        for k in range(int(h / (1.5 * s))):
            yy = y0 - 3 * s + k * 1.5 * s
            c.ellipse(cx, yy, 1.5 * s + 0.3, 1.1 * s, 'L')
        c.detail(lambda x, y, cx=cx: c.g[y][x] == 'L' and (y % 2 == 0) and abs(x - cx) >= 1, 'l')
    c.recolorer(lambda x, y: False, 'A')
    c.finir(contour='D', garder_contour='Ll')
    return c, {'A': 'H101', 'L': 'H45', 'l': 'H106', 'D': 'H102'}


def sakura(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    c.bande(b, 'B', r=1)
    pts = le_long_de_la_bande(c, b, 6 * s)
    for k, (x, y) in enumerate(pts):
        if k % 2: continue
        dx = 1 if x > c.mx else -1; dy = 1 if y > c.my else -1
        fleur_ronde(c, x + dx * 0.8 * s, y + dy * 0.8 * s, 2.4 * s, 'P' if k % 4 else 'Q', 'h')
    c.finir(contour='D', garder_contour='PQh')
    return c, {'B': 'H76', 'D': 'H12', 'P': 'H95', 'Q': 'H06', 'h': 'H29'}


def roses(fmt, rose='H05', fonce='H22', fond='H01', bord='H70'):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1)
    r = 3.0 * s
    coins = [(x0 + 0.5, y0 + 0.5), (x1 - 0.5, y0 + 0.5), (x0 + 0.5, y1 - 0.5), (x1 - 0.5, y1 - 0.5)]
    for (cx, cy) in coins:
        dx = 1 if cx > c.mx else -1
        c.ellipse(cx + dx * r * 0.9, cy + r * 0.5, r * 0.6, r * 0.33, 'V', a=dx * 0.5)
        c.disque(cx, cy, r, 'R')
        c.detail(lambda x, y, cx=cx, cy=cy: c.g[y][x] == 'R' and abs(math.hypot(x - cx, y - cy) - r * 0.6) < 0.75 and math.atan2(y - cy, x - cx) > -1.6, 'r')
        c.detail(lambda x, y, cx=cx, cy=cy: c.g[y][x] == 'R' and math.hypot(x - cx, y - cy) < 0.7, 'r')
    c.finir(contour='D', garder_contour='RrV')
    return c, {'A': fond, 'D': bord, 'R': rose, 'r': fonce, 'V': 'H10'}


def bouquet(fmt):
    c = Cadre(fmt, dy=-2); s = ech(c); b = b_(c)
    x0, y0, x1, y1 = c.bande(b, 'A', r=1)
    r = 2.0 * s
    pos = [(-2.2, 0.3, 'P'), (0, -0.2, 'Q'), (2.2, 0.3, 'R')]
    for dx, dy, l in pos:
        c.ellipse(c.mx + dx * r * 1.3, y1 + 0.5 + dy * r + r * 0.9, r * 0.7, r * 0.35, 'V', a=dx * 0.4)
    for dx, dy, l in pos:
        fleur_ronde(c, c.mx + dx * r, y1 + dy * r, r, l, 'h')
    c.finir(contour='D', garder_contour='PQRSVh')
    return c, {'A': 'H01', 'D': 'H70', 'P': 'H06', 'Q': 'H45', 'R': 'H03', 'S': 'H46', 'h': 'H60', 'V': 'H10'}


def couronne_champetre(fmt):
    c = Cadre(fmt); s = ech(c); b = b_(c)
    c.bande(b, 'T', r=1.5)
    n = 14 if fmt in ('id', 'mini', 'carre') else 18
    ex, ey = c.tw / 2 + b + 0.6 * s, c.th / 2 + b + 0.6 * s
    for k in range(n):
        a = 2 * math.pi * k / n
        c.ellipse(c.mx + math.cos(a) * ex, c.my + math.sin(a) * ey, 2.0 * s, 1.2 * s, 'F' if k % 2 else 'G', a=a + 0.7)
    fl = 'PQR'
    for k in range(6):
        a = 2 * math.pi * k / 6 + 0.3
        fleur_ronde(c, c.mx + math.cos(a) * (ex - 0.4), c.my + math.sin(a) * (ey - 0.4), 2.3 * s, fl[k % 3], 'h')
    c.finir(contour='K', garder_contour='PQRhT')
    return c, {'T': 'H76', 'F': 'H10', 'G': 'H47', 'K': 'H28', 'P': 'H01', 'Q': 'H06', 'R': 'H45', 'h': 'H03'}


# ---------- kawaii ----------
def nuage_kawaii(fmt, fond='H01', bord='H46'):
    c = Cadre(fmt); s = ech(c); b = b_(c) + 1
    x0, y0, x1, y1, ey = bande_visage(c, b, 'A', r=2)
    r = 2.6 * s
    for t, k in ((0.25, 1.1), (0.7, 1.0)):
        c.disque(x0 + (x1 - x0) * t, y0 - 0.2 * s, r * k, 'A')
    for yy in (y0 + 2 * s, (y0 + y1) / 2):
        c.disque(x0 + 0.2, yy, r * 0.9, 'A'); c.disque(x1 - 0.2, yy, r * 0.9, 'A')
    c.peindre(lambda x, y: y > y1, '.')
    visage(c, c.mx, ey, s)
    c.finir(contour='B')
    return c, {'A': fond, 'B': bord, 'N': 'H18', 'J': 'H06', 'W': 'H01'}


def animal_kawaii(fmt, oreilles='rondes', pelage='H78', bord='H76', interieur='H06', museau=None, fond_museau=None):
    c = Cadre(fmt, dy=1); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'O', r=2)
    if oreilles == 'rondes':
        for sx in (x0 + 1.4 * s, x1 - 1.4 * s):
            c.disque(sx, y0 - 0.4 * s, 2.4 * s, 'O')
            c.detail(lambda x, y, sx=sx: math.hypot(x - sx, y - (y0 - 0.4 * s)) <= 1.1 * s and y < y0, 'I')
    elif oreilles == 'pointues':
        for sx, d in ((x0, 1), (x1, -1)):
            c.poly([(sx - 0.5 * d, y0 + 1), (sx + 0.5 * d, y0 - 4 * s), (sx + 4.5 * s * d, y0 + 1)], 'O')
            c.detail(lambda x, y, sx=sx, d=d: y < y0 - 0.5 and y > y0 - 3 * s and 0.9 <= (x - sx) * d <= 2.6 * s - (y0 - y) * 0.5, 'I')
    elif oreilles == 'longues':
        for sx in (c.mx - 2.3 * s, c.mx + 2.3 * s):
            c.ellipse(sx, y0 - 3 * s, 1.6 * s, 3.4 * s, 'O')
            c.detail(lambda x, y, sx=sx: abs(x - sx) <= 0.6 * s and y0 - 5 * s <= y <= y0 - 1, 'I')
    elif oreilles == 'cochon':
        for sx, d in ((x0 + 1, 1), (x1 - 1, -1)):
            c.poly([(sx, y0 + 1), (sx + 0.5 * d, y0 - 3 * s), (sx + 4 * s * d, y0 + 1)], 'O')
    visage(c, c.mx, ey, s, museau='m' if fond_museau else None)
    c.finir(contour='D')
    col = {'O': pelage, 'D': bord, 'I': interieur, 'N': 'H18', 'J': 'H06', 'W': 'H01'}
    if fond_museau: col['m'] = fond_museau
    return c, col


def cochon(fmt):
    c, col = animal_kawaii(fmt, 'cochon', pelage='H06', bord='H29', interieur='H95', fond_museau='H95')
    col['J'] = 'H44'
    return c, col


def fraise(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'R', r=3)
    # bas arrondi en pointe douce
    c.peindre(lambda x, y: y > y1 - 2 * s and abs(x - c.mx) > (x1 - x0) / 2 - (y - (y1 - 2 * s)) * 0.9 and abs(x - c.mx) > 1, '.')
    # collerette de feuilles
    for k in range(5):
        a = math.pi + math.pi * k / 4
        c.ellipse(c.mx + math.cos(a) * (x1 - x0) * 0.32, y0 + 0.5 + math.sin(a) * 1.4 * s, 1.9 * s, 1.0 * s, 'V', a=a)
    c.peindre(lambda x, y: abs(x - c.mx) <= 0.5 * s + 0.5 and y0 - 2.5 * s <= y <= y0, 'V')
    c.detail(lambda x, y: c.g[y][x] == 'R' and (x * 3 + y * 5) % 7 == 0 and abs(y - ey) > 1.5, 'G')
    visage(c, c.mx, ey, s)
    c.finir(contour='D', garder_contour='V')
    return c, {'R': 'H05', 'V': 'H10', 'G': 'H43', 'D': 'H22', 'N': 'H18', 'J': 'H06', 'W': 'H01'}


def champignon(fmt):
    c = Cadre(fmt, dy=3); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'C', r=1)
    # chapeau rouge à pois
    rx, ry = (x1 - x0) / 2 + 2 * s, 4.5 * s
    c.peindre(lambda x, y: y <= y0 + 1.5 and ((x - c.mx) / rx) ** 2 + ((y - (y0 + 1.5)) / ry) ** 2 <= 1, 'R')
    c.detail(lambda x, y: c.g[y][x] == 'R' and (round(x / 2) * 2 == x) and ((x // 2 + y // 2) % 3 == 0) and y < y0, 'W')
    visage(c, c.mx, ey, s)
    c.finir(contour='D', garder_contour='')
    return c, {'C': 'H02', 'R': 'H05', 'W': 'H01', 'D': 'H22', 'N': 'H18', 'J': 'H06'}


def poussin(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'O', r=2.5)
    for d in (-1, 1):  # houppette
        c.ellipse(c.mx + d * 0.8 * s, y0 - 1.4 * s, 0.9 * s + 0.4, 2.0 * s, 'O', a=d * 0.5)
    for sx, d in ((x0, -1), (x1, 1)):  # ailes
        c.ellipse(sx + d * 0.6 * s, c.my + 1.5 * s, 1.6 * s, 3.0 * s, 'A', a=-d * 0.5)
    visage(c, c.mx, ey, s, bouche='B')
    c.detail(lambda x, y: abs(x - c.mx) <= 0.6 and y == ey + 1, 'B')
    c.finir(contour='D', garder_contour='')
    return c, {'O': 'H03', 'A': 'H43', 'B': 'H38', 'D': 'H60', 'N': 'H18', 'J': 'H06', 'W': 'H01'}


def licorne(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'O', r=2)
    for sx, d in ((x0 + 1, 1), (x1 - 1, -1)):
        c.poly([(sx - 0.5 * d, y0 + 1), (sx + 0.3 * d, y0 - 3 * s), (sx + 3.5 * s * d, y0 + 1)], 'O')
    c.poly([(c.mx - 1.4 * s, y0 + 0.5), (c.mx, y0 - 5 * s), (c.mx + 1.4 * s, y0 + 0.5)], 'C')
    c.detail(lambda x, y: c.g[y][x] == 'C' and y % 2 == 0, 'c')
    # crinière arc-en-ciel sur le côté gauche
    cols = 'RSTU'
    for k in range(4):
        c.disque(x0 - 0.3 * s, y0 + 1.5 * s + k * 2.3 * s, 1.8 * s, cols[k])
    visage(c, c.mx, ey, s)
    c.finir(contour='D', garder_contour='Cc')
    return c, {'O': 'H01', 'D': 'H96', 'C': 'H61', 'c': 'H03', 'R': 'H06', 'S': 'H45', 'T': 'H46', 'U': 'H98', 'N': 'H18', 'J': 'H06', 'W': 'H01'}


def cupcake(fmt):
    c = Cadre(fmt, dy=3); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'M', r=0.5)
    # bas en caissette rayée qui s'évase vers le haut
    c.detail(lambda x, y: c.g[y][x] == 'M' and x % 2 == 0 and y > c.B, 'm')
    # glaçage en bosses
    n = 3 if s < 1.5 else 4
    for k in range(n):
        c.disque(x0 + 1 + (x1 - x0 - 2) * k / (n - 1), y0, 2.4 * s, 'G')
    c.peindre(lambda x, y: x0 - 0.5 <= x <= x1 + 0.5 and y0 - 1 <= y < c.T - 0.5 and c.g[y][x] != '.', 'G')
    c.disque(c.mx, y0 - 2.2 * s, 1.4 * s, 'R')
    c.detail(lambda x, y: c.g[y][x] == 'G' and (x * 5 + y * 3) % 9 == 0, 'p')
    visage(c, c.mx, ey, s)
    c.finir(contour='D', garder_contour='R')
    return c, {'M': 'H46', 'm': 'H97', 'G': 'H95', 'R': 'H05', 'p': 'H03', 'D': 'H82', 'N': 'H18', 'J': 'H06', 'W': 'H01'}


def dino_kawaii(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'V', r=2)
    n = 3 if s < 1.5 else 4
    w = (x1 - x0 - 2) / n
    for k in range(n):
        a = x0 + 1 + k * w
        c.poly([(a, y0 + 1), (a + w / 2, y0 - 2.6 * s), (a + w, y0 + 1)], 'E')
    visage(c, c.mx, ey, s)
    c.finir(contour='D', garder_contour='E')
    return c, {'V': 'H98', 'E': 'H95', 'D': 'H113', 'N': 'H18', 'J': 'H06', 'W': 'H01'}


def pingouin(fmt):
    c = Cadre(fmt, dy=1); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'N', r=2.5)
    c.recolorer(lambda x, y: y > c.B and abs(x - c.mx) < (x1 - x0) / 2 - 1, 'B')
    for px in (c.mx - 2.5 * s, c.mx + 1.0 * s):
        c.peindre(lambda x, y, px=px: px - 0.5 <= x <= px + 1.5 * s and y1 < y <= y1 + 1.5, 'O')
    visage(c, c.mx, ey, s, bouche='O')
    c.detail(lambda x, y: abs(x - c.mx) <= 0.6 and y == ey + 1, 'O')
    c.finir(contour='K', garder_contour='O')
    return c, {'N': 'H18', 'K': 'H71', 'B': 'H01', 'O': 'H38', 'J': 'H06', 'W': 'H01'}


def baleine(fmt):
    c = Cadre(fmt, dy=3); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'B', r=3)
    for d in (-1, 1):  # jet d'eau
        c.ellipse(c.mx + d * 1.3 * s, y0 - 2.4 * s, 0.9 * s + 0.4, 2.0 * s, 'E', a=d * 0.6)
    c.peindre(lambda x, y: abs(x - c.mx) <= 0.6 * s + 0.5 and y0 - 2 * s <= y <= y0, 'E')
    c.poly([(x1, c.my), (x1 + 3.5 * s, c.my - 3 * s), (x1 + 2.4 * s, c.my + 0.5), (x1 + 3.5 * s, c.my + 3 * s)], 'B')
    c.recolorer(lambda x, y: y > c.B + 1, 'V')
    visage(c, c.mx, ey, s)
    c.finir(contour='D', garder_contour='E')
    return c, {'B': 'H46', 'V': 'H97', 'E': 'H120', 'D': 'H09', 'N': 'H18', 'J': 'H06', 'W': 'H01'}


def abeille(fmt):
    c = Cadre(fmt, dy=2); s = ech(c); b = b_(c)
    x0, y0, x1, y1, ey = bande_visage(c, b, 'J', r=2)
    for sx, d in ((x0 + 2 * s, -1), (x1 - 2 * s, 1)):
        c.ellipse(sx, y0 - 1.6 * s, 2.0 * s, 2.6 * s, 'A', a=d * 0.5)
    c.detail(lambda x, y: c.g[y][x] == 'J' and (c.T <= y <= c.B) and ((y - c.T) // 2) % 2 == 1, 'N')
    visage(c, c.mx, ey, s, joues='j')
    c.finir(contour='D', garder_contour='')
    return c, {'J': 'H03', 'N': 'H18', 'A': 'H120', 'D': 'H12', 'j': 'H06', 'W': 'H01'}
