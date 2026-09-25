import { useEffect, useState } from 'react';
import { startAnalysisSession, toApiError } from '../api/analysis-session';
import { ApiError } from '../api/client';
import { AnalysisSession } from '../api/session';

export type AnalysisSessionState =
  | { status: 'preparing'; session: null; error: null }
  | { status: 'ready'; session: AnalysisSession; error: null }
  | { status: 'error'; session: null; error: ApiError };

const PREPARING: AnalysisSessionState = { status: 'preparing', session: null, error: null };

// 학습 화면이 열릴 때마다(학습 1회) BE session을 하나 만든다. 자동 재생성/복구는 하지 않는다.
export function useAnalysisSession(songId: string) {
  const [state, setState] = useState<AnalysisSessionState>(PREPARING);

  useEffect(() => {
    let cancelled = false;
    setState(PREPARING);
    startAnalysisSession(songId)
      .then((session) => {
        if (!cancelled) setState({ status: 'ready', session, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', session: null, error: toApiError(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [songId]);

  return state;
}
