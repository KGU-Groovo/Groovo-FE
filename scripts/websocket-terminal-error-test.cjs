const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const hook = readFileSync('hooks/use-ai-feedback-socket.ts', 'utf8');
const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(hook, /event\.code === 4003 \|\| event\.code === 4004/);
assert.match(hook, /Math\.min\(10000, 1000 \* 2 \*\* retryAttemptRef\.current\+\+\)/);
assert.match(screen, /connectionError/);

console.log('terminal websocket error contract verified');
