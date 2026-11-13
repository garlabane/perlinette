#!/bin/sh
# Assemble localement ce que GitHub publiera (site + app/), pour tester avant de pousser.
# Usage : sh outils/assembler-web.sh <dossier-de-sortie>
set -e
cd "$(dirname "$0")/.."
SORTIE="${1:?dossier de sortie}"
rm -rf "$SORTIE" && mkdir -p "$SORTIE/app"
cp -r docs/. "$SORTIE/"
cp index.html styles.css *.js LICENSE CREDITS.md "$SORTIE/app/"
cp -r modeles "$SORTIE/app/"
echo "Assemblé dans $SORTIE"
