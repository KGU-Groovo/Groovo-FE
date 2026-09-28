import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ fade: true, duration: 500 });

export default function RootLayout() {
  useEffect(() => {
    const frame = requestAnimationFrame(() => SplashScreen.hide());
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="live-feedback" options={{ headerShown: false }} />
      <Stack.Screen name="result" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
