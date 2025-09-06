"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.checkUsernameAvailability = exports.getUserProfile = exports.changePassword = exports.updateProfile = void 0;
const models_1 = require("../models");
const updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, bio, socialLinks, theme } = req.body;
        const user = await models_1.User.findByIdAndUpdate(req.user?.id, {
            firstName,
            lastName,
            bio,
            socialLinks,
            theme
        }, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio,
                    profileImage: user.profileImage,
                    socialLinks: user.socialLinks,
                    theme: user.theme,
                    profileUrl: `/${user.username}`
                }
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await models_1.User.findById(req.user?.id).select('+password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.changePassword = changePassword;
const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await models_1.User.findOne({ username });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        const links = await models_1.Link.find({
            userId: user._id.toString(),
            isActive: true
        }).sort({ order: 1 });
        const collections = await models_1.ProductCollection.find({
            userId: user._id.toString(),
            isActive: true
        }).sort({ order: 1 });
        const products = await models_1.Product.find({
            userId: user._id.toString(),
            isActive: true,
            collectionId: null
        });
        await models_1.Analytics.create({
            userId: user._id.toString(),
            type: 'profile_view',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent') || 'unknown',
            timestamp: new Date()
        });
        res.json({
            success: true,
            data: {
                user: {
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio,
                    profileImage: user.profileImage,
                    socialLinks: user.socialLinks,
                    theme: user.theme
                },
                links,
                collections,
                products
            }
        });
    }
    catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getUserProfile = getUserProfile;
const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await models_1.User.findOne({ username });
        res.json({
            success: true,
            data: {
                available: !user
            }
        });
    }
    catch (error) {
        console.error('Check username availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.checkUsernameAvailability = checkUsernameAvailability;
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const [linkCount, productCount, collectionCount] = await Promise.all([
            models_1.Link.countDocuments({ userId }),
            models_1.Product.countDocuments({ userId }),
            models_1.ProductCollection.countDocuments({ userId })
        ]);
        const totalClicks = await models_1.Analytics.countDocuments({
            userId,
            type: { $in: ['link_click', 'product_click'] }
        });
        const profileViews = await models_1.Analytics.countDocuments({
            userId,
            type: 'profile_view'
        });
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const recentClicks = await models_1.Analytics.countDocuments({
            userId,
            type: { $in: ['link_click', 'product_click'] },
            timestamp: { $gte: last7Days }
        });
        const recentViews = await models_1.Analytics.countDocuments({
            userId,
            type: 'profile_view',
            timestamp: { $gte: last7Days }
        });
        res.json({
            success: true,
            data: {
                stats: {
                    links: linkCount,
                    products: productCount,
                    collections: collectionCount,
                    totalClicks,
                    profileViews,
                    last7Days: {
                        clicks: recentClicks,
                        views: recentViews
                    }
                }
            }
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getDashboardStats = getDashboardStats;
//# sourceMappingURL=userController.js.map