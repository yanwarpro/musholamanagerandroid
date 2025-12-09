import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert,
  Linking
} from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { 
  ArrowLeft, 
  Plus, 
  BookOpen,
  User,
  Calendar,
  Clock,
  Youtube,
  Filter,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { KajianSchedule } from '@/types';
import { kajianService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';

interface KajianModuleProps {
  onBack: () => void;
}

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export function KajianModule({ onBack }: KajianModuleProps) {
  const { user } = useAuth();
  const canEdit = user?.role === 'admin' || user?.role === 'takmir';
  
  const [kajianList, setKajianList] = useState<KajianSchedule[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showYearFilter, setShowYearFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newKajian, setNewKajian] = useState({
    title: '',
    ustadName: '',
    date: '',
    time: '',
    topic: '',
    youtubeLink: '',
    isRecurring: false,
    recurringDay: ''
  });

  // Load kajian from Firebase
  useEffect(() => {
    const unsubscribe = kajianService.subscribe((data) => {
      setKajianList(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredKajian = kajianList.filter(k => k.year === selectedYear);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  };

  const handleOpenYoutube = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this URL');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open link');
    }
  };

  const handleAddKajian = async () => {
    if (!newKajian.title || !newKajian.ustadName || !newKajian.date || !newKajian.time || !newKajian.topic) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const kajian = {
        title: newKajian.title,
        ustadName: newKajian.ustadName,
        date: new Date(newKajian.date),
        time: newKajian.time,
        topic: newKajian.topic,
        youtubeLink: newKajian.youtubeLink,
        year: new Date(newKajian.date).getFullYear(),
        isRecurring: newKajian.isRecurring,
        recurringDay: newKajian.recurringDay || undefined
      };

      // Save to Firebase
      await kajianService.add(kajian);

      setShowAddModal(false);
      setNewKajian({
        title: '',
        ustadName: '',
        date: '',
        time: '',
        topic: '',
        youtubeLink: '',
        isRecurring: false,
        recurringDay: ''
      });
      Alert.alert('Success', 'Kajian schedule added successfully');
    } catch (error) {
      console.error('Error adding kajian:', error);
      Alert.alert('Error', 'Failed to add kajian schedule');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <GradientBackground>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-4">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity
              onPress={handleBack}
              className="bg-white/10 p-3 rounded-xl border border-white/15 mr-4"
            >
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-white text-2xl font-bold">Kajian Rutin</Text>
              <Text className="text-white/60 text-sm">Jadwal kajian & materi</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="bg-mint-400/20 p-3 rounded-xl border border-mint-400/30"
            >
              <Plus size={24} color="#7FFFD4" />
            </TouchableOpacity>
          </View>

          {/* Year Filter */}
          <TouchableOpacity
            onPress={() => setShowYearFilter(true)}
            className="flex-row items-center bg-white/10 px-4 py-3 rounded-xl border border-white/15"
          >
            <Filter size={18} color="#7FFFD4" />
            <Text className="text-white ml-2 flex-1">Tahun: {selectedYear}</Text>
            <ChevronDown size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Kajian List */}
        <ScrollView className="flex-1 px-6">
          {filteredKajian.length === 0 ? (
            <GlassCard className="p-8 items-center">
              <BookOpen size={48} color="#7FFFD4" />
              <Text className="text-white text-lg font-bold mt-4">
                Belum ada jadwal kajian
              </Text>
              <Text className="text-white/60 text-center mt-2">
                Tambahkan jadwal kajian rutin untuk tahun {selectedYear}
              </Text>
            </GlassCard>
          ) : (
            filteredKajian.map((kajian) => (
              <GlassCard key={kajian.id} className="p-5 mb-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-white text-lg font-bold">
                      {kajian.title}
                    </Text>
                    {kajian.isRecurring && kajian.recurringDay && (
                      <View className="bg-mint-400/20 px-2 py-1 rounded-md self-start mt-1">
                        <Text className="text-mint-400 text-xs">
                          Rutin setiap {kajian.recurringDay}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center mb-2">
                  <User size={16} color="#7FFFD4" />
                  <Text className="text-white/80 ml-2">{kajian.ustadName}</Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color="#7FFFD4" />
                  <Text className="text-white/80 ml-2">{formatDate(kajian.date)}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Clock size={16} color="#7FFFD4" />
                  <Text className="text-white/80 ml-2">{kajian.time} WIB</Text>
                </View>

                <View className="bg-white/5 p-3 rounded-lg mb-3">
                  <Text className="text-white/60 text-xs mb-1">Materi:</Text>
                  <Text className="text-white">{kajian.topic}</Text>
                </View>

                {kajian.youtubeLink && (
                  <TouchableOpacity
                    onPress={() => handleOpenYoutube(kajian.youtubeLink)}
                    className="flex-row items-center bg-red-500/20 p-3 rounded-xl border border-red-500/30"
                  >
                    <Youtube size={20} color="#FF0000" />
                    <Text className="text-white ml-2 flex-1">Tonton di YouTube</Text>
                    <ExternalLink size={16} color="#fff" />
                  </TouchableOpacity>
                )}
              </GlassCard>
            ))
          )}
          <View className="h-8" />
        </ScrollView>

        {/* Year Filter Modal */}
        <Modal
          visible={showYearFilter}
          transparent
          animationType="fade"
          onRequestClose={() => setShowYearFilter(false)}
        >
          <View className="flex-1 bg-[#0A1628]/40 justify-center items-center px-6">
            <View className="w-full bg-[#0D2B3E] rounded-2xl p-6 border border-mint-400/30">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Pilih Tahun</Text>
                <TouchableOpacity onPress={() => setShowYearFilter(false)}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>
              
              {YEARS.map((year) => (
                <TouchableOpacity
                  key={year}
                  onPress={() => {
                    setSelectedYear(year);
                    setShowYearFilter(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={`p-4 rounded-xl mb-2 ${
                    selectedYear === year 
                      ? 'bg-mint-400/20 border border-mint-400/30' 
                      : 'bg-white/5'
                  }`}
                >
                  <Text className={`text-center text-lg ${
                    selectedYear === year ? 'text-mint-400 font-bold' : 'text-white'
                  }`}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>

        {/* Add Kajian Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 bg-[#0A1628]/40 justify-end">
            <View className="bg-[#0D2B3E] rounded-t-3xl p-6 max-h-[90%] border-t border-mint-400/30">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">Tambah Jadwal Kajian</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-4">
                  <Text className="text-white/70 text-sm mb-2">Judul Kajian *</Text>
                  <TextInput
                    value={newKajian.title}
                    onChangeText={(text) => setNewKajian({ ...newKajian, title: text })}
                    placeholder="Contoh: Kajian Fiqih Ibadah"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-white/70 text-sm mb-2">Nama Ustadz *</Text>
                  <TextInput
                    value={newKajian.ustadName}
                    onChangeText={(text) => setNewKajian({ ...newKajian, ustadName: text })}
                    placeholder="Contoh: Ustadz Ahmad Zainuddin"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-white/70 text-sm mb-2">Tanggal (YYYY-MM-DD) *</Text>
                  <TextInput
                    value={newKajian.date}
                    onChangeText={(text) => setNewKajian({ ...newKajian, date: text })}
                    placeholder="Contoh: 2025-01-20"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-white/70 text-sm mb-2">Waktu *</Text>
                  <TextInput
                    value={newKajian.time}
                    onChangeText={(text) => setNewKajian({ ...newKajian, time: text })}
                    placeholder="Contoh: 19:30"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-white/70 text-sm mb-2">Materi/Topik *</Text>
                  <TextInput
                    value={newKajian.topic}
                    onChangeText={(text) => setNewKajian({ ...newKajian, topic: text })}
                    placeholder="Contoh: Tata Cara Sholat yang Benar"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline
                    numberOfLines={3}
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-white/70 text-sm mb-2">Link YouTube</Text>
                  <TextInput
                    value={newKajian.youtubeLink}
                    onChangeText={(text) => setNewKajian({ ...newKajian, youtubeLink: text })}
                    placeholder="https://youtube.com/watch?v=..."
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  onPress={() => setNewKajian({ ...newKajian, isRecurring: !newKajian.isRecurring })}
                  className="flex-row items-center mb-4"
                >
                  <View className={`w-6 h-6 rounded-md border-2 mr-3 items-center justify-center ${
                    newKajian.isRecurring ? 'bg-mint-400 border-mint-400' : 'border-white/30'
                  }`}>
                    {newKajian.isRecurring && <Text className="text-navy-deep font-bold">✓</Text>}
                  </View>
                  <Text className="text-white">Kajian Rutin</Text>
                </TouchableOpacity>

                {newKajian.isRecurring && (
                  <View className="mb-4">
                    <Text className="text-white/70 text-sm mb-2">Hari Rutin</Text>
                    <TextInput
                      value={newKajian.recurringDay}
                      onChangeText={(text) => setNewKajian({ ...newKajian, recurringDay: text })}
                      placeholder="Contoh: Jumat"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                    />
                  </View>
                )}

                <View className="h-4" />
                
                <PrimaryButton title="Simpan Jadwal" onPress={handleAddKajian} />
                
                <View className="h-8" />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}
