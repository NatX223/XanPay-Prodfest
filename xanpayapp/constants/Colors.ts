/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const OnboardingColors = {
  background: '#f6f2f7',
  text: '#0a0a0a',
  logoText: '#FFFFFF',
  headlineText: '#FFFFFF',
  accent: '#8A63D2',
  secondaryAccent: '#FF8C42',
  buttonText: '#FFFFFF',
};

export const WelcomeColors = {
  gradientStart: '#0F0F10',
  gradientEnd: '#1A1B1F',
  purpleWave: '#A855F7',
  greenBlob: '#10B981',
  white: '#FFFFFF',
  whiteGlow: 'rgba(255, 255, 255, 0.2)',
  whiteTransparent: 'rgba(255, 255, 255, 0.75)',
  glassBackground: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  glassHighlight: 'rgba(255, 255, 255, 0.3)',
  glassReflection: 'rgba(255, 255, 255, 0.02)',
  glassShadow: 'rgba(0, 0, 0, 0.5)',
  buttonBlack: '#000000',
  buttonGreen: '#10B981',
};
