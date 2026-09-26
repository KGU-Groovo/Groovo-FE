import { useCallback, useEffect, useRef, useState } from 'react';

export type PoseLandmark = { x: number; y: number; z?: number; visibility?: number };

export type PentagonScores = {
  final_score: number;
  scores: Record<string, number>;
};

export type SessionSummary = PentagonScores & { window_count: number };

export type DcaFeedback = {
  score_100: number;
  highlight_joints: number[];
};

export type RealtimeFeedback = {
  type?: string;
  score: number;
  error?: string;
  feedback?: string;
  frame_idx?: number;
  timestamp_ms?: number;
  worst_joints?: number[];
  rule_score?: number;
  dca?: DcaFeedback;
  pentagon_scores?: PentagonScores;
  session_summary?: SessionSummary | null;
};

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';
type UseAiFeedbackSocketOptions = { url?: string; onFeedback: (feedback: RealtimeFeedback) => void; minIntervalMs?: number };

export function useAiFeedbackSocket({ url, onFeedback, minIntervalMs = 33 }: UseAiFeedbackSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentAtRef = useRef(0);
  const frameIndexRef = useRef(0);
  const bodyVisibilityRef = useRef<boolean | null>(null);
  const completionRef = useRef<{ resolve: (summary: SessionSummary | null) => void; timeout: ReturnType<typeof setTimeout> } | null>(null);
  const onFeedbackRef = useRef(onFeedback);
  const [status, setStatus] = useState<ConnectionStatus>(url ? 'connecting' : 'idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  onFeedbackRef.current = onFeedback;

  const settleCompletion = useCallback((summary: SessionSummary | null) => {
    const pending = completionRef.current;
    if (!pending) return;
    clearTimeout(pending.timeout);
    completionRef.current = null;
    pending.resolve(summary);
  }, []);

  useEffect(() => {
    if (!url) { setStatus('idle'); return; }
    let disposed = false;
    const connect = () => {
      setStatus('connecting');
      const socket = new WebSocket(url);
      socketRef.current = socket;
      socket.onopen = () => {
        bodyVisibilityRef.current = null;
        setConnectionError(null);
        setStatus('connected');
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as Partial<RealtimeFeedback>;
          if (typeof message.error === 'string') setConnectionError(message.error);
          if (message.type === 'session_summary') {
            const summary = message.session_summary;
            settleCompletion(
              summary && Number.isFinite(summary.final_score) && Number.isInteger(summary.window_count)
                ? summary as SessionSummary
                : null,
            );
            return;
          }
          if (Number.isFinite(message.score)) onFeedbackRef.current(message as RealtimeFeedback);
        } catch {
          // Ignore messages outside the realtime protocol.
        }
      };
      socket.onclose = (event) => {
        if (disposed) return;
        setStatus('disconnected');
        if (event.code === 4003 || event.code === 4004) return;
        retryTimerRef.current = setTimeout(connect, 1000);
      };
    };
    connect();
    return () => {
      disposed = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      settleCompletion(null);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [settleCompletion, url]);

  const send = useCallback((payload: object) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return false;
    socket.send(JSON.stringify(payload));
    return true;
  }, []);

  const sendLandmarks = useCallback((landmarks: PoseLandmark[], timestampMs: number, cameraAspectRatio?: number) => {
    const now = Date.now();
    if (now - lastSentAtRef.current < minIntervalMs || landmarks.length !== 33) return false;
    const keypoints = landmarks.map(({ x, y, z = 0 }) => [x, y, z]);
    if (!Number.isFinite(timestampMs) || !keypoints.every((point) => point.every(Number.isFinite))) return false;
    const payload: {
      keypoints: number[][];
      frame_idx: number;
      timestamp_ms: number;
      camera_aspect_ratio?: number;
    } = {
      keypoints,
      frame_idx: frameIndexRef.current++,
      timestamp_ms: Math.max(0, Math.round(timestampMs)),
    };
    if (Number.isFinite(cameraAspectRatio) && cameraAspectRatio! > 0) {
      payload.camera_aspect_ratio = cameraAspectRatio;
    }
    const sent = send(payload);
    if (sent) lastSentAtRef.current = now;
    return sent;
  }, [minIntervalMs, send]);

  const sendBodyVisibility = useCallback((visible: boolean) => {
    if (bodyVisibilityRef.current === visible) return false;
    const sent = send({ body_visible: visible });
    if (sent) bodyVisibilityRef.current = visible;
    return sent;
  }, [send]);

  const completeSession = useCallback(() => new Promise<SessionSummary | null>((resolve) => {
    if (!send({ type: 'complete' })) {
      resolve(null);
      return;
    }
    completionRef.current = {
      resolve,
      timeout: setTimeout(() => settleCompletion(null), 1500),
    };
  }), [send, settleCompletion]);

  return { status, connectionError, sendLandmarks, sendBodyVisibility, completeSession };
}
