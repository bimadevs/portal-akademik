import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export interface BarChartItem {
  label: string;
  count: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartItem[];
  title?: string;
}

export function BarChart({ data, title }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const percentage = Math.round((item.count / max) * 100);
          const barColor = item.color || colors.primary;

          return (
            <View key={index} style={styles.row}>
              <View style={styles.labelContainer}>
                <Text style={styles.label} numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.max(percentage, 4)}%`,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.countText}>{item.count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: shadows.card,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm + 4,
  },
  chartContainer: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  labelContainer: {
    width: 100,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  track: {
    flex: 1,
    height: 16,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: radius.sm,
  },
  countText: {
    width: 32,
    fontFamily: fonts.displayBold,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
