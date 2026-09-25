import { login, LoginRequest, TokenResponse } from './auth';
import { ApiError } from './client';

// 데모 전용 자동 로그인.
//
// 주의: EXPO_PUBLIC_* 값은 앱 번들에 그대로 포함되므로 secret으로 보호되지 않는다.
// 반드시 데모 전용 계정만 로컬 .env(git 추적 안 함)에 넣어 사용한다. 실제 사용자 계정 금지.
// access token은 이 모듈의 메모리에만 두고 디스크(AsyncStorage/SecureStore 등)에 저장하지 않는다.

export function getDemoCredentials(): LoginRequest | null {
  const email = process.env.EXPO_PUBLIC_DEMO_EMAIL;
  const password = process.env.EXPO_PUBLIC_DEMO_PASSWORD;
  return email && password ? { email, password } : null;
}

type CachedToken = { value: string; expiresAt: number };

// 만료 직전 토큰으로 요청하지 않도록 여유를 둔다.
const EXPIRY_MARGIN_MS = 30_000;

let cachedToken: CachedToken | null = null;
let pendingLogin: Promise<string> | null = null;

export type AccessTokenOptions = {
  credentials?: LoginRequest | null;
  loginImpl?: (request: LoginRequest) => Promise<TokenResponse>;
  now?: () => number;
};

export async function getAccessToken({
  credentials = getDemoCredentials(),
  loginImpl = login,
  now = Date.now,
}: AccessTokenOptions = {}): Promise<string> {
  if (cachedToken && now() < cachedToken.expiresAt - EXPIRY_MARGIN_MS) return cachedToken.value;
  if (pendingLogin) return pendingLogin;
  if (!credentials) {
    throw new ApiError(0, '데모 계정이 설정되지 않았습니다. .env의 EXPO_PUBLIC_DEMO_EMAIL / EXPO_PUBLIC_DEMO_PASSWORD를 확인하세요.', 'MISSING_DEMO_CREDENTIALS');
  }

  pendingLogin = loginImpl(credentials)
    .then((token) => {
      cachedToken = { value: token.access_token, expiresAt: now() + token.expires_in * 1000 };
      return token.access_token;
    })
    .finally(() => {
      pendingLogin = null;
    });
  return pendingLogin;
}

export function clearAccessToken() {
  cachedToken = null;
}
