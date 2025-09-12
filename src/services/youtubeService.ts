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
const fallbackFinanceVideos: YouTubeVideo[] = [
  {
    id: "QFaFIcGhPoM",
    title: "How to Save Money: 8 Tips to Spend Less & Save More",
    description: "Learn practical tips for saving money and building wealth over time.",
    thumbnail: "https://i.ytimg.com/vi/QFaFIcGhPoM/mqdefault.jpg",
    channelTitle: "The Financial Diet",
    publishedAt: "2023-01-15T14:00:00Z"
  },
  {
    id: "M3-ij_7jYgY",
    title: "Personal Finance Basics In 8 Minutes",
    description: "A quick overview of the most important personal finance concepts everyone should know.",
    thumbnail: "https://i.ytimg.com/vi/M3-ij_7jYgY/mqdefault.jpg",
    channelTitle: "Financial Education",
    publishedAt: "2023-02-20T16:30:00Z"
  },
  {
    id: "kJSAzVZRkqQ",
    title: "Budgeting for Beginners - How to Make a Budget From Scratch",
    description: "Learn how to create and stick to a budget that works for your lifestyle and goals.",
    thumbnail: "https://i.ytimg.com/vi/kJSAzVZRkqQ/mqdefault.jpg",
    channelTitle: "The Budget Mom",
    publishedAt: "2023-03-10T12:45:00Z"
  },
  {
    id: "u8vHEBZVGqU",
    title: "5 Financial Planning Tips for Beginners",
    description: "Essential financial planning advice for those just starting their financial journey.",
    thumbnail: "https://i.ytimg.com/vi/u8vHEBZVGqU/mqdefault.jpg",
    channelTitle: "Wealth Hacker",
    publishedAt: "2023-04-05T09:15:00Z"
  },
  {
    id: "pN3htNBZPPA",
    title: "How to Invest for Beginners",
    description: "A beginner's guide to investing in the stock market and building wealth over time.",
    thumbnail: "https://i.ytimg.com/vi/pN3htNBZPPA/mqdefault.jpg",
    channelTitle: "Investing Made Simple",
    publishedAt: "2023-05-12T18:20:00Z"
  },
  {
    id: "7wDuITAi2O0",
    title: "Debt Payoff Strategies That Actually Work",
    description: "Effective strategies for paying off debt and achieving financial freedom.",
    thumbnail: "https://i.ytimg.com/vi/7wDuITAi2O0/mqdefault.jpg",
    channelTitle: "Debt Free Millennials",
    publishedAt: "2023-06-08T15:10:00Z"
  }
];

const fallbackSavingTips: YouTubeVideo[] = [
  {
    id: "dBMVYxZCPWg",
    title: "10 Money Saving Hacks You Need To Know",
    description: "Quick and easy money saving hacks that can help you save hundreds each month.",
    thumbnail: "https://i.ytimg.com/vi/dBMVYxZCPWg/mqdefault.jpg",
    channelTitle: "Frugal Living",
    publishedAt: "2023-01-25T11:30:00Z"
  },
  {
    id: "fIlNyeS_3Kc",
    title: "Save $1000 in 30 Days Challenge",
    description: "A step-by-step guide to saving your first $1000 in just one month.",
    thumbnail: "https://i.ytimg.com/vi/fIlNyeS_3Kc/mqdefault.jpg",
    channelTitle: "Budget Bytes",
    publishedAt: "2023-02-18T14:45:00Z"
  },
  {
    id: "gJvzK2kHQzs",
    title: "5 Money Saving Tricks That Actually Work",
    description: "Proven strategies for saving money on everyday expenses without sacrificing quality of life.",
    thumbnail: "https://i.ytimg.com/vi/gJvzK2kHQzs/mqdefault.jpg",
    channelTitle: "Smart Money",
    publishedAt: "2023-03-22T10:15:00Z"
  },
  {
    id: "hL8TVgCYfms",
    title: "How I Save 70% of My Income",
    description: "Extreme saving strategies from someone who saves the majority of their income.",
    thumbnail: "https://i.ytimg.com/vi/hL8TVgCYfms/mqdefault.jpg",
    channelTitle: "Financial Independence",
    publishedAt: "2023-04-30T16:20:00Z"
  }
];

const getYouTubeApiKey = () => {
  return import.meta.env.VITE_YOUTUBE_API_KEY || 
         import.meta.env.YOUTUBE_API_KEY || 
         "";
};

export async function fetchFinanceVideos(): Promise<YouTubeVideo[]> {
  try {
    const API_KEY = getYouTubeApiKey();
    if (!API_KEY) {
      console.warn('YouTube API key not available');
      return fallbackFinanceVideos; // Return fallback data when API key is not available
    }

    const searchQueries = [
      'personal finance tips',
      'money saving tips',
      'budgeting for beginners',
      'financial planning advice'
    ];

    const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(query)}&` +
      `type=video&` +
      `maxResults=6&` +
      `order=relevance&` +
      `videoDuration=medium&` +
      `key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      
      // Check if the error is due to quota exceeded
      if (response.status === 403 && 
          errorData?.error?.errors?.some((e: any) => e.reason === "quotaExceeded")) {
        console.log("YouTube API quota exceeded, using fallback data");
        return fallbackFinanceVideos;
      }
      
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    const videos: YouTubeVideo[] = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    })) || [];

    return videos;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return fallbackFinanceVideos; // Return fallback data on any error
  }
}

export async function fetchMoneySavingTips(): Promise<YouTubeVideo[]> {
  try {
    const API_KEY = getYouTubeApiKey();
    if (!API_KEY) {
      console.warn('YouTube API key not available');
      return fallbackSavingTips; // Return fallback data when API key is not available
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent('money saving hacks tips tricks')}&` +
      `type=video&` +
      `maxResults=4&` +
      `order=relevance&` +
      `videoDuration=short&` +
      `key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API error:', errorData);
      
      // Check if the error is due to quota exceeded
      if (response.status === 403 && 
          errorData?.error?.errors?.some((e: any) => e.reason === "quotaExceeded")) {
        console.log("YouTube API quota exceeded, using fallback data");
        return fallbackSavingTips;
      }
      
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();
    
    const videos: YouTubeVideo[] = data.items?.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt
    })) || [];

    return videos;
  } catch (error) {
    console.error('Error fetching money saving tips:', error);
    return fallbackSavingTips; // Return fallback data on any error
  }
}