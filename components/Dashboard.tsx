import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { transactionsService, usersService, inventoryService } from '@/services/firebaseService';
import { Transaction, User, InventoryItem } from '@/types';
import { 
  Wallet, 
  Users, 
  Package, 
  Moon, 
  LogOut,
  TrendingUp,
  Activity,
  BookOpen,
  Sun,
  MoonStar
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

interface DashboardProps {
  onNavigate: (screen: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);

  // Load transactions from Firebase
  useEffect(() => {
    const unsubscribe = transactionsService.subscribe((data) => {
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load users from Firebase
  useEffect(() => {
    const unsubscribe = usersService.subscribe((data) => {
      setAllUsers(data);
      setUsersLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Load inventory from Firebase
  useEffect(() => {
    const unsubscribe = inventoryService.subscribe((data) => {
      setInventoryItems(data);
      setInventoryLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Calculate total balance (total income - total expense)
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
      color: colors.accent,
      description: 'Track income & expenses'
    },
    { 
      id: 'users', 
      title: 'Users', 
      icon: Users, 
      color: colors.accentLight,
      description: 'Manage roles & permissions',
      adminOnly: true
    },
    { 
      id: 'inventory', 
      title: 'Inventory', 
      icon: Package, 
      color: colors.accent,
      description: 'Stock management'
    },
    { 
      id: 'kajian', 
      title: 'Kajian', 
      icon: BookOpen, 
      color: colors.accentLight,
      description: 'Jadwal kajian rutin'
    },
    { 
      id: 'ramadan', 
      title: 'Ramadan', 
      icon: Moon, 
      color: colors.accent,
      description: 'Special programs'
    },
  ];

  // Calculate total assets (sum of all inventory quantities)
  const totalAssets = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

  const stats = [
    { label: 'Total Balance', value: loading ? 'Loading...' : formatCurrency(totalBalance), icon: TrendingUp },
    { label: 'Active Users', value: usersLoading ? '...' : allUsers.length.toString(), icon: Users },
    { label: 'Assets', value: inventoryLoading ? '...' : totalAssets.toString(), icon: Activity },
  ];

  const handleToggleTheme = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleTheme();
  };

  return (
    <GradientBackground>
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text style={{ color: colors.textSecondary }} className="text-sm">Welcome back,</Text>
              <Text style={{ color: colors.textPrimary }} className="text-3xl font-bold mt-1">
                {user?.name}
              </Text>
            </View>
            <View className="flex-row">
              <TouchableOpacity
                onPress={handleToggleTheme}
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: colors.cardBorder }}
                className="p-3 rounded-xl border mr-2"
              >
                {isDark ? (
                  <Sun size={24} color={colors.accent} />
                ) : (
                  <MoonStar size={24} color={colors.accent} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignOut}
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: colors.cardBorder }}
                className="p-3 rounded-xl border"
              >
                <LogOut size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={{ color: colors.accent }} className="text-sm capitalize">
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
                <stat.icon size={24} color={colors.accent} />
                <Text style={{ color: colors.textSecondary }} className="text-xs mt-3">
                  {stat.label}
                </Text>
                <Text style={{ color: colors.textPrimary }} className="text-xl font-bold mt-1">
                  {stat.value}
                </Text>
              </GlassCard>
            ))}
          </ScrollView>
        </View>

        {/* Menu Grid */}
        <View className="px-6 pb-8">
          <Text style={{ color: colors.textPrimary }} className="text-xl font-bold mb-4">
            Quick Access
          </Text>
          <View className="flex-row flex-wrap -mx-2">
            {menuItems
              .filter(item => !item.adminOnly || user?.role === 'admin' || user?.role === 'takmir')
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
                      <Text style={{ color: colors.textPrimary }} className="text-lg font-bold mb-1">
                        {item.title}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-xs">
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
