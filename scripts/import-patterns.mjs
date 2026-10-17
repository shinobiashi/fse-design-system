// Take a pattern export downloaded from omotegae's admin screen
// (パターン → 「JSON で書き出す」), put it in sources/, rebuild, and print what changed
// against the export it replaces.
//
//   node scripts/import-patterns.mjs <path/to/omotegae-patterns-YYYYMMDD-HHMMSS.json>

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readJson, writeFile } from './lib.mjs';

const input = process.argv[2];
if (!input || !existsSync(input)) {
  console.error('Usage: node scripts/import-patterns.mjs <exported JSON file>');
  process.exit(1);
}

const sources = readJson(join(ROOT, 'sources.json'));
const target = join(ROOT, sources.omotegae.patternsFile);
const before = existsSync(target) ? readJson(target) : { patterns: [] };
const next = JSON.parse(readFileSync(input, 'utf8'));
if (next.format !== 'omotegae-patterns/1') {
  console.error(`Not an omotegae pattern export (format: ${JSON.stringify(next.format)})`);
  process.exit(1);
}

writeFile(target, JSON.stringify(next, null, 4) + '\n');
const run = (script) => execFileSync(process.execPath, [join(ROOT, 'scripts', script)], { stdio: 'inherit' });
run('sync.mjs');
run('build.mjs');
run('validate.mjs');

const stable = (v) => JSON.stringify(v);
const oldMap = new Map(before.patterns.map((p) => [p.slug, p]));
const newMap = new Map(next.patterns.map((p) => [p.slug, p]));
const lines = [`書き出し: ${before.exported_at ?? '(なし)'} → ${next.exported_at}`];
for (const [slug, p] of newMap) {
  const o = oldMap.get(slug);
  if (!o) {
    lines.push(`- 追加: ${slug}(${p.status})${p.status === 'active' ? ' — 部品ができた。見た目の再現プレビューが要るか確認する' : ''}`);
    continue;
  }
  const parts = [];
  if (o.status !== p.status) parts.push(`状態 ${o.status} → ${p.status}`);
  for (const key of ['title', 'description_for_ai', 'block_map', 'content_schema', 'tone_tags', 'requires_woocommerce', 'category']) {
    if (stable(o[key]) !== stable(p[key])) parts.push(key);
  }
  if (parts.length) lines.push(`- 変更: ${slug}: ${parts.join('、')}`);
}
for (const slug of oldMap.keys()) if (!newMap.has(slug)) lines.push(`- 書き出しから消えた: ${slug}(omotegae はパターンを削除しないので、書き出しの取り違えを疑う)`);
if (lines.length === 1) lines.push('- パターンの変更なし');
console.log('\n' + lines.join('\n'));
console.log('\n公開は PUBLISHING.md の手順で。');
