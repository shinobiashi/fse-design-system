// Feed broken omotegae exports to sync / build / import-patterns and check that each
// one is refused (or handled) the way those scripts promise. Everything runs in a
// throwaway copy of the working tree, so sources/, data/ and dist/ here are never
// touched. Exit code 1 if any case does not behave as expected.
//
//   node scripts/check-patterns.mjs          # run every case
//   node scripts/check-patterns.mjs --keep   # keep the copy (path is printed) to debug
//
// When a check is added to sync.mjs or import-patterns.mjs, add a case here.

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { ROOT, readJson } from './lib.mjs';

const keep = process.argv.includes('--keep');
const WORK = mkdtempSync(join(tmpdir(), 'fse-check-patterns-'));
const COPY = join(WORK, 'repo');
let exportPath; // set once the copy exists
let original;
let originalSources; // sources.json, which import-patterns writes the export time into

const fresh = () => JSON.parse(original);
const active = (doc) => doc.patterns.find((p) => p.status === 'active');
const firstField = (p) => p.content_schema.properties[Object.keys(p.content_schema.properties)[0]];
const writeExport = (doc) => writeFileSync(exportPath, JSON.stringify(doc, null, 4) + '\n');
const readCopy = (path) => readFileSync(join(COPY, path), 'utf8');

// stdout and stderr together, also on success: warnings go to stderr.
function run(script, args = []) {
  const res = spawnSync(process.execPath, [join(COPY, 'scripts', script), ...args], {
    cwd: COPY,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { ok: res.status === 0, out: `${res.stdout ?? ''}${res.stderr ?? ''}${res.error ? res.error.message : ''}` };
}

// Why a script stopped: the thrown error's message, else the last line that is not
// Node's version banner or a stack frame.
function reason(res) {
  const lines = res.out
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !/^Node\.js v\d/.test(l) && !l.startsWith('at '));
  return lines.find((l) => /^\w*Error: /.test(l)) ?? lines.at(-1) ?? '';
}
const why = (res) => (res.ok ? '通った' : reason(res));

// A refusal is an ordinary error message, never a crash.
const refused = (res, re) => !res.ok && re.test(res.out) && !/TypeError|ReferenceError/.test(res.out);

function syncAndBuild() {
  for (const script of ['sync.mjs', 'build.mjs']) {
    const res = run(script);
    if (!res.ok) return `${script}: ${reason(res)}`;
  }
  return null;
}

// Write a mutated export to a file outside the copy, for import-patterns to read.
function exportFile(name, doc) {
  const path = join(WORK, `${name}.json`);
  writeFileSync(path, JSON.stringify(doc));
  return path;
}

// Two slugs that normalize to the same component name: sync accepts them, build stops.
function collidingExport() {
  const doc = fresh();
  doc.patterns.push({ ...structuredClone(active(doc)), slug: 'zz-collide-1' }, { ...structuredClone(active(doc)), slug: 'zz-collide1' });
  return doc;
}

const cases = [];

// ---- sync.mjs refuses malformed exports before it writes data/omotegae/
const SYNCED = 'data/omotegae/patterns.json';
const sync = (name, mutate, re) =>
  cases.push([
    name,
    () => {
      const doc = fresh();
      mutate(doc);
      writeExport(doc);
      const before = readCopy(SYNCED);
      const res = run('sync.mjs');
      if (!refused(res, re)) return `sync: ${why(res)}`;
      return readCopy(SYNCED) === before || `拒否したのに ${SYNCED} が書き換わった`;
    },
  ]);
sync('形式名が違う', (d) => { d.format = 'omotegae-patterns/0'; }, /format must be "omotegae-patterns\/1"/);
sync('patterns が配列でない', (d) => { d.patterns = {}; }, /patterns is not a list/);
sync('categories が配列でない', (d) => { d.categories = {}; }, /categories is not a list/);
sync('カテゴリの slug の形が違う', (d) => { d.categories[0].slug = 'Bad Slug'; }, /categories\[0\] is malformed/);
sync('カテゴリの label が文字列でない', (d) => { d.categories[0].label = 1; }, /categories\[0\] is malformed/);
sync('slug の形が違う', (d) => { active(d).slug = 'Bad Slug'; }, /slug is malformed/);
sync('slug が重複', (d) => { d.patterns.push(structuredClone(active(d))); }, /slug appears twice/);
sync('category の形が違う', (d) => { active(d).category = 'Bad Category'; }, /category is malformed/);
sync('status が未知', (d) => { active(d).status = 'published'; }, /unknown status "published"/);
sync('title が文字列でない', (d) => { active(d).title = 1; }, /title is not a string/);
sync('description_for_ai が文字列でない', (d) => { active(d).description_for_ai = null; }, /description_for_ai is not a string/);
sync('block_map が配列でない', (d) => { active(d).block_map = 'core/group'; }, /block_map is not a list of block names/);
sync('block_map に文字列でない要素', (d) => { active(d).block_map.push(1); }, /block_map is not a list of block names/);
sync('tone_tags が配列でない', (d) => { active(d).tone_tags = 'modern'; }, /tone_tags is not a list/);
sync('tone_tags に文字列でない要素', (d) => { active(d).tone_tags = [1]; }, /tone_tags is not a list/);
sync('requires_woocommerce が文字列', (d) => { active(d).requires_woocommerce = 'true'; }, /requires_woocommerce is not a boolean/);
sync('requires_woocommerce が数値', (d) => { active(d).requires_woocommerce = 1; }, /requires_woocommerce is not a boolean/);
sync('content_schema が配列', (d) => { active(d).content_schema = []; }, /content_schema is not an object/);
sync('properties が配列', (d) => { active(d).content_schema.properties = []; }, /content_schema\.properties is not an object/);
sync('required が配列でない', (d) => { active(d).content_schema.required = 'heading'; }, /content_schema\.required is not a list of field names/);
sync('required に文字列でない要素', (d) => { active(d).content_schema.required = [1]; }, /content_schema\.required is not a list of field names/);
sync('required の項目に定義が無い', (d) => { (active(d).content_schema.required ??= []).push('no_such_field'); }, /required field "no_such_field" has no definition/);
sync('required の名前が Object.prototype にだけある', (d) => { (active(d).content_schema.required ??= []).push('toString'); }, /required field "toString" has no definition/);
sync('項目名が小文字の識別子でない', (d) => { active(d).content_schema.properties['plan-name'] = { type: 'string' }; }, /field name "plan-name" is not a lowercase identifier/);
sync('項目の定義がオブジェクトでない', (d) => { active(d).content_schema.properties.zz_field = 'string'; }, /field "zz_field" is not a schema object/);
sync('項目の type が未知', (d) => { firstField(active(d)).type = 'text'; }, /unknown type "text"/);
sync('enum が空', (d) => { firstField(active(d)).enum = []; }, /empty or malformed enum/);
sync('enum が配列でない', (d) => { firstField(active(d)).enum = 'a'; }, /empty or malformed enum/);
sync('maxLength が 0', (d) => { firstField(active(d)).maxLength = 0; }, /malformed maxLength/);
sync('maxLength が整数でない', (d) => { firstField(active(d)).maxLength = 1.5; }, /malformed maxLength/);

// ---- build.mjs: generated components and index.d.ts
// (A clash with a block component cannot be built: pattern names are "Pattern" plus at
// least one more character, and no block component is named like that.)
cases.push([
  '正規化すると同じ部品名になる slug は止める',
  () => {
    writeExport(collidingExport());
    const s = run('sync.mjs');
    if (!s.ok) return `sync: ${reason(s)}`;
    const res = run('build.mjs');
    return refused(res, /both map to the component name/) || `build: ${why(res)}`;
  },
]);
cases.push([
  '項目の型が index.d.ts にそのまま出る',
  () => {
    const doc = fresh();
    Object.assign(active(doc).content_schema.properties, { zz_count: { type: 'number' }, zz_flag: { type: 'boolean' }, zz_items: { type: 'array' } });
    writeExport(doc);
    const failure = syncAndBuild();
    if (failure) return failure;
    const dts = readCopy('dist/project/components/index.d.ts');
    const missing = ['zz_count?: number;', 'zz_flag?: boolean;', 'zz_items?: unknown[];'].filter((w) => !dts.includes(w));
    return missing.length === 0 || `index.d.ts に無い: ${missing.join(' ')}`;
  },
]);
cases.push([
  '題名の */ は index.d.ts のコメントを閉じない',
  () => {
    const doc = fresh();
    active(doc).title = 'zz */ export const injected = 1; /* tail';
    writeExport(doc);
    const failure = syncAndBuild();
    if (failure) return failure;
    const dts = readCopy('dist/project/components/index.d.ts');
    const line = dts.split('\n').find((l) => l.includes('zz *')) ?? '';
    const closesOnce = (line.match(/\*\//g) ?? []).length === 1 && line.trimEnd().endsWith('*/');
    return (closesOnce && !/^export const injected/m.test(dts)) || `コメントの行: ${line}`;
  },
]);

// ---- import-patterns.mjs refuses these exports, and sources/ still holds the previous
// export afterwards
const importRefuses = (name, makeDoc, re) =>
  cases.push([
    name,
    () => {
      const res = run('import-patterns.mjs', [exportFile('import', makeDoc())]);
      if (!refused(res, re)) return `import: ${why(res)}`;
      return readFileSync(exportPath, 'utf8') === original || 'sources/ の書き出しが書き換わった';
    },
  ]);
importRefuses('形式名が違う書き出しは拒否', () => ({ ...fresh(), format: 'omotegae-patterns/0' }), /Not an omotegae pattern export \(format/);
importRefuses('前回あった slug が消えた書き出しは拒否', () => { const d = fresh(); d.patterns = d.patterns.filter((p) => p !== active(d)); return d; }, /前回あったパターンがありません/);
importRefuses('patterns が無い書き出しは拒否', () => { const d = fresh(); delete d.patterns; return d; }, /patterns is not a list of patterns with a slug/);
importRefuses('patterns がオブジェクトの書き出しは拒否', () => ({ ...fresh(), patterns: { a: 1 } }), /patterns is not a list of patterns with a slug/);
importRefuses('slug の無いパターンを含む書き出しは拒否', () => { const d = fresh(); d.patterns.push({ title: 'zz' }); return d; }, /patterns is not a list of patterns with a slug/);
cases.push([
  'build で失敗した取り込みは sources/・data/・dist/ を元に戻す',
  () => {
    // Earlier cases leave data/ and dist/ built from their own exports: start from the real one.
    const failure = syncAndBuild();
    if (failure) return failure;
    const dataBefore = readCopy(SYNCED);
    const res = run('import-patterns.mjs', [exportFile('import', collidingExport())]);
    if (!refused(res, /both map to the component name/)) return `import: ${why(res)}`;
    const broken = [
      readFileSync(exportPath, 'utf8') !== original && 'sources/',
      readCopy('sources.json') !== originalSources && 'sources.json',
      readCopy(SYNCED) !== dataBefore && 'data/',
      !['dist/project/components/index.d.ts', 'dist/publish-plan.json'].every((p) => existsSync(join(COPY, p))) && 'dist/',
    ].filter(Boolean);
    return broken.length === 0 || `元に戻っていない: ${broken.join('、')}`;
  },
]);

// ---- import-patterns.mjs accepts these and reports them
cases.push([
  '--allow-removed を付ければ、slug が消えた書き出しも取り込む',
  () => {
    const doc = fresh();
    const gone = active(doc).slug;
    doc.patterns = doc.patterns.filter((p) => p.slug !== gone);
    const res = run('import-patterns.mjs', [exportFile('import', doc), '--allow-removed']);
    if (!res.ok) return `import: ${reason(res)}`;
    return res.out.includes(`書き出しから消えた(--allow-removed で許可): ${gone}`) || '消えたパターンが変更点に出ない';
  },
]);
cases.push([
  'version だけの変更も取り込みの変更点に出る',
  () => {
    const doc = fresh();
    const p = active(doc);
    p.version = (p.version ?? 1) + 1;
    const res = run('import-patterns.mjs', [exportFile('import', doc)]);
    if (!res.ok) return `import: ${reason(res)}`;
    return res.out.includes(`変更: ${p.slug}: version`) || 'version の変更が変更点に出ない';
  },
]);

// ---- import-patterns.mjs takes the export time from the download's file name
const omotegaeSources = () => JSON.parse(readCopy('sources.json')).omotegae;
cases.push([
  'ファイル名の日時を sources.json に記録する',
  () => {
    const res = run('import-patterns.mjs', [exportFile('omotegae-patterns-20261018-091500', fresh())]);
    if (!res.ok) return `import: ${reason(res)}`;
    const o = omotegaeSources();
    return (o.exportedAt === '2026-10-18T09:15:00+09:00' && o.provisional === false) || `sources.json: ${JSON.stringify(o)}`;
  },
]);
cases.push([
  'ありえない日時のファイル名は、警告して日時を「不明」にする',
  () => {
    const res = run('import-patterns.mjs', [exportFile('omotegae-patterns-20261340-256099', fresh())]);
    if (!res.ok) return `import: ${reason(res)}`;
    const o = omotegaeSources();
    return (o.exportedAt === null && /ありえない日時/.test(res.out)) || `exportedAt: ${o.exportedAt}`;
  },
]);
cases.push([
  '書き出しを書き込めなかった取り込みは sources.json を元に戻す',
  () => {
    // A link into a missing directory: writing the export fails (even as root) after
    // sources.json has been written.
    rmSync(exportPath);
    symlinkSync(join(WORK, 'missing', 'export.json'), exportPath);
    const res = run('import-patterns.mjs', [exportFile('omotegae-patterns-20261018-091500', fresh())]);
    if (!refused(res, /取り込めませんでした/)) return `import: ${why(res)}`;
    return readCopy('sources.json') === originalSources || 'sources.json が元に戻っていない';
  },
]);
cases.push([
  '取り込み前に書き出しが無ければ、失敗した取り込みは書き込んだ書き出しを消す',
  () => {
    rmSync(exportPath);
    const res = run('import-patterns.mjs', [exportFile('import', collidingExport())]);
    if (!refused(res, /書き込んだ書き出しを消しました/)) return `import: ${why(res)}`;
    const left = [existsSync(exportPath) && 'sources/ の書き出し', readCopy('sources.json') !== originalSources && 'sources.json'].filter(Boolean);
    return left.length === 0 || `残っている: ${left.join('、')}`;
  },
]);

// ---- run
let failed = 0;
try {
  // Copy everything but git metadata and build output. .cache comes along, so sync in
  // the copy reuses the WordPress / WooCommerce checkouts instead of fetching them.
  cpSync(ROOT, COPY, {
    recursive: true,
    filter: (src) => !['.git', 'dist', 'node_modules'].includes(relative(ROOT, src).split(sep)[0]),
  });
  exportPath = join(COPY, readJson(join(COPY, 'sources.json')).omotegae.patternsFile);
  original = readFileSync(exportPath, 'utf8');
  originalSources = readCopy('sources.json');
  // The working tree's export must sync and build; otherwise every case below is noise.
  const failure = syncAndBuild();
  if (failure) throw new Error(`いまの書き出しで sync / build が通らない: ${failure}`);
  for (const [name, check] of cases) {
    // Every case starts from the real export and sources.json (a case may have replaced
    // the export with a link or removed it).
    rmSync(exportPath, { force: true });
    writeFileSync(exportPath, original);
    writeFileSync(join(COPY, 'sources.json'), originalSources);
    let result;
    try {
      result = check();
    } catch (e) {
      result = `例外: ${e.message}`;
    }
    if (result === true) console.log(`ok  ${name}`);
    else {
      failed++;
      console.log(`NG  ${name} — ${result}`);
    }
  }
} finally {
  if (keep) console.log(`copy kept at ${COPY}`);
  else rmSync(WORK, { recursive: true, force: true });
}

console.log(`${cases.length} cases, ${failed} failed`);
if (failed) process.exit(1);
console.log('OK');
