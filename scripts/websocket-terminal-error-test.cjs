const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const hook = readFileSync('hooks/use-ai-feedback-socket.ts', 'utf8');
const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(hook, /event\.code === 4003 \|\| event\.code === 4004/);
assert.match(hook, /retryTimerRef\.current = setTimeout\(connect, 1000\)/);
assert.match(screen, /connectionError/);

console.log('terminal websocket error contract verified');
