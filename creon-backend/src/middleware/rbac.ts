import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export type UserRole = "admin" | "manager";

// Role hierarchy - higher index means more permissions
const ROLE_HIERARCHY: UserRole[] = ["admin", "manager"];

/**
 * Check if user has required role or higher
 */
export const hasRole = (
  userRole: UserRole,
  requiredRole: UserRole
): boolean => {
  const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
  const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
  return userRoleIndex >= requiredRoleIndex;
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (requiredRole: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role as UserRole;

    if (!hasRole(userRole, requiredRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${requiredRole} role or higher required.`,
      });
    }

    next();
  };
};

/**
 * Check if user can perform actions on resources they own OR if they're a manager managing their parent's profile
 */
export const canAccessOwnResource = (
  req: AuthRequest,
  resourceUserId: string
): boolean => {
  const userRole = req.user?.role as UserRole;
  const userId = req.user?.id;
  const parentUserId = req.user?.parentUserId;

  // Admin can access any resource
  if (hasRole(userRole, "admin")) {
    return true;
  }

  // Manager can access their parent's resources (for profile management)
  if (
    userRole === "manager" &&
    parentUserId &&
    parentUserId === resourceUserId
  ) {
    return true;
  }

  // Users can access their own resources
  return userId === resourceUserId;
};

/**
 * Check if user can manage profile (own profile or manager managing parent's profile)
 */
export const canManageProfile = (
  req: AuthRequest,
  targetUserId: string
): boolean => {
  const userRole = req.user?.role as UserRole;
  const userId = req.user?.id;
  const parentUserId = req.user?.parentUserId;

  // Admin can manage any profile
  if (userRole === "admin" && userId === targetUserId) {
    return true;
  }

  // Manager can manage their parent's profile
  if (userRole === "manager" && parentUserId && parentUserId === targetUserId) {
    return true;
  }

  return false;
};

/**
 * Middleware to check resource ownership or admin privileges
 */
export const requireOwnershipOrAdmin = (
  getUserIdFromResource: (req: AuthRequest) => string | null
) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const resourceUserId = getUserIdFromResource(req);

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource",
      });
    }

    if (!canAccessOwnResource(req, resourceUserId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only access your own resources.",
      });
    }

    next();
  };
};

// Permission definitions for different operations
export const PERMISSIONS = {
  // User management - only admins can manage users
  CREATE_USER: "admin",
  DELETE_USER: "admin",
  MANAGE_USERS: "admin",
  VIEW_ALL_USERS: "admin",

  // Content management - managers can manage parent's content
  CREATE_CONTENT: "manager",
  EDIT_CONTENT: "manager",
  DELETE_CONTENT: "manager",
  VIEW_CONTENT: "manager",

  // Analytics and reporting - managers can view parent's analytics
  VIEW_ANALYTICS: "manager",
  VIEW_ALL_ANALYTICS: "manager",

  // Profile management - managers can manage parent's profile
  MANAGE_PROFILE: "manager",
  VIEW_PROFILE: "manager",

  // System management - managers can manage app/profile settings
  SYSTEM_SETTINGS: "manager",
  MANAGE_ROLES: "admin", // Only admins can manage roles

  // Shop management - managers can manage parent's shop
  MANAGE_SHOP: "manager",
  VIEW_SHOP: "manager",

  // Theme management - managers can manage parent's theme
  MANAGE_THEME: "manager",
  VIEW_THEME: "manager",
} as const;

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  userRole: UserRole,
  permission: keyof typeof PERMISSIONS
): boolean => {
  const requiredRole = PERMISSIONS[permission] as UserRole;
  return hasRole(userRole, requiredRole);
};

/**
 * Middleware to check specific permission
 */
export const requirePermission = (permission: keyof typeof PERMISSIONS) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userRole = req.user.role as UserRole;

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Insufficient permissions for ${permission}.`,
      });
    }

    next();
  };
};

export default {
  requireRole,
  requireOwnershipOrAdmin,
  requirePermission,
  hasRole,
  hasPermission,
  canAccessOwnResource,
  canManageProfile,
  PERMISSIONS,
};
