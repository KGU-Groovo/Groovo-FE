import { RNMediapipe } from '@thinksys/react-native-mediapipe';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenCornerRadius } from "react-native-screen-corner-radius";
import { useCameraPermission } from 'react-native-vision-camera';
import MediaControls from "../../components/live-feedback/MediaControls";
import SpeedControl from "../../components/live-feedback/SpeedControl";
import VideoBackground from "../../components/live-feedback/VideoBackground";

export default function LiveFeedback() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [showControls, setShowControls] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [landmarksData, setLandmarksData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [repeatStart, setRepeatStart] = useState(0);
  const [repeatEnd, setRepeatEnd] = useState(1);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);

  const handlePlayPause = (newPlaying: boolean) => setIsPlaying(newPlaying);
  const handleProgressChange = useCallback((newProgress: number) => setProgress(newProgress), []);
  const handleRepeatToggle = (enabled: boolean) => setIsRepeatEnabled(enabled);
  const handleRepeatStartChange = (value: number) => setRepeatStart(value);
  const handleRepeatEndChange = (value: number) => setRepeatEnd(value);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

  const resetHideTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleHideTimer = () => {
    resetHideTimer();
    timerRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  const handlePress = () => {
    if (showControls) {
      setShowControls(false);
      resetHideTimer();
    } else {
      setShowControls(true);
      scheduleHideTimer();
    }
  };

  const handlePoseLandmarks = (landmarks: any) => {
    setLandmarksData(landmarks);
  };

  const renderLandmarks = () => {
    if (!landmarksData) return null;

    let points: any[] = [];
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

      if (Math.abs(x) <= 2 && Math.abs(y) <= 2) {
        x = x * SCREEN_WIDTH;
        y = y * SCREEN_HEIGHT;
      }

      return (
        <View key={index} style={[styles.landmark_container, { left: x, top: y }]}>
          <View style={styles.landmark_dot} />
          <Text style={styles.landmark_text}>
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

  if (!hasPermission) {
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
        <View style={{ borderRadius: ScreenCornerRadius - 8, overflow: "hidden", flex: 1, backgroundColor: 'black' }}>
          <VideoBackground
            source={require("../../assets/videos/HeartsToHearts_style.mp4")}
            style={styles.video}
            isPlaying={isPlaying}
            playbackRate={selectedSpeed}
            progress={progress}
            onProgressUpdate={handleProgressChange}
          />
          <RNMediapipe
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            face={true}
            torso={true}
            leftArm={true}
            rightArm={true}
            onLandmark={handlePoseLandmarks}
            style={styles.camera}
          />
          {renderLandmarks()}
          <Pressable style={styles.overlay} onPress={handlePress} />
          {showControls && (
            <View pointerEvents="box-none" style={styles.controls}>
              <SpeedControl
                selectedSpeed={selectedSpeed}
                onSpeedChange={setSelectedSpeed}
                onInteractionStart={resetHideTimer}
                onInteractionEnd={scheduleHideTimer}
              />
              <MediaControls
                isPlaying={isPlaying}
                progress={progress}
                repeatStart={repeatStart}
                repeatEnd={repeatEnd}
                isRepeatEnabled={isRepeatEnabled}
                onPlayPause={handlePlayPause}
                onProgressChange={handleProgressChange}
                onRepeatToggle={handleRepeatToggle}
                onRepeatStartChange={handleRepeatStartChange}
                onRepeatEndChange={handleRepeatEndChange}
              />
            </View>
          )}
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
  camera: {
    width: "100%",
    height: "100%",
    opacity: 0.65,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
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
  landmark_container: {
    position: 'absolute',
    zIndex: 100,
  },
  landmark_dot: {
    position: 'absolute',
    left: -4,
    top: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
    borderWidth: 1,
    borderColor: '#000000',
  },
  landmark_text: {
    color: '#FFFFFF',
    fontSize: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 2,
    marginLeft: 6,
    marginTop: -6,
    borderRadius: 2,
    overflow: 'hidden',
  },
});
