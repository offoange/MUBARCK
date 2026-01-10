import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CircularProgress from './CircularProgress';

interface WellnessCardProps {
  icon: string;
  label: string;
  value: string;
  progress: number;
  color: string;
  onPress?: () => void;
}

export default function WellnessCard({
  icon,
  label,
  value,
  progress,
  color,
  onPress,
}: WellnessCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <CircularProgress
        size={56}
        strokeWidth={3}
        progress={progress}
        color={color}>
        <MaterialIcons name={icon} size={20} color={color} />
      </CircularProgress>
      <View style={styles.textContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, {color}]}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1d172a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textContainer: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
