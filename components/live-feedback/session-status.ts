type SessionStatusInput = {
  sessionStatus: 'preparing' | 'ready' | 'error';
  sessionError?: { code?: string; message: string } | null;
  socketStatus: string;
  closeCode?: number | null;
};

const DEV_SETUP_ERRORS = ['MISSING_VIDEO_ID', 'MISSING_DEMO_CREDENTIALS', 'MISSING_API_BASE_URL'];

// 학습 화면 하단에 띄울 분석 연결 상태 문구. 정상 연결 중이면 null.
export function getSessionStatusMessage({ sessionStatus, sessionError, socketStatus, closeCode }: SessionStatusInput): string | null {
  if (sessionStatus === 'preparing') return '분석 서버 연결 준비 중...';
  if (sessionStatus === 'error') {
    if (sessionError?.code && DEV_SETUP_ERRORS.includes(sessionError.code)) return `[개발 설정 필요] ${sessionError.message}`;
    return `분석 세션을 만들지 못했습니다. ${sessionError?.message ?? ''}`.trim();
  }
  if (socketStatus === 'failed') return `AI 분석 서버가 연결을 거부했습니다. (code ${closeCode ?? '-'})`;
  if (socketStatus === 'connecting' || socketStatus === 'disconnected') return 'AI 분석 서버에 연결 중...';
  return null;
}
