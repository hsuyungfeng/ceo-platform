import { apiService } from './api';

export const notificationApi = {
  registerToken: async (token: string, platform: 'IOS' | 'ANDROID' | 'WEB', deviceId?: string) => {
    return apiService.getClient().post('/api/notifications/tokens', {
      token,
      platform,
      deviceId,
    });
  },

  unregisterToken: async (tokenId: string) => {
    return apiService.getClient().delete(`/api/notifications/tokens/${tokenId}`);
  },
};