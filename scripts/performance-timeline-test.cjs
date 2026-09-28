const assert = require('node:assert/strict');
const { buildPerformanceTimeline } = require('../components/live-feedback/performance-timeline');

assert.deepEqual(
  buildPerformanceTimeline([
    { timestampMs: 750, score: 90 },
    { timestampMs: 800, score: 70 },
    { timestampMs: 875, score: 40 },
    { timestampMs: 1000, score: 80 },
  ], 4),
  [80, null, 40, 80],
);

console.log('performance timeline verified');
