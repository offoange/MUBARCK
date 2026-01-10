import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const COLORS = {
  primary: '#6c2bee',
  background: '#161022',
  card: '#1d172a',
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  emerald: '#34d399',
};

interface BalanceCardProps {
  title: string;
  subtitle: string;
  percentage: number;
  focusLabel: string;
  focusValue: string;
  pauseLabel: string;
  pauseValue: string;
}

export default function BalanceCard({
  title,
  subtitle,
  percentage,
  focusLabel,
  focusValue,
  pauseLabel,
  pauseValue,
}: BalanceCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressBar, {width: `${percentage}%`}]} />
        </View>
      </View>
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <View style={[styles.statDot, {backgroundColor: COLORS.primary}]} />
          <Text style={styles.statText}>
            {focusValue} {focusLabel}
          </Text>
        </View>
        <View style={styles.statItem}>
          <View style={[styles.statDot, {backgroundColor: COLORS.textSecondary}]} />
          <Text style={styles.statText}>
            {pauseValue} {pauseLabel}
          </Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  percentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.emerald,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
