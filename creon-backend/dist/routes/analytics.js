"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analyticsController_1 = require("../controllers/analyticsController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/track', analyticsController_1.trackEvent);
router.use(auth_1.authenticate);
router.get('/dashboard', analyticsController_1.getDashboardAnalytics);
router.get('/links/:linkId', analyticsController_1.getLinkAnalytics);
router.get('/products/:productId', analyticsController_1.getProductAnalytics);
exports.default = router;
//# sourceMappingURL=analytics.js.map