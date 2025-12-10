import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Plus, Package } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { InventoryItem } from '@/types';
import { inventoryService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface InventoryModuleProps {
  onBack: () => void;
}

export function InventoryModule({ onBack }: InventoryModuleProps) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const canEdit = user?.role === 'admin' || user?.role === 'takmir';
  
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load inventory from Firebase
  useEffect(() => {
    const unsubscribe = inventoryService.subscribe((data) => {
      setItems(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveItem = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter item name');
      return;
    }

    if (!quantity.trim()) {
      Alert.alert('Validation Error', 'Please enter quantity');
      return;
    }

    if (!unit.trim()) {
      Alert.alert('Validation Error', 'Please enter unit');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter category');
      return;
    }

    const parsedQuantity = parseInt(quantity);
    
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      Alert.alert('Validation Error', 'Please enter a valid quantity (0 or greater)');
      return;
    }

    try {
      if (selectedItem) {
        // Update existing item in Firebase
        await inventoryService.update(selectedItem.id, {
          name: name.trim(),
          quantity: parsedQuantity,
          unit: unit.trim(),
          category: category.trim(),
        });
        Alert.alert('Success', 'Item updated successfully!');
      } else {
        // Add new item to Firebase
        await inventoryService.add({
          name: name.trim(),
          quantity: parsedQuantity,
          unit: unit.trim(),
          category: category.trim(),
          lastUpdated: new Date()
        });
        Alert.alert('Success', 'Item added successfully!');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      closeModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to save item. Please try again.');
      console.error('Error saving item:', error);
    }
  };

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
      setName(item.name);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
      setCategory(item.category);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setName('');
    setQuantity('');
    setUnit('');
    setCategory('');
  };

  return (
    <GradientBackground>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={onBack} className="mr-4">
              <ArrowLeft size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold flex-1">
              Inventory Management
            </Text>
          </View>

          <GlassCard className="p-4">
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-1">Total Items</Text>
            <Text style={{ color: colors.textPrimary }} className="text-3xl font-bold">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
            <Text style={{ color: colors.accent }} className="text-sm mt-1">
              Across {items.length} categories
            </Text>
          </GlassCard>
        </View>

        {/* Items Grid */}
        <ScrollView className="flex-1 px-6">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-bold mb-4">
            All Items
          </Text>
          <View className="flex-row flex-wrap -mx-2">
            {items.map((item) => (
              <View key={item.id} className="w-1/2 px-2 mb-4">
                <TouchableOpacity
                  onPress={() => {
                    if (canEdit) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      openModal(item);
                    }
                  }}
                  activeOpacity={canEdit ? 0.8 : 1}
                  disabled={!canEdit}
                >
                  <GlassCard className="p-4">
                    <View 
                      className="w-12 h-12 rounded-xl items-center justify-center mb-3"
                      style={{ backgroundColor: `${colors.accent}20` }}
                    >
                      <Package size={24} color={colors.accent} />
                    </View>
                    <Text style={{ color: colors.textPrimary }} className="font-bold text-base mb-1">
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs mb-2">
                      {item.category}
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text style={{ color: colors.accent }} className="text-2xl font-bold">
                        {item.quantity}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-sm ml-1">
                        {item.unit}
                      </Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* FAB - Only show for admin/takmir */}
        {canEdit && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              openModal();
            }}
            style={{
              backgroundColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.5,
              shadowRadius: 16,
              elevation: 8,
            }}
            className="absolute bottom-8 right-6 w-16 h-16 rounded-full items-center justify-center"
          >
            <Plus size={32} color={colors.bgPrimary} />
          </TouchableOpacity>
        )}

        {/* Item Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={closeModal}
        >
          <View style={{ backgroundColor: colors.overlay }} className="flex-1 justify-end">
            <View style={{ backgroundColor: colors.bgSecondary, borderTopColor: `${colors.accent}30` }} className="rounded-t-3xl p-6 min-h-[500px] border-t">
              <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold mb-6">
                {selectedItem ? 'Edit Item' : 'Add New Item'}
              </Text>

              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Item Name</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Prayer Mats"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Quantity</Text>
                  <TextInput
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                    className="border rounded-xl px-4 py-3"
                    placeholder="0"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Unit</Text>
                  <TextInput
                    style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                    className="border rounded-xl px-4 py-3"
                    placeholder="pcs, kg, etc"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Category</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Prayer Equipment"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Cancel"
                    variant="secondary"
                    onPress={closeModal}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title={selectedItem ? 'Update' : 'Add'}
                    onPress={handleSaveItem}
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
