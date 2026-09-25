// 데모 자동 로그인 → BE session 생성 → AI WebSocket 연결/종료 흐름 테스트 (실제 서버 없이 mock 사용).
const assert = require('node:assert/strict');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { createTsLoader, root } = require('./ts-module-loader.cjs');

// ── 테스트용 가짜 환경 ─────────────────────────────────────────────

const API_BASE_URL = 'http://be.test:8080/api';
const wrap = (data) => ({ success: true, code: 'SUCCESS', message: 'ok', data, timestamp: '2026-09-25T04:00:00Z' });
const TOKEN = { access_token: 'access-jwt-1', token_type: 'Bearer', expires_in: 1800 };
const SESSION = { session_id: 's-1', ws_token: 'ws.jwt+/=', ws_url: 'wss://ai.test/ws/analyze', expires_in: 1800 };

// 경로별 응답을 돌려주는 fetch mock. 호출 기록을 남긴다.
function installFetch(routes) {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url, init, body: init.body ? JSON.parse(init.body) : undefined });
    const route = routes[url.replace(API_BASE_URL, '')];
    if (!route) throw new Error(`unexpected fetch ${url}`);
    const [status, body] = route;
    return { ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) };
  };
  return calls;
}

function setEnv({ baseUrl = API_BASE_URL, email = 'demo@groovo.test', password = 'demo-password' } = {}) {
  for (const [key, value] of Object.entries({
    EXPO_PUBLIC_API_BASE_URL: baseUrl,
    EXPO_PUBLIC_DEMO_EMAIL: email,
    EXPO_PUBLIC_DEMO_PASSWORD: password,
  })) {
    if (value === null) delete process.env[key];
    else process.env[key] = value;
  }
}

// React stub: 한 번 렌더링하면서 effect를 즉시 실행하고 state 변경 이력을 남긴다.
function createReactStub() {
  const states = [];
  const cleanups = [];
  return {
    states,
    cleanups,
    react: {
      useRef: (value) => ({ current: value }),
      useState: (initial) => {
        const cell = { value: initial, history: [initial] };
        states.push(cell);
        const set = (next) => {
          cell.value = typeof next === 'function' ? next(cell.value) : next;
          cell.history.push(cell.value);
        };
        return [initial, set];
      },
      useEffect: (effect) => {
        cleanups.push(effect());
      },
      useCallback: (fn) => fn,
    },
  };
}

class FakeWebSocket {
  static OPEN = 1;
  static instances = [];
  constructor(url) {
    this.url = url;
    this.readyState = 0;
    this.sent = [];
    this.closedWith = null;
    FakeWebSocket.instances.push(this);
  }
  send(data) { this.sent.push(JSON.parse(data)); }
  close(code = 1000, reason = '') { this.closedWith = { code, reason }; this.readyState = 3; }
  serverOpen() { this.readyState = 1; this.onopen?.(); }
  serverMessage(message) { this.onmessage?.({ data: JSON.stringify(message) }); }
  serverClose(code, reason = '') { this.readyState = 3; this.onclose?.({ code, reason }); }
}

function installFakeTimers() {
  const timers = [];
  global.setTimeout = (fn) => { timers.push(fn); return timers.length; };
  global.clearTimeout = (id) => { timers[id - 1] = null; };
  return () => { const pending = timers.splice(0).filter(Boolean); pending.forEach((fn) => fn()); return pending.length; };
}

const flush = () => new Promise((resolve) => setImmediate(resolve));

(async () => {
  // ── 1. 데모 자동 로그인 + access token 메모리 관리 ─────────────────
  {
    setEnv();
    const calls = installFetch({ '/v1/auth/login': [200, wrap(TOKEN)] });
    const auth = createTsLoader()('api/demo-auth.ts');
    let now = 1_000_000;
    const clock = () => now;

    // 기존 login() → /api/v1/auth/login → data.access_token
    assert.equal(await auth.getAccessToken({ now: clock }), 'access-jwt-1');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, `${API_BASE_URL}/v1/auth/login`);
    assert.deepEqual(calls[0].body, { email: 'demo@groovo.test', password: 'demo-password' });

    // 메모리 캐시: 만료 전에는 다시 로그인하지 않는다.
    assert.equal(await auth.getAccessToken({ now: clock }), 'access-jwt-1');
    assert.equal(calls.length, 1);

    // 만료(30초 여유 포함) 후에는 다시 로그인한다.
    now += (TOKEN.expires_in - 29) * 1000;
    await auth.getAccessToken({ now: clock });
    assert.equal(calls.length, 2);

    // 동시에 요청돼도 로그인은 한 번만.
    auth.clearAccessToken();
    await Promise.all([auth.getAccessToken({ now: clock }), auth.getAccessToken({ now: clock })]);
    assert.equal(calls.length, 3);
  }
  // 계정 미설정 → 로그인 호출 없이 개발 설정 오류
  {
    setEnv({ email: null, password: null });
    const calls = installFetch({});
    const auth = createTsLoader()('api/demo-auth.ts');
    assert.equal(auth.getDemoCredentials(), null);
    await assert.rejects(auth.getAccessToken(), { code: 'MISSING_DEMO_CREDENTIALS' });
    assert.equal(calls.length, 0);
  }
  // 로그인 실패 → 오류 전달, 토큰 캐시 안 됨, 다음 시도에서 다시 로그인
  {
    setEnv();
    const calls = installFetch({
      '/v1/auth/login': [401, { success: false, code: 'INVALID_CREDENTIALS', message: '이메일 또는 비밀번호가 올바르지 않습니다.', data: null }],
    });
    const auth = createTsLoader()('api/demo-auth.ts');
    await assert.rejects(auth.getAccessToken(), { status: 401, code: 'INVALID_CREDENTIALS' });
    await assert.rejects(auth.getAccessToken(), { code: 'INVALID_CREDENTIALS' });
    assert.equal(calls.length, 2);
  }

  // ── 2. 학습 시작: video_id 확인 → 인증 → session 생성 ────────────────
  // video_id가 없는 곡: 로그인/Session API 모두 호출하지 않는다.
  {
    setEnv();
    const calls = installFetch({ '/v1/auth/login': [200, wrap(TOKEN)], '/v1/sessions': [201, wrap(SESSION)] });
    const load = createTsLoader();
    const { startAnalysisSession } = load('api/analysis-session.ts');
    const { SONG_VIDEO_IDS } = load('data/song-videos.ts');
    const unmapped = ['hollywood-action', 'rude', 'its-me', 'wda'].filter((id) => SONG_VIDEO_IDS[id] === undefined);
    for (const songId of unmapped) {
      await assert.rejects(startAnalysisSession(songId), { code: 'MISSING_VIDEO_ID' });
    }
    assert.equal(calls.length, 0);
    // 매핑 모듈에는 확정된 정수 video_id만 들어갈 수 있다.
    for (const value of Object.values(SONG_VIDEO_IDS)) assert.ok(Number.isInteger(value) && value > 0);
  }
  // video_id가 있으면(테스트에서만 주입) 로그인 → Bearer token으로 session 생성
  {
    setEnv();
    const calls = installFetch({ '/v1/auth/login': [200, wrap(TOKEN)], '/v1/sessions': [201, wrap(SESSION)] });
    const { startAnalysisSession } = createTsLoader()('api/analysis-session.ts');
    const session = await startAnalysisSession('test-song', { getVideoIdImpl: () => 7 });
    assert.deepEqual(session, SESSION);
    assert.deepEqual(calls.map((c) => c.url), [`${API_BASE_URL}/v1/auth/login`, `${API_BASE_URL}/v1/sessions`]);
    assert.equal(calls[0].init.headers.Authorization, undefined, 'login은 토큰 없이 호출');
    assert.equal(calls[1].init.headers.Authorization, 'Bearer access-jwt-1', 'session은 로그인 토큰으로 호출');
    assert.deepEqual(calls[1].body, { video_id: 7 });
  }
  // 로그인 실패 시 Session API를 호출하지 않는다.
  {
    setEnv();
    const calls = installFetch({ '/v1/auth/login': [401, { success: false, code: 'INVALID_CREDENTIALS', message: 'x', data: null }] });
    const { startAnalysisSession } = createTsLoader()('api/analysis-session.ts');
    await assert.rejects(startAnalysisSession('test-song', { getVideoIdImpl: () => 7 }), { code: 'INVALID_CREDENTIALS' });
    assert.equal(calls.length, 1);
  }
  // session 생성 실패(401/404)는 그대로 전달
  {
    setEnv();
    installFetch({ '/v1/auth/login': [200, wrap(TOKEN)], '/v1/sessions': [404, { success: false, code: 'VIDEO_NOT_FOUND', message: '존재하지 않는 영상입니다.', data: null }] });
    const { startAnalysisSession } = createTsLoader()('api/analysis-session.ts');
    await assert.rejects(startAnalysisSession('test-song', { getVideoIdImpl: () => 999 }), { status: 404, code: 'VIDEO_NOT_FOUND' });
  }

  // ── 3. useAnalysisSession: 학습 1회당 session 1개, video_id 없으면 오류 상태 ─
  {
    setEnv();
    const calls = installFetch({});
    const { react, states } = createReactStub();
    const { useAnalysisSession } = createTsLoader({ stubs: { react } })('hooks/use-analysis-session.ts');
    const initial = useAnalysisSession('unregistered-song');
    assert.equal(initial.status, 'preparing');
    await flush();
    const last = states[0].value;
    assert.equal(last.status, 'error');
    assert.equal(last.error.code, 'MISSING_VIDEO_ID');
    assert.equal(calls.length, 0);
  }

  // ── 4. session → WebSocket 연결, 메시지 처리, 종료/재연결 ─────────────
  global.WebSocket = FakeWebSocket;
  const loadHook = () => {
    const stub = createReactStub();
    const hookModule = createTsLoader({ stubs: { react: stub.react } })('hooks/use-ai-feedback-socket.ts');
    return { ...stub, useAiFeedbackSocket: hookModule.useAiFeedbackSocket };
  };

  // session 없음(video_id 미등록 등) → 연결 시도 자체를 하지 않는다.
  {
    FakeWebSocket.instances = [];
    const { useAiFeedbackSocket, states } = loadHook();
    useAiFeedbackSocket({ session: null, onFeedback: () => {} });
    assert.equal(FakeWebSocket.instances.length, 0);
    assert.equal(states[0].value, 'idle');
  }
  // session → `${ws_url}?token=${ws_token}`, feedback만 전달, keypoint payload 유지
  {
    FakeWebSocket.instances = [];
    installFakeTimers();
    const received = [];
    const { useAiFeedbackSocket } = loadHook();
    const { sendLandmarks } = useAiFeedbackSocket({ session: SESSION, onFeedback: (f) => received.push(f), minIntervalMs: 0 });
    const socket = FakeWebSocket.instances[0];
    assert.equal(socket.url, 'wss://ai.test/ws/analyze?token=ws.jwt%2B%2F%3D');
    socket.serverOpen();
    socket.serverMessage({ status: 'ready', video_id: 1 });
    socket.serverMessage({ type: 'feedback', score: 0.9, feedback: 'Good!', message: 'Good!', frame_idx: 0, worst_joints: [] });
    socket.serverMessage({ warning: '서버 수신 지연 중입니다.', score: 0.9, frame_idx: 0 });
    assert.equal(received.length, 1, 'warning/ready는 onFeedback으로 전달되지 않는다');

    const landmarks = Array.from({ length: 33 }, (_, i) => ({ x: i / 100, y: 0.5, visibility: 0.9 }));
    assert.equal(sendLandmarks(landmarks, 1234.4), true);
    assert.deepEqual(Object.keys(socket.sent[0]).sort(), ['frame_idx', 'keypoints', 'timestamp_ms']);
    assert.equal(socket.sent[0].frame_idx, 0);
    assert.equal(socket.sent[0].timestamp_ms, 1234);
    assert.deepEqual(socket.sent[0].keypoints[1], [0.01, 0.5, 0]);
  }
  // 4001~4004: 재연결하지 않음
  for (const code of [4001, 4002, 4003, 4004]) {
    FakeWebSocket.instances = [];
    const runTimers = installFakeTimers();
    const { useAiFeedbackSocket, states } = loadHook();
    useAiFeedbackSocket({ session: SESSION, onFeedback: () => {} });
    FakeWebSocket.instances[0].serverClose(code, 'rejected');
    assert.equal(runTimers(), 0, `${code}: 재연결 타이머가 없어야 한다`);
    assert.equal(FakeWebSocket.instances.length, 1);
    assert.equal(states[0].value, 'failed');
    assert.deepEqual(states[1].value, { code, reason: 'rejected' });
  }
  // 일시적 종료(1006): 기존처럼 재연결
  {
    FakeWebSocket.instances = [];
    const runTimers = installFakeTimers();
    const { useAiFeedbackSocket } = loadHook();
    useAiFeedbackSocket({ session: SESSION, onFeedback: () => {} });
    FakeWebSocket.instances[0].serverClose(1006);
    assert.equal(runTimers(), 1);
    assert.equal(FakeWebSocket.instances.length, 2);
    assert.equal(FakeWebSocket.instances[1].url, FakeWebSocket.instances[0].url);
  }
  // 학습 종료: disconnect() → 정상 종료(1000), 이후 재연결 없음
  {
    FakeWebSocket.instances = [];
    const runTimers = installFakeTimers();
    const { useAiFeedbackSocket, states } = loadHook();
    const { disconnect } = useAiFeedbackSocket({ session: SESSION, onFeedback: () => {} });
    const socket = FakeWebSocket.instances[0];
    socket.serverOpen();
    disconnect();
    assert.deepEqual(socket.closedWith, { code: 1000, reason: 'session finished' });
    socket.serverClose(1000, 'session finished');
    assert.equal(runTimers(), 0);
    assert.equal(FakeWebSocket.instances.length, 1);
    assert.equal(states[0].value, 'closed');
  }
  // 화면 이탈(unmount): effect cleanup으로 소켓을 닫는다.
  {
    FakeWebSocket.instances = [];
    installFakeTimers();
    const { useAiFeedbackSocket, cleanups } = loadHook();
    useAiFeedbackSocket({ session: SESSION, onFeedback: () => {} });
    cleanups.forEach((cleanup) => cleanup?.());
    assert.ok(FakeWebSocket.instances[0].closedWith);
  }

  // ── 5. 학습 화면 상태 문구 ───────────────────────────────────────
  {
    const { getSessionStatusMessage } = createTsLoader()('components/live-feedback/session-status.ts');
    assert.equal(getSessionStatusMessage({ sessionStatus: 'preparing', socketStatus: 'idle' }), '분석 서버 연결 준비 중...');
    assert.match(
      getSessionStatusMessage({ sessionStatus: 'error', sessionError: { code: 'MISSING_VIDEO_ID', message: "'wda' 곡의 video_id가 등록되지 않았습니다." }, socketStatus: 'idle' }),
      /^\[개발 설정 필요\] 'wda' 곡의 video_id/,
    );
    assert.match(getSessionStatusMessage({ sessionStatus: 'error', sessionError: { code: 'UNAUTHORIZED', message: '인증이 필요합니다.' }, socketStatus: 'idle' }), /분석 세션을 만들지 못했습니다/);
    assert.match(getSessionStatusMessage({ sessionStatus: 'ready', socketStatus: 'failed', closeCode: 4002 }), /code 4002/);
    assert.equal(getSessionStatusMessage({ sessionStatus: 'ready', socketStatus: 'connected' }), null);
    assert.equal(getSessionStatusMessage({ sessionStatus: 'ready', socketStatus: 'closed' }), null);
  }

  // ── 6. 학습 화면 연결 계약 (소스 확인) ──────────────────────────────
  {
    const screen = readFileSync(path.join(root, 'app/live-feedback/index.tsx'), 'utf8');
    assert.match(screen, /const analysisSession = useAnalysisSession\(song\.id\);/);
    assert.match(screen, /session: analysisSession\.session,/);
    assert.equal(screen.includes('reference_id'), false, '학습 화면은 reference_id로 직접 연결하지 않는다');
    assert.equal(screen.includes('EXPO_PUBLIC_AI_WEBSOCKET_URL'), false);
    assert.match(screen, /const showResult = \(\) => \{\s*disconnect\(\);\s*router\.replace\(\{/, '영상 종료 시 소켓을 닫고 결과 화면으로 이동');
    assert.match(screen, /onPlaybackEnd=\{showResult\}/);

    // access token 영구 저장 금지, 계정 정보는 tracked 파일에 값 없이 변수명만
    for (const file of ['api/client.ts', 'api/auth.ts', 'api/session.ts', 'api/demo-auth.ts', 'api/analysis-session.ts', 'hooks/use-analysis-session.ts', 'package.json']) {
      const source = readFileSync(path.join(root, file), 'utf8');
      assert.equal(/(from\s+|require\()\s*['"][^'"]*(async-storage|secure-store)|"[^"]*(async-storage|secure-store)"\s*:/.test(source), false, `${file}: 영구 저장소 사용 금지`);
    }
    const example = readFileSync(path.join(root, '.env.example'), 'utf8');
    assert.match(example, /^EXPO_PUBLIC_DEMO_EMAIL=$/m);
    assert.match(example, /^EXPO_PUBLIC_DEMO_PASSWORD=$/m);
  }

  console.log('demo login, analysis session and socket lifecycle verified');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
