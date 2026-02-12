import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { ArrowLeft, MessageCircle, DollarSign, Clock, Info, TrendingUp, Settings, X, ShieldCheck, LayoutGrid, Sparkles } from 'lucide-react';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

const menuItems = [
  { id: 'chatbot', label: 'AI Chat', icon: MessageCircle, description: 'Track expenses with AI chat & voice' },
  { id: 'home', label: 'Classic View', icon: LayoutGrid, description: 'Standard expense tracking interface' },
  { id: 'import', label: 'Magic Import', icon: Sparkles, description: 'Parse text into transactions' },
  { id: 'currency', label: 'Currency Selection', icon: DollarSign, description: 'Choose your preferred currency' },
  { id: 'history', label: 'Transaction History', icon: Clock, description: 'View all your transactions' },
  { id: 'budgets', label: 'Monthly Budgets', icon: TrendingUp, description: 'Manage spending limits' },
  { id: 'dashboard', label: 'Financial Health', icon: ShieldCheck, description: 'Score, subscriptions & insights' },
  { id: 'about', label: 'About Us', icon: Info, description: 'Learn about the app' },
  { id: 'recommendations', label: 'Recommendations', icon: TrendingUp, description: 'Get spending insights' },
];

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimating(true));
      });
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Menu Panel — slides from left */}
      <div
        className={`w-80 h-full flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${animating ? 'translate-x-0' : '-translate-x-full'
          } ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-blue-500">
          <h2 className="text-xl font-bold text-white">FinMate</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center px-6 py-4 text-left transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                  }`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                  <IconComponent size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                </div>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => handleItemClick('settings')}
            className={`w-full flex items-center px-6 py-4 text-left transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
              }`}
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
              <Settings size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>App preferences and theme</p>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            FinMate v2.0
          </p>
        </div>
      </div>

      {/* Backdrop — right of the panel, fades in */}
      <div
        className={`flex-1 transition-opacity duration-300 ${animating ? 'bg-black/50 backdrop-blur-sm opacity-100' : 'bg-black/50 backdrop-blur-sm opacity-0'
          }`}
        onClick={onClose}
      />
    </div>
  );
};

export default Menu;