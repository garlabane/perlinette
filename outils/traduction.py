#!/usr/bin/env python3
"""Version anglaise de Perlinette : fabrique traduction-en.js et signale ce qui manque.

Usage (depuis le dossier Perlinette) :  python outils/traduction.py

  • traductions/en-interface.json : textes de l'interface   { "texte français": "English" }
  • traductions/en-modeles.json   : noms des modèles et des thèmes
→ traduction-en.js (const TRAD_EN = {...}), chargé avant langue.js.

Le script relit aussi tous les textes français de l'appli (index.html et *.js) et les noms des
modèles : ceux qui n'ont pas encore de traduction sont écrits dans traductions/a-traduire.json
(clé = texte français, valeur = "" à remplir), et comptés à l'écran. Il suffit de compléter
ce fichier, puis de copier ses lignes dans en-interface.json (ou en-modeles.json) et de relancer.
Une valeur null veut dire « à ne pas traduire » (code, sigle…).
"""
import html
import json
import re
import subprocess
import sys
from pathlib import Path

R = Path(__file__).resolve().parent.parent
T = R / 'traductions'
LETTRE = re.compile(r'[A-Za-zÀ-ÿ]{2,}')
MOTS = re.compile(r'[À-ÿ]|\b(le|la|les|un|une|des|du|de|et|ou|pour|sur|avec|ton|ta|tes|est|plus|pas|en|à)\b')
CHAINE = re.compile(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"|`((?:[^`\\]|\\.)*)`", re.S)
SANS_TEXTE = {'palettes_fusibles.js', 'sw.js', 'traduction-en.js', 'langue.js'}


def chaines_js(src):
    """Toutes les chaînes d'un fichier JS : (texte, est_gabarit). Les gabarits `…${…}…` sont rendus
    avec ${x} à la place des valeurs, et les chaînes écrites DANS les ${…} sont relevées aussi."""
    out, n = [], len(src)

    def lire_code(i, fin_accolade):
        prof, prec = 0, '('
        while i < n:
            c = src[i]
            if c in ' \t\r\n':
                i += 1; continue
            if src.startswith('//', i):
                i = src.find('\n', i); i = n if i < 0 else i; continue
            if src.startswith('/*', i):
                i = src.find('*/', i + 2); i = n if i < 0 else i + 2; continue
            if c in '\'"':
                j, buf = i + 1, ''
                while j < n and src[j] != c and src[j] != '\n':
                    if src[j] == '\\': buf += src[j:j + 2]; j += 2; continue
                    buf += src[j]; j += 1
                out.append((buf, False)); i = j + 1; prec = 'x'; continue
            if c == '`':
                i = lire_gabarit(i + 1); prec = 'x'; continue
            if c == '/' and prec in '(,=:[!&|?{};+-*%<>~^' :
                j, classe = i + 1, False  # expression régulière : on la saute
                while j < n and src[j] != '\n':
                    if src[j] == '\\': j += 2; continue
                    if src[j] == '[': classe = True
                    elif src[j] == ']': classe = False
                    elif src[j] == '/' and not classe: break
                    j += 1
                i = j + 1; prec = 'x'; continue
            if c == '{': prof += 1
            elif c == '}':
                if prof == 0 and fin_accolade: return i + 1
                prof -= 1
            if c.isalnum() or c in '_$)]':
                mot = re.match(r'[\w$]+', src[i:])
                if mot and mot.group(0) in ('return', 'typeof', 'case', 'in', 'of', 'else', 'do'): prec = '('
                else: prec = 'x'
                i += len(mot.group(0)) if mot else 1; continue
            prec = c; i += 1
        return i

    def lire_gabarit(i):
        buf = ''
        while i < n:
            if src[i] == '\\': buf += src[i:i + 2]; i += 2; continue
            if src[i] == '`': out.append((buf, True)); return i + 1
            if src.startswith('${', i):
                buf += '${x}'; i = lire_code(i + 2, True); continue
            buf += src[i]; i += 1
        out.append((buf, True)); return i

    lire_code(0, False)
    return out


def textes_appli():
    trouves = set()

    def ajoute(s):
        s = html.unescape(re.sub(r'\s+', ' ', s)).strip()
        if not LETTRE.search(s) or len(s) > 600:
            return
        if ' ' not in s and not re.search(r'[À-ÿ]', s) and (s[:1].islower() or re.search(r'[_#.\[\]=:>*()/]', s)):
            return
        trouves.add(s)

    def morceaux_html(s):
        for a in re.findall(r'(?:title|placeholder|aria-label|alt)="([^"]*)"', s):
            ajoute(a)
        for t in re.sub(r'<[^>]*>', '\x00', s).split('\x00'):
            ajoute(t)

    def aplatir(s):
        prof, buf, i = 0, '', 0
        while i < len(s):
            if s.startswith('${', i) and prof == 0:
                prof = 1; buf += '${x}'; i += 2; continue
            if prof:
                prof += {'{': 1, '}': -1}.get(s[i], 0); i += 1; continue
            buf += s[i]; i += 1
        return buf

    page = (R / 'index.html').read_text(encoding='utf-8')
    morceaux_html(re.sub(r'<script.*?</script>|<style.*?</style>', '', page, flags=re.S))
    for f in sorted(list(R.glob('*.js')) + [R / 'modeles' / 'alphabet.js', R / 'modeles' / 'lettres-reseau.js']):
        if f.name in SANS_TEXTE:
            continue
        for s, _gabarit in chaines_js(f.read_text(encoding='utf-8')):
            s = s.replace("\\'", "'").replace('\\"', '"').replace('\\n', ' ').replace('\\`', '`')
            if '<' in s and '>' in s:
                morceaux_html(s)
            elif MOTS.search(s) or (s[:1].isupper() and len(s) > 2):
                ajoute(s)
    return trouves


def noms_modeles():
    """Thèmes et noms des modèles, lus par Node (outils/noms-modeles.js)."""
    try:
        sortie = subprocess.run(['node', str(R / 'outils' / 'noms-modeles.js')], cwd=R, capture_output=True, text=True, encoding='utf-8', check=True).stdout
        return set(json.loads(sortie))
    except Exception as e:  # pas de Node : on ne vérifie que l'interface
        print('(noms des modèles non vérifiés :', e, ')')
        return set()


def main():
    interface = json.loads((T / 'en-interface.json').read_text(encoding='utf-8'))
    modeles = json.loads((T / 'en-modeles.json').read_text(encoding='utf-8'))
    tout = {**interface, **modeles}
    garder = {k: v for k, v in tout.items() if v not in (None, '') and v != k}
    js = ('// GÉNÉRÉ par outils/traduction.py — ne pas modifier à la main (voir traductions/).\n'
          '// Textes de Perlinette en anglais : texte français → anglais. ${x} = une valeur (nombre, nom…).\n'
          'const TRAD_EN = ' + json.dumps(garder, ensure_ascii=False, indent=0, sort_keys=True) + ';\n')
    (R / 'traduction-en.js').write_text(js, encoding='utf-8', newline='\n')
    manque = sorted((textes_appli() | noms_modeles()) - set(tout))
    (T / 'a-traduire.json').write_text(json.dumps({k: '' for k in manque}, ensure_ascii=False, indent=1), encoding='utf-8', newline='\n')
    print(f'traduction-en.js : {len(garder)} traductions · à traduire : {len(manque)} (traductions/a-traduire.json)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
