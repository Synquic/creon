"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchYouTubeMetadata = exports.fetchURLMetadata = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const fetchURLMetadata = async (url) => {
    try {
        console.log('🔍 Fetching metadata for URL:', url);
        const response = await axios_1.default.get(url, {
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
        const metadata = {
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
    }
    catch (error) {
        console.error('❌ Error fetching metadata:', error);
        return {
            url,
            title: extractDomainName(url),
            description: `Visit ${extractDomainName(url)}`,
            type: 'website'
        };
    }
};
exports.fetchURLMetadata = fetchURLMetadata;
const extractTitle = ($) => {
    let title = $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('meta[property="title"]').attr('content') ||
        $('title').text() ||
        $('h1').first().text() ||
        '';
    return title.trim();
};
const extractDescription = ($) => {
    let description = $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        $('meta[property="description"]').attr('content') ||
        '';
    return description.trim();
};
const extractImage = ($, baseUrl) => {
    let image = $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[property="twitter:image"]').attr('content') ||
        $('link[rel="image_src"]').attr('href') ||
        $('img').first().attr('src') ||
        '';
    if (image && !image.startsWith('http')) {
        try {
            const baseUrlObj = new URL(baseUrl);
            image = new URL(image, baseUrlObj.origin).toString();
        }
        catch (e) {
            image = '';
        }
    }
    return image;
};
const extractPrice = ($) => {
    let price = $('meta[property="product:price:amount"]').attr('content') ||
        $('meta[property="og:price:amount"]').attr('content') ||
        $('.price').first().text() ||
        $('[class*="price"]').first().text() ||
        $('[data-price]').first().attr('data-price') ||
        '';
    price = price.replace(/[^\d.,]/g, '').trim();
    return price;
};
const extractCurrency = ($) => {
    let currency = $('meta[property="product:price:currency"]').attr('content') ||
        $('meta[property="og:price:currency"]').attr('content') ||
        '';
    if (!currency) {
        const priceText = $('.price').first().text() || $('[class*="price"]').first().text() || '';
        const currencyMatch = priceText.match(/[$€£¥₹]/);
        if (currencyMatch) {
            const currencyMap = {
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
const extractSiteName = ($) => {
    let siteName = $('meta[property="og:site_name"]').attr('content') ||
        $('meta[name="application-name"]').attr('content') ||
        '';
    return siteName.trim();
};
const extractType = ($) => {
    let type = $('meta[property="og:type"]').attr('content') ||
        '';
    if ($('meta[property="product:price:amount"]').length > 0 ||
        $('.price').length > 0 ||
        $('[class*="price"]').length > 0 ||
        $('[data-price]').length > 0) {
        type = 'product';
    }
    if ($('meta[property="og:video"]').length > 0 ||
        $('meta[name="twitter:player"]').length > 0) {
        type = 'video';
    }
    return type || 'website';
};
const extractDomainName = (url) => {
    try {
        const domain = new URL(url).hostname;
        return domain.replace('www.', '');
    }
    catch (e) {
        return 'Website';
    }
};
const fetchYouTubeMetadata = async (url) => {
    try {
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
            throw new Error('Invalid YouTube URL');
        }
        const oembedResponse = await axios_1.default.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        const oembedData = oembedResponse.data;
        return {
            url,
            title: oembedData.title,
            description: `Watch on YouTube - ${oembedData.author_name}`,
            image: oembedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            siteName: 'YouTube',
            type: 'video'
        };
    }
    catch (error) {
        console.error('Error fetching YouTube metadata:', error);
        return (0, exports.fetchURLMetadata)(url);
    }
};
exports.fetchYouTubeMetadata = fetchYouTubeMetadata;
const extractYouTubeVideoId = (url) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};
//# sourceMappingURL=urlMetadata.js.map