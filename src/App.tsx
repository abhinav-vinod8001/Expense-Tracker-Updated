import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { Transaction, AppState } from './types';
import Menu from './components/Menu';
import CounterInterface from './components/CounterInterface';
import CurrencySelector from './components/CurrencySelector';
import History from './components/History';
import AboutUs from './components/AboutUs';
import Recommendations from './components/Recommendations';
import Settings from './components/Settings';
import ChatBot from './components/ChatBot';

const initialState: AppState = {
  transactions: [],
  currency: '$',
  balance: 0,
  displayCurrency: '₹',
};

function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('expenseTracker', initialState);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme } = useTheme();

  const addTransaction = useCallback((amount: number, type: 'expense' | 'income', category?: string, description?: string) => {
    const now = new Date();
    const transaction: Transaction = {
      id: Date.now().toString(),
      amount,
      type,
      category: (category as any) || undefined,
      description: description || undefined,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      timestamp: now.getTime(),
    };

    setAppState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions],
      balance: type === 'expense'
        ? prev.balance - amount
        : prev.balance + amount,
    }));
  }, [setAppState]);

  const handleCurrencyChange = useCallback((currency: string) => {
    setAppState(prev => ({ ...prev, currency }));
  }, [setAppState]);

  const handleDisplayCurrencyChange = useCallback((displayCurrency: string) => {
    setAppState(prev => ({ ...prev, displayCurrency }));
  }, [setAppState]);

  const handleMenuNavigate = useCallback((section: string) => {
    if (currentView === section || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(section);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  }, [currentView, isTransitioning]);

  const handleBackToHome = useCallback(() => {
    if (currentView === 'home' || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('home');
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  }, [currentView, isTransitioning]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setAppState(prev => {
      const transactionToDelete = prev.transactions.find(t => t.id === id);
      if (!transactionToDelete) return prev;
      const newBalance = transactionToDelete.type === 'expense'
        ? prev.balance + transactionToDelete.amount
        : prev.balance - transactionToDelete.amount;
      return {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id),
        balance: newBalance,
      };
    });
  }, [setAppState]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'currency':
        return (
          <CurrencySelector
            selectedCurrency={appState.currency}
            onSelect={handleCurrencyChange}
            onBack={handleBackToHome}
          />
        );
      case 'history':
        return (
          <History
            transactions={appState.transactions}
            currency={appState.currency}
            displayCurrency={appState.displayCurrency || '₹'}
            onBack={handleBackToHome}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'about':
        return <AboutUs onBack={handleBackToHome} />;
      case 'recommendations':
        return (
          <Recommendations
            transactions={appState.transactions}
            currency={appState.currency}
            onBack={handleBackToHome}
          />
        );
      case 'settings':
        return (
          <Settings
            onBack={handleBackToHome}
            displayCurrency={appState.displayCurrency || '₹'}
            onDisplayCurrencyChange={handleDisplayCurrencyChange}
          />
        );
      case 'chatbot':
        return (
          <ChatBot
            currency={appState.currency}
            balance={appState.balance}
            transactions={appState.transactions}
            onAddTransaction={addTransaction}
            onBack={handleBackToHome}
          />
        );
      default:
        return (
          <CounterInterface
            currency={appState.currency}
            onAddTransaction={addTransaction}
            balance={appState.balance}
            transactions={appState.transactions}
            onMenuOpen={() => setIsMenuOpen(true)}
            onNavigateToHistory={() => handleMenuNavigate('history')}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {renderCurrentView()}
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleMenuNavigate}
      />
    </div>
  );
}

export default App;