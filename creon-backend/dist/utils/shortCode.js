"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidShortCode = exports.generateUniqueShortCode = exports.generateShortCode = void 0;
const CHARACTERS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const generateShortCode = (length = 8) => {
    let result = '';
    const charactersLength = CHARACTERS.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += CHARACTERS.charAt(randomIndex);
    }
    return result;
};
exports.generateShortCode = generateShortCode;
const generateUniqueShortCode = async (checkFunction, length = 8, maxAttempts = 10) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = (0, exports.generateShortCode)(length);
        const isUnique = await checkFunction(code);
        if (isUnique) {
            return code;
        }
    }
    throw new Error('Unable to generate unique short code');
};
exports.generateUniqueShortCode = generateUniqueShortCode;
const isValidShortCode = (code) => {
    const pattern = /^[a-zA-Z0-9_-]+$/;
    return pattern.test(code) && code.length >= 4 && code.length <= 20;
};
exports.isValidShortCode = isValidShortCode;
//# sourceMappingURL=shortCode.js.map