const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/(tabs)/basics.tsx', 'utf8');

assert.doesNotMatch(screen, /Ghost-Dancer\.png/);
assert.equal((screen.match(/https:\/\/images\.pexels\.com/g) ?? []).length, 3);
assert.match(screen, /source=\{\{ uri: imageUri \}\}/);

console.log('basics lesson images verified');
