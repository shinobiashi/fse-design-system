// Take a pattern export downloaded from omotegae's admin screen
// (パターン → 「JSON で書き出す」), put it in sources/, rebuild, and print what changed
// against the export it replaces.
//
//   node scripts/import-patterns.mjs <path/to/omotegae-patterns-YYYYMMDD-HHMMSS.json>

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readJson, writeFile } from './lib.mjs';

const input = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!input || !existsSync(input)) {
  console.error('Usage: node scripts/import-patterns.mjs <exported JSON file> [--allow-removed]');
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

// omotegae never deletes a pattern (it deprecates it), so a slug that disappears means
// the wrong file or a truncated download. Refuse before touching anything, unless told.
const removed = before.patterns.map((p) => p.slug).filter((slug) => !next.patterns.some((p) => p.slug === slug));
if (removed.length && !process.argv.includes('--allow-removed')) {
  console.error(`この書き出しには、前回あったパターンがありません: ${removed.join(', ')}`);
  console.error('omotegae はパターンを削除しないので、別のファイルか途中で切れたファイルの可能性があります。何も変更していません。');
  console.error('意図した変更なら --allow-removed を付けて実行してください。');
  process.exit(1);
}

const previousText = existsSync(target) ? readFileSync(target, 'utf8') : null;
writeFile(target, JSON.stringify(next, null, 4) + '\n');
const run = (script) => execFileSync(process.execPath, [join(ROOT, 'scripts', script)], { stdio: 'inherit' });
try {
  run('sync.mjs');
  run('build.mjs');
  run('validate.mjs');
} catch {
  // Put the previous export back so sources/ never holds a file that does not build.
  if (previousText !== null) writeFile(target, previousText);
  if (previousText !== null) run('sync.mjs');
  console.error('取り込めませんでした(上のエラーを参照)。前の書き出しに戻しました。');
  process.exit(1);
}

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
  for (const key of ['title', 'description_for_ai', 'block_map', 'content_schema', 'tone_tags', 'requires_woocommerce', 'category', 'version']) {
    if (stable(o[key]) !== stable(p[key])) parts.push(key);
  }
  if (parts.length) lines.push(`- 変更: ${slug}: ${parts.join('、')}`);
}
for (const slug of removed) lines.push(`- 書き出しから消えた(--allow-removed で許可): ${slug}`);
if (lines.length === 1) lines.push('- パターンの変更なし');
console.log('\n' + lines.join('\n'));
console.log('\n公開は PUBLISHING.md の手順で。');
