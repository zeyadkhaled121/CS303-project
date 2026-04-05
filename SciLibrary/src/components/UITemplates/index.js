import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../../../shared/designTokens';

// ============ LOADING SPINNER ============
export const LoadingSpinner = ({ 
  size = 'large', 
  color = COLORS.brand.primary,
  message = 'Loading...' 
}) => {
  return (
    <View style={spinnerStyles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={spinnerStyles.text}>{message}</Text>
      )}
    </View>
  );
};

const spinnerStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
  },
  text: {
    marginTop: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
});

// ============ LOADING SKELETON ============
export const LoadingSkeleton = ({ 
  width = '100%', 
  height = 100, 
  borderRadius = BORDER_RADIUS.md,
  marginBottom = SPACING.md,
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.neutral[200],
          marginBottom,
          opacity,
        },
      ]}
    />
  );
};

// ============ EMPTY STATE ============
export const EmptyState = ({ 
  icon = 'inbox-outline', 
  title = 'Empty',
  subtitle = 'No data available',
  actionLabel,
  onActionPress,
  iconSize = 64,
  iconColor = COLORS.neutral[400],
}) => {
  return (
    <View style={emptyStateStyles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={iconSize}
        color={iconColor}
        style={emptyStateStyles.icon}
      />

      <Text style={emptyStateStyles.title}>{title}</Text>

      {subtitle && (
        <Text style={emptyStateStyles.subtitle}>{subtitle}</Text>
      )}

      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={emptyStateStyles.button}
          onPress={onActionPress}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          <Text style={emptyStateStyles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const emptyStateStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING['2xl'],
    backgroundColor: COLORS.background.secondary,
  },
  icon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.brand.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});

// ============ ERROR STATE ============
export const ErrorState = ({ 
  title = 'Error', 
  message,
  actionLabel = 'Retry',
  onActionPress,
  icon = 'alert-circle',
}) => {
  return (
    <View style={errorStateStyles.container}>
      <MaterialCommunityIcons
        name={icon}
        size={80}
        color={COLORS.status.danger}
        style={errorStateStyles.icon}
      />

      <Text style={errorStateStyles.title}>{title}</Text>

      {message && (
        <Text style={errorStateStyles.message}>{message}</Text>
      )}

      {onActionPress && (
        <TouchableOpacity
          style={errorStateStyles.button}
          onPress={onActionPress}
        >
          <MaterialCommunityIcons name="reload" size={20} color="#fff" />
          <Text style={errorStateStyles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const errorStateStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background.secondary,
  },
  icon: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.status.danger,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.status.danger,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});

// ============ BADGE ============
export const Badge = ({ 
  label, 
  variant = 'neutral',
  icon,
  size = 'md',
}) => {
  const colorMap = {
    neutral: { bg: COLORS.neutral[100], text: COLORS.neutral[700] },
    success: { bg: '#d1fae5', text: COLORS.status.available },
    error: { bg: '#fee2e2', text: COLORS.status.unavailable },
    warning: { bg: '#fef3c7', text: '#d97706' },
    info: { bg: '#dbeafe', text: '#3b82f6' },
    pending: { bg: '#fef3c7', text: COLORS.status.pending },
  };

  const sizeMap = {
    sm: { paddingH: SPACING.sm, paddingV: SPACING.xs, fontSize: TYPOGRAPHY.sizes.xs },
    md: { paddingH: SPACING.md, paddingV: SPACING.sm, fontSize: TYPOGRAPHY.sizes.sm },
    lg: { paddingH: SPACING.lg, paddingV: SPACING.md, fontSize: TYPOGRAPHY.sizes.base },
  };

  const color = colorMap[variant] || colorMap.neutral;
  const sizeConfig = sizeMap[size] || sizeMap.md;

  return (
    <View
      style={[
        badgeStyles.container,
        {
          backgroundColor: color.bg,
          paddingHorizontal: sizeConfig.paddingH,
          paddingVertical: sizeConfig.paddingV,
        },
      ]}
    >
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={sizeConfig.fontSize + 2}
          color={color.text}
          style={badgeStyles.icon}
        />
      )}
      <Text style={[badgeStyles.label, { color: color.text, fontSize: sizeConfig.fontSize }]}>
        {label}
      </Text>
    </View>
  );
};

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
  },
  icon: {
    marginRight: SPACING.xs,
  },
  label: {
    fontWeight: '600',
  },
});

// ============ DIVIDER ============
export const Divider = ({ 
  margin = SPACING.md,
  color = COLORS.border.default,
}) => (
  <View
    style={[
      dividerStyles.divider,
      {
        marginVertical: margin,
        backgroundColor: color,
      },
    ]}
  />
);

const dividerStyles = StyleSheet.create({
  divider: {
    height: 1,
  },
});

// ============ SECTION HEADER ============
export const SectionHeader = ({ 
  title,
  action,
  onActionPress,
  icon,
}) => (
  <View style={sectionHeaderStyles.container}>
    <View style={sectionHeaderStyles.left}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={COLORS.brand.primary}
          style={sectionHeaderStyles.iconMargin}
        />
      )}
      <Text style={sectionHeaderStyles.title}>{title}</Text>
    </View>
    {action && (
      <TouchableOpacity onPress={onActionPress}>
        <Text style={sectionHeaderStyles.action}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconMargin: {
    marginRight: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  action: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.brand.primary,
    fontWeight: '600',
  },
});

// ============ CARD ============
export const Card = ({ 
  children,
  onPress,
  style,
  shadow = 'md',
}) => {
  const shadowStyle = SHADOWS[shadow] || SHADOWS.md;

  return (
    <TouchableOpacity
      style={[
        cardStyles.card,
        shadowStyle,
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {children}
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
});

// ============ BUTTON ============
export const Button = ({ 
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
}) => {
  const variantMap = {
    primary: {
      bg: COLORS.brand.primary,
      text: COLORS.text.onBrand,
    },
    secondary: {
      bg: COLORS.neutral[100],
      text: COLORS.brand.primary,
    },
    danger: {
      bg: COLORS.status.danger,
      text: COLORS.text.onDanger,
    },
  };

  const sizeMap = {
    sm: { padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.sm },
    md: { padding: SPACING.md, fontSize: TYPOGRAPHY.sizes.base },
    lg: { padding: SPACING.lg, fontSize: TYPOGRAPHY.sizes.md },
  };

  const variantStyle = variantMap[variant] || variantMap.primary;
  const sizeConfig = sizeMap[size] || sizeMap.md;

  return (
    <TouchableOpacity
      style={[
        buttonStyles.button,
        {
          backgroundColor: disabled ? COLORS.neutral[300] : variantStyle.bg,
          paddingVertical: sizeConfig.padding,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <View style={buttonStyles.content}>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={sizeConfig.fontSize + 4}
              color={variantStyle.text}
              style={buttonStyles.icon}
            />
          )}
          <Text
            style={[
              buttonStyles.text,
              {
                color: variantStyle.text,
                fontSize: sizeConfig.fontSize,
              },
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  icon: {},
  text: {
    fontWeight: '600',
  },
});

export default {
  LoadingSpinner,
  LoadingSkeleton,
  EmptyState,
  ErrorState,
  Badge,
  Divider,
  SectionHeader,
  Card,
  Button,
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
};
