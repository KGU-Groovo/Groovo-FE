const assert = require('node:assert/strict');
const { isFullBodyVisible, updateBodyVisibilityState } = require('../components/live-feedback/body-visibility');

const fullBody = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }));

assert.equal(isFullBodyVisible(fullBody), true);

const ankleHidden = fullBody.map((landmark) => ({ ...landmark }));
ankleHidden[27].visibility = 0.2;
assert.equal(isFullBodyVisible(ankleHidden), true);

const landmarksWithoutVisibility = fullBody.map(({ x, y }) => ({ x, y }));
assert.equal(isFullBodyVisible(landmarksWithoutVisibility), true);

const ankleOutsideFrame = fullBody.map((landmark) => ({ ...landmark }));
ankleOutsideFrame[27].y = 0.99;
assert.equal(isFullBodyVisible(ankleOutsideFrame), false);

const missingHipCoordinates = fullBody.map((landmark) => ({ ...landmark }));
delete missingHipCoordinates[23].x;
assert.equal(isFullBodyVisible(missingHipCoordinates), false);

let visibilityState = { isFullBody: false, visibleFrames: 0, hiddenFrames: 0 };
visibilityState = updateBodyVisibilityState(visibilityState, true);
assert.equal(visibilityState.isFullBody, false);
visibilityState = updateBodyVisibilityState(visibilityState, true);
assert.equal(visibilityState.isFullBody, true);
visibilityState = updateBodyVisibilityState(visibilityState, false);
assert.equal(visibilityState.isFullBody, true);
visibilityState = updateBodyVisibilityState(visibilityState, false);
assert.equal(visibilityState.isFullBody, true);
visibilityState = updateBodyVisibilityState(visibilityState, false);
assert.equal(visibilityState.isFullBody, false);

console.log('body visibility verified');
