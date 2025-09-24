"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retestAllLinks = exports.retestLinks = exports.getLinkAnalytics = exports.redirectLink = exports.reorderLinks = exports.deleteLink = exports.updateLink = exports.getLinkById = exports.getLinks = exports.createLink = void 0;
const models_1 = require("../models");
const shortCode_1 = require("../utils/shortCode");
const index_1 = require("../index");
const testLinks_1 = require("../jobs/testLinks");
const getEffectiveUserId = (user) => {
    if (user?.role === 'manager' && user?.parentUserId) {
        return user.parentUserId;
    }
    return user?.id;
};
const checkShortCodeUnique = async (code) => {
    const existing = await models_1.Link.findOne({ shortCode: code });
    return !existing;
};
const createLink = async (req, res) => {
    try {
        index_1.logger.info("🎯 CREATE LINK REQUEST:", {
            body: req.body,
            userId: req.user?.id,
            headers: {
                authorization: req.headers.authorization ? "✅ Present" : "❌ Missing",
                contentType: req.headers["content-type"],
            },
        });
        const { title, url, shortCode, description, image, type = "link", isWorking = true, } = req.body;
        const userId = getEffectiveUserId(req.user);
        let finalShortCode = shortCode;
        if (shortCode) {
            if (!(0, shortCode_1.isValidShortCode)(shortCode)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid short code format",
                });
                return;
            }
            const isUnique = await checkShortCodeUnique(shortCode);
            if (!isUnique) {
                res.status(400).json({
                    success: false,
                    message: "Short code is already taken",
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
            isWorking,
            order,
        });
        res.status(201).json({
            success: true,
            message: "Link created successfully",
            data: { link },
        });
    }
    catch (error) {
        index_1.logger.error("Create link error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createLink = createLink;
const getLinks = async (req, res) => {
    try {
        index_1.logger.info("Get links called", { query: req.query });
        const userId = getEffectiveUserId(req.user);
        const { page = 1, limit = 20, sortBy = "order", sortOrder = "asc", } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = sortOrder === "desc" ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };
        const [links, total] = await Promise.all([
            models_1.Link.find({ userId }).sort(sortOptions).skip(skip).limit(limitNum),
            models_1.Link.countDocuments({ userId }),
        ]);
        res.json({
            success: true,
            data: {
                links,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum),
                },
            },
        });
    }
    catch (error) {
        index_1.logger.error("Get links error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLinks = getLinks;
const getLinkById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getEffectiveUserId(req.user);
        const link = await models_1.Link.findOne({ _id: id, userId });
        if (!link) {
            res.status(404).json({
                success: false,
                message: "Link not found",
            });
            return;
        }
        res.json({
            success: true,
            data: { link },
        });
    }
    catch (error) {
        index_1.logger.error("Get link by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLinkById = getLinkById;
const updateLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getEffectiveUserId(req.user);
        const { title, url, shortCode, description, image, isActive, isWorking, order } = req.body;
        let updateData = { title, url, description, image, isActive, isWorking };
        if (order !== undefined) {
            updateData.order = order;
        }
        if (shortCode) {
            const existingLink = await models_1.Link.findOne({
                shortCode,
                _id: { $ne: id },
            });
            if (existingLink) {
                res.status(400).json({
                    success: false,
                    message: "Short code is already taken",
                });
                return;
            }
            updateData.shortCode = shortCode;
        }
        const link = await models_1.Link.findOneAndUpdate({ _id: id, userId }, updateData, {
            new: true,
            runValidators: true,
        });
        if (!link) {
            res.status(404).json({
                success: false,
                message: "Link not found",
            });
            return;
        }
        res.json({
            success: true,
            message: "Link updated successfully",
            data: { link },
        });
    }
    catch (error) {
        index_1.logger.error("Update link error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateLink = updateLink;
const deleteLink = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getEffectiveUserId(req.user);
        const link = await models_1.Link.findOneAndDelete({ _id: id, userId });
        if (!link) {
            res.status(404).json({
                success: false,
                message: "Link not found",
            });
            return;
        }
        res.json({
            success: true,
            message: "Link deleted successfully",
        });
    }
    catch (error) {
        index_1.logger.error("Delete link error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteLink = deleteLink;
const reorderLinks = async (req, res) => {
    try {
        console.log("Reorder links called", { body: req.body });
        const linkOrders = req.body.linkOrders;
        if (!Array.isArray(linkOrders)) {
            return res.status(400).json({ message: 'Invalid input format' });
        }
        const bulkOps = linkOrders.map(({ id, order }) => ({
            updateOne: {
                filter: { _id: id },
                update: { $set: { order } },
            },
        }));
        const result = await models_1.Link.bulkWrite(bulkOps);
        return res.status(200).json({ message: 'Links reordered successfully', result });
    }
    catch (error) {
        console.error('Error reordering links:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
exports.reorderLinks = reorderLinks;
const redirectLink = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const link = await models_1.Link.findOne({
            shortCode,
            isActive: true,
        });
        if (!link) {
            res.status(404).json({
                success: false,
                message: "Link not found",
            });
            return;
        }
        link.clickCount += 1;
        await link.save();
        await models_1.Analytics.create({
            userId: link.userId,
            linkId: link._id.toString(),
            type: "link_click",
            ipAddress: req.ip,
            userAgent: req.get("User-Agent") || "unknown",
            referer: req.get("Referer"),
            timestamp: new Date(),
        });
        res.redirect(301, link.url);
    }
    catch (error) {
        index_1.logger.error("Redirect link error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.redirectLink = redirectLink;
const getLinkAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getEffectiveUserId(req.user);
        const { period = "7d" } = req.query;
        const link = await models_1.Link.findOne({ _id: id, userId });
        if (!link) {
            res.status(404).json({
                success: false,
                message: "Link not found",
            });
            return;
        }
        const days = period === "30d" ? 30 : period === "7d" ? 7 : 1;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const analytics = await models_1.Analytics.find({
            linkId: id,
            timestamp: { $gte: startDate },
        }).sort({ timestamp: -1 });
        const dailyClicks = analytics.reduce((acc, click) => {
            const date = click.timestamp.toISOString().split("T")[0];
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
                    totalClicks: link.clickCount,
                },
                analytics: {
                    totalClicks: analytics.length,
                    dailyClicks,
                    recentClicks: analytics.slice(0, 50),
                },
            },
        });
    }
    catch (error) {
        index_1.logger.error("Get link analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getLinkAnalytics = getLinkAnalytics;
const retestLinks = async (req, res) => {
    try {
        const userId = getEffectiveUserId(req.user);
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
            return;
        }
        index_1.logger.info(`Manual link retest requested by user: ${userId}`);
        const results = await testLinks_1.LinkTester.testLinksForUser(userId);
        const stats = await testLinks_1.LinkTester.getLinkTestStats();
        res.json({
            success: true,
            message: "Link testing completed successfully",
            data: {
                tested: results.length,
                working: results.filter(r => r.isWorking).length,
                notWorking: results.filter(r => !r.isWorking).length,
                results,
                stats,
            },
        });
    }
    catch (error) {
        index_1.logger.error("Retest links error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to test links",
        });
    }
};
exports.retestLinks = retestLinks;
const retestAllLinks = async (req, res) => {
    try {
        index_1.logger.info("Manual retest of all links requested");
        const results = await testLinks_1.LinkTester.testAllLinks();
        const stats = await testLinks_1.LinkTester.getLinkTestStats();
        res.json({
            success: true,
            message: "All links testing completed successfully",
            data: {
                tested: results.length,
                working: results.filter(r => r.isWorking).length,
                notWorking: results.filter(r => !r.isWorking).length,
                stats,
            },
        });
    }
    catch (error) {
        index_1.logger.error("Retest all links error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to test all links",
        });
    }
};
exports.retestAllLinks = retestAllLinks;
//# sourceMappingURL=linkController.js.map