import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoBackgroundProps {
  source: any;
  style?: any;
  children?: React.ReactNode;
  isPlaying?: boolean;
  playbackRate?: number;
  /**
   * Progress as a fraction (0 to 1) of the video duration.
   * When provided, the player will seek to the corresponding timestamp.
   */
  progress?: number;
  /**
   * Callback invoked with the current playback progress (0‑1).
   * Used to keep UI timeline in sync with the video.
   */
  onProgressUpdate?: (progress: number) => void;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  source,
  style,
  children,
  isPlaying = true,
  playbackRate = 1.0,
  progress,
  onProgressUpdate,
}) => {
  const player = useVideoPlayer(source, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  // Keep a stable reference to the callback so the interval isn't recreated
  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;

  // Play / pause control
  useEffect(() => {
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  // Adjust playback rate
  useEffect(() => {
    player.playbackRate = playbackRate;
  }, [playbackRate, player]);

  // Seek only when the user-requested position differs significantly
  // from the current playback position (threshold: 0.5 seconds).
  // This prevents the feedback loop where the video's own progress
  // report triggers an unnecessary seek back to the same spot.
  useEffect(() => {
    if (
      progress != null &&
      typeof player.duration === 'number' &&
      player.duration > 0
    ) {
      const targetTime = progress * player.duration;
      if (Math.abs(player.currentTime - targetTime) > 0.5) {
        player.currentTime = targetTime;
      }
    }
  }, [progress]);

  // Emit current progress periodically for UI sync
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof player.duration === 'number' && player.duration > 0) {
        const currentProgress = player.currentTime / player.duration;
        onProgressUpdateRef.current?.(currentProgress);
      }
    }, 300);
    return () => clearInterval(interval);
  }, [player]);

  return (
    <View style={style}>
      <VideoView
        player={player}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        nativeControls={false}
      />
      {children}
    </View>
  );
};

export default VideoBackground;
