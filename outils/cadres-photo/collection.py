import sys, re
from PIL import Image, ImageDraw, ImageFont
import recettes as R
import recettes2 as K
from gen import FORMATS, controle

# (format, recette, options, nom FR, nom EN)
COLLECTION = [
    ('id', R.fleur, {}, 'Marguerite', 'Daisy'),
    ('id', R.nuage, {}, 'Petit nuage', 'Little cloud'),
    ('id', R.chat, {}, 'Chat roux', 'Ginger cat'),
    ('id', R.coeurs_coins, {}, 'Cœurs aux coins', 'Corner hearts'),
    ('id', R.timbre, {}, 'Timbre', 'Stamp'),
    ('id', R.pois, {}, 'Pois rouges', 'Red polka dots'),
    ('id', R.ours, {}, 'Ourson', 'Teddy bear'),
    ('id', R.grenouille, {}, 'Grenouille', 'Frog'),
    ('id', R.bonbon, {}, 'Bonbon', 'Sweet'),
    ('id', R.damier, {}, 'Damier', 'Checkerboard'),
    ('mini', R.nuage, {'fond': 'H01', 'bord': 'H95', 'joue': 'H06'}, 'Nuage rose', 'Pink cloud'),
    ('mini', R.lapin, {}, 'Lapin', 'Bunny'),
    ('mini', R.polaroid, {}, 'Instantané', 'Snapshot'),
    ('mini', R.renard, {}, 'Renard', 'Fox'),
    ('mini', R.fleur, {'petale': 'H05', 'coeur': 'H18', 'trait': 'H22'}, 'Coquelicot', 'Poppy'),
    ('mini', R.sucre_orge, {}, "Sucre d'orge", 'Candy cane'),
    ('mini', R.etoiles_coins, {}, 'Nuit étoilée', 'Starry night'),
    ('mini', R.festons, {}, 'Festons', 'Scallops'),
    ('mini', R.herisson, {}, 'Hérisson', 'Hedgehog'),
    ('mini', R.couronne, {}, 'Couronne', 'Crown'),
    ('carre', R.ours, {'panda': True}, 'Panda', 'Panda'),
    ('carre', R.soleil, {}, 'Soleil', 'Sun'),
    ('carre', R.arc_en_ciel, {}, 'Arc-en-ciel', 'Rainbow'),
    ('carre', R.citrouille, {}, 'Citrouille', 'Pumpkin'),
    ('carre', R.chouette, {}, 'Chouette', 'Owl'),
    ('carre', R.papillon, {}, 'Papillon', 'Butterfly'),
    ('carre', R.maison, {}, 'Maison', 'House'),
    ('carre', R.mouton, {}, 'Mouton', 'Sheep'),
    ('carre', R.coeur_grand, {}, 'Grand cœur', 'Big heart'),
    ('carre', R.tele, {}, 'Télé rétro', 'Retro TV'),
    ('9x13', R.timbre, {'fond': 'H01', 'filet': 'H09'}, 'Timbre bleu', 'Blue stamp'),
    ('9x13', R.chateau, {}, 'Château fort', 'Castle'),
    ('9x13', R.feuillage, {'feuilles': ('H04', 'H03', 'H05'), 'branche': 'H76', 'bord': 'H20'}, "Feuilles d'automne", 'Autumn leaves'),
    ('9x13', R.sapin, {}, 'Sapin', 'Christmas tree'),
    ('9x13', R.vagues, {}, 'Vagues', 'Waves'),
    ('9x13', R.pellicule, {}, 'Pellicule', 'Film strip'),
    ('9x13', R.gateau, {}, "Gâteau d'anniversaire", 'Birthday cake'),
    ('9x13', R.ballons, {}, 'Ballons', 'Balloons'),
    ('9x13', R.pois, {'fond': 'H97', 'pois_': 'H01', 'bord': 'H83'}, 'Pois pastel', 'Pastel dots'),
    ('9x13', R.flocons, {}, 'Flocons', 'Snowflakes'),
    ('10x15', R.rayures_arc, {}, 'Rayures arc-en-ciel', 'Rainbow stripes'),
    ('10x15', R.fleur, {'petale': 'H45', 'coeur': 'H43', 'trait': 'H07'}, 'Pervenche', 'Periwinkle'),
    ('10x15', R.dino, {}, 'Dinosaure', 'Dinosaur'),
    ('10x15', R.enveloppe, {}, 'Lettre', 'Love letter'),
    ('10x15', R.nuage_pluie, {}, 'Nuage de pluie', 'Rain cloud'),
    ('10x15', R.feuillage, {}, 'Feuillage', 'Greenery'),
    ('10x15', R.chat, {'pelage': 'H71', 'bord': 'H18', 'interieur': 'H06'}, 'Chat gris', 'Grey cat'),
    ('10x15', R.coeurs_coins, {'fond': 'H06', 'coeur': 'H05', 'bord': 'H29'}, 'Mille cœurs', 'Hearts galore'),
    ('10x15', R.festons, {'fond': 'H97', 'bord': 'H83'}, 'Dentelle', 'Lace'),
    ('10x15', R.polaroid, {'fond': 'H02', 'bord': 'H75', 'deco': 'H05'}, 'Grand instantané', 'Big snapshot'),
    # --- fleurs ---
    ('id', K.semis, {'fond': 'H10', 'fleurs': ('H46',), 'coeur': 'H03', 'bord': 'H28'}, 'Myosotis', 'Forget-me-nots'),
    ('id', R.fleur, {'petale': 'H09', 'coeur': 'H01', 'trait': 'H08'}, 'Bleuet', 'Cornflower'),
    ('mini', K.lavande, {}, 'Lavande', 'Lavender'),
    ('mini', K.tulipes, {}, 'Tulipes', 'Tulips'),
    ('mini', K.semis, {'fond': 'H10', 'fleurs': ('H01',), 'coeur': 'H03', 'bord': 'H28'}, 'Champ de marguerites', 'Daisy field'),
    ('carre', R.fleur, {'petale': 'H03', 'coeur': 'H12', 'trait': 'H60'}, 'Tournesol', 'Sunflower'),
    ('carre', K.roses, {}, 'Roses', 'Roses'),
    ('carre', K.coins_fleuris, {}, 'Coins fleuris', 'Flowery corners'),
    ('carre', K.sakura, {}, 'Cerisier en fleurs', 'Cherry blossom'),
    ('9x13', R.fleur, {'petale': 'H06', 'coeur': 'H03', 'trait': 'H29'}, 'Pivoine', 'Peony'),
    ('9x13', K.semis, {'fond': 'H47', 'fleurs': ('H01', 'H06', 'H03', 'H45'), 'coeur': 'H38', 'bord': 'H10'}, 'Printemps', 'Springtime'),
    ('9x13', R.fleur, {'petale': 'H46', 'coeur': 'H45', 'trait': 'H107'}, 'Hortensia', 'Hydrangea'),
    ('9x13', K.coins_fleuris, {'fond': 'H01', 'bord': 'H97', 'fleurs': ('H46', 'H45'), 'coeur': 'H03'}, 'Coins fleuris bleus', 'Blue flowery corners'),
    ('10x15', K.semis, {'fond': 'H06', 'fleurs': ('H01',), 'coeur': 'H03', 'bord': 'H29'}, 'Pâquerettes', 'Little daisies'),
    ('10x15', K.roses, {'rose': 'H95', 'fonce': 'H06', 'fond': 'H02', 'bord': 'H75'}, 'Roses anciennes', 'Vintage roses'),
    ('10x15', K.sakura, {}, 'Branche de cerisier', 'Cherry branch'),
    ('10x15', K.tulipes, {'couleurs': ('H06', 'H45', 'H05', 'H03')}, 'Grandes tulipes', 'Big tulips'),
    # --- kawaii ---
    ('id', K.nuage_kawaii, {}, 'Nuage kawaii', 'Kawaii cloud'),
    ('id', K.animal_kawaii, {}, 'Ourson kawaii', 'Kawaii teddy'),
    ('mini', K.animal_kawaii, {'oreilles': 'longues', 'pelage': 'H01', 'bord': 'H96', 'interieur': 'H06'}, 'Lapin kawaii', 'Kawaii bunny'),
    ('mini', K.poussin, {}, 'Poussin', 'Chick'),
    ('mini', K.fraise, {}, 'Fraise', 'Strawberry'),
    ('carre', K.animal_kawaii, {'oreilles': 'pointues', 'pelage': 'H02', 'bord': 'H75', 'interieur': 'H95'}, 'Chaton kawaii', 'Kawaii kitten'),
    ('carre', K.cochon, {}, 'Petit cochon', 'Piglet'),
    ('carre', K.champignon, {}, 'Champignon', 'Mushroom'),
    ('carre', K.licorne, {}, 'Licorne', 'Unicorn'),
    ('9x13', K.pingouin, {}, 'Pingouin', 'Penguin'),
    ('9x13', K.dino_kawaii, {}, 'Bébé dino', 'Baby dino'),
    ('9x13', K.cupcake, {}, 'Cupcake', 'Cupcake'),
    ('10x15', K.baleine, {}, 'Baleine', 'Whale'),
    ('10x15', K.abeille, {}, 'Abeille', 'Bee'),
    ('10x15', K.nuage_kawaii, {'fond': 'H01', 'bord': 'H95'}, 'Grand nuage kawaii', 'Big kawaii cloud'),
]


def fabriquer():
    out = []
    for fmt, f, opt, nom, en in COLLECTION:
        c, coul = f(fmt, **opt)
        g = c.grille()
        utiles = {l for r in g for l in r if l not in '.#'}
        coul = {k: v for k, v in coul.items() if k in utiles}
        soucis, mini = controle(g)
        out.append(dict(fmt=fmt, nom=nom, en=en, grille=g, couleurs=coul, soucis=soucis, bord=mini))
    return out


HEX = {}
s = open('D:/Projets/3-Perlinette/App/palettes_fusibles.js', encoding='utf-8').read()
a = s.find('"id": "hama-midi"'); b = s.find('"id":', a + 10)
for code, hexa in re.findall(r'"code": "(H\d+)",\s*"nom": "[^"]*",\s*"hex": "([^"]*)"', s[a:b]):
    HEX[code] = hexa


def planche(cadres, chemin, T=11):
    cols = 5
    cw = 29 * T + 30
    lignes = {}
    for c in cadres:
        lignes.setdefault(c['fmt'], []).append(c)
    hauteurs = {f: max(len(c['grille']) for c in L) * T + 60 for f, L in lignes.items()}
    rangs = []
    for f, L in lignes.items():
        for i in range(0, len(L), cols):
            rangs.append((f, L[i:i + cols]))
    H = sum(hauteurs[f] for f, _ in rangs) + 40 * len(lignes) + 20
    im = Image.new('RGB', (cols * cw + 20, H), '#fbf8f2')
    d = ImageDraw.Draw(im)
    f1 = ImageFont.truetype('segoeuib.ttf', 15); f2 = ImageFont.truetype('segoeui.ttf', 12); f3 = ImageFont.truetype('segoeuib.ttf', 20)
    y = 10; deja = set()
    for f, L in rangs:
        if f not in deja:
            deja.add(f)
            F = FORMATS[f]
            d.text((14, y), f"{F['nom']} ({F['taille']})", fill='#5b3a29', font=f3)
            y += 40
        for i, c in enumerate(L):
            x = 14 + i * cw
            g = c['grille']
            n = sum(ch not in '.#' for r in g for ch in r)
            ok = 'solide ✓' if not c['soucis'] else f"⚠ {len(c['soucis'])}"
            d.text((x, y), c['nom'], fill='#333', font=f1)
            d.text((x, y + 20), f"{len(g[0])}×{len(g)} · {n} perles · {ok}", fill='#2a7a3a' if not c['soucis'] else '#c00', font=f2)
            ox = x + (29 * T - len(g[0]) * T) // 2
            for j, r in enumerate(g):
                for k, ch in enumerate(r):
                    X, Y = ox + k * T, y + 42 + j * T
                    if ch == '#':
                        d.rectangle([X, Y, X + T - 1, Y + T - 1], fill='#e2e2e2')
                    elif ch != '.':
                        d.ellipse([X, Y, X + T - 1, Y + T - 1], fill=HEX[c['couleurs'][ch]], outline='#00000030')
                        d.ellipse([X + T * .36, Y + T * .36, X + T * .64, Y + T * .64], fill='#fbf8f2')
        y += hauteurs[f]
    im.save(chemin)


if __name__ == '__main__':
    cadres = fabriquer()
    for c in cadres:
        if c['soucis']:
            print(c['nom'], c['fmt'], c['soucis'][:4])
    print(len(cadres), 'cadres,', sum(not c['soucis'] for c in cadres), 'solides')
    planche(cadres, sys.argv[1] if len(sys.argv) > 1 else 'planche.png')
