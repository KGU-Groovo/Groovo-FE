import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Song, songs } from '../../data/songs';

export default function ProfileScreen() {
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<'videos' | 'favorites'>('videos');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const featuredVideo = songs[0];
  const sheetOffset = useRef(new Animated.Value(480)).current;
  const maskOpacity = useRef(new Animated.Value(0)).current;
  const animateSheet = (toValue: number, onEnd?: () => void) => Animated.parallel([
    Animated.timing(sheetOffset, { toValue: toValue ? 480 : 0, duration: 260, useNativeDriver: true }),
    Animated.timing(maskOpacity, { toValue: toValue ? 0 : .22, duration: 180, useNativeDriver: true }),
  ]).start(({ finished }) => finished && onEnd?.());
  const openSheet = (song: Song) => { setSelectedSong(song); sheetOffset.setValue(480); maskOpacity.setValue(0); requestAnimationFrame(() => animateSheet(0)); };
  const closeSheet = (onEnd?: () => void) => animateSheet(1, () => { setSelectedSong(null); onEnd?.(); });
  return <SafeAreaView style={styles.screen} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.profile}>
      <View style={styles.avatarWrap}><Image source={require('../../assets/images/Ghost-Dancer.png')} style={styles.avatar} /><View style={styles.tierBadge}><Ionicons name="flash" size={13} color="#FFF" /></View></View>
      <Text style={styles.name}>KIM SEO YUN</Text><Text style={styles.tier}>GOLD TIER</Text>
      <View style={styles.counts}><View><Text style={styles.count}>200</Text><Text style={styles.countLabel}>FOLLOWERS</Text></View><View><Text style={styles.count}>350</Text><Text style={styles.countLabel}>FOLLOWING</Text></View></View>
      <Pressable style={styles.edit}><Text style={styles.editText}>프로필 편집</Text></Pressable>
    </View>
    <View style={styles.sectionTabs}>
      <Pressable onPress={() => setSelectedSection('videos')} style={[styles.sectionTab, selectedSection === 'videos' && styles.activeTab]}><Text style={[styles.sectionTabText, selectedSection === 'videos' && styles.activeTabText]}>내 댄스 비디오</Text></Pressable>
      <Pressable onPress={() => setSelectedSection('favorites')} style={[styles.sectionTab, selectedSection === 'favorites' && styles.activeTab]}><Text style={[styles.sectionTabText, selectedSection === 'favorites' && styles.activeTabText]}>찜한 곡</Text></Pressable>
    </View>
    {selectedSection === 'videos' ? <View style={styles.videoSection}>
      <Pressable style={styles.featuredVideo} onPress={() => openSheet(songs[0])}>
        <Image source={featuredVideo.albumCover} style={styles.featuredImage} /><View style={styles.featuredShade} />
        <View style={styles.featuredCopy}><Text style={styles.featuredLabel}>최근 업로드</Text><Text style={styles.featuredTitle}>{featuredVideo.title}</Text><Text style={styles.meta}><Ionicons name="eye-outline" size={13} /> {featuredVideo.views} views</Text></View><View style={styles.featuredPlay}><Ionicons name="play" size={20} color="#31042F" /></View>
      </Pressable>
      {songs.slice(1).map((song, index) => <Pressable key={song.id} style={styles.recentVideo} onPress={() => openSheet(songs[index + 1])}><Image source={songs[index + 1].albumCover} style={styles.recentImage} /><View style={styles.recentCopy}><Text style={styles.cardTitle}>{song.title}</Text><Text style={styles.meta}><Ionicons name="eye-outline" size={13} /> {song.views} views</Text></View><Ionicons name="play-circle" size={32} color="#FF43BD" /></Pressable>)}
    </View> : <View style={styles.favoriteList}>{songs.map((song) => <Pressable key={song.id} style={styles.favorite} onPress={() => openSheet(song)}><Image source={song.albumCover} style={styles.favoriteCover} /><View style={styles.favoriteCopy}><Text style={styles.cardTitle}>{song.title}</Text><Text style={styles.meta}>{song.artist}</Text><Text style={styles.notes}>{'♪ '.repeat(song.noteCount)}</Text></View><Ionicons name="heart" size={21} color="#FF43BD" /></Pressable>)}</View>}
  </ScrollView><Modal visible={selectedSong !== null} transparent animationType="none" onRequestClose={() => closeSheet()}><View style={styles.sheetBackdrop}><Animated.View pointerEvents="none" style={[styles.sheetMask, { opacity: maskOpacity }]} /><Pressable style={styles.sheetDismiss} onPress={() => closeSheet()} /><Animated.View style={[styles.sheet, { transform: [{ translateY: sheetOffset }] }]}><View style={styles.sheetHandle} /><ImageBackground source={selectedSong?.albumCover ?? songs[0].albumCover} style={styles.sheetPreview} imageStyle={styles.sheetImage}><View style={styles.sheetOverlay} /><View style={styles.sheetSongInfo}><Image source={selectedSong?.albumCover ?? songs[0].albumCover} style={styles.artwork} /><View><Text style={styles.sheetTitle}>{selectedSong?.title}</Text><Text style={styles.sheetArtist}>{selectedSong?.artist}</Text></View></View><Pressable style={styles.sheetPlay} onPress={() => closeSheet(() => router.push({ pathname: '/live-feedback', params: { songId: selectedSong?.id ?? songs[0].id } }))}><Text style={styles.sheetPlayText}>연습 시작하기</Text></Pressable></ImageBackground></Animated.View></View></Modal></SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#151820' }, content: { padding: 24, paddingBottom: 120, gap: 20 },
  profile: { borderRadius: 32, backgroundColor: '#242831', borderWidth: 1, borderColor: '#3E4552', alignItems: 'center', padding: 24, gap: 9 }, avatarWrap: { position: 'relative' }, avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, borderColor: '#FF43BD' }, tierBadge: { position: 'absolute', right: -3, bottom: 0, width: 25, height: 25, borderRadius: 13, backgroundColor: '#FF43BD', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#242831' }, name: { color: '#FFF', fontSize: 23, fontWeight: '800' }, tier: { color: '#F4B6D8', fontSize: 12, letterSpacing: 1.5 },
  counts: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#3E4552', paddingTop: 18, marginTop: 5 }, count: { color: '#FFD1E8', textAlign: 'center', fontSize: 18, fontWeight: '700' }, countLabel: { color: '#D7DAE0', fontSize: 12, marginTop: 4 }, edit: { width: '100%', borderRadius: 28, backgroundColor: '#D800C6', padding: 14, alignItems: 'center', marginTop: 7 }, editText: { color: '#FFF', fontWeight: '800' },
  sectionTabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3E4552' }, sectionTab: { flex: 1, alignItems: 'center', paddingVertical: 12 }, activeTab: { borderBottomWidth: 2, borderBottomColor: '#FF43BD' }, sectionTabText: { color: '#9EA5B0', fontSize: 15, fontWeight: '700' }, activeTabText: { color: '#FFF' },
  videoSection: { gap: 12 }, featuredVideo: { height: 260, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end' }, featuredImage: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined }, featuredShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8, 10, 14, .48)' }, featuredCopy: { padding: 18, gap: 4 }, featuredLabel: { color: '#FFC4E8', fontSize: 12, fontWeight: '800' }, featuredTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' }, featuredPlay: { position: 'absolute', right: 16, bottom: 16, width: 46, height: 46, borderRadius: 23, backgroundColor: '#FF43BD', alignItems: 'center', justifyContent: 'center' }, recentVideo: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18, backgroundColor: '#242831' }, recentImage: { width: 68, height: 68, borderRadius: 12 }, recentCopy: { flex: 1, gap: 5 }, cardTitle: { color: '#F7F8FA', fontSize: 15, fontWeight: '700' }, meta: { color: '#C7CCD6', fontSize: 13 },
  favoriteList: { gap: 12 }, favorite: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 12, borderRadius: 18, backgroundColor: '#242831' }, favoriteCover: { width: 62, height: 62, borderRadius: 12 }, favoriteCopy: { flex: 1, gap: 4 }, notes: { color: '#FFB55A', fontSize: 15, letterSpacing: 2 },
  sheetBackdrop: { flex: 1, justifyContent: 'flex-end' }, sheetMask: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' }, sheetDismiss: { ...StyleSheet.absoluteFillObject }, sheet: { borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: '#20242C' }, sheetHandle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#AEB4BF', marginVertical: 10 }, sheetPreview: { height: 390, justifyContent: 'space-between', padding: 26, paddingBottom: 34 }, sheetImage: { opacity: .6, resizeMode: 'cover' }, sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,10,14,.32)' }, sheetSongInfo: { flexDirection: 'row', alignItems: 'center', gap: 14 }, artwork: { width: 76, height: 76, borderRadius: 8 }, sheetTitle: { color: '#FFF', fontSize: 22, fontWeight: '900' }, sheetArtist: { color: '#D7DAE0', marginTop: 6, letterSpacing: 1.4 }, sheetPlay: { backgroundColor: '#D800C6', borderRadius: 10, paddingVertical: 15, alignItems: 'center' }, sheetPlayText: { color: '#FFF', fontSize: 19, fontWeight: '900' },
});
