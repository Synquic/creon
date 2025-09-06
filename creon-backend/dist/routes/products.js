"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', rateLimiting_1.createLimiter, validation_1.productValidation, validation_1.handleValidationErrors, productController_1.createProduct);
router.get('/', validation_1.paginationValidation, validation_1.handleValidationErrors, productController_1.getProducts);
router.get('/:id', productController_1.getProductById);
router.put('/:id', productController_1.updateProduct);
router.delete('/:id', productController_1.deleteProduct);
router.get('/:id/analytics', productController_1.getProductAnalytics);
exports.default = router;
//# sourceMappingURL=products.js.map