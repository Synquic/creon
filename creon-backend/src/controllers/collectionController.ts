import { Request, Response } from "express";
import { ProductCollection, Product } from "../models";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../index";

// Helper function to get the effective user for profile operations
const getEffectiveUserId = (user: any): string => {
  // If user is a manager, return their parent's ID
  if (user?.role === "manager" && user?.parentUserId) {
    return user.parentUserId;
  }
  // Otherwise return their own ID
  return user?.id;
};

export const createCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { title, description, image, products = [] } = req.body;
    const userId = getEffectiveUserId(req.user);

    if (products.length > 0) {
      const existingProducts = await Product.find({
        _id: { $in: products },
        userId,
      });

      if (existingProducts.length !== products.length) {
        res.status(400).json({
          success: false,
          message: "Some products do not exist or do not belong to you",
        });
        return;
      }
    }

    const maxOrder = await ProductCollection.findOne({ userId }).sort({
      order: -1,
    });
    const order = (maxOrder?.order || 0) + 1;

    const collection = await ProductCollection.create({
      userId,
      title,
      description,
      image,
      products,
      order,
    });

    if (products.length > 0) {
      await Product.updateMany(
        { _id: { $in: products } },
        { collectionId: collection._id }
      );
    }

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      data: { collection },
    });
  } catch (error) {
    logger.error("Create collection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCollections = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getEffectiveUserId(req.user);
    const {
      page = 1,
      limit = 20,
      sortBy = "order",
      sortOrder = "asc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const sortDirection = sortOrder === "desc" ? -1 : 1;
    const sortOptions: any = { [sortBy as string]: sortDirection };

    const [collections, total] = await Promise.all([
      ProductCollection.find({ userId })
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate("products", "title image price formattedPrice"),
      ProductCollection.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        collections,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Get collections error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCollectionById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = getEffectiveUserId(req.user);

    const collection = await ProductCollection.findOne({
      _id: id,
      userId,
    }).populate("products");

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Collection not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    logger.error("Get collection by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = getEffectiveUserId(req.user);
    const { title, description, image, products, isActive, order } = req.body;

    let updateData: any = { title, description, image, isActive };

    if (order !== undefined) {
      updateData.order = order;
    }

    if (products !== undefined) {
      if (products.length > 0) {
        const existingProducts = await Product.find({
          _id: { $in: products },
          userId,
        });

        if (existingProducts.length !== products.length) {
          res.status(400).json({
            success: false,
            message: "Some products do not exist or do not belong to you",
          });
          return;
        }
      }

      const currentCollection = await ProductCollection.findOne({
        _id: id,
        userId,
      });
      if (currentCollection) {
        await Product.updateMany(
          { _id: { $in: currentCollection.products } },
          { $unset: { collectionId: 1 } }
        );
      }

      updateData.products = products;

      if (products.length > 0) {
        await Product.updateMany(
          { _id: { $in: products } },
          { collectionId: id }
        );
      }
    }

    const collection = await ProductCollection.findOneAndUpdate(
      { _id: id, userId },
      updateData,
      { new: true, runValidators: true }
    ).populate("products");

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Collection not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Collection updated successfully",
      data: { collection },
    });
  } catch (error) {
    logger.error("Update collection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = getEffectiveUserId(req.user);

    const collection = await ProductCollection.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Collection not found",
      });
      return;
    }

    await Product.updateMany(
      { _id: { $in: collection.products } },
      { $unset: { collectionId: 1 } }
    );

    res.json({
      success: true,
      message: "Collection deleted successfully",
    });
  } catch (error) {
    logger.error("Delete collection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const reorderCollections = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { collectionOrders } = req.body;
    const userId = getEffectiveUserId(req.user);

    if (!Array.isArray(collectionOrders)) {
      res.status(400).json({
        success: false,
        message: "collectionOrders must be an array",
      });
      return;
    }

    const updatePromises = collectionOrders.map(({ id, order }) =>
      ProductCollection.updateOne({ _id: id, userId }, { order })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Collections reordered successfully",
    });
  } catch (error) {
    logger.error("Reorder collections error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const addProductToCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { productId } = req.body;
    const userId = getEffectiveUserId(req.user);

    const [collection, product] = await Promise.all([
      ProductCollection.findOne({ _id: id, userId }),
      Product.findOne({ _id: productId, userId }),
    ]);

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Collection not found",
      });
      return;
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    if (collection.products.includes(productId)) {
      res.status(400).json({
        success: false,
        message: "Product already in collection",
      });
      return;
    }

    collection.products.push(productId);
    await collection.save();

    product.collectionId = (collection._id as any).toString();
    await product.save();

    res.json({
      success: true,
      message: "Product added to collection successfully",
    });
  } catch (error) {
    logger.error("Add product to collection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const removeProductFromCollection = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id, productId } = req.params;
    const userId = getEffectiveUserId(req.user);

    const [collection, product] = await Promise.all([
      ProductCollection.findOne({ _id: id, userId }),
      Product.findOne({ _id: productId, userId }),
    ]);

    if (!collection) {
      res.status(404).json({
        success: false,
        message: "Collection not found",
      });
      return;
    }

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    collection.products = collection.products.filter(
      (p) => p.toString() !== productId
    );
    await collection.save();

    product.collectionId = undefined;
    await product.save();

    res.json({
      success: true,
      message: "Product removed from collection successfully",
    });
  } catch (error) {
    logger.error("Remove product from collection error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
