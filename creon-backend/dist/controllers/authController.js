"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.checkUsernameAvailability = exports.logoutAll = exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
const index_1 = require("../index");
const register = async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;
        const existingUser = await models_1.User.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            const field = existingUser.email === email ? "email" : "username";
            res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`,
            });
            return;
        }
        const user = await models_1.User.create({
            username,
            email,
            password,
            firstName,
            lastName,
        });
        const tokenPayload = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_1.generateToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        await models_1.Session.create({
            userId: user._id.toString(),
            token: refreshToken,
            ipAddress: req.ip,
            deviceInfo: req.get("User-Agent"),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    profileUrl: `/${user.username}`,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    }
    catch (error) {
        index_1.logger.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await models_1.User.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
            return;
        }
        const tokenPayload = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, jwt_1.generateToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user._id.toString());
        await models_1.Session.create({
            userId: user._id.toString(),
            token: refreshToken,
            ipAddress: req.ip,
            deviceInfo: req.get("User-Agent"),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        res.json({
            success: true,
            message: "Login successful",
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    profileUrl: `/${user.username}`,
                },
                tokens: {
                    accessToken,
                    refreshToken,
                },
            },
        });
    }
    catch (error) {
        index_1.logger.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.login = login;
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: "Refresh token is required",
            });
            return;
        }
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const session = await models_1.Session.findOne({
            userId: decoded.id,
            token: refreshToken,
        });
        if (!session || session.expiresAt < new Date()) {
            res.status(401).json({
                success: false,
                message: "Invalid or expired refresh token",
            });
            return;
        }
        const user = await models_1.User.findById(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const tokenPayload = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        };
        const newAccessToken = (0, jwt_1.generateToken)(tokenPayload);
        res.json({
            success: true,
            message: "Token refreshed successfully",
            data: {
                accessToken: newAccessToken,
            },
        });
    }
    catch (error) {
        index_1.logger.error("Token refresh error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid refresh token",
        });
    }
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await models_1.Session.deleteOne({
                userId: req.user?.id,
                token: refreshToken,
            });
        }
        res.json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        index_1.logger.error("Logout error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.logout = logout;
const logoutAll = async (req, res) => {
    try {
        await models_1.Session.deleteMany({
            userId: req.user?.id,
        });
        res.json({
            success: true,
            message: "Logged out from all devices successfully",
        });
    }
    catch (error) {
        index_1.logger.error("Logout all error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.logoutAll = logoutAll;
const checkUsernameAvailability = async (req, res) => {
    try {
        const { username } = req.params;
        if (!username) {
            res.status(400).json({
                success: false,
                message: "Username is required",
            });
            return;
        }
        const cleanUsername = username.toLowerCase().trim();
        if (cleanUsername.length < 3 || cleanUsername.length > 20) {
            res.status(400).json({
                success: false,
                message: "Username must be between 3 and 20 characters",
            });
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
            res.status(400).json({
                success: false,
                message: "Username can only contain letters, numbers, and underscores",
            });
            return;
        }
        const existingUser = await models_1.User.findOne({ username: cleanUsername });
        res.json({
            success: true,
            data: {
                available: !existingUser,
                username: cleanUsername,
            },
        });
    }
    catch (error) {
        index_1.logger.error("Check username availability error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.checkUsernameAvailability = checkUsernameAvailability;
const getProfile = async (req, res) => {
    try {
        const user = await models_1.User.findById(req.user?.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        let protocol = process.env.BASE_PROTOCOL
            ? process.env.BASE_PROTOCOL
            : "http";
        const baseUrl = `${protocol}://${req.get("host")}`;
        const profileImageUrl = user.profileImage
            ? user.profileImage.startsWith("http")
                ? user.profileImage
                : `${baseUrl}${user.profileImage}`
            : null;
        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    bio: user.bio,
                    profileImage: profileImageUrl,
                    role: user.role,
                    socialLinks: user.socialLinks,
                    theme: user.theme,
                    isPremium: user.isPremium,
                    profileUrl: `/${user.username}`,
                    createdAt: user.createdAt,
                },
            },
        });
    }
    catch (error) {
        index_1.logger.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.getProfile = getProfile;
//# sourceMappingURL=authController.js.map