import { Router } from 'express';
import {
  trackEvent,
  getDashboardAnalytics,
  getLinkAnalytics,
  getProductAnalytics
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public route for tracking events (no authentication required)
router.post('/track', trackEvent);

// Protected routes requiring authentication
router.use(authenticate);

// Get dashboard analytics overview
router.get('/dashboard', getDashboardAnalytics);

// Get specific link analytics
router.get('/links/:linkId', getLinkAnalytics);

// Get specific product analytics  
router.get('/products/:productId', getProductAnalytics);

export default router;