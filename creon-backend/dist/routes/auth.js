"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post("/register", rateLimiting_1.authLimiter, validation_1.registerValidation, validation_1.handleValidationErrors, authController_1.register);
router.post("/login", rateLimiting_1.authLimiter, validation_1.loginValidation, validation_1.handleValidationErrors, authController_1.login);
router.post("/refresh-token", authController_1.refreshToken);
router.post("/logout", auth_1.authenticate, authController_1.logout);
router.post("/logout-all", auth_1.authenticate, authController_1.logoutAll);
router.get("/profile", auth_1.authenticate, authController_1.getProfile);
router.get("/check-username/:username", authController_1.checkUsernameAvailability);
router.post("/change-password", auth_1.authenticate, authController_1.changePassword);
exports.default = router;
//# sourceMappingURL=auth.js.map