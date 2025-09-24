import { Request, Response } from "express";
import { User } from "../models/User";
import { AuthRequest } from "../middleware/auth";
import { UserRole } from "../middleware/rbac";
import { logger } from "../index";

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    logger.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const requestingUserId = req.user?.id;

    // Validate role
    const validRoles: UserRole[] = ["admin", "manager"];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
      return;
    }

    // Prevent users from changing their own role
    if (userId === requestingUserId) {
      res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
      return;
    }

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Only admins can change other users' roles
    if (req.user?.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can change user roles",
      });
      return;
    }

    // Update the user's role
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "User role updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    logger.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUsersByRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { role } = req.params;

    const validRoles: UserRole[] = ["admin", "manager"];
    if (!validRoles.includes(role as UserRole)) {
      res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
      return;
    }

    const users = await User.find({ role }, "-password").sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: { users, role },
    });
  } catch (error) {
    logger.error("Get users by role error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getRoleStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      data: {
        roleStats,
        totalUsers,
      },
    });
  } catch (error) {
    logger.error("Get role stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user?.id;

    // Prevent users from deleting themselves
    if (userId === requestingUserId) {
      res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
      return;
    }

    // Find the target user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Only admins can delete other users
    if (req.user?.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Only admins can delete user accounts",
      });
      return;
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    logger.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
