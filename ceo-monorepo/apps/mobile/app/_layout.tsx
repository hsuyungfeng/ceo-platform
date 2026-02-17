import { Stack } from "expo-router";
import "../global.css";
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { usePushNotifications } from '../src/hooks/usePushNotifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  // Initialize push notifications
  usePushNotifications();

  useEffect(() => {
    // Listen for notification responses (when user taps on notification)
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification tapped:', response);
      // You can navigate to specific screen based on notification data
      // const data = response.notification.request.content.data;
      // navigate(data.screen);
    });

    // Listen for notifications received while app is foreground
    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      // Update badge count or show in-app notification
    });

    return () => {
      responseSubscription.remove();
      receivedSubscription.remove();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ title: "商品詳情" }} />
      <Stack.Screen name="order/[id]" options={{ title: "訂單詳情" }} />
      <Stack.Screen name="checkout" options={{ title: "結帳" }} />
      <Stack.Screen name="search" options={{ title: "搜尋" }} />
    </Stack>
  );
}