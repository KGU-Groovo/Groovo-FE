export const songs = [
  {
    id: "hollywood-action",
    title: "Hollywood Action",
    artist: "BOYNEXTDOOR(보이넥스트도어)",
    noteCount: 5,
    albumCover: require("../assets/song/hollywood-action/albumCover.webp"),
    videoSource: require("../assets/song/hollywood-action/dance.mp4"),
  },
  {
    id: "rude",
    title: "RUDE!",
    artist: "하츠투하츠",
    noteCount: 4,
    albumCover: require("../assets/song/rude/albumCover.webp"),
    videoSource: require("../assets/song/rude/dance.mp4"),
  },
  {
    id: "its-me",
    title: "It’s Me",
    artist: "ILLIT(아일릿)",
    noteCount: 3,
    albumCover: require("../assets/song/its-me/albumCover.webp"),
    videoSource: require("../assets/song/its-me/dance.mp4"),
  },
  {
    id: "wda",
    title: "WDA",
    artist: "aespa",
    noteCount: 4,
    albumCover: require("../assets/song/wda/albumCover.webp"),
    videoSource: require("../assets/song/wda/dance.mp4"),
  },
] as const;

export type Song = (typeof songs)[number];

export function getSong(songId?: string) {
  return songs.find((song) => song.id === songId) ?? songs[0];
}
