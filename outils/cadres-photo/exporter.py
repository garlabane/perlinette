import json, sys
import collection as C
from gen import FORMATS
cad = C.fabriquer()
assert all(not c['soucis'] for c in cad)
FAM = {
 'Fleurs': "Marguerite Coquelicot Pervenche Myosotis Bleuet Lavande Tulipes|Champ de marguerites|Tournesol|Roses|Coins fleuris|Cerisier en fleurs|Pivoine|Printemps|Hortensia|Coins fleuris bleus|Pâquerettes|Roses anciennes|Branche de cerisier|Grandes tulipes",
 'Kawaii': "Nuage kawaii|Ourson kawaii|Lapin kawaii|Poussin|Fraise|Chaton kawaii|Petit cochon|Champignon|Licorne|Pingouin|Bébé dino|Cupcake|Baleine|Abeille|Grand nuage kawaii",
 'Animaux': "Chat roux|Ourson|Grenouille|Lapin|Renard|Hérisson|Panda|Chouette|Papillon|Mouton|Dinosaure|Chat gris",
 'Ciel et nature': "Petit nuage|Nuage rose|Nuit étoilée|Soleil|Arc-en-ciel|Vagues|Nuage de pluie|Feuillage",
 'Fêtes et saisons': "Citrouille|Feuilles d'automne|Sapin|Gâteau d'anniversaire|Ballons|Flocons",
 'Motifs': "Cœurs aux coins|Pois rouges|Damier|Sucre d'orge|Festons|Grand cœur|Pois pastel|Rayures arc-en-ciel|Mille cœurs|Dentelle",
 'Objets': "Timbre|Bonbon|Instantané|Couronne|Maison|Télé rétro|Timbre bleu|Château fort|Pellicule|Lettre|Grand instantané",
}
fam_de = {}
for f, noms in FAM.items():
    for n in noms.replace(' Tulipes|', '|Tulipes|').replace('Marguerite Coquelicot Pervenche Myosotis Bleuet Lavande', 'Marguerite|Coquelicot|Pervenche|Myosotis|Bleuet|Lavande').split('|'):
        fam_de[n] = f
manque = [c['nom'] for c in cad if c['nom'] not in fam_de]
assert not manque, manque
L = []
for c in cad:
    F = FORMATS[c['fmt']]
    grand = F['H'] > 29
    g = [r.replace('#', '.') for r in c['grille']]
    assert len(g[0]) <= 29 and len(g) <= (58 if grand else 29)
    m = {'nom': f"{F['nom']} · {c['nom']}", 'famille': fam_de[c['nom']], 'couleurs': c['couleurs'], 'grille': g}
    if grand: m['a'] = {'cols': 1, 'rangs': 2}
    L.append(m)
js = """'use strict';
// Cadres photo : des cadres à glisser autour d'une photo (photo d'identité, Instax mini, photo carrée,
// tirages 9 × 13 et 10 × 15). Le trou est calculé pour que la photo déborde d'environ 3 à 5 mm sous
// les perles. Chaque cadre a passé le contrôle de solidité : aucune perle tenue par un seul côté,
// aucun trait d'une perle de large, au moins 2 perles autour du trou.
(function () {
  const T = 'Cadres photo', P = ['midi-carre-grand'];
  const L = """ + json.dumps(L, ensure_ascii=False, separators=(',', ':')) + """;
  for (const m of L) MODELES.push({ theme: T, nom: m.nom, plaques: P, famille: m.famille, assemblage: m.a, tailleFixe: true, couleurs: m.couleurs, grille: m.grille });
})();
"""
open('D:/Projets/3-Perlinette/App/modeles/cadres-photo.js', 'w', encoding='utf-8', newline='\n').write(js)
# traductions
en = {'Cadres photo': 'Photo frames', 'Fleurs': 'Flowers', 'Kawaii': 'Kawaii', 'Ciel et nature': 'Sky and nature', 'Fêtes et saisons': 'Holidays and seasons', 'Motifs': 'Patterns', 'Objets': 'Objects'}
noms_en = {F['nom']: F for F in FORMATS.values()}
fmt_en = {"Photo d'identité": 'ID photo', 'Instax mini': 'Instax mini', 'Photo carrée': 'Square photo', 'Tirage 9 × 13': '9 × 13 print', 'Tirage 10 × 15': '10 × 15 print'}
for c in cad:
    F = FORMATS[c['fmt']]
    en[f"{F['nom']} · {c['nom']}"] = f"{fmt_en[F['nom']]} · {c['en']}"
json.dump(en, open('trad.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(L), 'ok')
