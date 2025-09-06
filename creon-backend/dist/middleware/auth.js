"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authorize = exports.authenticate = void 0;
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
const authenticate = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
            return;
        }
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await models_1.User.findById(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        req.user = {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error instanceof Error ? error.message : 'Authentication failed'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
const optionalAuth = async (req, res, next) => {
    try {
        const token = (0, jwt_1.extractTokenFromHeader)(req.headers.authorization);
        if (token) {
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await models_1.User.findById(decoded.id);
            if (user) {
                req.user = {
                    id: user._id.toString(),
                    username: user.username,
                    email: user.email,
                    role: user.role
                };
            }
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map