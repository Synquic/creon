import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { User, Session } from "../models";
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../index";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "email" : "username";
      res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
      return;
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    const tokenPayload = {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken((user._id as any).toString());

    await Session.create({
      userId: (user._id as any).toString(),
      token: refreshToken,
      ipAddress: req.ip,
      deviceInfo: req.get("User-Agent"),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id as any,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          profileUrl: `/${user.username}`,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user || !(await (user as any).comparePassword(password))) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const tokenPayload = {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      userType: user.userType,
      parentUserId: user.parentUserId,
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken((user._id as any).toString());

    await Session.create({
      userId: (user._id as any).toString(),
      token: refreshToken,
      ipAddress: req.ip,
      deviceInfo: req.get("User-Agent"),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id as any,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          userType: user.userType,
          parentUserId: user.parentUserId,
          isFirstLogin: user.isFirstLogin,
          profileUrl: `/${user.username}`,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // For first login, skip current password validation
    if (!user.isFirstLogin) {
      const isCurrentPasswordValid = await (user as any).comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
        return;
      }
    }

    user.password = newPassword;
    user.isFirstLogin = false;
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

export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

    const session = await Session.findOne({
      userId: decoded.id,
      token: refreshToken,
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const tokenPayload = {
      id: (user._id as any).toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateToken(tokenPayload);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    logger.error("Token refresh error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
};

export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await Session.deleteOne({
        userId: req.user?.id,
        token: refreshToken,
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logoutAll = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    await Session.deleteMany({
      userId: req.user?.id,
    });

    res.json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    logger.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const checkUsernameAvailability = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username } = req.params;

    if (!username) {
      res.status(400).json({
        success: false,
        message: "Username is required",
      });
      return;
    }

    const cleanUsername = username.toLowerCase().trim();

    if (cleanUsername.length < 3 || cleanUsername.length > 20) {
      res.status(400).json({
        success: false,
        message: "Username must be between 3 and 20 characters",
      });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      res.status(400).json({
        success: false,
        message: "Username can only contain letters, numbers, and underscores",
      });
      return;
    }

    const existingUser = await User.findOne({ username: cleanUsername });

    res.json({
      success: true,
      data: {
        available: !existingUser,
        username: cleanUsername,
      },
    });
  } catch (error) {
    logger.error("Check username availability error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const currentUser = await User.findById(req.user?.id);

    if (!currentUser) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // If user is a manager, get their parent's profile data
    let profileUser = currentUser;
    if (currentUser.role === 'manager' && currentUser.parentUserId) {
      const parentUser = await User.findById(currentUser.parentUserId);
      if (parentUser) {
        profileUser = parentUser;
      }
    }

    // Determine protocol: use process.env.BASE_PROTOCOL if set, otherwise default to 'http'
    let protocol = process.env.BASE_PROTOCOL
      ? process.env.BASE_PROTOCOL
      : "http";
    const baseUrl = `${protocol}://${req.get("host")}`;
    const profileImageUrl = profileUser.profileImage
      ? profileUser.profileImage.startsWith("http")
        ? profileUser.profileImage
        : `${baseUrl}${profileUser.profileImage}`
      : null;

    res.json({
      success: true,
      data: {
        user: {
          id: profileUser._id as any,
          username: profileUser.username,
          email: profileUser.email,
          firstName: profileUser.firstName,
          lastName: profileUser.lastName,
          bio: profileUser.bio,
          profileImage: profileImageUrl,
          role: currentUser.role, // Keep the current user's role for permissions
          userType: currentUser.userType,
          parentUserId: currentUser.parentUserId,
          socialLinks: profileUser.socialLinks,
          theme: profileUser.theme,
          isPremium: profileUser.isPremium,
          profileUrl: `/${profileUser.username}`,
          createdAt: profileUser.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
