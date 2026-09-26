const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(screen, /const isPlaying = shouldPlay\(isUserPlaying, hasFullBody\)/);
assert.match(screen, /const \[hasFullBody, setHasFullBody\] = useState\(false\)/);
assert.match(screen, /if \(visible && isUserPlaying\)/);
assert.match(screen, /sendBodyVisibility\(visible\)/);

console.log('paused playback does not send landmarks');
