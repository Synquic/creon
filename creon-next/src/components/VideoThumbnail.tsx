/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { PlayIcon, VideoIcon } from 'lucide-react';
import { getVideoInfo, getVideoPlatformIcon, getVideoPlatformName } from '@/utils/videoUtils';

interface VideoThumbnailProps {
  url: string;
  title: string;
  className?: string;
  showPlayButton?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  url,
  title,
  className = '',
  showPlayButton = true,
  size = 'medium'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const videoInfo = getVideoInfo(url);

  if (!videoInfo.isVideo) {
    return null;
  }

  const sizeClasses = {
    small: 'w-12 h-8',
    medium: 'w-16 h-12',
    large: 'w-20 h-16'
  };

  const playButtonSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  // If we have a thumbnail URL (YouTube), show it
  if (videoInfo.thumbnailUrl && !imageError) {
    return (
      <div
        className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-100 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={videoInfo.thumbnailUrl}
          alt={`${title} thumbnail`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        
        {showPlayButton && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isHovered ? 'opacity-100' : 'opacity-75'
          }`}>
            <div className="bg-black bg-opacity-60 rounded-full p-1">
              <PlayIcon className={`${playButtonSizes[size]} text-white`} />
            </div>
          </div>
        )}
        
        {/* Platform indicator */}
        <div className="absolute top-1 right-1">
          <span className="text-xs bg-black bg-opacity-60 text-white px-1 rounded">
            {getVideoPlatformIcon(videoInfo.platform!)}
          </span>
        </div>
      </div>
    );
  }

  // Fallback for videos without thumbnails or when image fails to load
  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center">
        <VideoIcon className={`${playButtonSizes[size]} text-gray-400 mx-auto mb-1`} />
        <div className="text-xs text-gray-500 px-1">
          {getVideoPlatformName(videoInfo.platform!)}
        </div>
      </div>
      
      {showPlayButton && isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black bg-opacity-60 rounded-full p-1">
            <PlayIcon className={`${playButtonSizes[size]} text-white`} />
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;