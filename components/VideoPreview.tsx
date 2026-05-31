import { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import type { Song } from "@/constants/songs";

interface VideoPreviewProps {
  song: Song;
  onClose: () => void;
}

const SCREEN_HEIGHT = Dimensions.get("window").height;
const DISMISS_THRESHOLD = 120;

export default function VideoPreview({ song, onClose }: VideoPreviewProps) {
  const [playing, setPlaying] = useState(true);
  const player = useVideoPlayer(song.video, (p) => {
    p.loop = true;
    p.play();
  });

  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DISMISS_THRESHOLD) {
          Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            player.pause();
            onClose();
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  const handlePlay = () => {
    if (playing) {
      player.pause();
    } else {
      player.play();
    }
    setPlaying(!playing);
  };

  return (
    <Animated.View
      style={[styles.card, { transform: [{ translateY }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.videoContainer}>
        <VideoView
          player={player}
          style={styles.video}
          nativeControls={false}
        />
        <View style={styles.videoOverlay} />
        <View style={styles.songInfo}>
          {song.image && (
            <Image source={song.image} style={styles.thumb} />
          )}
          <View style={styles.meta}>
            <Text style={styles.title}>{song.title}</Text>
            <Text style={styles.artist}>{song.artist}</Text>
          </View>
        </View>
        <View style={styles.playBtnWrapper}>
          <TouchableOpacity style={styles.playBtn} onPress={handlePlay} activeOpacity={0.85}>
            <LinearGradient
              colors={["#c850c0", "#e040a0", "#ff52d7"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.playGradient}
            >
              <Text style={styles.playText}>{playing ? "PAUSE" : "PLAY"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  videoContainer: {
    flex: 1,
    backgroundColor: "#000",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    opacity: 0.55,
    transform: [{ scale: 2.2 }],
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  songInfo: {
    position: "absolute",
    top: 16,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  meta: {
    justifyContent: "center",
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
    textTransform: "uppercase",
  },
  artist: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 3,
  },
  playBtnWrapper: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  playBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  playGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
  },
  playText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 6,
  },
});
