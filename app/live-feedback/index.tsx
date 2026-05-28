import { RNMediapipe } from '@thinksys/react-native-mediapipe';
import { useEffect, useRef, useState } from 'react';
import { Button, Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenCornerRadius } from "react-native-screen-corner-radius";
import { useCameraPermission } from 'react-native-vision-camera';
import MediaControls from "../../components/live-feedback/MediaControls";
import SpeedControl from "../../components/live-feedback/SpeedControl";

export default function LiveFeedback() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [showControls, setShowControls] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

  const handlePoseLandmarks = (landmarks: any) => {
    // 실시간으로 33개의 body landmark 좌표(x, y, z)가 배열 형태로 들어옵니다.
    console.log('Detected landmarks:', landmarks);
  };

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

  if (!hasPermission) {
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
        <View style={{ borderRadius: ScreenCornerRadius, overflow: "hidden", flex: 1 }}>
          <ImageBackground
            source={require("../../assets/images/Ghost-Dancer.png")}
            style={styles.background_dance}
          >
            <View style={styles.background_dance_mask} />
            <RNMediapipe
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
              face={true}        // 얼굴 포인트 포함 여부
              torso={true}       // 상체 포인트 포함 여부
              leftArm={true}
              rightArm={true}
              onLandmark={handlePoseLandmarks}
            />

            <Pressable style={styles.overlay} onPress={handlePress} />

            {showControls && (
              <View pointerEvents="box-none" style={styles.controls}>
                <SpeedControl />
                <MediaControls />
              </View>
            )}
          </ImageBackground>

        </View>
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
    backgroundColor: "red",
    padding: 8,
  },
  background_dance_mask: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    opacity: 0.05,
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
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  controls: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
});