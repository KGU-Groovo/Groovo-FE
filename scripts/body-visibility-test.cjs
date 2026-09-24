const assert = require('node:assert/strict');
const { isFullBodyVisible } = require('../components/live-feedback/body-visibility');

const fullBody = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }));

assert.equal(isFullBodyVisible(fullBody), true);

const ankleHidden = fullBody.map((landmark) => ({ ...landmark }));
ankleHidden[27].visibility = 0.2;
assert.equal(isFullBodyVisible(ankleHidden), false);

const landmarksWithoutVisibility = fullBody.map(({ x, y }) => ({ x, y }));
assert.equal(isFullBodyVisible(landmarksWithoutVisibility), true);

console.log('body visibility verified');
