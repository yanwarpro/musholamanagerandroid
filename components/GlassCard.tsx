import React from "react";
import { View, ViewProps } from "react-native";
import { BlurView } from "expo-blur";

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
  return (
    <View
      className="rounded-2xl overflow-hidden border border-white/15"
      style={[
        {
          shadowColor: "#7FFFD4",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 32,
          elevation: 8,
        },
        style,
      ]}
      {...props}
    >
      <BlurView intensity={intensity} tint="dark" className="bg-white/10">
        {children}
      </BlurView>
    </View>
  );
}
