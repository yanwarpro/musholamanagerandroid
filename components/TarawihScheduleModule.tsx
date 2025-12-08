import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, User, Phone, Trash2, RefreshCw, Edit2, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTarawih } from '@/contexts/TarawihContext';
import { TarawihPerson } from '@/types';

interface TarawihScheduleModuleProps {
  onBack: () => void;
}

export function TarawihScheduleModule({ onBack }: TarawihScheduleModuleProps) {
  const {
    currentYear,
    setCurrentYear,
    getScheduleForYear,
    addImam,
    removeImam,
    addBilal,
    removeBilal,
    updateDailySchedule,
    generateSchedule,
    availableYears,
  } = useTarawih();

  const schedule = getScheduleForYear(currentYear);
  
  const [activeTab, setActiveTab] = useState<'schedule' | 'imam' | 'bilal'>('schedule');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditDayModal, setShowEditDayModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [addType, setAddType] = useState<'imam' | 'bilal'>('imam');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [selectedImamId, setSelectedImamId] = useState('');
  const [selectedBilalId, setSelectedBilalId] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // 0 = day 1-15, 1 = day 16-30

  const displayedDays = currentPage === 0 
    ? schedule.dailySchedules.slice(0, 15) 
    : schedule.dailySchedules.slice(15, 30);

  const handleAddPerson = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Mohon masukkan nama');
      return;
    }

    const newPerson: TarawihPerson = {
      id: `${addType}-${Date.now()}`,
      name: name.trim(),
      contact: contact.trim(),
      role: addType,
      isActive: true,
    };

    if (addType === 'imam') {
      addImam(currentYear, newPerson);
    } else {
      addBilal(currentYear, newPerson);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddModal(false);
    setName('');
    setContact('');
    Alert.alert('Sukses', `${addType === 'imam' ? 'Imam' : 'Bilal'} berhasil ditambahkan`);
  };

  const handleRemovePerson = (id: string, type: 'imam' | 'bilal') => {
    Alert.alert(
      'Hapus',
      `Apakah Anda yakin ingin menghapus ${type === 'imam' ? 'imam' : 'bilal'} ini?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            if (type === 'imam') {
              removeImam(currentYear, id);
            } else {
              removeBilal(currentYear, id);
            }
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  const handleGenerateSchedule = () => {
    if (schedule.imams.length === 0 || schedule.bilals.length === 0) {
      Alert.alert('Error', 'Mohon tambahkan imam dan bilal terlebih dahulu');
      return;
    }

    Alert.alert(
      'Generate Jadwal',
      'Ini akan membuat jadwal otomatis berdasarkan imam dan bilal yang tersedia. Jadwal yang ada akan ditimpa.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Generate',
          onPress: () => {
            generateSchedule(currentYear);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sukses', 'Jadwal berhasil di-generate');
          },
        },
      ]
    );
  };

  const openEditDayModal = (day: number) => {
    const daySchedule = schedule.dailySchedules.find(d => d.ramadanDay === day);
    setSelectedDay(day);
    setSelectedImamId(daySchedule?.imamId || '');
    setSelectedBilalId(daySchedule?.bilalId || '');
    setShowEditDayModal(true);
  };

  const handleUpdateDay = () => {
    if (selectedDay === null) return;
    updateDailySchedule(currentYear, selectedDay, selectedImamId, selectedBilalId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEditDayModal(false);
    setSelectedDay(null);
  };

  const openAddModal = (type: 'imam' | 'bilal') => {
    setAddType(type);
    setName('');
    setContact('');
    setShowAddModal(true);
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
              Jadwal Tarawih
            </Text>
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

          {/* Stats */}
          <View className="flex-row mb-4">
            <GlassCard className="flex-1 p-3 mr-2">
              <Text className="text-white/70 text-xs">Imam</Text>
              <Text className="text-[#7FFFD4] text-2xl font-bold">{schedule.imams.length}</Text>
            </GlassCard>
            <GlassCard className="flex-1 p-3 ml-2">
              <Text className="text-white/70 text-xs">Bilal</Text>
              <Text className="text-[#60A5FA] text-2xl font-bold">{schedule.bilals.length}</Text>
            </GlassCard>
          </View>

          {/* Tabs */}
          <View className="flex-row">
            {(['schedule', 'imam', 'bilal'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl mr-1 ${activeTab === tab ? 'bg-[#7FFFD4]/20' : 'bg-white/5'}`}
              >
                <Text className={`text-center text-sm font-semibold ${activeTab === tab ? 'text-[#7FFFD4]' : 'text-white/50'}`}>
                  {tab === 'schedule' ? 'Jadwal' : tab === 'imam' ? 'Imam' : 'Bilal'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {activeTab === 'schedule' && (
            <>
              {/* Generate Button */}
              <TouchableOpacity
                onPress={handleGenerateSchedule}
                className="flex-row items-center justify-center bg-[#7FFFD4]/20 py-3 rounded-xl mb-4"
              >
                <RefreshCw size={18} color="#7FFFD4" />
                <Text className="text-[#7FFFD4] font-semibold ml-2">Generate Jadwal Otomatis</Text>
              </TouchableOpacity>

              {/* Page Navigation */}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white font-bold text-lg">Jadwal Harian</Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => setCurrentPage(0)}
                    disabled={currentPage === 0}
                    className={`p-2 ${currentPage === 0 ? 'opacity-30' : ''}`}
                  >
                    <ChevronLeft size={20} color="#7FFFD4" />
                  </TouchableOpacity>
                  <Text className="text-white/70 text-sm mx-2">
                    Hari {currentPage === 0 ? '1-15' : '16-30'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className={`p-2 ${currentPage === 1 ? 'opacity-30' : ''}`}
                  >
                    <ChevronRight size={20} color="#7FFFD4" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Daily Schedule List */}
              {displayedDays.map((day) => (
                <GlassCard key={day.id} className="p-4 mb-3">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${day.imamId ? 'bg-[#7FFFD4]/20' : 'bg-white/10'}`}>
                        <Text className={`font-bold ${day.imamId ? 'text-[#7FFFD4]' : 'text-white/50'}`}>
                          {day.ramadanDay}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-white font-semibold">Hari ke-{day.ramadanDay}</Text>
                        <Text className="text-white/50 text-xs">
                          {day.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </Text>
                        <View className="flex-row mt-1">
                          <View className="flex-row items-center mr-4">
                            <View className="w-2 h-2 bg-[#7FFFD4] rounded-full mr-1" />
                            <Text className="text-white/70 text-xs">{day.imamName || '-'}</Text>
                          </View>
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-[#60A5FA] rounded-full mr-1" />
                            <Text className="text-white/70 text-xs">{day.bilalName || '-'}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => openEditDayModal(day.ramadanDay)}
                      className="p-2"
                    >
                      <Edit2 size={18} color="#7FFFD4" />
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              ))}
            </>
          )}

          {activeTab === 'imam' && (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white font-bold text-lg">Daftar Imam</Text>
                <TouchableOpacity
                  onPress={() => openAddModal('imam')}
                  className="flex-row items-center bg-[#7FFFD4]/20 px-3 py-2 rounded-full"
                >
                  <Plus size={16} color="#7FFFD4" />
                  <Text className="text-[#7FFFD4] text-sm ml-1">Tambah</Text>
                </TouchableOpacity>
              </View>

              {schedule.imams.length === 0 ? (
                <GlassCard className="p-6 items-center">
                  <User size={40} color="rgba(255,255,255,0.3)" />
                  <Text className="text-white/50 mt-2">Belum ada imam</Text>
                </GlassCard>
              ) : (
                schedule.imams.map((imam) => (
                  <GlassCard key={imam.id} className="p-4 mb-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-[#7FFFD4]/20 rounded-full items-center justify-center mr-3">
                          <User size={20} color="#7FFFD4" />
                        </View>
                        <View>
                          <Text className="text-white font-semibold">{imam.name}</Text>
                          <View className="flex-row items-center mt-1">
                            <Phone size={12} color="rgba(255,255,255,0.5)" />
                            <Text className="text-white/50 text-xs ml-1">{imam.contact || '-'}</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemovePerson(imam.id, 'imam')}
                        className="p-2"
                      >
                        <Trash2 size={18} color="#F87171" />
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                ))
              )}
            </>
          )}

          {activeTab === 'bilal' && (
            <>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white font-bold text-lg">Daftar Bilal</Text>
                <TouchableOpacity
                  onPress={() => openAddModal('bilal')}
                  className="flex-row items-center bg-[#60A5FA]/20 px-3 py-2 rounded-full"
                >
                  <Plus size={16} color="#60A5FA" />
                  <Text className="text-[#60A5FA] text-sm ml-1">Tambah</Text>
                </TouchableOpacity>
              </View>

              {schedule.bilals.length === 0 ? (
                <GlassCard className="p-6 items-center">
                  <User size={40} color="rgba(255,255,255,0.3)" />
                  <Text className="text-white/50 mt-2">Belum ada bilal</Text>
                </GlassCard>
              ) : (
                schedule.bilals.map((bilal) => (
                  <GlassCard key={bilal.id} className="p-4 mb-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-[#60A5FA]/20 rounded-full items-center justify-center mr-3">
                          <User size={20} color="#60A5FA" />
                        </View>
                        <View>
                          <Text className="text-white font-semibold">{bilal.name}</Text>
                          <View className="flex-row items-center mt-1">
                            <Phone size={12} color="rgba(255,255,255,0.5)" />
                            <Text className="text-white/50 text-xs ml-1">{bilal.contact || '-'}</Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemovePerson(bilal.id, 'bilal')}
                        className="p-2"
                      >
                        <Trash2 size={18} color="#F87171" />
                      </TouchableOpacity>
                    </View>
                  </GlassCard>
                ))
              )}
            </>
          )}

          <View className="h-24" />
        </ScrollView>

        {/* Add Person Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <GlassCard className="rounded-t-3xl p-6">
              <Text className="text-white text-xl font-bold mb-2">
                Tambah {addType === 'imam' ? 'Imam' : 'Bilal'}
              </Text>
              <Text className="text-white/60 text-sm mb-6">
                Masukkan data {addType === 'imam' ? 'imam' : 'bilal'} baru
              </Text>

              <View className="mb-4">
                <Text className="text-white/70 mb-2">Nama</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="Masukkan nama"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="mb-6">
                <Text className="text-white/70 mb-2">Kontak</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="Nomor telepon"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={contact}
                  onChangeText={setContact}
                  keyboardType="phone-pad"
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Batal"
                    variant="secondary"
                    onPress={() => setShowAddModal(false)}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title="Simpan"
                    onPress={handleAddPerson}
                  />
                </View>
              </View>
            </GlassCard>
          </View>
        </Modal>

        {/* Edit Day Modal */}
        <Modal
          visible={showEditDayModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEditDayModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <GlassCard className="rounded-t-3xl p-6">
              <Text className="text-white text-xl font-bold mb-2">
                Edit Jadwal Hari ke-{selectedDay}
              </Text>
              <Text className="text-white/60 text-sm mb-6">
                Pilih imam dan bilal untuk hari ini
              </Text>

              <View className="mb-4">
                <Text className="text-white/70 mb-2">Imam</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {schedule.imams.map((imam) => (
                      <TouchableOpacity
                        key={imam.id}
                        onPress={() => setSelectedImamId(imam.id)}
                        className={`px-4 py-2 rounded-full mr-2 ${selectedImamId === imam.id ? 'bg-[#7FFFD4]' : 'bg-white/10'}`}
                      >
                        <Text className={`${selectedImamId === imam.id ? 'text-[#0A1628]' : 'text-white'}`}>
                          {imam.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View className="mb-6">
                <Text className="text-white/70 mb-2">Bilal</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {schedule.bilals.map((bilal) => (
                      <TouchableOpacity
                        key={bilal.id}
                        onPress={() => setSelectedBilalId(bilal.id)}
                        className={`px-4 py-2 rounded-full mr-2 ${selectedBilalId === bilal.id ? 'bg-[#60A5FA]' : 'bg-white/10'}`}
                      >
                        <Text className={`${selectedBilalId === bilal.id ? 'text-[#0A1628]' : 'text-white'}`}>
                          {bilal.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Batal"
                    variant="secondary"
                    onPress={() => setShowEditDayModal(false)}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title="Simpan"
                    onPress={handleUpdateDay}
                  />
                </View>
              </View>
            </GlassCard>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}
