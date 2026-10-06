import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';
import { colors, fonts, radius, shadows, spacing } from '@/theme';

export interface PieChartItem {
  label: string;
  count: number;
  color: string;
}

interface PieChartProps {
  data: PieChartItem[];
  title?: string;
  size?: number;
}

export function PieChart({ data, title, size = 130 }: PieChartProps) {
  const total = data.reduce((acc, cur) => acc + cur.count, 0);
  const strokeWidth = 22;
  const chartRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * chartRadius;

  let accumulatedPercent = 0;

  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.content}>
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={size} height={size}>
            <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
              {total === 0 ? (
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={chartRadius}
                  stroke={colors.border}
                  strokeWidth={strokeWidth}
                  fill="none"
                />
              ) : (
                data.map((item, index) => {
                  const strokeDashoffset = circumference - (circumference * item.count) / total;
                  const rotation = (accumulatedPercent / total) * 360;
                  accumulatedPercent += item.count;

                  return (
                    <Circle
                      key={index}
                      cx={size / 2}
                      cy={size / 2}
                      r={chartRadius}
                      stroke={item.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${circumference} ${circumference}`}
                      strokeDashoffset={strokeDashoffset}
                      origin={`${size / 2}, ${size / 2}`}
                      rotation={rotation}
                      fill="none"
                      strokeLinecap="round"
                    />
                  );
                })
              )}
            </G>
          </Svg>
          <View style={styles.innerLabel}>
            <Text style={styles.innerTotal}>{total}</Text>
            <Text style={styles.innerSubtitle}>Total</Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          {data.map((item, index) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <View key={index} style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: item.color }]} />
                <View style={styles.legendTextWrapper}>
                  <Text style={styles.legendLabel}>{item.label}</Text>
                  <Text style={styles.legendValue}>
                    {item.count} ({pct}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  innerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerTotal: {
    fontFamily: fonts.displayBold,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  innerSubtitle: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legendContainer: {
    gap: spacing.sm,
    flex: 1,
    paddingLeft: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendTextWrapper: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
