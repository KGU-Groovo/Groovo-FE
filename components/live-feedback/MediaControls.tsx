import FontAwesome5 from '@react-native-vector-icons/fontawesome-free-solid';
import React, { useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MediaControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.2);
  const [repeatStart, setRepeatStart] = useState(0.2);
  const [repeatEnd, setRepeatEnd] = useState(0.6);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  const timelineWidth = useRef(0);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setProgress(1);
    setIsPlaying(false);
  };

  const handleRepeatToggle = () => {
    setIsRepeatEnabled(!isRepeatEnabled);
  };

  const handleTimelinePress = (event: any) => {
    const { locationX } = event.nativeEvent;
    const newProgress = locationX / timelineWidth.current;
    setProgress(Math.max(0, Math.min(1, newProgress)));
  };

  const leftHandleResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDraggingLeft(true),
    onPanResponderMove: (event, gestureState) => {
      const newStart = (repeatStart * timelineWidth.current + gestureState.dx) / timelineWidth.current;
      const clampedStart = Math.max(0, Math.min(repeatEnd - 0.1, newStart));
      setRepeatStart(clampedStart);
    },
    onPanResponderRelease: () => setIsDraggingLeft(false),
  });

  const rightHandleResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsDraggingRight(true),
    onPanResponderMove: (event, gestureState) => {
      const newEnd = (repeatEnd * timelineWidth.current + gestureState.dx) / timelineWidth.current;
      const clampedEnd = Math.max(repeatStart + 0.1, Math.min(1, newEnd));
      setRepeatEnd(clampedEnd);
    },
    onPanResponderRelease: () => setIsDraggingRight(false),
  });

  return (
    <View style={styles.media_controls}>
      <TouchableOpacity style={styles.repeat_section} onPress={handleRepeatToggle}>
        <FontAwesome5 
          name="redo" 
          size={16} 
          color={isRepeatEnabled ? "#6366f1" : "#ffffff"} 
          style={{ marginRight: 8, opacity: isRepeatEnabled ? 1 : 0.9 }}
        />
        <Text style={[styles.repeat_text, isRepeatEnabled && styles.repeat_text_active]}>
          {isRepeatEnabled ? '구간반복 중' : '구간반복하기'}
        </Text>
      </TouchableOpacity>
      
      <View 
        style={styles.timeline_container}
        onLayout={(event) => {
          timelineWidth.current = event.nativeEvent.layout.width;
        }}
      >
        <TouchableOpacity 
          style={styles.timeline_touch_area}
          onPress={handleTimelinePress}
          activeOpacity={1}
        >
          <View style={styles.timeline_background} />
          <View style={[styles.timeline_progress, { width: `${progress * 100}%` }]} />
          {isRepeatEnabled && (
            <View style={[styles.timeline_segment, { 
              left: `${repeatStart * 100}%`, 
              width: `${(repeatEnd - repeatStart) * 100}%` 
            }]} />
          )}
          {isRepeatEnabled && (
            <>
              <View 
                style={[styles.timeline_handle_left, { left: `${repeatStart * 100}%` }, isDraggingLeft && styles.timeline_handle_dragging]}
                {...leftHandleResponder.panHandlers}
              />
              <View 
                style={[styles.timeline_handle_right, { left: `${repeatEnd * 100}%` }, isDraggingRight && styles.timeline_handle_dragging]}
                {...rightHandleResponder.panHandlers}
              />
            </>
          )}
          <View style={styles.timeline_end_segment} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.playback_controls}>
        <TouchableOpacity onPress={handlePrevious} style={styles.control_button_container}>
          <FontAwesome5 name="step-backward" size={28} color="#ffffff" style={{ opacity: 0.8 }} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause} style={styles.play_button_container}>
          <FontAwesome5 
            name={isPlaying ? "pause" : "play"} 
            size={28} 
            color="#ffffff" 
            style={{ fontWeight: "600" }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleNext} style={styles.control_button_container}>
          <FontAwesome5 name="step-forward" size={28} color="#ffffff" style={{ opacity: 0.8 }} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  media_controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: 220,
    backgroundColor: "rgba(18, 18, 18, 0.95)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 32,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12,
  },
  repeat_section: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  repeat_text: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: -0.2,
    opacity: 0.9,
  },
  repeat_text_active: {
    color: "#6366f1",
    fontWeight: "600",
  },
  timeline_container: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
    position: "relative",
    marginBottom: 24,
  },
  timeline_touch_area: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
  },
  timeline_background: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 3,
  },
  timeline_progress: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "20%",
    height: "100%",
    backgroundColor: "#6366f1",
    borderRadius: 3,
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  timeline_segment: {
    position: "absolute",
    left: "20%",
    top: 0,
    width: "40%",
    height: "100%",
    backgroundColor: "#a78bfa",
    borderRadius: 3,
    opacity: 0.8,
  },
  timeline_handle_left: {
    position: "absolute",
    left: "20%",
    top: -7,
    width: 20,
    height: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  timeline_handle_right: {
    position: "absolute",
    left: "60%",
    top: -7,
    width: 20,
    height: 20,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  timeline_handle_dragging: {
    backgroundColor: "#6366f1",
    transform: [{ scale: 1.2 }],
  },
  timeline_end_segment: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "20%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 3,
  },
  playback_controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  control_button_container: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  control_button: {
    fontSize: 28,
    color: "#ffffff",
    opacity: 0.8,
  },
  play_button_container: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6366f1",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  play_button: {
    fontSize: 28,
    color: "#ffffff",
    fontWeight: "600",
  },
});