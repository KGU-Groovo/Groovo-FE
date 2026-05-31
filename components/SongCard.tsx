import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import NoteRating from "./NoteRating";
import { Colors } from "@/constants/colors";
import type { Song } from "@/constants/songs";

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
}

export default function SongCard({ song, onPlay }: SongCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.accentBar} />
      <View
        style={[
          styles.thumbnail,
          !song.image && { backgroundColor: song.placeholderColor },
        ]}
      >
        {song.image ? (
          <Image source={song.image} style={styles.thumbnailImg} />
        ) : (
          <Text style={styles.thumbnailLabel}>{song.label}</Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.artist}>{song.artist}</Text>
        <NoteRating count={song.rating} />
      </View>
      <TouchableOpacity
        style={styles.playBtn}
        onPress={() => onPlay(song)}
      >
        <Svg width={13} height={13} viewBox="0 0 24 24" fill={Colors.playGreen}>
          <Polygon points="5,3 19,12 5,21" />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 109,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingRight: 12,
    overflow: "hidden",
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
    backgroundColor: Colors.accent,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    marginRight: 2,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  thumbnailImg: {
    width: 95,
    height: 94,
    borderRadius: 10,
  },
  thumbnailLabel: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.9,
    textTransform: "uppercase",
  },
  artist: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#252525",
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
});
