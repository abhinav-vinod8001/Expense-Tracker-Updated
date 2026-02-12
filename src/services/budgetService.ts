import { Transaction, Budget, TransactionCategory, CATEGORY_META } from '../types';

export const calculateMonthlySpending = (transactions: Transaction[]): Record<string, number> => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const spending: Record<string, number> = {};

    transactions.forEach(t => {
        const tDate = new Date(t.timestamp);
        if (t.type === 'expense' && t.category && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        }
    });

    return spending;
};

export const checkBudgetExceeded = (transaction: Transaction, budgets: Budget[]): { exceeded: boolean; budget?: Budget; percent: number } => {
    if (transaction.type !== 'expense' || !transaction.category) return { exceeded: false, percent: 0 };

    const budget = budgets.find(b => b.category === transaction.category);
    if (!budget) return { exceeded: false, percent: 0 };

    // Calculate distinct spending for this category/month (including this new transaction if it's not yet in history? 
    // Usually this is called BEFORE adding, or AFTER. Assuming AFTER for now, or we pass current usage).
    // Ideally we need the CURRENT total spending. 
    // For simplicity, let's assume we pass the total spending + current amount?
    // But this function takes a single transaction. 
    // Let's refactor: checkBudgetStatus(category, currentSpent, budgetLimit).

    return { exceeded: false, percent: 0 };
};

export const getBudgetStatus = (category: string, currentSpent: number, budgets: Budget[]): { budget: Budget | undefined; percent: number; isExceeded: boolean } => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return { budget: undefined, percent: 0, isExceeded: false };

    const percent = (currentSpent / budget.limit) * 100;
    return {
        budget,
        percent,
        isExceeded: currentSpent > budget.limit
    };
};
