

export const COLORS = {
  // Brand Colors
  brand: {
    primary: '#358a74',      
    secondary: '#10b981',    
    accent: '#f59e0b',       
    danger: '#ef4444',       
  },

  // Status Colors
  status: {
    available: '#10b981',    
    unavailable: '#ef4444',  
    pending: '#f59e0b',      
    overdue: '#dc2626',      
    returned: '#6b7280',     
    warning: '#f97316',      
    success: '#22c55e',      
    danger: '#ef4444',       
  },

  // Neutral Scale (0-900)
  neutral: {
    0: '#ffffff',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background Colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
    dark: '#111827',
  },

  // Text Colors
  text: {
    primary: '#111827',      
    secondary: '#6b7280',    
    tertiary: '#9ca3af',     
    light: '#d1d5db',        
    onBrand: '#ffffff',      
    onDanger: '#ffffff',     
    muted: '#9ca3af',        
  },

  // Border Colors
  border: {
    default: '#e5e7eb',
    light: '#f3f4f6',
    dark: '#d1d5db',
  },

  // Legacy aliases for older screens
  primary: '#358a74',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  red: '#ef4444',
  orange: '#f59e0b',
  white: '#ffffff',
  black: '#111827',
};

export const TYPOGRAPHY = {
  // Font Sizes
  sizes: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },

  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Legacy aliases for older screens
  fontSize: {
    xs: 11,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 48,
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
    '500': '500',
    '600': '600',
    '700': '700',
    '800': '800',
    '900': '900',
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  '5xl': 64,
};

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const SHADOWS = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 7,
  },
};

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export default {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  BREAKPOINTS,
};
