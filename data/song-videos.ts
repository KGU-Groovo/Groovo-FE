import type { Song } from './songs';

// FE 곡(song.id) → BE videos.id 매핑. Session API(POST /api/v1/sessions)의 video_id로 쓴다.
// 팀에서 확정된 값만 넣는다. 등록되지 않은 곡은 session을 만들지 않고 개발 오류로 표시된다.
export const SONG_VIDEO_IDS: Partial<Record<Song['id'], number>> = {};

export function getVideoId(songId: string): number | undefined {
  return SONG_VIDEO_IDS[songId as Song['id']];
}
