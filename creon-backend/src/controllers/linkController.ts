import { Request, Response } from "express";
import { Link, Analytics } from "../models";
import { AuthRequest } from "../middleware/auth";
import { generateUniqueShortCode, isValidShortCode } from "../utils/shortCode";
import { logger } from "../index";
import { LinkTester } from "../jobs/testLinks";

// Helper function to get the effective user for profile operations
const getEffectiveUserId = (user: any): string => {
  // If user is a manager, return their parent's ID
  if (user?.role === 'manager' && user?.parentUserId) {
    return user.parentUserId;
  }
  // Otherwise return their own ID
  return user?.id;
};

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
      isWorking = true,
    } = req.body;
    const userId = getEffectiveUserId(req.user);

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
      isWorking,
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
    const userId = getEffectiveUserId(req.user);

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
    const userId = getEffectiveUserId(req.user);
    const { title, url, shortCode, description, image, isActive, isWorking, order } =
      req.body;

    let updateData: any = { title, url, description, image, isActive, isWorking };

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
    const userId = getEffectiveUserId(req.user);

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
    const userId = getEffectiveUserId(req.user);
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

export const retestLinks = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = getEffectiveUserId(req.user);
    
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
      return;
    }
    
    logger.info(`Manual link retest requested by user: ${userId}`);

    // Test links for the specific user
    const results = await LinkTester.testLinksForUser(userId);
    
    // Get updated stats
    const stats = await LinkTester.getLinkTestStats();

    res.json({
      success: true,
      message: "Link testing completed successfully",
      data: {
        tested: results.length,
        working: results.filter(r => r.isWorking).length,
        notWorking: results.filter(r => !r.isWorking).length,
        results,
        stats,
      },
    });
  } catch (error) {
    logger.error("Retest links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test links",
    });
  }
};

export const retestAllLinks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    logger.info("Manual retest of all links requested");

    // Test all links in the system
    const results = await LinkTester.testAllLinks();
    
    // Get updated stats
    const stats = await LinkTester.getLinkTestStats();

    res.json({
      success: true,
      message: "All links testing completed successfully",
      data: {
        tested: results.length,
        working: results.filter(r => r.isWorking).length,
        notWorking: results.filter(r => !r.isWorking).length,
        stats,
      },
    });
  } catch (error) {
    logger.error("Retest all links error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to test all links",
    });
  }
};
