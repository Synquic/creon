"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProductFromCollection = exports.addProductToCollection = exports.reorderCollections = exports.deleteCollection = exports.updateCollection = exports.getCollectionById = exports.getCollections = exports.createCollection = void 0;
const models_1 = require("../models");
const index_1 = require("../index");
const getEffectiveUserId = (user) => {
    if (user?.role === "manager" && user?.parentUserId) {
        return user.parentUserId;
    }
    return user?.id;
};
const createCollection = async (req, res) => {
    try {
        const { title, description, image, products = [] } = req.body;
        const userId = getEffectiveUserId(req.user);
        if (products.length > 0) {
            const existingProducts = await models_1.Product.find({
                _id: { $in: products },
                userId,
            });
            if (existingProducts.length !== products.length) {
                res.status(400).json({
                    success: false,
                    message: "Some products do not exist or do not belong to you",
                });
                return;
            }
        }
        const maxOrder = await models_1.ProductCollection.findOne({ userId }).sort({
            order: -1,
        });
        const order = (maxOrder?.order || 0) + 1;
        const collection = await models_1.ProductCollection.create({
            userId,
            title,
            description,
            image,
            products,
            order,
        });
        if (products.length > 0) {
            await models_1.Product.updateMany({ _id: { $in: products } }, { collectionId: collection._id });
        }
        res.status(201).json({
            success: true,
            message: "Collection created successfully",
            data: { collection },
        });
    }
    catch (error) {
        index_1.logger.error("Create collection error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createCollection = createCollection;
const getCollections = async (req, res) => {
    try {
        const userId = getEffectiveUserId(req.user);
        const { page = 1, limit = 20, sortBy = "order", sortOrder = "asc", } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const sortDirection = sortOrder === "desc" ? -1 : 1;
        const sortOptions = { [sortBy]: sortDirection };
        const [collections, total] = await Promise.all([
            models_1.ProductCollection.find({ userId })
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum)
                .populate("products", "title image price formattedPrice"),
            models_1.ProductCollection.countDocuments({ userId }),
        ]);
        res.json({
            success: true,
            data: {
                collections,
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
        index_1.logger.error("Get collections error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCollections = getCollections;
const getCollectionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getEffectiveUserId(req.user);
        const collection = await models_1.ProductCollection.findOne({
            _id: id,
            userId,
        }).populate("products");
        if (!collection) {
            res.status(404).json({
                success: false,
                message: "Collection not found",
            });
            return;
        }
        res.json({
            success: true,
            data: { collection },
        });
    }
    catch (error) {
        index_1.logger.error("Get collection by ID error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getCollectionById = getCollectionById;
const updateCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getEffectiveUserId(req.user);
        const { title, description, image, products, isActive, order } = req.body;
        let updateData = { title, description, image, isActive };
        if (order !== undefined) {
            updateData.order = order;
        }
        if (products !== undefined) {
            if (products.length > 0) {
                const existingProducts = await models_1.Product.find({
                    _id: { $in: products },
                    userId,
                });
                if (existingProducts.length !== products.length) {
                    res.status(400).json({
                        success: false,
                        message: "Some products do not exist or do not belong to you",
                    });
                    return;
                }
            }
            const currentCollection = await models_1.ProductCollection.findOne({
                _id: id,
                userId,
            });
            if (currentCollection) {
                await models_1.Product.updateMany({ _id: { $in: currentCollection.products } }, { $unset: { collectionId: 1 } });
            }
            updateData.products = products;
            if (products.length > 0) {
                await models_1.Product.updateMany({ _id: { $in: products } }, { collectionId: id });
            }
        }
        const collection = await models_1.ProductCollection.findOneAndUpdate({ _id: id, userId }, updateData, { new: true, runValidators: true }).populate("products");
        if (!collection) {
            res.status(404).json({
                success: false,
                message: "Collection not found",
            });
            return;
        }
        res.json({
            success: true,
            message: "Collection updated successfully",
            data: { collection },
        });
    }
    catch (error) {
        index_1.logger.error("Update collection error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.updateCollection = updateCollection;
const deleteCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = getEffectiveUserId(req.user);
        const collection = await models_1.ProductCollection.findOneAndDelete({
            _id: id,
            userId,
        });
        if (!collection) {
            res.status(404).json({
                success: false,
                message: "Collection not found",
            });
            return;
        }
        await models_1.Product.updateMany({ _id: { $in: collection.products } }, { $unset: { collectionId: 1 } });
        res.json({
            success: true,
            message: "Collection deleted successfully",
        });
    }
    catch (error) {
        index_1.logger.error("Delete collection error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.deleteCollection = deleteCollection;
const reorderCollections = async (req, res) => {
    try {
        const { collectionOrders } = req.body;
        const userId = getEffectiveUserId(req.user);
        if (!Array.isArray(collectionOrders)) {
            res.status(400).json({
                success: false,
                message: "collectionOrders must be an array",
            });
            return;
        }
        const updatePromises = collectionOrders.map(({ id, order }) => models_1.ProductCollection.updateOne({ _id: id, userId }, { order }));
        await Promise.all(updatePromises);
        res.json({
            success: true,
            message: "Collections reordered successfully",
        });
    }
    catch (error) {
        index_1.logger.error("Reorder collections error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.reorderCollections = reorderCollections;
const addProductToCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { productId } = req.body;
        const userId = getEffectiveUserId(req.user);
        const [collection, product] = await Promise.all([
            models_1.ProductCollection.findOne({ _id: id, userId }),
            models_1.Product.findOne({ _id: productId, userId }),
        ]);
        if (!collection) {
            res.status(404).json({
                success: false,
                message: "Collection not found",
            });
            return;
        }
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }
        if (collection.products.includes(productId)) {
            res.status(400).json({
                success: false,
                message: "Product already in collection",
            });
            return;
        }
        collection.products.push(productId);
        await collection.save();
        product.collectionId = collection._id.toString();
        await product.save();
        res.json({
            success: true,
            message: "Product added to collection successfully",
        });
    }
    catch (error) {
        index_1.logger.error("Add product to collection error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.addProductToCollection = addProductToCollection;
const removeProductFromCollection = async (req, res) => {
    try {
        const { id, productId } = req.params;
        const userId = getEffectiveUserId(req.user);
        const [collection, product] = await Promise.all([
            models_1.ProductCollection.findOne({ _id: id, userId }),
            models_1.Product.findOne({ _id: productId, userId }),
        ]);
        if (!collection) {
            res.status(404).json({
                success: false,
                message: "Collection not found",
            });
            return;
        }
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }
        collection.products = collection.products.filter((p) => p.toString() !== productId);
        await collection.save();
        product.collectionId = undefined;
        await product.save();
        res.json({
            success: true,
            message: "Product removed from collection successfully",
        });
    }
    catch (error) {
        index_1.logger.error("Remove product from collection error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.removeProductFromCollection = removeProductFromCollection;
//# sourceMappingURL=collectionController.js.map