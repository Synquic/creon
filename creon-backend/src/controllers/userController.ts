import { Request, Response } from 'express';
import { User, Link, Product, ProductCollection, Analytics } from '../models';
import { AuthRequest } from '../middleware/auth';
import { Theme } from '../models/Theme';
import ShopSettings from '../models/ShopSettings';
import { logger } from '../index';

// Helper function to get the effective user for profile operations
const getEffectiveUserId = (user: any): string => {
  // If user is a manager, return their parent's ID
  if (user?.role === 'manager' && user?.parentUserId) {
    return user.parentUserId;
  }
  // Otherwise return their own ID
  return user?.id;
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, bio, socialLinks, theme } = req.body;
    
    // Get the effective user ID (parent for managers, self for admins)
    const targetUserId = getEffectiveUserId(req.user);

    const user = await User.findByIdAndUpdate(
      targetUserId,
      {
        firstName,
        lastName,
        bio,
        socialLinks,
        theme
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Construct full URL for profile image if it exists
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profileImageUrl = user.profileImage ? 
      (user.profileImage.startsWith('http') ? user.profileImage : `${baseUrl}${user.profileImage}`) : 
      null;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          profileImage: profileImageUrl,
          socialLinks: user.socialLinks,
          theme: user.theme,
          profileUrl: `/${user.username}`
        }
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?.id).select('+password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const isCurrentPasswordValid = await (user as any).comparePassword(currentPassword);

    if (!isCurrentPasswordValid) {
      res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const links = await Link.find({
      userId: (user._id as any).toString(),
      isActive: true
    }).sort({ order: 1 });

    const collections = await ProductCollection.find({
      userId: (user._id as any).toString(),
      isActive: true
    }).sort({ order: 1 });

    const products = await Product.find({
      userId: (user._id as any).toString(),
      isActive: true
    });

    await Analytics.create({
      userId: (user._id as any).toString(),
      type: 'profile_view',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
      timestamp: new Date()
    });

    const theme = await Theme.findOne({ userId: (user._id as any).toString() });
    const shopSettings = await ShopSettings.findOne({ userId: (user._id as any).toString() });

    // Construct full URL for profile image if it exists
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const profileImageUrl = user.profileImage ? 
      (user.profileImage.startsWith('http') ? user.profileImage : `${baseUrl}${user.profileImage}`) : 
      null;

    res.json({
      success: true,
      data: {
        user: {
          id: (user._id as any).toString(),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          profileImage: profileImageUrl,
          socialLinks: user.socialLinks,
          theme: theme
        },
        links,
        collections,
        products,
        shopSettings: shopSettings || { isVisible: false, isMainTab: false }
      }
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const checkUsernameAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    res.json({
      success: true,
      data: {
        available: !user
      }
    });
  } catch (error) {
    logger.error('Check username availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get the effective user ID (parent for managers, self for admins)
    const targetUserId = getEffectiveUserId(req.user);

    const [linkCount, productCount, collectionCount] = await Promise.all([
      Link.countDocuments({ userId: targetUserId }),
      Product.countDocuments({ userId: targetUserId }),
      ProductCollection.countDocuments({ userId: targetUserId })
    ]);

    const totalClicks = await Analytics.countDocuments({
      userId: targetUserId,
      type: { $in: ['link_click', 'product_click'] }
    });

    const profileViews = await Analytics.countDocuments({
      userId: targetUserId,
      type: 'profile_view'
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentClicks = await Analytics.countDocuments({
      userId: targetUserId,
      type: { $in: ['link_click', 'product_click'] },
      timestamp: { $gte: last7Days }
    });

    const recentViews = await Analytics.countDocuments({
      userId: targetUserId,
      type: 'profile_view',
      timestamp: { $gte: last7Days }
    });

    res.json({
      success: true,
      data: {
        stats: {
          links: linkCount,
          products: productCount,
          collections: collectionCount,
          totalClicks,
          profileViews,
          last7Days: {
            clicks: recentClicks,
            views: recentViews
          }
        }
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};