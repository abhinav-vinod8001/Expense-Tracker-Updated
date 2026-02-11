import { TransactionCategory } from '../types';

interface CategoryMatch {
    category: TransactionCategory;
    confidence: number;
}

// Keyword → Category mapping with 60+ keywords
const CATEGORY_KEYWORDS: Record<TransactionCategory, string[]> = {
    food: [
        'food', 'grocery', 'groceries', 'restaurant', 'lunch', 'dinner', 'breakfast',
        'snack', 'coffee', 'tea', 'cafe', 'pizza', 'burger', 'chicken', 'rice',
        'biryani', 'dosa', 'swiggy', 'zomato', 'ubereats', 'doordash', 'takeout',
        'takeaway', 'eat', 'eating', 'meal', 'drink', 'juice', 'milk', 'bread',
        'fruit', 'vegetables', 'cooking', 'kitchen', 'bakery', 'ice cream', 'dessert',
    ],
    transport: [
        'uber', 'ola', 'lyft', 'taxi', 'cab', 'bus', 'train', 'metro', 'subway',
        'fuel', 'petrol', 'diesel', 'gas', 'gasoline', 'parking', 'toll', 'flight',
        'airline', 'ticket', 'travel', 'commute', 'auto', 'rickshaw', 'rapido',
        'bike', 'car wash', 'car service', 'vehicle', 'transport',
    ],
    shopping: [
        'shopping', 'amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'shirt',
        'dress', 'jeans', 'bag', 'accessories', 'watch', 'jewelry', 'electronics',
        'phone', 'laptop', 'gadget', 'headphones', 'earbuds', 'gift', 'present',
        'furniture', 'decor', 'cosmetics', 'makeup', 'perfume',
    ],
    bills: [
        'electricity', 'electric', 'power', 'water', 'gas bill', 'internet', 'wifi',
        'broadband', 'mobile', 'phone bill', 'recharge', 'postpaid', 'prepaid',
        'subscription', 'insurance', 'premium', 'tax', 'emi', 'installment',
        'utility', 'utilities', 'bill', 'maintenance',
    ],
    entertainment: [
        'movie', 'cinema', 'theatre', 'netflix', 'spotify', 'prime', 'hotstar',
        'disney', 'game', 'gaming', 'xbox', 'playstation', 'steam', 'concert',
        'party', 'club', 'bar', 'pub', 'drinks', 'alcohol', 'beer', 'wine',
        'event', 'ticket', 'music', 'youtube premium', 'streaming',
    ],
    health: [
        'doctor', 'hospital', 'clinic', 'medicine', 'pharmacy', 'medical',
        'health', 'gym', 'fitness', 'yoga', 'dentist', 'eye', 'dental',
        'therapy', 'physiotherapy', 'lab test', 'blood test', 'checkup',
        'prescription', 'vitamin', 'supplement', 'surgical',
    ],
    education: [
        'course', 'class', 'tuition', 'fees', 'book', 'books', 'stationery',
        'pen', 'notebook', 'udemy', 'coursera', 'college', 'school', 'university',
        'exam', 'certification', 'training', 'tutorial', 'workshop', 'seminar',
        'library', 'study', 'learning', 'education',
    ],
    salary: [
        'salary', 'paycheck', 'wages', 'monthly pay', 'pay day', 'stipend',
        'compensation', 'payroll',
    ],
    freelance: [
        'freelance', 'freelancing', 'client', 'project', 'gig', 'side hustle',
        'contract', 'consulting', 'upwork', 'fiverr',
    ],
    investment: [
        'investment', 'invest', 'stock', 'shares', 'mutual fund', 'sip',
        'crypto', 'bitcoin', 'dividend', 'interest', 'fixed deposit', 'fd',
        'bond', 'returns', 'portfolio', 'trading',
    ],
    housing: [
        'rent', 'lease', 'mortgage', 'apartment', 'house', 'room',
        'accommodation', 'housing', 'hostel', 'pg', 'flat', 'property',
        'landlord', 'tenant',
    ],
    other: [],
};

/**
 * Detect the category of a transaction from the message text.
 * Returns the best matching category with a confidence score.
 */
export function detectCategory(message: string): CategoryMatch {
    const lower = message.toLowerCase();
    const scores: Partial<Record<TransactionCategory, number>> = {};

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (category === 'other') continue;

        let score = 0;
        for (const keyword of keywords) {
            // Use word boundary regex for strict matching
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            if (regex.test(lower)) {
                // Longer keyword matches get higher scores (more specific)
                score += keyword.length;
            }
        }

        if (score > 0) {
            scores[category as TransactionCategory] = score;
        }
    }

    // Find the category with the highest score
    let bestCategory: TransactionCategory = 'other';
    let bestScore = 0;

    for (const [category, score] of Object.entries(scores)) {
        if (score > bestScore) {
            bestScore = score;
            bestCategory = category as TransactionCategory;
        }
    }

    // Confidence is based on how strong the match is
    const confidence = bestScore > 0 ? Math.min(bestScore / 10, 1) : 0;

    return { category: bestCategory, confidence };
}

/**
 * Get all categories as an array for display purposes.
 */
export function getAllCategories(): TransactionCategory[] {
    return Object.keys(CATEGORY_KEYWORDS).filter(c => c !== 'other') as TransactionCategory[];
}
