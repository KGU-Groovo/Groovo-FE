export interface Song {
  id: number;
  title: string;
  artist: string;
  rating: number;
  image?: any;
  video?: any;
  placeholderColor?: string;
  label: string;
}

export const songs: Song[] = [
  {
    id: 1,
    title: "REDRED",
    artist: "CORTIS",
    rating: 4,
    image: require("@/assets/images/REDRED.png"),
    video: require("@/assets/videos/REDRED.mp4"),
    label: "REDRED",
  },
  {
    id: 2,
    title: "RUDE!",
    artist: "하츠투하츠",
    rating: 4,
    image: require("@/assets/images/RUDE.png"),
    video: require("@/assets/videos/RUDE!.mp4"),
    label: "RD",
  },
  {
    id: 3,
    title: "캐치캐치",
    artist: "최예나",
    image: require("@/assets/images/CatchCatch.png"),
    video: require("@/assets/videos/캐치캐치.mp4"),
    rating: 2,
    label: "캐치",
  },
  {
    id: 4,
    title: "WDA",
    artist: "AESPA",
    rating: 5,
    image: require("@/assets/images/WDA.png"),
    video: require("@/assets/videos/WDA.mp4"),
    label: "W",
  },
];
