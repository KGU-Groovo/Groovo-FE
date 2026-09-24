import { RNMediapipe } from '@thinksys/react-native-mediapipe';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { ScreenCornerRadius } from "react-native-screen-corner-radius";
import { useCameraPermission } from 'react-native-vision-camera';
import MediaControls from "../../components/live-feedback/MediaControls";
import SpeedControl from "../../components/live-feedback/SpeedControl";
import VideoBackground from "../../components/live-feedback/VideoBackground";
import { isFullBodyVisible } from '../../components/live-feedback/body-visibility';
import { getFeedbackState } from "../../components/live-feedback/feedback-score";
import { getSong } from '../../data/songs';
import { DcaFeedback, PentagonScores, PoseLandmark, useAiFeedbackSocket } from '../../hooks/use-ai-feedback-socket';

type ResultData = {
  score: number;
  dca?: DcaFeedback;
  pentagon?: PentagonScores;
};

function toPoseLandmarks(data: unknown): PoseLandmark[] {
  if (typeof data === 'string') {
    try {
      return toPoseLandmarks(JSON.parse(data));
    } catch {
      return [];
    }
  }
  if (!Array.isArray(data)) {
    if (!data || typeof data !== 'object') return [];
    const payload = data as { landmarks?: unknown; result?: unknown };
    return toPoseLandmarks(payload.landmarks ?? payload.result);
  }
  return data.filter((point): point is PoseLandmark => (
    !!point && typeof point === 'object' && typeof (point as PoseLandmark).x === 'number' && typeof (point as PoseLandmark).y === 'number'
  ));
}

export default function LiveFeedback() {
  const router = useRouter();
  const { songId } = useLocalSearchParams<{ songId?: string }>();
  const song = getSong(songId);
  const { hasPermission, requestPermission } = useCameraPermission();
  const [showControls, setShowControls] = useState(false);
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);
  const [landmarksData, setLandmarksData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [repeatStart, setRepeatStart] = useState(0);
  const [repeatEnd, setRepeatEnd] = useState(1);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [hasFullBody, setHasFullBody] = useState(true);
  const scoreHistory = useRef<number[]>([]);
  const playbackTimeMsRef = useRef(0);
  const feedbackState = getFeedbackState(feedbackScore);
  const { sendLandmarks } = useAiFeedbackSocket({
    url: `${process.env.EXPO_PUBLIC_AI_WEBSOCKET_URL}?reference_id=${encodeURIComponent(song.id)}`,
    onFeedback: (feedback) => {
      const score = Math.max(0, Math.min(100, feedback.score * 100));
      scoreHistory.current = [...scoreHistory.current.slice(-59), score];
      setFeedbackScore(score);
      setResultData((previous) => ({
        score,
        dca: feedback.dca ?? previous?.dca,
        pentagon: feedback.pentagon_scores ?? previous?.pentagon,
      }));
    },
  });

  const handlePlayPause = (newPlaying: boolean) => setIsPlaying(newPlaying);
  const handleProgressChange = useCallback((newProgress: number) => setProgress(newProgress), []);
  const handleRepeatToggle = (enabled: boolean) => setIsRepeatEnabled(enabled);
  const showResult = () => router.replace({
    pathname: '/result',
    params: {
      score: String(resultData?.score ?? feedbackScore ?? ''),
      pentagon: resultData?.pentagon ? JSON.stringify(resultData.pentagon) : '',
      highlights: resultData?.dca?.highlight_joints.join(',') ?? '',
      timeline: scoreHistory.current.map((item) => Math.round(item)).join(','),
    },
  });

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
    const points = toPoseLandmarks(landmarks);
    setLandmarksData(points);
    const visible = isFullBodyVisible(points);
    setHasFullBody(visible);
    if (visible) sendLandmarks(points, playbackTimeMsRef.current);
  };

  const renderLandmarks = () => {
    if (!landmarksData) return null;

    const points = toPoseLandmarks(landmarksData);
    if (points.length === 0) return null;

    return points.map((point, index) => {
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
      <View style={[styles.wrapper, { backgroundColor: feedbackState.color }]}>
        <View style={styles.video_frame}>
          <VideoBackground
            source={song.videoSource}
            style={styles.video}
            isPlaying={isPlaying}
            playbackRate={selectedSpeed}
            progress={progress}
            repeatStart={repeatStart}
            repeatEnd={repeatEnd}
            isRepeatEnabled={isRepeatEnabled}
            onProgressUpdate={handleProgressChange}
            onPlaybackTimeUpdate={(timestampMs) => {
              playbackTimeMsRef.current = timestampMs;
            }}
            onPlaybackEnd={showResult}
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
          {!hasFullBody && (
            <View style={styles.body_warning}>
              <Text style={styles.body_warning_text}>전신이 보이도록 카메라에서 조금 뒤로 이동해 주세요.</Text>
            </View>
          )}
          <View style={[styles.feedback_badge, { backgroundColor: feedbackState.color }]}>
            <Text style={styles.feedback_label}>{feedbackState.label}</Text>
            {feedbackScore !== null && <Text style={styles.feedback_score}>{Math.round(feedbackScore)}점</Text>}
          </View>
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
                onRepeatStartChange={setRepeatStart}
                onRepeatEndChange={setRepeatEnd}
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
    padding: 8,
  },
  video_frame: {
    borderRadius: ScreenCornerRadius - 8,
    overflow: "hidden",
    flex: 1,
    backgroundColor: 'black',
    borderWidth: 4,
  },
  camera: {
    width: "100%",
    height: "100%",
    opacity: 0.65,
  },
  video: {
    ...StyleSheet.absoluteFillObject,
  },
  feedback_badge: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  body_warning: {
    position: 'absolute',
    top: 76,
    left: 20,
    right: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(178, 42, 42, 0.92)',
  },
  body_warning_text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedback_label: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  feedback_score: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
