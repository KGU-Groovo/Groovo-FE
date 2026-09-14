import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor="#26162B"
      blurEffect="systemChromeMaterialDark"
      tintColor="#FF43BD"
      iconColor={{ default: '#C7C4CC', selected: '#FF43BD' }}
      labelStyle={{ default: { color: '#C7C4CC', fontSize: 11 }, selected: { color: '#FF43BD', fontSize: 11 } }}
      shadowColor="rgba(255,255,255,0.18)"
      minimizeBehavior="never"
    >
      <NativeTabs.Trigger name="index"><Icon sf={{ default: 'house', selected: 'house.fill' }} /><Label>홈</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="basics"><Icon sf={{ default: 'play.circle', selected: 'play.circle.fill' }} /><Label>기본기</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="feed"><Icon sf={{ default: 'bubble.left.and.bubble.right', selected: 'bubble.left.and.bubble.right.fill' }} /><Label>피드</Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile"><Icon sf={{ default: 'person', selected: 'person.fill' }} /><Label>마이</Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}
