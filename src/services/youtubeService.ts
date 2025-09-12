export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
}

// Fallback data for when the YouTube API quota is exceeded
// These are used as a last resort when API calls fail
const fallbackFinanceVideos: YouTubeVideo[] = [
  {
    id: "udHzPjxq2lg",
    title: "How To Save $10,000 FAST",
    description: "Practical strategies to save money quickly and efficiently.",
    thumbnail: "https://i.ytimg.com/vi/udHzPjxq2lg/mqdefault.jpg",
    channelTitle: "Graham Stephan",
    publishedAt: "2023-01-15T14:00:00Z"
  },
  {
    id: "KhwtGd2qQLY",
    title: "Secrets to Getting Rich in 2023 | Ultimate Guide",
    description: "Comprehensive guide to building wealth and financial independence.",
    thumbnail: "https://i.ytimg.com/vi/KhwtGd2qQLY/mqdefault.jpg",
    channelTitle: "WhiteBoard Finance",
    publishedAt: "2023-02-20T16:30:00Z"
  },
  {
    id: "rJZlK-WhS4k",
    title: "Top 5 Personal Finance Tips for 2023",
    description: "Essential tips to master your money and secure your financial future.",
    thumbnail: "https://i.ytimg.com/vi/rJZlK-WhS4k/mqdefault.jpg",
    channelTitle: "Explore with Tayyab",
    publishedAt: "2023-03-10T12:45:00Z"
  },
  {
    id: "HQzoZfc3GwQ",
    title: "How To Manage Your Money (50/30/20 Rule)",
    description: "Learn the popular 50/30/20 budgeting rule to effectively manage your finances.",
    thumbnail: "https://i.ytimg.com/vi/HQzoZfc3GwQ/mqdefault.jpg",
    channelTitle: "WhiteBoard Finance",
    publishedAt: "2023-04-05T09:15:00Z"
  },
  {
    id: "h2KvsHpcj7c",
    title: "How to Create Wealth from ZERO in 2023 (7 Personal Finance Tips)",
    description: "Strategies to build wealth from scratch using proven personal finance principles.",
    thumbnail: "https://i.ytimg.com/vi/h2KvsHpcj7c/mqdefault.jpg",
    channelTitle: "Better Wallet",
    publishedAt: "2023-05-12T18:20:00Z"
  }
];

// Cache to store previously fetched videos with timestamp
interface CachedVideos {
  videos: YouTubeVideo[];
  timestamp: number;
  query: string;
}

// Cache for finance videos and saving tips
let financeVideosCache: CachedVideos | null = null;
let savingTipsCache: CachedVideos | null = null;

// Cache expiration time in milliseconds (1 hour)
const CACHE_EXPIRATION = 60 * 60 * 1000;

const fallbackSavingTips: YouTubeVideo[] = [
  {
    id: "udHzPjxq2lg",
    title: "How To Save $10,000 FAST",
    description: "Practical strategies to save money quickly and efficiently.",
    thumbnail: "https://i.ytimg.com/vi/udHzPjxq2lg/mqdefault.jpg",
    channelTitle: "Graham Stephan",
    publishedAt: "2023-01-25T11:30:00Z"
  },
  {
    id: "HQzoZfc3GwQ",
    title: "How To Manage Your Money (50/30/20 Rule)",
    description: "Learn the popular 50/30/20 budgeting rule to effectively manage your finances.",
    thumbnail: "https://i.ytimg.com/vi/HQzoZfc3GwQ/mqdefault.jpg",
    channelTitle: "WhiteBoard Finance",
    publishedAt: "2023-02-18T14:45:00Z"
  },
  {
    id: "rJZlK-WhS4k",
    title: "Top 5 Personal Finance Tips for 2023",
    description: "Essential tips to master your money and secure your financial future.",
    thumbnail: "https://i.ytimg.com/vi/rJZlK-WhS4k/mqdefault.jpg",
    channelTitle: "Explore with Tayyab",
    publishedAt: "2023-03-22T10:15:00Z"
  },
  {
    id: "h2KvsHpcj7c",
    title: "How to Create Wealth from ZERO in 2023 (7 Personal Finance Tips)",
    description: "Strategies to build wealth from scratch using proven personal finance principles.",
    thumbnail: "https://i.ytimg.com/vi/h2KvsHpcj7c/mqdefault.jpg",
    channelTitle: "Better Wallet",
    publishedAt: "2023-04-30T16:20:00Z"
  }
];

const getYouTubeApiKey = () => {
  return import.meta.env.VITE_YOUTUBE_API_KEY || 
         import.meta.env.YOUTUBE_API_KEY || 
         "";
};

export async function fetchFinanceVideos(transactions: { amount: number; type: 'expense' | 'income'; timestamp: number }[] = []): Promise<YouTubeVideo[]> {
  try {
    // Get personalized search queries based on transaction data
    const searchQueries = getPersonalizedFinanceQueries(transactions);
    
    // Select a random query from our personalized list
    const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    console.log('Using personalized search query:', query);
    
    // Check if we have a valid cache for this query
    const now = Date.now();
    if (financeVideosCache && 
        financeVideosCache.query === query && 
        now - financeVideosCache.timestamp < CACHE_EXPIRATION && 
        financeVideosCache.videos.length > 0) {
      console.log('Using cached finance videos');
      return financeVideosCache.videos;
    }
    
    // No valid cache, fetch from API
    const API_KEY = getYouTubeApiKey();
    if (!API_KEY) {
      console.warn('YouTube API key not available');
      return await fetchAlternativeFinanceVideos(query) || fallbackFinanceVideos;
    }
    
    // Add a timestamp parameter to prevent caching by the browser or CDN
    const timestamp = Date.now();
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(query)}&` +
      `type=video&` +
      `maxResults=6&` +
      `order=date&` + // Changed from relevance to date to get newer content
      `videoDuration=medium&` +
      `key=${API_KEY}&` +
      `_=${timestamp}` // Add cache-busting parameter
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      
      // Check if the error is due to quota exceeded
      if (response.status === 403 && 
          errorData?.error?.errors?.some((e: any) => e.reason === "quotaExceeded")) {
        console.log("YouTube API quota exceeded, trying alternative source");
        return await fetchAlternativeFinanceVideos(query) || fallbackFinanceVideos;
      }
      
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No videos found from YouTube API, trying alternative source');
      return await fetchAlternativeFinanceVideos(query) || fallbackFinanceVideos;
    }
    
    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    // Update cache
    financeVideosCache = {
      videos,
      timestamp: now,
      query
    };

    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    // Try alternative source before falling back to static content
    const searchQueries = getPersonalizedFinanceQueries(transactions);
    const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    return await fetchAlternativeFinanceVideos(query) || fallbackFinanceVideos;
  }
}

// Helper function to get personalized finance queries based on transaction data
function getPersonalizedFinanceQueries(transactions: { amount: number; type: 'expense' | 'income'; timestamp: number }[]): string[] {
  // Default search queries
  let searchQueries = [
    'personal finance tips 2023',
    'money saving tips this month',
    'budgeting for beginners latest',
    'financial planning advice new'
  ];

  // Personalize search queries based on transaction data if available
  if (transactions.length > 0) {
    // Get recent transactions (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t => t.timestamp > thirtyDaysAgo.getTime());
    
    // Calculate spending metrics
    const totalSpent = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;
    const spendingPercentage = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;
    
    // Personalize queries based on spending patterns
    searchQueries = [];
    
    // Add current year to make queries more relevant
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    
    // High spending relative to income
    if (spendingPercentage > 80) {
      searchQueries.push(
        `how to reduce expenses ${currentYear}`, 
        `emergency budget plan ${currentMonth} ${currentYear}`, 
        `stop overspending new tips ${currentYear}`
      );
    }
    
    // Low savings rate
    if (savingsRate < 20 && totalIncome > 0) {
      searchQueries.push(
        `how to increase savings rate ${currentYear}`, 
        `save money on tight budget ${currentMonth}`,
        `best savings strategies ${currentYear}`
      );
    }
    
    // Good savings habits
    if (savingsRate >= 30) {
      searchQueries.push(
        `investment strategies for beginners ${currentYear}`, 
        `wealth building tips ${currentMonth} ${currentYear}`,
        `best investment options ${currentYear}`
      );
    }
    
    // No income recorded
    if (totalIncome === 0 && totalSpent > 0) {
      searchQueries.push(
        `side hustle ideas ${currentYear}`, 
        `how to increase income ${currentMonth}`,
        `passive income strategies ${currentYear}`
      );
    }
    
    // If we couldn't personalize based on patterns, use default queries with current year
    if (searchQueries.length === 0) {
      searchQueries = [
        `personal finance tips ${currentYear}`,
        `money saving tips ${currentMonth} ${currentYear}`,
        `budgeting for beginners ${currentYear}`,
        `financial planning advice ${currentYear}`
      ];
    }
  }

  // Flatten and deduplicate queries
  return [...new Set(searchQueries.flat())];
}

// Alternative source for finance videos when YouTube API fails
async function fetchAlternativeFinanceVideos(query: string): Promise<YouTubeVideo[] | null> {
  try {
    // Try to fetch from a different endpoint or use a different approach
    // This is a placeholder for an alternative API or method
    // For now, we'll return null to indicate no alternative source is available
    console.log('Attempting to fetch from alternative source with query:', query);
    
    // In a real implementation, you might use a different API or scraping technique
    // For example, you could use a different video platform API or RSS feed
    
    return null;
  } catch (error) {
    console.error('Error fetching from alternative source:', error);
    return null;
  }
}

export async function fetchFinanceVideosWithRetry(transactions: { amount: number; type: 'expense' | 'income'; timestamp: number }[] = []): Promise<YouTubeVideo[]> {
  // Try up to 3 times to fetch finance videos
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      const videos = await fetchFinanceVideos(transactions);
      if (videos.length > 0) {
        return videos;
      }
      retries++;
      console.log(`Retry ${retries}/${maxRetries} for finance videos`);
    } catch (error) {
      retries++;
      console.error(`Error on retry ${retries}/${maxRetries}:`, error);
    }
  }
  
  // If all retries fail, return fallback data
  console.warn('All retries failed, using fallback finance videos');
  return fallbackFinanceVideos;
}

// Helper function to get personalized saving tips queries based on transaction data
function getPersonalizedSavingTipsQuery(transactions: { amount: number; type: 'expense' | 'income'; timestamp: number }[]): string {
  // Default search query
  let searchQuery = 'money saving hacks tips tricks';
  
  // Add current year to make query more relevant
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  searchQuery = `${searchQuery} ${currentYear} ${currentMonth}`;
  
  if (transactions.length > 0) {
    // Get recent transactions (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentTransactions = transactions.filter(t => t.timestamp > thirtyDaysAgo.getTime());
    
    // Calculate spending metrics
    const expenses = recentTransactions.filter(t => t.type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // If we have enough transaction data to analyze
    if (expenses.length >= 5) {
      // Find the average transaction amount
      const avgAmount = totalSpent / expenses.length;
      
      if (avgAmount > 100) {
        searchQuery = `how to reduce large expenses tips ${currentYear} ${currentMonth}`;
      } else if (avgAmount < 20) {
        searchQuery = `save money on small purchases tips ${currentYear} ${currentMonth}`;
      }
      
      // Check weekend spending pattern
      const weekendSpending = expenses.filter(t => {
        const day = new Date(t.timestamp).getDay();
        return day === 0 || day === 6; // Sunday or Saturday
      });
      
      const weekendSpendingAmount = weekendSpending.reduce((sum, t) => sum + t.amount, 0);
      const weekendSpendingPercentage = totalSpent > 0 ? (weekendSpendingAmount / totalSpent) * 100 : 0;
      
      if (weekendSpendingPercentage > 40) {
        searchQuery = `weekend spending habits money saving tips ${currentYear} ${currentMonth}`;
      }
    }
  }
  
  return searchQuery;
}

// Alternative source for saving tips videos when YouTube API fails
async function fetchAlternativeSavingTips(query: string): Promise<YouTubeVideo[] | null> {
  try {
    // Try to fetch from a different endpoint or use a different approach
    // This is a placeholder for an alternative API or method
    console.log('Attempting to fetch saving tips from alternative source with query:', query);
    
    // In a real implementation, you might use a different API or scraping technique
    return null;
  } catch (error) {
    console.error('Error fetching saving tips from alternative source:', error);
    return null;
  }
}

export async function fetchMoneySavingTips(transactions: { amount: number; type: 'expense' | 'income'; timestamp: number }[] = []): Promise<YouTubeVideo[]> {
  try {
    // Get personalized search query based on transaction data
    const searchQuery = getPersonalizedSavingTipsQuery(transactions);
    console.log('Using personalized saving tips query:', searchQuery);
    
    // Check if we have a valid cache for this query
    const now = Date.now();
    if (savingTipsCache && 
        savingTipsCache.query === searchQuery && 
        now - savingTipsCache.timestamp < CACHE_EXPIRATION && 
        savingTipsCache.videos.length > 0) {
      console.log('Using cached saving tips videos');
      return savingTipsCache.videos;
    }
    
    // No valid cache, fetch from API
    const API_KEY = getYouTubeApiKey();
    if (!API_KEY) {
      console.warn('YouTube API key not available');
      return await fetchAlternativeSavingTips(searchQuery) || fallbackSavingTips;
    }
    
    // Add a timestamp parameter to prevent caching by the browser or CDN
    const timestamp = Date.now();
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `type=video&` +
      `maxResults=4&` +
      `order=date&` + // Changed from relevance to date to get newer content
      `videoDuration=short&` +
      `key=${API_KEY}&` +
      `_=${timestamp}` // Add cache-busting parameter
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      
      // Check if the error is due to quota exceeded
      if (response.status === 403 && 
          errorData?.error?.errors?.some((e: any) => e.reason === "quotaExceeded")) {
        console.log("YouTube API quota exceeded, trying alternative source");
        return await fetchAlternativeSavingTips(searchQuery) || fallbackSavingTips;
      }
      
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      console.log('No videos found from YouTube API, trying alternative source');
      return await fetchAlternativeSavingTips(searchQuery) || fallbackSavingTips;
    }
    
    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    // Update cache
    savingTipsCache = {
      videos,
      timestamp: now,
      query: searchQuery
    };

    return videos;
  } catch (error) {
    console.error('Error fetching money saving tips:', error);
    // Try alternative source before falling back to static content
    const searchQuery = getPersonalizedSavingTipsQuery(transactions);
    return await fetchAlternativeSavingTips(searchQuery) || fallbackSavingTips;
  }
}

export async function fetchMoneySavingTipsWithRetry(transactions: { amount: number; type: 'expense' | 'income'; timestamp: number }[] = []): Promise<YouTubeVideo[]> {
  // Try up to 3 times to fetch saving tips
  let retries = 0;
  const maxRetries = 3;
  
  while (retries < maxRetries) {
    try {
      const videos = await fetchMoneySavingTips(transactions);
      if (videos.length > 0) {
        return videos;
      }
      retries++;
      console.log(`Retry ${retries}/${maxRetries} for saving tips`);
    } catch (error) {
      retries++;
      console.error(`Error on retry ${retries}/${maxRetries}:`, error);
    }
  }
  
  // If all retries fail, return fallback data
  console.warn('All retries failed, using fallback saving tips');
  return fallbackSavingTips;
}