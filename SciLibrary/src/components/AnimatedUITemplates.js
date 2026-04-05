import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '../../shared/designTokens';
import {
  usePressFeedback,
  useRotateAnimation,
  useFadeInAnimation,
  useShimmerAnimation,
} from '../utils/animations';


// ============ ANIMATED LOADING SPINNER ============
export const AnimatedLoadingSpinner = ({
  size = 'large',
  color = COLORS.brand.primary,
  message = 'Loading...',
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const fadeIn = useFadeInAnimation(500, 0);

  return (
    <Animated.View style={[spinnerStyles.container, { opacity: fadeIn }]}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <ActivityIndicator size={size} color={color} />
      </Animated.View>
      {message && (
        <Text style={spinnerStyles.text}>{message}</Text>
      )}
    </Animated.View>
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
    fontSize: TYPOGRAPHY.fontSize?.base || 16,
    color: COLORS.text.secondary,
  },
});

// ============ ANIMATED LOADING SKELETON ============
export const AnimatedLoadingSkeleton = ({
  width = '100%',
  height = 100,
  borderRadius = BORDER_RADIUS.md,
  marginBottom = SPACING.md,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.65, 0.3],
  });

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: COLORS.neutral[200],
          marginBottom,
          overflow: 'hidden',
        },
      ]}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            opacity,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
};

// ============ ANIMATED BUTTON ============
export const AnimatedButton = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
}) => {
  const { onPressIn, onPressOut, animatedStyle } = usePressFeedback();

  const variantMap = {
    primary: {
      bg: COLORS.brand.primary,
      text: COLORS.neutral[0],
    },
    secondary: {
      bg: COLORS.neutral[100],
      text: COLORS.brand.primary,
    },
    danger: {
      bg: COLORS.status.unavailable,
      text: COLORS.neutral[0],
    },
  };

  const sizeMap = {
    sm: { padding: SPACING.md, fontSize: TYPOGRAPHY.fontSize?.sm || 12 },
    md: { padding: SPACING.md, fontSize: TYPOGRAPHY.fontSize?.base || 16 },
    lg: { padding: SPACING.lg, fontSize: TYPOGRAPHY.fontSize?.lg || 18 },
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
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <Animated.View style={[buttonStyles.content, animatedStyle]}>
        {loading ? (
          <ActivityIndicator color={variantStyle.text} size="small" />
        ) : (
          <>
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
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});

// ============ ANIMATED BADGE ============
export const AnimatedBadge = ({
  label,
  variant = 'neutral',
  icon,
  size = 'md',
}) => {
  const fadeInAnim = useFadeInAnimation(300, 0);

  const colorMap = {
    neutral: { bg: COLORS.neutral[100], text: COLORS.neutral[700] },
    success: { bg: '#d1fae5', text: COLORS.status.available },
    error: { bg: '#fee2e2', text: COLORS.status.unavailable },
    warning: { bg: '#fef3c7', text: '#d97706' },
    info: { bg: '#dbeafe', text: '#3b82f6' },
    pending: { bg: '#fef3c7', text: COLORS.status.pending },
  };

  const sizeMap = {
    sm: { paddingH: SPACING.sm, paddingV: SPACING.xs, fontSize: TYPOGRAPHY.fontSize?.xs || 12 },
    md: { paddingH: SPACING.md, paddingV: SPACING.sm, fontSize: TYPOGRAPHY.fontSize?.sm || 14 },
    lg: { paddingH: SPACING.lg, paddingV: SPACING.md, fontSize: TYPOGRAPHY.fontSize?.base || 16 },
  };

  const color = colorMap[variant] || colorMap.neutral;
  const sizeConfig = sizeMap[size] || sizeMap.md;

  return (
    <Animated.View
      style={[
        badgeStyles.container,
        {
          backgroundColor: color.bg,
          paddingHorizontal: sizeConfig.paddingH,
          paddingVertical: sizeConfig.paddingV,
          opacity: fadeInAnim,
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
    </Animated.View>
  );
};

const badgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.full,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: '600',
  },
});

// ============ ANIMATED CARD ============
export const AnimatedCard = ({
  children,
  style,
  onPress,
  shadow = 'md',
}) => {
  const fadeInAnim = useFadeInAnimation(400, 0);
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        cardStyles.card,
        {
          opacity: fadeInAnim,
          transform: [{ scale: scaleAnim }],
        },
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        style={cardStyles.touchable}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
});

// ============ ANIMATED FADE IN TEXT ============
export const AnimatedFadeInText = ({
  text,
  style,
  duration = 400,
  delay = 0,
}) => {
  const fadeInAnim = useFadeInAnimation(duration, delay);

  return (
    <Animated.Text style={[style, { opacity: fadeInAnim }]}>
      {text}
    </Animated.Text>
  );
};

// ============ ANIMATED LIST ITEM ============
export const AnimatedListItem = ({
  children,
  index = 0,
  itemDelay = 50,
}) => {
  const listItemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(listItemAnim, {
      toValue: 1,
      duration: 300,
      delay: index * itemDelay,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = listItemAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <Animated.View
      style={{
        opacity: listItemAnim,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
};

export default {
  AnimatedLoadingSpinner,
  AnimatedLoadingSkeleton,
  AnimatedButton,
  AnimatedBadge,
  AnimatedCard,
  AnimatedFadeInText,
  AnimatedListItem,
};
