// Build the Design System's files under dist/project/ from data/ (synced from the
// WordPress and WooCommerce release tags) and src/ (hand-written tokens, prose,
// previews and notes). Nothing here talks to the network.
//
//   node scripts/build.mjs
//
// dist/project/ mirrors the `project/` folder of the "FSE基盤" Design System artifact;
// dist/publish-plan.json lists the files in batches for publishing (see PUBLISHING.md).
// The artifact's index (project/design-system.json) is NOT built here: it is read back
// from the artifact and rewritten at publish time.

import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { DATA, DIST, SRC, componentName, readJson, writeFile } from './lib.mjs';

const OUT = join(DIST, 'project');
rmSync(DIST, { recursive: true, force: true });

const versions = readJson(join(DATA, 'versions.json'));
const wp = readJson(join(DATA, 'wordpress/blocks.json'));
const woo = readJson(join(DATA, 'woocommerce/blocks.json'));
const themeDefaults = readJson(join(DATA, 'wordpress/theme-defaults.json'));
const wooTemplates = readJson(join(DATA, 'woocommerce/templates.json'));
const groups = readJson(join(SRC, 'groups.json'));
const base = readJson(join(SRC, 'tokens.base.json'));

const files = new Map(); // path under project/ -> text
const put = (path, text) => files.set(path, text);

// ---------------------------------------------------------------- tokens

function round2(n) {
  return Math.round(n * 100) / 100;
}

// WordPress's own algorithm for settings.spacing.spacingScale
// (WP_Theme_JSON::set_spacing_sizes): slugs 10*(i+2), medium step in the middle.
function spacingScale(scale) {
  const { operator, increment, steps, mediumStep, unit } = scale;
  const mid = Math.round(steps / 2);
  const below = [];
  let v = mediumStep;
  for (let i = 0; i < mid - 1; i++) {
    v = operator === '+' ? v - increment : v / increment;
    below.unshift(round2(v));
  }
  const above = [];
  v = mediumStep;
  for (let i = 0; i < steps - mid; i++) {
    v = operator === '+' ? v + increment : v * increment;
    above.push(round2(v));
  }
  const names = ['2X-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', '2X-Large'];
  return [...below, mediumStep, ...above].map((value, i) => ({
    slug: String((i + 2) * 10),
    name: names[i + (names.length - steps) / 2] ?? String((i + 2) * 10),
    size: `${value}${unit}`,
  }));
}

const spacing = spacingScale(themeDefaults.settings.spacing.spacingScale);
const coreBlockGap = themeDefaults.styles?.spacing?.blockGap ?? '24px';
const shadows = themeDefaults.settings.shadow?.presets ?? [];
const ratios = themeDefaults.settings.dimensions?.aspectRatios ?? [];

const tokens = {
  name: base.name,
  version: base.version,
  meta: {
    source: 'github',
    repo: 'shinobiashi/fse-design-system',
    upstream: { wordpress: `${wp.repo}@${versions.wordpress}`, woocommerce: `${woo.repo}@${versions.woocommerce}` },
    paths: {
      tokens: ['src/tokens.base.json', 'data/wordpress/theme-defaults.json'],
      components: ['data/wordpress/blocks.json', 'data/woocommerce/blocks.json', 'src/previews/', 'src/notes/'],
      docs: ['src/README.md', 'src/sections/'],
    },
    synced: new Date().toISOString().slice(0, 10),
  },
  color: base.color,
  type: base.type,
  spacing: {
    note: `WordPress ${versions.wordpress} の settings.spacing.spacingScale から算出(トークン spacing-50 ⇄ var(--wp--preset--spacing--50))。WordPress を更新すると再計算される。`,
    tokens: [
      ...spacing.map((s) => ({
        name: `spacing-${s.slug}`,
        value: s.size,
        usage: spacingUsage(s.slug),
      })),
      { name: 'block-gap', value: '1.5rem', usage: `ブロック同士の既定の間隔(styles.spacing.blockGap)。WordPress の既定は ${coreBlockGap}。和文は行間が広いので 1.5rem(= spacing-50)に合わせる。` },
    ],
  },
  radius: base.radius,
  shadow: {
    note: `WordPress ${versions.wordpress} の既定の影プリセット(トークン shadow-natural ⇄ var(--wp--preset--shadow--natural))。`,
    tokens: shadows.map((s) => ({ name: `shadow-${s.slug}`, value: s.shadow, usage: shadowUsage(s.slug) })),
  },
  layout: base.layout,
  'aspect-ratio': {
    note: `WordPress ${versions.wordpress} の既定の縦横比(settings.dimensions.aspectRatios)。画像・カバー・商品画像の比率はここから選ぶ。`,
    tokens: ratios.map((r) => ({ name: `ratio-${r.slug}`, value: r.ratio, usage: `${r.name}。${ratioUsage(r.slug)}` })),
  },
};

function spacingUsage(slug) {
  return (
    {
      20: 'ラベルと値・アイコンと文字など、密接した要素の間。',
      30: 'ボタン同士・フォームの行間・カード内の要素の間。',
      40: 'カードの内側の余白・スマホでの左右の余白。',
      50: 'ブロック同士の既定の間隔(block-gap と同じ)。',
      60: 'セクション内の大きなまとまりの間・PC のカラム間。',
      70: 'スマホでのセクションの上下の余白。',
      80: 'PC でのセクションの上下の余白。',
    }[slug] ?? ''
  );
}
function shadowUsage(slug) {
  return (
    {
      natural: 'ミニカートの引き出し・ドロップダウン。ふだんの影はこれだけにする。',
      deep: 'モーダルなど、ページから大きく浮かせる要素。',
      sharp: '平面的なデザインでのカード。',
      outlined: '輪郭を二重にする装飾。使う場面は限る。',
      crisp: '強い印象のバナー。使う場面は限る。',
    }[slug] ?? ''
  );
}
function ratioUsage(slug) {
  return (
    {
      square: '商品画像・カテゴリのタイルの既定。',
      '4-3': 'お知らせ・ブログのアイキャッチ。',
      '3-4': 'アパレル・人物の商品画像。',
      '3-2': '施工事例・作品の写真。',
      '2-3': '縦長のバナー。',
      '16-9': 'カバー・動画。',
      '9-16': 'スマホ向けの縦長の動画。',
    }[slug] ?? ''
  );
}

put('tokens.json', JSON.stringify(tokens, null, 2) + '\n');

// ---------------------------------------------------------------- bundle.css

function resolveColor(value, all) {
  const m = /^\{(.+)\}$/.exec(value);
  if (!m) return value;
  return resolveColor(all.find((t) => t.name === m[1]).value, all);
}

function bundleCss() {
  const colors = base.color.tokens;
  const styles = base.type.groups.flatMap((g) => g.styles);
  const lines = [];
  lines.push("@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@500;700&display=swap');");
  lines.push('/* GENERATED by scripts/build.mjs — theme.json preset variables mapped to this system\'s tokens. */');
  lines.push(':root {');
  for (const c of colors) lines.push(`  --wp--preset--color--${c.name}: var(--${c.name});`);
  for (const s of styles) lines.push(`  --wp--preset--font-size--${s.name}: ${s.fontSize};`);
  for (const key of Object.keys(base.type.families)) lines.push(`  --wp--preset--font-family--${key}: var(--font-${key});`);
  for (const s of spacing) lines.push(`  --wp--preset--spacing--${s.slug}: var(--spacing-${s.slug});`);
  for (const s of shadows) lines.push(`  --wp--preset--shadow--${s.slug}: var(--shadow-${s.slug});`);
  for (const r of base.radius.tokens) lines.push(`  --wp--custom--radius--${r.name.replace(/^radius-/, '')}: var(--${r.name});`);
  lines.push('  --wp--style--global--content-size: var(--content-size);');
  lines.push('  --wp--style--global--wide-size: var(--wide-size);');
  lines.push('  --wp--style--block-gap: var(--block-gap);');
  lines.push('}');
  for (const c of colors) {
    lines.push(`.has-${c.name}-color { color: var(--wp--preset--color--${c.name}) !important; }`);
    lines.push(`.has-${c.name}-background-color { background-color: var(--wp--preset--color--${c.name}) !important; }`);
    lines.push(`.has-${c.name}-border-color { border-color: var(--wp--preset--color--${c.name}) !important; }`);
  }
  for (const s of styles) lines.push(`.has-${s.name}-font-size { font-size: var(--wp--preset--font-size--${s.name}) !important; }`);
  for (const key of Object.keys(base.type.families)) lines.push(`.has-${key}-font-family { font-family: var(--wp--preset--font-family--${key}) !important; }`);
  lines.push('');
  return lines.join('\n') + readFileSync(join(SRC, 'bundle.base.css'), 'utf8');
}
put('components/bundle.css', bundleCss());

// ---------------------------------------------------------------- components

const SUPPORT_LABELS = {
  align: '配置幅(wide/full)',
  alignWide: '幅広',
  anchor: 'アンカー(id)',
  ariaLabel: 'aria-label',
  background: '背景画像',
  border: '枠線',
  className: '追加CSSクラス',
  color: '色',
  customClassName: '追加CSSクラス',
  dimensions: '寸法',
  filter: 'フィルター',
  html: 'HTML 編集',
  inserter: '挿入候補',
  interactivity: 'インタラクティビティ API',
  layout: 'レイアウト',
  lock: 'ロック',
  multiple: '複数配置',
  position: '位置(固定)',
  renaming: '名前の変更',
  reusable: '再利用',
  shadow: '影',
  spacing: '余白',
  typography: '文字',
  visibility: '表示の切り替え',
};

const SUB_LABELS = {
  background: '背景', text: '文字', link: 'リンク', gradients: 'グラデーション', heading: '見出し', button: 'ボタン', duotone: 'デュオトーン',
  fontSize: 'サイズ', lineHeight: '行間', fontFamily: '書体', fontWeight: '太さ', fontStyle: 'スタイル', letterSpacing: '字間',
  textTransform: '大文字化', textDecoration: '装飾', textAlign: '揃え', writingMode: '縦書き', textColumns: '段組み',
  margin: '外側', padding: '内側', blockGap: '要素間', radius: '角丸', width: '太さ', style: '線種',
  minHeight: '最小の高さ', aspectRatio: '縦横比', height: '高さ', backgroundImage: '画像', backgroundSize: 'サイズ',
  sticky: 'スクロール時に固定', allowSwitching: '種類の切り替え', allowEditing: '編集', allowInheriting: '親から継承',
  default: '既定', clientNavigation: 'ページ遷移の高速化', interactive: '対話的',
};

function cleanKey(k) {
  return k.replace(/^__experimental/, '').replace(/^./, (c) => c.toLowerCase());
}

// One readable line per support: "色: 背景・文字・リンク".
function describeSupports(supports) {
  const on = [];
  const off = [];
  for (const [rawKey, value] of Object.entries(supports)) {
    const key = cleanKey(rawKey);
    const label = SUPPORT_LABELS[key] ?? key;
    if (value === false) {
      off.push(label);
      continue;
    }
    if (Array.isArray(value)) {
      on.push({ label, detail: value.join(' / ') });
      continue;
    }
    if (value && typeof value === 'object') {
      const subs = Object.entries(value)
        .filter(([sk, sv]) => sv !== false && !sk.startsWith('__experimentalDefaultControls') && sk !== 'defaultControls' && sk !== '__experimentalSkipSerialization' && sk !== 'skipSerialization' && sk !== '__experimentalSelector' && sk !== 'selectors')
        .map(([sk, sv]) => {
          const k = cleanKey(sk);
          const l = SUB_LABELS[k] ?? k;
          if (k === 'default' && sv && typeof sv === 'object') return `既定 ${sv.type ?? ''}`.trim();
          return Array.isArray(sv) ? `${l}(${sv.join('/')})` : l;
        });
      on.push({ label, detail: subs.join('・') });
      continue;
    }
    on.push({ label, detail: '' });
  }
  return { on, off };
}

function tsType(def) {
  const t = def.enum
    ? def.enum.map((v) => JSON.stringify(v)).join(' | ')
    : [def.type ?? 'unknown']
        .flat()
        .map((x) => ({ string: 'string', 'rich-text': 'string', number: 'number', integer: 'number', boolean: 'boolean', array: 'unknown[]', object: 'Record<string, unknown>', null: 'null' })[x] ?? 'unknown')
        .join(' | ');
  return t || 'unknown';
}

function wrapperClass(block) {
  if (block.supports.className === false) return null;
  const [ns, slug] = block.name.split('/');
  return ns === 'core' ? `wp-block-${slug}` : `wp-block-${ns}-${slug}`;
}

function groupOf(block) {
  const [ns, slug] = block.name.split('/');
  if (ns === 'core') return groups.core[block.category] ?? 'Core · その他';
  for (const [re, label] of groups.woocommerce) if (new RegExp(re).test(slug)) return label;
  return 'Woo · その他';
}

const allBlocks = [
  ...wp.blocks.map((b) => ({ ...b, source: `WordPress ${versions.wordpress}` })),
  ...woo.blocks.map((b) => ({ ...b, source: `WooCommerce ${versions.woocommerce}` })),
];
const byName = new Map(allBlocks.map((b) => [b.name, b]));
const comps = new Map(); // component -> block
for (const b of allBlocks) {
  const comp = componentName(b.name);
  if (comps.has(comp)) throw new Error(`Component name collision: ${comp} (${comps.get(comp).name}, ${b.name})`);
  comps.set(comp, b);
}

// Which blocks list this one as a parent/ancestor: its children, for the README.
const childrenOf = new Map();
for (const b of allBlocks) {
  for (const p of [...(b.parent ?? []), ...(b.ancestor ?? [])]) {
    if (!childrenOf.has(p)) childrenOf.set(p, []);
    childrenOf.get(p).push(b.name);
  }
}

const blockLink = (name) => (byName.has(name) ? `\`${name}\`(${componentName(name)})` : `\`${name}\``);
const md = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');

function componentReadme(comp, block) {
  const { on, off } = describeSupports(block.supports);
  const notePath = join(SRC, 'notes', `${block.name.replace('/', '__')}.md`);
  const note = existsSync(notePath) ? readFileSync(notePath, 'utf8').trim() : null;
  const inserterOff = block.supports.inserter === false;
  const desc = block.description ? block.description.replace(/\s+/g, ' ').trim() : '(説明なし)';
  const lines = [];
  lines.push(`# ${comp}`, '');
  lines.push(`${block.title}(\`${block.name}\`)— ${desc}${/[.。)]$/.test(desc) ? '' : '.'}`, '');
  lines.push('| 項目 | 内容 |', '|---|---|');
  lines.push(`| ブロック名 | \`${block.name}\` |`);
  lines.push(`| 提供元 | ${block.source}(\`${block.origin}\`) |`);
  lines.push(`| 描画 | ${block.dynamic ? '動的(サーバーで HTML を作る。デザインでは見た目だけを決め、中身はダミーでよい)' : '静的(保存された HTML がそのまま出る)'} |`);
  const parents = [...(block.parent ?? []), ...(block.ancestor ?? [])];
  lines.push(`| 置ける場所 | ${parents.length ? `${block.parent ? '親' : '祖先'}: ${parents.map(blockLink).join('、')} の中だけ` : 'どこでも'} |`);
  const kids = [...new Set([...(block.allowedBlocks ?? []), ...(childrenOf.get(block.name) ?? [])])];
  if (kids.length) lines.push(`| 中に置くブロック | ${kids.map(blockLink).join('、')} |`);
  if (inserterOff) lines.push('| 挿入候補 | エディターの挿入候補に出ない(親ブロックやテンプレートが自動で置く。単独では使わない) |');
  const wc = wrapperClass(block);
  lines.push(`| 外側のクラス | ${wc ? `\`.${wc}\`(WordPress が付ける。WooCommerce のブロックは中身に独自のクラスも持つ)` : '付かない(supports.className が false)'} |`);
  if (block.usesContext.length) lines.push(`| 受け取る文脈 | ${block.usesContext.map((c) => `\`${c}\``).join('、')} |`);
  lines.push('');

  lines.push('## スタイルで変えられること', '');
  lines.push('ブロックの supports。ここに無い見た目は、theme.json(styles.blocks)かテーマの CSS でしか変えられない。', '');
  if (on.length) for (const s of on) lines.push(`- ${s.label}${s.detail ? `: ${s.detail}` : ''}`);
  else lines.push('- (エディターで変えられる項目は無い)');
  if (off.length) lines.push(`- 無効: ${off.join('、')}`);
  lines.push('');

  if (block.styles.length) {
    lines.push('## ブロックスタイル', '');
    for (const s of block.styles) lines.push(`- \`is-style-${s.name}\` — ${s.label}${s.isDefault ? '(既定)' : ''}`);
    lines.push('');
  }

  const attrs = Object.entries(block.attributes);
  if (attrs.length) {
    lines.push('## 属性', '', '| 属性 | 型 | 既定値 | 選択肢 |', '|---|---|---|---|');
    for (const [k, def] of attrs) {
      const type = [def.type ?? ''].flat().join(' / ');
      const dflt = def.default === undefined ? '' : `\`${md(JSON.stringify(def.default))}\``;
      const choices = def.enum ? def.enum.map((v) => `\`${md(JSON.stringify(v))}\``).join(' ') : '';
      lines.push(`| \`${k}\` | ${md(type)} | ${dflt} | ${choices} |`);
    }
    lines.push('');
  }

  lines.push('## デザインでの扱い', '');
  if (note) lines.push(note, '');
  else
    lines.push(
      `- このブロックを表す要素には \`data-wp-block="${block.name}"\` を付ける(テーマ化のときの対応付けに使う)。`,
      '- 色・文字サイズ・余白はスタイルで変えられる項目の範囲で、プリセット変数(`var(--wp--preset--…)`)だけを使う。',
      '',
    );
  return lines.join('\n');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function specPreview(block, group) {
  const { on, off } = describeSupports(block.supports);
  const wc = wrapperClass(block);
  const parents = [...(block.parent ?? []), ...(block.ancestor ?? [])];
  const chips = [
    ...on.map((s) => `<li>${escapeHtml(s.label)}</li>`),
    ...off.map((l) => `<li class="is-off">${escapeHtml(l)}</li>`),
  ].join('');
  const where = parents.length ? `${escapeHtml(parents.join(', '))} の中` : 'どこでも';
  const height = 200 + Math.ceil((on.length + off.length) / 6) * 26 + (block.description.length > 90 ? 22 : 0);
  return `<!-- @dsCard group="${group}" height=${height} floor static subtitle="仕様カード(見た目の再現なし)" -->
<div class="ds-spec">
  <div class="ds-spec__head">
    <h3 class="ds-spec__title">${escapeHtml(block.title)}</h3>
    <span class="ds-spec__name">${escapeHtml(block.name)}</span>
  </div>
  <div class="ds-spec__box">
    <div>外側のクラス: <code class="ds-spec__class">${wc ? '.' + escapeHtml(wc) : '(なし)'}</code></div>
    <div>置ける場所: ${where}　/　描画: ${block.dynamic ? '動的' : '静的'}${block.supports.inserter === false ? '　/　挿入候補に出ない' : ''}</div>
  </div>
  <ul class="ds-spec__chips">${chips || '<li class="is-off">スタイルの項目なし</li>'}</ul>
  <p class="ds-spec__meta">${escapeHtml(block.description || '(説明なし)')}</p>
</div>
`;
}

const previewsDir = join(SRC, 'previews');
const handPreviews = new Set(existsSync(previewsDir) ? readdirSync(previewsDir).map((f) => f.replace(/\.html$/, '')) : []);
for (const p of handPreviews) if (!comps.has(p)) throw new Error(`src/previews/${p}.html does not match any block component`);

const dts = ['// GENERATED by scripts/build.mjs from block.json attributes. Documentation only: these are the', '// block attributes (the JSON inside <!-- wp:… -->), not React props.', ''];
const catalogue = [];
for (const [comp, block] of [...comps.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
  const group = groupOf(block);
  put(`components/${comp}/README.md`, componentReadme(comp, block));
  let preview;
  if (handPreviews.has(comp)) {
    preview = readFileSync(join(previewsDir, `${comp}.html`), 'utf8');
    preview = preview.replace(/^<!-- @dsCard /, `<!-- @dsCard group="${group}" `);
  } else {
    preview = specPreview(block, group);
  }
  put(`components/${comp}/preview.html`, preview);
  const attrs = Object.entries(block.attributes);
  dts.push(`/** ${block.title} — \`${block.name}\` (${block.source}) */`);
  dts.push(`export interface ${comp}Props {`);
  for (const [k, def] of attrs) {
    const doc = def.default !== undefined ? ` /** 既定値: ${JSON.stringify(def.default).replace(/\*\//g, '* /')} */` : '';
    dts.push(`  ${/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)}?: ${tsType(def)};${doc}`);
  }
  dts.push('}', '');
  catalogue.push({ comp, block, group, rich: handPreviews.has(comp) });
}

// ---------------------------------------------------------------- omotegae patterns
//
// One component per ACTIVE pattern of omotegae's library (data/omotegae/patterns.json,
// imported from the admin screen's JSON export). Drafts and deprecated patterns are
// only listed in the 06 section: a design never starts from them.

const patternDoc = readJson(join(DATA, 'omotegae/patterns.json'));
const patternProvisional = String(patternDoc.appVersion ?? '').startsWith('seed');
const categoryLabel = new Map(patternDoc.categories.map((c) => [c.slug, c.label]));
const shortLabel = (slug) => (categoryLabel.get(slug) ?? slug).split('(')[0];
const TONE_LABELS = {
  classic: 'クラシック', modern: 'モダン', soft: 'やわらか', sharp: 'シャープ',
  simple: 'シンプル', rich: 'リッチ', calm: '落ち着いた', vivid: '鮮やか',
};
const STATUS_LABELS = { active: '公開', draft: '下書き', deprecated: '非推奨' };
const patternPreviewsDir = join(SRC, 'pattern-previews');
const handPatternPreviews = new Set(existsSync(patternPreviewsDir) ? readdirSync(patternPreviewsDir).map((f) => f.replace(/\.html$/, '')) : []);

function patternComponentName(slug) {
  return 'Pattern' + slug.split('-').map((p) => p[0].toUpperCase() + p.slice(1)).join('');
}

function patternReadme(comp, p) {
  const lines = [];
  lines.push(`# ${comp}`, '');
  lines.push(`omotegae のパターン「${p.title}」(\`${p.slug}\`)— ${p.description}`, '');
  lines.push('| 項目 | 内容 |', '|---|---|');
  lines.push(`| パターン | \`${p.slug}\`(版 ${p.version ?? '?'}) |`);
  lines.push(`| カテゴリ | ${categoryLabel.get(p.category) ?? p.category}(\`${p.category}\`) |`);
  lines.push(`| トーン | ${p.toneTags.length ? p.toneTags.map((t) => `${TONE_LABELS[t] ?? t}(\`${t}\`)`).join('、') : '(指定なし)'} |`);
  lines.push(`| WooCommerce | ${p.requiresWoocommerce ? '必要(WooCommerce を使う案件だけで選ばれる)' : '不要'} |`);
  lines.push('');
  lines.push('## 使うブロック', '');
  // block_map is a flat list of block names: it carries neither nesting nor how many
  // times a block repeats, so it must not read as a construction recipe.
  lines.push(
    'omotegae の `block_map` に載っているブロックの一覧。順番・入れ子・数は表さないので、組み立ての手順として読まない。' +
      '何を何の中に入れ、いくつ並べるかは、冒頭の説明と「入れる文言」の項目から決める(`member_1_…`〜`member_3_…` があれば 3 つ並べる、など)。' +
      'セクション全体は全幅の `core/group`(`data-pattern` 付き)で包む。',
    '',
  );
  for (const b of p.blocks) lines.push(`- ${blockLink(b)}`);
  lines.push('');
  lines.push('## 入れる文言', '');
  lines.push('ブリーフの `sections[].content` に入る項目。文字数は上限で、超えるとブリーフが確定できない。デザインでもこの長さで収まるようにする。', '');
  lines.push('| 項目 | 内容 | 上限 | 必須 |', '|---|---|---|---|');
  for (const f of p.fields) {
    const limit = f.maxLength !== null ? `${f.maxLength} 字` : f.enum ? f.enum.map((v) => `\`${v}\``).join(' / ') : '';
    lines.push(`| \`${f.name}\` | ${md(f.label || '(説明なし)')} | ${limit} | ${f.required ? '必須' : ''} |`);
  }
  lines.push('');
  lines.push('## マークアップ', '');
  lines.push('```html');
  lines.push(`<section class="wp-block-group alignfull has-global-padding is-layout-constrained"`);
  lines.push(`         data-wp-block="core/group" data-pattern="${p.slug}">`);
  lines.push('  <!-- 中身は「使うブロック」から、説明と「入れる文言」の項目に合わせて組む -->');
  lines.push('</section>');
  lines.push('```', '');
  lines.push('- 文言はブリーフの値をそのまま入れる。足りない項目(必須でない空欄)は、その要素ごと出さない。');
  lines.push('- 色・余白・文字サイズはプリセット変数だけで書き、案件の色はトークンの差し替えで出す(「案件ごとの差し替え」)。');
  lines.push('');
  return lines.join('\n');
}

function patternSpecPreview(comp, p, group) {
  const blocks = p.blocks
    .map((b) => `<li class="ds-pattern__block"><code>${escapeHtml(b)}</code><span class="ds-pattern__comp">${byName.has(b) ? escapeHtml(componentName(b)) : ''}</span></li>`)
    .join('');
  const fields = p.fields
    .map((f) => `<li${f.required ? ' class="is-required"' : ''}>${escapeHtml(f.label || f.name)}${f.maxLength !== null ? ` <span>${f.maxLength}字</span>` : ''}</li>`)
    .join('');
  const height = 262 + p.blocks.length * 34 + Math.ceil(p.fields.length / 3) * 28;
  return `<!-- @dsCard group="${group}" height=${height} floor static subtitle="仕様カード(見た目の再現なし)" -->
<div class="ds-spec ds-pattern">
  <div class="ds-spec__head">
    <h3 class="ds-spec__title">${escapeHtml(p.title)}</h3>
    <span class="ds-spec__name">${escapeHtml(p.slug)}</span>
  </div>
  <p class="ds-spec__meta">${escapeHtml(p.description)}</p>
  <p class="ds-spec__meta">使うブロック(順番・入れ子・数は表さない)</p>
  <ul class="ds-pattern__blocks">${blocks}</ul>
  <ul class="ds-spec__chips">${fields}</ul>
  <p class="ds-spec__meta">トーン: ${escapeHtml(p.toneTags.map((t) => TONE_LABELS[t] ?? t).join('・') || 'なし')}${p.requiresWoocommerce ? '　/　WooCommerce が必要' : ''}　/　太字の項目は必須</p>
</div>
`;
}

const activePatterns = patternDoc.patterns.filter((p) => p.status === 'active');
const patternComps = new Map(); // component -> slug
for (const p of activePatterns) {
  const comp = patternComponentName(p.slug);
  if (comps.has(comp) || comp === 'Cover') throw new Error(`Pattern component name collides with a block component: ${comp} (${p.slug})`);
  if (patternComps.has(comp)) throw new Error(`Patterns ${patternComps.get(comp)} and ${p.slug} both map to the component name ${comp}`);
  patternComps.set(comp, p.slug);
  const group = `omotegae · ${shortLabel(p.category)}`;
  put(`components/${comp}/README.md`, patternReadme(comp, p));
  const preview = handPatternPreviews.has(comp)
    ? readFileSync(join(patternPreviewsDir, `${comp}.html`), 'utf8').replace(/^<!-- @dsCard /, `<!-- @dsCard group="${group}" `)
    : patternSpecPreview(comp, p, group);
  put(`components/${comp}/preview.html`, preview);
  dts.push(`/** パターン「${p.title}」 — \`${p.slug}\`(omotegae)。ブリーフの sections[].content の項目 */`);
  dts.push(`export interface ${comp}Props {`);
  for (const f of p.fields) {
    const type = tsType({ type: f.type ?? undefined, enum: f.enum ?? undefined });
    const doc = [f.label, f.maxLength !== null ? `${f.maxLength} 字まで` : ''].filter(Boolean).join('・');
    if (doc) dts.push(`  /** ${doc.replace(/\*\//g, '* /')} */`);
    dts.push(`  ${/^[A-Za-z_$][\w$]*$/.test(f.name) ? f.name : JSON.stringify(f.name)}${f.required ? '' : '?'}: ${type};`);
  }
  dts.push('}', '');
}
for (const p of handPatternPreviews) {
  if (!activePatterns.some((a) => patternComponentName(a.slug) === p)) throw new Error(`src/pattern-previews/${p}.html does not match any active pattern`);
}

put('components/index.d.ts', dts.join('\n'));

// ---------------------------------------------------------------- README and sections

function fill(text) {
  return text
    .replaceAll('{{wordpress}}', versions.wordpress)
    .replaceAll('{{woocommerce}}', versions.woocommerce)
    .replaceAll('{{coreBlocks}}', String(wp.blocks.length))
    .replaceAll('{{wooBlocks}}', String(woo.blocks.length))
    .replaceAll('{{richPreviews}}', String(catalogue.filter((c) => c.rich).length))
    .replaceAll('{{activePatterns}}', String(activePatterns.length))
    .replaceAll('{{spacingTable}}', spacing.map((s) => `| \`spacing-${s.slug}\` | \`var(--wp--preset--spacing--${s.slug})\` | ${s.size} |`).join('\n'));
}

put('README.md', fill(readFileSync(join(SRC, 'README.md'), 'utf8')));
for (const f of readdirSync(join(SRC, 'sections')).sort()) {
  if (f.endsWith('.md')) put(f, fill(readFileSync(join(SRC, 'sections', f), 'utf8')));
}

// WooCommerce's block templates, as trees: generated so a WooCommerce update rewrites it.
function templateTree(nodes, depth = 0) {
  const out = [];
  for (const n of nodes) {
    const attrs = Object.entries(n.attrs)
      .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join(' ');
    const comp = byName.has(n.name) ? ` → ${componentName(n.name)}` : '';
    out.push(`${'  '.repeat(depth)}- \`${n.name}\`${attrs ? ` (${attrs})` : ''}${comp}`);
    out.push(...templateTree(n.children, depth + 1));
  }
  return out;
}
const TEMPLATE_LABELS = {
  'templates/single-product': '商品詳細(single-product)',
  'templates/archive-product': '商品一覧・カテゴリ(archive-product)',
  'templates/taxonomy-product_attribute': '属性での一覧(taxonomy-product_attribute)',
  'templates/product-search-results': '商品の検索結果(product-search-results)',
  'templates/page-cart': 'カート(page-cart)',
  'templates/page-checkout': 'チェックアウト(page-checkout)',
  'templates/order-confirmation': '注文完了(order-confirmation)',
  'templates/coming-soon': '準備中(coming-soon)',
};
{
  const lines = [
    '# WooCommerce のテンプレート構成',
    '',
    `WooCommerce ${versions.woocommerce} がブロックテーマ向けに持つテンプレート(\`templates/templates/blockified/\`)とテンプレートパーツのブロック構成。`,
    'ページのデザインは、この並びと入れ子を崩さない範囲で考える。順番の入れ替えや要素の追加は、テーマ側のテンプレートで上書きすれば可能だが、カートとチェックアウトの中身(Cart・Checkout ブロックの内側)は WooCommerce が組み立てるので、見た目(色・文字・余白・角丸)だけを変える。',
    '',
    'この節は WooCommerce を更新するたびに自動で作り直される。',
    '',
  ];
  const keys = Object.keys(wooTemplates.templates).sort((a, b) => {
    const ia = Object.keys(TEMPLATE_LABELS).indexOf(a);
    const ib = Object.keys(TEMPLATE_LABELS).indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  for (const key of keys) {
    lines.push(`## ${TEMPLATE_LABELS[key] ?? key}`, '', ...templateTree(wooTemplates.templates[key]), '');
  }
  put('04-woocommerce-templates.md', lines.join('\n'));
}

// Inventory of every block, generated.
{
  const lines = [
    '# ブロック一覧と対応状況',
    '',
    `WordPress ${versions.wordpress}(${wp.blocks.length} ブロック)と WooCommerce ${versions.woocommerce}(${woo.blocks.length} ブロック)。「再現」は見た目を再現したプレビューがあるもの、「仕様」は仕様カードだけのもの。`,
    '',
  ];
  const byGroup = new Map();
  for (const c of catalogue) {
    if (!byGroup.has(c.group)) byGroup.set(c.group, []);
    byGroup.get(c.group).push(c);
  }
  for (const [group, list] of [...byGroup.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    lines.push(`## ${group}`, '', '| 部品 | ブロック | プレビュー | 描画 | 挿入候補 |', '|---|---|---|---|---|');
    for (const c of list) {
      lines.push(`| ${c.comp} | \`${c.block.name}\` | ${c.rich ? '再現' : '仕様'} | ${c.block.dynamic ? '動的' : '静的'} | ${c.block.supports.inserter === false ? '出ない' : '出る'} |`);
    }
    lines.push('');
  }
  put('05-block-inventory.md', lines.join('\n'));
}

// The whole omotegae library, generated: every status, grouped by category in the
// form's order (the export's `categories`), retired categories last.
{
  const lines = [
    '# omotegae のパターン',
    '',
    `omotegae のパターンライブラリ(書き出し日時 ${patternDoc.exportedAt ?? '不明'}、omotegae ${patternDoc.appVersion ?? '?'})。` +
      `公開中の ${activePatterns.length} 件はそれぞれ部品(\`Pattern…\`)になっている。トップページのセクションは、ブリーフが指定したパターンの部品に従って組む。`,
    '',
  ];
  if (patternProvisional) {
    lines.push('> **仮のデータ**: いまの内容は omotegae の初期データ(`PatternSeeder`)から作った仮のもの。本番の管理画面から書き出した JSON で置き換えると、この注意は消える。', '');
  }
  lines.push(
    '下書きと非推奨のパターンは部品にしていない。非推奨のパターンは、確定済みの古いブリーフにだけ現れることがある。',
    '',
    'この節は、omotegae から書き出した JSON を取り込むたびに自動で作り直される。',
    '',
  );
  const order = patternDoc.categories.map((c) => c.slug);
  const cats = [...new Set(patternDoc.patterns.map((p) => p.category))].sort(
    (a, b) => (order.indexOf(a) < 0 ? 99 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 99 : order.indexOf(b)) || a.localeCompare(b),
  );
  for (const cat of cats) {
    lines.push(`## ${categoryLabel.get(cat) ?? `${cat}(廃止されたカテゴリ)`}`, '', '| パターン | 名前 | 状態 | 部品 | 使うブロック |', '|---|---|---|---|---|');
    for (const p of patternDoc.patterns.filter((x) => x.category === cat)) {
      const comp = p.status === 'active' ? patternComponentName(p.slug) : '—';
      lines.push(`| \`${p.slug}\` | ${md(p.title)} | ${STATUS_LABELS[p.status] ?? p.status} | ${comp} | ${p.blocks.map((b) => `\`${b}\``).join('、')} |`);
    }
    lines.push('');
  }
  put('06-omotegae-patterns.md', lines.join('\n'));
}

// ---------------------------------------------------------------- cover

{
  const cover = readFileSync(join(SRC, 'cover.html'), 'utf8')
    .replaceAll('{{wordpress}}', versions.wordpress.split('.').slice(0, 2).join('.'))
    .replaceAll('{{woocommerce}}', versions.woocommerce.split('.').slice(0, 2).join('.'));
  put('components/Cover/preview.html', cover);
}

// ---------------------------------------------------------------- write

for (const [path, text] of files) writeFile(join(OUT, path), text);

// Publish batches: at most 255 paths per publish call. The index goes in its own last call.
const paths = [...files.keys()].sort((a, b) => {
  // tokens, bundle and docs first, then components, the cover last.
  const rank = (p) => (p.startsWith('components/Cover/') ? 3 : p.startsWith('components/') && p.split('/').length === 3 ? 2 : 1);
  return rank(a) - rank(b) || a.localeCompare(b);
});
const batches = [];
for (let i = 0; i < paths.length; i += 250) batches.push(paths.slice(i, i + 250).map((p) => `project/${p}`));
writeFile(join(DIST, 'publish-plan.json'), JSON.stringify({ total: paths.length, batches }, null, 2) + '\n');

console.log(`Built ${paths.length} files: ${comps.size} block components (${catalogue.filter((c) => c.rich).length} with renditions), ${activePatterns.length} pattern components, ${batches.length} publish batches.`);
