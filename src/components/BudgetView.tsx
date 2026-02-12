import React from 'react';
import { ArrowLeft, Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Budget, Transaction, CATEGORY_META } from '../types';
import { calculateMonthlySpending } from '../services/budgetService';

interface BudgetViewProps {
    budgets: Budget[];
    transactions: Transaction[];
    currency: string;
    onBack: () => void;
    onDeleteBudget: (id: string) => void; // Need to implement this in App
}

const BudgetView: React.FC<BudgetViewProps> = ({
    budgets,
    transactions,
    currency,
    onBack,
    onDeleteBudget,
}) => {
    const spending = calculateMonthlySpending(transactions);

    const getProgressColor = (percent: number) => {
        if (percent >= 100) return 'bg-red-500';
        if (percent >= 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between px-4 py-3">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                        Monthly Budgets
                    </span>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <Plus size={20} className="text-blue-500" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {budgets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">💰</span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            No Budgets Set
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                            Ask FinMate to "create a budget plan" or add one manually to start tracking.
                        </p>
                    </div>
                ) : (
                    budgets.map((budget) => {
                        const spent = spending[budget.category] || 0;
                        const percent = Math.min(100, Math.max(0, (spent / budget.limit) * 100));
                        const isExceeded = spent > budget.limit;
                        const meta = CATEGORY_META[budget.category];

                        return (
                            <div
                                key={budget.id}
                                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.bgLight} dark:${meta.bgDark}`}>
                                            <span className="text-lg">{meta.emoji}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                                {meta.label}
                                            </h4>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                Monthly Limit: {currency}{budget.limit}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDeleteBudget(budget.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                                    <div
                                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <span className={`font-medium ${isExceeded ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {currency}{spent.toFixed(0)} spent
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                        {Math.max(0, budget.limit - spent).toFixed(0)} remaining
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default BudgetView;
