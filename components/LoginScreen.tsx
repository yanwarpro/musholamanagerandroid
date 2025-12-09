import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

export function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('jamaah');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

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
            <Text className="text-4xl font-bold text-white mb-2">
              Mushola Manager
            </Text>
            <Text className="text-mint-400 text-lg">
              Management System
            </Text>
          </View>

          <GlassCard className="p-8">
            <Text className="text-2xl font-bold text-white mb-6 text-center">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>

            {isSignUp && (
              <View className="mb-4">
                <Text className="text-white/70 mb-2 text-sm">Full Name</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View className="mb-4">
              <Text className="text-white/70 mb-2 text-sm">Email</Text>
              <TextInput
                className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                placeholder="Enter your email"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="mb-4">
              <Text className="text-white/70 mb-2 text-sm">Password</Text>
              <TextInput
                className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                placeholder="Enter your password"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {isSignUp && (
              <View className="mb-6">
                <Text className="text-white/70 mb-2 text-sm">Role</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setRole('jamaah')}
                    className={`flex-1 py-3 rounded-xl border ${
                      role === 'jamaah' 
                        ? 'bg-mint-400/20 border-mint-400' 
                        : 'bg-white/10 border-white/15'
                    }`}
                  >
                    <Text className={`text-center font-semibold ${
                      role === 'jamaah' ? 'text-mint-400' : 'text-white/70'
                    }`}>
                      Jamaah
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('takmir')}
                    className={`flex-1 py-3 rounded-xl border ${
                      role === 'takmir' 
                        ? 'bg-mint-400/20 border-mint-400' 
                        : 'bg-white/10 border-white/15'
                    }`}
                  >
                    <Text className={`text-center font-semibold ${
                      role === 'takmir' ? 'text-mint-400' : 'text-white/70'
                    }`}>
                      Takmir
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setRole('admin')}
                    className={`flex-1 py-3 rounded-xl border ${
                      role === 'admin' 
                        ? 'bg-mint-400/20 border-mint-400' 
                        : 'bg-white/10 border-white/15'
                    }`}
                  >
                    <Text className={`text-center font-semibold ${
                      role === 'admin' ? 'text-mint-400' : 'text-white/70'
                    }`}>
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
              <Text className="text-mint-400 text-center">
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </GlassCard>

          <Text className="text-white/50 text-center mt-8 text-sm">
            Secure authentication powered by Firebase
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </GradientBackground>
  );
}
