import { Transaction, TransactionCategory, CATEGORY_META, BudgetPlanItem } from '../types';
import { detectCategory } from './categoryDetector';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ParsedTransaction {
  amount: number;
  type: 'expense' | 'income';
  description?: string;
  category: TransactionCategory;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  transaction?: ParsedTransaction;
  isCard?: boolean; // render as visual transaction card
  budgetPlan?: BudgetPlanItem[];
}

// ─── Trigger Words ──────────────────────────────────────────────────────────

const EXPENSE_TRIGGERS = [
  'spent', 'spend', 'paid', 'pay', 'bought', 'buy', 'cost',
  'expense', 'purchase', 'purchased', 'charged', 'charge',
  'debited', 'debit', 'lost', 'gave', 'give', 'used',
  'shopping', 'shopped', 'owe', 'owed',
];

const INCOME_TRIGGERS = [
  'received', 'receive', 'earned', 'earn', 'salary', 'income',
  'got paid', 'credited', 'credit', 'won', 'bonus', 'refund',
  'reimbursed', 'reimbursement', 'deposited', 'deposit',
  'payment received', 'freelance', 'dividend', 'interest',
];

const BALANCE_TRIGGERS = [
  'balance', 'how much', 'total', 'remaining', 'left',
  'net', 'savings', 'saved', 'have i',
];

const HELP_TRIGGERS = [
  'help', 'how to', 'what can', 'commands', 'guide',
  'instructions', 'tutorial', 'usage',
];

const ANALYTICS_TRIGGERS = [
  'how much on', 'how much for', 'how much did i spend on',
  'spending on', 'spent on', 'category', 'categories',
  'breakdown', 'top expense', 'top expenses', 'biggest expense',
  'biggest expenses', 'most spent', 'spending this week',
  'spending this month', 'spending today', 'summary',
  'analyze', 'analyse', 'analysis', 'report', 'insights',
  'trend', 'trends', 'compare', 'average spending',
];

const UNDO_TRIGGERS = [
  'undo', 'undo that', 'cancel', 'cancel that', 'revert',
  'reverse', 'delete that', 'remove that', 'take that back',
  'wrong', 'mistake', 'oops',
];

const CONFIRMATION_TRIGGERS = [
  'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay',
  'correct', 'right', 'confirm', 'do it', 'go ahead',
];

const DENIAL_TRIGGERS = [
  'no', 'nah', 'nope', 'cancel', 'never mind', 'nevermind',
  'forget it', 'stop', 'don\'t',
];

// ─── Amount Extraction ──────────────────────────────────────────────────────

function extractAmount(message: string): number | null {
  const patterns: RegExp[] = [
    /[$₹€£¥₩₽]\s*([\d,]+\.?\d*)/,
    /([\d,]+\.?\d*)\s*(?:dollars?|rupees?|euros?|pounds?|yen)/i,
    /(?:rs\.?|inr)\s*([\d,]+\.?\d*)/i,
    /(?:spent|paid|bought|earned|received|got|cost|spend|pay|buy|gave|give|lost|deposited|deposit|credited|credit)\s+(?:about\s+|around\s+|approximately\s+|nearly\s+)?([\d,]+\.?\d*)/i,
    /([\d,]+\.?\d*)\s*(?:spent|paid|bought|earned|received|for|on|towards)/i,
    /\b([\d,]+\.?\d+)\b/,
    /\b([\d,]{2,})\b/,
    /\b(\d+)\b/,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      const numStr = match[1].replace(/,/g, '');
      const num = parseFloat(numStr);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

// ─── Transaction Type Detection ─────────────────────────────────────────────

function determineTransactionType(message: string): 'expense' | 'income' | null {
  for (const trigger of INCOME_TRIGGERS) {
    if (message.includes(trigger)) return 'income';
  }
  for (const trigger of EXPENSE_TRIGGERS) {
    if (message.includes(trigger)) return 'expense';
  }
  const hasNumber = /\d+/.test(message);
  if (hasNumber) return 'expense';
  return null;
}

// ─── Description Extraction ─────────────────────────────────────────────────

function extractDescription(message: string): string | undefined {
  const descPatterns = [
    /(?:on|for|towards|at|from)\s+(.+?)(?:\s*$)/i,
    /(?:bought|purchased)\s+(?:a\s+|an\s+|some\s+)?(.+?)(?:\s+for\s+|\s*$)/i,
  ];

  for (const pattern of descPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      let desc = match[1]
        .replace(/[$₹€£¥₩₽]\s*[\d,]+\.?\d*/g, '')
        .replace(/[\d,]+\.?\d*\s*(?:dollars?|rupees?|euros?|pounds?)/gi, '')
        .replace(/\b\d+\b/g, '')
        .trim();
      if (desc.length > 1) return desc;
    }
  }
  return undefined;
}

// ─── Intent Detection ───────────────────────────────────────────────────────

export function parseTransaction(message: string): ParsedTransaction | null {
  const lower = message.toLowerCase().trim();
  const amount = extractAmount(lower);
  if (amount === null || amount <= 0) return null;

  const type = determineTransactionType(lower);
  if (!type) return null;

  const description = extractDescription(lower);
  const { category } = detectCategory(lower);

  // If we have a description but category is 'other', try detecting from description
  if (category === 'other' && description) {
    const descCategory = detectCategory(description);
    return { amount, type, description, category: descCategory.category };
  }

  return { amount, type, description, category };
}

/**
 * Attempt to parse multiple transactions from a single message.
 * Splits by " and ", ",", "&"
 */
export function parseMultipleTransactions(message: string): ParsedTransaction[] {
  // 1. Split message into potential segments
  // regex splits by " and ", " & ", or "," (with optional whitespace)
  const segments = message.split(/,|\s+and\s+|\s+&\s+/i);

  const results: ParsedTransaction[] = [];

  for (const segment of segments) {
    const trimmed = segment.trim();
    if (trimmed.length < 5) continue; // skip short junk

    const parsed = parseTransaction(trimmed);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

export function isBalanceQuery(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return BALANCE_TRIGGERS.some(trigger => lower.includes(trigger));
}

export function isHelpRequest(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return HELP_TRIGGERS.some(trigger => lower.includes(trigger));
}

export function isAnalyticsQuery(message: string): boolean {
  const lower = message.toLowerCase().trim();

  // EXCEPTION: If the user is asking for advice, let the AI handle it
  // e.g. "Tips for saving", "How to manage expenses", "Advice on food"
  const adviceTriggers = ['tips', 'advice', 'suggest', 'recommend', 'how to', 'how can', 'how do', 'manage', 'save money'];
  if (adviceTriggers.some(t => lower.includes(t))) {
    return false;
  }

  return ANALYTICS_TRIGGERS.some(trigger => lower.includes(trigger));
}

export function isUndoRequest(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return UNDO_TRIGGERS.some(trigger => lower.includes(trigger));
}

export function isConfirmation(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return CONFIRMATION_TRIGGERS.some(trigger => lower === trigger || lower.startsWith(trigger));
}

export function isDenial(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return DENIAL_TRIGGERS.some(trigger => lower === trigger || lower.startsWith(trigger));
}

/**
 * Check if the message is ambiguous (just a number with no context).
 */
export function isAmbiguousAmount(message: string): { isAmbiguous: boolean; amount: number | null } {
  const lower = message.trim();
  // Match if the message is ONLY a number (with optional currency symbol)
  const match = lower.match(/^[$₹€£¥₩₽]?\s*(\d[\d,]*\.?\d*)$/);
  if (match) {
    const amount = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(amount) && amount > 0) return { isAmbiguous: true, amount };
  }
  return { isAmbiguous: false, amount: null };
}

// ─── Response Generators ────────────────────────────────────────────────────

export function generateTransactionResponse(
  parsed: ParsedTransaction,
  currency: string,
  newBalance: number,
): string {
  const meta = CATEGORY_META[parsed.category];
  const emoji = parsed.type === 'expense' ? '💸' : '💰';
  const action = parsed.type === 'expense' ? 'Expense' : 'Income';
  const desc = parsed.description ? ` for *${parsed.description}*` : '';
  const categoryLabel = parsed.category !== 'other' ? `\n${meta.emoji} Category: *${meta.label}*` : '';
  const balanceEmoji = newBalance >= 0 ? '📊' : '⚠️';

  return `${emoji} ${action} of ${currency}${parsed.amount.toFixed(2)}${desc} recorded!${categoryLabel}\n\n${balanceEmoji} Current balance: ${currency}${Math.abs(newBalance).toFixed(2)}${newBalance < 0 ? ' (deficit)' : ''}`;
}

export function generateBalanceResponse(
  currency: string,
  balance: number,
  transactions: Transaction[],
): string {
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const balanceEmoji = balance >= 0 ? '✅' : '🔴';

  let response = `📊 *Financial Summary*\n\n`;
  response += `${balanceEmoji} Balance: ${currency}${Math.abs(balance).toFixed(2)}${balance < 0 ? ' (deficit)' : ''}\n`;
  response += `💰 Total Income: ${currency}${totalIncome.toFixed(2)}\n`;
  response += `💸 Total Expenses: ${currency}${totalExpenses.toFixed(2)}\n`;
  response += `📝 Transactions: ${transactions.length}`;

  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome * 100);
    response += `\n📈 Savings Rate: ${savingsRate.toFixed(1)}%`;
  }

  // Top categories
  const categorySpending = getCategoryBreakdown(transactions);
  if (categorySpending.length > 0) {
    response += `\n\n📂 *Top Categories:*`;
    categorySpending.slice(0, 3).forEach(({ category, total }) => {
      const meta = CATEGORY_META[category];
      response += `\n${meta.emoji} ${meta.label}: ${currency}${total.toFixed(2)}`;
    });
  }

  return response;
}

export function generateHelpResponse(): string {
  return `🤖 *AI Chat Assistant — Help*\n\nI can help you track expenses and income using natural language! Here's how:\n\n💸 *Log an Expense:*\n• "Spent 500 on groceries"\n• "Paid 200 for electricity"\n• "Bought coffee for 5"\n\n💰 *Log Income:*\n• "Received salary 50000"\n• "Earned 1000 from freelance"\n• "Got refund of 300"\n\n📊 *Check Balance:*\n• "What's my balance?"\n• "How much do I have?"\n\n📂 *Spending Analytics:*\n• "How much did I spend on food?"\n• "What are my top expenses?"\n• "Spending this week"\n• "Category breakdown"\n\n↩️ *Undo & Edit:*\n• "Undo that" — reverts last transaction\n• Just type a number — I'll ask for details\n\n💡 *Tips:*\n• Categories are auto-detected! (food, transport, bills, etc.)\n• Use the 🎙️ mic button for voice input\n• Tap the quick chips below for shortcuts`;
}

export function getGreetingMessage(): ChatMessage {
  return {
    id: 'greeting',
    text: `👋 *Hey there!*\n\nI'm your AI finance assistant with smart category detection, spending analytics, and voice input!\n\n💡 Try saying:\n• "Spent 200 on groceries" → auto-detects 🍔 Food\n• "Paid 150 for uber" → auto-detects 🚗 Transport\n• "How much did I spend on food?"\n• "What are my top expenses?"\n\nOr tap the suggestions below!`,
    sender: 'bot',
    timestamp: Date.now(),
  };
}

// Update this function signature to be async and call Groq
import { getGroqChatCompletion } from './groqService';

interface ChatHistoryItem {
  text: string;
  sender: 'user' | 'bot';
}

export async function generateSmartResponse(
  message: string,
  transactions: Transaction[],
  currency: string,
  chatHistory: ChatHistoryItem[] = []
): Promise<string> {
  try {
    return await getGroqChatCompletion(message, transactions, currency, chatHistory);
  } catch (error) {
    console.error('Groq fallback error:', error);
    // Fallback to canned responses if API fails
    const responses = [
      "🤔 I couldn't quite understand that. Try something like *\"spent 500 on groceries\"* or *\"earned 2000 salary\"*.",
      "💭 Hmm, I'm not sure what to do with that. Could you tell me about an expense or income? For example: *\"paid 300 for electricity\"*.",
      "🤖 I work best with transaction messages! Try: *\"bought lunch for 150\"* or *\"received 1000 refund\"*. Type *help* for more examples!",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// ─── Proactive Smart Insights ───────────────────────────────────────────────

export function generateSmartInsight(
  parsed: ParsedTransaction,
  allTransactions: Transaction[],
  currency: string,
  newBalance: number
): string | null {
  const category = parsed.category;
  const meta = CATEGORY_META[category];

  // Count today's transactions in same category
  const today = new Date().toISOString().split('T')[0];
  const todaySameCategory = allTransactions.filter(
    t => t.type === 'expense' && t.category === category && t.date === today
  );

  // Total spent in this category all time
  const categoryTotal = allTransactions
    .filter(t => t.type === 'expense' && t.category === category)
    .reduce((sum, t) => sum + t.amount, 0) + (parsed.type === 'expense' ? parsed.amount : 0);

  // Total income
  const totalIncome = allTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) + (parsed.type === 'income' ? parsed.amount : 0);

  // Total expenses
  const totalExpenses = allTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) + (parsed.type === 'expense' ? parsed.amount : 0);

  const insights: string[] = [];

  // Repeated category today
  if (parsed.type === 'expense' && todaySameCategory.length >= 2) {
    insights.push(`That's ${todaySameCategory.length + 1} ${meta.emoji} ${meta.label} expenses today!`);
  }

  // Large expense warning (> 20% of total income)
  if (parsed.type === 'expense' && totalIncome > 0 && parsed.amount > totalIncome * 0.2) {
    insights.push(`⚠️ That's ${((parsed.amount / totalIncome) * 100).toFixed(0)}% of your total income in one go!`);
  }

  // Savings milestone
  if (totalIncome > 0) {
    const savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    if (savingsRate >= 50 && parsed.type === 'income') {
      insights.push(`🔥 Savings rate at ${savingsRate.toFixed(0)}% — you're a saving machine!`);
    } else if (savingsRate < 10 && parsed.type === 'expense') {
      insights.push(`💡 Savings rate dropped to ${savingsRate.toFixed(0)}% — consider slowing down spending.`);
    }
  }

  // Balance warning
  if (newBalance < 0) {
    insights.push(`🚨 You're in deficit! Balance: ${currency}${Math.abs(newBalance).toFixed(2)} in the red.`);
  } else if (newBalance > 0 && newBalance < 100 && parsed.type === 'expense') {
    insights.push(`⚡ Balance getting low — only ${currency}${newBalance.toFixed(2)} remaining.`);
  }

  // Nice income celebration
  if (parsed.type === 'income' && parsed.amount >= 1000) {
    insights.push(`💪 Nice income! Keep stacking!`);
  }

  // Category spending milestone
  if (parsed.type === 'expense' && categoryTotal >= 5000) {
    insights.push(`${meta.emoji} Total ${meta.label} spending has crossed ${currency}${categoryTotal.toFixed(0)}!`);
  }

  if (insights.length === 0) return null;

  // Return max 2 insights
  return '\n\n💡 ' + insights.slice(0, 2).join('\n💡 ');
}

export function generateAmbiguousResponse(amount: number, currency: string): string {
  return `💭 Got *${currency}${amount.toFixed(2)}* — is this an *expense* or *income*?\n\nJust reply with "expense" or "income", or give me more context like "spent ${amount.toFixed(0)} on food".`;
}

export function generateUndoResponse(transaction: Transaction, currency: string, newBalance: number): string {
  const meta = transaction.category ? CATEGORY_META[transaction.category] : null;
  const emoji = transaction.type === 'expense' ? '💸' : '💰';
  const categoryText = meta ? ` (${meta.emoji} ${meta.label})` : '';

  return `↩️ *Transaction reversed!*\n\n${emoji} ${currency}${transaction.amount.toFixed(2)} ${transaction.type}${categoryText} has been undone.\n\n📊 Updated balance: ${currency}${Math.abs(newBalance).toFixed(2)}${newBalance < 0 ? ' (deficit)' : ''}`;
}

// ─── Analytics Engine ───────────────────────────────────────────────────────

interface CategoryBreakdown {
  category: TransactionCategory;
  total: number;
  count: number;
  percentage: number;
}

function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const categoryMap = new Map<TransactionCategory, { total: number; count: number }>();

  for (const t of expenses) {
    const cat = t.category || 'other';
    const existing = categoryMap.get(cat) || { total: 0, count: 0 };
    existing.total += t.amount;
    existing.count += 1;
    categoryMap.set(cat, existing);
  }

  return Array.from(categoryMap.entries())
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

function getTimeFilteredTransactions(transactions: Transaction[], period: string): Transaction[] {
  const now = new Date();
  let startTime: number;

  switch (period) {
    case 'today':
      startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      break;
    case 'week':
      startTime = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      break;
    case 'month':
      startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      break;
    default:
      return transactions;
  }

  return transactions.filter(t => t.timestamp >= startTime);
}

function detectTimePeriod(message: string): string | null {
  const lower = message.toLowerCase();
  if (lower.includes('today')) return 'today';
  if (lower.includes('this week') || lower.includes('week')) return 'week';
  if (lower.includes('this month') || lower.includes('month')) return 'month';
  return null;
}

function detectQueryCategory(message: string): TransactionCategory | null {
  const lower = message.toLowerCase();
  const { category, confidence } = detectCategory(lower);
  if (confidence > 0 && category !== 'other') return category;
  return null;
}

export function generateAnalyticsResponse(
  message: string,
  transactions: Transaction[],
  currency: string,
): string {
  const lower = message.toLowerCase();
  const timePeriod = detectTimePeriod(lower);
  const queriedCategory = detectQueryCategory(lower);
  const filteredByTime = timePeriod ? getTimeFilteredTransactions(transactions, timePeriod) : transactions;
  const periodLabel = timePeriod === 'today' ? 'today' : timePeriod === 'week' ? 'this week' : timePeriod === 'month' ? 'this month' : 'all time';

  // Category-specific query: "how much on food?"
  if (queriedCategory) {
    const meta = CATEGORY_META[queriedCategory];
    const catTransactions = filteredByTime.filter(
      t => t.type === 'expense' && t.category === queriedCategory
    );
    const total = catTransactions.reduce((sum, t) => sum + t.amount, 0);

    if (catTransactions.length === 0) {
      return `${meta.emoji} No *${meta.label}* expenses found ${periodLabel}. Start tracking by saying "spent [amount] on ${queriedCategory}"!`;
    }

    return `${meta.emoji} *${meta.label} Spending (${periodLabel}):*\n\n💰 Total: ${currency}${total.toFixed(2)}\n📝 Transactions: ${catTransactions.length}\n📊 Average: ${currency}${(total / catTransactions.length).toFixed(2)} per transaction`;
  }

  // Top expenses / breakdown query
  if (lower.includes('top') || lower.includes('biggest') || lower.includes('most') || lower.includes('breakdown') || lower.includes('categories')) {
    const breakdown = getCategoryBreakdown(filteredByTime);
    if (breakdown.length === 0) {
      return `📊 No categorized expenses found ${periodLabel}. Start tracking with sentences like "spent 200 on groceries"!`;
    }

    let response = `📊 *Spending Breakdown (${periodLabel}):*\n`;
    breakdown.slice(0, 6).forEach(({ category, total, count, percentage }, i) => {
      const meta = CATEGORY_META[category];
      const bar = '█'.repeat(Math.max(1, Math.round(percentage / 10)));
      response += `\n${meta.emoji} *${meta.label}*\n   ${currency}${total.toFixed(2)} (${percentage.toFixed(0)}%) ${bar} [${count} txns]`;
    });

    const totalSpent = filteredByTime.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    response += `\n\n💸 Total spent: ${currency}${totalSpent.toFixed(2)}`;
    return response;
  }

  // General spending summary
  const expenses = filteredByTime.filter(t => t.type === 'expense');
  const income = filteredByTime.filter(t => t.type === 'income');
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = income.reduce((sum, t) => sum + t.amount, 0);
  const avgDaily = timePeriod === 'week' ? totalSpent / 7 : timePeriod === 'month' ? totalSpent / 30 : totalSpent / Math.max(1, Math.ceil((Date.now() - (transactions[transactions.length - 1]?.timestamp || Date.now())) / 86400000));

  let response = `📊 *Spending Report (${periodLabel}):*\n\n`;
  response += `💸 Expenses: ${currency}${totalSpent.toFixed(2)} (${expenses.length} transactions)\n`;
  response += `💰 Income: ${currency}${totalEarned.toFixed(2)} (${income.length} transactions)\n`;
  response += `📈 Daily avg: ${currency}${avgDaily.toFixed(2)}`;

  if (totalEarned > 0) {
    const savingsRate = ((totalEarned - totalSpent) / totalEarned * 100);
    response += `\n💎 Savings rate: ${savingsRate.toFixed(1)}%`;
  }

  return response;
}
