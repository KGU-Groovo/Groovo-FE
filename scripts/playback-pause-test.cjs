const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(screen, /if \(visible && isPlaying\) sendLandmarks\(points, playbackTimeMsRef\.current\)/);

console.log('paused playback does not send landmarks');
