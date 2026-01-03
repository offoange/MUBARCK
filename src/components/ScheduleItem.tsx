import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

interface ScheduleItemProps {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  isActive?: boolean;
  isLast?: boolean;
  avatars?: string[];
}

export default function ScheduleItem({
  icon,
  title,
  subtitle,
  time,
  isActive = false,
  isLast = false,
  avatars = [],
}: ScheduleItemProps) {
  return (
    <View style={styles.container}>
      <View style={styles.timelineContainer}>
        <View
          style={[
            styles.iconCircle,
            isActive ? styles.iconCircleActive : styles.iconCircleInactive,
          ]}>
          <MaterialIcons
            name={icon}
            size={16}
            color={isActive ? '#fff' : '#94a3b8'}
          />
        </View>
        {!isLast && <View style={styles.line} />}
      </View>
      <View style={[styles.card, !isActive && styles.cardInactive]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <View style={[styles.timeBadge, isActive && styles.timeBadgeActive]}>
            <Text style={[styles.timeText, isActive && styles.timeTextActive]}>
              {time}
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {avatars.length > 0 && (
          <View style={styles.avatarsContainer}>
            {avatars.map((avatar, index) => (
              <Image
                key={index}
                source={{uri: avatar}}
                style={[styles.avatar, {marginLeft: index > 0 ? -8 : 0}]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
  },
  timelineContainer: {
    alignItems: 'center',
    width: 40,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconCircleActive: {
    backgroundColor: '#6c2bee',
    shadowColor: '#6c2bee',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircleInactive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#1d172a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  cardInactive: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  timeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeBadgeActive: {
    backgroundColor: 'rgba(108, 43, 238, 0.1)',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94a3b8',
  },
  timeTextActive: {
    color: '#6c2bee',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
  },
  avatarsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1d172a',
  },
});
