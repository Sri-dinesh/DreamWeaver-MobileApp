import type { ColorValue } from 'react-native';

export const palette = {
  backgroundPrimary: '#FAF7FF',
  backgroundSecondary: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F7F4FF',
  primary: '#7A5AF8',
  primarySoft: '#DCCBFF',
  secondary: '#5BBDF5',
  accent: '#F872B2',
  success: '#64D2A3',
  warning: '#F9AF5A',
  info: '#6DC8F5',
  textPrimary: '#1E1B4B',
  textSecondary: '#5C5A7A',
  textMuted: '#8A89A6',
  divider: '#E2E0F4',
  shadow: 'rgba(122, 90, 248, 0.18)',
} as const;

export type GradientStop = readonly [ColorValue, ColorValue, ...ColorValue[]];

export const gradients = {
  appBackground: ['#FBF7FF', '#F2F7FF'],
  header: ['#7667FF', '#9B5CF9', '#F075C6'],
  cardPrimary: ['#F3EDFF', '#F9F7FF'],
  cardSecondary: ['#EBFAFF', '#F6FBFF'],
  cardAccent: ['#FFEFF4', '#FFF6FD'],
  buttonPrimary: ['#7C6BFF', '#B16BFF'],
  buttonSecondary: ['#5BC4FF', '#8AE9FF'],
  floating: ['#7050FF', '#A15FFF'],
  tabBar: ['#FFFFFF', '#F7F8FE'],
} as const satisfies Record<string, GradientStop>;

export const radii = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  pill: 999,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const typography = {
  display: {
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  body: {
    fontSize: 15,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  },
} as const;

export const shadows = {
  medium: {
    shadowColor: palette.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  soft: {
    shadowColor: 'rgba(16, 24, 40, 0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 8,
  },
  subtle: {
    shadowColor: 'rgba(16, 24, 40, 0.06)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
};
