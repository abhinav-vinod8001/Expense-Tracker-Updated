import React from 'react';
import { ArrowLeft, Moon, Sun, DollarSign } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import ToggleSwitch from './ToggleSwitch';
import { currencyNames } from '../data/exchangeRates';

interface SettingsProps {
  onBack: () => void;
  displayCurrency: string;
  onDisplayCurrencyChange: (currency: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack, displayCurrency, onDisplayCurrencyChange }) => {
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
                  <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-900 w-96 h-96 opacity-100' 
                      : 'bg-white w-0 h-0 opacity-0'
                  }`} style={{ zIndex: -1 }} />
                </div>
              </div>
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