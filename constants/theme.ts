import { Platform } from 'react-native';

// Premium Dark Theme with Premium Greenish Accent
export const Colors = {
  dark: {
    // Background
    bg: '#0A0E0A',
    bgSecondary: '#121612',
    bgTertiary: '#1D231D',
    
    // Cards & Surfaces
    card: '#121612',
    cardAlt: '#1D231D',
    
    // Text
    text: '#F0F4F0',
    textSecondary: '#A8B8A8',
    textTertiary: '#5D6B5D',
    
    // Premium Green Accents
    accentPrimary: '#2FD17F', // Premium bright green
    accentPrimaryDark: '#1BA35E', // Darker green for depth
    accentPrimaryLight: '#4FE59F', // Lighter green for highlights
    accentGold: '#C9B562', // Muted gold for secondary accent
    accentSecondary: '#6FD18F', // Soft green variant
    
    // Special
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    
    // Gradients (to be used with style props)
    greenGradientStart: '#1BA35E',
    greenGradientEnd: '#0F6E3B',
    
    // Premium forest tones
    darkForest: '#0D1610',
    lightForest: '#2A3D2A',
    
    // Tab bar
    tabBarBg: 'rgba(18, 22, 18, 0.95)',
    tabBarBorder: 'rgba(93, 107, 93, 0.2)',
    
    // Overlay
    overlay: 'rgba(10, 14, 10, 0.7)',
    overlayStrong: 'rgba(10, 14, 10, 0.9)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});

export const Gradients = {
  cardGradient: ['rgba(93, 85, 76, 0.08)', 'rgba(78, 203, 155, 0.04)'],
  accentGradient: ['#556B2F', '#3D4D23'],
  goldGradient: ['#D4AF37', '#E8D4A0'],
  premiumGradient: ['rgba(212, 175, 55, 0.15)', 'rgba(78, 203, 155, 0.08)'],
};
