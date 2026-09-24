const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const video = readFileSync('components/live-feedback/VideoBackground.tsx', 'utf8');
const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');
const socket = readFileSync('hooks/use-ai-feedback-socket.ts', 'utf8');

assert.match(video, /onPlaybackTimeUpdate/);
assert.match(screen, /onPlaybackTimeUpdate/);
assert.match(screen, /sendLandmarks\(points, playbackTimeMsRef\.current\)/);
assert.match(socket, /timestamp_ms: Math\.max\(0, Math\.round\(timestampMs\)\)/);

console.log('playback timestamp contract verified');
