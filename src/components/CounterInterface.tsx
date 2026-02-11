import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Transaction } from '../types';
import { Menu, Plus, Minus, Delete } from 'lucide-react';

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
  onNavigateToHistory,
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
      if (prev === '0' && digit !== '.') return digit;
      if (digit === '.' && prev.includes('.')) return prev;
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
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-6 py-4 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <button onClick={onMenuOpen} className="p-2">
          <Menu size={24} className={isDark ? 'text-gray-300' : 'text-gray-700'} />
        </button>
        <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Expense Tracker</h1>
        <div className="flex items-center">
          <span className={`text-sm mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Balance:</span>
          <span className={`text-sm font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currency}{Math.abs(balance).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Amount Display */}
      <div className="text-center py-8">
        <p className={`text-6xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {currency}{amount.toFixed(2)}
        </p>
        <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Tap buttons below to set amount
        </p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex flex-wrap justify-between px-6 mb-8 gap-3">
        {incrementValues.map((value) => (
          <button
            key={value}
            onClick={() => handleIncrement(value)}
            className={`w-[30%] py-4 rounded-xl text-center text-lg font-semibold border-2 transition-colors ${isDark
                ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
          >
            +{currency}{value}
          </button>
        ))}
      </div>

      {/* Main Counter Controls */}
      <div className="flex items-center justify-center px-6 mb-8">
        <button
          onClick={() => {
            const newAmount = Math.max(0, amount - 1);
            setAmount(newAmount);
            setDisplayValue(newAmount.toString());
          }}
          className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center shadow-md"
        >
          <Minus size={24} className="text-red-600" />
        </button>

        <div className="text-center mx-8">
          <p className={`text-3xl font-bold px-4 py-2 border-2 rounded-lg min-w-[128px] ${isDark ? 'text-white border-gray-600' : 'text-gray-900 border-gray-200'
            }`}>
            {displayValue}
          </p>
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Use numpad below</p>
        </div>

        <button
          onClick={() => {
            const newAmount = amount + 1;
            setAmount(newAmount);
            setDisplayValue(newAmount.toString());
          }}
          className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center shadow-md"
        >
          <Plus size={24} className="text-green-600" />
        </button>
      </div>

      {/* Numpad */}
      <div className="px-6 mb-8">
        <div className="flex flex-wrap justify-between mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumpadClick(num.toString())}
              className={`w-[30%] h-16 rounded-xl text-xl font-semibold border-2 mb-3 shadow-sm transition-colors ${isDark
                  ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                  : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex justify-between mb-3">
          <button
            onClick={() => handleNumpadClick('.')}
            className={`w-[30%] h-16 rounded-xl text-xl font-semibold border-2 transition-colors ${isDark
                ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
          >
            .
          </button>
          <button
            onClick={() => handleNumpadClick('0')}
            className={`w-[30%] h-16 rounded-xl text-xl font-semibold border-2 transition-colors ${isDark
                ? 'bg-gray-800 border-gray-600 text-white hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-[30%] h-16 rounded-xl flex items-center justify-center border-2 bg-orange-50 border-orange-200"
          >
            <Delete size={18} className="text-orange-600" />
          </button>
        </div>

        <button
          onClick={handleClear}
          className={`w-full py-3 rounded-xl text-base font-medium border-2 transition-colors ${isDark
              ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'
              : 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200'
            }`}
        >
          Clear
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex px-6 mb-8 gap-4">
        <button
          onClick={handleAddExpense}
          disabled={amount <= 0}
          className={`flex-1 flex items-center justify-center py-4 px-8 rounded-xl text-white font-semibold shadow-md transition-colors ${amount > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'
            }`}
        >
          <Minus size={20} className="mr-2" />
          Add Expense
        </button>
        <button
          onClick={handleAddIncome}
          disabled={amount <= 0}
          className={`flex-1 flex items-center justify-center py-4 px-8 rounded-xl text-white font-semibold shadow-md transition-colors ${amount > 0 ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'
            }`}
        >
          <Plus size={20} className="mr-2" />
          Add Income
        </button>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className={`mx-6 mb-6 rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Recent Transactions
            </h3>
            <button onClick={onNavigateToHistory} className="text-blue-500 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 3).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-2">
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {transaction.time}
                  </p>
                </div>
                <p className={`font-bold ${transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {currency}{transaction.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CounterInterface;