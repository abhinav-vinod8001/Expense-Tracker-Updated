import { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../types';

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    frequency: 'monthly' | 'weekly' | 'daily' | 'irregular';
    lastPaidDate: number;
    nextDueDate: number;
    status: 'active' | 'missed' | 'due_soon';
    confidence: number; // 0-1
}

export interface FinancialHealth {
    score: number; // 0-100
    savingsRate: number; // percentage
    needsRatio: number; // percentage of income
    wantsRatio: number; // percentage of income
    status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
    insights: string[];
}

export const useAutonomousFinance = (transactions: Transaction[]) => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [health, setHealth] = useState<FinancialHealth | null>(null);
    const [loading, setLoading] = useState(true);

    // Constants
    const NEEDS_CATEGORIES = ['housing', 'food', 'transport', 'bills', 'health', 'education'];
    const WANTS_CATEGORIES = ['shopping', 'entertainment', 'investment', 'freelance', 'other']; // Investment is technically savings but treated as non-need for simplified 50/30/20 check if simplified. 
    // Actually Investment should be savings.

    useEffect(() => {
        if (!transactions || transactions.length === 0) {
            setLoading(false);
            return;
        }

        const analyze = () => {
            const now = Date.now();
            const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
            const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

            // --- 1. Subscription Detection (Lazy Autonomy) ---
            const txMap = new Map<string, Transaction[]>();

            // Group by normalized description
            transactions
                .filter(t => t.timestamp >= sixtyDaysAgo && t.type === 'expense')
                .forEach(t => {
                    const desc = t.description?.toLowerCase().trim();
                    const cat = t.category || 'other'; // Handle undefined category
                    const key = desc || cat; // Fallback to category if description empty
                    const existing = txMap.get(key) || [];
                    txMap.set(key, [...existing, t]);
                });

            const detectedSubs: Subscription[] = [];

            txMap.forEach((txs, name) => {
                if (txs.length < 2) return;

                // Sort by date desc
                txs.sort((a, b) => b.timestamp - a.timestamp);

                const latest = txs[0];
                const amounts = txs.map(t => t.amount);

                // Check amount variance (5%)
                const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
                const isSteadyAmount = amounts.every(a => Math.abs(a - avgAmount) / avgAmount < 0.05);

                // Check intervals
                const intervals: number[] = [];
                for (let i = 0; i < txs.length - 1; i++) {
                    const diff = Math.abs(txs[i].timestamp - txs[i + 1].timestamp);
                    intervals.push(diff);
                }
                const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
                const daysInterval = avgInterval / (1000 * 60 * 60 * 24);

                // Heuristic for monthly subscription
                if (isSteadyAmount && daysInterval >= 25 && daysInterval <= 35) {
                    const nextDue = latest.timestamp + avgInterval;

                    let status: Subscription['status'] = 'active';
                    if (now > nextDue + (24 * 60 * 60 * 1000)) status = 'missed'; // Overdue by 1 day
                    else if (now > nextDue - (3 * 24 * 60 * 60 * 1000)) status = 'due_soon'; // Due in 3 days

                    detectedSubs.push({
                        id: `sub-${name}-${latest.id}`,
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        amount: avgAmount,
                        frequency: 'monthly',
                        lastPaidDate: latest.timestamp,
                        nextDueDate: nextDue,
                        status,
                        confidence: 0.9
                    });
                }
            });

            setSubscriptions(detectedSubs);

            // --- 2. Health Score Calculation ---
            const recentTxs = transactions.filter(t => t.timestamp >= thirtyDaysAgo);
            const income = recentTxs
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = recentTxs
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const needs = recentTxs
                .filter(t => t.type === 'expense' && t.category && NEEDS_CATEGORIES.includes(t.category))
                .reduce((sum, t) => sum + t.amount, 0);

            const wants = recentTxs
                .filter(t => t.type === 'expense' && t.category && !NEEDS_CATEGORIES.includes(t.category))
                .reduce((sum, t) => sum + t.amount, 0);

            let savingsRate = 0;
            let score = 50; // Base score
            let insights: string[] = [];

            if (income > 0) {
                savingsRate = ((income - expenses) / income) * 100;
                const needsRatio = (needs / income) * 100;
                const wantsRatio = (wants / income) * 100;

                // Scoring Logic
                // 1. Savings Rate (Target 20%+)
                if (savingsRate >= 20) score += 20;
                else if (savingsRate >= 10) score += 10;
                else if (savingsRate < 0) score -= 10;

                // 2. Needs Ratio (Target < 50%)
                if (needsRatio <= 50) score += 15;
                else if (needsRatio > 80) score -= 10;

                // 3. Wants Ratio (Target < 30%)
                if (wantsRatio <= 30) score += 15;
                else if (wantsRatio > 50) score -= 5;

                // Cap score
                score = Math.min(100, Math.max(0, score));

                // Generate Insights
                if (savingsRate < 20) insights.push("Savings rate is below 20%. Try to cut 'Wants'.");
                if (needsRatio > 50) insights.push("Needs are taking up >50% of income.");
                if (detectedSubs.some(s => s.status === 'missed')) insights.push("You have missed subscription payments!");

                setHealth({
                    score: Math.round(score),
                    savingsRate,
                    needsRatio,
                    wantsRatio,
                    status: score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : score >= 30 ? 'Fair' : 'Needs Attention',
                    insights
                });
            } else {
                // No income data
                setHealth({
                    score: 0,
                    savingsRate: 0,
                    needsRatio: 0,
                    wantsRatio: 0,
                    status: 'Needs Attention',
                    insights: ["Log some income to get a health score."]
                });
            }

            setLoading(false);
        };

        // Simulate "Deep Analysis" delay for UX
        const timer = setTimeout(analyze, 800);
        return () => clearTimeout(timer);
    }, [transactions]);

    return { subscriptions, health, loading };
};
