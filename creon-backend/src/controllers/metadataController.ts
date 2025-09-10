import { Request, Response } from 'express';
import { fetchURLMetadata, fetchYouTubeMetadata } from '../services/urlMetadata';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../index';

export const fetchMetadata = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { url } = req.body;

    if (!url) {
      res.status(400).json({
        success: false,
        message: 'URL is required'
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Invalid URL format'
      });
      return;
    }

    let metadata;

    // Check if it's a YouTube URL and use specialized extraction
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      metadata = await fetchYouTubeMetadata(url);
    } else {
      metadata = await fetchURLMetadata(url);
    }

    res.json({
      success: true,
      data: metadata
    });

  } catch (error) {
    logger.error('Fetch metadata error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch metadata'
    });
  }
};