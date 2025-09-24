"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginationValidation = exports.shortCodeValidation = exports.usernameValidation = exports.productValidation = exports.linkValidation = exports.loginValidation = exports.registerValidation = exports.handleValidationErrors = exports.query = exports.param = exports.body = void 0;
const express_validator_1 = require("express-validator");
Object.defineProperty(exports, "body", { enumerable: true, get: function () { return express_validator_1.body; } });
Object.defineProperty(exports, "param", { enumerable: true, get: function () { return express_validator_1.param; } });
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return express_validator_1.query; } });
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.registerValidation = [
    (0, express_validator_1.body)("username")
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be 3-20 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores"),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please provide a valid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
    (0, express_validator_1.body)("firstName")
        .optional()
        .isLength({ max: 50 })
        .withMessage("First name cannot exceed 50 characters"),
    (0, express_validator_1.body)("lastName")
        .optional()
        .isLength({ max: 50 })
        .withMessage("Last name cannot exceed 50 characters"),
];
exports.loginValidation = [
    (0, express_validator_1.body)("identifier").notEmpty().withMessage("Username or email is required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.linkValidation = [
    (0, express_validator_1.body)("title")
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ max: 100 })
        .withMessage("Title cannot exceed 100 characters"),
    (0, express_validator_1.body)("url").isURL().withMessage("Please provide a valid URL"),
    (0, express_validator_1.body)("shortCode")
        .optional()
        .isLength({ min: 4, max: 20 })
        .withMessage("Short code must be 4-20 characters")
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage("Short code can only contain letters, numbers, hyphens, and underscores"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 250 })
        .withMessage("Description cannot exceed 250 characters"),
    (0, express_validator_1.body)("type")
        .optional()
        .isIn(["link", "header", "social", "product_collection"])
        .withMessage("Invalid link type"),
];
exports.productValidation = [
    (0, express_validator_1.body)("title")
        .notEmpty()
        .withMessage("Product title is required")
        .isLength({ max: 150 })
        .withMessage("Title cannot exceed 150 characters"),
    (0, express_validator_1.body)("affiliateUrl")
        .isURL()
        .withMessage("Please provide a valid affiliate URL"),
    (0, express_validator_1.body)("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("currency")
        .optional()
        .isLength({ min: 3, max: 3 })
        .withMessage("Currency code must be 3 characters")
        .isUppercase()
        .withMessage("Currency code must be uppercase"),
    (0, express_validator_1.body)("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
    (0, express_validator_1.body)("shortCode")
        .optional()
        .isLength({ min: 4, max: 20 })
        .withMessage("Short code must be 4-20 characters")
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage("Short code can only contain letters, numbers, hyphens, and underscores"),
    (0, express_validator_1.body)("tags").optional().isArray().withMessage("Tags must be an array"),
    (0, express_validator_1.body)("tags.*")
        .optional()
        .isLength({ max: 30 })
        .withMessage("Each tag cannot exceed 30 characters"),
];
exports.usernameValidation = [
    (0, express_validator_1.param)("username")
        .isLength({ min: 3, max: 20 })
        .withMessage("Username must be 3-20 characters")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage("Username can only contain letters, numbers, and underscores"),
];
exports.shortCodeValidation = [
    (0, express_validator_1.param)("shortCode")
        .isLength({ min: 4, max: 20 })
        .withMessage("Short code must be 4-20 characters")
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage("Short code can only contain letters, numbers, hyphens, and underscores"),
];
exports.paginationValidation = [
    (0, express_validator_1.query)("page")
        .optional()
        .isInt({ min: 1 })
        .withMessage("Page must be a positive integer"),
    (0, express_validator_1.query)("limit")
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage("Limit must be between 1 and 100"),
    (0, express_validator_1.query)("sortBy")
        .optional()
        .isIn(["createdAt", "updatedAt", "clickCount", "order"])
        .withMessage("Invalid sort field"),
    (0, express_validator_1.query)("sortOrder")
        .optional()
        .isIn(["asc", "desc"])
        .withMessage("Sort order must be asc or desc"),
];
//# sourceMappingURL=validation.js.map