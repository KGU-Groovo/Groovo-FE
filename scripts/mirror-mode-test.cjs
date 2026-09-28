const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');
const video = readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8');

assert.match(screen, /const \[isMirrorMode, setIsMirrorMode\] = useState\(false\)/);
assert.match(screen, /isMirrored=\{isMirrorMode\}/);
assert.match(screen, /accessibilityLabel="거울 모드"/);
assert.match(video, /isMirrored\?: boolean/);
assert.match(video, /scaleX: isMirrored \? -1 : 1/);

console.log('mirror mode contract verified');
