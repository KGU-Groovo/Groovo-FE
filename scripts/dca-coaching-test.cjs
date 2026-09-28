const assert = require('node:assert/strict');
const { getDcaCoachingMessage } = require('../components/live-feedback/dca-coaching');

assert.equal(
  getDcaCoachingMessage([15, 12, 24]),
  '왼팔 동작을 더 정확히 맞춰 보세요.',
);
assert.equal(
  getDcaCoachingMessage([28]),
  '오른다리 동작을 더 정확히 맞춰 보세요.',
);
assert.equal(
  getDcaCoachingMessage([0]),
  '상체 정렬을 더 정확히 맞춰 보세요.',
);
assert.equal(getDcaCoachingMessage([]), null);

console.log('DCA coaching message verified');
