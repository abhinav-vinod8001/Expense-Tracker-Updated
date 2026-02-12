import React from 'react';
import { Menu, Moon, Sun, Sparkles, LayoutGrid } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface NavBarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    onMenuOpen: () => void;
    balance: number;
    currency: string;
    onImportClick: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ currentView, onNavigate, onMenuOpen, balance, currency, onImportClick }) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const isAiMode = currentView === 'chatbot';

    return (
        <div className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
            }`}>
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">

                {/* Left: Menu & Branding */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuOpen}
                        className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                            }`}
                    >
                        <Menu size={24} />
                    </button>

                    {/* FinMate Branding */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="FinMate"
                            className="h-10 w-auto object-contain hover:scale-105 transition-transform duration-300"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight font-sans">
                            FinMate
                        </span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Magic Import Button (Visible on md+) */}
                    <button
                        onClick={onImportClick}
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-200 dark:border-purple-800 transition-all hover:scale-105"
                    >
                        <Sparkles size={14} /> Import
                    </button>

                    {/* Balance Display - Visible on all screens now */}
                    <div className={`flex flex-col items-end mr-2 px-3 py-1 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50/80'}`}>
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
