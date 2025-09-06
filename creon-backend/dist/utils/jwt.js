"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTokenFromHeader = exports.verifyRefreshToken = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
        issuer: 'creon-api'
    });
};
exports.generateToken = generateToken;
const generateRefreshToken = (userId) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jsonwebtoken_1.default.sign({ id: userId, type: 'refresh' }, secret, {
        expiresIn: '30d',
        issuer: 'creon-api'
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (decoded.type === 'refresh') {
            throw new Error('Invalid token type');
        }
        return {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role
        };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expired');
        }
        throw error;
    }
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (decoded.type !== 'refresh') {
            throw new Error('Invalid token type');
        }
        return { id: decoded.id };
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid refresh token');
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Refresh token expired');
        }
        throw error;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const extractTokenFromHeader = (authHeader) => {
    if (!authHeader)
        return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }
    return parts[1];
};
exports.extractTokenFromHeader = extractTokenFromHeader;
//# sourceMappingURL=jwt.js.map