import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const speeds = [0.5, 1.0, 1.5, 2.0];

export default function SpeedControl() {
  const [selectedSpeed, setSelectedSpeed] = useState(1.0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>SPEED</Text>
      {speeds.map((speed) => {
        const isSelected = speed === selectedSpeed;
        return (
          <TouchableOpacity
            key={speed}
            style={[styles.speedOption, isSelected && styles.selectedOption]}
            onPress={() => setSelectedSpeed(speed)}
          >
            <Text style={[styles.speedText, isSelected && styles.selectedText]}>
              {speed.toFixed(1)}x
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    backgroundColor: 'rgba(50, 54, 60, 1)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: 80,
  },
  header: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  speedOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    marginBottom: 4,
    width: '100%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  speedText: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  selectedText: {
    color: '#1A1C20',
  },
});
