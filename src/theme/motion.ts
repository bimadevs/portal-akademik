/**
 * Motion and animation tokens for spring physics and transition timings.
 */
export const motion = {
  duration: {
    instant: 100,
    fast: 150,
    base: 250,
    smooth: 350,
    slow: 500,
  },
  spring: {
    snappy: { damping: 15, mass: 0.8, stiffness: 200 },
    gentle: { damping: 20, mass: 1, stiffness: 120 },
    bouncy: { damping: 12, mass: 0.9, stiffness: 180 },
  },
  press: {
    scale: 0.97,
    opacity: 0.85,
  },
} as const;

export type MotionToken = typeof motion;
