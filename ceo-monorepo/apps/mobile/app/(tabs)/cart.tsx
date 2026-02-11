import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from "lucide-react-native";
import { Link } from "expo-router";

export default function CartScreen() {
  const cartItems = [
    { id: 1, name: "醫療口罩", price: 150, quantity: 3, image: "https://via.placeholder.com/150", unit: "盒" },
    { id: 2, name: "血壓計", price: 2450, quantity: 1, image: "https://via.placeholder.com/150", unit: "台" },
    { id: 3, name: "體溫槍", price: 1200, quantity: 2, image: "https://via.placeholder.com/150", unit: "支" },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-4">
        <ShoppingCart size={64} color="#9ca3af" />
        <Text className="text-xl text-gray-500 mt-4">您的購物車是空的</Text>
        <Link href="/" asChild>
          <TouchableOpacity className="mt-6 bg-blue-600 px-6 py-3 rounded-lg">
            <Text className="text-white font-medium">瀏覽商品</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">購物車</Text>

        {/* Cart Items */}
        <View className="space-y-4">
          {cartItems.map((item) => (
            <View key={item.id} className="bg-white rounded-lg p-4 shadow-sm">
              <View className="flex-row">
                <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4">
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-lg mb-1">{item.name}</Text>
                  <Text className="text-red-600 font-bold mb-2">${item.price}/{item.unit}</Text>
                  
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <TouchableOpacity className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                        <Minus size={16} color="#4b5563" />
                      </TouchableOpacity>
                      <Text className="mx-3 font-medium">{item.quantity}</Text>
                      <TouchableOpacity className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                        <Plus size={16} color="#4b5563" />
                      </TouchableOpacity>
                    </View>
                    
                    <View className="items-end">
                      <Text className="font-medium">${item.price * item.quantity}</Text>
                      <TouchableOpacity className="mt-2">
                        <Trash2 size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-lg p-4 mt-6 shadow-sm">
          <Text className="text-xl font-bold mb-4">訂單摘要</Text>
          
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">小計</Text>
              <Text className="font-medium">${subtotal}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">運費</Text>
              <Text className="font-medium">${shipping}</Text>
            </View>
            <View className="border-t pt-3 mt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold">總計</Text>
                <Text className="text-lg font-bold text-red-600">${total}</Text>
              </View>
            </View>
          </View>

          <Link href="/checkout" asChild>
            <TouchableOpacity className="mt-6 bg-blue-600 py-4 rounded-lg flex-row items-center justify-center">
              <CreditCard size={20} color="white" className="mr-2" />
              <Text className="text-white font-medium text-lg">結帳</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/" asChild>
            <TouchableOpacity className="mt-3 border border-gray-300 py-3 rounded-lg">
              <Text className="text-center font-medium">繼續購物</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}