import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { ArrowLeft, BookOpen, Coffee, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { TadarusScheduleModule } from './TadarusScheduleModule';
import { SnackProviderModule } from './SnackProviderModule';
import { TarawihScheduleModule } from './TarawihScheduleModule';

interface RamadanModuleProps {
  onBack: () => void;
}

export function RamadanModule({ onBack }: RamadanModuleProps) {
  const [activeSubModule, setActiveSubModule] = useState<string | null>(null);

  if (activeSubModule === 'tadarus') {
    return <TadarusScheduleModule onBack={() => setActiveSubModule(null)} />;
  }

  if (activeSubModule === 'snack') {
    return <SnackProviderModule onBack={() => setActiveSubModule(null)} />;
  }

  if (activeSubModule === 'tarawih') {
    return <TarawihScheduleModule onBack={() => setActiveSubModule(null)} />;
  }

  const subModules = [
    {
      id: 'tadarus',
      title: 'Tadarus Schedule',
      description: 'Quran reading assignments',
      icon: BookOpen,
      color: '#7FFFD4'
    },
    {
      id: 'snack',
      title: 'Snack Providers',
      description: 'Iftar snack volunteers',
      icon: Coffee,
      color: '#98FFE0'
    },
    {
      id: 'tarawih',
      title: 'Tarawih Schedule',
      description: 'Prayer time management',
      icon: Clock,
      color: '#7FFFD4'
    }
  ];

  return (
    <GradientBackground>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={onBack} className="mr-4">
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1">
              Ramadan Programs
            </Text>
          </View>

          <GlassCard className="p-6">
            <Text className="text-white text-lg font-bold mb-2">
              Special Ramadan Features
            </Text>
            <Text className="text-white/70 text-sm">
              Manage tadarus schedules, snack providers, and tarawih prayers
            </Text>
          </GlassCard>
        </View>

        {/* Sub-modules */}
        <ScrollView className="flex-1 px-6">
          {subModules.map((module) => (
            <TouchableOpacity
              key={module.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveSubModule(module.id);
              }}
              activeOpacity={0.8}
              className="mb-4"
            >
              <GlassCard className="p-6">
                <View className="flex-row items-center">
                  <View 
                    className="w-14 h-14 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${module.color}20` }}
                  >
                    <module.icon size={28} color={module.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold mb-1">
                      {module.title}
                    </Text>
                    <Text className="text-white/60 text-sm">
                      {module.description}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </GradientBackground>
  );
}
