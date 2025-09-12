import React, { useMemo, useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Lightbulb, Target, PiggyBank, Calendar, Clock, BarChart3, Play, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { Transaction } from '../types';
import { generateAIRecommendations, generateFinancialInsight, AIRecommendation } from '../services/geminiService';
import { fetchFinanceVideos, fetchMoneySavingTips, YouTubeVideo } from '../services/youtubeService';

interface RecommendationsProps {
  transactions: Transaction[];
  currency: string;
  onBack: () => void;
}

const Recommendations: React.FC<RecommendationsProps> = ({ transactions, currency, onBack }) => {
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [financeVideos, setFinanceVideos] = useState<YouTubeVideo[]>([]);
  const [savingTips, setSavingTips] = useState<YouTubeVideo[]>([]);
  const [financialInsight, setFinancialInsight] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  useEffect(() => {
    if (transactions.length > 0) {
      loadAIRecommendations();
    }
    loadYouTubeContent();
  }, [transactions]);

  const loadAIRecommendations = async () => {
    setIsLoadingAI(true);
    try {
      const [recommendations, insight] = await Promise.all([
        generateAIRecommendations(transactions, currency),
        generateFinancialInsight(transactions, currency)
      ]);
      setAiRecommendations(recommendations);
      setFinancialInsight(insight);
    } catch (error) {
      console.error('Failed to load AI recommendations:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const loadYouTubeContent = async () => {
    setIsLoadingVideos(true);
    try {
      // Import the retry functions to ensure we get fresh content
      const { fetchFinanceVideosWithRetry, fetchMoneySavingTipsWithRetry } = await import('../services/youtubeService');
      
      const [videos, tips] = await Promise.all([
        fetchFinanceVideosWithRetry(transactions),
        fetchMoneySavingTipsWithRetry(transactions)
      ]);
      
      // Only update state if we got valid results
      if (videos && videos.length > 0) {
        setFinanceVideos(videos);
      }
      
      if (tips && tips.length > 0) {
        setSavingTips(tips);
      }
      
      // If we didn't get any videos, try to reload after a delay
      if ((!videos || videos.length === 0) && (!tips || tips.length === 0)) {
        console.log('No videos returned, scheduling retry...');
        setTimeout(() => {
          loadYouTubeContent();
        }, 5000); // Retry after 5 seconds
      }
    } catch (error) {
      console.error('Failed to load YouTube content:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };
  const insights = useMemo(() => {
    if (transactions.length === 0) {
      return {
        totalSpent: 0,
        averageDaily: 0,
        recommendations: [],
        monthlyTrend: 'stable',
        emergencyFundTarget: 0,
        weekendSpendingPercentage: 0,
        avgTransactionAmount: 0
      };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t => t.timestamp > thirtyDaysAgo.getTime());
    
    const totalSpent = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const averageDaily = totalSpent / 30;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    const recommendations: Array<{ type: 'warning' | 'success' | 'info' | 'goal'; title: string; description: string; icon: any; priority: number }> = [];

    // Calculate spending frequency and patterns
    const dailySpending = recentTransactions.filter(t => t.type === 'expense');
    const spendingDays = new Set(dailySpending.map(t => new Date(t.timestamp).toDateString())).size;
    const avgTransactionAmount = dailySpending.length > 0 ? totalSpent / dailySpending.length : 0;
    const weekendSpending = dailySpending.filter(t => {
      const day = new Date(t.timestamp).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    const weekendSpendingAmount = weekendSpending.reduce((sum, t) => sum + t.amount, 0);
    const weekendSpendingPercentage = totalSpent > 0 ? (weekendSpendingAmount / totalSpent) * 100 : 0;

    // Critical spending analysis
    const spendingPercentage = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
    
    if (totalIncome === 0 && totalSpent > 0) {
      recommendations.push({
        type: 'warning',
        title: 'No Income Recorded',
        description: `You've spent ${currency}${totalSpent.toFixed(2)} with no income recorded this period. Consider tracking your income sources.`,
        icon: AlertTriangle,
        priority: 1
      });
    } else if (totalSpent > totalIncome * 0.9 && totalIncome > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Critical Spending Alert',
        description: `You've spent ${currency}${totalSpent.toFixed(2)} (${spendingPercentage.toFixed(1)}% of income). Consider immediate budget adjustments to avoid debt.`,
        icon: AlertTriangle,
        priority: 1
      });
    } else if (totalSpent > totalIncome * 0.8 && totalIncome > 0) {
      recommendations.push({
        type: 'warning',
        title: 'High Spending Alert',
        description: `You've spent ${currency}${totalSpent.toFixed(2)} (${spendingPercentage.toFixed(1)}% of income). Consider reviewing non-essential expenses.`,
        icon: AlertTriangle,
        priority: 2
      });
    }

    // Enhanced savings analysis
    if (savingsRate < 10 && totalIncome > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Emergency: Low Savings Rate',
        description: `Your savings rate is only ${savingsRate.toFixed(1)}%. Start with saving just 1% this month and gradually increase to 20%.`,
        icon: PiggyBank,
        priority: 1
      });
    } else if (savingsRate < 20 && totalIncome > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Improve Your Savings Rate',
        description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Try to reach 20% by reducing one category of spending by 10%.`,
        icon: TrendingDown,
        priority: 3
      });
    } else if (savingsRate >= 20 && savingsRate < 30) {
      recommendations.push({
        type: 'success',
        title: 'Great Savings Habits!',
        description: `Excellent! You're saving ${savingsRate.toFixed(1)}% of your income. Consider increasing to 30% for even better financial security.`,
        icon: CheckCircle,
        priority: 5
      });
    } else if (savingsRate >= 30) {
      recommendations.push({
        type: 'success',
        title: 'Outstanding Financial Discipline!',
        description: `You're saving ${savingsRate.toFixed(1)}% of income! Consider investing some savings for long-term growth.`,
        icon: TrendingUp,
        priority: 5
      });
    }

    // Smart spending pattern analysis
    if (avgTransactionAmount > 100) {
      recommendations.push({
        type: 'info',
        title: 'Large Transaction Pattern',
        description: `Your average transaction is ${currency}${avgTransactionAmount.toFixed(2)}. Consider the 24-hour rule for purchases over ${currency}100.`,
        icon: Clock,
        priority: 4
      });
    }

    if (weekendSpendingPercentage > 40) {
      recommendations.push({
        type: 'info',
        title: 'Weekend Spending Pattern',
        description: `${weekendSpendingPercentage.toFixed(1)}% of your spending occurs on weekends. Plan weekend activities to avoid impulse purchases.`,
        icon: Calendar,
        priority: 4
      });
    }

    if (spendingDays < 10 && dailySpending.length > 10) {
      recommendations.push({
        type: 'info',
        title: 'Concentrated Spending Days',
        description: `You make most purchases on just ${spendingDays} days per month. This shows good spending discipline!`,
        icon: CheckCircle,
        priority: 5
      });
    }

    // Emergency fund recommendations
    const emergencyFundTarget = (totalIncome * 3); // 3 months of expenses
    if (totalIncome > 0) {
      recommendations.push({
        type: 'goal',
        title: 'Build Emergency Fund',
        description: `Aim to save ${currency}${emergencyFundTarget.toFixed(2)} (3 months of income) for emergencies. Start with ${currency}${(emergencyFundTarget / 12).toFixed(2)} per month.`,
        icon: Target,
        priority: 2
      });
    }

    // Transaction frequency analysis
    if (recentTransactions.length > 80) {
      recommendations.push({
        type: 'info',
        title: 'High Transaction Frequency',
        description: `${recentTransactions.length} transactions in 30 days suggests frequent small purchases. Try batch buying or weekly shopping trips.`,
        icon: BarChart3,
        priority: 4
      });
    } else if (recentTransactions.length < 20 && totalSpent > 0) {
      recommendations.push({
        type: 'success',
        title: 'Mindful Spending Pattern',
        description: 'You make thoughtful, less frequent purchases. This shows good spending discipline!',
        icon: CheckCircle,
        priority: 5
      });
    }

    // Income-based recommendations
    if (totalIncome > totalSpent * 2) {
      recommendations.push({
        type: 'goal',
        title: 'Investment Opportunity',
        description: `With your strong income-to-expense ratio, consider investing ${currency}${((totalIncome - totalSpent) * 0.3).toFixed(2)} monthly for long-term growth.`,
        icon: TrendingUp,
        priority: 3
      });
    }

    // Smart budgeting tips based on their data
    if (dailySpending.length > 0) {
      recommendations.push({
        type: 'info',
        title: 'Personalized Budget Tip',
        description: `Based on your ${currency}${averageDaily.toFixed(2)} daily average, try setting a daily limit of ${currency}${(averageDaily * 0.9).toFixed(2)} to save 10% more.`,
        icon: Lightbulb,
        priority: 4
      });
    }

    // Goal-setting recommendation
    recommendations.push({
      type: 'goal',
      title: 'Set a Financial Goal',
      description: `Define a specific savings goal for next month. Whether it's ${currency}100 or ${currency}1000, having a target improves success rates by 42%.`,
      icon: Target,
      priority: 3
    });

    // Sort recommendations by priority (lower number = higher priority)
    const sortedRecommendations = recommendations.sort((a, b) => (a.priority || 5) - (b.priority || 5));

    return {
      totalSpent,
      averageDaily,
      recommendations: sortedRecommendations,
      monthlyTrend: totalSpent > averageDaily * 35 ? 'increasing' : totalSpent < averageDaily * 25 ? 'decreasing' : 'stable',
      emergencyFundTarget,
      weekendSpendingPercentage,
      avgTransactionAmount
    };
  }, [transactions, currency]);

  const getIconColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-amber-600';
      case 'success': return 'text-green-600';
      case 'goal': return 'text-purple-600';
      default: return 'text-blue-600';
    }
  };

  const getAIIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'goal': return Target;
      default: return Lightbulb;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-100 dark:bg-amber-900/20';
      case 'success': return 'bg-green-100 dark:bg-green-900/20';
      case 'goal': return 'bg-purple-100 dark:bg-purple-900/20';
      default: return 'bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const getBorderColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-l-amber-500';
      case 'success': return 'border-l-green-500';
      case 'goal': return 'border-l-purple-500';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center px-6 py-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Spending Insights</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">30-Day Spending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currency}{insights.totalSpent.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <TrendingDown className="text-red-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Average</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currency}{insights.averageDaily.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekend Spending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {insights.weekendSpendingPercentage.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Powered Personalized Financial Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Sparkles size={24} className="text-yellow-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                AI Powered Personalized Financial Insights
              </h2>
              {isLoadingAI && <Loader2 size={16} className="animate-spin text-gray-400" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Smart analysis of your spending patterns with personalized recommendations to help you save more
            </p>
          </div>

          {/* Motivational Header */}
          {transactions.length > 0 && (
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <PiggyBank size={32} className="text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Financial Journey Starts Here!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Every small step towards better spending habits builds lasting wealth</p>
                  </div>
                </div>
                {financialInsight && (
                  <div className="mt-4 p-4 bg-white/70 dark:bg-gray-800/70 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 italic font-medium">"{financialInsight}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {insights.recommendations.length === 0 && aiRecommendations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles size={24} className="text-purple-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Ready to unlock AI-powered insights?</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Start tracking your expenses to get personalized financial guidance and savings recommendations
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {/* Combined AI and Local Recommendations */}
              {[...aiRecommendations, ...insights.recommendations].slice(0, 6).map((rec, index) => {
                const Icon = (rec as any).icon || getAIIcon(rec.type);
                const isAIGenerated = !(rec as any).icon; // AI recommendations don't have icon property
                return (
                  <div key={index} className={`p-6 border-l-4 ${getBorderColor(rec.type)} ${rec.priority <= 2 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${getBgColor(rec.type)}`}>
                        <Icon size={20} className={getIconColor(rec.type)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {rec.title}
                          </h3>
                          {rec.priority <= 2 && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                              High Priority
                            </span>
                          )}
                          {rec.type === 'goal' && (
                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                              Goal
                            </span>
                          )}
                          {isAIGenerated && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                              AI Powered
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Additional Motivational Savings Insights */}
              {transactions.length > 0 && (
                <>
                  <div className="p-6 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                        <PiggyBank size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">The Power of Small Savings</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                            Motivation
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Saving just {currency}5 per day adds up to {currency}1,825 per year! Start with small changes like making coffee at home or walking instead of taking transport for short distances. Every dollar saved is a step towards financial freedom.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-l-4 border-l-blue-500">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                        <Target size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Your Savings Potential</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                            Opportunity
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Based on your spending patterns, you could potentially save {currency}{Math.max(insights.averageDaily * 7, 50).toFixed(0)} per week by reducing just 10% of your expenses. This could grow into {currency}{Math.max(insights.averageDaily * 7 * 52, 2600).toFixed(0)} saved annually!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-l-4 border-l-purple-500">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                        <TrendingUp size={20} className="text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Build Your Financial Momentum</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                            Growth
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          You're already on the right track by tracking your expenses! The next step is automating your savings. Set up a weekly transfer of {currency}{Math.max(insights.totalSpent * 0.05, 25).toFixed(0)} to a separate account. Automation removes the temptation to spend and builds wealth effortlessly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                        <Lightbulb size={20} className="text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">Smart Spending Wins</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 rounded-full">
                            Action
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          Challenge yourself to a "no-spend day" once a week - buy only essentials and see how much you save! Use that saved money to reward yourself with something meaningful, or better yet, add it to your emergency fund for peace of mind.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actionable Next Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Target size={24} className="text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Next Steps</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Take action this week to improve your financial health
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">This Week:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Set a daily spending limit of {currency}{Math.max(insights.averageDaily * 0.9, 10).toFixed(0)}</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Review your 3 largest expenses from last week</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Save {currency}{Math.max(insights.averageDaily * 0.2, 5).toFixed(0)} by skipping one unnecessary purchase</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white">This Month:</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Open a separate savings account for emergencies</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Track your spending for 7 consecutive days</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-600 dark:text-gray-300">Set up automatic transfer of {currency}{Math.max(insights.totalSpent * 0.1, 50).toFixed(0)} to savings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI-Generated Insights */}
        {transactions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Sparkles size={24} className="text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Financial Insights</h2>
                {isLoadingAI && <Loader2 size={16} className="animate-spin text-gray-400" />}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Powered by advanced AI analysis of your spending patterns
              </p>
            </div>
            
            {financialInsight && (
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300 italic">"{financialInsight}"</p>
                </div>
              </div>
            )}
            
            {aiRecommendations.length > 0 && (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {aiRecommendations.map((rec, index) => {
                  const AIIcon = getAIIcon(rec.type);
                  return (
                    <div key={index} className={`p-6 border-l-4 ${getBorderColor(rec.type)}`}>
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${getBgColor(rec.type)}`}>
                          <AIIcon size={20} className={getIconColor(rec.type)} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {rec.title}
                            </h3>
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                              AI Generated
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Finance Videos */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Play size={24} className="text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recommended Finance Videos</h2>
              {isLoadingVideos && <Loader2 size={16} className="animate-spin text-gray-400" />}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Educational content to improve your financial knowledge
            </p>
          </div>
          
          <div className="p-6">
            {financeVideos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {financeVideos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <Play size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {video.channelTitle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Play size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading finance videos...</p>
              </div>
            )}
          </div>
        </div>

        {/* Money Saving Tips */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <PiggyBank size={24} className="text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Money Saving Tips</h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Quick tips and hacks to save money in your daily life
            </p>
          </div>
          
          <div className="p-6">
            {savingTips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savingTips.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                        <Play size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="p-3 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {video.channelTitle}
                      </p>
                    </div>
                    <div className="p-3 flex items-center">
                      <ExternalLink size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PiggyBank size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Loading saving tips...</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Quick Tips */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb size={24} />
            <h3 className="text-lg font-semibold">Smart Money Habits</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Daily Habits</h4>
              <p>• Check balance before purchases</p>
              <p>• Use cash for small expenses</p>
              <p>• Wait 10 minutes before buying</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Weekly Routines</h4>
              <p>• Review all transactions</p>
              <p>• Plan next week's expenses</p>
              <p>• Celebrate savings wins</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium mb-2">Monthly Goals</h4>
              <p>• Increase savings by 1%</p>
              <p>• Find one cost to reduce</p>
              <p>• Build emergency fund</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recommendations;