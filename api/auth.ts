import { apiRequest, ApiRequestOptions } from './client';

// POST /api/v1/auth/login (BE AuthController.login → TokenResponse)
export type LoginRequest = {
  email: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

type RequestConfig = Pick<ApiRequestOptions, 'baseUrl' | 'fetchImpl'>;

// 로그인 API 호출만 담당한다. 계정 제공 방식·토큰 저장 방식은 아직 정해지지 않았다.
export function login(request: LoginRequest, config: RequestConfig = {}) {
  return apiRequest<TokenResponse>('/v1/auth/login', { ...config, method: 'POST', body: request });
}
