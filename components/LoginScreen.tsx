import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { UserRole } from '@/types';

export function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('jamaah');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Please enter your password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address');
      return;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Please enter a password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    // Password strength validation
    if (password.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters long');
      return;
    }

    if (name.trim().length < 2) {
      Alert.alert('Validation Error', 'Name must be at least 2 characters long');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), role);
      Alert.alert('Success', 'Account created successfully! You can now sign in.');
      // Clear form and switch to sign in
      setEmail('');
      setPassword('');
      setName('');
      setIsSignUp(false);
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientBackground>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerClassName="flex-1 justify-center px-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-12">
            <Text style={{ color: colors.textPrimary }} className="text-4xl font-bold mb-2">
              Mushola Manager
            </Text>
            <Text style={{ color: colors.accent }} className="text-lg">
              Management System
            </Text>
          </View>

          <GlassCard className="p-8">
            <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold mb-6 text-center">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>

            {isSignUp && (
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Full Name</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="Enter your name"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View className="mb-4">
              <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Email</Text>
              <TextInput
                style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                className="border rounded-xl px-4 py-3"
                placeholder="Enter your email"
                placeholderTextColor={colors.inputPlaceholder}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="mb-4">
              <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Password</Text>
              <TextInput
                style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                className="border rounded-xl px-4 py-3"
                placeholder="Enter your password"
                placeholderTextColor={colors.inputPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {isSignUp && (
              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Role</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setRole('jamaah')}
                    style={{ 
                      backgroundColor: role === 'jamaah' ? `${colors.accent}20` : colors.inputBg,
                      borderColor: role === 'jamaah' ? colors.accent : colors.inputBorder
                    }}
                    className="flex-1 py-3 rounded-xl border"
                  >
                    <Text style={{ color: role === 'jamaah' ? colors.accent : colors.textSecondary }} className="text-center font-semibold">
                      Jamaah
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('takmir')}
                    style={{ 
                      backgroundColor: role === 'takmir' ? `${colors.accent}20` : colors.inputBg,
                      borderColor: role === 'takmir' ? colors.accent : colors.inputBorder
                    }}
                    className="flex-1 py-3 rounded-xl border"
                  >
                    <Text style={{ color: role === 'takmir' ? colors.accent : colors.textSecondary }} className="text-center font-semibold">
                      Takmir
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('admin')}
                    style={{ 
                      backgroundColor: role === 'admin' ? `${colors.accent}20` : colors.inputBg,
                      borderColor: role === 'admin' ? colors.accent : colors.inputBorder
                    }}
                    className="flex-1 py-3 rounded-xl border"
                  >
                    <Text style={{ color: role === 'admin' ? colors.accent : colors.textSecondary }} className="text-center font-semibold">
                      Admin
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <PrimaryButton
              title={isSignUp ? 'Create Account' : 'Sign In'}
              onPress={isSignUp ? handleSignUp : handleLogin}
              loading={loading}
            />

            <TouchableOpacity 
              onPress={() => setIsSignUp(!isSignUp)}
              className="mt-4"
            >
              <Text style={{ color: colors.accent }} className="text-center">
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </GlassCard>

          <Text style={{ color: colors.textMuted }} className="text-center mt-8 text-sm">
            Secure authentication powered by Firebase
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
