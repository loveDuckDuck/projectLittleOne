import assert from 'node:assert/strict';
import ts from '../node_modules/typescript/lib/typescript.js';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const sourceFiles = ['src/utils/layout.ts', 'src/utils/assets.ts', 'src/models/profilePhoto.ts', 'src/models/createBlock.ts', 'src/store/initialDocument.ts', 'src/utils/documentStorage.ts', 'src/models/randomDocument.ts'];
for (const path of sourceFiles) {
  const source = await readFile(path, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText.replace(/(from\s+['"])(\.\.?\/[^'"]+)(['"])/g, '$1$2.mjs$3');
  const destination = resolve('tmp/random-check', path.replace(/^src\//, '').replace(/\.ts$/, '.mjs'));
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, output);
}
const load = (path) => import(pathToFileURL(resolve(`tmp/random-check/${path}.mjs`)).href);
const { createRandomDocument } = await load('models/randomDocument');
const { parseDocument } = await load('utils/documentStorage');
const { blocksOf } = await load('utils/layout');
const names = new Set();
const roles = new Set();
const fonts = new Set();
let checked = 0;
for (let seed = 1; seed <= 30; seed++) {
  let state = seed;
  const random = () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296);
  for (const length of ['short', 'medium', 'long']) {
    for (const columns of ['random', 1, 2, 3]) {
      const options = { length, columns, includePhoto: false };
      const document = createRandomDocument(options, random);
      assert.deepEqual(options, { length, columns, includePhoto: false });
      assert.deepEqual(parseDocument(JSON.parse(JSON.stringify(document))), document);
      const blocks = blocksOf(document);
      const personal = blocks.find((block) => block.type === 'personal').data;
      assert.equal(personal.photoSrc, '');
      assert.match(personal.email, /@example\.com$/);
      assert.match(personal.website, /^https:\/\/example\.com\//);
      assert.equal(blocks.filter((block) => block.type === 'experience').length, { short: 1, medium: 2, long: 4 }[length]);
      if (columns !== 'random') assert.equal(Math.max(...document.rows.map((row) => row.columns.length)), columns);
      for (const block of blocks.filter((block) => block.type === 'experience')) {
        if (!block.data.current) assert.ok(block.data.startDate < block.data.endDate);
      }
      names.add(`${personal.firstName} ${personal.lastName}`);
      roles.add(personal.professionalTitle);
      fonts.add(document.globalStyle.fontFamily);
      checked++;
    }
  }
}
assert.ok(names.size > 20);
assert.equal(roles.size, 4);
assert.equal(fonts.size, 5);
console.log(`${checked} random CVs passed: layouts, content lengths, date order, variety and JSON round-trip.`);
