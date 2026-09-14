import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song, songs } from '../../data/songs';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const sheetOffset = useRef(new Animated.Value(480)).current;
  const maskOpacity = useRef(new Animated.Value(0)).current;
  const animateSheet = (toValue: number, onEnd?: () => void) => Animated.parallel([
    Animated.timing(sheetOffset, { toValue: toValue ? 480 : 0, duration: 260, useNativeDriver: true }),
    Animated.timing(maskOpacity, { toValue: toValue ? 0 : .22, duration: 180, useNativeDriver: true }),
  ]).start(({ finished }) => finished && onEnd?.());
  const openSheet = (song: Song) => {
    setSelectedSong(song);
    sheetOffset.setValue(480);
    maskOpacity.setValue(0);
    requestAnimationFrame(() => animateSheet(0));
  };
  const closeSheet = (onEnd?: () => void) => animateSheet(1, () => {
    setSelectedSong(null);
    onEnd?.();
  });
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.header}><Text style={styles.logo}>G</Text><Ionicons name="notifications-outline" size={26} color="#FFF" /></View>
        <View style={styles.search}><Ionicons name="search" size={23} color="#FF43BD" /><Text style={styles.searchText}>원하는 춤을 검색해보세요</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.hero} onPress={() => openSheet(songs[0])}>
          <Image source={songs[0].albumCover} style={styles.heroImage} />
          <View style={styles.heroCopy}><Text style={styles.heroTitle}>{songs[0].title}</Text><Text style={styles.artist}>{songs[0].artist}</Text><Text style={styles.notes}>{'♪ '.repeat(songs[0].noteCount)}</Text></View>
          <Text style={styles.play}>PLAY</Text>
        </Pressable>
        <Text style={styles.sectionTitle}>지금 연습할 곡</Text>
        {songs.map((song) => <Pressable key={song.id} style={styles.song} onPress={() => openSheet(song)}>
          <Image source={song.albumCover} style={styles.cover} />
          <View style={styles.songCopy}><Text style={styles.songTitle}>{song.title}</Text><Text style={styles.artist}>{song.artist}</Text><Text style={styles.notes}>{'♪ '.repeat(song.noteCount)}</Text></View>
          <Ionicons name="play" size={24} color="#19E5A8" />
        </Pressable>)}
      </ScrollView>
      <Modal visible={selectedSong !== null} transparent animationType="none" onRequestClose={() => closeSheet()}>
        <View style={styles.sheetBackdrop}>
          <Animated.View pointerEvents="none" style={[styles.sheetMask, { opacity: maskOpacity }]} />
          <Pressable style={styles.sheetDismiss} onPress={() => closeSheet()} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetOffset }] }]}>
            <View style={styles.sheetHandle} />
            <ImageBackground source={selectedSong?.albumCover ?? songs[0].albumCover} style={styles.sheetPreview} imageStyle={styles.sheetImage}>
              <View style={styles.sheetOverlay} />
              <View style={styles.sheetSongInfo}><Image source={selectedSong?.albumCover ?? songs[0].albumCover} style={styles.artwork} /><View><Text style={styles.sheetTitle}>{selectedSong?.title}</Text><Text style={styles.sheetArtist}>{selectedSong?.artist}</Text></View></View>
              <Pressable style={styles.sheetPlay} onPress={() => closeSheet(() => router.push({ pathname: '/live-feedback', params: { songId: selectedSong?.id ?? songs[0].id } }))}><Text style={styles.sheetPlayText}>PLAY</Text></Pressable>
            </ImageBackground>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#151820' }, topBar: { paddingHorizontal: 24, paddingBottom: 12, }, content: { paddingHorizontal: 24, paddingBottom: 120, gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  logo: { color: '#FF43BD', fontSize: 34, fontWeight: '900' },
  search: { height: 48, borderRadius: 14, backgroundColor: '#353941', flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  searchText: { color: '#BFC0C5', fontSize: 14 },
  hero: { minHeight: 280, borderRadius: 28, overflow: 'hidden', backgroundColor: '#30343C', justifyContent: 'space-between', padding: 24 },
  heroImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined, opacity: 0.38 },
  heroCopy: { marginTop: 28, gap: 5 }, heroTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  artist: { color: '#C9C3CF', fontSize: 13 }, notes: { color: '#FFB55A', fontSize: 18, letterSpacing: 3 },
  play: { alignSelf: 'center', color: '#FFF', fontSize: 25, fontWeight: '900', backgroundColor: '#D800C6', borderRadius: 10, overflow: 'hidden', paddingHorizontal: 72, paddingVertical: 13 },
  sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 14 },
  song: { minHeight: 108, backgroundColor: '#282D36', borderLeftWidth: 4, borderLeftColor: '#FF43BD', borderRadius: 14, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 14 },
  cover: { width: 72, height: 72, borderRadius: 8 }, songCopy: { flex: 1, gap: 4 }, songTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end' }, sheetMask: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' }, sheetDismiss: { ...StyleSheet.absoluteFillObject }, sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: '#25122A' }, sheetHandle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#B9A9BC', marginVertical: 10 },
  sheetPreview: { height: 390, justifyContent: 'space-between', padding: 26, paddingBottom: 34 }, sheetImage: { opacity: .6, resizeMode: 'cover' }, sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,0,20,.26)' },
  sheetSongInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 }, artwork: { width: 76, height: 76, borderRadius: 8 }, sheetTitle: { color: '#FFF', fontSize: 22, fontWeight: '900' }, sheetArtist: { color: '#E0D6E3', marginTop: 6, letterSpacing: 1.4 }, sheetPlay: { backgroundColor: '#D800C6', borderRadius: 10, paddingVertical: 15, alignItems: 'center' }, sheetPlayText: { color: '#FFF', fontSize: 26, fontWeight: '900' },
});
