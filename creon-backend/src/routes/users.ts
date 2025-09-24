import { Router } from "express";
import {
  updateProfile,
  changePassword,
  getUserProfile,
  getMeProfile,
  checkUsernameAvailability,
  getDashboardStats,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import {
  usernameValidation,
  handleValidationErrors,
} from "../middleware/validation";

const router = Router();

router.put("/profile", authenticate, updateProfile);

router.put("/change-password", authenticate, changePassword);

router.get("/dashboard/stats", authenticate, getDashboardStats);

// Special route for /me - serves the configured user's profile
router.get("/me", getMeProfile);

router.get(
  "/check-username/:username",
  usernameValidation,
  handleValidationErrors,
  checkUsernameAvailability
);

router.get(
  "/:username",
  usernameValidation,
  handleValidationErrors,
  getUserProfile
);

export default router;
