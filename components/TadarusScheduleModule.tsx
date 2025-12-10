import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Dimensions } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Plus, BookOpen, Users, TrendingUp, Award, ChevronLeft, ChevronRight, Edit2, Calendar } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTadarus } from '@/contexts/TadarusContext';
import { useAuth } from '@/contexts/AuthContext';

interface TadarusScheduleModuleProps {
  onBack: () => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

export function TadarusScheduleModule({ onBack }: TadarusScheduleModuleProps) {
  const { currentYear, setCurrentYear, availableYears, getScheduleForYear, addDailyEntry, updateDailyEntry, getDailyEntry, getChartData } = useTadarus();
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'takmir';
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showYearFilter, setShowYearFilter] = useState(false);
  
  const schedule = getScheduleForYear(selectedYear);
  const progress = schedule?.progress || {
    totalMaleJuz: 0,
    totalFemaleJuz: 0,
    totalJuz: 0,
    maleKhatamCount: 0,
    femaleKhatamCount: 0,
    totalKhatamCount: 0,
    completionPercentage: 0,
    daysCompleted: 0,
    daysRemaining: 30,
  };
  
  // Generate years from 2024 to 2030
  const yearOptions = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [maleJuz, setMaleJuz] = useState('');
  const [femaleJuz, setFemaleJuz] = useState('');
  const [currentPage, setCurrentPage] = useState(0); // 0 = day 1-15, 1 = day 16-30

  const chartData = getChartData(selectedYear);
  const maxJuz = Math.max(...chartData.map(d => d.total), 1);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setCurrentYear(year);
    setShowYearFilter(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddEntry = () => {
    const male = parseFloat(maleJuz) || 0;
    const female = parseFloat(femaleJuz) || 0;

    if (male === 0 && female === 0) {
      Alert.alert('Error', 'Mohon masukkan jumlah juz yang dibaca');
      return;
    }

    addDailyEntry(selectedYear, selectedDay, male, female, user?.name || 'Admin');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowAddModal(false);
    setMaleJuz('');
    setFemaleJuz('');
    Alert.alert('Sukses', `Data tadarus hari ke-${selectedDay} berhasil ditambahkan`);
  };

  const handleEditEntry = () => {
    const male = parseFloat(maleJuz) || 0;
    const female = parseFloat(femaleJuz) || 0;

    updateDailyEntry(selectedYear, selectedDay, male, female);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEditModal(false);
    setMaleJuz('');
    setFemaleJuz('');
    Alert.alert('Sukses', `Data tadarus hari ke-${selectedDay} berhasil diperbarui`);
  };

  const openAddModal = (day: number) => {
    setSelectedDay(day);
    setMaleJuz('');
    setFemaleJuz('');
    setShowAddModal(true);
  };

  const openEditModal = (day: number) => {
    const entry = getDailyEntry(selectedYear, day);
    setSelectedDay(day);
    setMaleJuz(entry?.maleJuzRead.toString() || '0');
    setFemaleJuz(entry?.femaleJuzRead.toString() || '0');
    setShowEditModal(true);
  };

  const displayedDays = currentPage === 0 
    ? chartData.slice(0, 15) 
    : chartData.slice(15, 30);

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
              Tadarus Ramadan
            </Text>
            <TouchableOpacity 
              onPress={() => setShowYearFilter(true)}
              className="flex-row items-center bg-white/10 px-3 py-2 rounded-xl"
            >
              <Calendar size={18} color="#7FFFD4" />
              <Text className="text-[#7FFFD4] font-semibold ml-2">{selectedYear}</Text>
            </TouchableOpacity>
          </View>

          {/* Khatam Counter - Per Jamaah */}
          <View className="flex-row mb-4">
            <GlassCard className="flex-1 p-4 mr-2">
              <View className="flex-row items-center mb-2">
                <Award size={24} color="#60A5FA" />
                <Text className="text-white/70 text-sm ml-2">Khatam Laki-laki</Text>
              </View>
              <Text className="text-[#60A5FA] text-3xl font-bold">
                {progress.maleKhatamCount}x
              </Text>
              <View className="mt-2 bg-white/10 h-1.5 rounded-full overflow-hidden">
                <View 
                  className="bg-[#60A5FA] h-full rounded-full"
                  style={{ width: `${((progress.totalMaleJuz % 30) / 30) * 100}%` }}
                />
              </View>
              <Text className="text-white/50 text-xs mt-1">
                {progress.totalMaleJuz % 30}/30 juz
              </Text>
            </GlassCard>
            <GlassCard className="flex-1 p-4 ml-2">
              <View className="flex-row items-center mb-2">
                <Award size={24} color="#F472B6" />
                <Text className="text-white/70 text-sm ml-2">Khatam Wanita</Text>
              </View>
              <Text className="text-[#F472B6] text-3xl font-bold">
                {progress.femaleKhatamCount}x
              </Text>
              <View className="mt-2 bg-white/10 h-1.5 rounded-full overflow-hidden">
                <View 
                  className="bg-[#F472B6] h-full rounded-full"
                  style={{ width: `${((progress.totalFemaleJuz % 30) / 30) * 100}%` }}
                />
              </View>
              <Text className="text-white/50 text-xs mt-1">
                {progress.totalFemaleJuz % 30}/30 juz
              </Text>
            </GlassCard>
          </View>

          {/* Stats Row */}
          <View className="flex-row">
            <GlassCard className="flex-1 p-3 mr-2">
              <View className="flex-row items-center">
                <Users size={20} color="#60A5FA" />
                <Text className="text-white/70 text-xs ml-2">Total Laki-laki</Text>
              </View>
              <Text className="text-[#60A5FA] text-2xl font-bold mt-1">
                {progress.totalMaleJuz} <Text className="text-sm font-normal">juz</Text>
              </Text>
            </GlassCard>
            <GlassCard className="flex-1 p-3 ml-2">
              <View className="flex-row items-center">
                <Users size={20} color="#F472B6" />
                <Text className="text-white/70 text-xs ml-2">Total Wanita</Text>
              </View>
              <Text className="text-[#F472B6] text-2xl font-bold mt-1">
                {progress.totalFemaleJuz} <Text className="text-sm font-normal">juz</Text>
              </Text>
            </GlassCard>
          </View>
        </View>

        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Chart Section */}
          <GlassCard className="p-4 mb-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-white font-bold text-lg">Grafik Juz per Hari</Text>
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

            {/* Line Chart */}
            <View style={{ height: 120, paddingHorizontal: 8 }}>
              {/* Grid lines */}
              <View className="absolute inset-0" style={{ paddingHorizontal: 8 }}>
                {[0, 25, 50, 75, 100].map((percent) => (
                  <View
                    key={percent}
                    className="absolute left-0 right-0 border-t border-white/5"
                    style={{ bottom: percent }}
                  />
                ))}
              </View>

              {/* Line chart area */}
              <View className="flex-row items-end justify-between" style={{ height: 100 }}>
                {displayedDays.map((data, index) => {
                  const maleY = maxJuz > 0 ? (data.male / maxJuz) * 100 : 0;
                  const femaleY = maxJuz > 0 ? (data.female / maxJuz) * 100 : 0;
                  const prevData = index > 0 ? displayedDays[index - 1] : null;
                  
                  return (
                    <View key={data.day} className="flex-1 items-center" style={{ height: 100 }}>
                      {/* Male point */}
                      <View className="absolute" style={{ bottom: maleY }}>
                        <TouchableOpacity
                          onPress={() => openAddModal(data.day)}
                          className="w-2 h-2 bg-[#60A5FA] rounded-full"
                          style={{
                            shadowColor: '#60A5FA',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                          }}
                        />
                      </View>
                      
                      {/* Female point */}
                      <View className="absolute" style={{ bottom: femaleY }}>
                        <TouchableOpacity
                          onPress={() => openAddModal(data.day)}
                          className="w-2 h-2 bg-[#F472B6] rounded-full"
                          style={{
                            shadowColor: '#F472B6',
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                          }}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* X-axis labels */}
              <View className="flex-row justify-between mt-2">
                {displayedDays.map((data) => (
                  <View key={data.day} className="flex-1 items-center">
                    <Text className="text-white/50 text-[10px]">{data.day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Legend */}
            <View className="flex-row justify-center mt-4">
              <View className="flex-row items-center mr-4">
                <View className="w-3 h-3 bg-[#60A5FA] rounded-sm mr-2" />
                <Text className="text-white/70 text-xs">Laki-laki</Text>
              </View>
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-[#F472B6] rounded-sm mr-2" />
                <Text className="text-white/70 text-xs">Wanita</Text>
              </View>
            </View>
          </GlassCard>

          {/* Daily Entries List */}
          <Text className="text-white font-bold text-lg mb-3">Data Harian</Text>
          
          {displayedDays.map((data) => {
            const entry = getDailyEntry(selectedYear, data.day);
            const hasData = data.total > 0;
            
            return (
              <GlassCard key={data.day} className="p-4 mb-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${hasData ? 'bg-[#7FFFD4]/20' : 'bg-white/10'}`}>
                      <Text className={`font-bold ${hasData ? 'text-[#7FFFD4]' : 'text-white/50'}`}>
                        {data.day}
                      </Text>
                    </View>
                    <View>
                      <Text className="text-white font-semibold">Hari ke-{data.day}</Text>
                      <Text className="text-white/50 text-xs">
                        {entry?.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center">
                    {hasData ? (
                      <>
                        <View className="items-end mr-3">
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-[#60A5FA] rounded-full mr-1" />
                            <Text className="text-white text-sm">{data.male}</Text>
                          </View>
                          <View className="flex-row items-center">
                            <View className="w-2 h-2 bg-[#F472B6] rounded-full mr-1" />
                            <Text className="text-white text-sm">{data.female}</Text>
                          </View>
                        </View>
                        <View className="bg-[#7FFFD4]/20 px-3 py-1 rounded-full mr-2">
                          <Text className="text-[#7FFFD4] font-bold">{data.total} juz</Text>
                        </View>
                        {canEdit && (
                          <TouchableOpacity
                            onPress={() => openEditModal(data.day)}
                            className="p-2"
                          >
                            <Edit2 size={18} color="#7FFFD4" />
                          </TouchableOpacity>
                        )}
                      </>
                    ) : (
                      canEdit ? (
                        <TouchableOpacity
                          onPress={() => openAddModal(data.day)}
                          className="flex-row items-center bg-white/10 px-3 py-2 rounded-full"
                        >
                          <Plus size={16} color="#7FFFD4" />
                          <Text className="text-[#7FFFD4] text-sm ml-1">Input</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text className="text-white/50 text-sm">Belum ada data</Text>
                      )
                    )}
                  </View>
                </View>
              </GlassCard>
            );
          })}

          <View className="h-24" />
        </ScrollView>

        {/* Add Entry Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 justify-end bg-[#0A1628]/40">
            <View className="bg-[#0D2B3E] rounded-t-3xl p-6 border-t border-mint-400/30">
              <Text className="text-white text-xl font-bold mb-2">
                Input Tadarus Hari ke-{selectedDay}
              </Text>
              <Text className="text-white/60 text-sm mb-6">
                Masukkan jumlah juz yang dibaca jamaah
              </Text>

              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 bg-[#60A5FA] rounded-full mr-2" />
                  <Text className="text-white/70">Jamaah Laki-laki (juz)</Text>
                </View>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-lg"
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={maleJuz}
                  onChangeText={setMaleJuz}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 bg-[#F472B6] rounded-full mr-2" />
                  <Text className="text-white/70">Jamaah Wanita (juz)</Text>
                </View>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-lg"
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={femaleJuz}
                  onChangeText={setFemaleJuz}
                  keyboardType="decimal-pad"
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
                    onPress={handleAddEntry}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Entry Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowEditModal(false)}
        >
          <View className="flex-1 justify-end bg-[#0A1628]/40">
            <View className="bg-[#0D2B3E] rounded-t-3xl p-6 border-t border-mint-400/30">
              <Text className="text-white text-xl font-bold mb-2">
                Edit Tadarus Hari ke-{selectedDay}
              </Text>
              <Text className="text-white/60 text-sm mb-6">
                Perbarui jumlah juz yang dibaca jamaah
              </Text>

              <View className="mb-4">
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 bg-[#60A5FA] rounded-full mr-2" />
                  <Text className="text-white/70">Jamaah Laki-laki (juz)</Text>
                </View>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-lg"
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={maleJuz}
                  onChangeText={setMaleJuz}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="mb-6">
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 bg-[#F472B6] rounded-full mr-2" />
                  <Text className="text-white/70">Jamaah Wanita (juz)</Text>
                </View>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white text-lg"
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={femaleJuz}
                  onChangeText={setFemaleJuz}
                  keyboardType="decimal-pad"
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Batal"
                    variant="secondary"
                    onPress={() => setShowEditModal(false)}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title="Perbarui"
                    onPress={handleEditEntry}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Year Filter Modal */}
        <Modal
          visible={showYearFilter}
          transparent
          animationType="fade"
          onRequestClose={() => setShowYearFilter(false)}
        >
          <View className="flex-1 bg-[#0A1628]/40 justify-center items-center px-6">
            <View className="w-full max-w-sm">
              <GlassCard className="p-6 bg-[#0A1628]">
                <Text className="text-white text-xl font-bold mb-4 text-center">
                  Pilih Tahun
                </Text>
                <ScrollView className="max-h-80">
                  {yearOptions.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => handleYearSelect(year)}
                      className={`p-4 rounded-xl mb-2 ${
                        selectedYear === year 
                          ? 'bg-[#7FFFD4]/20 border border-[#7FFFD4]' 
                          : 'bg-white/10'
                      }`}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className={`text-lg font-semibold ${
                          selectedYear === year ? 'text-[#7FFFD4]' : 'text-white'
                        }`}>
                          {year}
                        </Text>
                        {selectedYear === year && (
                          <View className="w-3 h-3 rounded-full bg-[#7FFFD4]" />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  onPress={() => setShowYearFilter(false)}
                  className="mt-4 p-3 bg-white/10 rounded-xl"
                >
                  <Text className="text-white text-center font-semibold">Tutup</Text>
                </TouchableOpacity>
              </GlassCard>
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}

export default TadarusScheduleModule;
