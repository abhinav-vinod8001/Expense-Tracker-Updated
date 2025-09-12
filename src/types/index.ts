export interface Transaction {
  id: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
  time: string;
  timestamp: number;
}

export interface AppState {
  transactions: Transaction[];
  currency: string;
  balance: number;
  displayCurrency?: string; // Currency for displaying history totals
}

export type Currency = {
  symbol: string;
  code: string;
  name: string;
};