// Look for newer stable releases of WordPress and WooCommerce. When one exists:
// bump sources.json, re-run sync + build + validate, and write a Japanese summary of
// what changed to dist/update-summary.md (used as the pull request body).
//
//   node scripts/check-updates.mjs            # check and update
//   node scripts/check-updates.mjs --dry-run  # only report the latest tags
//
// In GitHub Actions it also writes `updated`, `title` and `branch` to $GITHUB_OUTPUT.

import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, DIST, ROOT, compareVersions, componentName, git, latestTag, readJson, writeFile } from './lib.mjs';

const dryRun = process.argv.includes('--dry-run');
const sourcesPath = join(ROOT, 'sources.json');
const sources = readJson(sourcesPath);

const bumps = [];
for (const key of ['wordpress', 'woocommerce']) {
  const { repo, tag } = sources[key];
  const latest = latestTag(repo);
  console.log(`${key}: pinned ${tag}, latest ${latest}`);
  if (latest && compareVersions(latest, tag) > 0) bumps.push({ key, from: tag, to: latest });
}

function output(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

if (!bumps.length || dryRun) {
  output('updated', bumps.length && !dryRun ? 'true' : 'false');
  console.log(bumps.length ? `Newer releases: ${bumps.map((b) => `${b.key} ${b.to}`).join(', ')}` : 'Up to date.');
  process.exit(0);
}

// Snapshot the committed data before re-syncing, to diff against.
function committed(path) {
  try {
    return JSON.parse(git(['-C', ROOT, 'show', `HEAD:${path}`]));
  } catch {
    return null;
  }
}
const before = {
  wordpress: committed('data/wordpress/blocks.json'),
  woocommerce: committed('data/woocommerce/blocks.json'),
  templates: committed('data/woocommerce/templates.json'),
  theme: committed('data/wordpress/theme-defaults.json'),
};

for (const b of bumps) sources[b.key].tag = b.to;
writeFile(sourcesPath, JSON.stringify(sources, null, 2) + '\n');

const run = (script) => execFileSync(process.execPath, [join(ROOT, 'scripts', script)], { stdio: 'inherit' });
run('sync.mjs');
run('build.mjs');
run('validate.mjs');

const after = {
  wordpress: readJson(join(DATA, 'wordpress/blocks.json')),
  woocommerce: readJson(join(DATA, 'woocommerce/blocks.json')),
  templates: readJson(join(DATA, 'woocommerce/templates.json')),
  theme: readJson(join(DATA, 'wordpress/theme-defaults.json')),
};

const stable = (v) => JSON.stringify(v);

function diffBlocks(oldSet, newSet) {
  const oldMap = new Map((oldSet?.blocks ?? []).map((b) => [b.name, b]));
  const newMap = new Map(newSet.blocks.map((b) => [b.name, b]));
  const added = [...newMap.keys()].filter((n) => !oldMap.has(n));
  const removed = [...oldMap.keys()].filter((n) => !newMap.has(n));
  const changed = [];
  for (const [name, nb] of newMap) {
    const ob = oldMap.get(name);
    if (!ob) continue;
    const parts = [];
    const oldAttrs = Object.keys(ob.attributes);
    const newAttrs = Object.keys(nb.attributes);
    const attrAdded = newAttrs.filter((a) => !oldAttrs.includes(a));
    const attrRemoved = oldAttrs.filter((a) => !newAttrs.includes(a));
    const attrChanged = newAttrs.filter((a) => oldAttrs.includes(a) && stable(ob.attributes[a]) !== stable(nb.attributes[a]));
    if (attrAdded.length) parts.push(`属性の追加: ${attrAdded.map((a) => `\`${a}\``).join(' ')}`);
    if (attrRemoved.length) parts.push(`属性の削除: ${attrRemoved.map((a) => `\`${a}\``).join(' ')}`);
    if (attrChanged.length) parts.push(`属性の変更: ${attrChanged.map((a) => `\`${a}\``).join(' ')}`);
    if (stable(ob.supports) !== stable(nb.supports)) parts.push('supports(スタイルで変えられること)の変更');
    if (stable(ob.styles) !== stable(nb.styles)) parts.push('ブロックスタイルの変更');
    if (stable([ob.parent, ob.ancestor, ob.allowedBlocks]) !== stable([nb.parent, nb.ancestor, nb.allowedBlocks])) parts.push('置ける場所・中に置くブロックの変更');
    if (ob.title !== nb.title || ob.description !== nb.description) parts.push('名前・説明の変更');
    if (parts.length) changed.push({ name, parts });
  }
  return { added, removed, changed };
}

const lines = [];
const title = `chore: ${bumps.map((b) => `${b.key === 'wordpress' ? 'WordPress' : 'WooCommerce'} ${b.to}`).join(' / ')} に更新`;
lines.push(`## ${bumps.map((b) => `${b.key === 'wordpress' ? 'WordPress' : 'WooCommerce'} ${b.from} → ${b.to}`).join('、')}`, '');
lines.push('`scripts/check-updates.mjs` が新しいリリースを見つけ、同期とビルドをやり直した。デザインシステムへの反映(公開)は、この PR をマージしたあと `PUBLISHING.md` の手順で行う。', '');

for (const key of ['wordpress', 'woocommerce']) {
  const d = diffBlocks(before[key], after[key]);
  const label = key === 'wordpress' ? 'WordPress のブロック' : 'WooCommerce のブロック';
  if (!d.added.length && !d.removed.length && !d.changed.length) {
    lines.push(`### ${label}`, '', '変更なし。', '');
    continue;
  }
  lines.push(`### ${label}`, '');
  if (d.added.length) lines.push(`- **追加(${d.added.length})**: ${d.added.map((n) => `\`${n}\`(${componentName(n)})`).join('、')}`);
  if (d.removed.length) lines.push(`- **削除(${d.removed.length})**: ${d.removed.map((n) => `\`${n}\``).join('、')} — デザインシステムからも部品が消える。使っている案件が無いか確認する`);
  for (const c of d.changed) lines.push(`- \`${c.name}\`: ${c.parts.join('、')}`);
  lines.push('');
}

const tplChanged = Object.keys({ ...(before.templates?.templates ?? {}), ...after.templates.templates }).filter(
  (k) => stable(before.templates?.templates?.[k]) !== stable(after.templates.templates[k]),
);
lines.push('### WooCommerce のテンプレート構成', '', tplChanged.length ? tplChanged.map((k) => `- \`${k}\` の構成が変わった`).join('\n') : '変更なし。', '');

const themeKeys = ['settings', 'styles'].filter((k) => stable(before.theme?.[k]) !== stable(after.theme[k]));
lines.push('### WordPress の theme.json の既定値', '', themeKeys.length ? `\`${themeKeys.join('`・`')}\` が変わった。余白・影・縦横比のトークンが変わっていないか \`dist/project/tokens.json\` を確認する。` : '変更なし。', '');

lines.push('### 確認すること', '');
lines.push('- [ ] 追加されたブロックで、よく使うもの(商品一覧・カート・チェックアウトまわり)に再現プレビュー(`src/previews/`)が要るか');
lines.push('- [ ] 削除・名前変更されたブロックが `src/previews/`・`src/notes/`・README の本文で使われていないか(`npm run build` が失敗していれば該当)');
lines.push('- [ ] テンプレート構成の変更が、README と「WooCommerce のページ」の説明と食い違っていないか');
lines.push('- [ ] `python3 scripts/render-check.py` でプレビューが崩れていないか(任意)');

writeFile(join(DIST, 'update-summary.md'), lines.join('\n') + '\n');
output('updated', 'true');
output('title', title);
output('branch', `update/${bumps.map((b) => `${b.key}-${b.to}`).join('-')}`);
console.log(readFileSync(join(DIST, 'update-summary.md'), 'utf8'));
