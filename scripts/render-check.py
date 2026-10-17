"""Render every preview in dist/project/ headless and save screenshots (optional check).

Mimics the Design System page's preview frame: a compiled tokens.css (as the page
would generate it from tokens.json), then components/bundle.css, then the preview.
Reports previews that render blank or throw, and writes PNGs to dist/render/.

    python3 scripts/render-check.py [Comp ...]

Requires the Python `playwright` package with Chromium installed.
"""
import json
import pathlib
import re
import sys

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'dist' / 'project'
SHOTS = ROOT / 'dist' / 'render'


def tokens_css(tokens):
    first = tokens['color']['themes'][0]['id']
    colors = {t['name']: (t['value'] if isinstance(t['value'], str) else t['value'][first]) for t in tokens['color']['tokens']}

    def css_color(v):
        m = re.fullmatch(r'\{(.+)\}', v)
        return f'var(--{m.group(1)})' if m else v

    lines = [f':root, [data-theme="{first}"] {{']
    lines += [f'  --{k}: {css_color(v)};' for k, v in colors.items()]
    for t in tokens.get('shadow', {}).get('tokens', []):
        lines.append(f"  --{t['name']}: {t['value']};")
    lines.append('}')
    lines.append(':root {')
    for fam in ('spacing', 'radius', 'layout', 'aspect-ratio'):
        for t in tokens.get(fam, {}).get('tokens', []):
            lines.append(f"  --{t['name']}: {t['value']};")
    for key, stack in tokens['type']['families'].items():
        lines.append(f'  --font-{key}: {stack};')
    lines.append('}')
    return '\n'.join(lines)


def main(only):
    tokens = json.loads((OUT / 'tokens.json').read_text())
    css = tokens_css(tokens) + '\n' + (OUT / 'components' / 'bundle.css').read_text()
    SHOTS.mkdir(parents=True, exist_ok=True)
    problems = []
    comps = sorted(p.name for p in (OUT / 'components').iterdir() if p.is_dir())
    if only:
        comps = [c for c in comps if c in only]
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        page = browser.new_page(viewport={'width': 960, 'height': 600})
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        for comp in comps:
            html = (OUT / 'components' / comp / 'preview.html').read_text()
            errors.clear()
            page.set_content(f'<!doctype html><html lang="ja" data-theme="light"><head><meta charset="utf-8"><style>{css}</style></head><body>{html}</body></html>', wait_until='networkidle')
            box = page.evaluate('() => { const r = document.body.getBoundingClientRect(); return [r.width, document.body.scrollHeight, document.body.innerText.trim().length] }')
            if box[1] < 30 or box[2] == 0:
                problems.append(f'{comp}: looks blank')
            if errors:
                problems.append(f'{comp}: {errors[0]}')
            overflow = page.evaluate('() => document.documentElement.scrollWidth > 960')
            if overflow:
                problems.append(f'{comp}: wider than 960px')
            page.screenshot(path=str(SHOTS / f'{comp}.png'), full_page=True)
        browser.close()
    print(f'Rendered {len(comps)} previews into {SHOTS}')
    for p in problems:
        print('problem:', p)
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main(set(sys.argv[1:])))
