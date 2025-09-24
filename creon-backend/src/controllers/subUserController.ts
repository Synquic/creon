import { Request, Response } from 'express';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../index';
import crypto from 'crypto';

const generateRandomPassword = (length = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const createSubUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, role = 'admin', firstName, lastName } = req.body;
    const parentUserId = req.user?.id;

    // Only parent users can create sub-users
    const parentUser = await User.findById(parentUserId);
    if (!parentUser || parentUser.userType !== 'parent') {
      res.status(403).json({
        success: false,
        message: 'Only parent users can create sub-users'
      });
      return;
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
      return;
    }

    // Generate username from email
    const username = email.split('@')[0] + '_' + crypto.randomBytes(4).toString('hex');
    
    // Generate random password
    const tempPassword = generateRandomPassword();

    const subUser = await User.create({
      username,
      email,
      password: tempPassword,
      firstName,
      lastName,
      role,
      userType: 'sub',
      parentUserId,
      createdBy: parentUserId,
      isFirstLogin: true,
      isEmailVerified: false
    });

    // Don't return the password in response for security
    const userResponse = subUser.toObject();
    delete (userResponse as any).password;

    res.status(201).json({
      success: true,
      message: 'Sub-user created successfully',
      data: {
        user: userResponse,
        tempPassword // Include temp password only in creation response
      }
    });
  } catch (error) {
    logger.error('Create sub-user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSubUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parentUserId = req.user?.id;
    const { page = 1, limit = 20 } = req.query;

    // Only parent users can view their sub-users
    const parentUser = await User.findById(parentUserId);
    if (!parentUser || parentUser.userType !== 'parent') {
      res.status(403).json({
        success: false,
        message: 'Only parent users can view sub-users'
      });
      return;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [subUsers, total] = await Promise.all([
      User.find({ parentUserId })
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments({ parentUserId })
    ]);

    res.json({
      success: true,
      data: {
        users: subUsers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error('Get sub-users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateSubUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, isEmailVerified } = req.body;
    const parentUserId = req.user?.id;

    // Only parent users can update their sub-users
    const parentUser = await User.findById(parentUserId);
    if (!parentUser || parentUser.userType !== 'parent') {
      res.status(403).json({
        success: false,
        message: 'Only parent users can update sub-users'
      });
      return;
    }

    const subUser = await User.findOneAndUpdate(
      { _id: id, parentUserId },
      { firstName, lastName, role, isEmailVerified },
      { new: true, runValidators: true }
    ).select('-password');

    if (!subUser) {
      res.status(404).json({
        success: false,
        message: 'Sub-user not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Sub-user updated successfully',
      data: { user: subUser }
    });
  } catch (error) {
    logger.error('Update sub-user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteSubUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parentUserId = req.user?.id;

    // Only parent users can delete their sub-users
    const parentUser = await User.findById(parentUserId);
    if (!parentUser || parentUser.userType !== 'parent') {
      res.status(403).json({
        success: false,
        message: 'Only parent users can delete sub-users'
      });
      return;
    }

    const subUser = await User.findOneAndDelete({ _id: id, parentUserId });

    if (!subUser) {
      res.status(404).json({
        success: false,
        message: 'Sub-user not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Sub-user deleted successfully'
    });
  } catch (error) {
    logger.error('Delete sub-user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resetSubUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parentUserId = req.user?.id;

    // Only parent users can reset their sub-users' passwords
    const parentUser = await User.findById(parentUserId);
    if (!parentUser || parentUser.userType !== 'parent') {
      res.status(403).json({
        success: false,
        message: 'Only parent users can reset sub-user passwords'
      });
      return;
    }

    const newPassword = generateRandomPassword();

    const subUser = await User.findOneAndUpdate(
      { _id: id, parentUserId },
      { 
        password: newPassword,
        isFirstLogin: true
      },
      { new: true }
    );

    if (!subUser) {
      res.status(404).json({
        success: false,
        message: 'Sub-user not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: { newPassword }
    });
  } catch (error) {
    logger.error('Reset sub-user password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};