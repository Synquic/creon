import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ShopSettings from '../models/ShopSettings';
import { logger } from '../index';

export const getShopSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    let shopSettings = await ShopSettings.findOne({ userId });
    
    if (!shopSettings) {
      // Create default shop settings if none exist
      shopSettings = await ShopSettings.create({
        userId,
        isVisible: false,
        title: 'Shop',
        isMainTab: false
      });
    }

    res.json({
      success: true,
      message: 'Shop settings retrieved successfully',
      data: { settings: shopSettings }
    });

  } catch (error) {
    logger.error('Get shop settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateShopSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const updateData = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    // Validate allowed fields
    const allowedFields = ['isVisible', 'title', 'description', 'isMainTab'];
    const filteredData: any = {};
    
    for (const field of allowedFields) {
      if (updateData.hasOwnProperty(field)) {
        filteredData[field] = updateData[field];
      }
    }

    const shopSettings = await ShopSettings.findOneAndUpdate(
      { userId },
      filteredData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Shop settings updated successfully',
      data: { settings: shopSettings }
    });

  } catch (error) {
    logger.error('Update shop settings error:', error);
    
    if ((error as any).name === 'ValidationError') {
      res.status(400).json({
        success: false,
        message: 'Invalid shop settings data',
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

export const getPublicShopSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
      return;
    }

    const shopSettings = await ShopSettings.findOne({ userId });
    
    if (!shopSettings) {
      res.json({
        success: true,
        message: 'Shop settings not found',
        data: { 
          settings: {
            isVisible: false,
            title: 'Shop',
            isMainTab: false
          }
        }
      });
      return;
    }

    res.json({
      success: true,
      message: 'Public shop settings retrieved successfully',
      data: { settings: shopSettings }
    });

  } catch (error) {
    logger.error('Get public shop settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
