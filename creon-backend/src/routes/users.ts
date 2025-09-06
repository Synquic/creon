import { Router } from 'express';
import {
  updateProfile,
  changePassword,
  getUserProfile,
  checkUsernameAvailability,
  getDashboardStats
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import {
  usernameValidation,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

router.put('/profile', authenticate, updateProfile);

router.put('/change-password', authenticate, changePassword);

router.get('/dashboard/stats', authenticate, getDashboardStats);

router.get('/check-username/:username',
  usernameValidation,
  handleValidationErrors,
  checkUsernameAvailability
);

router.get('/:username',
  usernameValidation,
  handleValidationErrors,
  getUserProfile
);

export default router;