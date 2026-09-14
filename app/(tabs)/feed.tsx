import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { songs } from '../../data/songs';

const reelMeta = [
  { user: 'Kai_Dancer_94', caption: '포인트 안무 드디어 마스터!', likes: '12.4K', comments: '482' },
  { user: 'seoyun.dance', caption: '후렴 안무 같이 연습해요.', likes: '8.2K', comments: '216' },
  { user: 'groovo.crew', caption: '오늘의 기본기 챌린지 완료!', likes: '5.9K', comments: '104' },
  { user: 'dancer.mina', caption: '이 부분이 제일 좋아요.', likes: '4.1K', comments: '98' },
] as const;

const reels = songs.map((song, index) => ({ ...reelMeta[index], song }));

export default function FeedScreen() {
  const router = useRouter();
  const [likedReel, setLikedReel] = useState<string | null>(null);
  const [reelHeight, setReelHeight] = useState(Dimensions.get('window').height);
  return <View style={styles.screen} onLayout={(event) => setReelHeight(event.nativeEvent.layout.height)}><FlatList
    data={reels}
    style={styles.list}
    contentContainerStyle={styles.listContent}
    keyExtractor={(item) => item.song.id}
    pagingEnabled
    bounces={false}
    overScrollMode="never"
    showsVerticalScrollIndicator={false}
    renderItem={({ item }) => {
      const liked = likedReel === item.song.id;
      return <ImageBackground source={item.song.albumCover} style={[styles.reel, { height: reelHeight }]} imageStyle={styles.reelImage}>
        <View style={styles.shade} />
        <View style={styles.top}><Text style={styles.title}>요즘 인기 챌린지</Text><Text style={styles.chip}>♬ {item.song.title} · {item.song.artist}</Text></View>
        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={() => setLikedReel(liked ? null : item.song.id)}><Ionicons name={liked ? 'heart' : 'heart-outline'} size={31} color={liked ? '#FF43BD' : '#FFF'} /><Text style={styles.actionText}>{item.likes}</Text></Pressable>
          <View style={styles.action}><Ionicons name="chatbubble-outline" size={29} color="#FFF" /><Text style={styles.actionText}>{item.comments}</Text></View>
          <View style={styles.action}><Ionicons name="share-social-outline" size={29} color="#FFF" /><Text style={styles.actionText}>공유</Text></View>
        </View>
        <View style={styles.caption}><Text style={styles.user}>{item.user}</Text><Text style={styles.copy}>{item.song.title} {item.caption}</Text><Text style={styles.audio}>{'♪ '.repeat(item.song.noteCount)}{item.song.title} · {item.song.artist}</Text><Pressable style={styles.learn} onPress={() => router.push({ pathname: '/live-feedback', params: { songId: item.song.id } })}><Text style={styles.learnText}>이 안무 배우기</Text></Pressable></View>
      </ImageBackground>;
    }}
  /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2A0733' }, list: { flex: 1, backgroundColor: '#2A0733' }, listContent: { backgroundColor: '#2A0733' }, reel: { justifyContent: 'space-between', padding: 20, paddingTop: 52, paddingBottom: 110, backgroundColor: '#2A0733' }, reelImage: { opacity: .62, resizeMode: 'cover' }, shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 2, 15, .38)' },
  top: { gap: 13 }, title: { color: '#FFF', fontSize: 21, fontWeight: '800' }, chip: { alignSelf: 'flex-start', color: '#FFF', backgroundColor: 'rgba(255,255,255,.18)', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, overflow: 'hidden' },
  actions: { position: 'absolute', right: 20, bottom: 280, gap: 22 }, action: { alignItems: 'center', gap: 5 }, actionText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  caption: { gap: 9, paddingRight: 60 }, user: { color: '#FFF', fontSize: 19, fontWeight: '800' }, copy: { color: '#FFF', fontSize: 15 }, audio: { color: '#50D8FF', fontWeight: '700' }, learn: { backgroundColor: '#000', borderRadius: 8, alignItems: 'center', padding: 16, marginTop: 7 }, learnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
});
