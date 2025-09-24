import { axiosInstance } from "./index";

export const linkService = {
  createLink: async (data: object) => {
    console.log("🚀 NEW API-SIMPLE createLink called!");
    console.log("📝 Creating link with data:", data);
    console.log("🔍 axiosInstance exists:", !!axiosInstance);

    try {
      const response = await axiosInstance.post("/links", data);
      console.log("✅ Link created successfully:", response.data);
      return response;
    } catch (error) {
      console.error("❌ Create link error:", error);
      throw error;
    }
  },

  getLinks: async (params?: object) => {
    console.log("📋 Getting links with params:", params);
    try {
      const response = await axiosInstance.get("/links", { params });
      console.log("✅ Links retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get links error:", error);
      throw error;
    }
  },

  updateLink: async (id: string, data: object) => {
    console.log("📝 Updating link:", id, data);
    try {
      const response = await axiosInstance.put(`/links/${id}`, data);
      console.log("✅ Link updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Update link error:", error);
      throw error;
    }
  },

  deleteLink: async (id: string) => {
    console.log("🗑️ Deleting link:", id);
    try {
      const response = await axiosInstance.delete(`/links/${id}`);
      console.log("✅ Link deleted successfully");
      return response;
    } catch (error) {
      console.error("❌ Delete link error:", error);
      throw error;
    }
  },

  reorderLinks: async (linkOrders: Array<{ id: string; order: number }>) => {
    console.log("📊 Reordering links:", linkOrders);
    try {
      const response = await axiosInstance.post("/links/reorder", {
        linkOrders,
      });
      console.log("✅ Links reordered successfully");
      return response;
    } catch (error) {
      console.error("❌ Reorder links error:", error);
      throw error;
    }
  },

  fetchUrlMetadata: async (url: string) => {
    console.log("🔍 Fetching URL metadata:", url);
    try {
      const response = await axiosInstance.post("/metadata/fetch", { url });
      console.log("✅ URL metadata retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Fetch URL metadata error:", error);
      throw error;
    }
  },

  fetchParsedData: async (url: string) => {
    console.log("🔎 Fetching parsed data for URL:", url);
    try {
      const response = await axiosInstance.post(
        "/data-parsing/fetch-response",
        { url },
        { timeout: 0 }
      );
      console.log("✅ Parsed data fetched successfully");
      return response;
    } catch (error) {
      console.error("❌ Fetch parsed data error:", error);
      throw error;
    }
  },

  retestLinks: async () => {
    console.log("🔄 Retesting links");
    try {
      const response = await axiosInstance.post("/links/retest");
      console.log("✅ Links retested successfully");
      return response;
    } catch (error) {
      console.error("❌ Retest links error:", error);
      throw error;
    }
  },
};
