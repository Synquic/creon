"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductAnalytics = exports.redirectProduct = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const models_1 = require("../models");
const shortCode_1 = require("../utils/shortCode");
const checkProductShortCodeUnique = async (code) => {
    const existing = await models_1.Product.findOne({ shortCode: code });
    return !existing;
};
const createProduct = async (req, res) => {
    try {
        const { title, description, price, currency = 'USD', image, affiliateUrl, shortCode, tags = [], collectionId } = req.body;
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
            const isUnique = await checkProductShortCodeUnique(shortCode);
            if (!isUnique) {
                res.status(400).json({
                    success: false,
                    message: 'Short code is already taken'
                });
                return;
            }
        }
        else {
            finalShortCode = await (0, shortCode_1.generateUniqueShortCode)(checkProductShortCodeUnique);
        }
        if (collectionId) {
            const collection = await models_1.ProductCollection.findOne({
                _id: collectionId,
                userId
            });
            if (!collection) {
                res.status(400).json({
                    success: false,
                    message: 'Collection not found'
                });
                return;
            }
        }
        const product = await models_1.Product.create({
            userId,
            title,
            description,
            price,
            currency,
            image,
            affiliateUrl,
            shortCode: finalShortCode,
            tags,
            collectionId: collectionId || null
        });
        if (collectionId) {
            await models_1.ProductCollection.findByIdAndUpdate(collectionId, { $push: { products: product._id } });
        }
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createProduct = createProduct;
const getProducts = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', collectionId, tags } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = sortOrder === 'desc' ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };
        const filter = { userId };
        if (collectionId) {
            filter.collectionId = collectionId;
        }
        if (tags) {
            const tagArray = Array.isArray(tags) ? tags : [tags];
            filter.tags = { $in: tagArray };
        }
        const [products, total] = await Promise.all([
            models_1.Product.find(filter)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .populate('collectionId', 'title'),
            models_1.Product.countDocuments(filter)
        ]);
        res.json({
            success: true,
            data: {
                products,
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
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const product = await models_1.Product.findOne({ _id: id, userId })
            .populate('collectionId', 'title');
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        res.json({
            success: true,
            data: { product }
        });
    }
    catch (error) {
        console.error('Get product by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProductById = getProductById;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { title, description, price, currency, image, affiliateUrl, shortCode, tags, isActive, collectionId } = req.body;
        let updateData = {
            title,
            description,
            price,
            currency,
            image,
            affiliateUrl,
            tags,
            isActive
        };
        if (shortCode) {
            const existingProduct = await models_1.Product.findOne({
                shortCode,
                _id: { $ne: id }
            });
            if (existingProduct) {
                res.status(400).json({
                    success: false,
                    message: 'Short code is already taken'
                });
                return;
            }
            updateData.shortCode = shortCode;
        }
        if (collectionId !== undefined) {
            if (collectionId) {
                const collection = await models_1.ProductCollection.findOne({
                    _id: collectionId,
                    userId
                });
                if (!collection) {
                    res.status(400).json({
                        success: false,
                        message: 'Collection not found'
                    });
                    return;
                }
            }
            updateData.collectionId = collectionId || null;
        }
        const product = await models_1.Product.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true }).populate('collectionId', 'title');
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const product = await models_1.Product.findOneAndDelete({ _id: id, userId });
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        if (product.collectionId) {
            await models_1.ProductCollection.findByIdAndUpdate(product.collectionId, { $pull: { products: product._id } });
        }
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteProduct = deleteProduct;
const redirectProduct = async (req, res) => {
    try {
        const { shortCode } = req.params;
        const product = await models_1.Product.findOne({
            shortCode,
            isActive: true
        });
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        product.clickCount += 1;
        await product.save();
        await models_1.Analytics.create({
            userId: product.userId,
            productId: product._id.toString(),
            type: 'product_click',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent') || 'unknown',
            referer: req.get('Referer'),
            timestamp: new Date()
        });
        res.redirect(301, product.affiliateUrl);
    }
    catch (error) {
        console.error('Redirect product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.redirectProduct = redirectProduct;
const getProductAnalytics = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const { period = '7d' } = req.query;
        const product = await models_1.Product.findOne({ _id: id, userId });
        if (!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }
        const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const analytics = await models_1.Analytics.find({
            productId: id,
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
                product: {
                    id: product._id,
                    title: product.title,
                    shortCode: product.shortCode,
                    totalClicks: product.clickCount
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
        console.error('Get product analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProductAnalytics = getProductAnalytics;
//# sourceMappingURL=productController.js.map