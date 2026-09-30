import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle } from 'react-native-svg';

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
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
                  r={radius}
                  stroke="#E2E8F0"
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
                      r={radius}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  innerSubtitle: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  legendContainer: {
    gap: 8,
    flex: 1,
    paddingLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    color: '#475569',
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});
