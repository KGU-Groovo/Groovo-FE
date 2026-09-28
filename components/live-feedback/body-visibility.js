const REQUIRED_JOINTS = [0, 11, 12, 23, 24, 27, 28];
const FRAME_MARGIN = 0.03;

function updateBodyVisibilityState(state, detected) {
  const visibleFrames = detected ? state.visibleFrames + 1 : 0;
  const hiddenFrames = detected ? 0 : state.hiddenFrames + 1;
  return {
    isFullBody: detected
      ? state.isFullBody || visibleFrames >= 2
      : state.isFullBody && hiddenFrames < 3,
    visibleFrames,
    hiddenFrames,
  };
}

function isFullBodyVisible(landmarks, frame = {}) {
  if (!Array.isArray(landmarks) || landmarks.length !== 33) return false;

  const requiredLandmarks = REQUIRED_JOINTS.map((index) => landmarks[index]);
  const hasNormalizedCoordinates = requiredLandmarks.every(
    (landmark) => Math.abs(landmark?.x) <= 2 && Math.abs(landmark?.y) <= 2,
  );

  return requiredLandmarks.every((landmark) => {
    if (!Number.isFinite(landmark?.x) || !Number.isFinite(landmark?.y)) return false;

    if (hasNormalizedCoordinates) {
      return landmark.x >= FRAME_MARGIN && landmark.x <= 1 - FRAME_MARGIN
        && landmark.y >= FRAME_MARGIN && landmark.y <= 1 - FRAME_MARGIN;
    }

    return Number.isFinite(frame.width) && Number.isFinite(frame.height)
      && landmark.x >= frame.width * FRAME_MARGIN && landmark.x <= frame.width * (1 - FRAME_MARGIN)
      && landmark.y >= frame.height * FRAME_MARGIN && landmark.y <= frame.height * (1 - FRAME_MARGIN);
  });
}

module.exports = { isFullBodyVisible, updateBodyVisibilityState };
