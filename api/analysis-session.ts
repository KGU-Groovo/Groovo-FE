import { getVideoId } from '../data/song-videos';
import { ApiError } from './client';
import { getAccessToken } from './demo-auth';
import { AnalysisSession, createSession } from './session';

type StartAnalysisSessionDeps = {
  getVideoIdImpl?: (songId: string) => number | undefined;
  getAccessTokenImpl?: () => Promise<string>;
  createSessionImpl?: (accessToken: string, videoId: number) => Promise<AnalysisSession>;
};

// 학습 1회 시작: video_id 확인 → access token 확보 → BE session 생성.
// video_id가 등록되지 않은 곡은 로그인/Session API를 호출하지 않고 MISSING_VIDEO_ID로 멈춘다.
export async function startAnalysisSession(
  songId: string,
  {
    getVideoIdImpl = getVideoId,
    getAccessTokenImpl = () => getAccessToken(),
    createSessionImpl = createSession,
  }: StartAnalysisSessionDeps = {},
): Promise<AnalysisSession> {
  const videoId = getVideoIdImpl(songId);
  if (videoId === undefined) {
    throw new ApiError(0, `'${songId}' 곡의 video_id가 등록되지 않았습니다. (data/song-videos.ts)`, 'MISSING_VIDEO_ID');
  }
  const accessToken = await getAccessTokenImpl();
  return createSessionImpl(accessToken, videoId);
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) return error;
  return new ApiError(0, error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
}
