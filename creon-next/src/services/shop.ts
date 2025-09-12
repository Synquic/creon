import { axiosInstance } from './index';

export const shopService = {
  getShopSettings: async () => {
    console.log('🛍️ Getting shop settings');
    try {
      const response = await axiosInstance.get('/shop/settings');
      console.log('✅ Shop settings retrieved successfully');
      return response;
    } catch (error) {
      console.error('❌ Get shop settings error:', error);
      throw error;
    }
  },

  updateShopSettings: async (settings: object) => {
    console.log('🛍️ Updating shop settings:', settings);
    try {
      const response = await axiosInstance.put('/shop/settings', settings);
      console.log('✅ Shop settings updated successfully');
      return response;
    } catch (error) {
      console.error('❌ Update shop settings error:', error);
      throw error;
    }
  },

  getPublicShopSettings: async (userId: string) => {
    console.log('🛍️ Getting public shop settings for user:', userId);
    try {
      const response = await axiosInstance.get(`/shop/settings/public/${userId}`);
      console.log('✅ Public shop settings retrieved successfully');
      return response;
    } catch (error) {
      console.error('❌ Get public shop settings error:', error);
      throw error;
    }
  }
}

