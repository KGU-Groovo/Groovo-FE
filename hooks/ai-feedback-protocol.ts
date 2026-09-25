// AI 서버(/ws/analyze) WebSocket 메시지 계약. React 의존성 없이 테스트할 수 있도록 hook과 분리한다.

export type PoseLandmark = { x: number; y: number; z?: number; visibility?: number };

export type PentagonScores = {
  final_score: number;
  scores: Record<string, number>;
};

export type DcaFeedback = {
  score_100: number;
  highlight_joints: number[];
};

// 매 프레임 실시간 피드백. score는 항상 해당 프레임의 규칙 기반 점수(0~1)이고,
// pentagon_scores / rule_score / dca는 30프레임마다만 포함된다.
export type RealtimeFeedback = {
  type: 'feedback';
  score: number;
  feedback?: string;
  message?: string;
  frame_idx?: number;
  worst_joints?: number[];
  rule_score?: number;
  dca?: DcaFeedback;
  pentagon_scores?: PentagonScores;
};

// BE POST /api/v1/sessions 응답 중 AI 접속에 필요한 값.
export type AiSocketSession = {
  ws_url: string;
  ws_token: string;
};

// AI 서버가 복구 불가능한 이유로 닫는 코드: 4001 토큰 오류, 4002 세션 없음,
// 4003 기준 keypoint 로드 실패, 4004 reference_id 오류. 같은 요청으로 다시 붙어도 실패한다.
export const FATAL_CLOSE_CODES: readonly number[] = [4001, 4002, 4003, 4004];

export function isFatalCloseCode(code?: number) {
  return code !== undefined && FATAL_CLOSE_CODES.includes(code);
}

export function buildSessionSocketUrl(session: AiSocketSession) {
  const separator = session.ws_url.includes('?') ? '&' : '?';
  return `${session.ws_url}${separator}token=${encodeURIComponent(session.ws_token)}`;
}

// ready / warning / error 메시지는 점수로 취급하지 않는다.
// (warning에는 직전 score가 다시 실려 오므로 score 유무만으로 판단하면 timeline에 중복된다.)
export function parseRealtimeFeedback(data: unknown): RealtimeFeedback | null {
  try {
    const message = JSON.parse(String(data)) as Partial<RealtimeFeedback>;
    if (message.type !== 'feedback' || !Number.isFinite(message.score)) return null;
    return message as RealtimeFeedback;
  } catch {
    return null;
  }
}
