"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductAnalytics = exports.getLinkAnalytics = exports.getDashboardAnalytics = exports.trackEvent = void 0;
const Analytics_1 = require("../models/Analytics");
const Product_1 = require("../models/Product");
const Link_1 = require("../models/Link");
const trackEvent = async (req, res) => {
    try {
        const { type, linkId, productId, collectionId } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';
        const referer = req.headers.referer || req.headers.referrer || null;
        let userId = null;
        if (type === 'link_click' && linkId) {
            const link = await Link_1.Link.findById(linkId);
            if (link) {
                userId = link.userId;
                await Link_1.Link.findByIdAndUpdate(linkId, { $inc: { clickCount: 1 } });
            }
        }
        if (type === 'product_click' && productId) {
            const product = await Product_1.Product.findById(productId);
            if (product) {
                userId = product.userId;
                await Product_1.Product.findByIdAndUpdate(productId, { $inc: { clickCount: 1 } });
            }
        }
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
        const analytics = await Analytics_1.Analytics.create({
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
    }
    catch (error) {
        console.error('Track analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.trackEvent = trackEvent;
const getDashboardAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { period = '7d' } = req.query;
        const days = getDateRange(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const [totalClicks, totalUniqueVisitors, linkClicks, productClicks, profileViews] = await Promise.all([
            Analytics_1.Analytics.countDocuments({
                userId,
                timestamp: { $gte: startDate }
            }),
            Analytics_1.Analytics.distinct('ipAddress', {
                userId,
                timestamp: { $gte: startDate }
            }).then(ips => ips.length),
            Analytics_1.Analytics.countDocuments({
                userId,
                type: 'link_click',
                timestamp: { $gte: startDate }
            }),
            Analytics_1.Analytics.countDocuments({
                userId,
                type: 'product_click',
                timestamp: { $gte: startDate }
            }),
            Analytics_1.Analytics.countDocuments({
                userId,
                type: 'profile_view',
                timestamp: { $gte: startDate }
            })
        ]);
        const dailyStats = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    userId,
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
        const topLinks = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    userId,
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
        const topProducts = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    userId,
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
        const deviceStats = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    userId,
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
        const browserStats = await Analytics_1.Analytics.aggregate([
            {
                $match: {
                    userId,
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
    }
    catch (error) {
        console.error('Get dashboard analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getDashboardAnalytics = getDashboardAnalytics;
const getLinkAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { linkId } = req.params;
        const { period = '7d' } = req.query;
        const days = getDateRange(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const link = await Link_1.Link.findOne({ _id: linkId, userId });
        if (!link) {
            res.status(404).json({
                success: false,
                message: 'Link not found'
            });
            return;
        }
        const [totalClicks, uniqueVisitors, dailyClicks] = await Promise.all([
            Analytics_1.Analytics.countDocuments({
                linkId,
                type: 'link_click',
                timestamp: { $gte: startDate }
            }),
            Analytics_1.Analytics.distinct('ipAddress', {
                linkId,
                type: 'link_click',
                timestamp: { $gte: startDate }
            }).then(ips => ips.length),
            Analytics_1.Analytics.aggregate([
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
    }
    catch (error) {
        console.error('Get link analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getLinkAnalytics = getLinkAnalytics;
const getProductAnalytics = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { productId } = req.params;
        const { period = '7d' } = req.query;
        const days = getDateRange(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const product = await Product_1.Product.findOne({ _id: productId, userId });
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        const [totalClicks, uniqueVisitors, dailyClicks] = await Promise.all([
            Analytics_1.Analytics.countDocuments({
                productId,
                type: 'product_click',
                timestamp: { $gte: startDate }
            }),
            Analytics_1.Analytics.distinct('ipAddress', {
                productId,
                type: 'product_click',
                timestamp: { $gte: startDate }
            }).then(ips => ips.length),
            Analytics_1.Analytics.aggregate([
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
    }
    catch (error) {
        console.error('Get product analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProductAnalytics = getProductAnalytics;
const getDateRange = (period) => {
    switch (period) {
        case '1d': return 1;
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        default: return 7;
    }
};
const extractDeviceType = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
        return 'tablet';
    }
    return 'desktop';
};
const extractBrowser = (userAgent) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome'))
        return 'Chrome';
    if (ua.includes('firefox'))
        return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome'))
        return 'Safari';
    if (ua.includes('edge'))
        return 'Edge';
    if (ua.includes('opera'))
        return 'Opera';
    return 'Other';
};
//# sourceMappingURL=analyticsController.js.map