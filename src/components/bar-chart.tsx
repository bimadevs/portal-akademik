import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UBD_COLORS } from '../constants/theme';

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
          const barColor = item.color || UBD_COLORS.PRIMARY;

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
  chartContainer: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelContainer: {
    width: 100,
  },
  label: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  track: {
    flex: 1,
    height: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 8,
  },
  countText: {
    width: 28,
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'right',
  },
});
