import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getProfile,
  checkUsernameAvailability
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiting';
import {
  registerValidation,
  loginValidation,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

router.post('/register', 
  authLimiter,
  registerValidation,
  handleValidationErrors,
  register
);

router.post('/login',
  authLimiter,
  loginValidation,
  handleValidationErrors,
  login
);

router.post('/refresh-token', refreshToken);

router.post('/logout', authenticate, logout);

router.post('/logout-all', authenticate, logoutAll);

router.get('/profile', authenticate, getProfile);

router.get('/check-username/:username', checkUsernameAvailability);

export default router;