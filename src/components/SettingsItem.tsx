import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  primary: '#6c2bee',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

interface SettingsItemProps {
  icon: string;
  iconColor?: string;
  title: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  showArrow?: boolean;
}

export default function SettingsItem({
  icon,
  iconColor = COLORS.primary,
  title,
  value,
  hasSwitch = false,
  switchValue = false,
  onSwitchChange,
  onPress,
  showArrow = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={hasSwitch ? 1 : 0.7}
      disabled={hasSwitch}>
      <View style={[styles.iconContainer, {backgroundColor: `${iconColor}20`}]}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{false: '#3e3e4e', true: COLORS.primary}}
          thumbColor={switchValue ? '#fff' : '#f4f3f4'}
        />
      ) : (
        <View style={styles.rightContainer}>
          {value && <Text style={styles.value}>{value}</Text>}
          {showArrow && (
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={COLORS.textSecondary}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
