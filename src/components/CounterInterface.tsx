import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';
import Icon from 'react-native-vector-icons/Feather';

interface CounterInterfaceProps {
  currency: string;
  onAddTransaction: (amount: number, type: 'expense' | 'income') => void;
  balance: number;
  transactions: Transaction[];
  onMenuOpen: () => void;
  onNavigateToHistory: () => void;
}

const CounterInterface: React.FC<CounterInterfaceProps> = ({ 
  currency, 
  onAddTransaction, 
  balance, 
  transactions, 
  onMenuOpen, 
  onNavigateToHistory 
}) => {
  const [amount, setAmount] = useState(0);
  const [displayValue, setDisplayValue] = useState('0');
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const handleIncrement = (value: number) => {
    const newAmount = Math.max(0, amount + value);
    setAmount(newAmount);
    setDisplayValue(newAmount.toString());
  };

  const handleNumpadClick = (digit: string) => {
    setDisplayValue(prev => {
      if (prev === '0' && digit !== '.') {
        return digit;
      }
      if (digit === '.' && prev.includes('.')) {
        return prev;
      }
      return prev + digit;
    });
    setAmount(parseFloat(displayValue === '0' && digit !== '.' ? digit : displayValue + digit) || 0);
  };

  const handleClear = () => {
    setDisplayValue('0');
    setAmount(0);
  };

  const handleBackspace = () => {
    setDisplayValue(prev => {
      const newValue = prev.length > 1 ? prev.slice(0, -1) : '0';
      setAmount(parseFloat(newValue) || 0);
      return newValue;
    });
  };

  const handleAddExpense = () => {
    if (amount > 0) {
      onAddTransaction(amount, 'expense');
      setAmount(0);
      setDisplayValue('0');
    }
  };

  const handleAddIncome = () => {
    if (amount > 0) {
      onAddTransaction(amount, 'income');
      setAmount(0);
      setDisplayValue('0');
    }
  };

  const incrementValues = [1, 5, 10, 25, 50, 100];

  return (
    <ScrollView style={[styles.container, isDark ? styles.darkContainer : styles.lightContainer]}>
      {/* Header */}
      <View style={[styles.header, isDark ? styles.darkHeader : styles.lightHeader]}>
        <TouchableOpacity onPress={onMenuOpen} style={styles.menuButton}>
          <Icon name="menu" size={24} color={isDark ? '#d1d5db' : '#374151'} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, isDark ? styles.darkText : styles.lightText]}>
          Expense Tracker
        </Text>
        
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
            Balance:
          </Text>
          <Text style={[styles.balanceAmount, balance >= 0 ? styles.positiveBalance : styles.negativeBalance]}>
            {currency}{Math.abs(balance).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Amount Display */}
      <View style={styles.amountSection}>
        <Text style={[styles.amountDisplay, isDark ? styles.darkText : styles.lightText]}>
          {currency}{amount.toFixed(2)}
        </Text>
        <Text style={[styles.amountLabel, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
          Tap buttons below to set amount
        </Text>
      </View>

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmountGrid}>
        {incrementValues.map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => handleIncrement(value)}
            style={[styles.quickAmountButton, isDark ? styles.darkButton : styles.lightButton]}
          >
            <Text style={[styles.quickAmountText, isDark ? styles.darkText : styles.lightText]}>
              +{currency}{value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Counter Controls */}
      <View style={styles.counterControls}>
        <TouchableOpacity
          onPress={() => {
            const newAmount = Math.max(0, amount - 1);
            setAmount(newAmount);
            setDisplayValue(newAmount.toString());
          }}
          style={[styles.counterButton, styles.decrementButton]}
        >
          <Icon name="minus" size={24} color="#dc2626" />
        </TouchableOpacity>
        
        <View style={styles.displayContainer}>
          <Text style={[styles.displayValue, isDark ? styles.darkText : styles.lightText]}>
            {displayValue}
          </Text>
          <Text style={[styles.displayLabel, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
            Use numpad below
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={() => {
            const newAmount = amount + 1;
            setAmount(newAmount);
            setDisplayValue(newAmount.toString());
          }}
          style={[styles.counterButton, styles.incrementButton]}
        >
          <Icon name="plus" size={24} color="#16a34a" />
        </TouchableOpacity>
      </View>

      {/* Dialer-style Numpad */}
      <View style={styles.numpadContainer}>
        <View style={styles.numpadGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => handleNumpadClick(num.toString())}
              style={[styles.numpadButton, isDark ? styles.darkButton : styles.lightButton]}
            >
              <Text style={[styles.numpadText, isDark ? styles.darkText : styles.lightText]}>
                {num}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Bottom row: decimal, 0, backspace */}
        <View style={styles.numpadBottomRow}>
          <TouchableOpacity
            onPress={() => handleNumpadClick('.')}
            style={[styles.numpadButton, isDark ? styles.darkButton : styles.lightButton]}
          >
            <Text style={[styles.numpadText, isDark ? styles.darkText : styles.lightText]}>
              .
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleNumpadClick('0')}
            style={[styles.numpadButton, isDark ? styles.darkButton : styles.lightButton]}
          >
            <Text style={[styles.numpadText, isDark ? styles.darkText : styles.lightText]}>
              0
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleBackspace}
            style={[styles.numpadButton, styles.backspaceButton]}
          >
            <Icon name="delete" size={18} color="#ea580c" />
          </TouchableOpacity>
        </View>
        
        {/* Clear button */}
        <TouchableOpacity
          onPress={handleClear}
          style={[styles.clearButton, isDark ? styles.darkClearButton : styles.lightClearButton]}
        >
          <Text style={[styles.clearButtonText, isDark ? styles.darkText : styles.lightText]}>
            Clear
          </Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={handleAddExpense}
          disabled={amount <= 0}
          style={[styles.actionButton, styles.expenseButton, amount <= 0 && styles.disabledButton]}
        >
          <Icon name="minus" size={20} color="white" />
          <Text style={styles.actionButtonText}>Add Expense</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleAddIncome}
          disabled={amount <= 0}
          style={[styles.actionButton, styles.incomeButton, amount <= 0 && styles.disabledButton]}
        >
          <Icon name="plus" size={20} color="white" />
          <Text style={styles.actionButtonText}>Add Income</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Transactions Preview */}
      {transactions.length > 0 && (
        <View style={[styles.recentTransactions, isDark ? styles.darkCard : styles.lightCard]}>
          <View style={styles.recentHeader}>
            <Text style={[styles.recentTitle, isDark ? styles.darkText : styles.lightText]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={onNavigateToHistory}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsList}>
            {transactions.slice(0, 3).map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View>
                  <Text style={[styles.transactionType, isDark ? styles.darkText : styles.lightText]}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </Text>
                  <Text style={[styles.transactionTime, isDark ? styles.darkSecondaryText : styles.lightSecondaryText]}>
                    {transaction.time}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  transaction.type === 'expense' ? styles.expenseAmount : styles.incomeAmount
                ]}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {currency}{transaction.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#f9fafb',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  lightHeader: {
    backgroundColor: '#ffffff',
  },
  darkHeader: {
    backgroundColor: '#1f2937',
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    marginRight: 4,
  },
  balanceAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  positiveBalance: {
    color: '#16a34a',
  },
  negativeBalance: {
    color: '#dc2626',
  },
  amountSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  amountDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 16,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  quickAmountButton: {
    width: '30%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
  },
  lightButton: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
  },
  darkButton: {
    backgroundColor: '#1f2937',
    borderColor: '#4b5563',
  },
  quickAmountText: {
    fontSize: 18,
    fontWeight: '600',
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  counterButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  decrementButton: {
    backgroundColor: '#fef2f2',
  },
  incrementButton: {
    backgroundColor: '#f0fdf4',
  },
  displayContainer: {
    alignItems: 'center',
    marginHorizontal: 32,
  },
  displayValue: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 8,
    minWidth: 128,
  },
  displayLabel: {
    fontSize: 12,
    marginTop: 8,
  },
  numpadContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  numpadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  numpadBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  numpadButton: {
    width: '30%',
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backspaceButton: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  numpadText: {
    fontSize: 20,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  lightClearButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  darkClearButton: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  expenseButton: {
    backgroundColor: '#ef4444',
  },
  incomeButton: {
    backgroundColor: '#22c55e',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentTransactions: {
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  lightCard: {
    backgroundColor: '#ffffff',
  },
  darkCard: {
    backgroundColor: '#1f2937',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionTime: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseAmount: {
    color: '#dc2626',
  },
  incomeAmount: {
    color: '#16a34a',
  },
  lightText: {
    color: '#111827',
  },
  darkText: {
    color: '#ffffff',
  },
  lightSecondaryText: {
    color: '#6b7280',
  },
  darkSecondaryText: {
    color: '#9ca3af',
  },
});

export default CounterInterface;