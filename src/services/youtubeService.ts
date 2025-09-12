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