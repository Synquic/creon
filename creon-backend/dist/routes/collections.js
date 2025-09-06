"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collectionController_1 = require("../controllers/collectionController");
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const validation_1 = require("../middleware/validation");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
const collectionValidation = [
    (0, express_validator_1.body)('title')
        .notEmpty()
        .withMessage('Collection title is required')
        .isLength({ max: 100 })
        .withMessage('Title cannot exceed 100 characters'),
    (0, express_validator_1.body)('description')
        .optional()
        .isLength({ max: 300 })
        .withMessage('Description cannot exceed 300 characters'),
    (0, express_validator_1.body)('products')
        .optional()
        .isArray()
        .withMessage('Products must be an array'),
    (0, express_validator_1.body)('products.*')
        .optional()
        .isMongoId()
        .withMessage('Each product must be a valid ID')
];
router.post('/', rateLimiting_1.createLimiter, collectionValidation, validation_1.handleValidationErrors, collectionController_1.createCollection);
router.get('/', validation_1.paginationValidation, validation_1.handleValidationErrors, collectionController_1.getCollections);
router.get('/:id', collectionController_1.getCollectionById);
router.put('/:id', collectionValidation, validation_1.handleValidationErrors, collectionController_1.updateCollection);
router.delete('/:id', collectionController_1.deleteCollection);
router.put('/reorder', collectionController_1.reorderCollections);
router.put('/:id/products', (0, express_validator_1.body)('productId').isMongoId().withMessage('Product ID must be valid'), validation_1.handleValidationErrors, collectionController_1.addProductToCollection);
router.delete('/:id/products/:productId', collectionController_1.removeProductFromCollection);
exports.default = router;
//# sourceMappingURL=collections.js.map