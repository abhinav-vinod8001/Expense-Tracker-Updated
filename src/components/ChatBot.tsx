import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Mic, MicOff, Bot, X, HelpCircle, Wallet, PlusCircle, MinusCircle, BarChart3, Undo2, Calculator, Menu } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Transaction, Budget, TransactionCategory, CATEGORY_META, BudgetPlanItem } from '../types';
import {
    ChatMessage,
    ParsedTransaction,
    parseTransaction,
    isBalanceQuery,
    isHelpRequest,
    isAnalyticsQuery,
    isUndoRequest,
    isConfirmation,
    isDenial,
    isAmbiguousAmount,
    generateTransactionResponse,
    generateBalanceResponse,
    generateHelpResponse,
    generateSmartResponse,
    generateAmbiguousResponse,
    generateUndoResponse,
    generateAnalyticsResponse,
    parseMultipleTransactions,
    generateSmartInsight,
} from '../services/chatService';
import { detectCategory } from '../services/categoryDetector';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatBotProps {
    currency: string;
    balance: number;
    transactions: Transaction[];
    budgets: Budget[];
    onAddTransaction: (amount: number, type: 'expense' | 'income', category?: string, description?: string) => void;
    onSetBudget: (category: string, amount: number) => void;
    onBack: () => void;
    onSwitchToClassic?: () => void;
    onMenuOpen?: () => void;
    persistChat: boolean;
}

interface ConversationContext {
    pendingAmount?: number;
    lastTransaction?: ParsedTransaction;
    lastTransactionId?: string;
    awaitingType?: boolean; // waiting for expense/income clarification
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HERO_ACTIONS = [
    { label: 'Add Expense', message: 'I want to add an expense', icon: MinusCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
    { label: 'Check Balance', message: 'What is my balance?', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
    { label: 'Spending Analytics', message: 'Show my spending breakdown', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    { label: 'Savings Tips', message: 'Give me tips to save money', icon: HelpCircle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20' },
];

// ─── SpeechRecognition type ─────────────────────────────────────────────────

interface SpeechRecognitionEvent {
    results: { [index: number]: { [index: number]: { transcript: string } } };
}

// ─── Component ──────────────────────────────────────────────────────────────

const ChatBot: React.FC<ChatBotProps> = ({
    currency,
    balance,
    transactions,
    onAddTransaction,
    onBack,
    onSwitchToClassic,
    onMenuOpen,
    onSetBudget,
    persistChat,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(balance);
    const [context, setContext] = useState<ConversationContext>({});
    const [liveTranscript, setLiveTranscript] = useState('');
    const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
    const [typingStatus, setTypingStatus] = useState('✨ Processing...');
    const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    // Load history or initialize with greeting
    useEffect(() => {
        if (!persistChat) {
            localStorage.removeItem('expense_tracker_chat_history');
            setMessages([]);
            return;
        }

        const savedHistory = localStorage.getItem('expense_tracker_chat_history');
        if (savedHistory) {
            try {
                const parsed = JSON.parse(savedHistory);
                setMessages(parsed);
                // Scroll to bottom after loading
                setTimeout(() => scrollToBottom(), 100);
            } catch (e) {
                console.error('Failed to parse chat history', e);
                // Fallback to greeting
                initGreeting();
            }
        } else {
            initGreeting();
        }
    }, []);

    // Save history whenever messages change
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('expense_tracker_chat_history', JSON.stringify(messages));
        }
    }, [messages]);

    const initGreeting = () => {
        // No initial greeting message in chat history allowing Hero View to show
        setMessages([]);
    };

    useEffect(() => {
        setCurrentBalance(balance);
    }, [balance]);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 50);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, scrollToBottom]);

    // ─── Add message with animation ─────────────────────────────────────────

    const addMessage = useCallback((msg: ChatMessage) => {
        setMessages(prev => [...prev, msg]);
        setAnimatingIds(prev => new Set(prev).add(msg.id));
        setTimeout(() => {
            setAnimatingIds(prev => {
                const next = new Set(prev);
                next.delete(msg.id);
                return next;
            });
        }, 400);
    }, []);

    // ─── Core message handler ───────────────────────────────────────────────

    const handleSend = useCallback(
        (text?: string) => {
            const messageText = (text || inputText).trim();
            if (!messageText) return;

            const userMessage: ChatMessage = {
                id: Date.now().toString(),
                text: messageText,
                sender: 'user',
                timestamp: Date.now(),
            };
            addMessage(userMessage);
            setInputText('');
            setIsTyping(true);

            const delay = 500 + Math.random() * 600;
            setTimeout(async () => {
                setIsTyping(false);

                let botText: string;
                let botTransaction: ParsedTransaction | undefined;
                let isCard = false;

                // ─── Context-aware responses ─────────────────────────────

                let budgetPlan: BudgetPlanItem[] | undefined;

                // Awaiting expense/income clarification
                if (context.awaitingType && context.pendingAmount) {
                    const lower = messageText.toLowerCase();
                    if (lower.includes('expense') || lower.includes('spent') || isConfirmation(lower)) {
                        const { category } = detectCategory(lower);
                        const parsed: ParsedTransaction = {
                            amount: context.pendingAmount,
                            type: 'expense',
                            category,
                        };
                        onAddTransaction(parsed.amount, 'expense', parsed.category);
                        const newBal = currentBalance - parsed.amount;
                        setCurrentBalance(newBal);
                        botText = generateTransactionResponse(parsed, currency, newBal);
                        const insight = generateSmartInsight(parsed, transactions, currency, newBal);
                        if (insight) botText += insight;
                        botTransaction = parsed;
                        isCard = true;
                        setContext({ lastTransaction: parsed, lastTransactionId: Date.now().toString() });
                        setDynamicSuggestions(['Show my spending', 'Add another expense', 'Tips to save']);
                    } else if (lower.includes('income') || lower.includes('earn') || lower.includes('receiv')) {
                        const { category } = detectCategory(lower);
                        const parsed: ParsedTransaction = {
                            amount: context.pendingAmount,
                            type: 'income',
                            category: category === 'other' ? 'salary' : category,
                        };
                        onAddTransaction(parsed.amount, 'income', parsed.category);
                        const newBal = currentBalance + parsed.amount;
                        setCurrentBalance(newBal);
                        botText = generateTransactionResponse(parsed, currency, newBal);
                        const incomeInsight = generateSmartInsight(parsed, transactions, currency, newBal);
                        if (incomeInsight) botText += incomeInsight;
                        botTransaction = parsed;
                        isCard = true;
                        setContext({ lastTransaction: parsed, lastTransactionId: Date.now().toString() });
                        setDynamicSuggestions(['Show my balance', 'Add an expense', 'How much did I save?']);
                    } else if (isDenial(messageText)) {
                        botText = '👍 No problem! Cancelled. What else would you like to do?';
                        setContext({});
                    } else {
                        botText = `Please reply with *"expense"* or *"income"* for the ${currency}${context.pendingAmount.toFixed(2)}, or say *"cancel"* to discard.`;
                    }
                }
                // Undo request
                else if (isUndoRequest(messageText)) {
                    if (transactions.length > 0) {
                        const lastTxn = transactions[0]; // most recent
                        const newBal = lastTxn.type === 'expense'
                            ? currentBalance + lastTxn.amount
                            : currentBalance - lastTxn.amount;
                        setCurrentBalance(newBal);
                        // We can't actually delete from here — simulate by adding reverse
                        onAddTransaction(
                            lastTxn.amount,
                            lastTxn.type === 'expense' ? 'income' : 'expense',
                            lastTxn.category,
                            `Undo: ${lastTxn.description || lastTxn.type}`
                        );
                        botText = generateUndoResponse(lastTxn, currency, newBal);
                        setContext({});
                    } else {
                        botText = '📭 No transactions to undo!';
                    }
                }
                // Help
                else if (isHelpRequest(messageText)) {
                    botText = generateHelpResponse();
                    setContext({});
                    setDynamicSuggestions(['Add expense', 'Show balance', 'Spending breakdown']);
                }
                // Balance query
                else if (isBalanceQuery(messageText)) {
                    setTypingStatus('📊 Crunching numbers...');
                    botText = generateBalanceResponse(currency, currentBalance, transactions);
                    setContext({});
                    setDynamicSuggestions(['Spending breakdown', 'Tips to save', 'Add expense']);
                }
                // Analytics query
                else if (isAnalyticsQuery(messageText)) {
                    setTypingStatus('📊 Crunching numbers...');
                    botText = generateAnalyticsResponse(messageText, transactions, currency);
                    setContext({});
                    setDynamicSuggestions(['Compare to last week', 'Tips to reduce spending', 'Show top expenses']);
                }
                // Transaction parsing
                else {
                    // Check if ambiguous (just a number)
                    const { isAmbiguous, amount: ambiguousAmount } = isAmbiguousAmount(messageText);
                    if (isAmbiguous && ambiguousAmount) {
                        botText = generateAmbiguousResponse(ambiguousAmount, currency);
                        setContext({ pendingAmount: ambiguousAmount, awaitingType: true });
                    } else {
                        const multiples = parseMultipleTransactions(messageText);
                        if (multiples.length > 0) {
                            if (multiples.length === 1) {
                                setTypingStatus('💰 Recording...');
                                const parsed = multiples[0];
                                onAddTransaction(parsed.amount, parsed.type, parsed.category, parsed.description);
                                const newBal = parsed.type === 'expense'
                                    ? currentBalance - parsed.amount
                                    : currentBalance + parsed.amount;
                                setCurrentBalance(newBal);
                                botText = generateTransactionResponse(parsed, currency, newBal);
                                const txnInsight = generateSmartInsight(parsed, transactions, currency, newBal);
                                if (txnInsight) botText += txnInsight;
                                botTransaction = parsed;
                                isCard = true;
                                setContext({ lastTransaction: parsed, lastTransactionId: Date.now().toString() });
                                setDynamicSuggestions(['Show my spending', 'Add another', 'Tips to save']);
                            } else {
                                setTypingStatus('💰 Recording multiple...');
                                let netChange = 0;
                                let summary = `✅ **Processed ${multiples.length} transactions:**\n`;
                                multiples.forEach(t => {
                                    onAddTransaction(t.amount, t.type, t.category, t.description);
                                    if (t.type === 'expense') netChange -= t.amount;
                                    else netChange += t.amount;
                                    const meta = CATEGORY_META[t.category || 'other'];
                                    summary += `\n• ${meta.emoji} ${currency}${t.amount} for ${t.category}`;
                                });
                                const newBal = currentBalance + netChange;
                                setCurrentBalance(newBal);
                                botText = summary + `\n\n📊 New Balance: ${currency}${newBal.toFixed(2)}`;
                                setContext({});
                                setDynamicSuggestions(['Show balance', 'Spending breakdown', 'Add more']);
                            }
                        } else {
                            // Use Groq/AI fallback with conversation history
                            setTypingStatus('🧠 Thinking deeply...');
                            setIsTyping(true);
                            const chatHistory = messages.map(m => ({ text: m.text, sender: m.sender }));
                            const rawResponse = await generateSmartResponse(messageText, transactions, currency, chatHistory);
                            console.log("🤖 Raw Groq Response:", rawResponse);

                            // Check for Budget Plan
                            if (rawResponse.includes(':::BUDGET_PLAN:::')) {
                                try {
                                    const parts = rawResponse.split(':::BUDGET_PLAN:::');
                                    botText = parts[0].trim() || "Here is your requested budget plan. 👇";
                                    const jsonPart = parts[1].split(':::END:::')[0];
                                    const plan = JSON.parse(jsonPart);
                                    budgetPlan = plan;
                                } catch (e) {
                                    console.error("JSON Parse Error", e);
                                    botText = rawResponse; // Fallback
                                }
                            }
                            // Check for Transaction
                            else if (rawResponse.includes(':::TRANSACTION:::')) {
                                try {
                                    const parts = rawResponse.split(':::TRANSACTION:::');
                                    botText = parts[0].trim();
                                    const jsonPart = parts[1].split(':::END:::')[0];
                                    const txnData = JSON.parse(jsonPart);

                                    // 1. Update App State
                                    onAddTransaction(txnData.amount, txnData.type, txnData.category, txnData.description);

                                    // 2. Prepare UI Card
                                    botTransaction = {
                                        amount: txnData.amount,
                                        type: txnData.type,
                                        category: txnData.category,
                                        description: txnData.description,
                                    };
                                    isCard = true;
                                    setDynamicSuggestions(['Undo', 'Show balance']);
                                } catch (e) {
                                    console.error("Transaction Parse Error", e);
                                    botText = "I understood the transaction but couldn't process the details. Please try again.";
                                }
                            } else {
                                botText = rawResponse;
                            }

                            setIsTyping(false);
                            setContext({});
                            setDynamicSuggestions(['Tell me more', 'Show my spending', 'Add expense']);
                        }
                    }
                }

                const botMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    text: botText,
                    sender: 'bot',
                    timestamp: Date.now(),
                    transaction: botTransaction,
                    isCard,
                    budgetPlan,
                };
                addMessage(botMessage);
            }, delay);
        },
        [inputText, currency, currentBalance, transactions, onAddTransaction, context, addMessage],
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ─── Web Speech API ─────────────────────────────────────────────────────

    const startVoiceRecognition = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            const errorMsg: ChatMessage = {
                id: Date.now().toString(),
                text: '🎙️ Voice input is not supported in this browser. Try Chrome or Edge for the best experience!',
                sender: 'bot',
                timestamp: Date.now(),
            };
            addMessage(errorMsg);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
            setLiveTranscript('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setLiveTranscript(transcript);
        };

        recognition.onend = () => {
            setIsRecording(false);
            if (liveTranscriptRef.current) {
                handleSend(liveTranscriptRef.current);
            }
            setLiveTranscript('');
        };

        recognition.onerror = (event: any) => {
            setIsRecording(false);
            setLiveTranscript('');
            if (event.error !== 'aborted') {
                const errorMsg: ChatMessage = {
                    id: Date.now().toString(),
                    text: `🎙️ Voice recognition error: ${event.error}. Please try again!`,
                    sender: 'bot',
                    timestamp: Date.now(),
                };
                addMessage(errorMsg);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, [addMessage]);

    // Keep a ref to liveTranscript so onend callback can access latest value
    const liveTranscriptRef = useRef('');
    useEffect(() => {
        liveTranscriptRef.current = liveTranscript;
    }, [liveTranscript]);

    const stopVoiceRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    }, []);

    const handleVoicePress = useCallback(() => {
        if (isRecording) {
            stopVoiceRecognition();
        } else {
            startVoiceRecognition();
        }
    }, [isRecording, startVoiceRecognition, stopVoiceRecognition]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // ─── Render transaction card ────────────────────────────────────────────

    const renderTransactionCard = (parsed: ParsedTransaction) => {
        const meta = CATEGORY_META[parsed.category];
        const isExpense = parsed.type === 'expense';
        return (
            <div className={`mt-2 rounded-lg border overflow-hidden ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className={`flex items-center justify-between px-3 py-2 ${isExpense
                    ? isDark ? 'bg-red-900/20 border-b border-red-900/30' : 'bg-red-50 border-b border-red-100'
                    : isDark ? 'bg-green-900/20 border-b border-green-900/30' : 'bg-green-50 border-b border-green-100'
                    }`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                        {isExpense ? '▼ Expense' : '▲ Income'}
                    </span>
                    <span className={`text-lg font-bold ${isExpense ? 'text-red-500' : 'text-green-500'}`}>
                        {isExpense ? '-' : '+'}{currency}{parsed.amount.toFixed(2)}
                    </span>
                </div>
                <div className="px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? meta.bgDark : meta.bgLight} ${meta.color}`}>
                            {meta.emoji} {meta.label}
                        </span>
                    </div>
                    {parsed.description && (
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {parsed.description}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // ─── Render ─────────────────────────────────────────────────────────────

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col overflow-hidden relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
                {/* Ambient Background for Liquid Feel */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000"></div>
                </div>


                {messages.length === 0 ? (
                    // HERO VIEW (Empty State)
                    <div className="h-full flex flex-col items-center justify-center relative z-10 min-h-[500px]">
                        <div className="w-24 h-24 mb-6 rounded-3xl bg-white/30 dark:bg-black/30 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-xl relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <Bot size={48} className="text-blue-600 dark:text-blue-400 relative z-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
                        </h2>
                        <p className={`mb-10 text-center max-w-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            I'm FinMate, your AI financial companion. I can track expenses, set budgets, and analyze your spending habits.
                        </p>

                        <div className="grid grid-cols-2 gap-4 w-full max-w-lg px-4">
                            {HERO_ACTIONS.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={action.label}
                                        onClick={() => handleSend(action.message)}
                                        className={`p-4 rounded-2xl text-left border transition-all duration-300 hover:scale-[1.02] active:scale-95 group ${isDark
                                            ? 'bg-gray-800/60 border-gray-700 hover:bg-gray-800 backdrop-blur-lg'
                                            : 'bg-white/60 border-white/50 hover:bg-white/80 backdrop-blur-lg shadow-lg hover:shadow-xl'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <Icon size={20} className={action.color} />
                                        </div>
                                        <div className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {action.label}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    // CHAT VIEW
                    <div className="space-y-6 max-w-3xl mx-auto pb-4">
                        {messages.map((msg) => {
                            const isUser = msg.sender === 'user';
                            const isAnimating = animatingIds.has(msg.id);
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} transition-all duration-500 ease-out`}
                                >
                                    {!isUser && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-sm">
                                            <Bot size={14} className="text-white" />
                                        </div>
                                    )}

                                    <div className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm backdrop-blur-md ${isUser
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-sm shadow-blue-500/20'
                                        : 'bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-bl-sm border border-white/20 dark:border-gray-700 shadow-xl'
                                        }`}>
                                        <div className="whitespace-pre-wrap leading-relaxed">
                                            {msg.text}
                                        </div>

                                        {/* Transaction Card */}
                                        {msg.isCard && msg.transaction && renderTransactionCard(msg.transaction)}

                                        {/* Budget Plan Card */}
                                        {(msg as any).budgetPlan && (
                                            <div className={`mt-3 rounded-xl p-4 shadow-sm border ${isDark ? 'bg-gray-750 border-gray-600' : 'bg-white border-gray-200'}`}>
                                                <h3 className={`font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    <Wallet size={18} />
                                                    Proposed Monthly Budget
                                                </h3>
                                                <div className="space-y-3 mb-4">
                                                    {(msg as any).budgetPlan.map((item: BudgetPlanItem, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <span>{CATEGORY_META[item.category]?.emoji || '📌'}</span>
                                                                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                                                                    {CATEGORY_META[item.category]?.label || item.category}
                                                                </span>
                                                            </div>
                                                            <div className={`font-mono font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                                                                {currency}{item.limit}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        (msg as any).budgetPlan.forEach((item: BudgetPlanItem) => {
                                                            onSetBudget(item.category, item.limit);
                                                        });
                                                        addMessage({
                                                            id: Date.now().toString(),
                                                            text: "✅ Budget plan applied successfully! I'll help you stay on track.",
                                                            sender: 'bot',
                                                            timestamp: Date.now()
                                                        });
                                                    }}
                                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-[0.98]"
                                                >
                                                    Apply Plan
                                                </button>
                                            </div>
                                        )}

                                        <div className={`text-[10px] mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 ${isUser ? 'right-0 text-gray-400' : 'left-0 text-gray-400'}`}>
                                            {formatTime(msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isTyping && (
                            <div className="flex justify-start animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0 opacity-50">
                                    <Bot size={14} className="text-white" />
                                </div>
                                <div className="flex items-center space-x-1 ml-1 mt-3">
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                )}
            </div>

            {/* Dynamic Contextual Suggestions (Floating above input) */}
            {dynamicSuggestions.length > 0 && messages.length > 0 && (
                <div className="absolute bottom-24 left-0 right-0 px-4 flex justify-center z-10 pointer-events-none">
                    <div className="flex gap-2 overflow-x-auto pb-1 max-w-2xl no-scrollbar pointer-events-auto">
                        {dynamicSuggestions.map((suggestion) => (
                            <button
                                key={suggestion}
                                onClick={() => { handleSend(suggestion); setDynamicSuggestions([]); }}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold shadow-sm transition-all hover:scale-105 active:scale-95 border ${isDark
                                    ? 'bg-gray-800 border-gray-700 text-blue-300 hover:bg-gray-700'
                                    : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50'
                                    }`}
                            >
                                ✨ {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}



            {/* Recording Overlay */}
            {isRecording && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center max-w-sm px-6">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 w-28 h-28 -m-4 rounded-full bg-blue-500/25 animate-ping" />
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                                <Mic size={32} className="text-white" />
                            </div>
                        </div>
                        <p className="text-white text-xl font-bold mb-2">Listening...</p>
                        {liveTranscript ? (
                            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 mb-6 w-full text-center">
                                <p className="text-white text-sm">"{liveTranscript}"</p>
                            </div>
                        ) : (
                            <p className="text-white/60 text-sm mb-6">Speak your expense or income</p>
                        )}
                        <button
                            onClick={handleVoicePress}
                            className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X size={24} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Bar */}
            {/* Floating Input Bar */}
            <div className={`p-4 flex justify-center w-full z-20 ${isDark ? 'bg-gray-900 border-t border-gray-800' : 'bg-gray-50 border-t border-gray-200'} backdrop-blur-lg bg-opacity-90`}>
                <div className={`w-full max-w-3xl rounded-2xl shadow-xl border transition-all duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center p-2 gap-2">
                        <button
                            onClick={handleVoicePress}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isRecording
                                ? 'bg-red-500 text-white animate-pulse'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400'
                                }`}
                        >
                            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <input
                            ref={inputRef}
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={context.awaitingType ? 'Expected "expense" or "income"...' : 'Message FinMate...'}
                            className={`flex-1 bg-transparent border-none outline-none text-base px-2 ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                        />

                        <button
                            onClick={() => handleSend()}
                            disabled={!inputText.trim()}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${inputText.trim()
                                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-300 dark:text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ChatBot;
