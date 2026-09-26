const assert = require('node:assert/strict');
const { shouldPlay } = require('../components/live-feedback/playback-state');

assert.equal(shouldPlay(true, true), true);
assert.equal(shouldPlay(true, false), false);
assert.equal(shouldPlay(false, true), false);

console.log('playback state verified');
