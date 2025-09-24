import { Request, Response } from 'express';
import { Analytics } from '../models/Analytics';
import { AuthRequest } from '../middleware/auth';
import { Product } from '../models/Product';
import { Link } from '../models/Link';
import { logger } from '../index';

// Helper function to get the effective user ID (parent for managers, self for admins)
const getEffectiveUserId = (user: any): string => {
  if (user.role === 'manager' && user.parentId) {
    return user.parentId;
  }
  return user.id;
};

// Track analytics event
export const trackEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, linkId, productId, collectionId } = req.body;
    
    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const referer = req.headers.referer || req.headers.referrer || null;

    let userId: string | null = null;

    // If it's a link click, get the userId from the link
    if (type === 'link_click' && linkId) {
      const link = await Link.findById(linkId);
      if (link) {
        userId = link.userId;
        // Increment link click count
        await Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } });
      }
    }

    // If it's a product click, get the userId from the product
    if (type === 'product_click' && productId) {
      const product = await Product.findById(productId);
      if (product) {
        userId = product.userId;
        // Increment product click count
        await Product.findByIdAndUpdate(productId, { $inc: { clickCount: 1 } });
      }
    }

    // For profile views, userId should be provided in request
    if (type === 'profile_view') {
      userId = req.body.userId;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'Unable to determine user for analytics tracking'
      });
      return;
    }

    // Create analytics record
    const analytics = await Analytics.create({
      userId,
      linkId: linkId || null,
      productId: productId || null,
      type,
      ipAddress,
      userAgent,
      referer,
      device: extractDeviceType(userAgent),
      browser: extractBrowser(userAgent),
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Analytics event tracked successfully',
      data: { analyticsId: analytics._id }
    });

  } catch (error) {
    logger.error('Track analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get analytics dashboard data
export const getDashboardAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const effectiveUserId = getEffectiveUserId(req.user);
    const { period = '7d' } = req.query;

    const days = getDateRange(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total stats
    const [totalClicks, totalUniqueVisitors, linkClicks, productClicks, profileViews] = await Promise.all([
      Analytics.countDocuments({
        userId: effectiveUserId,
        timestamp: { $gte: startDate }
      }),
      Analytics.distinct('ipAddress', {
        userId: effectiveUserId,
        timestamp: { $gte: startDate }
      }).then(ips => ips.length),
      Analytics.countDocuments({
        userId: effectiveUserId,
        type: 'link_click',
        timestamp: { $gte: startDate }
      }),
      Analytics.countDocuments({
        userId: effectiveUserId,
        type: 'product_click',
        timestamp: { $gte: startDate }
      }),
      Analytics.countDocuments({
        userId: effectiveUserId,
        type: 'profile_view',
        timestamp: { $gte: startDate }
      })
    ]);

    // Get daily breakdown
    const dailyStats = await Analytics.aggregate([
      {
        $match: {
          userId: effectiveUserId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$type'
          },
          count: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          totalClicks: { $sum: '$count' },
          uniqueVisitors: { $sum: { $size: '$uniqueVisitors' } },
          byType: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get top performing links
    const topLinks = await Analytics.aggregate([
      {
        $match: {
          userId: effectiveUserId,
          type: 'link_click',
          linkId: { $ne: null },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$linkId',
          clicks: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $lookup: {
          from: 'links',
          localField: '_id',
          foreignField: '_id',
          as: 'link'
        }
      },
      {
        $unwind: '$link'
      },
      {
        $project: {
          _id: 1,
          title: '$link.title',
          url: '$link.url',
          clicks: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      {
        $sort: { clicks: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get top performing products
    const topProducts = await Analytics.aggregate([
      {
        $match: {
          userId: effectiveUserId,
          type: 'product_click',
          productId: { $ne: null },
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          clicks: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$ipAddress' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: 1,
          title: '$product.title',
          url: '$product.affiliateUrl',
          price: '$product.price',
          currency: '$product.currency',
          clicks: 1,
          uniqueVisitors: { $size: '$uniqueVisitors' }
        }
      },
      {
        $sort: { clicks: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Get device breakdown
    const deviceStats = await Analytics.aggregate([
      {
        $match: {
          userId: effectiveUserId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get browser breakdown
    const browserStats = await Analytics.aggregate([
      {
        $match: {
          userId: effectiveUserId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$browser',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalClicks,
          totalUniqueVisitors,
          linkClicks,
          productClicks,
          profileViews,
          period
        },
        dailyStats,
        topLinks,
        topProducts,
        deviceStats,
        browserStats
      }
    });

  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get specific link analytics
export const getLinkAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const effectiveUserId = getEffectiveUserId(req.user);
    const { linkId } = req.params;
    const { period = '7d' } = req.query;

    const days = getDateRange(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Verify link ownership
    const link = await Link.findOne({ _id: linkId, userId: effectiveUserId });
    if (!link) {
      res.status(404).json({
        success: false,
        message: 'Link not found'
      });
      return;
    }

    // Get link analytics
    const [totalClicks, uniqueVisitors, dailyClicks] = await Promise.all([
      Analytics.countDocuments({
        linkId,
        type: 'link_click',
        timestamp: { $gte: startDate }
      }),
      Analytics.distinct('ipAddress', {
        linkId,
        type: 'link_click',
        timestamp: { $gte: startDate }
      }).then(ips => ips.length),
      Analytics.aggregate([
        {
          $match: {
            linkId,
            type: 'link_click',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            date: '$_id',
            clicks: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
          }
        },
        {
          $sort: { date: 1 }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        link: {
          _id: link._id,
          title: link.title,
          url: link.url,
          totalClicks: link.clickCount
        },
        analytics: {
          totalClicks,
          uniqueVisitors,
          dailyClicks,
          period
        }
      }
    });

  } catch (error) {
    logger.error('Get link analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get specific product analytics
export const getProductAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const effectiveUserId = getEffectiveUserId(req.user);
    const { productId } = req.params;
    const { period = '7d' } = req.query;

    const days = getDateRange(period as string);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Verify product ownership
    const product = await Product.findOne({ _id: productId, userId: effectiveUserId });
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    // Get product analytics
    const [totalClicks, uniqueVisitors, dailyClicks] = await Promise.all([
      Analytics.countDocuments({
        productId,
        type: 'product_click',
        timestamp: { $gte: startDate }
      }),
      Analytics.distinct('ipAddress', {
        productId,
        type: 'product_click',
        timestamp: { $gte: startDate }
      }).then(ips => ips.length),
      Analytics.aggregate([
        {
          $match: {
            productId,
            type: 'product_click',
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            clicks: { $sum: 1 },
            uniqueVisitors: { $addToSet: '$ipAddress' }
          }
        },
        {
          $project: {
            date: '$_id',
            clicks: 1,
            uniqueVisitors: { $size: '$uniqueVisitors' }
          }
        },
        {
          $sort: { date: 1 }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        product: {
          _id: product._id,
          title: product.title,
          url: product.affiliateUrl,
          price: product.price,
          currency: product.currency,
          totalClicks: product.clickCount
        },
        analytics: {
          totalClicks,
          uniqueVisitors,
          dailyClicks,
          period
        }
      }
    });

  } catch (error) {
    logger.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Helper functions
const getDateRange = (period: string): number => {
  switch (period) {
    case '1d': return 1;
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    default: return 7;
  }
};

const extractDeviceType = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
    return 'mobile';
  }
  if (ua.includes('tablet') || ua.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
};

const extractBrowser = (userAgent: string): string => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opera')) return 'Opera';
  return 'Other';
};