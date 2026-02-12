import React, { useEffect, useState } from 'react';
import { X, TrendingUp, AlertTriangle, CheckCircle, CreditCard, ShieldCheck, Sparkles as SparklesIcon } from 'lucide-react';
import { useAutonomousFinance } from '../hooks/useAutonomousFinance';
import { Transaction, CATEGORY_META } from '../types';
import { PredictionEngine } from '../services/PredictionEngine';

interface DashboardOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    transactions: Transaction[];
    currency: string;
}

const DashboardOverlay: React.FC<DashboardOverlayProps> = ({ isOpen, onClose, transactions, currency }) => {
    const { subscriptions, health, loading } = useAutonomousFinance(transactions);
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [predictionDays, setPredictionDays] = useState(30);

    // Animation logic
    useEffect(() => {
        if (isOpen) {
            setVisible(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setAnimating(true));
            });
        } else {
            setAnimating(false);
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Cleanup prediction days on close
    useEffect(() => {
        if (!isOpen) setPredictionDays(30);
    }, [isOpen]);

    if (!visible) return null;

    // Health Score Color
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-500';
        if (score >= 50) return 'text-amber-500';
        return 'text-red-500';
    };

    // Calculate Prediction
    const currentBalance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    const prediction = health ? PredictionEngine.predictFutureBalance(
        currentBalance,
        transactions,
        subscriptions,
        predictionDays
    ) : null;

    // SVG Circle
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = health ? circumference - (health.score / 100) * circumference : circumference;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animating ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className={`relative w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 ease-out border border-white/20 ${animating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}`}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-blue-600 dark:text-blue-400" size={24} />
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Financial Health
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">

                    {/* 1. Health Score Card */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="flex flex-col items-center">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                                    <circle
                                        cx="60" cy="60" r={radius}
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                        className="dark:stroke-gray-700"
                                    />
                                    <circle
                                        cx="60" cy="60" r={radius}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        strokeLinecap="round"
                                        className={`transition-all duration-1000 ease-out ${health ? getScoreColor(health.score) : 'text-gray-300'}`}
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className={`text-4xl font-bold ${health ? getScoreColor(health.score) : 'text-gray-400'}`}>
                                        {health ? health.score : '-'}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Score</span>
                                </div>
                            </div>

                            <div className="text-center mt-4">
                                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                    {health?.status || 'Analyzing...'}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {health?.insights[0] || "We're calibrating your financial data..."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 1.5 Future Crystal Ball */}
                    {health && (
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white relative overflow-hidden ring-1 ring-white/10 shadow-xl">
                            {/* Background Effects */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <SparklesIcon className="text-purple-300" size={20} />
                                    <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-white">
                                        Future Crystal Ball
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Result Display */}
                                    <div className="text-center space-y-2">
                                        <p className="text-purple-200 text-sm font-medium">
                                            In {predictionDays} days, your balance will be:
                                        </p>
                                        <div className={`text-4xl font-bold tracking-tight transition-all duration-500 ${prediction?.riskLevel === 'high' ? 'text-red-400' :
                                                prediction?.riskLevel === 'medium' ? 'text-amber-300' : 'text-emerald-300'
                                            }`}>
                                            {currency}{prediction?.predictedBalance.toFixed(2) || '---'}
                                        </div>
                                        <p className="text-xs text-indigo-200/80 max-w-[280px] mx-auto leading-relaxed">
                                            {prediction?.analysis || "Gathering enough data to predict..."}
                                        </p>
                                    </div>

                                    {/* Slider Control */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-xs text-indigo-300 font-medium px-1">
                                            <span>7 Days</span>
                                            <span>14 Days</span>
                                            <span>30 Days</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="7"
                                            max="30"
                                            value={predictionDays}
                                            onChange={(e) => setPredictionDays(parseInt(e.target.value))}
                                            className="w-full h-2 bg-indigo-950/50 rounded-lg appearance-none cursor-pointer accent-purple-400 hover:accent-purple-300 transition-all"
                                        />
                                        <div className="flex justify-center">
                                            <span className="bg-purple-500/20 text-purple-200 text-[10px] font-bold px-2 py-1 rounded-full border border-purple-500/30">
                                                {predictionDays} DAYS INTO THE FUTURE
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Subscriptions */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <TrendingUp size={14} /> Recurring & Subscriptions
                        </h3>

                        {loading ? (
                            <div className="space-y-3">
                                {[1, 2].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />)}
                            </div>
                        ) : subscriptions.length === 0 ? (
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-sm text-gray-500">No subscriptions detected yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {subscriptions.map(sub => (
                                    <div key={sub.id} className="group relative bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:border-blue-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${sub.status === 'missed' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                                {sub.status === 'missed' ? <AlertTriangle size={14} /> : <CreditCard size={14} />}
                                            </div>
                                            <div>
                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    {sub.name}
                                                    {sub.status === 'missed' && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full uppercase font-bold">Overdue</span>}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    ~{currency}{sub.amount.toFixed(0)} / month
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 3. Category Breakdown (Stacked) */}
                    {health && health.needsRatio > 0 && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                Expense Structure
                            </h3>
                            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                                <div
                                    style={{ width: `${Math.min(100, health.needsRatio)}%` }}
                                    className="h-full bg-blue-500"
                                />
                                <div
                                    style={{ width: `${Math.min(100, health.wantsRatio)}%` }}
                                    className="h-full bg-purple-500"
                                />
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    Needs ({health.needsRatio.toFixed(0)}%)
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                    Wants ({health.wantsRatio.toFixed(0)}%)
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700" />
                                    Savings ({health.savingsRate.toFixed(0)}%)
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default DashboardOverlay;
