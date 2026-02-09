import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  ChevronRight,
  Check,
  Plus,
} from "lucide-react-native";

const cartItems = [
  {
    id: "1",
    name: "日本進口高級保溫杯",
    brand: "THERMOS",
    price: 1280,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  },
  {
    id: "2",
    name: "無線藍牙耳機",
    brand: "SONY",
    price: 2490,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  },
  {
    id: "3",
    name: "有機咖啡豆 500g",
    brand: "STARBUCKS",
    price: 680,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
  },
];

const shippingAddresses = [
  {
    id: "1",
    name: "張小明",
    phone: "0912-345-678",
    address: "台北市信義區信義路五段7號",
    isDefault: true,
  },
  {
    id: "2",
    name: "張小明",
    phone: "0912-345-678",
    address: "新北市板橋區文化路一段100號",
    isDefault: false,
  },
];

const paymentMethods = [
  {
    id: "credit-card",
    name: "信用卡/簽帳金融卡",
    icon: CreditCard,
  },
  {
    id: "line-pay",
    name: "LINE Pay",
    icon: CreditCard,
  },
  {
    id: "apple-pay",
    name: "Apple Pay",
    icon: CreditCard,
  },
  {
    id: "cod",
    name: "貨到付款",
    icon: CreditCard,
  },
];

const shippingMethods = [
  {
    id: "standard",
    name: "標準配送",
    price: 60,
    estimatedDays: "3-5個工作天",
  },
  {
    id: "express",
    name: "快速配送",
    price: 120,
    estimatedDays: "1-2個工作天",
  },
  {
    id: "free",
    name: "免運費配送",
    price: 0,
    estimatedDays: "5-7個工作天",
    minAmount: 2000,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState("1");
  const [selectedPayment, setSelectedPayment] = useState("credit-card");
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingPrice = shippingMethods.find(
    (method) => method.id === selectedShipping
  )?.price || 0;
  const discount = 0; // Coupon discount would be calculated here
  const total = subtotal + shippingPrice - discount;

  const handlePlaceOrder = () => {
    // Process order logic
    router.push("/order/confirmation");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-4 py-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-bold text-gray-900">
              結帳
            </Text>
          </View>
        </View>

        {/* Shipping Address */}
        <View className="bg-white mt-4 px-4 py-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900">收貨地址</Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-blue-600 font-medium">管理地址</Text>
              <ChevronRight size={16} className="text-blue-600" />
            </TouchableOpacity>
          </View>

          {shippingAddresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              className={`border rounded-xl p-4 mb-3 ${selectedAddress === address.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              onPress={() => setSelectedAddress(address.id)}
            >
              <View className="flex-row items-start">
                <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                  <MapPin size={20} className="text-gray-600" />
                </View>
                <View className="ml-3 flex-1">
                  <View className="flex-row justify-between items-start">
                    <View>
                      <Text className="font-bold text-gray-900">
                        {address.name}
                      </Text>
                      <Text className="text-gray-600 mt-1">
                        {address.phone}
                      </Text>
                      <Text className="text-gray-700 mt-2">
                        {address.address}
                      </Text>
                    </View>
                    {selectedAddress === address.id && (
                      <Check size={20} className="text-blue-500" />
                    )}
                  </View>
                  {address.isDefault && (
                    <View className="mt-2 self-start bg-blue-100 px-2 py-1 rounded">
                      <Text className="text-blue-700 text-xs font-medium">
                        預設地址
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity className="flex-row items-center justify-center border-2 border-dashed border-gray-300 rounded-xl py-4">
            <Plus size={20} className="text-gray-400" />
            <Text className="ml-2 text-gray-600 font-medium">新增地址</Text>
          </TouchableOpacity>
        </View>

        {/* Shipping Method */}
        <View className="bg-white mt-4 px-4 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            配送方式
          </Text>

          {shippingMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              className={`border rounded-xl p-4 mb-3 ${selectedShipping === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
              onPress={() => setSelectedShipping(method.id)}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-bold text-gray-900">{method.name}</Text>
                  <Text className="text-gray-600 mt-1">
                    預計 {method.estimatedDays} 送達
                  </Text>
                  {method.minAmount && (
                    <Text className="text-gray-500 text-sm mt-1">
                      滿 NT${method.minAmount} 免運
                    </Text>
                  )}
                </View>
                <View className="flex-row items-center">
                  <Text className="font-bold text-gray-900">
                    NT${method.price}
                  </Text>
                  {selectedShipping === method.id && (
                    <Check size={20} className="text-blue-500 ml-3" />
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View className="bg-white mt-4 px-4 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            付款方式
          </Text>

          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <TouchableOpacity
                key={method.id}
                className={`border rounded-xl p-4 mb-3 ${selectedPayment === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                onPress={() => setSelectedPayment(method.id)}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                      <Icon size={20} className="text-gray-600" />
                    </View>
                    <Text className="ml-3 font-medium text-gray-900">
                      {method.name}
                    </Text>
                  </View>
                  {selectedPayment === method.id && (
                    <Check size={20} className="text-blue-500" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Summary */}
        <View className="bg-white mt-4 px-4 py-6">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            訂單摘要
          </Text>

          {/* Cart Items */}
          {cartItems.map((item) => (
            <View key={item.id} className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-gray-100 rounded-lg" />
              <View className="ml-3 flex-1">
                <Text className="font-medium text-gray-900">{item.name}</Text>
                <Text className="text-gray-500 text-sm">{item.brand}</Text>
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-gray-700">
                    數量: {item.quantity}
                  </Text>
                  <Text className="font-bold text-gray-900">
                    NT${item.price * item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {/* Coupon Code */}
          <View className="mt-6">
            <Text className="font-medium text-gray-900 mb-2">優惠券</Text>
            <View className="flex-row">
              <TextInput
                className="flex-1 bg-gray-50 border border-gray-200 rounded-l-xl px-4 py-3"
                placeholder="輸入優惠券代碼"
                value={couponCode}
                onChangeText={setCouponCode}
              />
              <TouchableOpacity
                className="bg-blue-600 px-6 rounded-r-xl items-center justify-center"
                disabled={isApplyingCoupon}
              >
                <Text className="text-white font-medium">
                  {isApplyingCoupon ? "套用中..." : "套用"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Price Breakdown */}
          <View className="mt-6 space-y-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">商品總計</Text>
              <Text className="text-gray-900">NT${subtotal}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-600">運費</Text>
              <Text className="text-gray-900">NT${shippingPrice}</Text>
            </View>
            {discount > 0 && (
              <View className="flex-row justify-between">
                <Text className="text-gray-600">優惠折扣</Text>
                <Text className="text-red-600">-NT${discount}</Text>
              </View>
            )}
            <View className="border-t border-gray-200 pt-3 mt-3">
              <View className="flex-row justify-between">
                <Text className="text-lg font-bold text-gray-900">總計</Text>
                <Text className="text-2xl font-bold text-red-600">
                  NT${total}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Guarantee */}
        <View className="bg-white mt-4 px-4 py-6">
          <View className="flex-row items-center mb-4">
            <Shield size={20} className="text-green-500" />
            <Text className="ml-2 font-bold text-gray-900">服務保障</Text>
          </View>
          <View className="space-y-2">
            <Text className="text-gray-600">• 正品保證，假一賠十</Text>
            <Text className="text-gray-600">• 7天鑑賞期，不滿意可退貨</Text>
            <Text className="text-gray-600">• 專業客服，快速回應</Text>
            <Text className="text-gray-600">• 隱私保護，資料加密</Text>
          </View>
        </View>

        {/* Spacer for bottom button */}
        <View className="h-32" />
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
        <View className="flex-row justify-between items-center mb-2">
          <View>
            <Text className="text-gray-600 text-sm">應付金額</Text>
            <Text className="text-2xl font-bold text-red-600">
              NT${total}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-600 px-8 py-4 rounded-xl"
            onPress={handlePlaceOrder}
          >
            <Text className="text-white font-bold text-lg">確認訂單</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-gray-500 text-xs text-center">
          點擊「確認訂單」即表示您同意我們的服務條款
        </Text>
      </View>
    </SafeAreaView>
  );
}