import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0A1628', '#0D2B3E', '#0A1628']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
}
