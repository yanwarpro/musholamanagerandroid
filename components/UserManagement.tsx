import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Search, Shield, User as UserIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { User } from '@/types';
import { usersService } from '@/services/firebaseService';
import { useTheme } from '@/contexts/ThemeContext';

interface UserManagementProps {
  onBack: () => void;
}

export function UserManagement({ onBack }: UserManagementProps) {
  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load users from Firebase
  useEffect(() => {
    const unsubscribe = usersService.subscribe((data) => {
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRoleToggle = async (user: User) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const newRole = user.role === 'admin' ? 'takmir' : 'admin';
      
      // Update in Firebase
      await usersService.update(user.id, { role: newRole });
      setSelectedUser(null);
      Alert.alert('Success', `User role changed to ${newRole}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update user role. Please try again.');
      console.error('Error updating user role:', error);
    }
  };

  return (
    <GradientBackground>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={onBack} className="mr-4">
              <ArrowLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold flex-1">
              User Management
            </Text>
          </View>

          {/* Search Bar */}
          <View style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder }} className="border rounded-xl px-4 py-3 flex-row items-center">
            <Search size={20} color={colors.textMuted} />
            <TextInput
              style={{ color: colors.textPrimary }}
              className="flex-1 ml-3"
              placeholder="Search users..."
              placeholderTextColor={colors.inputPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Users List */}
        <ScrollView className="flex-1 px-6">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-bold mb-4">
            All Users ({filteredUsers.length})
          </Text>
          {filteredUsers.map((user) => (
            <TouchableOpacity
              key={user.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedUser(user);
              }}
              activeOpacity={0.8}
            >
              <GlassCard className="p-4 mb-3">
                <View className="flex-row items-center">
                  <View 
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ 
                      backgroundColor: user.role === 'admin' ? `${colors.accent}20` : `${colors.accentLight}20` 
                    }}
                  >
                    {user.role === 'admin' ? (
                      <Shield size={24} color={colors.accent} />
                    ) : (
                      <UserIcon size={24} color={colors.accentLight} />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.textPrimary }} className="font-semibold text-base mb-1">
                      {user.name}
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-sm mb-1">
                      {user.email}
                    </Text>
                    <View className="flex-row items-center">
                      <View 
                        style={{ backgroundColor: user.role === 'admin' ? `${colors.accent}20` : colors.inputBg }}
                        className="px-3 py-1 rounded-full"
                      >
                        <Text 
                          style={{ color: user.role === 'admin' ? colors.accent : colors.textSecondary }}
                          className="text-xs font-semibold"
                        >
                          {user.role.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* User Detail Modal */}
        <Modal
          visible={selectedUser !== null}
          animationType="fade"
          transparent
          onRequestClose={() => setSelectedUser(null)}
        >
          <View style={{ backgroundColor: colors.overlay }} className="flex-1 justify-center items-center px-6">
            <View style={{ backgroundColor: colors.bgSecondary, borderColor: `${colors.accent}30` }} className="w-full rounded-2xl p-6 border">
              <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold mb-6">
                User Details
              </Text>

              <View className="mb-6">
                <View 
                  className="w-20 h-20 rounded-full items-center justify-center mb-4 self-center"
                  style={{ 
                    backgroundColor: selectedUser?.role === 'admin' ? `${colors.accent}20` : `${colors.accentLight}20` 
                  }}
                >
                  {selectedUser?.role === 'admin' ? (
                    <Shield size={40} color={colors.accent} />
                  ) : (
                    <UserIcon size={40} color={colors.accentLight} />
                  )}
                </View>
                <Text style={{ color: colors.textPrimary }} className="text-xl font-bold text-center mb-2">
                  {selectedUser?.name}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-center mb-4">
                  {selectedUser?.email}
                </Text>
              </View>

              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-3">Current Role</Text>
                <View 
                  style={{ 
                    backgroundColor: selectedUser?.role === 'admin' ? `${colors.accent}20` : colors.inputBg,
                    borderColor: colors.inputBorder
                  }}
                  className="p-4 rounded-xl border"
                >
                  <Text 
                    style={{ color: selectedUser?.role === 'admin' ? colors.accent : colors.textPrimary }}
                    className="text-center font-bold"
                  >
                    {selectedUser?.role.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">Member Since</Text>
                <Text style={{ color: colors.textPrimary }}>
                  {selectedUser?.createdAt.toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>

              <View className="flex-row mt-6">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setSelectedUser(null)}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title={`Make ${selectedUser?.role === 'admin' ? 'Takmir' : 'Admin'}`}
                    onPress={() => selectedUser && handleRoleToggle(selectedUser)}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}
