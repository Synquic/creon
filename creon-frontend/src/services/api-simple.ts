import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🔄 Making API request:', config.method?.toUpperCase(), config.url);
    const token = localStorage.getItem('accessToken');
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

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🚨 API Error:', error.response?.status, error.config?.url);
    console.error('🚨 Error Details:', error.response?.data);
    return Promise.reject(error);
  }
);

// Simple API functions
export const createLink = async (data: any) => {
  console.log('🚀 NEW API-SIMPLE createLink called!');
  console.log('📝 Creating link with data:', data);
  console.log('🔍 axiosInstance exists:', !!axiosInstance);
  
  try {
    const response = await axiosInstance.post('/links', data);
    console.log('✅ Link created successfully:', response.data);
    return response;
  } catch (error) {
    console.error('❌ Create link error:', error);
    throw error;
  }
};

export const getLinks = async (params?: any) => {
  console.log('📋 Getting links with params:', params);
  try {
    const response = await axiosInstance.get('/links', { params });
    console.log('✅ Links retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get links error:', error);
    throw error;
  }
};

export const updateLink = async (id: string, data: any) => {
  console.log('📝 Updating link:', id, data);
  try {
    const response = await axiosInstance.put(`/links/${id}`, data);
    console.log('✅ Link updated successfully');
    return response;
  } catch (error) {
    console.error('❌ Update link error:', error);
    throw error;
  }
};

export const deleteLink = async (id: string) => {
  console.log('🗑️ Deleting link:', id);
  try {
    const response = await axiosInstance.delete(`/links/${id}`);
    console.log('✅ Link deleted successfully');
    return response;
  } catch (error) {
    console.error('❌ Delete link error:', error);
    throw error;
  }
};

// Auth functions
export const login = async (data: { identifier: string; password: string }) => {
  console.log('🔐 Logging in user');
  try {
    const response = await axiosInstance.post('/auth/login', data);
    console.log('✅ Login successful');
    return response;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

export const register = async (data: any) => {
  console.log('📝 Registering user');
  try {
    const response = await axiosInstance.post('/auth/register', data);
    console.log('✅ Registration successful');
    return response;
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
};

export const getProfile = async () => {
  console.log('👤 Getting user profile');
  try {
    const response = await axiosInstance.get('/auth/profile');
    console.log('✅ Profile retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get profile error:', error);
    throw error;
  }
};

export const updateProfile = async (data: any) => {
  console.log('📝 Updating user profile:', data);
  try {
    const response = await axiosInstance.put('/users/profile', data);
    console.log('✅ Profile updated successfully');
    return response;
  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw error;
  }
};

export const uploadImage = async (file: File) => {
  console.log('📸 Uploading image:', file.name);
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axiosInstance.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ Image uploaded successfully');
    return response;
  } catch (error) {
    console.error('❌ Upload image error:', error);
    throw error;
  }
};

export const uploadProfileImage = async (file: File) => {
  console.log('📸 Uploading profile image:', file.name);
  try {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response = await axiosInstance.post('/upload/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ Profile image uploaded successfully');
    return response;
  } catch (error) {
    console.error('❌ Upload profile image error:', error);
    throw error;
  }
};

// Product functions
export const getProducts = async (params?: any) => {
  console.log('🛍️ Getting products with params:', params);
  try {
    const response = await axiosInstance.get('/products', { params });
    console.log('✅ Products retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get products error:', error);
    throw error;
  }
};

export const createProduct = async (data: any) => {
  console.log('🛍️ Creating product with data:', data);
  try {
    const response = await axiosInstance.post('/products', data);
    console.log('✅ Product created successfully');
    return response;
  } catch (error) {
    console.error('❌ Create product error:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, data: any) => {
  console.log('📝 Updating product:', id, data);
  try {
    const response = await axiosInstance.put(`/products/${id}`, data);
    console.log('✅ Product updated successfully');
    return response;
  } catch (error) {
    console.error('❌ Update product error:', error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  console.log('🗑️ Deleting product:', id);
  try {
    const response = await axiosInstance.delete(`/products/${id}`);
    console.log('✅ Product deleted successfully');
    return response;
  } catch (error) {
    console.error('❌ Delete product error:', error);
    throw error;
  }
};

// Collection functions
export const getCollections = async (params?: any) => {
  console.log('📂 Getting collections with params:', params);
  try {
    const response = await axiosInstance.get('/collections', { params });
    console.log('✅ Collections retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get collections error:', error);
    throw error;
  }
};

export const createCollection = async (data: any) => {
  console.log('📂 Creating collection with data:', data);
  try {
    const response = await axiosInstance.post('/collections', data);
    console.log('✅ Collection created successfully');
    return response;
  } catch (error) {
    console.error('❌ Create collection error:', error);
    throw error;
  }
};

export const updateCollection = async (id: string, data: any) => {
  console.log('📝 Updating collection:', id, data);
  try {
    const response = await axiosInstance.put(`/collections/${id}`, data);
    console.log('✅ Collection updated successfully');
    return response;
  } catch (error) {
    console.error('❌ Update collection error:', error);
    throw error;
  }
};

export const deleteCollection = async (id: string) => {
  console.log('🗑️ Deleting collection:', id);
  try {
    const response = await axiosInstance.delete(`/collections/${id}`);
    console.log('✅ Collection deleted successfully');
    return response;
  } catch (error) {
    console.error('❌ Delete collection error:', error);
    throw error;
  }
};

// Public profile functions
export const getUserProfile = async (username: string) => {
  console.log('👤 Getting public user profile:', username);
  try {
    const response = await axiosInstance.get(`/users/${username}`);
    console.log('✅ Public profile retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get public profile error:', error);
    throw error;
  }
};

// Analytics functions
export const getDashboardStats = async () => {
  console.log('📊 Getting dashboard statistics');
  try {
    const response = await axiosInstance.get('/users/dashboard/stats');
    console.log('✅ Dashboard stats retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    throw error;
  }
};


// Metadata functions
export const fetchUrlMetadata = async (url: string) => {
  console.log('🔍 Fetching URL metadata:', url);
  try {
    const response = await axiosInstance.post('/metadata/fetch', { url });
    console.log('✅ URL metadata retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Fetch URL metadata error:', error);
    throw error;
  }
};

// Theme functions
export const getUserTheme = async () => {
  console.log('🎨 Getting user theme');
  try {
    const response = await axiosInstance.get('/theme');
    console.log('✅ User theme retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get user theme error:', error);
    throw error;
  }
};

export const updateTheme = async (themeData: any) => {
  console.log('🎨 Updating user theme:', themeData);
  try {
    const response = await axiosInstance.put('/theme', themeData);
    console.log('✅ User theme updated successfully');
    return response;
  } catch (error) {
    console.error('❌ Update user theme error:', error);
    throw error;
  }
};

export const getPublicTheme = async (userId: string) => {
  console.log('🎨 Getting public theme for user:', userId);
  try {
    const response = await axiosInstance.get(`/theme/public/${userId}`);
    console.log('✅ Public theme retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get public theme error:', error);
    throw error;
  }
};

export const resetTheme = async () => {
  console.log('🎨 Resetting user theme to default');
  try {
    const response = await axiosInstance.delete('/theme/reset');
    console.log('✅ User theme reset successfully');
    return response;
  } catch (error) {
    console.error('❌ Reset user theme error:', error);
    throw error;
  }
};

// Shop settings functions
export const getShopSettings = async () => {
  console.log('🛍️ Getting shop settings');
  try {
    const response = await axiosInstance.get('/shop/settings');
    console.log('✅ Shop settings retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get shop settings error:', error);
    throw error;
  }
};

export const updateShopSettings = async (settings: any) => {
  console.log('🛍️ Updating shop settings:', settings);
  try {
    const response = await axiosInstance.put('/shop/settings', settings);
    console.log('✅ Shop settings updated successfully');
    return response;
  } catch (error) {
    console.error('❌ Update shop settings error:', error);
    throw error;
  }
};

export const getPublicShopSettings = async (userId: string) => {
  console.log('🛍️ Getting public shop settings for user:', userId);
  try {
    const response = await axiosInstance.get(`/shop/settings/public/${userId}`);
    console.log('✅ Public shop settings retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get public shop settings error:', error);
    throw error;
  }
};

// Token management
export const setTokens = (tokens: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  console.log('🔑 Tokens stored in localStorage');
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  console.log('🗑️ Tokens cleared from localStorage');
};

export const reorderLinks = async (linkOrders: Array<{ id: string; order: number }>) => {
  console.log('📊 Reordering links:', linkOrders);
  try {
    const response = await axiosInstance.put('/links/reorder', { linkOrders });
    console.log('✅ Links reordered successfully');
    return response;
  } catch (error) {
    console.error('❌ Reorder links error:', error);
    throw error;
  }
};

// Role management functions
export const getAllUsers = async () => {
  console.log('👥 Getting all users');
  try {
    const response = await axiosInstance.get('/roles/users');
    console.log('✅ All users retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get all users error:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, role: string) => {
  console.log('👤 Updating user role:', userId, role);
  try {
    const response = await axiosInstance.put(`/roles/users/${userId}/role`, { role });
    console.log('✅ User role updated successfully');
    return response;
  } catch (error) {
    console.error('❌ Update user role error:', error);
    throw error;
  }
};

export const getUsersByRole = async (role: string) => {
  console.log('👥 Getting users by role:', role);
  try {
    const response = await axiosInstance.get(`/roles/users/role/${role}`);
    console.log('✅ Users by role retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get users by role error:', error);
    throw error;
  }
};

export const getRoleStats = async () => {
  console.log('📊 Getting role statistics');
  try {
    const response = await axiosInstance.get('/roles/stats');
    console.log('✅ Role stats retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get role stats error:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  console.log('🗑️ Deleting user:', userId);
  try {
    const response = await axiosInstance.delete(`/roles/users/${userId}`);
    console.log('✅ User deleted successfully');
    return response;
  } catch (error) {
    console.error('❌ Delete user error:', error);
    throw error;
  }
};

// Analytics functions
export const trackEvent = async (eventData: {
  type: 'link_click' | 'product_click' | 'profile_view';
  linkId?: string;
  productId?: string;
  userId?: string;
}) => {
  console.log('📊 Tracking analytics event:', eventData);
  try {
    const response = await axiosInstance.post('/analytics/track', eventData);
    console.log('✅ Analytics event tracked successfully');
    return response;
  } catch (error) {
    console.error('❌ Track analytics event error:', error);
    throw error;
  }
};

export const getDashboardAnalytics = async (period = '7d') => {
  console.log('📈 Getting dashboard analytics:', period);
  try {
    const response = await axiosInstance.get('/analytics/dashboard', {
      params: { period }
    });
    console.log('✅ Dashboard analytics retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get dashboard analytics error:', error);
    throw error;
  }
};

export const getLinkAnalytics = async (linkId: string, period = '7d') => {
  console.log('📊 Getting link analytics:', linkId, period);
  try {
    const response = await axiosInstance.get(`/analytics/links/${linkId}`, {
      params: { period }
    });
    console.log('✅ Link analytics retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get link analytics error:', error);
    throw error;
  }
};

export const getProductAnalytics = async (productId: string, period = '7d') => {
  console.log('🛍️ Getting product analytics:', productId, period);
  try {
    const response = await axiosInstance.get(`/analytics/products/${productId}`, {
      params: { period }
    });
    console.log('✅ Product analytics retrieved successfully');
    return response;
  } catch (error) {
    console.error('❌ Get product analytics error:', error);
    throw error;
  }
};

export const isAuthenticated = (): boolean => {
  const hasToken = !!localStorage.getItem('accessToken');
  console.log('🔍 Is authenticated:', hasToken);
  return hasToken;
};

console.log('✅ Simple API service initialized - NEW VERSION');
console.log('🔥 This is the UPDATED api-simple.ts file!');