import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { notificationApi } from '../services/notification-api';
import { useAuthStore } from '../../stores/useAuthStore';

export function usePushNotifications() {
  const { user } = useAuthStore();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (expoPushToken && user) {
      registerTokenWithBackend(expoPushToken);
    }
  }, [expoPushToken, user]);

  async function registerForPushNotificationsAsync() {
    let token;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);
  }

  async function registerTokenWithBackend(token: string) {
    try {
      const platform = Platform.OS === 'ios' ? 'IOS' : 'ANDROID';
      await notificationApi.registerToken(token, platform);
      setRegistered(true);
    } catch (error) {
      console.error('Failed to register token with backend:', error);
    }
  }

  return { expoPushToken, registered };
}