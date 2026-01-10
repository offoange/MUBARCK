import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

interface ReminderItemProps {
  icon: string;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle: string;
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export default function ReminderItem({
  icon,
  iconColor = '#fff',
  iconBgColor = COLORS.primary,
  title,
  subtitle,
  isEnabled = false,
  onToggle,
  onPress,
}: ReminderItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={[styles.iconContainer, {backgroundColor: iconBgColor}]}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{false: '#3e3e4e', true: COLORS.primary}}
        thumbColor={isEnabled ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#3e3e4e"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
