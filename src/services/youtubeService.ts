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
      return [];
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
    return [];
  }
}

export async function fetchMoneySavingTips(): Promise<YouTubeVideo[]> {
  try {
    const API_KEY = getYouTubeApiKey();
    if (!API_KEY) {
      console.warn('YouTube API key not available');
      return [];
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
    return [];
  }
}