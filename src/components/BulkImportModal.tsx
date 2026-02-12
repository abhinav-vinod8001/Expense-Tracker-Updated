import React, { useState } from 'react';
import { X, Sparkles, Check, AlertCircle, ArrowRight, Trash2 } from 'lucide-react';
import { parseMessyInput, ExtractedTransaction } from '../services/SmartImport';
import { useTheme } from '../hooks/useTheme';
import { CATEGORY_META, TransactionCategory } from '../types';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (transactions: ExtractedTransaction[]) => void;
    currency: string;
}

const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onImport, currency }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [parsedData, setParsedData] = useState<ExtractedTransaction[]>([]);
    const [step, setStep] = useState<'input' | 'review'>('input');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleProcess = async () => {
        if (!inputText.trim()) return;

        setIsProcessing(true);
        setError(null);
        try {
            const results = await parseMessyInput(inputText);
            if (results.length === 0) {
                setError("Could not find any transactions. Try rephrasing or adding specific amounts.");
            } else {
                setParsedData(results);
                setStep('review');
            }
        } catch (e) {
            setError("Something went wrong with the magic import. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirm = () => {
        onImport(parsedData);
        handleClose();
    };

    const handleClose = () => {
        // Reset state on close
        setStep('input');
        setInputText('');
        setParsedData([]);
        setError(null);
        onClose();
    };

    const removeTransaction = (index: number) => {
        setParsedData(prev => prev.filter((_, i) => i !== index));
        if (parsedData.length <= 1) { // If removing the last one
            setStep('input');
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300`}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-purple-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Magic Bulk Import
                        </h2>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 'input' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Paste any text identifying your spending—SMS logs, email snippets, or just a messy list. The AI will extract the data.
                            </p>

                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder={`Example:\nPaid $12 at Starbucks this morning.\nGroceries 45.50 yesterday.\nSalary credited 2500 on 1st.`}
                                className={`w-full h-48 p-4 rounded-xl border-2 resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${isDark ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                                    }`}
                            />

                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Examples */}
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setInputText("Uber ride 18.50, Coffee 4.00, Lunch 12.99")}
                                    className="px-3 py-1.5 text-xs rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-300 whitespace-nowrap hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors"
                                >
                                    Last 3 expenses
                                </button>
                                <button
                                    onClick={() => setInputText("Utilities 150, Rent 1200, Netflix 15")}
                                    className="px-3 py-1.5 text-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300 whitespace-nowrap hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                >
                                    Monthly Bills
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Found <b>{parsedData.length}</b> transactions. Review them below:
                                </p>
                                <button
                                    onClick={() => setStep('input')}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                                >
                                    Edit Input
                                </button>
                            </div>

                            <div className="space-y-3">
                                {parsedData.map((t, idx) => {
                                    const meta = CATEGORY_META[t.category as TransactionCategory] || CATEGORY_META.other;
                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isDark ? meta.bgDark : meta.bgLight}`}>
                                                    {meta.emoji}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                                                        {t.description}
                                                    </p>
                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                        <span className="capitalize">{t.category}</span>
                                                        <span>•</span>
                                                        <span>{t.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`font-bold ${t.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {t.type === 'expense' ? '-' : '+'}{currency}{t.amount.toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => removeTransaction(idx)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    {step === 'input' ? (
                        <button
                            onClick={handleProcess}
                            disabled={isProcessing || !inputText.trim()}
                            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isProcessing || !inputText.trim()
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <Sparkles className="animate-spin" size={18} /> Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={18} /> Magic Process
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleConfirm}
                            className="w-full py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Check size={18} /> Confirm {parsedData.length} Import{parsedData.length > 1 ? 's' : ''}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkImportModal;
