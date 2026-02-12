import { Transaction } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// ─── Types ──────────────────────────────────────────────────────────────────

interface ChatHistoryMessage {
    text: string;
    sender: 'user' | 'bot';
}

// ─── Smart Financial Context Builder ────────────────────────────────────────

function buildFinancialContext(transactions: Transaction[], currency: string): string {
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0
        ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1)
        : '0';

    // Recent transactions (last 10)
    const recentTransactions = transactions.slice(0, 10).map(t =>
        `- ${t.type} of ${currency}${t.amount} for ${t.description || t.category || 'uncategorized'} on ${t.date}`
    ).join('\n');

    // Top spending categories
    const categoryTotals = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
        const cat = t.category || 'other';
        categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + t.amount);
    });
    const topCategories = Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cat, total]) => `${cat}: ${currency}${total.toFixed(0)}`)
        .join(', ');

    // Today's spending
    const today = new Date().toISOString().split('T')[0];
    const todaySpent = transactions
        .filter(t => t.type === 'expense' && t.date === today)
        .reduce((sum, t) => sum + t.amount, 0);

    return `
FINANCIAL SNAPSHOT:
- Balance: ${currency}${balance.toFixed(2)}
- Total Income: ${currency}${totalIncome.toFixed(2)}
- Total Expenses: ${currency}${totalExpense.toFixed(2)}
- Savings Rate: ${savingsRate}%
- Today's spending: ${currency}${todaySpent.toFixed(2)}
- Top categories: ${topCategories || 'None yet'}
- Total transactions: ${transactions.length}

RECENT TRANSACTIONS:
${recentTransactions || 'No transactions yet.'}`;
}

// ─── Expert System Prompt ───────────────────────────────────────────────────

function getSystemPrompt(financialContext: string): string {
    return `You are **FinMate**, an expert AI financial advisor built into a personal expense tracking app.

YOUR PERSONALITY:
- You are witty, warm, and genuinely knowledgeable about personal finance
- You use emojis naturally (not excessively) to make conversations engaging
- You give SPECIFIC, actionable advice — never generic "save more money" type responses
- You reference the user's ACTUAL data when giving advice
- You celebrate wins ("Your savings rate is 30%! That's elite! 🔥")
- You give gentle warnings when needed ("3 food orders today — maybe cook dinner tonight? 🍳")
- Keep responses concise: 2-4 sentences for simple queries, slightly longer for detailed analysis
- NEVER make up data. Only reference transactions from the provided context

YOUR EXPERTISE:
- Budgeting strategies (50/30/20 rule, zero-based budgeting, envelope method)
- Savings techniques (pay yourself first, round-up savings, no-spend challenges)
- Spending optimization (subscription audits, meal planning, bulk buying)
- Investment basics (emergency fund, compound interest, index funds)
- Behavioral finance (impulse buying triggers, lifestyle creep)

- Use *bold* for emphasis (it renders in the app)
- Use line breaks for readability
- For lists, use bullet points with emojis
- Never use markdown headers (#) — just bold text
- Keep it conversational, not like a textbook

SPECIAL INSTRUCTION:
If the user specifically asks to "create a budget", "plan a budget", or for a "budgeting plan":
1. Analyze their spending data.
2. Propose a monthly limit for their top categories.
3. OUTPUT THE RESPONSE IN THIS EXACT FORMAT ONLY:
:::BUDGET_PLAN:::
[
  {"category": "food", "limit": 450, "reason": "Based on average spending"},
  {"category": "transport", "limit": 150, "reason": "Optimized for savings"}
]
:::END:::
:::END:::
(Do not add any other text before or after the JSON block when creating a budget plan)

SPECIAL INSTRUCTION 2:
If the user mentions a new expense, income, or subscription that requires logging (e.g., "I bought coffee for 5", "Netflix subscription 499/month"):
1. Extract the details.
2. OUTPUT THE RESPONSE IN THIS FORMAT:
[Conversational response confirming the action]
:::TRANSACTION:::
{
  "amount": 499,
  "type": "expense",
  "category": "entertainment",
  "description": "Netflix Subscription"
}
:::END:::
(Use 'entertainment' for Netflix/Spotify, 'food' for dining, etc. Infer best category.)

${financialContext}`;
}

// ─── Main API Call ──────────────────────────────────────────────────────────

export async function getGroqChatCompletion(
    message: string,
    transactions: Transaction[],
    currency: string,
    chatHistory: ChatHistoryMessage[] = []
): Promise<string> {
    if (!GROQ_API_KEY) {
        console.error('Groq API Key is missing');
        return "I'm sorry, I can't access my smart brain right now. Please check your API key configuration. 🔑";
    }

    try {
        const financialContext = buildFinancialContext(transactions, currency);
        const systemPrompt = getSystemPrompt(financialContext);

        // Build conversation history for multi-turn context
        const conversationMessages: { role: string; content: string }[] = [
            { role: 'system', content: systemPrompt },
        ];

        // Add last 10 messages from chat history for context
        const recentHistory = chatHistory.slice(-10);
        for (const msg of recentHistory) {
            conversationMessages.push({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text,
            });
        }

        // Add the current message with explicit instruction
        const instruction = `\n\n[SYSTEM: If this message implies a financial transaction (expense/income/subscription), you MUST return the JSON block :::TRANSACTION:::...:::END::: as specified in the system prompt. Do not ignore this.]`;
        conversationMessages.push({ role: 'user', content: message + instruction });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: conversationMessages,
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 400,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "Hmm, I'm drawing a blank. Try asking me again! 🤔";
    } catch (error) {
        console.error('Error calling Groq API:', error);
        return "Sorry, I'm having trouble connecting to my brain right now. Please try again in a moment! 🔄";
    }
}
