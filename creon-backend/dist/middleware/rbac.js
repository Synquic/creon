"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.hasPermission = exports.PERMISSIONS = exports.requireOwnershipOrAdmin = exports.canManageProfile = exports.canAccessOwnResource = exports.requireRole = exports.hasRole = void 0;
const ROLE_HIERARCHY = ["admin", "manager"];
const hasRole = (userRole, requiredRole) => {
    const userRoleIndex = ROLE_HIERARCHY.indexOf(userRole);
    const requiredRoleIndex = ROLE_HIERARCHY.indexOf(requiredRole);
    return userRoleIndex >= requiredRoleIndex;
};
exports.hasRole = hasRole;
const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const userRole = req.user.role;
        if (!(0, exports.hasRole)(userRole, requiredRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${requiredRole} role or higher required.`,
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
const canAccessOwnResource = (req, resourceUserId) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const parentUserId = req.user?.parentUserId;
    if ((0, exports.hasRole)(userRole, "admin")) {
        return true;
    }
    if (userRole === "manager" &&
        parentUserId &&
        parentUserId === resourceUserId) {
        return true;
    }
    return userId === resourceUserId;
};
exports.canAccessOwnResource = canAccessOwnResource;
const canManageProfile = (req, targetUserId) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const parentUserId = req.user?.parentUserId;
    if (userRole === "admin" && userId === targetUserId) {
        return true;
    }
    if (userRole === "manager" && parentUserId && parentUserId === targetUserId) {
        return true;
    }
    return false;
};
exports.canManageProfile = canManageProfile;
const requireOwnershipOrAdmin = (getUserIdFromResource) => {
    return (req, res, next) => {
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
        if (!(0, exports.canAccessOwnResource)(req, resourceUserId)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only access your own resources.",
            });
        }
        next();
    };
};
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
exports.PERMISSIONS = {
    CREATE_USER: "admin",
    DELETE_USER: "admin",
    MANAGE_USERS: "admin",
    VIEW_ALL_USERS: "admin",
    CREATE_CONTENT: "manager",
    EDIT_CONTENT: "manager",
    DELETE_CONTENT: "manager",
    VIEW_CONTENT: "manager",
    VIEW_ANALYTICS: "manager",
    VIEW_ALL_ANALYTICS: "manager",
    MANAGE_PROFILE: "manager",
    VIEW_PROFILE: "manager",
    SYSTEM_SETTINGS: "manager",
    MANAGE_ROLES: "admin",
    MANAGE_SHOP: "manager",
    VIEW_SHOP: "manager",
    MANAGE_THEME: "manager",
    VIEW_THEME: "manager",
};
const hasPermission = (userRole, permission) => {
    const requiredRole = exports.PERMISSIONS[permission];
    return (0, exports.hasRole)(userRole, requiredRole);
};
exports.hasPermission = hasPermission;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }
        const userRole = req.user.role;
        if (!(0, exports.hasPermission)(userRole, permission)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Insufficient permissions for ${permission}.`,
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
exports.default = {
    requireRole: exports.requireRole,
    requireOwnershipOrAdmin: exports.requireOwnershipOrAdmin,
    requirePermission: exports.requirePermission,
    hasRole: exports.hasRole,
    hasPermission: exports.hasPermission,
    canAccessOwnResource: exports.canAccessOwnResource,
    canManageProfile: exports.canManageProfile,
    PERMISSIONS: exports.PERMISSIONS,
};
//# sourceMappingURL=rbac.js.map