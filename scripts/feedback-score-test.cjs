const assert = require('node:assert/strict');

const { getFeedbackState } = require(process.env.FEEDBACK_SCORE_MODULE);

assert.deepEqual(getFeedbackState(null), {
  label: '분석 대기',
  color: '#64748B',
});
assert.deepEqual(getFeedbackState(59), {
  label: '자세 교정 필요',
  color: '#EF4444',
});
assert.deepEqual(getFeedbackState(60), {
  label: '자세 확인',
  color: '#EAB308',
});
assert.deepEqual(getFeedbackState(79), {
  label: '자세 확인',
  color: '#EAB308',
});
assert.deepEqual(getFeedbackState(80), {
  label: '좋은 자세',
  color: '#22C55E',
});
assert.deepEqual(getFeedbackState(101), {
  label: '분석 대기',
  color: '#64748B',
});
