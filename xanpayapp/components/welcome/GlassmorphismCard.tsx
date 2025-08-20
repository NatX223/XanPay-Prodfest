import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  interpolate,
} from 'react-native-reanimated';
import { WelcomeColors } from '@/constants/Colors';
import { WelcomeText } from './WelcomeText';

// Fallback blur component if expo-blur is not available
const FallbackBlur = ({ children, style }: { children: React.ReactNode; style: any }) => (
  <View style={style}>
    {children}
  </View>
);

// Try to import BlurView, fallback if not available
let BlurView: any;
try {
  BlurView = require('expo-blur').BlurView;
} catch {
  BlurView = FallbackBlur;
}

const { width } = Dimensions.get('window');

interface GlassmorphismCardProps {
  children?: React.ReactNode;
}

export function GlassmorphismCard({ children }: GlassmorphismCardProps) {
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardFloat = useSharedValue(0);
  const headlineOpacity = useSharedValue(0);
  const headlineTranslateY = useSharedValue(20);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Card animation
    cardOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    cardScale.value = withDelay(400, withTiming(1, { duration: 800 }));
    
    // Subtle floating animation
    cardFloat.value = withDelay(1600, 
      withRepeat(
        withTiming(1, { duration: 4000 }),
        -1,
        true
      )
    );
    
    // Headline animation
    headlineOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    headlineTranslateY.value = withDelay(800, withTiming(0, { duration: 600 }));
    
    // Tagline animation
    taglineOpacity.value = withDelay(1200, withTiming(1, { duration: 400 }));
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const floatY = interpolate(cardFloat.value, [0, 1], [0, -8]);
    return {
      opacity: cardOpacity.value,
      transform: [
        { scale: cardScale.value },
        { translateY: floatY }
      ],
    };
  });

  const headlineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineTranslateY.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
      {/* Outer glow effect */}
      <View style={styles.outerGlow} />
      
      {/* Main glassmorphism container */}
      <BlurView 
        intensity={25} 
        style={styles.blurContainer}
        {...(BlurView === FallbackBlur ? {} : { intensity: 25 })}
      >
        {/* Inner glass layer */}
        <View style={styles.innerGlass}>
          {/* Content container with additional blur */}
          <View style={styles.contentContainer}>
            {/* Top highlight border */}
            <View style={styles.topHighlight} />
            
            <Animated.View style={headlineAnimatedStyle}>
              <WelcomeText type="headline">
                INVEST • TRADE • SECURE
              </WelcomeText>
            </Animated.View>
            
            <Animated.View style={[styles.taglineContainer, taglineAnimatedStyle]}>
              <WelcomeText type="tagline">
                Cross-chain merchant payments powered by USDC
              </WelcomeText>
            </Animated.View>
            
            {children}
          </View>
        </View>
      </BlurView>
      
      {/* Bottom reflection */}
      <View style={styles.bottomReflection} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: width * 0.8,
    height: 200,
    alignSelf: 'center',
    position: 'relative',
  },
  outerGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    shadowColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 5,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  innerGlass: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 20,
    // Additional glass effect
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    borderLeftColor: 'rgba(255, 255, 255, 0.25)',
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomReflection: {
    position: 'absolute',
    bottom: -10,
    left: 20,
    right: 20,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    transform: [{ scaleY: 0.3 }],
    opacity: 0.6,
  },
  taglineContainer: {
    marginTop: 16,
  },
});