// Groovo BE(Spring Boot) HTTP API 공통 client.
//
// BE는 모든 성공 응답을 ApiResponse로 감싼다:
//   { success: true, code: 'SUCCESS', message, data: <실제 응답>, timestamp }
// 실패 응답은 { success: false, code, message, data: null, timestamp }이고,
// 403(Spring Security)만 { code, message } 형태로 온다.

export type ApiResponse<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
  timestamp?: string;
};

// 네트워크 오류는 status 0, 응답 본문을 해석할 수 없으면 code가 없을 수 있다.
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type ApiRequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  accessToken?: string;
  // BE base URL: server.servlet.context-path(/api)까지 포함한다. 예) http://<host>:8080/api
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

// Expo는 process.env.EXPO_PUBLIC_* 를 빌드 시점에 문자열로 치환하므로 점 표기로 직접 읽어야 한다.
export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL;
}

export function joinApiUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { method = 'GET', body, accessToken, baseUrl = getApiBaseUrl(), fetchImpl = fetch } = options;
  if (!baseUrl) throw new ApiError(0, 'EXPO_PUBLIC_API_BASE_URL이 설정되지 않았습니다.', 'MISSING_API_BASE_URL');

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetchImpl(joinApiUrl(baseUrl, path), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    throw new ApiError(0, error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.', 'NETWORK_ERROR');
  }

  const payload = await readJson(response);
  if (!response.ok || payload?.success === false) {
    throw new ApiError(response.status, payload?.message ?? `요청이 실패했습니다. (HTTP ${response.status})`, payload?.code);
  }
  if (!payload || payload.data === undefined || payload.data === null) {
    throw new ApiError(response.status, '응답에 data가 없습니다.', 'EMPTY_RESPONSE');
  }
  return payload.data as T;
}

async function readJson(response: Response): Promise<Partial<ApiResponse<unknown>> | null> {
  try {
    const text = await response.text();
    return text ? (JSON.parse(text) as Partial<ApiResponse<unknown>>) : null;
  } catch {
    return null;
  }
}
