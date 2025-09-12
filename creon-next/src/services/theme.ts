import { axiosInstance } from "./index";

export const themeService = {
  getUserTheme: async () => {
    console.log("🎨 Getting user theme");
    try {
      const response = await axiosInstance.get("/theme");
      console.log("✅ User theme retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get user theme error:", error);
      throw error;
    }
  },

  updateTheme: async (themeData: object) => {
    console.log("🎨 Updating user theme:", themeData);
    try {
      const response = await axiosInstance.put("/theme", themeData);
      console.log("✅ User theme updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Update user theme error:", error);
      throw error;
    }
  },

  getPublicTheme: async (userId: string) => {
    console.log("🎨 Getting public theme for user:", userId);
    try {
      const response = await axiosInstance.get(`/theme/public/${userId}`);
      console.log("✅ Public theme retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get public theme error:", error);
      throw error;
    }
  },

  resetTheme: async () => {
    console.log("🎨 Resetting user theme to default");
    try {
      const response = await axiosInstance.delete("/theme/reset");
      console.log("✅ User theme reset successfully");
      return response;
    } catch (error) {
      console.error("❌ Reset user theme error:", error);
      throw error;
    }
  },
};
