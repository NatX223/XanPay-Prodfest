import React from "react";
import { StyleSheet, Text, type TextProps } from "react-native";
import { WelcomeColors } from "@/constants/Colors";

export type WelcomeTextType = "headline" | "tagline" | "body";

export type WelcomeTextProps = TextProps & {
  type?: WelcomeTextType;
  color?: string;
};

export function WelcomeText({
  style,
  type = "body",
  color,
  ...rest
}: WelcomeTextProps) {
  const getTextColor = () => {
    if (color) return color;

    switch (type) {
      case "headline":
        return WelcomeColors.white;
      case "tagline":
        return WelcomeColors.whiteTransparent;
      case "body":
      default:
        return WelcomeColors.white;
    }
  };

  const textStyle = [
    { color: getTextColor() },
    type === "headline" ? styles.headline : undefined,
    type === "tagline" ? styles.tagline : undefined,
    type === "body" ? styles.body : undefined,
    style,
  ];

  return <Text style={textStyle} {...rest} />;
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 28,
    fontFamily: 'Clash',
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: WelcomeColors.whiteGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  tagline: {
    fontSize: 21,
    fontFamily: 'Clash',
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 22,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Clash',
    fontWeight: "400",
    textAlign: "center",
  },
});
