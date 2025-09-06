import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    console.log('🏗️ Initializing API Service...');
    console.log('🌐 API Base URL:', API_BASE_URL);
    
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Axios instance created:', !!this.axiosInstance);
    this.setupInterceptors();
    console.log('✅ API Service initialized');
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('🔄 Making API request:', config.method?.toUpperCase(), config.url);
        const token = this.getAccessToken();
        console.log('🔑 Token exists:', !!token);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔐 Added Authorization header');
        } else {
          console.log('❌ No token found in localStorage');
        }
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('✅ API Response:', response.status, response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        console.error('🚨 API Error:', error.response?.status, error.config?.url);
        console.error('🚨 Error Details:', error.response?.data);
        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
          (originalRequest as any)._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.axiosInstance.post('/auth/refresh-token', {
                refreshToken,
              });

              const { accessToken } = response.data.data;
              this.setTokens({ accessToken, refreshToken });

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }

              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if ((error.response?.data as any)?.message) {
          toast.error((error.response.data as any).message);
        }

        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  setTokens(tokens: { accessToken: string; refreshToken: string }) {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    return this.axiosInstance.post('/auth/register', data);
  }

  async login(data: { identifier: string; password: string }) {
    return this.axiosInstance.post('/auth/login', data);
  }

  async logout(refreshToken?: string) {
    return this.axiosInstance.post('/auth/logout', { refreshToken });
  }

  async getProfile() {
    return this.axiosInstance.get('/auth/profile');
  }

  async updateProfile(data: any) {
    return this.axiosInstance.put('/users/profile', data);
  }

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    return this.axiosInstance.put('/users/change-password', data);
  }

  async getUserProfile(username: string) {
    return this.axiosInstance.get(`/users/${username}`);
  }

  async checkUsernameAvailability(username: string) {
    return this.axiosInstance.get(`/auth/check-username/${username}`);
  }

  async getDashboardStats() {
    return this.axiosInstance.get('/users/dashboard/stats');
  }

  async getLinks(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return this.axiosInstance.get('/links', { params });
  }

  createLink = async (data: any) => {
    console.log('📝 Creating link with data:', data);
    console.log('🔍 this exists:', !!this);
    console.log('🔍 Axios instance exists:', !!this.axiosInstance);
    console.log('🔍 Axios instance type:', typeof this.axiosInstance);
    
    if (!this.axiosInstance) {
      console.error('❌ Axios instance is undefined! Reinitializing...');
      this.axiosInstance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.setupInterceptors();
    }
    
    try {
      const response = await this.axiosInstance.post('/links', data);
      console.log('✅ Link created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('❌ Create link error:', error);
      throw error;
    }
  }

  async getLinkById(id: string) {
    return this.axiosInstance.get(`/links/${id}`);
  }

  async updateLink(id: string, data: any) {
    return this.axiosInstance.put(`/links/${id}`, data);
  }

  async deleteLink(id: string) {
    return this.axiosInstance.delete(`/links/${id}`);
  }

  async reorderLinks(linkOrders: { id: string; order: number }[]) {
    return this.axiosInstance.put('/links/reorder', { linkOrders });
  }

  async getLinkAnalytics(id: string, period?: string) {
    return this.axiosInstance.get(`/links/${id}/analytics`, {
      params: { period },
    });
  }

  async getProducts(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    collectionId?: string;
    tags?: string[];
  }) {
    return this.axiosInstance.get('/products', { params });
  }

  async createProduct(data: any) {
    return this.axiosInstance.post('/products', data);
  }

  async getProductById(id: string) {
    return this.axiosInstance.get(`/products/${id}`);
  }

  async updateProduct(id: string, data: any) {
    return this.axiosInstance.put(`/products/${id}`, data);
  }

  async deleteProduct(id: string) {
    return this.axiosInstance.delete(`/products/${id}`);
  }

  async getProductAnalytics(id: string, period?: string) {
    return this.axiosInstance.get(`/products/${id}/analytics`, {
      params: { period },
    });
  }

  async getCollections(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    return this.axiosInstance.get('/collections', { params });
  }

  async createCollection(data: any) {
    return this.axiosInstance.post('/collections', data);
  }

  async getCollectionById(id: string) {
    return this.axiosInstance.get(`/collections/${id}`);
  }

  async updateCollection(id: string, data: any) {
    return this.axiosInstance.put(`/collections/${id}`, data);
  }

  async deleteCollection(id: string) {
    return this.axiosInstance.delete(`/collections/${id}`);
  }

  async reorderCollections(collectionOrders: { id: string; order: number }[]) {
    return this.axiosInstance.put('/collections/reorder', { collectionOrders });
  }

  async addProductToCollection(collectionId: string, productId: string) {
    return this.axiosInstance.put(`/collections/${collectionId}/products`, {
      productId,
    });
  }

  async removeProductFromCollection(collectionId: string, productId: string) {
    return this.axiosInstance.delete(`/collections/${collectionId}/products/${productId}`);
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    return this.axiosInstance.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('profileImage', file);

    return this.axiosInstance.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

// Create and export the singleton instance
const apiServiceInstance = new ApiService();
console.log('🎯 Exporting API Service instance:', !!apiServiceInstance);

export const apiService = apiServiceInstance;