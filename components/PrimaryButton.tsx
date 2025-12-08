import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
}

export function PrimaryButton({ 
  title, 
  loading, 
  variant = 'primary',
  onPress,
  ...props 
}: PrimaryButtonProps) {
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      className={`py-4 px-6 rounded-xl items-center justify-center ${
        variant === 'primary' 
          ? 'bg-mint-400' 
          : 'bg-white/10 border border-white/15'
      }`}
      style={{
        shadowColor: variant === 'primary' ? '#7FFFD4' : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: variant === 'primary' ? 0.3 : 0.2,
        shadowRadius: 12,
        elevation: 4,
      }}
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0A1628' : '#7FFFD4'} />
      ) : (
        <Text 
          className={`text-base font-semibold ${
            variant === 'primary' ? 'text-navy-deep' : 'text-white'
          }`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
