import { Router } from 'express';
import {
  getShopSettings,
  updateShopSettings,
  getPublicShopSettings
} from '../controllers/shopSettingsController';
import { authenticate } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiting';

const router = Router();

// Protected routes (require authentication)
router.use('/settings', authenticate);

// Get user's shop settings
router.get('/settings', createLimiter, getShopSettings);

// Update user's shop settings
router.put('/settings', createLimiter, updateShopSettings);

// Public route (no authentication required)
router.get('/settings/public/:userId', getPublicShopSettings);

export default router;
