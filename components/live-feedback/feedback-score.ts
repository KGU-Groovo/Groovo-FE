export type FeedbackState = {
  label: string;
  color: string;
};

const PENDING_FEEDBACK: FeedbackState = {
  label: '분석 대기',
  color: '#64748B',
};

export function getFeedbackState(score: number | null): FeedbackState {
  if (!Number.isFinite(score) || score === null || score < 0 || score > 100) {
    return PENDING_FEEDBACK;
  }

  if (score < 60) return { label: '자세 교정 필요', color: '#EF4444' };
  if (score < 80) return { label: '자세 확인', color: '#EAB308' };
  return { label: '좋은 자세', color: '#22C55E' };
}
