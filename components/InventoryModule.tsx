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

interface InventoryModuleProps {
  onBack: () => void;
}

export function InventoryModule({ onBack }: InventoryModuleProps) {
  const { user } = useAuth();
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
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1">
              Inventory Management
            </Text>
          </View>

          <GlassCard className="p-4">
            <Text className="text-white/70 text-sm mb-1">Total Items</Text>
            <Text className="text-white text-3xl font-bold">
              {items.reduce((sum, item) => sum + item.quantity, 0)}
            </Text>
            <Text className="text-mint-400 text-sm mt-1">
              Across {items.length} categories
            </Text>
          </GlassCard>
        </View>

        {/* Items Grid */}
        <ScrollView className="flex-1 px-6">
          <Text className="text-white text-lg font-bold mb-4">
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
                      style={{ backgroundColor: '#7FFFD420' }}
                    >
                      <Package size={24} color="#7FFFD4" />
                    </View>
                    <Text className="text-white font-bold text-base mb-1">
                      {item.name}
                    </Text>
                    <Text className="text-white/60 text-xs mb-2">
                      {item.category}
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-mint-400 text-2xl font-bold">
                        {item.quantity}
                      </Text>
                      <Text className="text-white/60 text-sm ml-1">
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
            className="absolute bottom-8 right-6 bg-mint-400 w-16 h-16 rounded-full items-center justify-center"
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

        {/* Item Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={closeModal}
        >
          <View className="flex-1 justify-end bg-[#0A1628]/40">
            <View className="bg-[#0D2B3E] rounded-t-3xl p-6 min-h-[500px] border-t border-mint-400/30">
              <Text className="text-white text-2xl font-bold mb-6">
                {selectedItem ? 'Edit Item' : 'Add New Item'}
              </Text>

              <View className="mb-4">
                <Text className="text-white/70 mb-2 text-sm">Item Name</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="e.g., Prayer Mats"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-white/70 mb-2 text-sm">Quantity</Text>
                  <TextInput
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-white/70 mb-2 text-sm">Unit</Text>
                  <TextInput
                    className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                    placeholder="pcs, kg, etc"
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={unit}
                    onChangeText={setUnit}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-white/70 mb-2 text-sm">Category</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="e.g., Prayer Equipment"
                  placeholderTextColor="rgba(255,255,255,0.4)"
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
