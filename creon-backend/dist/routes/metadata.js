"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const metadataController_1 = require("../controllers/metadataController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/fetch', auth_1.authenticate, metadataController_1.fetchMetadata);
exports.default = router;
//# sourceMappingURL=metadata.js.map