import { Router } from 'express';
import {
  createSubUser,
  getSubUsers,
  updateSubUser,
  deleteSubUser,
  resetSubUserPassword
} from '../controllers/subUserController';
import { authenticate } from '../middleware/auth';
import { createLimiter } from '../middleware/rateLimiting';
import { body, param, handleValidationErrors } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation middleware
const createSubUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'viewer', 'user'])
    .withMessage('Invalid role')
];

const updateSubUserValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'viewer', 'user'])
    .withMessage('Invalid role'),
  body('isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('isEmailVerified must be a boolean')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID')
];

// Routes
router.post('/',
  createLimiter,
  createSubUserValidation,
  handleValidationErrors,
  createSubUser
);

router.get('/', getSubUsers);

router.put('/:id',
  updateSubUserValidation,
  handleValidationErrors,
  updateSubUser
);

router.delete('/:id',
  idValidation,
  handleValidationErrors,
  deleteSubUser
);

router.post('/:id/reset-password',
  createLimiter,
  idValidation,
  handleValidationErrors,
  resetSubUserPassword
);

export default router;