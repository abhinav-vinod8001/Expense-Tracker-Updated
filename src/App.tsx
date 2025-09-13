import React, { useState, useCallback } from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
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

const initialState: AppState = {
  transactions: [],
  currency: '$',
  balance: 0,
  displayCurrency: '₹', // Default to INR for history display
};

function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('expenseTracker', initialState);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<string>('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const { theme } = useTheme(); // Initialize theme hook

  const addTransaction = useCallback((amount: number, type: 'expense' | 'income') => {
    const now = new Date();
    const transaction: Transaction = {
      id: Date.now().toString(),
      amount,
      type,
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
    setIsSliding(true);
    
    // Simple, clean transition
    setTimeout(() => {
      setCurrentView(section);
      
      setTimeout(() => {
        setIsTransitioning(false);
        setIsSliding(false);
      }, 300);
    }, 150);
  }, [currentView, isTransitioning]);

  const handleBackToHome = useCallback(() => {
    if (currentView === 'home' || isTransitioning) return;
    
    setIsTransitioning(true);
    setIsSliding(true);
    
    // Clean back transition
    setTimeout(() => {
      setCurrentView('home');
      
      setTimeout(() => {
        setIsTransitioning(false);
        setIsSliding(false);
      }, 300);
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
    <SafeAreaView style={[styles.container, theme === 'dark' ? styles.darkContainer : styles.lightContainer]}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#1f2937' : '#ffffff'}
      />
      {renderCurrentView()}
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleMenuNavigate}
      />
    </SafeAreaView>
  );
}

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
});

export default App;