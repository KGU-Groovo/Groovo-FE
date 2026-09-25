import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AiSocketSession,
  buildSessionSocketUrl,
  isFatalCloseCode,
  parseRealtimeFeedback,
  PoseLandmark,
  RealtimeFeedback,
} from './ai-feedback-protocol';

export type { AiSocketSession, DcaFeedback, PentagonScores, PoseLandmark, RealtimeFeedback } from './ai-feedback-protocol';

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed' | 'closed';
export type SocketCloseInfo = { code: number; reason: string };
type UseAiFeedbackSocketOptions = {
  // BE POST /api/v1/sessions 응답(ws_url, ws_token). 있으면 `${ws_url}?token=${ws_token}`으로 연결한다.
  session?: AiSocketSession | null;
  // session이 없을 때만 쓰는 직접 연결 URL (개발용).
  url?: string;
  onFeedback: (feedback: RealtimeFeedback) => void;
  minIntervalMs?: number;
};

export function useAiFeedbackSocket({ session, url, onFeedback, minIntervalMs = 33 }: UseAiFeedbackSocketOptions) {
  const socketUrl = session ? buildSessionSocketUrl(session) : url;
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentAtRef = useRef(0);
  const frameIndexRef = useRef(0);
  const stoppedRef = useRef(false);
  const onFeedbackRef = useRef(onFeedback);
  const [status, setStatus] = useState<ConnectionStatus>(socketUrl ? 'connecting' : 'idle');
  const [closeInfo, setCloseInfo] = useState<SocketCloseInfo | null>(null);
  onFeedbackRef.current = onFeedback;

  useEffect(() => {
    setCloseInfo(null);
    stoppedRef.current = false;
    if (!socketUrl) { setStatus('idle'); return; }
    let disposed = false;
    const connect = () => {
      setStatus('connecting');
      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;
      socket.onopen = () => setStatus('connected');
      socket.onmessage = (event) => {
        const feedback = parseRealtimeFeedback(event.data);
        if (feedback) onFeedbackRef.current(feedback);
      };
      socket.onclose = (event) => {
        if (disposed || stoppedRef.current) return;
        if (isFatalCloseCode(event.code)) {
          // 토큰/세션/reference 오류는 같은 URL로 다시 붙어도 실패하므로 재연결하지 않는다.
          setStatus('failed');
          setCloseInfo({ code: event.code, reason: event.reason });
          return;
        }
        setStatus('disconnected');
        retryTimerRef.current = setTimeout(connect, 1000);
      };
    };
    connect();
    return () => {
      disposed = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [socketUrl]);

  // 학습 종료(영상 끝) 시 호출: 연결을 닫고 이후 재연결하지 않는다.
  const disconnect = useCallback(() => {
    stoppedRef.current = true;
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    socketRef.current?.close(1000, 'session finished');
    socketRef.current = null;
    setStatus('closed');
  }, []);

  const send = useCallback((payload: object) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const sendLandmarks = useCallback((landmarks: PoseLandmark[], timestampMs: number) => {
    const now = Date.now();
    if (now - lastSentAtRef.current < minIntervalMs || landmarks.length !== 33) return false;
    const keypoints = landmarks.map(({ x, y, z = 0 }) => [x, y, z]);
    if (!Number.isFinite(timestampMs) || !keypoints.every((point) => point.every(Number.isFinite))) return false;
    const sent = send({
      keypoints,
      frame_idx: frameIndexRef.current++,
      timestamp_ms: Math.max(0, Math.round(timestampMs)),
    });
    if (sent) lastSentAtRef.current = now;
    return sent;
  }, [minIntervalMs, send]);

  return { status, closeInfo, sendLandmarks, disconnect };
}
