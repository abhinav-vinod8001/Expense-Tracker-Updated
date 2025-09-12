import React, { useState, useEffect } from 'react';
import { Plus, Minus, Delete } from 'lucide-react';

interface CounterInterfaceProps {
  currency: string;
  onAddTransaction: (amount: number, type: 'expense' | 'income') => void;
}

const CounterInterface: React.FC<CounterInterfaceProps> = ({ currency, onAddTransaction }) => {
  const [amount, setAmount] = useState(0);
  const [displayValue, setDisplayValue] = useState('0');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if user is on mobile device
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleIncrement = (value: number) => {
    const newAmount = Math.max(0, amount + value);
    setAmount(newAmount);
    setDisplayValue(newAmount.toString());
  };

  const handleNumpadClick = (digit: string) => {
    setDisplayValue(prev => {
      if (prev === '0' && digit !== '.') {
        return digit;
      }
      if (digit === '.' && prev.includes('.')) {
        return prev;
      }
      return prev + digit;
    });
    setAmount(parseFloat(displayValue === '0' && digit !== '.' ? digit : displayValue + digit) || 0);
  };

  const handleClear = () => {
    setDisplayValue('0');
    setAmount(0);
  };

  const handleBackspace = () => {
    setDisplayValue(prev => {
      const newValue = prev.length > 1 ? prev.slice(0, -1) : '0';
      setAmount(parseFloat(newValue) || 0);
      return newValue;
    });
  };

  const handleAddExpense = () => {
    if (amount > 0) {
      onAddTransaction(amount, 'expense');
      setAmount(0);
      setDisplayValue('0');
    }
  };

  const handleAddIncome = () => {
    if (amount > 0) {
      onAddTransaction(amount, 'income');
      setAmount(0);
      setDisplayValue('0');
    }
  };

  const incrementValues = [1, 5, 10, 25, 50, 100];

  return (
    <div className="space-y-8 transition-colors duration-300">
      {/* Amount Display */}
      <div className="text-center">
        <div className="text-6xl md:text-8xl font-bold text-gray-800 dark:text-white mb-4">
          {currency}{amount.toFixed(2)}
        </div>
        <p className="text-gray-600 dark:text-gray-400">Tap buttons below to set amount</p>
      </div>

      {/* Quick Amount Buttons */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {incrementValues.map((value) => (
          <button
            key={value}
            onClick={() => handleIncrement(value)}
            className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl p-4 text-center transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              +{currency}{value}
            </span>
          </button>
        ))}
      </div>

      {/* Main Counter Controls */}
      <div className="flex items-center justify-center space-x-8">
        <button
          onClick={() => {
            const newAmount = Math.max(0, amount - 1);
            setAmount(newAmount);
            setDisplayValue(newAmount.toString());
          }}
          className="w-16 h-16 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Minus size={24} />
        </button>
        
        <div className="flex flex-col items-center space-y-2">
          <input
            type="number"
            value={displayValue}
            onChange={(e) => {
              if (!isMobile) {
                const value = e.target.value;
                setDisplayValue(value);
                setAmount(Math.max(0, parseFloat(value) || 0));
              }
            }}
            className="w-32 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2 focus:border-blue-500 focus:outline-none"
            min="0"
            step="0.01"
            readOnly={isMobile}
            inputMode={isMobile ? "none" : "decimal"}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isMobile ? "Use numpad below" : "Type or use numpad"}
          </p>
        </div>
        
        <button
          onClick={() => {
            const newAmount = amount + 1;
            setAmount(newAmount);
            setDisplayValue(newAmount.toString());
          }}
          className="w-16 h-16 bg-green-100 hover:bg-green-200 text-green-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Dialer-style Numpad */}
      <div className="max-w-xs mx-auto">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Numbers 1-9 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumpadClick(num.toString())}
              className="w-16 h-16 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl text-xl font-semibold text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
            >
              {num}
            </button>
          ))}
        </div>
        
        {/* Bottom row: decimal, 0, backspace */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleNumpadClick('.')}
            className="w-16 h-16 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl text-xl font-semibold text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          >
            .
          </button>
          
          <button
            onClick={() => handleNumpadClick('0')}
            className="w-16 h-16 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 rounded-xl text-xl font-semibold text-gray-700 dark:text-gray-300 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
          >
            0
          </button>
          
          <button
            onClick={handleBackspace}
            className="w-16 h-16 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 border-2 border-orange-200 dark:border-orange-700 hover:border-orange-300 dark:hover:border-orange-500 rounded-xl text-orange-600 dark:text-orange-400 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center"
          >
            <Delete size={18} />
          </button>
        </div>
        
        {/* Clear button */}
        <button
          onClick={handleClear}
          className="w-full mt-3 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 rounded-xl text-gray-700 dark:text-gray-300 font-medium transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          Clear
        </button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleAddExpense}
          disabled={amount <= 0}
          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <Minus size={20} />
          <span>Add Expense</span>
        </button>
        
        <button
          onClick={handleAddIncome}
          disabled={amount <= 0}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Income</span>
        </button>
      </div>
    </div>
  );
};

export default CounterInterface;