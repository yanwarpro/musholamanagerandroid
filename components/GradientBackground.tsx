import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

export function GradientBackground({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  
  return (
    <View className="flex-1">
      <LinearGradient
        colors={[colors.bgGradientStart, colors.bgGradientMiddle, colors.bgGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
}
