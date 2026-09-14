import { useCallback, useEffect, useRef } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Song } from '../data/songs';
import VideoBackground from './live-feedback/VideoBackground';

type Props = {
  song: Song | null;
  onDismiss: () => void;
  onStart: (song: Song) => void;
};

export function SongPreviewSheet({ song, onDismiss, onStart }: Props) {
  const sheetOffset = useRef(new Animated.Value(480)).current;
  const maskOpacity = useRef(new Animated.Value(0)).current;
  const animate = useCallback((closing: boolean, onEnd?: () => void) => Animated.parallel([
    Animated.timing(sheetOffset, { toValue: closing ? 480 : 0, duration: 260, useNativeDriver: true }),
    Animated.timing(maskOpacity, { toValue: closing ? 0 : .22, duration: 180, useNativeDriver: true }),
  ]).start(({ finished }) => finished && onEnd?.()), [maskOpacity, sheetOffset]);
  const dismiss = useCallback((onEnd?: () => void) => animate(true, () => { onDismiss(); onEnd?.(); }), [animate, onDismiss]);

  useEffect(() => {
    if (!song) return;
    sheetOffset.setValue(480);
    maskOpacity.setValue(0);
    const frame = requestAnimationFrame(() => animate(false));
    return () => cancelAnimationFrame(frame);
  }, [animate, maskOpacity, sheetOffset, song]);

  return <Modal visible={song !== null} transparent animationType="none" onRequestClose={() => dismiss()}>
    <View style={styles.backdrop}>
      <Animated.View pointerEvents="none" style={[styles.mask, { opacity: maskOpacity }]} />
      <Pressable style={styles.dismiss} onPress={() => dismiss()} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetOffset }] }]}>
        {song && <VideoBackground source={song.videoSource} style={styles.preview}>
          <View style={styles.overlay} />
          <View style={styles.handle} />
          <View style={styles.info}>
            <Image source={song?.albumCover} style={styles.artwork} />
            <View>
              <Text style={styles.title}>{song?.title}</Text>
              <Text style={styles.artist}>{song?.artist}</Text>
            </View>
          </View>
          <Pressable style={styles.start} onPress={() => song && dismiss(() => onStart(song))}><Text style={styles.startText}>연습 시작하기</Text></Pressable>
        </VideoBackground>}
      </Animated.View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' }, 
  mask: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' }, 
  dismiss: { ...StyleSheet.absoluteFillObject }, 
  sheet: { height: '40%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: '#20242C' }, 
  handle: { alignSelf: 'center', width: 42, height: 5, borderRadius: 3, backgroundColor: '#D7DAE0', marginTop: 10 }, 
  preview: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 26, paddingBottom: 34 }, 
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,10,14,.32)' }, 
  info: { flexDirection: 'row', alignItems: 'center', gap: 14, transform: [{ translateY: -50 }] }, 
  artwork: { width: 76, height: 76, borderRadius: 8 }, 
  title: { color: '#FFF', fontSize: 22, fontWeight: '900' }, 
  artist: { color: '#D7DAE0', marginTop: 6, letterSpacing: 1.4 }, 
  start: { backgroundColor: '#D800C6', borderRadius: 10, paddingVertical: 15, alignItems: 'center' }, 
  startText: { color: '#FFF', fontSize: 19, fontWeight: '900' },
});
