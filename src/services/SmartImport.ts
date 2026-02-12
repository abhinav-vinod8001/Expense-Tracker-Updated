import { Transaction } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface ExtractedTransaction {
    amount: number;
    type: 'expense' | 'income';
    category: string;
    description: string;
    date?: string; // ISO date string if detected, else today
}

const SYSTEM_PROMPT = `
You are a specialized Data Extraction AI.
Your ONLY job is to extract financial transactions from messy, unstructured text (SMS, Emails, Chat logs, Notes).

RULES:
1. Extract EVERY transaction found.
2. For each transaction, identify:
   - amount (number)
   - type ("expense" or "income") -> Default to "expense" unless it's a salary/deposit/refund.
   - category (one of: food, transport, shopping, bills, entertainment, health, education, salary, freelance, investment, housing, other)
   - description (short summary)
   - date (YYYY-MM-DD) -> If no year/month is specified, assume CURRENT YEAR. If "today"/"yesterday", calculate based on current date.
3. OUTPUT FORMAT:
   - Return a valid JSON ARRAY of objects.
   - NO preamble. NO markdown formatting like \`\`\`json. JUST the raw JSON array.
   - If no valid transactions are found, return empty array [].

EXAMPLE INPUT:
"EbixCash: INR 450.00 spent on Zomato. Also paid rent 15000 yesterday."

EXAMPLE OUTPUT:
[
  { "amount": 450, "type": "expense", "category": "food", "description": "Zomato Order", "date": "2024-05-12" },
  { "amount": 15000, "type": "expense", "category": "housing", "description": "Rent Payment", "date": "2024-05-11" }
]
`;

export async function parseMessyInput(text: string): Promise<ExtractedTransaction[]> {
    if (!GROQ_API_KEY) {
        console.error('Groq API Key is missing');
        throw new Error("API Key Missing");
    }

    if (!text || text.trim().length < 5) return [];

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: `Current Date: ${new Date().toISOString().split('T')[0]}\n\nINPUT TEXT:\n${text}` }
                ],
                model: 'llama-3.1-8b-instant',
                temperature: 0.1, // Low temp for extraction/formatting precision
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API Error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || "[]";

        // Clean potentially bad formatting (sometimes LLMs add markdown despite instructions)
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr) as ExtractedTransaction[];

    } catch (error) {
        console.error('Smart Import Error:', error);
        return [];
    }
}
