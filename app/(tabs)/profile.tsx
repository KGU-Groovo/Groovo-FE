import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const videos = ['IT’S ME', 'CATCH CATCH'];
const favorites = ['RIZE - SIREN', 'ILLIT - IT’S ME'];

export default function ProfileScreen() {
  return <SafeAreaView style={styles.screen} edges={['top']}><ScrollView contentContainerStyle={styles.content}>
    <View style={styles.profile}><Image source={require('../../assets/images/Ghost-Dancer.png')} style={styles.avatar} /><Text style={styles.name}>KIM SEO YUN</Text><Text style={styles.tier}>GOLD TIER</Text><View style={styles.counts}><Text style={styles.count}>200{`\n`}<Text style={styles.countLabel}>FOLLOWERS</Text></Text><Text style={styles.count}>350{`\n`}<Text style={styles.countLabel}>FOLLOWING</Text></Text></View><View style={styles.edit}><Text style={styles.editText}>EDIT PROFILE</Text></View></View>
    <Text style={styles.section}>나의 댄스비디오</Text><View style={styles.grid}>{videos.map(title => <View key={title} style={styles.videoCard}><View><Image source={require('../../assets/images/Ghost-Dancer.png')} style={styles.videoImage} /><Ionicons name="play" size={25} color="#1E0925" style={styles.play} /></View><Text style={styles.cardTitle}>{title}</Text><Text style={styles.meta}>◉ 12 views</Text></View>)}</View>
    <Text style={styles.section}>내가 찜한 곡들</Text><Text style={styles.sub}>서로의 취향에 맞는 춤 튜토리얼</Text><View style={styles.grid}>{favorites.map(title => <View key={title} style={styles.videoCard}><Image source={require('../../assets/images/Ghost-Dancer.png')} style={styles.favoriteImage} /><Text style={styles.cardTitle}>{title}</Text><Text style={styles.meta}>03:45</Text></View>)}</View>
  </ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#240529' }, content: { padding: 24, gap: 16 }, profile: { borderRadius: 32, backgroundColor: '#2A0642', borderWidth: 1, borderColor: '#A50071', alignItems: 'center', padding: 24, gap: 10 }, avatar: { width: 92, height: 92, borderRadius: 46, borderWidth: 2, borderColor: '#FF43BD' }, name: { color: '#FFF', fontSize: 23, fontWeight: '800' }, tier: { color: '#F6C6DF', fontSize: 12, letterSpacing: 1.5 }, counts: { width: '100%', flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#4A285C', paddingTop: 18, marginTop: 4 }, count: { color: '#F8BADF', textAlign: 'center', fontSize: 16, lineHeight: 26 }, countLabel: { color: '#FFF', fontSize: 13 }, edit: { width: '100%', borderRadius: 28, backgroundColor: '#D800C6', padding: 14, alignItems: 'center', marginTop: 6 }, editText: { color: '#FFF', fontWeight: '800', letterSpacing: 1 }, section: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 10 }, sub: { color: '#C8A9C8', fontSize: 12, marginTop: -12 }, grid: { flexDirection: 'row', gap: 16 }, videoCard: { flex: 1, gap: 8 }, videoImage: { width: '100%', aspectRatio: .8, borderRadius: 24 }, favoriteImage: { width: '100%', aspectRatio: 1.4, borderRadius: 22 }, cardTitle: { color: '#F7E9F6', fontSize: 14 }, meta: { color: '#F1CCE9', fontSize: 13 }, play: { position: 'absolute', right: 12, bottom: 12, backgroundColor: '#FF43BD', padding: 10, borderRadius: 25, overflow: 'hidden' },
});
