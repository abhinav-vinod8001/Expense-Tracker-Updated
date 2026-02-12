import React from 'react';
import { ArrowLeft, Moon, Sun, DollarSign, Trash2, Bot, Calculator } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ToggleSwitch from './ToggleSwitch';
import { currencyNames } from '../data/exchangeRates';

interface SettingsProps {
  onBack: () => void;
  displayCurrency: string;
  onDisplayCurrencyChange: (currency: string) => void;
  defaultHomeView: string;
  onDefaultHomeViewChange: (view: string) => void;
  persistChat: boolean;
  onPersistChatChange: (persist: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({
  onBack,
  displayCurrency,
  onDisplayCurrencyChange,
  defaultHomeView,
  onDefaultHomeViewChange,
  persistChat,
  onPersistChatChange
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center px-6 py-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Customize how the app looks and feels
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                  {theme === 'light' ? (
                    <Moon size={20} className="text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Sun size={20} className="text-gray-600 dark:text-gray-300" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Dark Mode
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                  </p>
                </div>
              </div>
              <div className="relative">
                <ToggleSwitch
                  isOn={theme === 'dark'}
                  onToggle={toggleTheme}
                />
                {/* Ripple effect container */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${theme === 'dark'
                    ? 'bg-gray-900 w-96 h-96 opacity-100'
                    : 'bg-white w-0 h-0 opacity-0'
                    }`} style={{ zIndex: -1 }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Default Home Screen */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Default Home Screen</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose which interface opens when you launch the app
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onDefaultHomeViewChange('classic')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${defaultHomeView === 'classic'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <div className={`p-3 rounded-lg ${defaultHomeView === 'classic'
                  ? 'bg-blue-100 dark:bg-blue-900/40'
                  : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                  <Calculator size={24} className={defaultHomeView === 'classic' ? 'text-blue-600' : 'text-gray-500 dark:text-gray-400'} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${defaultHomeView === 'classic' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    Classic
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Numpad & buttons</p>
                </div>
                {defaultHomeView === 'classic' && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">Active</span>
                )}
              </button>

              <button
                onClick={() => onDefaultHomeViewChange('chatbot')}
                className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all ${defaultHomeView === 'chatbot'
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <div className={`p-3 rounded-lg ${defaultHomeView === 'chatbot'
                  ? 'bg-purple-100 dark:bg-purple-900/40'
                  : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                  <Bot size={24} className={defaultHomeView === 'chatbot' ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${defaultHomeView === 'chatbot' ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    AI Chatbot
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Chat & voice</p>
                </div>
                {defaultHomeView === 'chatbot' && (
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/40 px-2 py-0.5 rounded-full">Active</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Settings</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your AI chat experience
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg transition-colors duration-300">
                  <Bot size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Persist Chat History
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {persistChat ? 'Keep chat history between sessions' : 'Clear chat history on every login'}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                isOn={persistChat}
                onToggle={() => onPersistChatChange(!persistChat)}
              />
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Transaction History Currency</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose the currency for displaying transaction totals in history
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <DollarSign size={20} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Display Currency
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Current: {currencyNames[displayCurrency] || 'Unknown Currency'}
                </p>
              </div>
            </div>
            <select
              value={displayCurrency}
              onChange={(e) => onDisplayCurrencyChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(currencyNames).map(([symbol, name]) => (
                <option key={symbol} value={symbol}>
                  {symbol} - {name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your local data
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg transition-colors duration-300">
                  <Trash2 size={20} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Clear Chat History
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Delete all AI conversation history
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your chat history? This cannot be undone.')) {
                    localStorage.removeItem('expense_tracker_chat_history');
                    // Optional: Dispatch a custom event if we want other components to know immediately
                    window.dispatchEvent(new Event('chat-history-cleared'));
                    alert('Chat history cleared successfully.');
                  }
                }}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 rounded-lg font-medium transition-colors"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">App Information</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Version</span>
              <span className="font-medium text-gray-900 dark:text-white">2.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Storage</span>
              <span className="font-medium text-gray-900 dark:text-white">Local Browser</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Currency Conversion</span>
              <span className="font-medium text-gray-900 dark:text-white">Real-time Rates</span>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
          <p className="text-sm opacity-90">
            All your financial data is stored locally on your device. We don't collect, store,
            or share any of your personal information or transaction data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;