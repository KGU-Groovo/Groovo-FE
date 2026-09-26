const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const hook = readFileSync('hooks/use-ai-feedback-socket.ts', 'utf8');
const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(hook, /type: 'complete'/);
assert.match(hook, /session_summary/);
assert.match(hook, /completeSession/);
assert.match(hook, /analyzed_frame_count: number/);
assert.match(hook, /confidence: 'low' \| 'medium' \| 'high'/);
assert.match(screen, /await completeSession\(\)/);
assert.match(screen, /sessionSummary\.final_score/);
assert.match(screen, /sessionSummary\.scores/);
assert.match(screen, /sessionSummary\?\.analyzed_frame_count/);
assert.match(screen, /sessionSummary\?\.confidence/);

const result = readFileSync('app/result.tsx', 'utf8');
assert.match(result, /analyzedFrameCount/);
assert.match(result, /confidenceLabel/);

console.log('session summary contract verified');
