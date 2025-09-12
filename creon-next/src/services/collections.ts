import { axiosInstance } from "./index";

export const collectionService = {
  // Collection functions
  getCollections: async (params?: object) => {
    console.log("📂 Getting collections with params:", params);
    try {
      const response = await axiosInstance.get("/collections", { params });
      console.log("✅ Collections retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get collections error:", error);
      throw error;
    }
  },

  createCollection: async (data: object) => {
    console.log("📂 Creating collection with data:", data);
    try {
      const response = await axiosInstance.post("/collections", data);
      console.log("✅ Collection created successfully");
      return response;
    } catch (error) {
      console.error("❌ Create collection error:", error);
      throw error;
    }
  },

  updateCollection: async (id: string, title: string, data: object) => {
    console.log("📝 Updating collection:", id, data);
    try {
      const response = await axiosInstance.put(`/collections/${id}`, {
        title,
        ...data,
      });
      console.log("✅ Collection updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Update collection error:", error);
      throw error;
    }
  },

  deleteCollection: async (id: string) => {
    console.log("🗑️ Deleting collection:", id);
    try {
      const response = await axiosInstance.delete(`/collections/${id}`);
      console.log("✅ Collection deleted successfully");
      return response;
    } catch (error) {
      console.error("❌ Delete collection error:", error);
      throw error;
    }
  },
};
