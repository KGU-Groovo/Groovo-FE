const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(screen, /const \{ status: connectionStatus, connectionError, sendLandmarks, sendBodyVisibility, completeSession \} = useAiFeedbackSocket/);
assert.match(screen, /connectionStatus === 'connecting'/);
assert.match(screen, /AI 분석 서버 연결 중/);
assert.match(screen, /connectionStatus === 'disconnected'/);
assert.match(screen, /연결이 끊겼어요\. 재연결 중/);
assert.match(screen, /connectionStatus === 'connected' && feedbackScore !== null/);

const hook = readFileSync('hooks/use-ai-feedback-socket.ts', 'utf8');
assert.match(hook, /retryAttemptRef/);
assert.match(hook, /Math\.min\(10000, 1000 \* 2 \*\* retryAttemptRef\.current\+\+\)/);
assert.match(hook, /retryAttemptRef\.current = 0/);

console.log('websocket connection status contract verified');
