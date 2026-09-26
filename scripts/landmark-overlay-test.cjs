const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(screen, /<View key=\{index\} style=\{\[styles\.landmark_container, \{ left: x, top: y \}\]\}>\s*<View style=\{styles\.landmark_dot\} \/>\s*<\/View>/s);
assert.doesNotMatch(screen, /landmark_text/);
assert.doesNotMatch(screen, /originalX|originalY|originalZ/);

console.log('presentation landmark overlay contract verified');
