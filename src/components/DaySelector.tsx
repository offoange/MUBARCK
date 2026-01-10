import React from 'react';
import {Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

interface Day {
  dayName: string;
  dayNumber: number;
  isSelected?: boolean;
}

interface DaySelectorProps {
  days: Day[];
  onDaySelect: (dayNumber: number) => void;
}

export default function DaySelector({days, onDaySelect}: DaySelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {days.map(day => (
        <TouchableOpacity
          key={day.dayNumber}
          style={[styles.dayItem, day.isSelected && styles.dayItemSelected]}
          onPress={() => onDaySelect(day.dayNumber)}>
          <Text
            style={[
              styles.dayName,
              day.isSelected && styles.dayNameSelected,
            ]}>
            {day.dayName}
          </Text>
          <Text
            style={[
              styles.dayNumber,
              day.isSelected && styles.dayNumberSelected,
            ]}>
            {day.dayNumber}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  dayItem: {
    width: 52,
    height: 70,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dayItemSelected: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  dayNameSelected: {
    color: COLORS.textPrimary,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  dayNumberSelected: {
    color: COLORS.textPrimary,
  },
});
