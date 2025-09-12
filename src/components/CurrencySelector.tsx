import React from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { currencies } from '../data/currencies';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onSelect: (currency: string) => void;
  onBack: () => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  selectedCurrency,
  onSelect,
  onBack,
}) => {
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
          <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Select Currency</h1>
        </div>
      </div>

      {/* Currency List */}
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          {currencies.map((currency, index) => (
            <button
              key={currency.code}
              onClick={() => onSelect(currency.symbol)}
              className={`w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                index !== currencies.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  {currency.symbol}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{currency.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{currency.code}</p>
                </div>
              </div>
              {selectedCurrency === currency.symbol && (
                <Check size={20} className="text-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencySelector;