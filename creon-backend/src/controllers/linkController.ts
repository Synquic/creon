import { Request, Response } from "express";
import { Link, Analytics } from "../models";
import { AuthRequest } from "../middleware/auth";
import { generateUniqueShortCode, isValidShortCode } from "../utils/shortCode";
import { logger } from "../index";

const checkShortCodeUnique = async (code: string): Promise<boolean> => {
  const existing = await Link.findOne({ shortCode: code });
  return !existing;
};

export const createLink = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    logger.info("🎯 CREATE LINK REQUEST:", {
      body: req.body,
      userId: req.user?.id,
      headers: {
        authorization: req.headers.authorization ? "✅ Present" : "❌ Missing",
        contentType: req.headers["content-type"],
      },
    });

    const {
      title,
      url,
      shortCode,
      description,
      image,
      type = "link",
    } = req.body;
    const userId = req.user?.id;

    let finalShortCode = shortCode;

    if (shortCode) {
      if (!isValidShortCode(shortCode)) {
        res.status(400).json({
          success: false,
          message: "Invalid short code format",
        });
        return;
      }

      const isUnique = await checkShortCodeUnique(shortCode);
      if (!isUnique) {
        res.status(400).json({
          success: false,
          message: "Short code is already taken",
        });
        return;
      }
    } else {
      finalShortCode = await generateUniqueShortCode(checkShortCodeUnique);
    }

    const maxOrder = await Link.findOne({ userId }).sort({ order: -1 });
    const order = (maxOrder?.order || 0) + 1;

    const link = await Link.create({
      userId,
      title,
      url,
      shortCode: finalShortCode,
      description,
      image,
      type,
      order,
    });

    res.status(201).json({
      success: true,
      message: "Link created successfully",
      data: { link },
    });
  } catch (error) {
    logger.error("Create link error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLinks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    logger.info("Get links called", { query: req.query });
    const userId = req.user?.id;
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

    const [links, total] = await Promise.all([
      Link.find({ userId }).sort(sortOptions).skip(skip).limit(limitNum),
      Link.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      data: {
        links,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error("Get links error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLinkById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const link = await Link.findOne({ _id: id, userId });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Link not found",
      });
      return;
    }

    res.json({
      success: true,
      data: { link },
    });
  } catch (error) {
    logger.error("Get link by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateLink = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { title, url, shortCode, description, image, isActive, order } =
      req.body;

    let updateData: any = { title, url, description, image, isActive };

    if (order !== undefined) {
      updateData.order = order;
    }

    if (shortCode) {
      const existingLink = await Link.findOne({
        shortCode,
        _id: { $ne: id },
      });

      if (existingLink) {
        res.status(400).json({
          success: false,
          message: "Short code is already taken",
        });
        return;
      }

      updateData.shortCode = shortCode;
    }

    const link = await Link.findOneAndUpdate({ _id: id, userId }, updateData, {
      new: true,
      runValidators: true,
    });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Link not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Link updated successfully",
      data: { link },
    });
  } catch (error) {
    logger.error("Update link error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteLink = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const link = await Link.findOneAndDelete({ _id: id, userId });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Link not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Link deleted successfully",
    });
  } catch (error) {
    logger.error("Delete link error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const reorderLinks = async (req: Request, res: Response) => {
  try {
    console.log("Reorder links called", { body: req.body });
    const linkOrders: Array<{ id: string; order: number }> = req.body.linkOrders;

    if (!Array.isArray(linkOrders)) {
      return res.status(400).json({ message: 'Invalid input format' });
    }

    const bulkOps = linkOrders.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));

    const result = await Link.bulkWrite(bulkOps);

    return res.status(200).json({ message: 'Links reordered successfully', result });
  } catch (error) {
    console.error('Error reordering links:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
export const redirectLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { shortCode } = req.params;

    const link = await Link.findOne({
      shortCode,
      isActive: true,
    });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Link not found",
      });
      return;
    }

    link.clickCount += 1;
    await link.save();

    await Analytics.create({
      userId: link.userId,
      linkId: (link._id as any).toString(),
      type: "link_click",
      ipAddress: req.ip,
      userAgent: req.get("User-Agent") || "unknown",
      referer: req.get("Referer"),
      timestamp: new Date(),
    });

    res.redirect(301, link.url);
  } catch (error) {
    logger.error("Redirect link error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLinkAnalytics = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { period = "7d" } = req.query;

    const link = await Link.findOne({ _id: id, userId });

    if (!link) {
      res.status(404).json({
        success: false,
        message: "Link not found",
      });
      return;
    }

    const days = period === "30d" ? 30 : period === "7d" ? 7 : 1;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.find({
      linkId: id,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: -1 });

    const dailyClicks = analytics.reduce((acc: any, click) => {
      const date = click.timestamp.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        link: {
          id: link._id,
          title: link.title,
          shortCode: link.shortCode,
          totalClicks: link.clickCount,
        },
        analytics: {
          totalClicks: analytics.length,
          dailyClicks,
          recentClicks: analytics.slice(0, 50),
        },
      },
    });
  } catch (error) {
    logger.error("Get link analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
