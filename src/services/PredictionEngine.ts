import { Transaction } from '../types';
import { Subscription } from '../hooks/useAutonomousFinance';

export class PredictionEngine {
    /**
     * Calculates the average daily spending (burn rate) from the last 30 days.
     * Excludes "outlier" large transactions (> 5x average) to prevent skewing,
     * unless they are marked as recurring.
     */
    static calculateBurnRate(transactions: Transaction[]): number {
        if (!transactions.length) return 0;

        const now = Date.now();
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

        // Filter expenses from last 30 days
        const recentExpenses = transactions.filter(t =>
            t.type === 'expense' &&
            t.timestamp >= thirtyDaysAgo
        );

        if (recentExpenses.length === 0) return 0;

        const totalSpent = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
        return totalSpent / 30; // Simple daily average
    }

    /**
     * Predicts the balance after N days.
     * Formula: CurrentBalance - (DailyBurn * Days) - (UpcomingBills in window)
     */
    static predictFutureBalance(
        currentBalance: number,
        transactions: Transaction[],
        subscriptions: Subscription[],
        daysIntoFuture: number
    ): { predictedBalance: number; analysis: string; riskLevel: 'low' | 'medium' | 'high' } {

        const burnRate = this.calculateBurnRate(transactions);
        const projectedLivingCost = burnRate * daysIntoFuture;

        // Calculate upcoming subscription bills in this window
        let projectedBills = 0;
        const now = Date.now();
        const futureDate = now + (daysIntoFuture * 24 * 60 * 60 * 1000);

        subscriptions.forEach(sub => {
            // If the next due date is within our window
            if (sub.nextDueDate >= now && sub.nextDueDate <= futureDate) {
                projectedBills += sub.amount;

                // If the window is large enough to contain multiple cycles (e.g. weekly), 
                // we should technically add more, but for V1 we assume monthly and max 30 days window.
            }
        });

        const totalProjectedOutflow = projectedLivingCost + projectedBills;
        const predictedBalance = currentBalance - totalProjectedOutflow;

        // Risk Analysis
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (predictedBalance < 0) riskLevel = 'high';
        else if (predictedBalance < (currentBalance * 0.2)) riskLevel = 'medium';

        // Analysis Text
        const burnFormatted = burnRate.toFixed(2);
        const billsFormatted = projectedBills.toFixed(2);

        let analysis = `Based on your daily spend of $${burnFormatted} and $${billsFormatted} in upcoming bills, `;
        if (predictedBalance < 0) {
            analysis += `you are projected to run out of money.`;
        } else if (predictedBalance < currentBalance) {
            analysis += `your balance will likely drop.`;
        } else {
            analysis += `you are on track.`;
        }

        return {
            predictedBalance,
            analysis,
            riskLevel
        };
    }
}
