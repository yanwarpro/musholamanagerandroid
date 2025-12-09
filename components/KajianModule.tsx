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
  ChevronDown,
  Edit2,
  Trash2
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { KajianSchedule } from '@/types';
import { kajianService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface KajianModuleProps {
  onBack: () => void;
}

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];

export function KajianModule({ onBack }: KajianModuleProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
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
  const [editingKajian, setEditingKajian] = useState<KajianSchedule | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleEditKajian = (kajian: KajianSchedule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingKajian(kajian);
    setNewKajian({
      title: kajian.title,
      ustadName: kajian.ustadName,
      date: kajian.date.toISOString().split('T')[0],
      time: kajian.time,
      topic: kajian.topic,
      youtubeLink: kajian.youtubeLink || '',
      isRecurring: kajian.isRecurring || false,
      recurringDay: kajian.recurringDay || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateKajian = async () => {
    if (!editingKajian) return;
    
    if (!newKajian.title || !newKajian.ustadName || !newKajian.date || !newKajian.time || !newKajian.topic) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await kajianService.update(editingKajian.id, {
        title: newKajian.title,
        ustadName: newKajian.ustadName,
        date: new Date(newKajian.date),
        time: newKajian.time,
        topic: newKajian.topic,
        youtubeLink: newKajian.youtubeLink,
        year: new Date(newKajian.date).getFullYear(),
        isRecurring: newKajian.isRecurring,
        recurringDay: newKajian.recurringDay || undefined
      });

      setShowEditModal(false);
      setEditingKajian(null);
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
      Alert.alert('Success', 'Kajian schedule updated successfully');
    } catch (error) {
      console.error('Error updating kajian:', error);
      Alert.alert('Error', 'Failed to update kajian schedule');
    }
  };

  const handleDeleteKajian = (kajian: KajianSchedule) => {
    Alert.alert(
      'Hapus Kajian',
      `Apakah Anda yakin ingin menghapus kajian "${kajian.title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            try {
              await kajianService.delete(kajian.id);
              Alert.alert('Success', 'Kajian berhasil dihapus');
            } catch (error) {
              console.error('Error deleting kajian:', error);
              Alert.alert('Error', 'Gagal menghapus kajian');
            }
          },
        },
      ]
    );
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
              style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder }}
              className="p-3 rounded-xl border mr-4"
            >
              <ArrowLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <View className="flex-1">
              <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold">Kajian Rutin</Text>
              <Text style={{ color: colors.textMuted }} className="text-sm">Jadwal kajian & materi</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowYearFilter(true)}
              style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder }}
              className="flex-row items-center px-4 py-3 rounded-xl border mr-3 flex-1"
            >
              <Filter size={18} color={colors.accent} />
              <Text style={{ color: colors.textPrimary }} className="ml-2 flex-1">Tahun: {selectedYear}</Text>
              <ChevronDown size={18} color={colors.textPrimary} />
            </TouchableOpacity>
            {canEdit && (
              <TouchableOpacity
                onPress={() => setShowAddModal(true)}
                style={{ backgroundColor: `${colors.accent}20`, borderColor: `${colors.accent}30` }}
                className="p-3 rounded-xl border"
              >
                <Plus size={24} color={colors.accent} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Kajian List */}
        <ScrollView className="flex-1 px-6">
          {filteredKajian.length === 0 ? (
            <GlassCard className="p-8 items-center">
              <BookOpen size={48} color={colors.accent} />
              <Text style={{ color: colors.textPrimary }} className="text-lg font-bold mt-4">
                Belum ada jadwal kajian
              </Text>
              <Text style={{ color: colors.textMuted }} className="text-center mt-2">
                Tambahkan jadwal kajian rutin untuk tahun {selectedYear}
              </Text>
            </GlassCard>
          ) : (
            filteredKajian.map((kajian) => (
              <GlassCard key={kajian.id} className="p-5 mb-4">
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text style={{ color: colors.textPrimary }} className="text-lg font-bold">
                      {kajian.title}
                    </Text>
                    {kajian.isRecurring && kajian.recurringDay && (
                      <View style={{ backgroundColor: `${colors.accent}20` }} className="px-2 py-1 rounded-md self-start mt-1">
                        <Text style={{ color: colors.accent }} className="text-xs">
                          Rutin setiap {kajian.recurringDay}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className="flex-row items-center mb-2">
                  <User size={16} color={colors.accent} />
                  <Text style={{ color: colors.textSecondary }} className="ml-2">{kajian.ustadName}</Text>
                </View>

                <View className="flex-row items-center mb-2">
                  <Calendar size={16} color={colors.accent} />
                  <Text style={{ color: colors.textSecondary }} className="ml-2">{formatDate(kajian.date)}</Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <Clock size={16} color={colors.accent} />
                  <Text style={{ color: colors.textSecondary }} className="ml-2">{kajian.time} WIB</Text>
                </View>

                <View className="bg-white/5 p-3 rounded-lg mb-3">
                  <Text className="text-white/60 text-xs mb-1">Materi:</Text>
                  <Text className="text-white">{kajian.topic}</Text>
                </View>

                {kajian.youtubeLink && (
                  <TouchableOpacity
                    onPress={() => handleOpenYoutube(kajian.youtubeLink)}
                    className="flex-row items-center bg-red-500/20 p-3 rounded-xl border border-red-500/30 mb-3"
                  >
                    <Youtube size={20} color="#FF0000" />
                    <Text className="text-white ml-2 flex-1">Tonton di YouTube</Text>
                    <ExternalLink size={16} color="#fff" />
                  </TouchableOpacity>
                )}

                {/* Edit & Delete buttons - only for admin/takmir */}
                {canEdit && (
                  <View className="flex-row justify-end mt-2 pt-3 border-t border-white/10">
                    <TouchableOpacity
                      onPress={() => handleEditKajian(kajian)}
                      className="flex-row items-center bg-blue-500/20 px-4 py-2 rounded-xl border border-blue-500/30 mr-2"
                    >
                      <Edit2 size={16} color="#60A5FA" />
                      <Text className="text-blue-400 ml-2 font-medium">Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteKajian(kajian)}
                      className="flex-row items-center bg-red-500/20 px-4 py-2 rounded-xl border border-red-500/30"
                    >
                      <Trash2 size={16} color="#F87171" />
                      <Text className="text-red-400 ml-2 font-medium">Hapus</Text>
                    </TouchableOpacity>
                  </View>
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

        {/* Edit Kajian Modal */}
        <Modal
          visible={showEditModal}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setShowEditModal(false);
            setEditingKajian(null);
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
          }}
        >
          <View className="flex-1 bg-[#0A1628]/40 justify-end">
            <View className="bg-[#0D2B3E] rounded-t-3xl p-6 max-h-[90%] border-t border-mint-400/30">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">Edit Jadwal Kajian</Text>
                <TouchableOpacity onPress={() => {
                  setShowEditModal(false);
                  setEditingKajian(null);
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
                }}>
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
                
                <PrimaryButton title="Update Jadwal" onPress={handleUpdateKajian} />
                
                <View className="h-8" />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}
