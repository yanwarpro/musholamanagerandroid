import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Plus, User, Phone, Calendar, ChevronLeft, ChevronRight, RefreshCw, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { SnackProvider } from '@/types';
import { useSnackProvider } from '@/contexts/SnackProviderContext';
import { useAuth } from '@/contexts/AuthContext';

interface SnackProviderModuleProps {
  onBack: () => void;
}

export function SnackProviderModule({ onBack }: SnackProviderModuleProps) {
  const { 
    currentYear,
    setCurrentYear,
    getScheduleForYear,
    addProvider,
    removeProvider,
    assignProvider,
    removeAssignment,
    resetWeek,
    availableYears,
  } = useSnackProvider();
  
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'takmir';
  
  const schedule = getScheduleForYear(currentYear);
  
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [currentWeek, setCurrentWeek] = useState(1);
  const totalWeeks = 4; // 4 weeks in Ramadan

  const currentSchedule = schedule.weeklySchedules[currentWeek];

  const handleAddProvider = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Mohon masukkan nama');
      return;
    }

    if (!contact.trim()) {
      Alert.alert('Error', 'Mohon masukkan nomor kontak');
      return;
    }

    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(contact.trim())) {
      Alert.alert('Error', 'Nomor telepon tidak valid');
      return;
    }

    try {
      const newProvider: SnackProvider = {
        id: Date.now().toString(),
        name: name.trim(),
        contact: contact.trim(),
        notes: notes.trim()
      };

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      addProvider(currentYear, newProvider);
      setShowModal(false);
      setName('');
      setContact('');
      setNotes('');
      Alert.alert('Sukses', 'Penyedia snack berhasil ditambahkan!');
    } catch (error) {
      Alert.alert('Error', 'Gagal menambahkan. Silakan coba lagi.');
    }
  };

  const handleAssignProvider = (provider: SnackProvider) => {
    if (!selectedDay) return;

    assignProvider(currentYear, currentWeek, selectedDay, selectedSlot, provider);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAssignModal(false);
    setSelectedDay(null);
  };

  const handleRemoveAssignment = (day: string, slot: 1 | 2) => {
    removeAssignment(currentYear, currentWeek, day, slot);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveProvider = (providerId: string) => {
    Alert.alert(
      'Hapus Penyedia',
      'Apakah Anda yakin ingin menghapus penyedia ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            removeProvider(currentYear, providerId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handleResetWeek = () => {
    Alert.alert(
      'Reset Jadwal',
      `Apakah Anda yakin ingin mereset jadwal Minggu ${currentWeek}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetWeek(currentYear, currentWeek);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const openAssignModal = (day: string, slot: 1 | 2) => {
    setSelectedDay(day);
    setSelectedSlot(slot);
    setShowAssignModal(true);
  };

  const getAssignedCount = () => {
    let count = 0;
    currentSchedule.forEach((day) => {
      if (day.provider1) count++;
      if (day.provider2) count++;
    });
    return count;
  };

  return (
    <GradientBackground>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={onBack} className="mr-4">
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1">
              Penyedia Snack
            </Text>
            {canEdit && (
              <TouchableOpacity 
                onPress={handleResetWeek}
                className="bg-white/10 p-2 rounded-full"
              >
                <RefreshCw size={20} color="#7FFFD4" />
              </TouchableOpacity>
            )}
          </View>

          {/* Year Selector */}
          <GlassCard className="p-3 mb-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => {
                  const idx = availableYears.indexOf(currentYear);
                  if (idx > 0) setCurrentYear(availableYears[idx - 1]);
                }}
                disabled={availableYears.indexOf(currentYear) === 0}
                className={`p-2 ${availableYears.indexOf(currentYear) === 0 ? 'opacity-30' : ''}`}
              >
                <ChevronLeft size={24} color="#7FFFD4" />
              </TouchableOpacity>
              <View className="flex-row items-center">
                <Calendar size={20} color="#7FFFD4" />
                <Text className="text-white text-xl font-bold ml-2">
                  Ramadan {currentYear}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const idx = availableYears.indexOf(currentYear);
                  if (idx < availableYears.length - 1) setCurrentYear(availableYears[idx + 1]);
                }}
                disabled={availableYears.indexOf(currentYear) === availableYears.length - 1}
                className={`p-2 ${availableYears.indexOf(currentYear) === availableYears.length - 1 ? 'opacity-30' : ''}`}
              >
                <ChevronRight size={24} color="#7FFFD4" />
              </TouchableOpacity>
            </View>
          </GlassCard>

          {/* Week Navigation */}
          <GlassCard className="p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => setCurrentWeek(Math.max(1, currentWeek - 1))}
                disabled={currentWeek === 1}
                className={`p-2 rounded-full ${currentWeek === 1 ? 'opacity-30' : ''}`}
              >
                <ChevronLeft size={24} color="#7FFFD4" />
              </TouchableOpacity>
              
              <View className="items-center">
                <Text className="text-[#7FFFD4] text-lg font-bold">
                  Minggu {currentWeek}
                </Text>
                <Text className="text-white/60 text-sm">
                  {schedule.ramadanStartDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setCurrentWeek(Math.min(totalWeeks, currentWeek + 1))}
                disabled={currentWeek === totalWeeks}
                className={`p-2 rounded-full ${currentWeek === totalWeeks ? 'opacity-30' : ''}`}
              >
                <ChevronRight size={24} color="#7FFFD4" />
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-3">
              {[1, 2, 3, 4].map((week) => (
                <TouchableOpacity
                  key={week}
                  onPress={() => setCurrentWeek(week)}
                  className={`w-8 h-8 rounded-full mx-1 items-center justify-center ${
                    currentWeek === week ? 'bg-[#7FFFD4]' : 'bg-white/10'
                  }`}
                >
                  <Text className={currentWeek === week ? 'text-[#0A1628] font-bold' : 'text-white'}>
                    {week}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>

          {/* Stats */}
          <View className="flex-row">
            <GlassCard className="flex-1 p-3 mr-2">
              <Text className="text-white/70 text-xs">Terisi</Text>
              <Text className="text-[#7FFFD4] text-2xl font-bold">{getAssignedCount()}/14</Text>
            </GlassCard>
            <GlassCard className="flex-1 p-3 ml-2">
              <Text className="text-white/70 text-xs">Total Relawan</Text>
              <Text className="text-white text-2xl font-bold">{schedule.providers.length}</Text>
            </GlassCard>
          </View>
        </View>

        {/* Weekly Schedule */}
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          <Text className="text-white text-lg font-bold mb-3">
            Jadwal Minggu {currentWeek}
          </Text>
          
          {currentSchedule.map((day, index) => (
            <GlassCard key={day.day} className="p-4 mb-3">
              <View className="flex-row items-center mb-3">
                <View className="bg-[#7FFFD4]/20 px-3 py-1 rounded-full">
                  <Text className="text-[#7FFFD4] font-bold">{day.day}</Text>
                </View>
                <Text className="text-white/50 text-sm ml-2">2 orang/hari</Text>
              </View>

              {/* Provider Slot 1 */}
              <View className="mb-2">
                {day.provider1 ? (
                  <View className="flex-row items-center bg-white/5 p-3 rounded-xl">
                    <View className="w-10 h-10 rounded-full bg-[#7FFFD4]/20 items-center justify-center mr-3">
                      <User size={20} color="#7FFFD4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">{day.provider1.name}</Text>
                      <Text className="text-white/60 text-sm">{day.provider1.contact}</Text>
                    </View>
                    {canEdit && (
                      <TouchableOpacity
                        onPress={() => handleRemoveAssignment(day.day, 1)}
                        className="p-2"
                      >
                        <Trash2 size={18} color="#FF6B6B" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  canEdit ? (
                    <TouchableOpacity
                      onPress={() => openAssignModal(day.day, 1)}
                      className="flex-row items-center bg-white/5 p-3 rounded-xl border border-dashed border-white/20"
                    >
                      <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                        <Plus size={20} color="#7FFFD4" />
                      </View>
                      <Text className="text-white/50">Pilih penyedia 1</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row items-center bg-white/5 p-3 rounded-xl">
                      <Text className="text-white/50">Belum ada penyedia</Text>
                    </View>
                  )
                )}
              </View>

              {/* Provider Slot 2 */}
              <View>
                {day.provider2 ? (
                  <View className="flex-row items-center bg-white/5 p-3 rounded-xl">
                    <View className="w-10 h-10 rounded-full bg-[#7FFFD4]/20 items-center justify-center mr-3">
                      <User size={20} color="#7FFFD4" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">{day.provider2.name}</Text>
                      <Text className="text-white/60 text-sm">{day.provider2.contact}</Text>
                    </View>
                    {canEdit && (
                      <TouchableOpacity
                        onPress={() => handleRemoveAssignment(day.day, 2)}
                        className="p-2"
                      >
                        <Trash2 size={18} color="#FF6B6B" />
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  canEdit ? (
                    <TouchableOpacity
                      onPress={() => openAssignModal(day.day, 2)}
                      className="flex-row items-center bg-white/5 p-3 rounded-xl border border-dashed border-white/20"
                    >
                      <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center mr-3">
                        <Plus size={20} color="#7FFFD4" />
                      </View>
                      <Text className="text-white/50">Pilih penyedia 2</Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="flex-row items-center bg-white/5 p-3 rounded-xl">
                      <Text className="text-white/50">Belum ada penyedia</Text>
                    </View>
                  )
                )}
              </View>
            </GlassCard>
          ))}

          <View className="h-24" />
        </ScrollView>

        {/* FAB - Add New Provider - Only for admin/takmir */}
        {canEdit && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowModal(true);
            }}
            className="absolute bottom-8 right-6 bg-[#7FFFD4] w-16 h-16 rounded-full items-center justify-center"
            style={{
              shadowColor: '#7FFFD4',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
          >
            <Plus size={32} color="#0A1628" />
          </TouchableOpacity>
        )}

        {/* Add Provider Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 justify-end bg-[#0A1628]/40">
            <View className="bg-[#0D2B3E] rounded-t-3xl p-6 min-h-[450px] border-t border-mint-400/30">
              <Text className="text-white text-2xl font-bold mb-6">
                Tambah Penyedia Snack
              </Text>

              <View className="mb-4">
                <Text className="text-white/70 mb-2 text-sm">Nama</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="Nama penyedia"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="mb-4">
                <Text className="text-white/70 mb-2 text-sm">Nomor Kontak</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="Nomor telepon"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mb-6">
                <Text className="text-white/70 mb-2 text-sm">Catatan (Opsional)</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="Apa yang akan disediakan?"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Batal"
                    variant="secondary"
                    onPress={() => setShowModal(false)}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title="Tambah"
                    onPress={handleAddProvider}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Assign Provider Modal */}
        <Modal
          visible={showAssignModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAssignModal(false)}
        >
          <View className="flex-1 justify-end bg-[#0A1628]/40">
            <View className="bg-[#0D2B3E] rounded-t-3xl p-6 max-h-[70%] border-t border-mint-400/30">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-xl font-bold">
                  Pilih Penyedia
                </Text>
                <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                  <Text className="text-[#7FFFD4]">Tutup</Text>
                </TouchableOpacity>
              </View>
              
              <Text className="text-white/60 mb-4">
                {selectedDay} - Slot {selectedSlot}
              </Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                {schedule.providers.length === 0 ? (
                  <View className="items-center py-8">
                    <User size={40} color="rgba(255,255,255,0.3)" />
                    <Text className="text-white/50 mt-2">Belum ada penyedia</Text>
                    <Text className="text-white/40 text-sm mt-1">Tambahkan penyedia terlebih dahulu</Text>
                  </View>
                ) : (
                  schedule.providers.map((provider) => (
                    <TouchableOpacity
                      key={provider.id}
                      onPress={() => handleAssignProvider(provider)}
                      className="flex-row items-center bg-white/5 p-4 rounded-xl mb-3"
                    >
                        <View className="w-12 h-12 rounded-full bg-[#7FFFD4]/20 items-center justify-center mr-3">
                        <User size={24} color="#7FFFD4" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold">{provider.name}</Text>
                        <View className="flex-row items-center mt-1">
                          <Phone size={12} color="rgba(255,255,255,0.5)" />
                          <Text className="text-white/60 text-sm ml-1">{provider.contact}</Text>
                        </View>
                        {provider.notes && (
                          <Text className="text-white/40 text-xs mt-1">{provider.notes}</Text>
                        )}
                      </View>
                      {canEdit && (
                        <View className="ml-2">
                          <TouchableOpacity
                            onPress={() => handleRemoveProvider(provider.id)}
                            className="p-2"
                          >
                            <Trash2 size={18} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}

