import { Request, Response } from 'express';
import { Product, ProductCollection, Analytics } from '../models';
import { AuthRequest } from '../middleware/auth';
import { generateUniqueShortCode, isValidShortCode } from '../utils/shortCode';

const checkProductShortCodeUnique = async (code: string): Promise<boolean> => {
  const existing = await Product.findOne({ shortCode: code });
  return !existing;
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      currency = 'USD',
      image,
      affiliateUrl,
      shortCode,
      tags = [],
      collectionId
    } = req.body;
    const userId = req.user?.id;

    let finalShortCode = shortCode;

    if (shortCode) {
      if (!isValidShortCode(shortCode)) {
        res.status(400).json({
          success: false,
          message: 'Invalid short code format'
        });
        return;
      }

      const isUnique = await checkProductShortCodeUnique(shortCode);
      if (!isUnique) {
        res.status(400).json({
          success: false,
          message: 'Short code is already taken'
        });
        return;
      }
    } else {
      finalShortCode = await generateUniqueShortCode(checkProductShortCodeUnique);
    }

    if (collectionId) {
      const collection = await ProductCollection.findOne({
        _id: collectionId,
        userId
      });

      if (!collection) {
        res.status(400).json({
          success: false,
          message: 'Collection not found'
        });
        return;
      }
    }

    const product = await Product.create({
      userId,
      title,
      description,
      price,
      currency,
      image,
      affiliateUrl,
      shortCode: finalShortCode,
      tags,
      collectionId: collectionId || null
    });

    if (collectionId) {
      await ProductCollection.findByIdAndUpdate(
        collectionId,
        { $push: { products: product._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      collectionId,
      tags
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortOptions: any = { [sortBy as string]: sortDirection };

    const filter: any = { userId };

    if (collectionId) {
      filter.collectionId = collectionId;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('collectionId', 'title'),
      Product.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const product = await Product.findOne({ _id: id, userId })
      .populate('collectionId', 'title');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const {
      title,
      description,
      price,
      currency,
      image,
      affiliateUrl,
      shortCode,
      tags,
      isActive,
      collectionId
    } = req.body;

    let updateData: any = {
      title,
      description,
      price,
      currency,
      image,
      affiliateUrl,
      tags,
      isActive
    };

    if (shortCode) {
      const existingProduct = await Product.findOne({
        shortCode,
        _id: { $ne: id }
      });

      if (existingProduct) {
        res.status(400).json({
          success: false,
          message: 'Short code is already taken'
        });
        return;
      }

      updateData.shortCode = shortCode;
    }

    if (collectionId !== undefined) {
      if (collectionId) {
        const collection = await ProductCollection.findOne({
          _id: collectionId,
          userId
        });

        if (!collection) {
          res.status(400).json({
            success: false,
            message: 'Collection not found'
          });
          return;
        }
      }
      updateData.collectionId = collectionId || null;
    }

    const product = await Product.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('collectionId', 'title');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const product = await Product.findOneAndDelete({ _id: id, userId });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    if (product.collectionId) {
      await ProductCollection.findByIdAndUpdate(
        product.collectionId,
        { $pull: { products: product._id } }
      );
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const redirectProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shortCode } = req.params;

    const product = await Product.findOne({
      shortCode,
      isActive: true
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    product.clickCount += 1;
    await product.save();

    await Analytics.create({
      userId: product.userId,
      productId: (product._id as any).toString(),
      type: 'product_click',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || 'unknown',
      referer: req.get('Referer'),
      timestamp: new Date()
    });

    res.redirect(301, product.affiliateUrl);
  } catch (error) {
    console.error('Redirect product error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProductAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { period = '7d' } = req.query;

    const product = await Product.findOne({ _id: id, userId });

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found'
      });
      return;
    }

    const days = period === '30d' ? 30 : period === '7d' ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.find({
      productId: id,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 });

    const dailyClicks = analytics.reduce((acc: any, click) => {
      const date = click.timestamp.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        product: {
          id: product._id,
          title: product.title,
          shortCode: product.shortCode,
          totalClicks: product.clickCount
        },
        analytics: {
          totalClicks: analytics.length,
          dailyClicks,
          recentClicks: analytics.slice(0, 50)
        }
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};