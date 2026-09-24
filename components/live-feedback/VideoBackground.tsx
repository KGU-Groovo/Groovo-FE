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
  repeatStart?: number;
  repeatEnd?: number;
  isRepeatEnabled?: boolean;
  /**
   * Callback invoked with the current playback progress (0‑1).
   * Used to keep UI timeline in sync with the video.
   */
  onProgressUpdate?: (progress: number) => void;
  onPlaybackTimeUpdate?: (timestampMs: number) => void;
  onPlaybackEnd?: () => void;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  source,
  style,
  children,
  isPlaying = true,
  playbackRate = 1.0,
  progress,
  repeatStart = 0,
  repeatEnd = 1,
  isRepeatEnabled = false,
  onProgressUpdate,
  onPlaybackTimeUpdate,
  onPlaybackEnd,
}) => {
  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    p.muted = true;
    p.play();
  });

  // Keep a stable reference to the callback so the interval isn't recreated
  const onProgressUpdateRef = useRef(onProgressUpdate);
  onProgressUpdateRef.current = onProgressUpdate;
  const onPlaybackTimeUpdateRef = useRef(onPlaybackTimeUpdate);
  onPlaybackTimeUpdateRef.current = onPlaybackTimeUpdate;
  const onPlaybackEndRef = useRef(onPlaybackEnd);
  onPlaybackEndRef.current = onPlaybackEnd;
  const repeatRef = useRef({ isRepeatEnabled, repeatStart, repeatEnd });
  repeatRef.current = { isRepeatEnabled, repeatStart, repeatEnd };

  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      const repeat = repeatRef.current;
      if (repeat.isRepeatEnabled) {
        player.currentTime = repeat.repeatStart * player.duration;
        player.play();
        return;
      }
      onPlaybackEndRef.current?.();
    });
    return () => subscription.remove();
  }, [player]);

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
        const repeat = repeatRef.current;
        if (repeat.isRepeatEnabled && currentProgress >= repeat.repeatEnd) {
          player.currentTime = repeat.repeatStart * player.duration;
          onProgressUpdateRef.current?.(repeat.repeatStart);
          onPlaybackTimeUpdateRef.current?.(player.currentTime * 1000);
          return;
        }
        onProgressUpdateRef.current?.(currentProgress);
        onPlaybackTimeUpdateRef.current?.(player.currentTime * 1000);
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
