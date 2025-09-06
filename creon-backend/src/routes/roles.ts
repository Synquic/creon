import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  getUsersByRole,
  getRoleStats,
  deleteUser
} from '../controllers/roleController';
import { authenticate } from '../middleware/auth';
import { requireRole, requirePermission } from '../middleware/rbac';

const router = Router();

// All role management routes require authentication
router.use(authenticate);

// Get all users (manager and above can view all users)
router.get('/users', requirePermission('VIEW_ALL_USERS'), getAllUsers);

// Get users by role (manager and above)
router.get('/users/role/:role', requirePermission('VIEW_ALL_USERS'), getUsersByRole);

// Get role statistics (manager and above)
router.get('/stats', requirePermission('VIEW_ALL_USERS'), getRoleStats);

// Update user role (admin and above)
router.put('/users/:userId/role', requirePermission('MANAGE_USERS'), updateUserRole);

// Delete user (super admin only)
router.delete('/users/:userId', requirePermission('DELETE_USER'), deleteUser);

export default router;