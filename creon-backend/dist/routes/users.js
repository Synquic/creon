"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.put("/profile", auth_1.authenticate, userController_1.updateProfile);
router.put("/change-password", auth_1.authenticate, userController_1.changePassword);
router.get("/dashboard/stats", auth_1.authenticate, userController_1.getDashboardStats);
router.get("/me", userController_1.getMeProfile);
router.get("/check-username/:username", validation_1.usernameValidation, validation_1.handleValidationErrors, userController_1.checkUsernameAvailability);
router.get("/:username", validation_1.usernameValidation, validation_1.handleValidationErrors, userController_1.getUserProfile);
exports.default = router;
//# sourceMappingURL=users.js.map