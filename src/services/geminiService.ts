import { Transaction } from '../types';

// For security reasons, the Gemini API should be called from a backend server
// This service provides local analysis and recommendations instead
// TODO: Move to server-side implementation for production AI features

export interface AIRecommendation {
  type: 'warning' | 'success' | 'info' | 'goal';
  title: string;
  description: string;
  priority: number;
}

export async function generateAIRecommendations(
  transactions: Transaction[],
  currency: string
): Promise<AIRecommendation[]> {
  try {
    // Smart analysis-based recommendations (no external API required)
    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const recentTransactions = transactions.slice(0, 30);
    const avgTransaction = totalSpent / Math.max(transactions.filter(t => t.type === 'expense').length, 1);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
    
    const recommendations: AIRecommendation[] = [];

    // Smart spending analysis
    if (totalSpent > totalIncome * 0.9 && totalIncome > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Critical Spending Alert',
        description: `Your spending of ${currency}${totalSpent.toFixed(2)} is ${((totalSpent/totalIncome)*100).toFixed(1)}% of your income. Consider cutting non-essential expenses immediately to avoid debt.`,
        priority: 1
      });
    }

    // Savings recommendations
    if (savingsRate < 10 && totalIncome > 0) {
      recommendations.push({
        type: 'goal',
        title: 'Start Building Emergency Fund',
        description: `Begin by saving just ${currency}${Math.max(totalIncome * 0.05, 25).toFixed(0)} monthly (5% of income). Small steps lead to big financial security gains.`,
        priority: 2
      });
    } else if (savingsRate >= 20) {
      recommendations.push({
        type: 'success',
        title: 'Excellent Savings Discipline!',
        description: `You're saving ${savingsRate.toFixed(1)}% of your income. Consider investing a portion for long-term growth opportunities.`,
        priority: 4
      });
    }

    // Transaction pattern insights
    if (avgTransaction > 100) {
      recommendations.push({
        type: 'info',
        title: 'Large Purchase Pattern Detected',
        description: `Your average transaction is ${currency}${avgTransaction.toFixed(2)}. Consider implementing a 24-hour waiting period for purchases over ${currency}100 to reduce impulse buying.`,
        priority: 3
      });
    }

    // Goal setting
    recommendations.push({
      type: 'goal',
      title: 'Set Monthly Financial Target',
      description: `Create a specific goal like saving ${currency}${Math.max(totalSpent * 0.1, 50).toFixed(0)} this month. Having clear targets increases success rates by 42%.`,
      priority: 3
    });

    // Financial education
    if (transactions.length > 20) {
      recommendations.push({
        type: 'info',
        title: 'Track Spending Categories',
        description: 'Consider categorizing your expenses (food, transport, entertainment) to identify your biggest spending areas and optimization opportunities.',
        priority: 4
      });
    }

    return recommendations.slice(0, 4); // Return top 4 recommendations
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return [];
  }
}

export async function generateFinancialInsight(
  transactions: Transaction[],
  currency: string
): Promise<string> {
  try {
    const totalSpent = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const transactionCount = transactions.length;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
    const avgDailySpending = totalSpent / 30;

    // Generate contextual insights based on data patterns
    if (totalIncome === 0 && totalSpent > 0) {
      return `You've tracked ${currency}${totalSpent.toFixed(2)} in expenses across ${transactionCount} transactions, but no income is recorded. Consider tracking all income sources for a complete financial picture.`;
    }

    if (savingsRate < 0) {
      return `Your spending of ${currency}${totalSpent.toFixed(2)} exceeds your income of ${currency}${totalIncome.toFixed(2)}. Focus on reducing expenses or increasing income to achieve financial stability.`;
    }

    if (savingsRate >= 30) {
      return `Excellent financial management! You're saving ${savingsRate.toFixed(1)}% of your ${currency}${totalIncome.toFixed(2)} income with ${transactionCount} tracked transactions. Consider investing surplus for long-term growth.`;
    }

    if (savingsRate >= 15) {
      return `Good financial discipline shown with a ${savingsRate.toFixed(1)}% savings rate. Your ${currency}${avgDailySpending.toFixed(2)} daily spending average suggests mindful money management habits.`;
    }

    return `Based on ${transactionCount} transactions, you're spending ${currency}${avgDailySpending.toFixed(2)} daily with a ${savingsRate.toFixed(1)}% savings rate. Focus on small optimizations to improve your financial health gradually.`;
  } catch (error) {
    console.error('Error generating financial insight:', error);
    return "Financial analysis temporarily unavailable. Your transaction data shows valuable patterns that can guide better spending decisions.";
  }
}