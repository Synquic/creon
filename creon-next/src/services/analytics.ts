import { axiosInstance } from "./index";

export const analyticsService = {
  getDashboardStats: async () => {
    console.log("📊 Getting dashboard statistics");
    try {
      const response = await axiosInstance.get("/users/dashboard/stats");
      console.log("✅ Dashboard stats retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get dashboard stats error:", error);
      throw error;
    }
  },

  trackEvent: async (eventData: {
    type: "link_click" | "product_click" | "profile_view";
    linkId?: string;
    productId?: string;
    userId?: string;
  }) => {
    console.log("📊 Tracking analytics event:", eventData);
    try {
      const response = await axiosInstance.post("/analytics/track", eventData);
      console.log("✅ Analytics event tracked successfully");
      return response;
    } catch (error) {
      console.error("❌ Track analytics event error:", error);
      throw error;
    }
  },

  getDashboardAnalytics: async (period = "7d") => {
    console.log("📈 Getting dashboard analytics:", period);
    try {
      const response = await axiosInstance.get("/analytics/dashboard", {
        params: { period },
      });
      console.log("✅ Dashboard analytics retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get dashboard analytics error:", error);
      throw error;
    }
  },

  getLinkAnalytics: async (linkId: string, period = "7d") => {
    console.log("📊 Getting link analytics:", linkId, period);
    try {
      const response = await axiosInstance.get(`/analytics/links/${linkId}`, {
        params: { period },
      });
      console.log("✅ Link analytics retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get link analytics error:", error);
      throw error;
    }
  },

  getProductAnalytics: async (productId: string, period = "7d") => {
    console.log("🛍️ Getting product analytics:", productId, period);
    try {
      const response = await axiosInstance.get(
        `/analytics/products/${productId}`,
        {
          params: { period },
        }
      );
      console.log("✅ Product analytics retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get product analytics error:", error);
      throw error;
    }
  },
};
