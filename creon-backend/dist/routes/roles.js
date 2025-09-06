"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roleController_1 = require("../controllers/roleController");
const auth_1 = require("../middleware/auth");
const rbac_1 = require("../middleware/rbac");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/users', (0, rbac_1.requirePermission)('VIEW_ALL_USERS'), roleController_1.getAllUsers);
router.get('/users/role/:role', (0, rbac_1.requirePermission)('VIEW_ALL_USERS'), roleController_1.getUsersByRole);
router.get('/stats', (0, rbac_1.requirePermission)('VIEW_ALL_USERS'), roleController_1.getRoleStats);
router.put('/users/:userId/role', (0, rbac_1.requirePermission)('MANAGE_USERS'), roleController_1.updateUserRole);
router.delete('/users/:userId', (0, rbac_1.requirePermission)('DELETE_USER'), roleController_1.deleteUser);
exports.default = router;
//# sourceMappingURL=roles.js.map