const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const feed = readFileSync('app/(tabs)/feed.tsx', 'utf8');
const video = readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8');

assert.match(feed, /source=\{item\.song\.videoSource\}/);
assert.match(feed, /posterSource=\{item\.song\.albumCover\}/);
assert.match(feed, /isActive \? <VideoBackground[\s\S]*isPlaying loop/);
assert.match(feed, /onMomentumScrollEnd/);
assert.match(feed, /const isActive = item\.song\.id === activeReelId/);
assert.match(feed, /isActive \? <VideoBackground/);
assert.match(feed, /: <ImageBackground source=\{item\.song\.albumCover\}/);
assert.match(feed, /initialNumToRender=\{1\}/);
assert.match(video, /autoPlay/);
assert.match(video, /loop/);
assert.match(video, /posterSource/);

console.log('feed video playback contract verified');
