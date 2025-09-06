"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const auth_1 = require("../middleware/auth");
const rateLimiting_1 = require("../middleware/rateLimiting");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.use(rateLimiting_1.uploadLimiter);
router.post('/image', (0, upload_1.uploadSingle)('image'), uploadController_1.uploadImage);
router.post('/profile', (0, upload_1.uploadSingle)('profileImage'), uploadController_1.uploadProfileImage);
exports.default = router;
//# sourceMappingURL=upload.js.map