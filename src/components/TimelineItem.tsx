import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

interface TimelineItemProps {
  time: string;
  icon: string;
  title: string;
  subtitle: string;
  timeRange: string;
  backgroundColor?: string;
  iconBgColor?: string;
  isFirst?: boolean;
  isLast?: boolean;
  onPress?: () => void;
  onMorePress?: () => void;
}

export default function TimelineItem({
  time,
  icon,
  title,
  subtitle,
  timeRange,
  backgroundColor = COLORS.card,
  iconBgColor = COLORS.primary,
  isFirst = false,
  isLast = false,
  onPress,
  onMorePress,
}: TimelineItemProps) {
  return (
    <View style={styles.container}>
      {/* Time Column */}
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {/* Timeline Indicator */}
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.timelineLine,
            isFirst && styles.timelineLineFirst,
            {backgroundColor: isFirst ? 'transparent' : 'rgba(255,255,255,0.1)'},
          ]}
        />
        <View style={[styles.timelineDot, {backgroundColor: iconBgColor}]} />
        <View
          style={[
            styles.timelineLine,
            isLast && styles.timelineLineLast,
            {backgroundColor: isLast ? 'transparent' : 'rgba(255,255,255,0.1)'},
          ]}
        />
      </View>

      {/* Card Content */}
      <TouchableOpacity
        style={[styles.card, {backgroundColor}]}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, {backgroundColor: iconBgColor}]}>
            <MaterialIcons name={icon} size={20} color="#fff" />
          </View>
          {onMorePress && (
            <TouchableOpacity onPress={onMorePress} style={styles.moreButton}>
              <MaterialIcons name="more-horiz" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.timeRangeContainer}>
          <MaterialIcons name="schedule" size={14} color={iconBgColor} />
          <Text style={[styles.timeRange, {color: iconBgColor}]}>{timeRange}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 140,
  },
  timeColumn: {
    width: 45,
    paddingTop: 16,
  },
  timeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  timelineColumn: {
    width: 24,
    alignItems: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
  },
  timelineLineFirst: {
    backgroundColor: 'transparent',
  },
  timelineLineLast: {
    backgroundColor: 'transparent',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginLeft: 8,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeRange: {
    fontSize: 12,
    fontWeight: '500',
  },
});
