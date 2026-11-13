#!/usr/bin/env python3
"""Regroupe les scripts de l'application en ligne en un seul fichier.

Usage : python3 outils/regrouper.py <dossier app assemblé> <version>

En ligne, une soixantaine de petits fichiers se chargeaient un par un : sur téléphone c'est lent,
et il suffit qu'un seul échoue pour qu'il manque une partie des modèles. Ici, tous les scripts
d'index.html sont mis bout à bout, dans le même ordre, dans « perlinette.js ».
La version téléchargée (dossier du dépôt) n'est pas touchée.
"""
import re
import sys
from pathlib import Path

app, version = Path(sys.argv[1]), sys.argv[2]
page = (app / 'index.html').read_text(encoding='utf-8')
balise = re.compile(r'<script(?:\s+src="([^"?]+)(?:\?[^"]*)?")?\s*>(.*?)</script>\s*', re.S)
morceaux, premier = [], None
for m in balise.finditer(page):
    if premier is None:
        premier = m.start()
    if m.group(1):
        source = (app / m.group(1)).read_text(encoding='utf-8')
        morceaux.append(f'// ===== {m.group(1)} =====\n{source.rstrip()}\n;')
    elif m.group(2).strip():
        morceaux.append(f'// ===== page =====\n{m.group(2).strip()}\n;')
assert premier is not None and len(morceaux) > 10, 'scripts introuvables'
(app / 'perlinette.js').write_text('\n'.join(morceaux) + '\n', encoding='utf-8', newline='\n')
page = page[:premier] + balise.sub('', page[premier:])
page = page.replace('</body>', f'<script src="perlinette.js?v={version}"></script>\n</body>')
page = re.sub(r'href="styles\.css(?:\?[^"]*)?"', f'href="styles.css?v={version}"', page)
assert 'perlinette.js' in page
(app / 'index.html').write_text(page, encoding='utf-8', newline='\n')
print(f'{len(morceaux)} scripts regroupés dans perlinette.js')
