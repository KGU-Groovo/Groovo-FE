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
  const [landmarksData, setLandmarksData] = useState<any>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

  const handlePoseLandmarks = (landmarks: any) => {
    // 실시간으로 33개의 body landmark 좌표(x, y, z)가 배열 형태로 들어옵니다.
    setLandmarksData(landmarks);
  };

  const renderLandmarks = () => {
    if (!landmarksData) return null;

    let points: any[] = [];
    // RNMediapipe에서 전달되는 landmarks의 형태에 따라 유연하게 파싱
    if (Array.isArray(landmarksData)) {
      points = landmarksData;
    } else if (landmarksData?.landmarks && Array.isArray(landmarksData.landmarks)) {
      points = landmarksData.landmarks;
    } else if (typeof landmarksData === 'string') {
      try {
        const parsed = JSON.parse(landmarksData);
        points = Array.isArray(parsed) ? parsed : parsed?.landmarks || [];
      } catch (e) { }
    } else if (landmarksData?.result) {
      try {
        const parsed = typeof landmarksData.result === 'string' ? JSON.parse(landmarksData.result) : landmarksData.result;
        points = Array.isArray(parsed) ? parsed : parsed?.landmarks || [];
      } catch (e) { }
    }

    if (!Array.isArray(points)) return null;

    return points.map((point: any, index: number) => {
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') return null;

      let x = point.x;
      let y = point.y;

      const originalX = point.x.toFixed(2);
      const originalY = point.y.toFixed(2);
      const originalZ = point.z !== undefined && point.z !== null ? point.z.toFixed(2) : '0.00';

      // Mediapipe는 기본적으로 0~1 사이의 normalized coordinate를 반환합니다.
      // 값이 2보다 작다면 정규화된 좌표로 간주하여 디바이스 크기에 맞게 변환합니다.
      if (Math.abs(x) <= 2 && Math.abs(y) <= 2) {
        x = x * SCREEN_WIDTH;
        y = y * SCREEN_HEIGHT;
      }

      return (
        <View
          key={index}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            zIndex: 100,
          }}
        >
          {/* 랜드마크 점 */}
          <View
            style={{
              position: 'absolute',
              left: -4, // 점의 중앙을 좌표에 맞춤
              top: -4,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#00FF00', // 연두색
              borderWidth: 1,
              borderColor: '#000000',
            }}
          />
          {/* 랜드마크 수치 정보 텍스트 */}
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 8,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              padding: 2,
              marginLeft: 6,
              marginTop: -6,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {`${index} (${originalX}, ${originalY}, ${originalZ})`}
          </Text>
        </View>
      );
    });
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
        <View style={{ borderRadius: ScreenCornerRadius - 8, overflow: "hidden", flex: 1 }}>
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
              style={styles.camera}
            />

            {renderLandmarks()}

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