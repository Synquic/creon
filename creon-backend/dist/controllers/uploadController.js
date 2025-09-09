"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfileImage = exports.uploadImage = void 0;
const models_1 = require("../models");
const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        res.json({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                url: imageUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size
            }
        });
    }
    catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.uploadImage = uploadImage;
const uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
            return;
        }
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        const userId = req.user?.id;
        const user = await models_1.User.findByIdAndUpdate(userId, { profileImage: imageUrl }, { new: true });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Profile image updated successfully',
            data: {
                profileImage: imageUrl,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImage: user.profileImage
                }
            }
        });
    }
    catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.uploadProfileImage = uploadProfileImage;
//# sourceMappingURL=uploadController.js.map