"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const themeController_1 = require("../controllers/themeController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticate, themeController_1.getUserTheme);
router.put('/', auth_1.authenticate, themeController_1.updateTheme);
router.delete('/reset', auth_1.authenticate, themeController_1.resetTheme);
router.get('/public/:userId', themeController_1.getPublicTheme);
exports.default = router;
//# sourceMappingURL=theme.js.map