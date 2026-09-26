function buildPerformanceTimeline(samples, bucketCount = 60) {
  if (!Array.isArray(samples) || bucketCount < 1) return [];

  const validSamples = samples.filter((sample) =>
    Number.isFinite(sample?.timestampMs) && Number.isFinite(sample?.score));
  if (!validSamples.length) return [];

  const startMs = Math.min(...validSamples.map((sample) => sample.timestampMs));
  const endMs = Math.max(...validSamples.map((sample) => sample.timestampMs));
  const durationMs = Math.max(1, endMs - startMs);

  const totals = Array(bucketCount).fill(0);
  const counts = Array(bucketCount).fill(0);
  for (const sample of validSamples) {
    const index = Math.min(bucketCount - 1, Math.floor((sample.timestampMs - startMs) / durationMs * bucketCount));
    totals[index] += Math.max(0, Math.min(100, sample.score));
    counts[index] += 1;
  }
  return totals.map((total, index) => counts[index] ? total / counts[index] : null);
}

module.exports = { buildPerformanceTimeline };
