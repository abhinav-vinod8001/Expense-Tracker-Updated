import React, { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { Transaction } from '../types';
import { convertCurrency, formatCurrency, currencyNames } from '../data/exchangeRates';

interface HistoryProps {
  transactions: Transaction[];
  currency: string;
  displayCurrency: string;
  onBack: () => void;
  onDeleteTransaction: (id: string) => void;
}

const History: React.FC<HistoryProps> = ({ transactions, currency, displayCurrency, onBack, onDeleteTransaction }) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const months = useMemo(() => {
    const monthSet = new Set<string>();
    transactions.forEach((transaction) => {
      const date = new Date(transaction.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(monthKey);
    });
    return Array.from(monthSet).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const date = new Date(transaction.timestamp);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [transactions, selectedMonth]);

  const monthlyStats = useMemo(() => {
    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + convertCurrency(t.amount, currency, displayCurrency), 0);
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + convertCurrency(t.amount, currency, displayCurrency), 0);

    return { totalExpenses, totalIncome, net: totalIncome - totalExpenses };
  }, [filteredTransactions, currency, displayCurrency]);

  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="flex items-center px-6 py-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Month Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar size={20} className="text-gray-600 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Month</h2>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {months.map((month) => (
              <option key={month} value={month}>
                {formatMonthName(month)}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Summary */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white mb-4">
          <div className="flex items-center justify-center space-x-2">
            <DollarSign size={20} />
            <p className="text-sm font-medium">All amounts converted to {currencyNames[displayCurrency] || 'Selected Currency'}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(monthlyStats.totalExpenses, displayCurrency)}
                </p>
              </div>
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(monthlyStats.totalIncome, displayCurrency)}
                </p>
              </div>
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Balance</p>
                <p className={`text-2xl font-bold ${monthlyStats.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(monthlyStats.net), displayCurrency)}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${monthlyStats.net >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {monthlyStats.net >= 0 ? (
                  <TrendingUp className="text-green-600" size={20} />
                ) : (
                  <TrendingDown className="text-red-600" size={20} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transactions ({filteredTransactions.length})
            </h2>
          </div>
          
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No transactions found for this month</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-6 flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.type === 'expense' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.type === 'expense' ? (
                        <TrendingDown size={20} />
                      ) : (
                        <TrendingUp size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white capitalize">
                        {transaction.type}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.date} at {transaction.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'expense' ? '-' : '+'}
                        {formatCurrency(convertCurrency(transaction.amount, currency, displayCurrency), displayCurrency)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Original: {currency}{transaction.amount.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteTransaction(transaction.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Delete transaction"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;