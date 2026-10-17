// Pull block definitions, core theme.json defaults and WooCommerce block templates
// from the release tags pinned in sources.json, and write them, normalized and
// deterministic, under data/. Run again after changing a tag; `git diff data/`
// then shows exactly what the release changed.
//
//   node scripts/sync.mjs

import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { CACHE, DATA, ROOT, readJson, sparseClone, stableStringify, writeFile } from './lib.mjs';

const sources = readJson(join(ROOT, 'sources.json'));

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

// Keep what a designer or a theme author needs; drop editor-only plumbing
// (source/selector of attributes, scripts, styles handles, examples).
function normalizeAttribute(def) {
  const out = {};
  if (def.type !== undefined) out.type = def.type;
  if (def.enum !== undefined) out.enum = def.enum;
  if (def.role !== undefined) out.role = def.role;
  if (def.default !== undefined) {
    const json = JSON.stringify(def.default);
    out.default = json.length <= 200 ? def.default : '(長い既定値は省略)';
  }
  return out;
}

function normalizeBlock(json, { dynamic, origin }) {
  const attributes = Object.fromEntries(
    Object.entries(json.attributes ?? {})
      .filter(([k, def]) => def && typeof def === 'object' && !k.startsWith('__'))
      .map(([k, def]) => [k, normalizeAttribute(def)]),
  );
  const block = {
    name: json.name,
    title: json.title ?? json.name,
    category: json.category ?? null,
    description: json.description ?? '',
    keywords: json.keywords ?? [],
    parent: json.parent ?? null,
    ancestor: json.ancestor ?? null,
    allowedBlocks: json.allowedBlocks ?? null,
    supports: json.supports ?? {},
    attributes,
    styles: (json.styles ?? []).map((s) => ({ name: s.name, label: s.label ?? s.name, isDefault: !!s.isDefault })),
    usesContext: json.usesContext ?? [],
    providesContext: Object.keys(json.providesContext ?? {}),
    dynamic,
    origin,
  };
  return block;
}

function syncWordPress() {
  const { repo, tag } = sources.wordpress;
  const dir = sparseClone(repo, tag, ['/src/wp-includes/blocks/', '/src/wp-includes/theme.json'], join(CACHE, `wordpress-${tag}`));
  const blocksDir = join(dir, 'src/wp-includes/blocks');
  const blocks = [];
  for (const name of readdirSync(blocksDir).sort()) {
    const jsonPath = join(blocksDir, name, 'block.json');
    if (!existsSync(jsonPath)) continue;
    const json = readJson(jsonPath);
    // A block with a server-side render callback ships <slug>.php beside its folder,
    // or names a render file in block.json.
    const dynamic = existsSync(join(blocksDir, `${name}.php`)) || !!json.render;
    blocks.push(normalizeBlock(json, { dynamic, origin: `src/wp-includes/blocks/${name}/block.json` }));
  }
  blocks.sort((a, b) => a.name.localeCompare(b.name));

  const themeJson = readJson(join(dir, 'src/wp-includes/theme.json'));
  writeFile(join(DATA, 'wordpress/blocks.json'), stableStringify({ version: tag, repo, blocks }));
  writeFile(
    join(DATA, 'wordpress/theme-defaults.json'),
    stableStringify({ version: tag, repo, schemaVersion: themeJson.version, settings: themeJson.settings, styles: themeJson.styles }),
  );
  return { tag, count: blocks.length };
}

// Block templates use the block grammar: <!-- wp:name {attrs} --> ... <!-- /wp:name -->
// and self-closing <!-- wp:name {attrs} /-->. Build the nesting tree; keep attrs that
// say how the block is laid out or which variant it is, drop the rest.
function parseTemplate(html) {
  const re = /<!--\s+(\/)?wp:([a-z0-9-]+(?:\/[a-z0-9-]+)?)(\s+(\{[\s\S]*?\}))?\s+(\/)?-->/g;
  const root = { children: [] };
  const stack = [root];
  let m;
  while ((m = re.exec(html))) {
    const [, closing, rawName, , attrJson, selfClosing] = m;
    const name = rawName.includes('/') ? rawName : `core/${rawName}`;
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    let attrs = {};
    if (attrJson) {
      try {
        attrs = JSON.parse(attrJson);
      } catch {
        attrs = {};
      }
    }
    const node = { name, attrs: summarizeAttrs(attrs), children: [] };
    stack.at(-1).children.push(node);
    if (!selfClosing) stack.push(node);
  }
  return root.children;
}

const KEPT_ATTRS = ['slug', 'tagName', 'align', 'layout', 'level', 'textAlign', 'className', 'namespace', 'collection', 'theme', 'area', 'columns', 'displayLayout'];

function summarizeAttrs(attrs) {
  const out = {};
  for (const k of KEPT_ATTRS) if (attrs[k] !== undefined) out[k] = attrs[k];
  return out;
}

function syncWooCommerce() {
  const { repo, tag } = sources.woocommerce;
  const dir = sparseClone(
    repo,
    tag,
    [
      '/plugins/woocommerce/client/blocks/assets/js/**/block.json',
      '/plugins/woocommerce/templates/templates/',
      '/plugins/woocommerce/templates/parts/',
      '/plugins/woocommerce/src/Blocks/BlockTypes/',
    ],
    join(CACHE, `woocommerce-${tag}`),
  );
  // Blocks with a PHP class in src/Blocks/BlockTypes render on the server (dynamic).
  const phpDir = join(dir, 'plugins/woocommerce/src/Blocks/BlockTypes');
  const phpBlocks = new Map(); // full name -> php file
  for (const file of walk(phpDir).filter((f) => f.endsWith('.php')).sort()) {
    const php = readFileSync(file, 'utf8');
    const name = php.match(/protected \$block_name = '([a-z0-9-]+)'/)?.[1];
    if (!name) continue;
    const ns = php.match(/protected \$namespace = '([a-z0-9-]+)'/)?.[1] ?? 'woocommerce';
    if (!phpBlocks.has(`${ns}/${name}`)) phpBlocks.set(`${ns}/${name}`, file);
  }

  const jsRoot = join(dir, 'plugins/woocommerce/client/blocks/assets/js');
  const seen = new Map();
  for (const file of walk(jsRoot).filter((f) => basename(f) === 'block.json').sort()) {
    const json = readJson(file);
    if (!json.name || seen.has(json.name)) continue;
    seen.set(json.name, normalizeBlock(json, { dynamic: !!json.render || phpBlocks.has(json.name), origin: relative(dir, file) }));
  }
  // A few blocks are registered from PHP and JavaScript only, with no block.json
  // (the Cart block among them). Add them with what the PHP class states.
  for (const [full, file] of phpBlocks) {
    if (seen.has(full)) continue;
    const title = basename(file, '.php').replace(/([a-z])([A-Z])/g, '$1 $2');
    seen.set(
      full,
      normalizeBlock(
        { name: full, title, category: 'woocommerce', description: '(block.json なし。PHP と JavaScript で登録されるブロック)' },
        { dynamic: true, origin: relative(dir, file) },
      ),
    );
  }
  const blocks = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));

  const templates = {};
  for (const sub of ['templates/blockified', 'parts']) {
    const tdir = join(dir, 'plugins/woocommerce/templates', sub);
    for (const f of readdirSync(tdir).sort()) {
      if (!f.endsWith('.html')) continue;
      const slug = f.replace(/\.html$/, '');
      templates[`${sub === 'parts' ? 'parts' : 'templates'}/${slug}`] = parseTemplate(readFileSync(join(tdir, f), 'utf8'));
    }
  }
  writeFile(join(DATA, 'woocommerce/blocks.json'), stableStringify({ version: tag, repo, blocks }));
  writeFile(join(DATA, 'woocommerce/templates.json'), stableStringify({ version: tag, repo, templates }));
  return { tag, count: blocks.length, templates: Object.keys(templates).length };
}

// omotegae's pattern library, as exported from its admin screen
// (GET /admin/patterns/export, format omotegae-patterns/1). The export is committed
// under sources/ by hand; this checks it and keeps only what the design system reads.
const PATTERN_FORMAT = 'omotegae-patterns/1';
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const STATUSES = ['draft', 'active', 'deprecated'];
// Field names become TypeScript property names and brief keys; omotegae uses snake_case.
const FIELD_RE = /^[a-z][a-z0-9_]*$/;
const SCHEMA_TYPES = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'];

function syncOmotegae(knownBlocks) {
  const file = join(ROOT, sources.omotegae.patternsFile);
  const doc = readJson(file);
  const fail = (msg) => {
    throw new Error(`${sources.omotegae.patternsFile}: ${msg}`);
  };
  if (doc.format !== PATTERN_FORMAT) fail(`format must be "${PATTERN_FORMAT}", got ${JSON.stringify(doc.format)}`);
  if (!Array.isArray(doc.patterns)) fail('patterns is not a list');
  if (!Array.isArray(doc.categories)) fail('categories is not a list');

  const categories = doc.categories.map((c, i) => {
    if (!SLUG_RE.test(c?.slug ?? '') || typeof c.label !== 'string') fail(`categories[${i}] is malformed`);
    return { slug: c.slug, label: c.label };
  });

  const seen = new Set();
  const warnings = [];
  const patterns = doc.patterns.map((p, i) => {
    const where = `patterns[${i}]${p?.slug ? ` (${p.slug})` : ''}`;
    if (!SLUG_RE.test(p?.slug ?? '')) fail(`${where}: slug is malformed`);
    if (seen.has(p.slug)) fail(`${where}: slug appears twice`);
    seen.add(p.slug);
    if (!SLUG_RE.test(p.category ?? '')) fail(`${where}: category is malformed`);
    if (!STATUSES.includes(p.status)) fail(`${where}: unknown status ${JSON.stringify(p.status)}`);
    for (const key of ['title', 'description_for_ai']) if (typeof p[key] !== 'string') fail(`${where}: ${key} is not a string`);
    if (!Array.isArray(p.block_map) || p.block_map.some((b) => typeof b !== 'string')) fail(`${where}: block_map is not a list of block names`);
    if (!Array.isArray(p.tone_tags) || p.tone_tags.some((t) => typeof t !== 'string')) fail(`${where}: tone_tags is not a list`);
    if (typeof p.requires_woocommerce !== 'boolean') fail(`${where}: requires_woocommerce is not a boolean`);
    const schema = p.content_schema;
    if (!schema || typeof schema !== 'object' || Array.isArray(schema)) fail(`${where}: content_schema is not an object`);
    const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
    if (schema.properties !== undefined && !isObject(schema.properties)) fail(`${where}: content_schema.properties is not an object`);
    const properties = schema.properties ?? {};
    if (schema.required !== undefined && (!Array.isArray(schema.required) || schema.required.some((r) => typeof r !== 'string'))) {
      fail(`${where}: content_schema.required is not a list of field names`);
    }
    const required = schema.required ?? [];
    for (const r of required) if (!Object.hasOwn(properties, r)) fail(`${where}: required field "${r}" has no definition in properties`);
    for (const [name, def] of Object.entries(properties)) {
      if (!FIELD_RE.test(name)) fail(`${where}: field name "${name}" is not a lowercase identifier`);
      if (!isObject(def)) fail(`${where}: field "${name}" is not a schema object`);
      if (def.type !== undefined && !SCHEMA_TYPES.includes(def.type)) fail(`${where}: field "${name}" has an unknown type ${JSON.stringify(def.type)}`);
      if (def.enum !== undefined && (!Array.isArray(def.enum) || def.enum.length === 0)) fail(`${where}: field "${name}" has an empty or malformed enum`);
      if (def.maxLength !== undefined && !(Number.isInteger(def.maxLength) && def.maxLength > 0)) fail(`${where}: field "${name}" has a malformed maxLength`);
    }
    for (const b of p.block_map) if (!knownBlocks.has(b)) warnings.push(`${p.slug}: block_map names ${b}, which is not a block in the pinned WordPress / WooCommerce`);
    return {
      slug: p.slug,
      category: p.category,
      title: p.title,
      description: p.description_for_ai,
      blocks: p.block_map,
      fields: Object.entries(properties).map(([name, def]) => ({
        name,
        label: typeof def?.description === 'string' ? def.description : '',
        type: def?.type ?? null,
        maxLength: Number.isInteger(def?.maxLength) ? def.maxLength : null,
        enum: Array.isArray(def?.enum) ? def.enum : null,
        required: required.includes(name),
      })),
      toneTags: p.tone_tags,
      requiresWoocommerce: p.requires_woocommerce,
      status: p.status,
      version: Number.isInteger(p.version) ? p.version : null,
    };
  });
  patterns.sort((a, b) => a.slug.localeCompare(b.slug));

  writeFile(
    join(DATA, 'omotegae/patterns.json'),
    stableStringify({ format: doc.format, exportedAt: doc.exported_at ?? null, appVersion: doc.app_version ?? null, categories, patterns }),
  );
  return { exportedAt: doc.exported_at ?? null, count: patterns.length, active: patterns.filter((p) => p.status === 'active').length, warnings };
}

const wp = syncWordPress();
const woo = syncWooCommerce();
const knownBlocks = new Set([
  ...readJson(join(DATA, 'wordpress/blocks.json')).blocks.map((b) => b.name),
  ...readJson(join(DATA, 'woocommerce/blocks.json')).blocks.map((b) => b.name),
]);
const omotegae = syncOmotegae(knownBlocks);
writeFile(
  join(DATA, 'versions.json'),
  stableStringify({
    wordpress: wp.tag,
    woocommerce: woo.tag,
    coreBlocks: wp.count,
    wooBlocks: woo.count,
    wooTemplates: woo.templates,
    omotegaePatternsExportedAt: omotegae.exportedAt,
    omotegaePatterns: omotegae.count,
    omotegaeActivePatterns: omotegae.active,
  }),
);
console.log(`WordPress ${wp.tag}: ${wp.count} blocks`);
console.log(`WooCommerce ${woo.tag}: ${woo.count} blocks, ${woo.templates} templates/parts`);
console.log(`omotegae patterns (exported ${omotegae.exportedAt}): ${omotegae.count}, ${omotegae.active} active`);
for (const w of omotegae.warnings) console.warn(`warning: ${w}`);
