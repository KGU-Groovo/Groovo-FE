import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';
import { getFeedbackState } from '../components/live-feedback/feedback-score';

type PentagonResult = { final_score: number; scores: Record<string, number> };

const METRICS = [
  ['timing', '타이밍'], ['balance', '균형'], ['rhythm', '박자'], ['detail', '디테일'], ['accuracy', '정확도'],
] as const;
const CENTER = 120;
const RADIUS = 78;

function parsePentagon(value?: string): PentagonResult | null {
  try {
    const parsed = JSON.parse(value ?? '') as PentagonResult;
    return Number.isFinite(parsed.final_score) && parsed.scores ? parsed : null;
  } catch {
    return null;
  }
}

function parseTimeline(value?: string): number[] {
  return (value ?? '').split(',').map(Number).filter((item) => Number.isFinite(item));
}

function point(index: number, value: number) {
  const angle = -Math.PI / 2 + index * (2 * Math.PI / METRICS.length);
  const radius = RADIUS * Math.max(0, Math.min(100, value)) / 100;
  return `${CENTER + Math.cos(angle) * radius},${CENTER + Math.sin(angle) * radius}`;
}

function PentagonChart({ pentagon }: { pentagon: PentagonResult | null }) {
  const values = METRICS.map(([key]) => pentagon?.scores[key] ?? 0);
  const grid = [25, 50, 75, 100].map((value) => METRICS.map((_, index) => point(index, value)).join(' '));
  return <View style={styles.chartWrap}>
    <Svg width={240} height={240} viewBox="0 0 240 240">
      {grid.map((points, index) => <Polygon key={index} points={points} fill="none" stroke="#5A3D68" strokeWidth="1" />)}
      {METRICS.map((_, index) => {
        const [x2, y2] = point(index, 100).split(',');
        return <Line key={index} x1={CENTER} y1={CENTER} x2={x2} y2={y2} stroke="#5A3D68" strokeWidth="1" />;
      })}
      {pentagon && <Polygon points={values.map((value, index) => point(index, value)).join(' ')} fill="rgba(255, 0, 136, 0.18)" stroke="#FF0088" strokeWidth="3" />}
    </Svg>
    {METRICS.map(([key, label], index) => {
      const angle = -Math.PI / 2 + index * (2 * Math.PI / METRICS.length);
      return <View key={key} style={[styles.metric, { left: CENTER + Math.cos(angle) * 102 - 36, top: CENTER + Math.sin(angle) * 102 - 18 }]}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{pentagon ? Math.round(pentagon.scores[key] ?? 0) : '—'}</Text>
      </View>;
    })}
  </View>;
}

function timelineColor(score: number) {
  if (score >= 80) return '#00BC27';
  if (score >= 60) return '#F3B000';
  return '#E52A42';
}

export default function ResultScreen() {
  const router = useRouter();
  const { score: scoreParam, pentagon: pentagonParam, timeline: timelineParam } = useLocalSearchParams<{ score?: string; pentagon?: string; timeline?: string }>();
  const score = Number(scoreParam);
  const finalScore = Number.isFinite(score) ? score : null;
  const feedback = getFeedbackState(finalScore);
  const pentagon = parsePentagon(pentagonParam);
  const timeline = parseTimeline(timelineParam);

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <View style={styles.header}></View>
    <Text style={styles.pill}>PERFORMANCE COMPLETE</Text>
    <View style={styles.scoreRing}><Text style={styles.scoreNumber}>{finalScore === null ? '—' : Math.round(finalScore)}</Text><Text style={styles.scoreLabel}>SCORE</Text></View>
    <Text style={styles.message}>{finalScore === null ? '분석 결과를 받지 못했어요.' : `${feedback.label} · 전체 흐름을 확인해 보세요.`}</Text>
    <View style={styles.panel}><PentagonChart pentagon={pentagon} />{!pentagon && <Text style={styles.empty}>오각형 분석은 30프레임 이상 감지되면 표시됩니다.</Text>}</View>
    <View style={styles.timelinePanel}>
      <Text style={styles.timelineTitle}>퍼포먼스 타임라인</Text>
      <View style={styles.timeline}>{timeline.length > 0 ? timeline.map((item, index) => <View key={index} style={[styles.timelineBar, { backgroundColor: timelineColor(item) }]} />) : <Text style={styles.empty}>수집된 실시간 점수가 없습니다.</Text>}</View>
      <View style={styles.legend}><Text style={{ color: '#FFF' }}><Text style={styles.green}>●</Text> Good</Text><Text style={{ color: '#FFF' }}><Text style={styles.yellow}>●</Text> Check</Text><Text style={{ color: '#FFF' }}><Text style={styles.red}>●</Text> Retry</Text></View>
    </View>
    <View style={styles.actions}>
      <Pressable style={styles.action} onPress={() => router.back()}><Ionicons name="reload" size={20} color="#FFF" /><Text style={styles.actionText}>재도전하기</Text></Pressable>
      <Pressable style={styles.action} onPress={() => router.replace('/(tabs)')}><Ionicons name="home-outline" size={20} color="#FFF" /><Text style={styles.actionText}>홈으로 돌아가기</Text></Pressable>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#17000D' }, content: { alignItems: 'center', paddingHorizontal: 23, paddingBottom: 42, gap: 20 }, header: { alignSelf: 'stretch', paddingTop: 56, height: 94 },
  pill: { overflow: 'hidden', backgroundColor: '#CE00DE', color: '#FFF', borderRadius: 22, paddingHorizontal: 20, paddingVertical: 10, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 },
  scoreRing: { width: 128, height: 128, borderRadius: 64, borderWidth: 2, borderColor: '#B87FE4', alignItems: 'center', justifyContent: 'center', shadowColor: '#E000C9', shadowOpacity: 0.72, shadowRadius: 22, elevation: 12 }, scoreNumber: { color: '#FFF', fontSize: 52, fontWeight: '900', lineHeight: 58 }, scoreLabel: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 }, message: { color: '#FFF', fontSize: 15, textAlign: 'center' },
  panel: { width: '100%', minHeight: 304, borderRadius: 36, backgroundColor: '#30203B', alignItems: 'center', justifyContent: 'center', paddingVertical: 20 }, chartWrap: { width: 240, height: 240, position: 'relative' }, metric: { position: 'absolute', width: 72, alignItems: 'center' }, metricLabel: { color: '#FFB4D5', fontSize: 14, fontWeight: '700' }, metricValue: { color: '#FFF', fontSize: 15, fontWeight: '800' }, empty: { color: '#CBB6CF', fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
  timelinePanel: { width: '100%', backgroundColor: '#30203B', borderRadius: 18, padding: 16, gap: 12 }, timelineTitle: { color: '#FFF', fontWeight: '800', fontSize: 13 }, timeline: { height: 28, flexDirection: 'row', overflow: 'hidden', borderRadius: 2, backgroundColor: '#4A3B50' }, timelineBar: { flex: 1, marginRight: 1 }, legend: { flexDirection: 'row', justifyContent: 'space-between' }, green: { color: '#00BC27' }, yellow: { color: '#F3B000' }, red: { color: '#E52A42' },
  actions: { flexDirection: 'row', width: '100%', gap: 10 }, action: { flex: 1, borderRadius: 24, borderWidth: 1, borderColor: '#9A20B3', paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 }, actionText: { color: '#FFF', fontSize: 14, fontWeight: '800' },
});
