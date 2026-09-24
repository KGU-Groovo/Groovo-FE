const REQUIRED_JOINTS = [0, 11, 12, 23, 24, 27, 28];
const MIN_VISIBILITY = 0.5;

function isFullBodyVisible(landmarks) {
  if (!Array.isArray(landmarks) || landmarks.length !== 33) return false;

  const requiredLandmarks = REQUIRED_JOINTS.map((index) => landmarks[index]);
  const hasVisibility = requiredLandmarks.some((landmark) => Number.isFinite(landmark?.visibility));
  if (!hasVisibility) return true;

  return requiredLandmarks.every(
    (landmark) => Number.isFinite(landmark?.visibility) && landmark.visibility >= MIN_VISIBILITY,
  );
}

module.exports = { isFullBodyVisible };
