import { Router } from 'express';
import {
  getUserTheme,
  updateTheme,
  getPublicTheme,
  resetTheme
} from '../controllers/themeController';
import { authenticate } from '../middleware/auth';

const router = Router();

// User theme routes (authenticated)
router.get('/', authenticate, getUserTheme);
router.put('/', authenticate, updateTheme);
router.delete('/reset', authenticate, resetTheme);

// Public theme route (no auth required)
router.get('/public/:userId', getPublicTheme);

export default router;