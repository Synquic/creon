"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.hasPermission = exports.PERMISSIONS = exports.requireOwnershipOrAdmin = exports.canAccessOwnResource = exports.requireRole = exports.hasRole = void 0;
const ROLE_HIERARCHY = ['viewer', 'user', 'manager', 'admin', 'super_admin'];
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
                message: 'Authentication required'
            });
        }
        const userRole = req.user.role;
        if (!(0, exports.hasRole)(userRole, requiredRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${requiredRole} role or higher required.`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
const canAccessOwnResource = (req, resourceUserId) => {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    if ((0, exports.hasRole)(userRole, 'admin')) {
        return true;
    }
    return userId === resourceUserId;
};
exports.canAccessOwnResource = canAccessOwnResource;
const requireOwnershipOrAdmin = (getUserIdFromResource) => {
    return (req, res, next) => {
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
        if (!(0, exports.canAccessOwnResource)(req, resourceUserId)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own resources.'
            });
        }
        next();
    };
};
exports.requireOwnershipOrAdmin = requireOwnershipOrAdmin;
exports.PERMISSIONS = {
    CREATE_USER: 'admin',
    DELETE_USER: 'super_admin',
    MANAGE_USERS: 'admin',
    VIEW_ALL_USERS: 'manager',
    CREATE_CONTENT: 'user',
    EDIT_CONTENT: 'user',
    DELETE_CONTENT: 'user',
    VIEW_CONTENT: 'viewer',
    VIEW_ANALYTICS: 'user',
    VIEW_ALL_ANALYTICS: 'manager',
    SYSTEM_SETTINGS: 'super_admin',
    MANAGE_ROLES: 'super_admin',
    MANAGE_SHOP: 'user',
    VIEW_SHOP: 'viewer',
    MANAGE_THEME: 'user',
    VIEW_THEME: 'viewer'
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
                message: 'Authentication required'
            });
        }
        const userRole = req.user.role;
        if (!(0, exports.hasPermission)(userRole, permission)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Insufficient permissions for ${permission}.`
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
    PERMISSIONS: exports.PERMISSIONS
};
//# sourceMappingURL=rbac.js.map