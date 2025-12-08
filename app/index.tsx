import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SnackProviderProvider } from '@/contexts/SnackProviderContext';
import { TadarusProvider } from '@/contexts/TadarusContext';
import { TarawihProvider } from '@/contexts/TarawihContext';
import { LoginScreen } from '@/components/LoginScreen';
import { Dashboard } from '@/components/Dashboard';
import { FinancialModule } from '@/components/FinancialModule';
import { UserManagement } from '@/components/UserManagement';
import { InventoryModule } from '@/components/InventoryModule';
import { RamadanModule } from '@/components/RamadanModule';
import { KajianModule } from '@/components/KajianModule';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');

  if (loading) {
    return (
      <View className="flex-1 bg-navy-deep items-center justify-center">
        <ActivityIndicator size="large" color="#7FFFD4" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Navigation logic
  if (currentScreen === 'financial') {
    return <FinancialModule onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'users') {
    return <UserManagement onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'inventory') {
    return <InventoryModule onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'ramadan') {
    return <RamadanModule onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'kajian') {
    return <KajianModule onBack={() => setCurrentScreen('dashboard')} />;
  }

  return <Dashboard onNavigate={setCurrentScreen} />;
}

export default function HomeScreen() {
  return (
    <AuthProvider>
      <SnackProviderProvider>
        <TadarusProvider>
          <TarawihProvider>
            <AppContent />
          </TarawihProvider>
        </TadarusProvider>
      </SnackProviderProvider>
    </AuthProvider>
  );
}
