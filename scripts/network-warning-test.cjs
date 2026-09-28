const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const hook = readFileSync('hooks/use-ai-feedback-socket.ts', 'utf8');
const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(hook, /warning\?: string/);
assert.match(hook, /recommend_pause\?: boolean/);
assert.match(hook, /onWarning/);
assert.match(screen, /const \[networkWarning, setNetworkWarning\] = useState<string \| null>\(null\)/);
assert.match(screen, /setIsUserPlaying\(false\)/);
assert.match(screen, /setNetworkWarning\(null\)/);
assert.match(screen, /!networkWarning/);

console.log('network warning contract verified');
