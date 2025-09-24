import { axiosInstance as api } from "./index";

export interface SubUser {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  userType: "sub";
  parentUserId: string;
  createdBy: string;
  isFirstLogin: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubUserRequest {
  email: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UpdateSubUserRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
  isEmailVerified?: boolean;
}

export interface CreateSubUserResponse {
  success: boolean;
  message: string;
  data: {
    user: SubUser;
    tempPassword: string;
  };
}

export interface SubUsersResponse {
  success: boolean;
  data: {
    users: SubUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  data: {
    newPassword: string;
  };
}

class SubUserService {
  async createSubUser(
    data: CreateSubUserRequest
  ): Promise<CreateSubUserResponse> {
    const response = await api.post("/sub-users", data);
    return response.data;
  }

  async getSubUsers(page = 1, limit = 20): Promise<SubUsersResponse> {
    const response = await api.get("/sub-users", {
      params: { page, limit },
    });
    return response.data;
  }

  async updateSubUser(
    id: string,
    data: UpdateSubUserRequest
  ): Promise<{ success: boolean; message: string; data: { user: SubUser } }> {
    const response = await api.put(`/sub-users/${id}`, data);
    return response.data;
  }

  async deleteSubUser(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/sub-users/${id}`);
    return response.data;
  }

  async resetPassword(id: string): Promise<ResetPasswordResponse> {
    const response = await api.post(`/sub-users/${id}/reset-password`);
    return response.data;
  }
}

export const subUserService = new SubUserService();
