#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const tests = [
  'ci/readme.test.js',
  'hooks/hooks-config.test.js',
  'integration/install-profile-script.test.js',
  'integration/profile-install.test.js',
  'lib/engine-isolation.test.js',
  'scripts/setup-profile.test.js',
  'schemas/manifests-schema.test.js',
];

let failed = 0;
for (const rel of tests) {
  const abs = path.join(__dirname, rel);
  const result = spawnSync(process.execPath, [abs], { stdio: 'inherit' });
  if (result.status !== 0) {
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} test file(s) failed.`);
  process.exit(1);
}

console.log('\nAll test files passed.');
