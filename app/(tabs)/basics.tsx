import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['전체', '스텝', '아이솔레이션', '웨이브'] as const;
const lessons = [
  { title: '가슴 아이솔레이션', meta: '2 Steps · 54s', level: '초급', category: '아이솔레이션' },
  { title: '어깨 아이솔레이션', meta: '4 Steps · 41s', level: '초급', category: '아이솔레이션' },
  { title: '바디 아이솔레이션', meta: '2 Steps · 34s', level: '중급', category: '스텝' },
];

export default function BasicsScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<(typeof categories)[number]>('전체');
  const visibleLessons = selectedCategory === '전체' ? lessons : lessons.filter((lesson) => lesson.category === selectedCategory);
  return <SafeAreaView style={styles.screen} edges={['top']}>
    <View style={styles.topBar}>
      <View style={styles.header}><Text style={styles.title}>기본기</Text></View>
      <View style={styles.search}><Ionicons name="search" size={24} color="#FF43BD" /><Text style={styles.searchText}>웨이브 동작</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>{categories.map((item) => <Pressable key={item} onPress={() => setSelectedCategory(item)} style={[styles.filter, selectedCategory === item && styles.selectedFilter]}><Text style={[styles.filterText, selectedCategory === item && styles.selectedText]}>{item}</Text></Pressable>)}</ScrollView>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      {visibleLessons.map(({ title, meta, level }) => <View key={title} style={styles.lesson}>
        <Image source={require('../../assets/images/Ghost-Dancer.png')} style={styles.lessonImage} />
        <View style={styles.lessonBody}><View style={styles.lessonTitleRow}><Text style={styles.lessonTitle}>{title}</Text><Text style={styles.level}>{level}</Text></View><Text style={styles.meta}>{meta}</Text><Pressable style={styles.start} onPress={() => router.push('/live-feedback')}><Text style={styles.startText}>연습 시작하기</Text></Pressable></View>
      </View>)}
      {visibleLessons.length === 0 && <Text style={styles.empty}>준비 중인 기본기입니다.</Text>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#240529' }, topBar: { paddingHorizontal: 24, paddingBottom: 18, gap: 18 }, content: { paddingHorizontal: 24, paddingBottom: 120, gap: 18 }, header: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  search: { borderRadius: 14, height: 48, backgroundColor: '#3A303B', alignItems: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 16 }, searchText: { color: '#CFC5D0' }, filters: { gap: 8 }, filter: { borderRadius: 12, paddingHorizontal: 17, paddingVertical: 10, backgroundColor: '#F6F3F8' }, selectedFilter: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FF43BD' }, filterText: { color: '#231927', fontWeight: '700' }, selectedText: { color: '#FFF' },
  lesson: { overflow: 'hidden', borderRadius: 8, backgroundColor: '#FBE6F9' }, lessonImage: { width: '100%', height: 172, opacity: .78 }, lessonBody: { padding: 14, gap: 10 }, lessonTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, lessonTitle: { color: '#251B25', fontSize: 20, fontWeight: '800' }, level: { color: '#A31277', backgroundColor: '#FFDCF4', paddingHorizontal: 8, paddingVertical: 3, fontSize: 11 }, meta: { color: '#625663' }, start: { borderRadius: 7, backgroundColor: '#D800C6', alignItems: 'center', padding: 11 }, startText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  empty: { color: '#E8CDE6', textAlign: 'center', paddingVertical: 52 },
});
