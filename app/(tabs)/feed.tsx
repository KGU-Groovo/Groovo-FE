import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, ImageBackground, Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import VideoBackground from '../../components/live-feedback/VideoBackground';
import { songs } from '../../data/songs';

const reelMeta = [
  { user: 'Kai_Dancer_94', caption: '포인트 안무 드디어 마스터!', likes: 12400, comments: 482 },
  { user: 'seoyun.dance', caption: '후렴 안무 같이 연습해요.', likes: 8200, comments: 216 },
  { user: 'groovo.crew', caption: '오늘의 기본기 챌린지 완료!', likes: 5900, comments: 104 },
  { user: 'dancer.mina', caption: '이 부분이 제일 좋아요.', likes: 4100, comments: 98 },
] as const;

const reels = songs.map((song, index) => ({ ...reelMeta[index], song }));
const formatCount = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1).replace('.0', '')}K` : String(count);

export default function FeedScreen() {
  const router = useRouter();
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [commentReelId, setCommentReelId] = useState<string | null>(null);
  const [commentsByReel, setCommentsByReel] = useState<Record<string, string[]>>({});
  const [commentDraft, setCommentDraft] = useState('');
  const [reelHeight, setReelHeight] = useState(Dimensions.get('window').height);
  const [activeReelId, setActiveReelId] = useState<string | null>(reels[0]?.song.id ?? null);
  const commentReel = reels.find((reel) => reel.song.id === commentReelId);
  const toggleLike = (reelId: string) => setLikedReels((previous) => ({ ...previous, [reelId]: !previous[reelId] }));
  const openComments = (reelId: string) => {
    setCommentReelId(reelId);
    setCommentDraft('');
  };
  const submitComment = () => {
    const trimmedComment = commentDraft.trim();
    if (!commentReelId || !trimmedComment) return;
    setCommentsByReel((previous) => ({ ...previous, [commentReelId]: [...(previous[commentReelId] ?? []), trimmedComment] }));
    setCommentDraft('');
  };
  const shareReel = async (reel: (typeof reels)[number]) => {
    await Share.share({ message: `${reel.song.title} · ${reel.song.artist} 안무를 Groovo에서 연습해 보세요.\ngroovo://live-feedback?songId=${reel.song.id}` });
  };
  return <><View style={styles.screen} onLayout={(event) => setReelHeight(event.nativeEvent.layout.height)}><FlatList
    data={reels}
    style={styles.list}
    contentContainerStyle={styles.listContent}
    initialNumToRender={1}
    keyExtractor={(item) => item.song.id}
    pagingEnabled
    bounces={false}
    overScrollMode="never"
    showsVerticalScrollIndicator={false}
    onMomentumScrollEnd={(event) => {
      const index = Math.round(event.nativeEvent.contentOffset.y / reelHeight);
      setActiveReelId(reels[index]?.song.id ?? null);
    }}
    renderItem={({ item }) => {
      const liked = Boolean(likedReels[item.song.id]);
      const isActive = item.song.id === activeReelId;
      const content = <>
        <View style={styles.shade} />
        <View style={styles.top}><Text style={styles.title}>요즘 인기 챌린지</Text><Text style={styles.chip}>♬ {item.song.title} · {item.song.artist}</Text></View>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" accessibilityLabel="좋아요" style={styles.action} onPress={() => toggleLike(item.song.id)}><Ionicons name={liked ? 'heart' : 'heart-outline'} size={31} color={liked ? '#FF43BD' : '#FFF'} /><Text style={styles.actionText}>{formatCount(item.likes + (liked ? 1 : 0))}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="댓글" style={styles.action} onPress={() => openComments(item.song.id)}><Ionicons name="chatbubble-outline" size={29} color="#FFF" /><Text style={styles.actionText}>{formatCount(item.comments + (commentsByReel[item.song.id]?.length ?? 0))}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="공유" style={styles.action} onPress={() => void shareReel(item)}><Ionicons name="share-social-outline" size={29} color="#FFF" /><Text style={styles.actionText}>공유</Text></Pressable>
        </View>
        <View style={styles.caption}><Text style={styles.user}>{item.user}</Text><Text style={styles.copy}>{item.song.title} {item.caption}</Text><Pressable style={styles.learn} onPress={() => router.push({ pathname: '/live-feedback', params: { songId: item.song.id } })}><Text style={styles.learnText}>이 안무 배우기</Text></Pressable></View>
      </>;
      return isActive ? <VideoBackground source={item.song.videoSource} posterSource={item.song.albumCover} style={[styles.reel, { height: reelHeight }]} isPlaying loop>{content}</VideoBackground>
        : <ImageBackground source={item.song.albumCover} style={[styles.reel, { height: reelHeight }]} imageStyle={styles.reelImage}>{content}</ImageBackground>;
    }}
  /></View><Modal visible={commentReelId !== null} transparent animationType="slide" onRequestClose={() => setCommentReelId(null)}>
    <View style={styles.commentModal}><Pressable style={StyleSheet.absoluteFill} onPress={() => setCommentReelId(null)} />
      <View style={styles.commentSheet}>
        <View style={styles.commentHeader}><Text style={styles.commentTitle}>댓글</Text><Pressable accessibilityRole="button" accessibilityLabel="댓글 닫기" onPress={() => setCommentReelId(null)}><Ionicons name="close" size={24} color="#FFF" /></Pressable></View>
        <Text style={styles.commentSong}>{commentReel ? `${commentReel.song.title} · ${commentReel.song.artist}` : ''}</Text>
        <ScrollView style={styles.commentList} contentContainerStyle={styles.commentListContent} keyboardShouldPersistTaps="handled">
          {(commentReelId ? commentsByReel[commentReelId] ?? [] : []).map((comment, index) => <Text key={`${comment}-${index}`} style={styles.commentText}>나 · {comment}</Text>)}
          {commentReelId && !(commentsByReel[commentReelId]?.length) && <Text style={styles.commentEmpty}>첫 댓글을 남겨 보세요.</Text>}
        </ScrollView>
        <View style={styles.commentComposer}><TextInput value={commentDraft} onChangeText={setCommentDraft} placeholder="댓글을 입력하세요" placeholderTextColor="#9EA5B1" style={styles.commentInput} onSubmitEditing={submitComment} returnKeyType="send" /><Pressable accessibilityRole="button" accessibilityLabel="댓글 등록" disabled={!commentDraft.trim()} onPress={submitComment} style={[styles.commentSubmit, !commentDraft.trim() && styles.commentSubmitDisabled]}><Text style={styles.commentSubmitText}>등록</Text></Pressable></View>
      </View>
    </View>
  </Modal></>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#2A0733' }, list: { flex: 1, backgroundColor: '#2A0733' }, listContent: { backgroundColor: '#2A0733' }, reel: { justifyContent: 'space-between', padding: 20, paddingTop: 52, paddingBottom: 110, backgroundColor: '#2A0733' }, reelImage: { opacity: .62, resizeMode: 'cover' }, shade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10, 2, 15, .38)' },
  top: { gap: 13 }, title: { color: '#FFF', fontSize: 21, fontWeight: '800' }, chip: { alignSelf: 'flex-start', color: '#FFF', backgroundColor: 'rgba(255,255,255,.18)', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, overflow: 'hidden' },
  actions: { position: 'absolute', right: 20, bottom: 280, gap: 22 }, action: { alignItems: 'center', gap: 5 }, actionText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  caption: { gap: 9, paddingRight: 60 }, user: { color: '#FFF', fontSize: 19, fontWeight: '800' }, copy: { color: '#FFF', fontSize: 15 }, audio: { color: '#50D8FF', fontWeight: '700' }, learn: { backgroundColor: '#000', borderRadius: 8, alignItems: 'center', padding: 16, marginTop: 7 }, learnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  commentModal: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.56)' },
  commentSheet: { maxHeight: '62%', padding: 20, gap: 14, backgroundColor: '#201126', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, commentTitle: { color: '#FFF', fontSize: 21, fontWeight: '800' }, commentSong: { color: '#C7CCD6', fontWeight: '700' },
  commentList: { maxHeight: 210 }, commentListContent: { gap: 10 }, commentText: { color: '#FFF', fontSize: 15 }, commentEmpty: { color: '#9EA5B1', textAlign: 'center', paddingVertical: 28 },
  commentComposer: { flexDirection: 'row', gap: 8 }, commentInput: { flex: 1, minHeight: 44, paddingHorizontal: 14, borderRadius: 12, color: '#FFF', backgroundColor: '#32203B' }, commentSubmit: { justifyContent: 'center', paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#D800C6' }, commentSubmitDisabled: { opacity: 0.45 }, commentSubmitText: { color: '#FFF', fontWeight: '800' },
});
