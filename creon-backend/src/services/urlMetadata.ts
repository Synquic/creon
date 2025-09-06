import axios from 'axios';
import * as cheerio from 'cheerio';

export interface URLMetadata {
  title?: string;
  description?: string;
  image?: string;
  price?: string;
  currency?: string;
  siteName?: string;
  type?: string;
  url: string;
}

export const fetchURLMetadata = async (url: string): Promise<URLMetadata> => {
  try {
    console.log('🔍 Fetching metadata for URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive'
      },
      timeout: 10000
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract metadata
    const metadata: URLMetadata = {
      url,
      title: extractTitle($),
      description: extractDescription($),
      image: extractImage($, url),
      price: extractPrice($),
      currency: extractCurrency($),
      siteName: extractSiteName($),
      type: extractType($)
    };

    console.log('✅ Metadata extracted:', metadata);
    return metadata;

  } catch (error) {
    console.error('❌ Error fetching metadata:', error);
    return {
      url,
      title: extractDomainName(url),
      description: `Visit ${extractDomainName(url)}`,
      type: 'website'
    };
  }
};

const extractTitle = ($: any): string => {
  // Try various title sources in order of preference
  let title = 
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    $('meta[property="title"]').attr('content') ||
    $('title').text() ||
    $('h1').first().text() ||
    '';

  return title.trim();
};

const extractDescription = ($: any): string => {
  let description = 
    $('meta[property="og:description"]').attr('content') ||
    $('meta[name="twitter:description"]').attr('content') ||
    $('meta[name="description"]').attr('content') ||
    $('meta[property="description"]').attr('content') ||
    '';

  return description.trim();
};

const extractImage = ($: any, baseUrl: string): string => {
  let image = 
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    $('meta[property="twitter:image"]').attr('content') ||
    $('link[rel="image_src"]').attr('href') ||
    $('img').first().attr('src') ||
    '';

  // Convert relative URLs to absolute
  if (image && !image.startsWith('http')) {
    try {
      const baseUrlObj = new URL(baseUrl);
      image = new URL(image, baseUrlObj.origin).toString();
    } catch (e) {
      // If URL parsing fails, return empty string
      image = '';
    }
  }

  return image;
};

const extractPrice = ($: any): string => {
  // Look for price in various formats
  let price = 
    $('meta[property="product:price:amount"]').attr('content') ||
    $('meta[property="og:price:amount"]').attr('content') ||
    $('.price').first().text() ||
    $('[class*="price"]').first().text() ||
    $('[data-price]').first().attr('data-price') ||
    '';

  // Clean up price string
  price = price.replace(/[^\d.,]/g, '').trim();
  
  return price;
};

const extractCurrency = ($: any): string => {
  let currency = 
    $('meta[property="product:price:currency"]').attr('content') ||
    $('meta[property="og:price:currency"]').attr('content') ||
    '';

  // Try to extract currency from price text if not found in meta
  if (!currency) {
    const priceText = $('.price').first().text() || $('[class*="price"]').first().text() || '';
    const currencyMatch = priceText.match(/[$€£¥₹]/);
    if (currencyMatch) {
      const currencyMap: { [key: string]: string } = {
        '$': 'USD',
        '€': 'EUR', 
        '£': 'GBP',
        '¥': 'JPY',
        '₹': 'INR'
      };
      currency = currencyMap[currencyMatch[0]] || 'USD';
    }
  }

  return currency || 'USD';
};

const extractSiteName = ($: any): string => {
  let siteName = 
    $('meta[property="og:site_name"]').attr('content') ||
    $('meta[name="application-name"]').attr('content') ||
    '';

  return siteName.trim();
};

const extractType = ($: any): string => {
  let type = 
    $('meta[property="og:type"]').attr('content') ||
    '';

  // Detect if it's an e-commerce product
  if ($('meta[property="product:price:amount"]').length > 0 ||
      $('.price').length > 0 ||
      $('[class*="price"]').length > 0 ||
      $('[data-price]').length > 0) {
    type = 'product';
  }

  // Detect if it's a video (YouTube, Vimeo, etc.)
  if ($('meta[property="og:video"]').length > 0 ||
      $('meta[name="twitter:player"]').length > 0) {
    type = 'video';
  }

  return type || 'website';
};

const extractDomainName = (url: string): string => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch (e) {
    return 'Website';
  }
};

// YouTube specific metadata extraction
export const fetchYouTubeMetadata = async (url: string): Promise<URLMetadata> => {
  try {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    // Use YouTube oEmbed API for better metadata
    const oembedResponse = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    const oembedData = oembedResponse.data;

    return {
      url,
      title: oembedData.title,
      description: `Watch on YouTube - ${oembedData.author_name}`,
      image: oembedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      siteName: 'YouTube',
      type: 'video'
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    // Fallback to regular metadata extraction
    return fetchURLMetadata(url);
  }
};

const extractYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};