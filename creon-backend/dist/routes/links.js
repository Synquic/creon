"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const linkController_1 = require("../controllers/linkController");
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', rateLimiting_1.createLimiter, validation_1.linkValidation, validation_1.handleValidationErrors, linkController_1.createLink);
router.get('/', validation_1.paginationValidation, validation_1.handleValidationErrors, linkController_1.getLinks);
router.get('/:id', linkController_1.getLinkById);
router.put('/:id', linkController_1.updateLink);
router.delete('/:id', linkController_1.deleteLink);
router.put('/reorder', linkController_1.reorderLinks);
router.get('/:id/analytics', linkController_1.getLinkAnalytics);
exports.default = router;
//# sourceMappingURL=links.js.map