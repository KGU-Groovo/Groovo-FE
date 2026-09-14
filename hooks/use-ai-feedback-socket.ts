import { useCallback, useEffect, useRef, useState } from 'react';

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

type FeedbackMessage = {
  type: 'feedback';
  score: number;
  message?: string;
};

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected';

type UseAiFeedbackSocketOptions = {
  url?: string;
  onFeedback: (feedback: FeedbackMessage) => void;
  minIntervalMs?: number;
};

export function useAiFeedbackSocket({ url, onFeedback, minIntervalMs = 100 }: UseAiFeedbackSocketOptions) {
  const socketRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentAtRef = useRef(0);
  const onFeedbackRef = useRef(onFeedback);
  const [status, setStatus] = useState<ConnectionStatus>(url ? 'connecting' : 'idle');
  onFeedbackRef.current = onFeedback;

  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return;
    }

    let disposed = false;
    const connect = () => {
      setStatus('connecting');
      const socket = new WebSocket(url);
      socketRef.current = socket;
      socket.onopen = () => setStatus('connected');
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as FeedbackMessage;
          if (message.type === 'feedback' && Number.isFinite(message.score)) onFeedbackRef.current(message);
        } catch {
          // Ignore messages outside the feedback contract.
        }
      };
      socket.onclose = () => {
        if (disposed) return;
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
  }, [url]);

  const sendLandmarks = useCallback((landmarks: PoseLandmark[]) => {
    const now = Date.now();
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN || now - lastSentAtRef.current < minIntervalMs) return;

    socket.send(JSON.stringify({
      type: 'landmarks',
      timestamp: now,
      landmarks: landmarks.map((landmark, index) => ({ index, ...landmark })),
    }));
    lastSentAtRef.current = now;
  }, [minIntervalMs]);

  return { status, sendLandmarks };
}
