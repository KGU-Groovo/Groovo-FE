// BE Session/Auth API layer와 AI WebSocket 메시지 계약 테스트 (실제 서버 없이 mock fetch 사용).
const assert = require('node:assert/strict');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { createTsLoader, root } = require('./ts-module-loader.cjs');

const loadTs = createTsLoader();

function mockFetch(status, body) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({ url, init });
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (body === undefined ? '' : JSON.stringify(body)),
    };
  };
  return { calls, fetchImpl };
}

const { apiRequest, ApiError, joinApiUrl } = loadTs('api/client.ts');
const { createSession } = loadTs('api/session.ts');
const { login } = loadTs('api/auth.ts');
const protocol = loadTs('hooks/ai-feedback-protocol.ts');

const baseUrl = 'http://be.test:8080/api';
const sessionData = {
  session_id: '550e8400-e29b-41d4-a716-446655440000',
  ws_token: 'header.payload+/=.signature',
  ws_url: 'wss://ai.test/ws/analyze',
  expires_in: 1800,
};
const wrap = (data) => ({ success: true, code: 'SUCCESS', message: '요청이 성공적으로 처리되었습니다.', data, timestamp: '2026-09-25T04:00:00Z' });

(async () => {
  // URL 결합: context-path(/api)가 포함된 base URL과 /v1 경로
  assert.equal(joinApiUrl('http://h/api/', '/v1/sessions'), 'http://h/api/v1/sessions');

  // Session API: 경로, 메서드, Authorization, JSON body, data 추출
  {
    const { calls, fetchImpl } = mockFetch(201, wrap(sessionData));
    const session = await createSession('access-token-1', 3, { baseUrl, fetchImpl });
    assert.deepEqual(session, sessionData);
    assert.equal(calls[0].url, 'http://be.test:8080/api/v1/sessions');
    assert.equal(calls[0].init.method, 'POST');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer access-token-1');
    assert.equal(calls[0].init.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(calls[0].init.body), { video_id: 3 });
  }

  // Auth API: 토큰 없이 호출, data.access_token 추출
  {
    const token = { access_token: 'jwt', token_type: 'Bearer', expires_in: 1800 };
    const { calls, fetchImpl } = mockFetch(200, wrap(token));
    assert.deepEqual(await login({ email: 'a@b.c', password: 'pw' }, { baseUrl, fetchImpl }), token);
    assert.equal(calls[0].url, 'http://be.test:8080/api/v1/auth/login');
    assert.equal(calls[0].init.headers.Authorization, undefined);
  }

  // 오류: BE 공통 실패 응답 → status/code/message 전달
  {
    const { fetchImpl } = mockFetch(401, { success: false, code: 'UNAUTHORIZED', message: '인증이 필요합니다.', data: null });
    await assert.rejects(createSession('expired', 1, { baseUrl, fetchImpl }), (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 401);
      assert.equal(error.code, 'UNAUTHORIZED');
      assert.equal(error.message, '인증이 필요합니다.');
      return true;
    });
  }
  {
    const { fetchImpl } = mockFetch(404, { success: false, code: 'VIDEO_NOT_FOUND', message: '존재하지 않는 영상입니다.', data: null });
    await assert.rejects(createSession('t', 999, { baseUrl, fetchImpl }), { status: 404, code: 'VIDEO_NOT_FOUND' });
  }
  // 403은 Spring Security가 { code, message }만 보낸다.
  {
    const { fetchImpl } = mockFetch(403, { code: 'FORBIDDEN', message: '접근 권한이 없습니다.' });
    await assert.rejects(apiRequest('/v1/sessions', { baseUrl, fetchImpl }), { status: 403, code: 'FORBIDDEN' });
  }
  // JSON이 아닌 오류 본문, 네트워크 오류, base URL 누락, data 누락
  {
    const fetchImpl = async () => ({ ok: false, status: 502, text: async () => '<html>Bad Gateway</html>' });
    await assert.rejects(apiRequest('/v1/sessions', { baseUrl, fetchImpl }), { status: 502, code: undefined });
  }
  await assert.rejects(
    apiRequest('/v1/sessions', { baseUrl, fetchImpl: async () => { throw new TypeError('Network request failed'); } }),
    { status: 0, code: 'NETWORK_ERROR' },
  );
  await assert.rejects(apiRequest('/v1/sessions', { baseUrl: '', fetchImpl: async () => { throw new Error('must not call'); } }), { code: 'MISSING_API_BASE_URL' });
  {
    const { fetchImpl } = mockFetch(200, wrap(null));
    await assert.rejects(apiRequest('/v1/sessions', { baseUrl, fetchImpl }), { code: 'EMPTY_RESPONSE' });
  }

  // WebSocket URL: `${ws_url}?token=${ws_token}` (token은 URL 인코딩)
  assert.equal(
    protocol.buildSessionSocketUrl(sessionData),
    'wss://ai.test/ws/analyze?token=header.payload%2B%2F%3D.signature',
  );
  assert.equal(protocol.buildSessionSocketUrl({ ws_url: 'wss://ai.test/ws/analyze?x=1', ws_token: 't' }), 'wss://ai.test/ws/analyze?x=1&token=t');

  // feedback 필터: type === 'feedback'만 점수로 사용
  const feedback = { type: 'feedback', score: 0.91, feedback: 'Good!', message: 'Good!', frame_idx: 3, worst_joints: [15] };
  assert.deepEqual(protocol.parseRealtimeFeedback(JSON.stringify(feedback)), feedback);
  const windowFeedback = { ...feedback, rule_score: 0.91, dca: { score_100: 87, highlight_joints: [11, 13] }, pentagon_scores: { final_score: 80, scores: { accuracy: 80 } } };
  assert.deepEqual(protocol.parseRealtimeFeedback(JSON.stringify(windowFeedback)), windowFeedback);
  assert.equal(protocol.parseRealtimeFeedback(JSON.stringify({ warning: '서버 수신 지연 중입니다.', score: 0.91, frame_idx: 3 })), null);
  assert.equal(protocol.parseRealtimeFeedback(JSON.stringify({ warning: '연결이 불안정합니다.', recommend_pause: true, score: 0.5 })), null);
  assert.equal(protocol.parseRealtimeFeedback(JSON.stringify({ status: 'ready', video_id: 1 })), null);
  assert.equal(protocol.parseRealtimeFeedback(JSON.stringify({ error: 'keypoints 필드 누락' })), null);
  assert.equal(protocol.parseRealtimeFeedback(JSON.stringify({ score: 0.9 })), null, 'type 없는 메시지는 무시');
  assert.equal(protocol.parseRealtimeFeedback(JSON.stringify({ type: 'feedback', score: null })), null);
  assert.equal(protocol.parseRealtimeFeedback('not json'), null);

  // 재연결 불가 close code
  for (const code of [4001, 4002, 4003, 4004]) assert.equal(protocol.isFatalCloseCode(code), true, `${code}`);
  for (const code of [1000, 1001, 1006, 1011, 4000, 4005, undefined]) assert.equal(protocol.isFatalCloseCode(code), false, `${code}`);

  // hook 계약: 메시지 필터·재연결 중단·session URL 사용 (React 실행 없이 소스 확인)
  const hook = readFileSync(path.join(root, 'hooks/use-ai-feedback-socket.ts'), 'utf8');
  assert.match(hook, /const feedback = parseRealtimeFeedback\(event\.data\);\s*if \(feedback\) onFeedbackRef\.current\(feedback\);/);
  assert.match(hook, /if \(isFatalCloseCode\(event\.code\)\) \{[\s\S]*?return;\s*\}\s*setStatus\('disconnected'\);\s*retryTimerRef\.current = setTimeout\(connect, 1000\);/);
  assert.match(hook, /const socketUrl = session \? buildSessionSocketUrl\(session\) : url;/);
  assert.match(hook, /\}, \[socketUrl\]\);/);

  // live screen: timeline(scoreHistory)은 onFeedback 안에서만 갱신된다.
  const screen = readFileSync(path.join(root, 'app/live-feedback/index.tsx'), 'utf8');
  assert.equal((screen.match(/scoreHistory\.current = /g) ?? []).length, 1);
  assert.match(screen, /onFeedback: \(feedback\) => \{\s*const score = [^\n]+\n\s*scoreHistory\.current = /);

  console.log('session API and AI socket contract verified');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
