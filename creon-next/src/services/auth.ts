import axios from "axios";
import { axiosInstance } from "./index";

export const authService = {
  login: async (data: { identifier: string; password: string }) => {
    console.log("🔐 Logging in user");
    try {
      const response = await axiosInstance.post("/auth/login", data);
      console.log("✅ Login successful");
      return response;
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    console.log("📝 Registering user");
    try {
      const response = await axiosInstance.post("/auth/register", data);
      console.log("✅ Registration successful");
      return response;
    } catch (error) {
      console.error("❌ Registration error:", error);
      throw error;
    }
  },

  getProfile: async () => {
    console.log("👤 Getting user profile");
    try {
      const response = await axiosInstance.get("/auth/profile");
      console.log("✅ Profile retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get profile error:", error);
      throw error;
    }
  },

  updateProfile: async (data: object) => {
    console.log("📝 Updating user profile:", data);
    try {
      const response = await axiosInstance.put("/users/profile", data);
      console.log("✅ Profile updated successfully");
      return response;
    } catch (error) {
      console.error("❌ Update profile error:", error);
      throw error;
    }
  },

  uploadImage: async (file: File) => {
    console.log("📸 Uploading image:", file.name);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axiosInstance.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Image uploaded successfully");
      return response;
    } catch (error) {
      console.error("❌ Upload image error:", error);
      throw error;
    }
  },

  uploadProfileImage: async (file: File) => {
    console.log("📸 Uploading profile image:", file.name);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await axiosInstance.post("/upload/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Profile image uploaded successfully");
      return response;
    } catch (error) {
      console.error("❌ Upload profile image error:", error);
      throw error;
    }
  },

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    console.log("🔑 Tokens stored in localStorage");
  },

  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    console.log("🗑️ Tokens cleared from localStorage");
  },

  isAuthenticated: (): boolean => {
    const hasToken = !!localStorage.getItem("accessToken");
    console.log("🔍 Is authenticated:", hasToken);
    return hasToken;
  },

  checkUsernameAvailability: async (username: string) => {
    console.log("🔎 Checking username availability:", username);
    try {
      const response = await axiosInstance.get(
        `/auth/check-username/${username}`
      );
      console.log("✅ Username availability checked");
      return response;
    } catch (error) {
      console.error("❌ Check username availability error:", error);
      throw error;
    }
  },

  getUserProfile: async (username: string) => {
    console.log("👤 Getting public user profile:", username);
    try {
      const response = await axios.get(
        `${process.env.API_BASE_URL}/users/${username}`
      );
      console.log("✅ Public profile retrieved successfully");
      return response;
    } catch (error) {
      console.error("❌ Get public profile error:", error);
      throw error;
    }
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    console.log("🔑 Changing password");
    try {
      const response = await axiosInstance.put("/users/change-password", data);
      console.log("✅ Password changed successfully");
      return response;
    } catch (error) {
      console.error("❌ Change password error:", error);
      throw error;
    }
  },
};
