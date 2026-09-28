const COACHING_BY_JOINT = {
  11: '왼팔 동작을', 13: '왼팔 동작을', 15: '왼팔 동작을',
  12: '오른팔 동작을', 14: '오른팔 동작을', 16: '오른팔 동작을',
  23: '상체 중심을', 24: '상체 중심을',
  25: '왼다리 동작을', 27: '왼다리 동작을',
  26: '오른다리 동작을', 28: '오른다리 동작을',
};

function getDcaCoachingMessage(highlightJoints) {
  if (!Array.isArray(highlightJoints) || highlightJoints.length === 0) return null;
  const area = COACHING_BY_JOINT[highlightJoints[0]] ?? '상체 정렬을';
  return `${area} 더 정확히 맞춰 보세요.`;
}

module.exports = { getDcaCoachingMessage };
