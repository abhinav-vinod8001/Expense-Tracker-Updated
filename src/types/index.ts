export type TransactionCategory =
  | 'food' | 'transport' | 'shopping' | 'bills'
  | 'entertainment' | 'health' | 'education'
  | 'salary' | 'freelance' | 'investment'
  | 'housing' | 'other';

export const CATEGORY_META: Record<TransactionCategory, { emoji: string; label: string; color: string; bgLight: string; bgDark: string }> = {
  food: { emoji: '🍔', label: 'Food & Dining', color: 'text-orange-600', bgLight: 'bg-orange-100', bgDark: 'bg-orange-900/20' },
  transport: { emoji: '🚗', label: 'Transport', color: 'text-blue-600', bgLight: 'bg-blue-100', bgDark: 'bg-blue-900/20' },
  shopping: { emoji: '🛍️', label: 'Shopping', color: 'text-pink-600', bgLight: 'bg-pink-100', bgDark: 'bg-pink-900/20' },
  bills: { emoji: '🧾', label: 'Bills & Utilities', color: 'text-yellow-600', bgLight: 'bg-yellow-100', bgDark: 'bg-yellow-900/20' },
  entertainment: { emoji: '🎬', label: 'Entertainment', color: 'text-purple-600', bgLight: 'bg-purple-100', bgDark: 'bg-purple-900/20' },
  health: { emoji: '💊', label: 'Health', color: 'text-red-600', bgLight: 'bg-red-100', bgDark: 'bg-red-900/20' },
  education: { emoji: '📚', label: 'Education', color: 'text-indigo-600', bgLight: 'bg-indigo-100', bgDark: 'bg-indigo-900/20' },
  salary: { emoji: '💼', label: 'Salary', color: 'text-green-600', bgLight: 'bg-green-100', bgDark: 'bg-green-900/20' },
  freelance: { emoji: '💻', label: 'Freelance', color: 'text-teal-600', bgLight: 'bg-teal-100', bgDark: 'bg-teal-900/20' },
  investment: { emoji: '📈', label: 'Investment', color: 'text-emerald-600', bgLight: 'bg-emerald-100', bgDark: 'bg-emerald-900/20' },
  housing: { emoji: '🏠', label: 'Housing', color: 'text-amber-600', bgLight: 'bg-amber-100', bgDark: 'bg-amber-900/20' },
  other: { emoji: '📌', label: 'Other', color: 'text-gray-600', bgLight: 'bg-gray-100', bgDark: 'bg-gray-900/20' },
};

export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  category?: TransactionCategory;
  description?: string;
  date: string;
  time: string;
  timestamp: number;
}

export interface AppState {
  transactions: Transaction[];
  currency: string;
  balance: number;
  displayCurrency?: string;
}

export type Currency = {
  symbol: string;
  code: string;
  name: string;
};