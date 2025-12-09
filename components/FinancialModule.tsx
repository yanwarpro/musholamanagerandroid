import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Filter, ChevronDown, Calendar, Edit2, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Transaction } from '@/types';
import { transactionsService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface FinancialModuleProps {
  onBack: () => void;
}

const YEARS = [2025, 2026, 2027, 2028, 2029, 2030];
const MONTHS = [
  { value: 0, label: 'Semua Bulan' },
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

export function FinancialModule({ onBack }: FinancialModuleProps) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const canEdit = user?.role === 'admin' || user?.role === 'takmir';
  
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = all months

  // Load transactions from Firebase
  useEffect(() => {
    const unsubscribe = transactionsService.subscribe((data) => {
      setTransactions(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filter transactions by year and month
  const filteredTransactions = transactions.filter(t => {
    const yearMatch = t.year === selectedYear;
    const monthMatch = selectedMonth === 0 || t.month === selectedMonth;
    return yearMatch && monthMatch;
  });

  const handleAddTransaction = async () => {
    // Validation
    if (!amount.trim()) {
      Alert.alert('Validation Error', 'Please enter an amount');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter a category');
      return;
    }

    if (!fromAccount.trim()) {
      Alert.alert('Validation Error', 'Please enter source account');
      return;
    }

    if (!toAccount.trim()) {
      Alert.alert('Validation Error', 'Please enter destination account');
      return;
    }

    const parsedAmount = parseFloat(amount);
    
    // Validate amount is a valid number
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0');
      return;
    }

    // Check for unreasonably large amounts (optional safety check)
    if (parsedAmount > 1000000000) {
      Alert.alert('Validation Error', 'Amount seems too large. Please verify.');
      return;
    }

    try {
      const now = new Date();
      const newTransaction = {
        type: transactionType,
        amount: parsedAmount,
        category: category.trim(),
        notes: notes.trim(),
        date: now,
        day: now.getDate(),
        month: now.getMonth() + 1, // 1-12
        year: now.getFullYear(),
        fromAccount: fromAccount.trim(),
        toAccount: toAccount.trim(),
        createdBy: 'current-user'
      };

      // Save to Firebase
      await transactionsService.add(newTransaction);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowModal(false);
      
      // Clear form
      setAmount('');
      setCategory('');
      setNotes('');
      setFromAccount('');
      setToAccount('');
      
      Alert.alert('Success', 'Transaction added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
      console.error('Error adding transaction:', error);
    }
  };

  // Edit transaction handler
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setTransactionType(transaction.type);
    setAmount(transaction.amount.toString());
    setCategory(transaction.category);
    setNotes(transaction.notes || '');
    setFromAccount(transaction.fromAccount || '');
    setToAccount(transaction.toAccount || '');
    setShowEditModal(true);
  };

  // Update transaction handler
  const handleUpdateTransaction = async () => {
    if (!editingTransaction) return;

    if (!amount.trim()) {
      Alert.alert('Validation Error', 'Please enter an amount');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter a category');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount greater than 0');
      return;
    }

    try {
      await transactionsService.update(editingTransaction.id, {
        type: transactionType,
        amount: parsedAmount,
        category: category.trim(),
        notes: notes.trim(),
        fromAccount: fromAccount.trim(),
        toAccount: toAccount.trim(),
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowEditModal(false);
      setEditingTransaction(null);
      clearForm();
      Alert.alert('Success', 'Transaction updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction. Please try again.');
      // Error logged silently
    }
  };

  // Delete transaction handler
  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Hapus Transaksi',
      `Apakah Anda yakin ingin menghapus transaksi "${transaction.category}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await transactionsService.delete(transaction.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'Transaction deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction.');
              // Error logged silently
            }
          },
        },
      ]
    );
  };

  // Clear form helper
  const clearForm = () => {
    setAmount('');
    setCategory('');
    setNotes('');
    setFromAccount('');
    setToAccount('');
    setTransactionType('income');
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
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
              Financial Management
            </Text>
            <TouchableOpacity 
              onPress={() => setShowFilterModal(true)}
              style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder }}
              className="p-2 rounded-lg border"
            >
              <Filter size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* Year & Month Filter Display */}
          <View className="flex-row mb-4">
            <View style={{ backgroundColor: `${colors.accent}20` }} className="px-3 py-1 rounded-full mr-2 flex-row items-center">
              <Calendar size={14} color={colors.accent} />
              <Text style={{ color: colors.accent }} className="text-sm ml-1 font-medium">{selectedYear}</Text>
            </View>
            {selectedMonth > 0 && (
              <View style={{ backgroundColor: `${colors.accent}20` }} className="px-3 py-1 rounded-full flex-row items-center">
                <Text style={{ color: colors.accent }} className="text-sm font-medium">
                  {MONTHS.find(m => m.value === selectedMonth)?.label}
                </Text>
              </View>
            )}
          </View>

          {/* Balance Card */}
          <GlassCard className="p-6">
            <Text style={{ color: colors.textSecondary }} className="text-sm mb-2">Total Balance</Text>
            <Text style={{ color: colors.textPrimary }} className="text-4xl font-bold mb-4">
              {formatCurrency(balance)}
            </Text>
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center mb-1">
                  <TrendingUp size={16} color={colors.accent} />
                  <Text style={{ color: colors.textSecondary }} className="text-xs ml-1">Income</Text>
                </View>
                <Text style={{ color: colors.accent }} className="text-lg font-bold">
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              <View className="flex-1 ml-2">
                <View className="flex-row items-center mb-1">
                  <TrendingDown size={16} color="#FF6B6B" />
                  <Text style={{ color: colors.textSecondary }} className="text-xs ml-1">Expense</Text>
                </View>
                <Text className="text-red-400 text-lg font-bold">
                  {formatCurrency(totalExpense)}
                </Text>
              </View>
            </View>
          </GlassCard>
        </View>

        {/* Transactions List */}
        <ScrollView className="flex-1 px-6">
          <Text style={{ color: colors.textPrimary }} className="text-lg font-bold mb-4">
            Recent Transactions
          </Text>
          {filteredTransactions.length === 0 ? (
            <GlassCard className="p-6">
              <Text style={{ color: colors.textMuted }} className="text-center">
                Tidak ada transaksi untuk periode ini
              </Text>
            </GlassCard>
          ) : (
            filteredTransactions.map((transaction) => (
              <TouchableOpacity 
                key={transaction.id} 
                onPress={() => canEdit && handleEditTransaction(transaction)}
                onLongPress={() => canEdit && handleDeleteTransaction(transaction)}
                delayLongPress={500}
                disabled={!canEdit}
              >
                <GlassCard className="p-4 mb-3">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text style={{ color: colors.textPrimary }} className="font-semibold text-base mb-1">
                        {transaction.category}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-sm mb-1">
                        {transaction.notes}
                      </Text>
                      <Text style={{ color: colors.accent, opacity: 0.8 }} className="text-xs mb-1">
                        {transaction.fromAccount} → {transaction.toAccount}
                      </Text>
                      <Text style={{ color: colors.textMuted }} className="text-xs">
                        {transaction.day}/{transaction.month}/{transaction.year}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text 
                        style={{ color: transaction.type === 'income' ? colors.accent : '#F87171' }}
                        className="text-lg font-bold"
                      >
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </Text>
                      {canEdit && (
                        <View className="flex-row mt-2">
                          <TouchableOpacity 
                            onPress={() => handleEditTransaction(transaction)}
                            style={{ backgroundColor: colors.inputBg }}
                            className="p-2 rounded-lg mr-2"
                          >
                            <Edit2 size={14} color={colors.accent} />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => handleDeleteTransaction(transaction)}
                            style={{ backgroundColor: colors.inputBg }}
                            className="p-2 rounded-lg"
                          >
                            <Trash2 size={14} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* FAB - Only show for admin/takmir */}
        {canEdit && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowModal(true);
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

        {/* Add Transaction Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowModal(false)}
        >
          <View style={{ backgroundColor: colors.overlay }} className="flex-1 justify-end">
            <View style={{ backgroundColor: colors.bgSecondary, borderTopColor: `${colors.accent}30` }} className="rounded-t-3xl p-6 min-h-[500px] border-t">
              <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold mb-6">
                Add Transaction
              </Text>

              {/* Type Selection */}
              <View className="flex-row mb-6">
                <TouchableOpacity
                  onPress={() => setTransactionType('income')}
                  style={{
                    backgroundColor: transactionType === 'income' ? colors.accent : colors.inputBg,
                    borderColor: colors.inputBorder,
                    borderWidth: transactionType === 'income' ? 0 : 1,
                  }}
                  className="flex-1 py-3 rounded-xl mr-2"
                >
                  <Text 
                    style={{ color: transactionType === 'income' ? colors.bgPrimary : colors.textPrimary }}
                    className="text-center font-semibold"
                  >
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTransactionType('expense')}
                  style={{
                    backgroundColor: transactionType === 'expense' ? '#F87171' : colors.inputBg,
                    borderColor: colors.inputBorder,
                    borderWidth: transactionType === 'expense' ? 0 : 1,
                  }}
                  className="flex-1 py-3 rounded-xl ml-2"
                >
                  <Text 
                    style={{ color: transactionType === 'expense' ? '#fff' : colors.textPrimary }}
                    className="text-center font-semibold"
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Amount (IDR)</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="0"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Category</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Donation, Utilities"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Notes</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="Additional details"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Account Fields */}
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Dari Rekening</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Kas Masjid, BRI, BSI"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={fromAccount}
                  onChangeText={setFromAccount}
                />
              </View>

              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Ke Rekening</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Donatur, Vendor, Kas Masjid"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={toAccount}
                  onChangeText={setToAccount}
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Cancel"
                    variant="secondary"
                    onPress={() => setShowModal(false)}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title="Add"
                    onPress={handleAddTransaction}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFilterModal(false)}
        >
          <View style={{ backgroundColor: colors.overlay }} className="flex-1 justify-end">
            <View style={{ backgroundColor: colors.bgSecondary, borderTopColor: `${colors.accent}30` }} className="rounded-t-3xl p-6 border-t">
              <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold mb-6">
                Filter Transaksi
              </Text>

              {/* Year Selection */}
              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="mb-3 text-sm">Pilih Tahun</Text>
                <View className="flex-row flex-wrap">
                  {YEARS.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      style={{
                        backgroundColor: selectedYear === year ? colors.accent : colors.inputBg,
                        borderColor: colors.inputBorder,
                        borderWidth: selectedYear === year ? 0 : 1,
                      }}
                      className="px-4 py-2 rounded-xl mr-2 mb-2"
                    >
                      <Text 
                        style={{ color: selectedYear === year ? colors.bgPrimary : colors.textPrimary }}
                        className="font-semibold"
                      >
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Month Selection */}
              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="mb-3 text-sm">Pilih Bulan</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row">
                    {MONTHS.map((month) => (
                      <TouchableOpacity
                        key={month.value}
                        onPress={() => setSelectedMonth(month.value)}
                        style={{
                          backgroundColor: selectedMonth === month.value ? colors.accent : colors.inputBg,
                          borderColor: colors.inputBorder,
                          borderWidth: selectedMonth === month.value ? 0 : 1,
                        }}
                        className="px-4 py-2 rounded-xl mr-2"
                      >
                        <Text 
                          style={{ color: selectedMonth === month.value ? colors.bgPrimary : colors.textPrimary }}
                          className="font-semibold"
                        >
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <PrimaryButton
                title="Terapkan Filter"
                onPress={() => setShowFilterModal(false)}
              />
            </View>
          </View>
        </Modal>

        {/* Edit Transaction Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
            clearForm();
          }}
        >
          <View style={{ backgroundColor: colors.overlay }} className="flex-1 justify-end">
            <View style={{ backgroundColor: colors.bgSecondary, borderTopColor: `${colors.accent}30` }} className="rounded-t-3xl p-6 min-h-[500px] border-t">
              <Text style={{ color: colors.textPrimary }} className="text-2xl font-bold mb-6">
                Edit Transaksi
              </Text>

              {/* Type Selection */}
              <View className="flex-row mb-6">
                <TouchableOpacity
                  onPress={() => setTransactionType('income')}
                  style={{
                    backgroundColor: transactionType === 'income' ? colors.accent : colors.inputBg,
                    borderColor: colors.inputBorder,
                    borderWidth: transactionType === 'income' ? 0 : 1,
                  }}
                  className="flex-1 py-3 rounded-xl mr-2"
                >
                  <Text 
                    style={{ color: transactionType === 'income' ? colors.bgPrimary : colors.textPrimary }}
                    className="text-center font-semibold"
                  >
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTransactionType('expense')}
                  style={{
                    backgroundColor: transactionType === 'expense' ? '#F87171' : colors.inputBg,
                    borderColor: colors.inputBorder,
                    borderWidth: transactionType === 'expense' ? 0 : 1,
                  }}
                  className="flex-1 py-3 rounded-xl ml-2"
                >
                  <Text 
                    style={{ color: transactionType === 'expense' ? '#fff' : colors.textPrimary }}
                    className="text-center font-semibold"
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Amount (IDR)</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="0"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Category</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Donation, Utilities"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Notes</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="Additional details"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View className="mb-4">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Dari Rekening</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Kas Masjid, BRI, BSI"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={fromAccount}
                  onChangeText={setFromAccount}
                />
              </View>

              <View className="mb-6">
                <Text style={{ color: colors.textSecondary }} className="mb-2 text-sm">Ke Rekening</Text>
                <TextInput
                  style={{ backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.textPrimary }}
                  className="border rounded-xl px-4 py-3"
                  placeholder="e.g., Donatur, Vendor, Kas Masjid"
                  placeholderTextColor={colors.inputPlaceholder}
                  value={toAccount}
                  onChangeText={setToAccount}
                />
              </View>

              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <PrimaryButton
                    title="Batal"
                    variant="secondary"
                    onPress={() => {
                      setShowEditModal(false);
                      setEditingTransaction(null);
                      clearForm();
                    }}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <PrimaryButton
                    title="Simpan"
                    onPress={handleUpdateTransaction}
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
