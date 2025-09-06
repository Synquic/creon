"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinkAnalytics = exports.redirectLink = exports.reorderLinks = exports.deleteLink = exports.updateLink = exports.getLinkById = exports.getLinks = exports.createLink = void 0;
const models_1 = require("../models");
const shortCode_1 = require("../utils/shortCode");
const checkShortCodeUnique = async (code) => {
    const existing = await models_1.Link.findOne({ shortCode: code });
    return !existing;
};
const createLink = async (req, res) => {
    try {
        console.log('🎯 CREATE LINK REQUEST:', {
            body: req.body,
            userId: req.user?.id,
            headers: {
                authorization: req.headers.authorization ? '✅ Present' : '❌ Missing',
                contentType: req.headers['content-type']
            }
        });
        const { title, url, shortCode, description, image, type = 'link' } = req.body;
        const userId = req.user?.id;
        let finalShortCode = shortCode;
        if (shortCode) {
            if (!(0, shortCode_1.isValidShortCode)(shortCode)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid short code format'
                });
                return;
            }
            const isUnique = await checkShortCodeUnique(shortCode);
            if (!isUnique) {
                res.status(400).json({
                    success: false,
                    message: 'Short code is already taken'
                });
                return;
            }
        }
        else {
            finalShortCode = await (0, shortCode_1.generateUniqueShortCode)(checkShortCodeUnique);
        }
        const maxOrder = await models_1.Link.findOne({ userId }).sort({ order: -1 });
        const order = (maxOrder?.order || 0) + 1;
        const link = await models_1.Link.create({
            userId,
            title,
            url,
            shortCode: finalShortCode,
            description,
            image,
            type,
            order
        });
        res.status(201).json({
            success: true,
            message: 'Link created successfully',
            data: { link }
        });
    }
    catch (error) {
        console.error('Create link error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createLink = createLink;
const getLinks = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, sortBy = 'order', sortOrder = 'asc' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };
        const [links, total] = await Promise.all([
            models_1.Link.find({ userId })
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum),
            models_1.Link.countDocuments({ userId })
        ]);
        res.json({
            success: true,
            data: {
                links,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    }
    catch (error) {
        console.error('Get links error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getLinks = getLinks;
const getLinkById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const link = await models_1.Link.findOne({ _id: id, userId });
        if (!link) {
            res.status(404).json({
                success: false,
                message: 'Link not found'
            });
            return;
        }
        res.json({
            success: true,
            data: { link }
        });
    }
    catch (error) {
        console.error('Get link by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getLinkById = getLinkById;
const updateLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { title, url, shortCode, description, image, isActive, order } = req.body;
        let updateData = { title, url, description, image, isActive };
        if (order !== undefined) {
            updateData.order = order;
        }
        if (shortCode) {
            const existingLink = await models_1.Link.findOne({
                shortCode,
                _id: { $ne: id }
            });
            if (existingLink) {
                res.status(400).json({
                    success: false,
                    message: 'Short code is already taken'
                });
                return;
            }
            updateData.shortCode = shortCode;
        }
        const link = await models_1.Link.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true });
        if (!link) {
            res.status(404).json({
                success: false,
                message: 'Link not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Link updated successfully',
            data: { link }
        });
    }
    catch (error) {
        console.error('Update link error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateLink = updateLink;
const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const link = await models_1.Link.findOneAndDelete({ _id: id, userId });
        if (!link) {
            res.status(404).json({
                success: false,
                message: 'Link not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Link deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete link error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteLink = deleteLink;
const reorderLinks = async (req, res) => {
    try {
        const { linkOrders } = req.body;
        const userId = req.user?.id;
        if (!Array.isArray(linkOrders)) {
            res.status(400).json({
                success: false,
                message: 'linkOrders must be an array'
            });
            return;
        }
        const updatePromises = linkOrders.map(({ id, order }) => models_1.Link.updateOne({ _id: id, userId }, { order }));
        await Promise.all(updatePromises);
        res.json({
            success: true,
            message: 'Links reordered successfully'
        });
    }
    catch (error) {
        console.error('Reorder links error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.reorderLinks = reorderLinks;
const redirectLink = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const link = await models_1.Link.findOne({
            shortCode,
            isActive: true
        });
        if (!link) {
            res.status(404).json({
                success: false,
                message: 'Link not found'
            });
            return;
        }
        link.clickCount += 1;
        await link.save();
        await models_1.Analytics.create({
            userId: link.userId,
            linkId: link._id.toString(),
            type: 'link_click',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent') || 'unknown',
            referer: req.get('Referer'),
            timestamp: new Date()
        });
        res.redirect(301, link.url);
    }
    catch (error) {
        console.error('Redirect link error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.redirectLink = redirectLink;
const getLinkAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { period = '7d' } = req.query;
        const link = await models_1.Link.findOne({ _id: id, userId });
        if (!link) {
            res.status(404).json({
                success: false,
                message: 'Link not found'
            });
            return;
        }
        const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const analytics = await models_1.Analytics.find({
            linkId: id,
            timestamp: { $gte: startDate }
        }).sort({ timestamp: -1 });
        const dailyClicks = analytics.reduce((acc, click) => {
            const date = click.timestamp.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        res.json({
            success: true,
            data: {
                link: {
                    id: link._id,
                    title: link.title,
                    shortCode: link.shortCode,
                    totalClicks: link.clickCount
                },
                analytics: {
                    totalClicks: analytics.length,
                    dailyClicks,
                    recentClicks: analytics.slice(0, 50)
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
//# sourceMappingURL=linkController.js.map