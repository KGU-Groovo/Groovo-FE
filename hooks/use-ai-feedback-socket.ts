import { useCallback, useEffect, useRef, useState } from 'react';

export type PoseLandmark = { x: number; y: number; z?: number; visibility?: number };

export type PentagonScores = {
  final_score: number;
  scores: Record<string, number>;
};

export type DcaFeedback = {
  score_100: number;
  highlight_joints: number[];
};

export type RealtimeFeedback = {
  score: number;
  error?: string;
  feedback?: string;
  frame_idx?: number;
  worst_joints?: number[];
  rule_score?: number;
  dca?: DcaFeedback;
  pentagon_scores?: PentagonScores;
};

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';
type UseAiFeedbackSocketOptions = { url?: string; onFeedback: (feedback: RealtimeFeedback) => void; minIntervalMs?: number };

export function useAiFeedbackSocket({ url, onFeedback, minIntervalMs = 33 }: UseAiFeedbackSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentAtRef = useRef(0);
  const frameIndexRef = useRef(0);
  const onFeedbackRef = useRef(onFeedback);
  const [status, setStatus] = useState<ConnectionStatus>(url ? 'connecting' : 'idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  onFeedbackRef.current = onFeedback;

  useEffect(() => {
    if (!url) { setStatus('idle'); return; }
    let disposed = false;
    const connect = () => {
      setStatus('connecting');
      const socket = new WebSocket(url);
      socketRef.current = socket;
      socket.onopen = () => {
        setConnectionError(null);
        setStatus('connected');
      };
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as Partial<RealtimeFeedback>;
          if (typeof message.error === 'string') setConnectionError(message.error);
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
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [url]);

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

  return { status, connectionError, sendLandmarks };
}
