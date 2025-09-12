// YouTube video utilities

export interface VideoInfo {
  isVideo: boolean;
  platform?: 'youtube' | 'vimeo' | 'tiktok' | 'instagram';
  videoId?: string;
  thumbnailUrl?: string;
  embedUrl?: string;
}

/** 
 * Extract YouTube video ID from various YouTube URL formats
 */
export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Generate YouTube thumbnail URL from video ID
 */
export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'medium'): string => {
  const qualityMap = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg',
    standard: 'sddefault.jpg',
    maxres: 'maxresdefault.jpg'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
};

/**
 * Extract Vimeo video ID from URL
 */
export const getVimeoVideoId = (url: string): string | null => {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /vimeo\.com\/video\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};

/**
 * Check if URL is a TikTok video
 */
export const isTikTokVideo = (url: string): boolean => {
  return /(?:tiktok\.com|vm\.tiktok\.com)/.test(url);
};

/**
 * Check if URL is an Instagram video/post
 */
export const isInstagramVideo = (url: string): boolean => {
  return /instagram\.com/.test(url);
};

/**
 * Analyze URL and extract video information
 */
export const getVideoInfo = (url: string): VideoInfo => {
  const youtubeId = getYouTubeVideoId(url);
  if (youtubeId) {
    return {
      isVideo: true,
      platform: 'youtube',
      videoId: youtubeId,
      thumbnailUrl: getYouTubeThumbnail(youtubeId),
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }

  const vimeoId = getVimeoVideoId(url);
  if (vimeoId) {
    return {
      isVideo: true,
      platform: 'vimeo',
      videoId: vimeoId,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      // Note: Vimeo thumbnails require API call, so we'll handle this differently
    };
  }

  if (isTikTokVideo(url)) {
    return {
      isVideo: true,
      platform: 'tiktok',
    };
  }

  if (isInstagramVideo(url)) {
    return {
      isVideo: true,
      platform: 'instagram',
    };
  }

  return {
    isVideo: false,
  };
};

/**
 * Get video platform icon based on platform
 */
export const getVideoPlatformIcon = (platform: string): string => {
  const icons = {
    youtube: '📺',
    vimeo: '🎬',
    tiktok: '🎵',
    instagram: '📸',
  };
  return icons[platform as keyof typeof icons] || '🎥';
};

/**
 * Get video platform name
 */
export const getVideoPlatformName = (platform: string): string => {
  const names = {
    youtube: 'YouTube',
    vimeo: 'Vimeo',
    tiktok: 'TikTok',
    instagram: 'Instagram',
  };
  return names[platform as keyof typeof names] || 'Video';
};