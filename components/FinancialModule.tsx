import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { GradientBackground } from './GradientBackground';
import { GlassCard } from './GlassCard';
import { PrimaryButton } from './PrimaryButton';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Filter } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Transaction } from '@/types';

interface FinancialModuleProps {
  onBack: () => void;
}

export function FinancialModule({ onBack }: FinancialModuleProps) {
  const [showModal, setShowModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'income',
      amount: 5000000,
      category: 'Donation',
      notes: 'Monthly donation from community',
      date: new Date(),
      createdBy: 'admin'
    },
    {
      id: '2',
      type: 'expense',
      amount: 1500000,
      category: 'Utilities',
      notes: 'Electricity and water bills',
      date: new Date(),
      createdBy: 'admin'
    }
  ]);

  const handleAddTransaction = () => {
    // Validation
    if (!amount.trim()) {
      Alert.alert('Validation Error', 'Please enter an amount');
      return;
    }

    if (!category.trim()) {
      Alert.alert('Validation Error', 'Please enter a category');
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
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        type: transactionType,
        amount: parsedAmount,
        category: category.trim(),
        notes: notes.trim(),
        date: new Date(),
        createdBy: 'current-user'
      };

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTransactions([newTransaction, ...transactions]);
      setShowModal(false);
      
      // Clear form
      setAmount('');
      setCategory('');
      setNotes('');
      
      Alert.alert('Success', 'Transaction added successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to add transaction. Please try again.');
      console.error('Error adding transaction:', error);
    }
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
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
              <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold flex-1">
              Financial Management
            </Text>
            <TouchableOpacity className="bg-white/10 p-2 rounded-lg border border-white/15">
              <Filter size={20} color="#7FFFD4" />
            </TouchableOpacity>
          </View>

          {/* Balance Card */}
          <GlassCard className="p-6">
            <Text className="text-white/70 text-sm mb-2">Total Balance</Text>
            <Text className="text-white text-4xl font-bold mb-4">
              {formatCurrency(balance)}
            </Text>
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center mb-1">
                  <TrendingUp size={16} color="#7FFFD4" />
                  <Text className="text-white/70 text-xs ml-1">Income</Text>
                </View>
                <Text className="text-mint-400 text-lg font-bold">
                  {formatCurrency(totalIncome)}
                </Text>
              </View>
              <View className="flex-1 ml-2">
                <View className="flex-row items-center mb-1">
                  <TrendingDown size={16} color="#FF6B6B" />
                  <Text className="text-white/70 text-xs ml-1">Expense</Text>
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
          <Text className="text-white text-lg font-bold mb-4">
            Recent Transactions
          </Text>
          {transactions.map((transaction) => (
            <GlassCard key={transaction.id} className="p-4 mb-3">
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-white font-semibold text-base mb-1">
                    {transaction.category}
                  </Text>
                  <Text className="text-white/60 text-sm mb-2">
                    {transaction.notes}
                  </Text>
                  <Text className="text-white/40 text-xs">
                    {transaction.date.toLocaleDateString('id-ID')}
                  </Text>
                </View>
                <View className="items-end">
                  <Text 
                    className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-mint-400' : 'text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </ScrollView>

        {/* FAB */}
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setShowModal(true);
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

        {/* Add Transaction Modal */}
        <Modal
          visible={showModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowModal(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <GlassCard className="rounded-t-3xl p-6 min-h-[500px]">
              <Text className="text-white text-2xl font-bold mb-6">
                Add Transaction
              </Text>

              {/* Type Selection */}
              <View className="flex-row mb-6">
                <TouchableOpacity
                  onPress={() => setTransactionType('income')}
                  className={`flex-1 py-3 rounded-xl mr-2 ${
                    transactionType === 'income' 
                      ? 'bg-mint-400' 
                      : 'bg-white/10 border border-white/15'
                  }`}
                >
                  <Text 
                    className={`text-center font-semibold ${
                      transactionType === 'income' ? 'text-navy-deep' : 'text-white'
                    }`}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTransactionType('expense')}
                  className={`flex-1 py-3 rounded-xl ml-2 ${
                    transactionType === 'expense' 
                      ? 'bg-red-400' 
                      : 'bg-white/10 border border-white/15'
                  }`}
                >
                  <Text 
                    className={`text-center font-semibold ${
                      transactionType === 'expense' ? 'text-white' : 'text-white'
                    }`}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <View className="mb-4">
                <Text className="text-white/70 mb-2 text-sm">Amount (IDR)</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <View className="mb-4">
                <Text className="text-white/70 mb-2 text-sm">Category</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="e.g., Donation, Utilities"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={category}
                  onChangeText={setCategory}
                />
              </View>

              <View className="mb-6">
                <Text className="text-white/70 mb-2 text-sm">Notes</Text>
                <TextInput
                  className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-white"
                  placeholder="Additional details"
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
            </GlassCard>
          </View>
        </Modal>
      </View>
    </GradientBackground>
  );
}
