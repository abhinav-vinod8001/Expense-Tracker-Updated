import React, { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import { Transaction, AppState, Budget } from './types';
import Menu from './components/Menu';
import CounterInterface from './components/CounterInterface';
import CurrencySelector from './components/CurrencySelector';
import History from './components/History';
import AboutUs from './components/AboutUs';
import Recommendations from './components/Recommendations';
import Settings from './components/Settings';
import ChatBot from './components/ChatBot';
import BudgetView from './components/BudgetView';
import DashboardOverlay from './components/DashboardOverlay';
import NavBar from './components/NavBar';

const initialState: AppState = {
  transactions: [],
  budgets: [],
  currency: '$',
  balance: 0,
  displayCurrency: '₹',
};

function App() {
  const [appState, setAppState] = useLocalStorage<AppState>('expenseTracker', initialState);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [defaultHomeView, setDefaultHomeView] = useState<string>(() => {
    return localStorage.getItem('expense_tracker_default_view') || 'classic';
  });
  const [currentView, setCurrentView] = useState<string>(() => {
    const saved = localStorage.getItem('expense_tracker_default_view');
    return saved === 'chatbot' ? 'chatbot' : 'home';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { theme } = useTheme();

  const [persistChat, setPersistChat] = useLocalStorage<boolean>('expense_tracker_persist_chat', true);

  // Initialize budgets if not present (ensure it's an array)
  useEffect(() => {
    if (!appState.budgets) {
      setAppState(prev => ({ ...prev, budgets: [] }));
    }
  }, [appState.budgets, setAppState]);

  const handleSetDefaultView = useCallback((view: string) => {
    setDefaultHomeView(view);
    localStorage.setItem('expense_tracker_default_view', view);
  }, []);

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

  const handleMenuNavigate = (section: string) => {
    if (section === 'dashboard') {
      setIsDashboardOpen(true);
    } else {
      if (currentView === section || isTransitioning) return; // Keep transition logic for non-dashboard views
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView(section);
        setTimeout(() => setIsTransitioning(false), 300);
      }, 150);
    }
    setIsMenuOpen(false);
  };

  const handleBackToHome = useCallback(() => {
    const homeView = localStorage.getItem('expense_tracker_default_view') === 'chatbot' ? 'chatbot' : 'home';
    if (currentView === homeView || isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(homeView);
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

  const handleSetBudget = useCallback((category: string, amount: number) => {
    setAppState(prev => {
      const currentBudgets = prev.budgets || [];
      const filtered = currentBudgets.filter(b => b.category !== category);
      const newBudget: Budget = {
        id: Date.now().toString(),
        category: category as any,
        limit: amount,
        period: 'monthly'
      };
      return { ...prev, budgets: [...filtered, newBudget] };
    });
  }, [setAppState]);

  const handleDeleteBudget = useCallback((id: string) => {
    setAppState(prev => ({
      ...prev,
      budgets: (prev.budgets || []).filter(b => b.id !== id)
    }));
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
            defaultHomeView={defaultHomeView}
            onDefaultHomeViewChange={handleSetDefaultView}
            persistChat={persistChat}
            onPersistChatChange={setPersistChat}
          />
        );
      case 'budgets':
        return (
          <BudgetView
            budgets={appState.budgets || []}
            transactions={appState.transactions}
            currency={appState.currency}
            onBack={handleBackToHome}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case 'chatbot':
        return (
          <ChatBot
            currency={appState.currency}
            balance={appState.balance}
            transactions={appState.transactions}
            budgets={appState.budgets || []}
            onAddTransaction={addTransaction}
            onSetBudget={handleSetBudget}
            onBack={handleBackToHome}
            onSwitchToClassic={() => handleMenuNavigate('home')}
            onMenuOpen={() => setIsMenuOpen(true)}
            persistChat={persistChat}
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
            onSwitchToChat={() => handleMenuNavigate('chatbot')}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <NavBar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          setIsMenuOpen(false);
        }}
        onMenuOpen={() => setIsMenuOpen(true)}
        balance={appState.balance}
        currency={appState.currency}
      />

      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {renderCurrentView()}
      </div>
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleMenuNavigate}
      />

      <DashboardOverlay
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        transactions={appState.transactions}
        currency={appState.currency}
      />
    </div>
  );
}

export default App;