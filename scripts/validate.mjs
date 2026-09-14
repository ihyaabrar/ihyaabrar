import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const readmePath = path.join(root, 'README.md');
const readme = fs.readFileSync(readmePath, 'utf8');
const failures = [];
const warnings = [];

const refs = new Set();
for (const match of readme.matchAll(/(?:src|srcset)="([^"]+)"/g)) refs.add(match[1]);

for (const ref of refs) {
  if (/^https?:\/\//i.test(ref)) {
    failures.push(`Remote image dependency is not allowed: ${ref}`);
    continue;
  }
  if (!ref.startsWith('./')) continue;
  const full = path.join(root, ref.slice(2));
  if (!fs.existsSync(full)) failures.push(`Missing local README asset: ${ref}`);
  else if (fs.statSync(full).size === 0) failures.push(`Empty local README asset: ${ref}`);
}

const svgFiles = [];
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (name.endsWith('.svg')) svgFiles.push(full);
  }
}
walk(path.join(root, 'assets'));

for (const file of svgFiles) {
  const text = fs.readFileSync(file, 'utf8').trim();
  if (!text.startsWith('<svg') || !text.endsWith('</svg>')) failures.push(`Malformed SVG wrapper: ${path.relative(root, file)}`);
  if (/https?:\/\//i.test(text.replace('http://www.w3.org/2000/svg',''))) warnings.push(`SVG has an external URL: ${path.relative(root, file)}`);
}

const refresh = fs.readFileSync(path.join(root, '.github', 'workflows', 'profile-refresh.yml'), 'utf8');
if (!refresh.includes('actions/checkout@v7')) failures.push('profile-refresh.yml must use actions/checkout@v7');
if (!refresh.includes('actions/setup-node@v7')) failures.push('profile-refresh.yml must use actions/setup-node@v7');
if (!/node-version:\s*["']?24["']?/.test(refresh)) failures.push('profile-refresh.yml must pin Node.js 24');
if (!/contents:\s*write/.test(refresh)) failures.push('profile-refresh.yml needs contents: write');

console.log(`README local image refs: ${refs.size}`);
console.log(`SVG assets checked: ${svgFiles.length}`);
console.log(`Warnings: ${warnings.length}`);
for (const w of warnings) console.warn(`WARN: ${w}`);

if (failures.length) {
  for (const f of failures) console.error(`FAIL: ${f}`);
  process.exit(1);
}
console.log('PASS: profile package is internally renderable with no remote image dependencies.');
