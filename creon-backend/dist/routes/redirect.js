"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const linkController_1 = require("../controllers/linkController");
const productController_1 = require("../controllers/productController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/s/:shortCode', validation_1.shortCodeValidation, validation_1.handleValidationErrors, linkController_1.redirectLink);
router.get('/p/:shortCode', validation_1.shortCodeValidation, validation_1.handleValidationErrors, productController_1.redirectProduct);
exports.default = router;
//# sourceMappingURL=redirect.js.map