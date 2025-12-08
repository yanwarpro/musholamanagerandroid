import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Wallet, 
  Users, 
  Package, 
  Moon, 
  LogOut,
  TrendingUp,
  Activity,
  BookOpen
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, signOut } = useAuth();

  const handleNavigation = (screen: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigate(screen);
  };

  const handleSignOut = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await signOut();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out. Please try again.');
    }
  };

  const menuItems = [
    { 
      id: 'financial', 
      title: 'Financial', 
      icon: Wallet, 
      color: '#7FFFD4',
      description: 'Track income & expenses'
    },
    { 
      id: 'users', 
      title: 'Users', 
      icon: Users, 
      color: '#98FFE0',
      description: 'Manage roles & permissions',
      adminOnly: true
    },
    { 
      id: 'inventory', 
      title: 'Inventory', 
      icon: Package, 
      color: '#7FFFD4',
      description: 'Stock management'
    },
    { 
      id: 'kajian', 
      title: 'Kajian', 
      icon: BookOpen, 
      color: '#98FFE0',
      description: 'Jadwal kajian rutin'
    },
    { 
      id: 'ramadan', 
      title: 'Ramadan', 
      icon: Moon, 
      color: '#7FFFD4',
      description: 'Special programs'
    },
  ];

  const stats = [
    { label: 'Total Balance', value: 'Rp 15,250,000', icon: TrendingUp },
    { label: 'Active Users', value: '24', icon: Users },
    { label: 'Items in Stock', value: '156', icon: Activity },
  ];

  return (
    <GradientBackground>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white/70 text-sm">Welcome back,</Text>
              <Text className="text-white text-3xl font-bold mt-1">
                {user?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSignOut}
              className="bg-white/10 p-3 rounded-xl border border-white/15"
            >
              <LogOut size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text className="text-mint-400 text-sm capitalize">
            {user?.role} Account
          </Text>
        </View>

        {/* Stats Cards */}
        <View className="px-6 mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stats.map((stat, index) => (
              <GlassCard 
                key={index}
                className="p-5 mr-4 min-w-[160px]"
              >
                <stat.icon size={24} color="#7FFFD4" />
                <Text className="text-white/70 text-xs mt-3">
                  {stat.label}
                </Text>
                <Text className="text-white text-xl font-bold mt-1">
                  {stat.value}
                </Text>
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* Menu Grid */}
        <View className="px-6 pb-8">
          <Text className="text-white text-xl font-bold mb-4">
            Quick Access
          </Text>
          <View className="flex-row flex-wrap -mx-2">
            {menuItems
              .filter(item => !item.adminOnly || user?.role === 'admin')
              .map((item) => (
                <View key={item.id} className="w-1/2 px-2 mb-4">
                  <TouchableOpacity
                    onPress={() => handleNavigation(item.id)}
                    activeOpacity={0.8}
                  >
                    <GlassCard className="p-6">
                      <View 
                        className="w-12 h-12 rounded-xl items-center justify-center mb-4"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <item.icon size={24} color={item.color} />
                      </View>
                      <Text className="text-white text-lg font-bold mb-1">
                        {item.title}
                      </Text>
                      <Text className="text-white/60 text-xs">
                        {item.description}
                      </Text>
                    </GlassCard>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
}
