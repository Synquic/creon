import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { UserRole } from '../middleware/rbac';

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const requestingUserId = req.user?.id;

    // Validate role
    const validRoles: UserRole[] = ['super_admin', 'admin', 'manager', 'viewer', 'user'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
      return;
    }

    // Prevent users from changing their own role
    if (userId === requestingUserId) {
      res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
      return;
    }

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Prevent demotion of other super admins (only super admin can do this)
    if (targetUser.role === 'super_admin' && req.user?.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Only super admins can change super admin roles'
      });
      return;
    }

    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUsersByRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.params;
    
    const validRoles: UserRole[] = ['super_admin', 'admin', 'manager', 'viewer', 'user'];
    if (!validRoles.includes(role as UserRole)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
      return;
    }

    const users = await User.find({ role }, '-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { users, role }
    });
  } catch (error) {
    console.error('Get users by role error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getRoleStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalUsers = await User.countDocuments();
    
    res.json({
      success: true,
      data: { 
        roleStats,
        totalUsers
      }
    });
  } catch (error) {
    console.error('Get role stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    // Prevent users from deleting themselves
    if (userId === requestingUserId) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
      return;
    }

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Only super admin can delete other super admins
    if (targetUser.role === 'super_admin' && req.user?.role !== 'super_admin') {
      res.status(403).json({
        success: false,
        message: 'Only super admins can delete super admin accounts'
      });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};