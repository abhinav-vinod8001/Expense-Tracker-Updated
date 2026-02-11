import { Transaction } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export async function getGroqChatCompletion(
    message: string,
    transactions: Transaction[],
    currency: string
): Promise<string> {
    if (!GROQ_API_KEY) {
        console.error('Groq API Key is missing');
        return "I'm sorry, I can't access my advanced brain right now. Please check your API key.";
    }

    try {
        // Summarize financial context for the AI
        const recentTransactions = transactions.slice(0, 10).map(t =>
            `- ${t.type} of ${currency}${t.amount} for ${t.description || t.category} on ${t.date}`
        ).join('\n');

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        const systemPrompt = `You are a helpful, friendly, and smart financial assistant. 
    Your goal is to help the user manage their money, give advice, and answer questions based on their transaction history.
    
    Current Financial Context:
    - Balance: ${currency}${balance.toFixed(2)}
    - Total Income: ${currency}${totalIncome.toFixed(2)}
    - Total Expenses: ${currency}${totalExpense.toFixed(2)}
    
    Recent Transactions:
    ${recentTransactions}
    
    Guidelines:
    - Be concise and conversational.
    - Use emojis to make the conversation engaging.
    - Provide specific advice based on the user's spending habits if asked.
    - If the user asks about something not in the history, say you don't have that info yet.
    - Do NOT make up transactions. Only use the provided data.
    - If the user says "Hello" or "Hi", introduce yourself as their AI Financial Assistant.
    `;

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: message },
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.7,
                max_tokens: 300,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Groq API Error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "I'm having trouble thinking right now.";
    } catch (error) {
        console.error('Error calling Groq API:', error);
        return "Sorry, I'm having trouble connecting to my advanced AI brain. Please try again later.";
    }
}
