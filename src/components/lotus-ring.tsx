import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { colors } from '@/theme';

interface LotusRingProps {
  size?: number;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  showCenterGlow?: boolean;
  style?: ViewStyle;
}

/**
 * LotusRing: Motif khas mahkota bunga teratai dari logo Universitas Buddhi Dharma.
 * Digunakan sebagai aksen ornamen berwibawa pada kartu hero, header login, dan kartu KTM.
 */
export function LotusRing({
  size = 180,
  color = colors.primaryLight,
  opacity = 0.25,
  strokeWidth = 1.2,
  showCenterGlow = false,
  style,
}: LotusRingProps) {
  const center = size / 2;
  const outerRadius = size * 0.44;
  const innerRadius = size * 0.32;
  const petalCount = 12;

  // Bangun path 12 kelopak teratai bergelombang sesuai siluet logo resmi UBD
  const petalPaths: string[] = [];
  for (let i = 0; i < petalCount; i++) {
    const angle1 = (i * 2 * Math.PI) / petalCount;
    const angleMid = ((i + 0.5) * 2 * Math.PI) / petalCount;
    const angle2 = ((i + 1) * 2 * Math.PI) / petalCount;

    const x1 = center + innerRadius * Math.cos(angle1);
    const y1 = center + innerRadius * Math.sin(angle1);

    const xPeak = center + outerRadius * Math.cos(angleMid);
    const yPeak = center + outerRadius * Math.sin(angleMid);

    const x2 = center + innerRadius * Math.cos(angle2);
    const y2 = center + innerRadius * Math.sin(angle2);

    petalPaths.push(`M ${x1} ${y1} Q ${xPeak} ${yPeak} ${x2} ${y2}`);
  }

  return (
    <View
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G opacity={opacity}>
          {/* Cincin Lingkar Terluar */}
          <Circle
            cx={center}
            cy={center}
            r={outerRadius}
            stroke={color}
            strokeWidth={strokeWidth * 0.8}
            fill="none"
            strokeDasharray="3 3"
          />

          {/* Mahkota 12 Kelopak Teratai UBD */}
          {petalPaths.map((d, index) => (
            <Path
              key={`petal-${index}`}
              d={d}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          ))}

          {/* Cincin Lingkar Dalam (Sinar Surya) */}
          <Circle
            cx={center}
            cy={center}
            r={innerRadius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Titik-titik Radial Surya */}
          {Array.from({ length: 8 }).map((_, idx) => {
            const radAngle = (idx * Math.PI) / 4;
            const rStart = innerRadius * 0.65;
            const rEnd = innerRadius * 0.9;
            const xA = center + rStart * Math.cos(radAngle);
            const yA = center + rStart * Math.sin(radAngle);
            const xB = center + rEnd * Math.cos(radAngle);
            const yB = center + rEnd * Math.sin(radAngle);
            return (
              <Path
                key={`ray-${idx}`}
                d={`M ${xA} ${yA} L ${xB} ${yB}`}
                stroke={color}
                strokeWidth={strokeWidth * 0.75}
                strokeLinecap="round"
              />
            );
          })}

          {showCenterGlow && (
            <Circle
              cx={center}
              cy={center}
              r={innerRadius * 0.4}
              stroke={color}
              strokeWidth={strokeWidth * 0.5}
              fill="none"
            />
          )}
        </G>
      </Svg>
    </View>
  );
}
