const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const result = readFileSync('app/result.tsx', 'utf8');
const liveFeedback = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(result, /react-native-svg/, 'result must render the pentagon as a radar chart');
assert.match(result, /timelineParam/, 'result must render a performance timeline');
assert.match(liveFeedback, /timeline:/, 'live feedback must pass measured scores to the result');
assert.equal(liveFeedback.includes('feedback.dca?.score_100'), false, 'result score must not use the DCA prediction');
