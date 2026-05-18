import MediaControls from "@/components/live-feedback/MediaControls";
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import { Button, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";

export default function LiveFeedback() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showControls, setShowControls] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handlePress = () => {
    if (showControls) {
      setShowControls(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    } else {
      setShowControls(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <ImageBackground
          source={require("../../assets/images/Ghost-Dancer.png")}
          style={styles.background_dance}
        >
          <View style={styles.background_dance_mask} />
          <CameraView style={styles.camera} facing={facing} />

          <Pressable style={StyleSheet.absoluteFillObject} onPress={handlePress} />

          {showControls && (
            <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
              <MediaControls />
            </View>
          )}
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wrapper: {
    width: "100%",
    height: "100%",
  },
  background_dance_mask: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    opacity: 0.6,
  },
  background_dance: {
    width: "100%",
    height: "100%",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    position: "absolute",
    width: "100%",
    height: "100%",
    opacity: 0.65,
  },
});