const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const liveFeedback = readFileSync('app/live-feedback/index.tsx', 'utf8');
const result = readFileSync('app/result.tsx', 'utf8');

assert.match(liveFeedback, /songId: song\.id/);
assert.match(result, /songId: songIdParam/);
assert.match(result, /pathname: '\/live-feedback'/);
assert.match(result, /params: \{ songId: songIdParam \}/);
assert.doesNotMatch(result, /router\.back\(\)/);

console.log('result retry route verified');
