const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');

const screen = readFileSync('app/live-feedback/index.tsx', 'utf8');

assert.match(screen, /const \{ status: connectionStatus, connectionError, sendLandmarks, sendBodyVisibility, completeSession \} = useAiFeedbackSocket/);
assert.match(screen, /connectionStatus === 'connecting'/);
assert.match(screen, /AI 분석 서버 연결 중/);
assert.match(screen, /connectionStatus === 'disconnected'/);
assert.match(screen, /연결이 끊겼어요\. 재연결 중/);
assert.match(screen, /connectionStatus === 'connected' && feedbackScore !== null/);

console.log('websocket connection status contract verified');
