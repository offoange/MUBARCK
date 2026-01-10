import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const COLORS = {
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
};

interface ProfileStatCardProps {
  icon: string;
  iconColor: string;
  value: string;
  label: string;
}

export default function ProfileStatCard({
  icon,
  iconColor,
  value,
  label,
}: ProfileStatCardProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, {backgroundColor: `${iconColor}20`}]}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
