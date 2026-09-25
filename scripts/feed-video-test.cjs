const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const feed = readFileSync('app/(tabs)/feed.tsx', 'utf8');
const video = readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8');

assert.match(feed, /source=\{item\.song\.videoSource\}/);
assert.match(feed, /posterSource=\{item\.song\.albumCover\}/);
assert.match(feed, /isPlaying=\{item\.song\.id === activeReelId\}/);
assert.match(feed, /onMomentumScrollEnd/);
assert.match(video, /autoPlay/);
assert.match(video, /loop/);
assert.match(video, /posterSource/);

console.log('feed video playback contract verified');
