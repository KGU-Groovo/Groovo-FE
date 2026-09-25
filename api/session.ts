import { apiRequest, ApiRequestOptions } from './client';

// POST /api/v1/sessions (BE SessionController.create → SessionCreateResponse)
export type AnalysisSession = {
  session_id: string;
  ws_token: string;
  ws_url: string;
  expires_in: number;
};

type RequestConfig = Pick<ApiRequestOptions, 'baseUrl' | 'fetchImpl'>;

// 분석 세션을 만들고 AI WebSocket 접속 정보(ws_url, ws_token)를 받는다. access token 필수.
export function createSession(accessToken: string, videoId: number, config: RequestConfig = {}) {
  return apiRequest<AnalysisSession>('/v1/sessions', {
    ...config,
    method: 'POST',
    accessToken,
    body: { video_id: videoId },
  });
}
