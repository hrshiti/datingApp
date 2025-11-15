// Centralized Theme Configuration
// This file contains all theme colors, spacing, and styling constants

export const theme = {
  colors: {
    // Primary Colors - Baby Pink Shades
    babyPink: '#FFE5E5',
    babyPinkLight: '#FFF0F0',
    babyPinkLighter: '#FFF5F5',
    
    // Accent Colors - Dark Pink/Red
    darkPink: '#FF1744',
    darkPinkHover: '#D32F2F',
    lightPinkBorder: '#FFB3BA',
    
    // Neutral Colors
    grey: '#757575',
    greyDark: '#616161',
    greyLight: '#E0E0E0',
    black: '#212121',
    white: '#FFFFFF',
    
    // Semantic Colors
    error: '#FF1744',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
  },
  
  borderRadius: {
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
  },
  
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
  },
  
  animations: {
    duration: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.5,
    },
    easing: {
      easeInOut: [0.4, 0, 0.2, 1],
      easeOut: [0, 0, 0.2, 1],
      easeIn: [0.4, 0, 1, 1],
    },
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
};

// Helper function to get theme color
export const getThemeColor = (colorPath) => {
  const keys = colorPath.split('.');
  let value = theme;
  for (const key of keys) {
    value = value[key];
    if (value === undefined) return null;
  }
  return value;
};

// Export individual color groups for convenience
export const colors = theme.colors;
export const borderRadius = theme.borderRadius;
export const spacing = theme.spacing;
export const animations = theme.animations;

