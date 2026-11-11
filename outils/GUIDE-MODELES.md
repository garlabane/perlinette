# Dessiner un modèle Perlinette (guide de style)

Les modèles sont du **pixel art fait à la main, perle par perle, pour une plaque précise**.
Jamais de formes calculées (elles déforment les sujets).

## Format
Un fichier `modeles/<nom>.js` ajoute ses modèles à `MODELES` :

```js
'use strict';
(function () {
  MODELES.push({
    theme: 'Animaux', nom: 'Chat assis', plaques: ['midi-carre-grand', 'mini-carre-grand'],
    couleurs: { K: 'H18', O: 'H04', W: 'H01', P: 'H95' },   // lettre → référence Hama Midi
    grille: symetrique([            // moitié GAUCHE, colonne du milieu comprise : recopiée en miroir
      '.KK.......',
      'KOOK......',
    ], 22, [[11, 19, 'KK']]),       // largeur totale, puis ajouts asymétriques [rangée, colonne, texte]
  });
})();
```
- `.` = pas de perle. Une lettre = une couleur (majuscules/minuscules distinctes : `O` base, `o` clair…).
- Pour un sujet non symétrique (profil, véhicule), écrire la grille entière : `grille: ['....', ...]`.
- Toutes les rangées ont la même longueur.

## Plaques et tailles
| plaque | id | dessin |
|---|---|---|
| Grand carré Midi 29×29 | `midi-carre-grand` | 16 à 24 perles, sujet en entier, travaillé |
| Petit carré Midi 14×14 | `midi-carre-petit` | ≤ 13 perles |
| Maxi 16×16 (enfants, perles 10 mm) | `maxi-carre-grand` | ≤ 14 perles, TRÈS simple, 3-5 couleurs, uniquement les 25 couleurs Maxi |
| Mini 57×57 (perles 2,5 mm) | `mini-carre-grand` | 36 à 52 perles, détaillé |

Un modèle du grand carré peut aussi déclarer `mini-carre-grand` : il y est agrandi ×2 automatiquement.

## Style (validé par Sophie)
- **Contour noir continu** (`H18`) d'une perle tout autour du sujet.
- Personnages : **tête plus large que le corps**, corps en entier, petits yeux (1×2 ou 2×2 perles noires, avec un reflet blanc `H01` en grand), **joues roses** (`H95` ou `H06`), petite bouche.
- 2 à 3 tons par couleur : base, plus clair en haut à gauche (lumière), plus foncé en bas à droite. Pas de bruit : des aplats francs.
- Silhouette lisible : coins arrondis (escaliers de 1-2 perles), pas de pointes d'une seule perle.

## Procédés qui rendent un modèle « pro » (à appliquer partout)
- **Ombre en bordure, PAS en deux moitiés** : une bande de 1 à 3 perles du ton foncé le long du bord droit et du bas (côté opposé à la lumière), qui suit la forme ; le reste en ton de base ; une petite touche claire en haut à gauche. ⚠️ Ne JAMAIS couper le sujet en deux blocs verticaux (moitié gauche claire / moitié droite foncée) : relu par Sophie, ça donne des sujets « coupés en deux ». Sur un petit carré, l'ombre fait 1 perle.
- **Blanc** : un sujet blanc s'ombre en gris très clair (H77 blanc nuageux), jamais en gris moyen (H70 ou plus foncé).
- **Ventre / museau / pattes en ton plus clair** (crème, blanc) : ça structure le personnage.
- **Poses compactes** : assis bien d'aplomb, tête ronde posée sur le corps, pattes visibles en bas ; pas de membres maigres d'une perle.
- **Silhouette d'abord** : le sujet doit se reconnaître rien qu'à son contour noir (oreilles, queue, cornes…).
- **Peu de couleurs, mais des familles** : 2-3 tons par couleur plutôt que beaucoup de couleurs différentes.

## Petit carré (14×14)
Au plus 13×13, contour compris. Tête + corps quand c'est possible (style chibi), sinon un visage ou un objet plein cadre. Yeux d'une perle noire, joues roses d'une perle, ombre d'une perle le long du bord droit et du bas.

## Règles de fusion (obligatoires)
- Une perle ne se soude que si elle touche une autre **par le côté**. Pas de perle isolée, pas de partie tenue seulement par un coin (diagonale).
- Le modèle doit sortir **d'une seule pièce**.

## Originalité (obligatoire)
- Dessins **originaux** : ne pas reproduire un modèle existant (sites de grilles, réseaux d’images…), **aucun personnage protégé** (dessins animés, jeux vidéo, mangas, marques, logos).
- Ne jamais inventer de référence de perle : seulement les codes présents dans `palettes_fusibles.js` (noms français dans `noms-fr.js`).

## Couleurs Hama utiles (Midi)
H01 blanc · H02 crème · H03 jaune · H04 orange · H05 rouge · H06 rose · H07 violet · H08 bleu · H09 bleu clair · H10 vert · H11 vert clair · H12 marron · H17 gris · H18 noir · H20 brun roux · H21 marron clair · H22 rouge foncé · H26 vieux rose · H27 beige · H28 vert foncé · H29 bordeaux · H30 bordeaux foncé · H31 turquoise · H33 rose fluo · H43 jaune pastel · H44 rouge pastel · H45 violet pastel · H46 bleu pastel · H47 vert pastel · H48 rose pastel · H60 brun ourson · H70 gris clair · H71 gris foncé · H75 caramel · H76 nougat · H77 blanc nuageux · H78 pêche clair · H79 abricot · H82 prune · H83 bleu pétrole · H84 vert olive · H95 rose poudré · H96 lilas pastel · H97 bleu glacier · H98 menthe pastel · H101 eucalyptus · H102 vert forêt · H103 jaune clair · H104 citron vert · H105 abricot clair · H106 lavande claire · H107 lavande · H108 aubergine · H109 gris nuageux · H110 matcha · H113 aqua · H114 rouge cerise · H115 vert vif · H116 bleu nuit · H117 gris taupe · H119 bleu ciel.
Transparentes : H13 rouge, H14 jaune, H15 bleu, H16 vert, H19 incolore, H72 rose, H73 aqua, H74 lilas.

**Maxi : seulement** H01 H03 H05 H07 H09 H10 H17 H18 H20 H26 H32 H34 H35 H36 H37 H38 H43 H44 H45 H46 H47 H48 H60 H70 H79.

## Vérifier
```
node outils/banc-modeles.js modeles/<fichier>.js <planche.png>
```
Le banc contrôle largeurs, couleurs, soudure, pièces, taille, et dessine une planche PNG (4 modèles par rangée, dans l'ordre). **Regarder la planche** et retoucher jusqu'à ce que chaque sujet soit immédiatement reconnaissable et joli.
