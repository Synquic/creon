import { Request, Response } from 'express';
import { Theme } from '../models/Theme';
import { AuthRequest } from '../middleware/auth';
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

export const getUserTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getEffectiveUserId(req.user);

    let theme = await Theme.findOne({ userId });
    
    // Create default theme if doesn't exist
    if (!theme) {
      theme = await Theme.create({ userId });
    }

    res.json({
      success: true,
      data: { theme }
    });

  } catch (error) {
    logger.error('Get user theme error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getEffectiveUserId(req.user);
    const themeData = req.body;

    // Validate theme data
    const allowedFields = [
      'backgroundColor', 'primaryColor', 'secondaryColor', 'textColor', 'accentColor',
      'fontFamily', 'fontSize', 'fontWeight',
      'buttonStyle', 'buttonShadow', 'buttonBorderWidth', 'buttonAnimation',
      'profileImageShape', 'profileImageSize', 'linkSpacing', 'maxWidth',
      'backgroundGradient', 'gradientDirection', 'backdropBlur', 'hideBranding',
      'customCss'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (themeData.hasOwnProperty(field)) {
        updateData[field] = themeData[field];
      }
    }

    const theme = await Theme.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: { theme }
    });

  } catch (error) {
    logger.error('Update theme error:', error);
    
    if ((error as any).name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Invalid theme data',
        errors: (error as any).errors
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getPublicTheme = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const theme = await Theme.findOne({ userId });
    
    // Return default theme if none exists
    const defaultTheme = {
      backgroundColor: '#ffffff',
      primaryColor: '#16a34a',
      secondaryColor: '#15803d',
      textColor: '#1f2937',
      accentColor: '#3b82f6',
      fontFamily: 'Inter',
      fontSize: 'medium',
      fontWeight: 'normal',
      buttonStyle: 'rounded',
      buttonShadow: true,
      buttonBorderWidth: 0,
      buttonAnimation: 'hover-scale',
      profileImageShape: 'circle',
      profileImageSize: 'medium',
      linkSpacing: 'normal',
      maxWidth: 'normal',
      backgroundGradient: false,
      gradientDirection: 'vertical',
      backdropBlur: false,
      hideBranding: false
    };

    res.json({
      success: true,
      data: { 
        theme: theme || defaultTheme
      }
    });

  } catch (error) {
    logger.error('Get public theme error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resetTheme = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = getEffectiveUserId(req.user);

    // Delete existing theme to reset to defaults
    await Theme.findOneAndDelete({ userId });

    // Create new default theme
    const theme = await Theme.create({ userId });

    res.json({
      success: true,
      message: 'Theme reset to default successfully',
      data: { theme }
    });

  } catch (error) {
    logger.error('Reset theme error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};