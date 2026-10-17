// Check dist/project/ against the Design System format's rules and this system's own
// promises (contrast pairs, no leftover placeholders). Exit code 1 on any error.
//
//   node scripts/validate.mjs

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DIST, readJson } from './lib.mjs';

const OUT = join(DIST, 'project');
const errors = [];
const warnings = [];
const err = (m) => errors.push(m);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = walk(OUT).map((p) => relative(OUT, p));

// ---- caps and paths
if (files.length > 1008) err(`Too many files: ${files.length} > 1008`);
for (const f of files) {
  const size = statSync(join(OUT, f)).size;
  if (size > 15 * 1024 * 1024) err(`${f}: larger than 15 MiB`);
  if (f.split('/').some((seg) => seg.startsWith('.'))) err(`${f}: dot-prefixed path segment`);
  if (/(^|\/)(package\.json|tsconfig\.json|CLAUDE\.md|AGENTS\.md|design-system\.json|SKILL\.md|index\.html)$/.test(f)) err(`${f}: reserved name`);
}
const sections = files.filter((f) => f.endsWith('.md') && !f.includes('/') && f !== 'README.md');
if (sections.length > 24) err(`Too many sections: ${sections.length} > 24`);
if (statSync(join(OUT, 'README.md')).size > 200 * 1024) err('README.md larger than 200 KB');

// ---- tokens.json grammar
const tokens = readJson(join(OUT, 'tokens.json'));
if (statSync(join(OUT, 'tokens.json')).size > 512 * 1024) err('tokens.json larger than 512 KB');
const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const LENGTH = /^(-?\d*\.?\d+(px|rem|em|%)|0)$/;
const COLOR = /^(#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|(rgb|rgba|hsl|hsla|oklch|oklab|lab|lch)\([0-9.,%\s/-]+\))$/i;
const seen = new Set();
for (const [family, value] of Object.entries(tokens)) {
  if (['name', 'version', 'meta', 'type'].includes(family)) continue;
  if (!value || !Array.isArray(value.tokens)) {
    err(`tokens.json: family "${family}" is not {tokens:[...]}`);
    continue;
  }
  for (const t of value.tokens) {
    if (!NAME.test(t.name)) err(`token name "${t.name}" is invalid`);
    if (seen.has(t.name)) err(`token name "${t.name}" is used twice`);
    seen.add(t.name);
    if (!t.usage) warnings.push(`token "${t.name}" has no usage note`);
    if (family === 'color') {
      const v = typeof t.value === 'string' ? t.value : Object.values(t.value)[0];
      const alias = /^\{(.+)\}$/.exec(v);
      if (alias) {
        if (!value.tokens.some((o) => o.name === alias[1] && o.name !== t.name)) err(`color "${t.name}" aliases missing "${alias[1]}"`);
      } else if (!COLOR.test(v)) err(`color "${t.name}" has an unreadable value "${v}"`);
    } else if (['spacing', 'radius'].includes(family)) {
      if (!LENGTH.test(String(t.value))) err(`${family} "${t.name}" has an unreadable length "${t.value}"`);
    } else if (family === 'shadow') {
      if (/var\(|url\(/.test(t.value) || t.value.length > 400) err(`shadow "${t.name}" is invalid`);
    } else if (!/^[A-Za-z0-9 #%(),./+_-]{1,200}$/.test(String(t.value))) {
      err(`${family} "${t.name}" has an unreadable value "${t.value}"`);
    }
  }
}
const extraFamilies = Object.keys(tokens).filter((k) => !['name', 'version', 'meta', 'color', 'type', 'spacing', 'radius', 'shadow'].includes(k));
if (extraFamilies.length > 12) err('More than 12 extra token families');
for (const [key, stack] of Object.entries(tokens.type.families)) {
  if (stack.length > 200 || /[;{}<>\\()]/.test(stack)) err(`type.families.${key} has forbidden characters`);
}
const styleNames = new Set();
for (const g of tokens.type.groups) {
  for (const s of g.styles) {
    if (!NAME.test(s.name)) err(`type style "${s.name}" is invalid`);
    if (styleNames.has(s.name)) err(`type style "${s.name}" is used twice`);
    styleNames.add(s.name);
    if (!LENGTH.test(s.fontSize)) err(`type style "${s.name}" has an unreadable fontSize`);
  }
}

// ---- contrast (WCAG 2)
const colorMap = new Map(tokens.color.tokens.map((t) => [t.name, typeof t.value === 'string' ? t.value : Object.values(t.value)[0]]));
function hex(name) {
  let v = colorMap.get(name);
  for (let i = 0; i < 16 && /^\{/.test(v); i++) v = colorMap.get(v.slice(1, -1));
  return v;
}
function luminance(h) {
  const n = h.replace('#', '');
  const full = n.length === 3 ? [...n].map((c) => c + c).join('') : n.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [luminance(hex(a)), luminance(hex(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const PAIRS = [
  ...['contrast', 'contrast-2', 'primary', 'secondary', 'accent', 'sale', 'success', 'warning', 'error'].flatMap((fg) => [
    [fg, 'base', 4.5],
    [fg, 'base-2', 4.5],
  ]),
  ['on-primary', 'primary', 4.5],
  ['on-secondary', 'secondary', 4.5],
  ['on-accent', 'accent', 4.5],
  ['on-sale', 'sale', 4.5],
  ['base', 'contrast', 4.5],
  ['base', 'contrast-2', 4.5],
  ['base', 'success', 4.5],
  ['base', 'error', 4.5],
  ['base', 'warning', 4.5],
  ['border-strong', 'base', 3],
  ['border-strong', 'base-2', 3],
  ['focus', 'base', 3],
  ['focus', 'base-2', 3],
];
const contrastReport = [];
for (const [fg, bg, min] of PAIRS) {
  const r = ratio(fg, bg);
  contrastReport.push(`${fg} on ${bg}: ${r.toFixed(2)} (min ${min})`);
  if (r < min) err(`contrast ${fg} on ${bg} is ${r.toFixed(2)}, below ${min}`);
}

// ---- components and previews
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const comps = [...new Set(files.filter((f) => f.startsWith('components/') && f.split('/').length === 3).map((f) => f.split('/')[1]))];
for (const c of comps) {
  if (!IDENT.test(c)) err(`components/${c}: not an ASCII identifier`);
  const preview = files.includes(`components/${c}/preview.html`) ? readFileSync(join(OUT, 'components', c, 'preview.html'), 'utf8') : null;
  if (c !== 'Cover' && !files.includes(`components/${c}/README.md`)) err(`components/${c}: no README.md`);
  if (c === 'Cover' && files.some((f) => f.startsWith('components/Cover/') && !f.endsWith('preview.html'))) err('components/Cover must hold only preview.html');
  if (!preview) {
    err(`components/${c}: no preview.html`);
    continue;
  }
  if (!/^<!-- @dsCard[^\n]*-->\n/.test(preview)) err(`components/${c}/preview.html: line 1 is not a @dsCard marker`);
  if (/<(iframe|frame|object|embed|portal|noscript)\b/i.test(preview)) err(`components/${c}/preview.html: forbidden element`);
  if (Buffer.byteLength(preview) > 256 * 1024) err(`components/${c}/preview.html larger than 256 KB`);
  if (/https?:\/\/(?!fonts\.googleapis\.com|fonts\.gstatic\.com)/.test(preview.replace(/href="#"/g, '').replace(/xmlns="[^"]+"/g, ''))) warnings.push(`components/${c}/preview.html loads an external URL`);
}
const bundleCss = readFileSync(join(OUT, 'components/bundle.css'), 'utf8');
if (/<\/style/i.test(bundleCss)) err('bundle.css contains </style');
if (Buffer.byteLength(bundleCss) > 2 * 1024 * 1024) err('bundle.css larger than 2 MB');
if (Buffer.byteLength(readFileSync(join(OUT, 'components/index.d.ts'))) > 1.5 * 1024 * 1024) err('index.d.ts larger than 1.5 MB');

// ---- leftovers
for (const f of files.filter((f) => /\.(md|html|json|css|ts)$/.test(f))) {
  const text = readFileSync(join(OUT, f), 'utf8');
  if (/\{\{[a-zA-Z]+\}\}/.test(text)) err(`${f}: unreplaced {{placeholder}}`);
}

console.log(`Files: ${files.length}, components: ${comps.length}, sections: ${sections.length}`);
console.log(contrastReport.join('\n'));
for (const w of warnings) console.log(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}
console.log('OK');
