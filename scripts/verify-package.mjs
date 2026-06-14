import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));

const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: root,
  encoding: 'utf8',
});
const [pack] = JSON.parse(packOutput);
const packedFiles = new Set(pack.files.map((file) => file.path));

const failures = [];

function assertPacked(filePath, reason) {
  if (!packedFiles.has(filePath)) {
    failures.push(`${filePath} is missing from npm pack (${reason})`);
  }
}

function assertPackagePath(fieldName) {
  const fieldValue = packageJson[fieldName];
  if (!fieldValue) return;

  if (!existsSync(path.join(root, fieldValue))) {
    failures.push(`package.json ${fieldName} points to missing ${fieldValue}`);
  }

  assertPacked(fieldValue, `package.json ${fieldName}`);
}

function collectSourceModules(dir) {
  const entries = readdirSync(dir);
  const modules = [];

  for (const entry of entries) {
    const absPath = path.join(dir, entry);
    const relPath = path.relative(path.join(root, 'src'), absPath);

    if (statSync(absPath).isDirectory()) {
      modules.push(...collectSourceModules(absPath));
      continue;
    }

    if (/\.(test|spec)\.[cm]?[tj]sx?$/.test(entry) || entry.endsWith('.css')) {
      continue;
    }

    if (/\.[cm]?tsx?$/.test(entry)) {
      modules.push(relPath.replace(/\.[cm]?tsx?$/, ''));
    }
  }

  return modules;
}

assertPackagePath('main');
assertPackagePath('module');
assertPackagePath('types');
assertPacked('dist/esm/ui/styles.css', 'runtime CSS import');
assertPacked('dist/cjs/ui/styles.css', 'runtime CSS require');

for (const modulePath of collectSourceModules(path.join(root, 'src'))) {
  assertPacked(`dist/esm/${modulePath}.js`, `ESM runtime for src/${modulePath}`);
  assertPacked(`dist/cjs/${modulePath}.js`, `CJS runtime for src/${modulePath}`);
  assertPacked(`dist/esm/${modulePath}.d.ts`, `types for src/${modulePath}`);
}

if (failures.length) {
  console.error(`Package verification failed with ${failures.length} issue(s):`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Package verification passed with ${pack.files.length} packed files.`);
