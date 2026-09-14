import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getFeedbackState } from '../components/live-feedback/feedback-score';

export default function ResultScreen() {
  const router = useRouter();
  const feedback = getFeedbackState(null);
  return <View style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.pill}>PERFORMANCE COMPLETE</Text>
      <View style={[styles.score, { borderColor: feedback.color }]}>
        <Text style={[styles.scoreNumber, { color: feedback.color }]}>—</Text>
        <Text style={styles.scoreLabel}>SCORE</Text>
      </View>
      <Text style={styles.message}>분석 결과를 기다리고 있어요.</Text>
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>자세 분석</Text>
        <Text style={styles.panelCopy}>백엔드에서 점수를 받으면 정확도, 타이밍, 균형, 박자, 디테일 분석을 표시합니다.</Text>
      </View>
      <Pressable style={styles.home} onPress={() => router.replace('/(tabs)')}>
        <Ionicons name="home-outline" size={20} color="#FFF" />
        <Text style={styles.homeText}>홈으로 돌아가기</Text>
      </Pressable>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#24000F', padding: 24 }, content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28 }, pill: { backgroundColor: '#D800C6', color: '#FFF', borderRadius: 22, overflow: 'hidden', paddingHorizontal: 20, paddingVertical: 10, fontWeight: '800', letterSpacing: 1 }, score: { width: 144, height: 144, borderWidth: 2, borderRadius: 72, alignItems: 'center', justifyContent: 'center' }, scoreNumber: { fontSize: 56, fontWeight: '900' }, scoreLabel: { color: '#FFF', fontWeight: '800', letterSpacing: 1 }, message: { color: '#FFF', fontSize: 17 }, panel: { borderRadius: 28, backgroundColor: '#342044', padding: 28, gap: 10, width: '100%' }, panelTitle: { color: '#F7A1D5', fontSize: 18, fontWeight: '800' }, panelCopy: { color: '#E8D8E7', lineHeight: 22 }, home: { flexDirection: 'row', gap: 8, borderRadius: 24, borderWidth: 1, borderColor: '#BA24A2', paddingVertical: 14, paddingHorizontal: 28 }, homeText: { color: '#FFF', fontWeight: '800' },
});
