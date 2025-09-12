import { useState, useCallback } from 'react';
import { Menu as MenuIcon } from 'lucide-react';
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
  useTheme(); // Initialize theme hook

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
  const getAnimationClasses = () => {
    if (isSliding) {
      return 'transform translate-x-full opacity-0 transition-all duration-300 ease-out';
    }
    return 'transform translate-x-0 opacity-100 transition-all duration-300 ease-out';
  };


  const renderCurrentView = () => {
    const content = (() => {
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
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="relative bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
              <div className="flex items-center justify-between px-6 py-4">
                <button
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <MenuIcon size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
                
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Expense Tracker</h1>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Balance:</span>
                  <span className={`font-bold ${appState.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {appState.currency}{Math.abs(appState.balance).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="p-6">
              <div className="max-w-2xl mx-auto">
                <CounterInterface
                  currency={appState.currency}
                  onAddTransaction={addTransaction}
                />
              </div>
            </div>

            {/* Recent Transactions Preview */}
            {appState.transactions.length > 0 && (
              <div className="p-6">
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                      <button
                        onClick={() => handleMenuNavigate('history')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {appState.transactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between py-2">
                          <div>
                            <span className="capitalize text-gray-900 dark:text-white font-medium">
                              {transaction.type}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                              {transaction.time}
                            </span>
                          </div>
                          <span className={`font-bold ${
                            transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.type === 'expense' ? '-' : '+'}
                            {appState.currency}{transaction.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
    })();
    
    return (
      <div className="relative min-h-screen">
        <div className={`${getAnimationClasses()}`}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderCurrentView()}
      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={handleMenuNavigate}
      />
    </>
  );
}

export default App;