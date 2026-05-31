import { useState, useEffect } from "react";
import { View, ScrollView, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import SearchBar from "@/components/SearchBar";
import SongCard from "@/components/SongCard";
import VideoPreview from "@/components/VideoPreview";
import { Colors } from "@/constants/colors";
import { TAB_BAR_STYLE } from "@/constants/tabBarStyle";
import { songs, type Song } from "@/constants/songs";

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [previewSong, setPreviewSong] = useState<Song | null>(null);

  const filtered = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
  );

  const navigation = useNavigation();

  useEffect(() => {
    if (previewSong) {
      navigation.setOptions({
        tabBarStyle: {
          display: "none" as const,
        },
      });
    } else {
      navigation.setOptions({
        tabBarStyle: TAB_BAR_STYLE,
      });
    }
  }, [previewSong, navigation]);

  const handlePlay = (song: Song) => {
    if (song.video) {
      setPreviewSong(song);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Header />
      <HeroBanner />
      <View style={styles.searchArea}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      {previewSong ? (
        <VideoPreview
          song={previewSong}
          onClose={() => setPreviewSong(null)}
        />
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentInner}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.songList}>
            {filtered.length > 0 ? (
              filtered.map((song) => (
                <SongCard key={song.id} song={song} onPlay={handlePlay} />
              ))
            ) : (
              <Text style={styles.noResult}>검색 결과가 없습니다.</Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchArea: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },
  songList: {
    gap: 10,
  },
  noResult: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 14,
    paddingVertical: 30,
  },
});
