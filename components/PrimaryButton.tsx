import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { colors, isDark } = useTheme();
  
  const handlePress = (e: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      className="py-4 px-6 rounded-xl items-center justify-center"
      style={{
        backgroundColor: variant === 'primary' ? colors.accent : colors.inputBg,
        borderWidth: variant === 'secondary' ? 1 : 0,
        borderColor: colors.inputBorder,
        shadowColor: variant === 'primary' ? colors.accent : '#000',
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
        <ActivityIndicator color={variant === 'primary' ? colors.bgPrimary : colors.accent} />
      ) : (
        <Text 
          style={{ color: variant === 'primary' ? colors.bgPrimary : colors.textPrimary }}
          className="text-base font-semibold"
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
