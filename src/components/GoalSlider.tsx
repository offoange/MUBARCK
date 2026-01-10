import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#6c2bee',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

interface GoalSliderProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle: string;
  progress: number;
  displayValue: string;
  hasDropdown?: boolean;
  onPress?: () => void;
}

export default function GoalSlider({
  icon,
  iconColor,
  title,
  subtitle,
  progress,
  displayValue,
  hasDropdown = false,
  onPress,
}: GoalSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, {backgroundColor: `${iconColor}20`}]}>
          <MaterialIcons name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {hasDropdown ? (
          <TouchableOpacity style={styles.dropdown} onPress={onPress}>
            <Text style={styles.displayValue}>{displayValue}</Text>
            <MaterialIcons name="expand-more" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ) : (
          <Text style={styles.displayValue}>{displayValue}</Text>
        )}
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, {width: `${progress}%`}]} />
        <View style={[styles.thumb, {left: `${progress}%`}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  displayValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    marginLeft: -8,
  },
});
