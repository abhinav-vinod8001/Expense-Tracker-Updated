import React from 'react';
import { Menu, Moon, Sun, Sparkles, LayoutGrid } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface NavBarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    onMenuOpen: () => void;
    balance: number;
    currency: string;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate, onMenuOpen, balance, currency }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const isAiMode = currentView === 'chatbot';

    return (
        <div className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
            }`}>
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Left: Menu Trigger */}
                <button
                    onClick={onMenuOpen}
                    className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                        }`}
                >
                    <Menu size={24} />
                </button>

                {/* Center: FinMate Branding */}
                <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 animate-pulse"></div>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg text-white font-bold`}>
                            FM
                        </div>
                    </div>
                    <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                        FinMate
                    </span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Balance Display */}
                    <div className={`hidden sm:flex flex-col items-end mr-2 px-3 py-1 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/80'}`}>
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Balance
                        </span>
                        <span className={`text-sm font-bold ${balance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {currency}{balance.toFixed(2)}
                        </span>
                    </div>

                    {/* Mode Toggle */}
                    <div className={`hidden md:flex items-center p-1 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                        }`}>
                        <button
                            onClick={() => onNavigate('home')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${!isAiMode
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <LayoutGrid size={14} /> Classic
                        </button>
                        <button
                            onClick={() => onNavigate('chatbot')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${isAiMode
                                ? 'bg-white dark:bg-gray-700 shadow-sm text-purple-600 dark:text-purple-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <Sparkles size={14} /> AI Chat
                        </button>
                    </div>

                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-yellow-400' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NavBar;
