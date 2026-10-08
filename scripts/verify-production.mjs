import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFile(path.join(root, name));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const hash = buffer => createHash('sha256').update(buffer).digest('hex');
const source = (await read('src/projects.js')).toString();
const projects = JSON.parse(source.match(/export const projects = (\[[\s\S]*?\n\]);/)[1]);
const manifest = JSON.parse(await read('dist/.vite/manifest.json'));
const config = JSON.parse(await read('edgeone.json'));

assert(projects.length === 7, 'Expected all seven projects.');
for (const project of projects) {
  for (const url of [project.cover, ...project.images.flatMap(image => [image.src, image.fullSrc])]) {
    assert(url.startsWith('./assets/projects/'), 'Non-local project media: ' + project.slug);
    await read('src/' + url);
  }
}

const counts = {originalWebP: 0, deviceWebP: 0, fonts: 0, pdf: 0};
let mediaBytes = 0;
for (const [name, entry] of Object.entries(manifest)) {
  if (!name.startsWith('src/assets/')) continue;
  assert(/^assets\/.+-[\w-]{8,}\.[\w]+$/.test(entry.file), 'Asset without a content hash: ' + entry.file);
  const original = await read(name), emitted = await read('dist/' + entry.file);
  assert(hash(original) === hash(emitted), 'Asset changed during build: ' + name);
  mediaBytes += emitted.length;
  if (name.includes('/projects/')) {
    assert(original.toString('ascii', 0, 4) === 'RIFF' && original.toString('ascii', 8, 12) === 'WEBP', 'Invalid WebP: ' + name);
    counts.originalWebP++;
  }
  if (name.includes('/project-previews/')) counts.deviceWebP++;
  if (name.includes('/fonts/')) {
    assert(original.toString('ascii', 0, 4) === 'wOF2', 'Invalid WOFF2: ' + name);
    counts.fonts++;
  }
  if (name.endsWith('.pdf')) counts.pdf++;
}
assert(counts.originalWebP === 74 && counts.deviceWebP === 10 && counts.fonts === 8 && counts.pdf === 1, 'Missing production media: ' + JSON.stringify(counts));
const entry = manifest['index.html'];
for (const name of ['src/portfolio.js', 'src/project-world.js']) {
  assert(manifest[name]?.isDynamicEntry && entry.dynamicImports.includes(name), 'Feature no longer loads on demand: ' + name);
  assert(!entry.imports.includes(name), 'Feature eagerly included: ' + name);
}

const html = (await read('dist/index.html')).toString();
const css = (await read('dist/' + entry.css[0])).toString();
assert(!/fonts\.googleapis|fonts\.gstatic|https?:\/\//.test(css), 'Stylesheet has an external network dependency.');
assert(!/<(?:script|link)[^>]+(?:src|href)=["']https?:\/\//.test(html), 'HTML has an external script/font/style dependency.');
assert(!/<script type="importmap"/.test(html), 'Unbundled import map in production.');
assert(config.outputDirectory === 'dist' && config.buildCommand === 'npm run build', 'Unexpected deployment settings.');
assert(config.rewrites.some(rule => rule.source === '/*' && rule.destination === '/index.html'), 'SPA fallback missing.');
assert(config.headers.some(rule => rule.source === '/assets/*' && rule.headers.some(header => header.key === 'Cache-Control' && header.value.includes('immutable'))), 'Hashed asset cache rule missing.');
console.log(JSON.stringify({projects: projects.length, galleryImages: projects.reduce((sum, project) => sum + project.images.length, 0), ...counts, mediaBytes, assetIntegrity: 'SHA-256 identical', dynamicChunks: ['portfolio', 'project-world'], externalStyleDependencies: 0, spaFallback: 'configured'}, null, 2));
