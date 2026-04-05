import React, { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';


export const useFadeInAnimation = (duration = 300, delay = 0) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return fadeAnim;
};


export const useSlideInAnimation = (
  direction = 'left',
  duration = 400,
  delay = 0,
  distance = 50
) => {
  const slideValue = useRef(new Animated.Value(distance)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideValue, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  const translateStyle = {};
  if (direction === 'left') {
    translateStyle.translateX = slideValue;
  } else if (direction === 'right') {
    translateStyle.translateX = Animated.multiply(slideValue, -1);
  } else if (direction === 'top') {
    translateStyle.translateY = slideValue;
  } else if (direction === 'bottom') {
    translateStyle.translateY = Animated.multiply(slideValue, -1);
  }

  return {
    transform: [translateStyle],
    opacity: opacityValue,
  };
};


export const useScaleAnimation = (
  duration = 400,
  delay = 0,
  startScale = 0.8
) => {
  const scaleValue = useRef(new Animated.Value(startScale)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleValue, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 1,
          duration,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
  };
};


export const useStaggerAnimation = (itemCount = 5, itemDelay = 50, duration = 300) => {
  const animations = useRef(
    Array.from({ length: itemCount }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const sequence = animations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration,
        delay: index * itemDelay,
        easing: Easing.ease,
        useNativeDriver: true,
      })
    );

    Animated.stagger(itemDelay, sequence).start();
  }, []);

  return animations.map((anim) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  }));
};


export const useBounceAnimation = (triggerValue = 0, intensity = 10) => {
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bounceValue, {
        toValue: intensity,
        duration: 100,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(bounceValue, {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [triggerValue]);

  return {
    transform: [{ scale: bounceValue.interpolate({
      inputRange: [0, intensity],
      outputRange: [1, 1.1],
    }) }],
  };
};


export const usePulseAnimation = (duration = 2000) => {
  const pulseValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 0,
          duration: duration / 2,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(pulse);
    };

    pulse();
  }, []);

  return {
    opacity: pulseValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.4, 1],
    }),
  };
};


export const useRotateAnimation = (duration = 2000) => {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotate = () => {
      rotateValue.setValue(0);
      Animated.timing(rotateValue, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(rotate);
    };

    rotate();
  }, []);

  return {
    transform: [
      {
        rotate: rotateValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };
};


export const useShimmerAnimation = (duration = 2000) => {
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = () => {
      shimmerValue.setValue(0);
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }).start(shimmer);
    };

    shimmer();
  }, []);

  return shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.3)'],
  });
};


export const useFlipAnimation = (triggerValue = false, duration = 400) => {
  const flipValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(flipValue, {
      toValue: triggerValue ? 1 : 0,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [triggerValue]);

  return {
    transform: [
      {
        rotateY: flipValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg'],
        }),
      },
    ],
  };
};


export const interpolateValue = (animValue, inputRange, outputRange) => {
  return animValue.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });
};


export const SPRING_CONFIG = {
  smooth: {
    damping: 10,
    mass: 1,
    stiffness: 100,
    overshootClamping: true,
  },
  bouncy: {
    damping: 7,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
  },
  gentle: {
    damping: 20,
    mass: 1,
    stiffness: 60,
    overshootClamping: true,
  },
  snappy: {
    damping: 12,
    mass: 1,
    stiffness: 200,
    overshootClamping: true,
  },
};


export const TIMING_CONFIG = {
  fast: {
    duration: 150,
    easing: Easing.out(Easing.cubic),
  },
  normal: {
    duration: 300,
    easing: Easing.inOut(Easing.ease),
  },
  slow: {
    duration: 500,
    easing: Easing.inOut(Easing.ease),
  },
  verySlow: {
    duration: 1000,
    easing: Easing.inOut(Easing.ease),
  },
};


export const SCREEN_TRANSITIONS = {
  slideFromRight: {
    headerShown: false,
    animationEnabled: true,
    animationTypeForReplace: false,
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.width, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.07],
              })
            : 0,
        },
      };
    },
  },

  slideFromLeft: {
    headerShown: false,
    animationEnabled: true,
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateX: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [-layouts.screen.width, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.07],
              })
            : 0,
        },
      };
    },
  },

  fadeTransition: {
    headerShown: false,
    animationEnabled: true,
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          opacity: current.progress,
        },
        overlayStyle: {
          opacity: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.07],
              })
            : 0,
        },
      };
    },
  },

  modalSlideUp: {
    headerShown: false,
    animationEnabled: true,
    cardStyleInterpolator: ({ current, next, layouts }) => {
      return {
        cardStyle: {
          transform: [
            {
              translateY: current.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [layouts.screen.height, 0],
              }),
            },
          ],
        },
        overlayStyle: {
          opacity: next
            ? next.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.07],
              })
            : 0,
        },
      };
    },
  },
};


export const usePressFeedback = () => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 0.95,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return {
    onPressIn,
    onPressOut,
    animatedStyle: {
      transform: [{ scale: pressAnim }],
    },
  };
};


export const useSwipeAnimation = (onSwipeLeft, onSwipeRight) => {
  const swipeValue = useRef(new Animated.Value(0)).current;

  const handleSwipe = (direction) => {
    Animated.spring(swipeValue, {
      toValue: direction === 'left' ? -1 : 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      if (direction === 'left' && onSwipeLeft) onSwipeLeft();
      if (direction === 'right' && onSwipeRight) onSwipeRight();
      swipeValue.setValue(0);
    });
  };

  return {
    swipeValue,
    handleSwipe,
    animatedStyle: {
      transform: [
        {
          translateX: swipeValue.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: [-100, 0, 100],
          }),
        },
      ],
      opacity: swipeValue.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [0, 1, 0],
      }),
    },
  };
};

export default {
  useFadeInAnimation,
  useSlideInAnimation,
  useScaleAnimation,
  useStaggerAnimation,
  useBounceAnimation,
  usePulseAnimation,
  useRotateAnimation,
  useShimmerAnimation,
  useFlipAnimation,
  usePressFeedback,
  useSwipeAnimation,
  SPRING_CONFIG,
  TIMING_CONFIG,
  SCREEN_TRANSITIONS,
};
