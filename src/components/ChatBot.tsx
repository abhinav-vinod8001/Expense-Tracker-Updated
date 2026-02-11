import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Send, Mic, MicOff, Bot, X, HelpCircle, Wallet, PlusCircle, MinusCircle, BarChart3, Undo2 } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Transaction, TransactionCategory, CATEGORY_META } from '../types';
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
} from '../services/chatService';
import { detectCategory } from '../services/categoryDetector';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatBotProps {
    currency: string;
    balance: number;
    transactions: Transaction[];
    onAddTransaction: (amount: number, type: 'expense' | 'income', category?: string, description?: string) => void;
    onBack: () => void;
}

interface ConversationContext {
    pendingAmount?: number;
    lastTransaction?: ParsedTransaction;
    lastTransactionId?: string;
    awaitingType?: boolean; // waiting for expense/income clarification
}

const QUICK_CHIPS = [
    { label: 'Add Expense', message: 'I want to add an expense', icon: MinusCircle, color: 'text-red-500' },
    { label: 'Add Income', message: 'I want to add income', icon: PlusCircle, color: 'text-green-500' },
    { label: 'Balance', message: 'What is my balance?', icon: Wallet, color: 'text-blue-500' },
    { label: 'Analytics', message: 'Show my spending breakdown', icon: BarChart3, color: 'text-purple-500' },
    { label: 'Help', message: 'help', icon: HelpCircle, color: 'text-amber-500' },
    { label: 'Undo', message: 'undo that', icon: Undo2, color: 'text-gray-500' },
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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    // Load history or initialize with greeting
    useEffect(() => {
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
        const greetings = [
            `👋 *Hey there!*\n\nI'm your AI finance assistant. Ready to track some expenses? 💸\n\n💡 Try: "Spent 200 on food" or "Show my spending"`,
            `🚀 *Welcome back!*\n\nLet's get your finances in order. What did you spend on today? 💰\n\n💡 Try: "Spent 150 on uber" or "How much did I save?"`,
            `🤖 *Hello!* I'm here to help you manage your money.\n\nNeed to log a transaction or get advice? Just ask! 🧠\n\n💡 Try: "Tips for saving money"`,
            `✨ *Hi!* keeping track of money is hard, but I make it easy.\n\nTell me what you bought or earned! 📝\n\n💡 Try: "Income 5000 from freelance"`,
            `📊 *Greetings!* Ready to analyze your spending?\n\nI can help you budget better. What's on your mind? 💭\n\n💡 Try: "Analyze my food spending"`,
        ];

        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

        const greeting: ChatMessage = {
            id: 'greeting',
            text: randomGreeting,
            sender: 'bot',
            timestamp: Date.now(),
        };
        setMessages([greeting]);
        setAnimatingIds(new Set(['greeting']));
        setTimeout(() => setAnimatingIds(new Set()), 500);
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
                        botTransaction = parsed;
                        isCard = true;
                        setContext({ lastTransaction: parsed, lastTransactionId: Date.now().toString() });
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
                        botTransaction = parsed;
                        isCard = true;
                        setContext({ lastTransaction: parsed, lastTransactionId: Date.now().toString() });
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
                }
                // Balance query
                else if (isBalanceQuery(messageText)) {
                    botText = generateBalanceResponse(currency, currentBalance, transactions);
                    setContext({});
                }
                // Analytics query
                else if (isAnalyticsQuery(messageText)) {
                    botText = generateAnalyticsResponse(messageText, transactions, currency);
                    setContext({});
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
                                const parsed = multiples[0];
                                onAddTransaction(parsed.amount, parsed.type, parsed.category, parsed.description);
                                const newBal = parsed.type === 'expense'
                                    ? currentBalance - parsed.amount
                                    : currentBalance + parsed.amount;
                                setCurrentBalance(newBal);
                                botText = generateTransactionResponse(parsed, currency, newBal);
                                botTransaction = parsed;
                                isCard = true;
                                setContext({ lastTransaction: parsed, lastTransactionId: Date.now().toString() });
                            } else {
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
                            }
                        } else {
                            // Use Groq/AI fallback
                            setIsTyping(true); // Show typing while AI thinks
                            botText = await generateSmartResponse(messageText, transactions, currency);
                            setIsTyping(false);
                            setContext({});
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col h-screen">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center">
                        <button
                            onClick={onBack}
                            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="ml-3 flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {isTyping ? '⚡ Analyzing...' : isRecording ? '🎙️ Listening...' : 'Smart expense tracking'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className={`px-3 py-1.5 rounded-lg ${currentBalance >= 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                            <span className={`text-sm font-bold ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {currency}{Math.abs(currentBalance).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    const isAnimating = animatingIds.has(msg.id);
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'} transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'
                                }`}
                            style={isAnimating ? { animation: 'fadeSlideIn 0.4s ease forwards' } : undefined}
                        >
                            {!isUser && (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                                    <Bot size={16} className="text-white" />
                                </div>
                            )}

                            <div
                                className={`max-w-[75%] rounded-xl shadow-sm transition-colors duration-300 ${isUser
                                    ? 'bg-blue-500 text-white rounded-br-sm'
                                    : 'bg-white dark:bg-gray-800 rounded-bl-sm'
                                    }`}
                            >
                                <div className="px-4 py-3">
                                    <p
                                        className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isUser ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                                            }`}
                                    >
                                        {msg.text}
                                    </p>

                                    {/* Transaction Card */}
                                    {msg.isCard && msg.transaction && renderTransactionCard(msg.transaction)}

                                    <p
                                        className={`text-[10px] mt-1.5 text-right ${isUser ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'
                                            }`}
                                    >
                                        {formatTime(msg.timestamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                            <Bot size={16} className="text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-xl rounded-bl-sm shadow-sm px-5 py-4">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1.5">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                                <span className="text-xs text-gray-400 dark:text-gray-500">AI is analyzing...</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="px-6 pb-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {QUICK_CHIPS.map((chip) => {
                        const ChipIcon = chip.icon;
                        return (
                            <button
                                key={chip.label}
                                onClick={() => handleSend(chip.message)}
                                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all hover:scale-[1.02] active:scale-95 ${isDark
                                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600'
                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                    } shadow-sm`}
                            >
                                <ChipIcon size={14} className={chip.color} />
                                {chip.label}
                            </button>
                        );
                    })}
                </div>
            </div>

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
            <div className={`border-t px-6 py-3 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} transition-colors duration-300`}>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleVoicePress}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : isDark
                                ? 'bg-gray-700 hover:bg-gray-600'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        {isRecording ? (
                            <MicOff size={18} className="text-white" />
                        ) : (
                            <Mic size={18} className="text-gray-500 dark:text-gray-400" />
                        )}
                    </button>

                    <input
                        ref={inputRef}
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={context.awaitingType ? 'Reply "expense" or "income"...' : 'Type your expense or income...'}
                        className={`flex-1 h-10 px-4 rounded-lg text-sm outline-none border transition-colors focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                            }`}
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={!inputText.trim()}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${inputText.trim()
                            ? 'bg-blue-500 hover:bg-blue-600 shadow-sm'
                            : isDark
                                ? 'bg-gray-700 cursor-not-allowed'
                                : 'bg-gray-100 cursor-not-allowed'
                            }`}
                    >
                        <Send
                            size={16}
                            className={inputText.trim() ? 'text-white' : 'text-gray-400 dark:text-gray-500'}
                        />
                    </button>
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
