import { axiosInstance } from "./index";

export const roleService = {
  // Role management functions
  getAllUsers: async () => {
    console.log("👥 Getting all users");
    try {
      const response = await axiosInstance.get("/roles/users");
      console.log("✅ All users retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get all users error:", error);
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    console.log("👤 Updating user role:", userId, role);
    try {
      const response = await axiosInstance.put(`/roles/users/${userId}/role`, {
        role,
      });
      console.log("✅ User role updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Update user role error:", error);
      throw error;
    }
  },

  getUsersByRole: async (role: string) => {
    console.log("👥 Getting users by role:", role);
    try {
      const response = await axiosInstance.get(`/roles/users/role/${role}`);
      console.log("✅ Users by role retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get users by role error:", error);
      throw error;
    }
  },

  getRoleStats: async () => {
    console.log("📊 Getting role statistics");
    try {
      const response = await axiosInstance.get("/roles/stats");
      console.log("✅ Role stats retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get role stats error:", error);
      throw error;
    }
  },

  deleteUser: async (userId: string) => {
    console.log("🗑️ Deleting user:", userId);
    try {
      const response = await axiosInstance.delete(`/roles/users/${userId}`);
      console.log("✅ User deleted successfully");
      return response;
    } catch (error) {
      console.error("❌ Delete user error:", error);
      throw error;
    }
  },
};
