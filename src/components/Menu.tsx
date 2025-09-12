import React from 'react';
import { X, DollarSign, History, Info, TrendingUp, Settings as SettingsIcon } from 'lucide-react';

interface MenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

const Menu: React.FC<MenuProps> = ({ isOpen, onClose, onNavigate }) => {

  const menuItems = [
    { id: 'currency', label: 'Currency Selection', icon: DollarSign, description: 'Choose your preferred currency' },
    { id: 'history', label: 'Transaction History', icon: History, description: 'View all your transactions' },
    { id: 'about', label: 'About Us', icon: Info, description: 'Learn about the app' },
    { id: 'recommendations', label: 'Recommendations', icon: TrendingUp, description: 'Get spending insights' },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto py-4 dark:bg-gray-900">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-4 group"
                >
                  <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                    <Icon size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{item.label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleItemClick('settings')}
              className="w-full px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center space-x-4 group"
            >
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <SettingsIcon size={20} className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">App preferences and theme</p>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 dark:bg-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Expense Tracker v2.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;