import { axiosInstance } from "./index";

export const ProductsService = {
  // Product functions
  getProducts: async (params?: object) => {
    console.log("🛍️ Getting products with params:", params);
    try {
      const response = await axiosInstance.get("/products", { params });
      console.log("✅ Products retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get products error:", error);
      throw error;
    }
  },

  createProduct: async (data: object) => {
    console.log("🛍️ Creating product with data:", data);
    try {
      const response = await axiosInstance.post("/products", data);
      console.log("✅ Product created successfully");
      return response;
    } catch (error) {
      console.error("❌ Create product error:", error);
      throw error;
    }
  },

  updateProduct: async (id: string, data: object) => {
    console.log("📝 Updating product:", id, data);
    try {
      const response = await axiosInstance.put(`/products/${id}`, data);
      console.log("✅ Product updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Update product error:", error);
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    console.log("🗑️ Deleting product:", id);
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      console.log("✅ Product deleted successfully");
      return response;
    } catch (error) {
      console.error("❌ Delete product error:", error);
      throw error;
    }
  },
};
