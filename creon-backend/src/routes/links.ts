import { Router } from "express";
import {
  createLink,
  getLinks,
  getLinkById,
  updateLink,
  deleteLink,
  reorderLinks,
  getLinkAnalytics,
} from "../controllers/linkController";
import { authenticate } from "../middleware/auth";
import { createLimiter } from "../middleware/rateLimiting";
import {
  linkValidation,
  paginationValidation,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  createLimiter,
  linkValidation,
  handleValidationErrors,
  createLink
);

router.get("/", paginationValidation, handleValidationErrors, getLinks);

router.post("/reorder", reorderLinks);

router.get("/:id", getLinkById);

router.put("/:id", updateLink);

router.delete("/:id", deleteLink);

router.get("/:id/analytics", getLinkAnalytics);

export default router;
