import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { WelcomeText } from './WelcomeText';

export function WelcomeContent() {
  const headlineOpacity = useSharedValue(0);
  const headlineTranslateY = useSharedValue(20);
  const headlineScale = useSharedValue(0.9);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(15);
  const glowAnimation = useSharedValue(0);
  const decorativeOpacity = useSharedValue(0);

  useEffect(() => {
    // Headline animation with scale
    headlineOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    headlineTranslateY.value = withDelay(800, withTiming(0, { duration: 600 }));
    headlineScale.value = withDelay(800, withTiming(1, { duration: 600 }));
    
    // Tagline animation with slide up
    taglineOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));
    taglineTranslateY.value = withDelay(1200, withTiming(0, { duration: 400 }));
    
    // Glow effect animation
    glowAnimation.value = withDelay(1600, 
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000 }),
          withTiming(0, { duration: 2000 })
        ),
        -1,
        false
      )
    );

    // Decorative elements
    decorativeOpacity.value = withDelay(1400, withTiming(1, { duration: 800 }));
  }, []);

  const headlineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [
      { translateY: headlineTranslateY.value },
      { scale: headlineScale.value }
    ],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(glowAnimation.value, [0, 1], [0.3, 0.8]);
    return {
      opacity: glowOpacity,
    };
  });

  const decorativeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: decorativeOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Decorative elements */}
      <Animated.View style={[styles.decorativeLine1, decorativeAnimatedStyle]} />
      <Animated.View style={[styles.decorativeLine2, decorativeAnimatedStyle]} />
      
      {/* Glow effect behind headline */}
      <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
      
      <Animated.View style={headlineAnimatedStyle}>
        <WelcomeText type="headline">
          Accept USDC payments
        </WelcomeText>
      </Animated.View>
      
      <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
        <WelcomeText type="tagline">
          anywhere, anytime, any-chain
        </WelcomeText>
      </Animated.View>

      {/* Additional decorative dots */}
      <Animated.View style={[styles.decorativeDots, decorativeAnimatedStyle]}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  taglineContainer: {
    marginTop: 24,
  },
  decorativeLine1: {
    position: 'absolute',
    top: -40,
    left: 20,
    width: 60,
    height: 2,
    backgroundColor: '#A855F7',
    borderRadius: 1,
  },
  decorativeLine2: {
    position: 'absolute',
    top: -30,
    right: 30,
    width: 40,
    height: 2,
    backgroundColor: '#10B981',
    borderRadius: 1,
  },
  glowEffect: {
    position: 'absolute',
    top: -20,
    left: -50,
    right: -50,
    height: 100,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    borderRadius: 50,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
  },
  decorativeDots: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});