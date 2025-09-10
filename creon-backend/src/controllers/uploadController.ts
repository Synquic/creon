import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models';
import { logger } from '../index';

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    logger.error('Upload image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const uploadProfileImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
      return;
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    const userId = req.user?.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: imageUrl },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile image updated successfully',
      data: {
        profileImage: imageUrl,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImage: user.profileImage
        }
      }
    });
  } catch (error) {
    logger.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};