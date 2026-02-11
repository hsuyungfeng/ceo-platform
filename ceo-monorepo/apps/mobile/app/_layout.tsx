import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
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