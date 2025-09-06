"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getRoleStats = exports.getUsersByRole = exports.updateUserRole = exports.getAllUsers = void 0;
const User_1 = require("../models/User");
const getAllUsers = async (req, res) => {
    try {
        const users = await User_1.User.find({}, '-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            data: { users }
        });
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getAllUsers = getAllUsers;
const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const requestingUserId = req.user?.id;
        const validRoles = ['super_admin', 'admin', 'manager', 'viewer', 'user'];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
            return;
        }
        if (userId === requestingUserId) {
            res.status(400).json({
                success: false,
                message: 'Cannot change your own role'
            });
            return;
        }
        const targetUser = await User_1.User.findById(userId);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (targetUser.role === 'super_admin' && req.user?.role !== 'super_admin') {
            res.status(403).json({
                success: false,
                message: 'Only super admins can change super admin roles'
            });
            return;
        }
        const updatedUser = await User_1.User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
        res.json({
            success: true,
            message: 'User role updated successfully',
            data: { user: updatedUser }
        });
    }
    catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateUserRole = updateUserRole;
const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;
        const validRoles = ['super_admin', 'admin', 'manager', 'viewer', 'user'];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
            return;
        }
        const users = await User_1.User.find({ role }, '-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            data: { users, role }
        });
    }
    catch (error) {
        console.error('Get users by role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getUsersByRole = getUsersByRole;
const getRoleStats = async (req, res) => {
    try {
        const roleStats = await User_1.User.aggregate([
            {
                $group: {
                    _id: '$role',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        const totalUsers = await User_1.User.countDocuments();
        res.json({
            success: true,
            data: {
                roleStats,
                totalUsers
            }
        });
    }
    catch (error) {
        console.error('Get role stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getRoleStats = getRoleStats;
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const requestingUserId = req.user?.id;
        if (userId === requestingUserId) {
            res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
            return;
        }
        const targetUser = await User_1.User.findById(userId);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (targetUser.role === 'super_admin' && req.user?.role !== 'super_admin') {
            res.status(403).json({
                success: false,
                message: 'Only super admins can delete super admin accounts'
            });
            return;
        }
        await User_1.User.findByIdAndDelete(userId);
        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteUser = deleteUser;
//# sourceMappingURL=roleController.js.map