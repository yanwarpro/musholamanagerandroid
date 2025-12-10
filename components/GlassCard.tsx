import React from "react";
import { View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "@/contexts/ThemeContext";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
}

export function GlassCard({
  children,
  intensity = 20,
  style,
  ...props
}: GlassCardProps) {
  const { colors, isDark } = useTheme();

  return (
    <View
      className="rounded-2xl overflow-hidden"
      style={[
        {
          borderWidth: 1,
          borderColor: colors.cardBorder,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isDark ? 0.0 : 0.0,
          shadowRadius: 32,
          elevation: 8,
        },
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint={colors.blurTint}
        style={{ backgroundColor: colors.cardBg }}
      >
        {children}
      </BlurView>
    </View>
  );
}
