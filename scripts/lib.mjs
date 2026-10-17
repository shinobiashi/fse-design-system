// Shared helpers for sync / build / validate / check-updates.
// No third-party dependencies: only Node's standard library and the `git` CLI.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const CACHE = join(ROOT, '.cache');
export const DATA = join(ROOT, 'data');
export const SRC = join(ROOT, 'src');
export const DIST = join(ROOT, 'dist');

// Tags are only ever plain release numbers ("7.1.3", "11.2.1"); refuse anything else
// before it reaches a git command line.
const TAG_RE = /^\d+\.\d+(\.\d+)?$/;
const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

// Deterministic JSON: object keys sorted recursively, so re-running sync on the same
// tag produces byte-identical files and a version bump shows only real changes.
export function stableStringify(value) {
  return JSON.stringify(sortKeys(value), null, 2) + '\n';
}

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((k) => [k, sortKeys(value[k])]),
    );
  }
  return value;
}

export function writeFile(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
}

export function git(args, opts = {}) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

export function assertSource(repo, tag) {
  if (!REPO_RE.test(repo)) throw new Error(`Invalid repository name: ${repo}`);
  if (!TAG_RE.test(tag)) throw new Error(`Invalid release tag: ${tag}`);
}

// Shallow, blob-filtered, sparse clone of one tag: only the paths we read are downloaded.
export function sparseClone(repo, tag, patterns, dest) {
  assertSource(repo, tag);
  if (existsSync(join(dest, '.git'))) {
    const head = git(['-C', dest, 'describe', '--tags', '--exact-match']).trim();
    if (head === tag) {
      git(['-C', dest, 'sparse-checkout', 'set', '--no-cone', ...patterns]);
      return dest;
    }
    rmSync(dest, { recursive: true, force: true });
  }
  mkdirSync(dirname(dest), { recursive: true });
  git([
    '-c', 'advice.detachedHead=false',
    'clone', '--quiet', '--depth', '1', '--branch', tag,
    '--filter=blob:none', '--sparse',
    `https://github.com/${repo}`, dest,
  ]);
  git(['-C', dest, 'sparse-checkout', 'set', '--no-cone', ...patterns]);
  return dest;
}

// Latest stable release tag (digits and dots only: betas and RCs carry a suffix).
export function latestTag(repo) {
  if (!REPO_RE.test(repo)) throw new Error(`Invalid repository name: ${repo}`);
  const out = git(['ls-remote', '--tags', '--refs', `https://github.com/${repo}`]);
  const tags = out
    .split('\n')
    .map((line) => line.split('refs/tags/')[1])
    .filter((t) => t && TAG_RE.test(t));
  return tags.sort(compareVersions).at(-1);
}

export function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

// "core/post-title" -> "PostTitle"; "woocommerce/product-price" -> "WcProductPrice".
// A few names collide with names the Design System page reserves; those are renamed.
const RESERVED = new Map([['core/cover', 'CoverBlock']]);

export function componentName(blockName) {
  if (RESERVED.has(blockName)) return RESERVED.get(blockName);
  const [ns, slug] = blockName.split('/');
  const pascal = slug
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');
  return ns === 'core' ? pascal : 'Wc' + pascal;
}
