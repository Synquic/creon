import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'viewer' | 'user';

// Role hierarchy - higher index means more permissions
const ROLE_HIERARCHY: UserRole[] = ['viewer', 'user', 'manager', 'admin', 'super_admin'];

/**
 * Check if user has required role or higher
 */
export const hasRole = (userRole: UserRole, requiredRole: UserRole): boolean => {
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
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role as UserRole;
    
    if (!hasRole(userRole, requiredRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${requiredRole} role or higher required.`
      });
    }

    next();
  };
};

/**
 * Check if user can perform actions on resources they own
 */
export const canAccessOwnResource = (req: AuthRequest, resourceUserId: string): boolean => {
  const userRole = req.user?.role as UserRole;
  const userId = req.user?.id;
  
  // Super admin and admin can access any resource
  if (hasRole(userRole, 'admin')) {
    return true;
  }
  
  // Users can only access their own resources
  return userId === resourceUserId;
};

/**
 * Middleware to check resource ownership or admin privileges
 */
export const requireOwnershipOrAdmin = (getUserIdFromResource: (req: AuthRequest) => string | null) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const resourceUserId = getUserIdFromResource(req);
    
    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resource'
      });
    }

    if (!canAccessOwnResource(req, resourceUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Permission definitions for different operations
export const PERMISSIONS = {
  // User management
  CREATE_USER: 'admin',
  DELETE_USER: 'super_admin',
  MANAGE_USERS: 'admin',
  VIEW_ALL_USERS: 'manager',
  
  // Content management
  CREATE_CONTENT: 'user',
  EDIT_CONTENT: 'user',
  DELETE_CONTENT: 'user',
  VIEW_CONTENT: 'viewer',
  
  // Analytics and reporting
  VIEW_ANALYTICS: 'user',
  VIEW_ALL_ANALYTICS: 'manager',
  
  // System management
  SYSTEM_SETTINGS: 'super_admin',
  MANAGE_ROLES: 'super_admin',
  
  // Shop management
  MANAGE_SHOP: 'user',
  VIEW_SHOP: 'viewer',
  
  // Theme management
  MANAGE_THEME: 'user',
  VIEW_THEME: 'viewer'
} as const;

/**
 * Check if user has specific permission
 */
export const hasPermission = (userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean => {
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
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role as UserRole;
    
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Insufficient permissions for ${permission}.`
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
  PERMISSIONS
};