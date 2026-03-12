import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');
const functionsRoot = join(repoRoot, 'apps', 'functions');
const distRoot = join(functionsRoot, 'dist');
const publishRoot = join(repoRoot, '.publish', 'functions');

if (!existsSync(distRoot)) {
  throw new Error('Functions build output was not found. Run npm run build -w @aoifmsp/functions first.');
}

rmSync(publishRoot, { recursive: true, force: true });
mkdirSync(publishRoot, { recursive: true });

cpSync(join(functionsRoot, 'host.json'), join(publishRoot, 'host.json'));
cpSync(distRoot, join(publishRoot, 'dist'), { recursive: true });

const packageJson = {
  name: '@aoifmsp/functions-publish',
  private: true,
  type: 'module',
  main: 'dist/apps/functions/src/index.js',
  dependencies: {
    '@azure/data-tables': '^13.3.2',
    '@azure/functions': '^4.7.3',
    '@azure/identity': '^4.13.0',
    '@azure/keyvault-secrets': '^4.10.0',
    '@azure/storage-blob': '^12.31.0',
    '@azure/storage-queue': '^12.29.0',
    yaml: '^2.8.1',
    zod: '^4.3.6',
  },
};

writeFileSync(join(publishRoot, 'package.json'), `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');

console.log(`Prepared Functions publish package at ${publishRoot}`);


