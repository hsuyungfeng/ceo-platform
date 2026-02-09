import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView } from "react-native";
import {
  User,
  Settings,
  Bell,
  CreditCard,
  HelpCircle,
  LogOut,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
} from "lucide-react-native";

const menuItems = [
  {
    title: "個人資料",
    icon: User,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    title: "收貨地址",
    icon: MapPin,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "付款方式",
    icon: CreditCard,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "通知設定",
    icon: Bell,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    title: "應用程式設定",
    icon: Settings,
    color: "text-gray-500",
    bgColor: "bg-gray-50",
  },
  {
    title: "幫助中心",
    icon: HelpCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
  },
];

const userInfo = {
  name: "張小明",
  email: "xiaoming@example.com",
  phone: "0912-345-678",
  membership: "黃金會員",
  points: 1250,
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=小明",
};

export default function ProfilePage() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="bg-white px-6 py-8">
          <View className="flex-row items-center">
            <View className="w-20 h-20 rounded-full bg-blue-100 items-center justify-center">
              <User size={32} className="text-blue-500" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {userInfo.name}
              </Text>
              <Text className="text-gray-600 mt-1">{userInfo.email}</Text>
              <View className="flex-row items-center mt-2">
                <View className="bg-yellow-100 px-3 py-1 rounded-full">
                  <Text className="text-yellow-800 font-medium">
                    {userInfo.membership}
                  </Text>
                </View>
                <View className="ml-3 bg-blue-100 px-3 py-1 rounded-full">
                  <Text className="text-blue-800 font-medium">
                    {userInfo.points} 點
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-6 border-t border-gray-100 pt-6">
            <View className="flex-row space-x-6">
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Phone size={18} className="text-gray-400" />
                  <Text className="ml-2 text-gray-700">{userInfo.phone}</Text>
                </View>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Mail size={18} className="text-gray-400" />
                  <Text className="ml-2 text-gray-700">{userInfo.email}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mt-6 px-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={index}
                className="flex-row items-center bg-white p-4 mb-2 rounded-xl"
                activeOpacity={0.7}
              >
                <View className={`w-10 h-10 rounded-lg ${item.bgColor} items-center justify-center`}>
                  <Icon size={20} className={item.color} />
                </View>
                <Text className="ml-4 flex-1 text-base font-medium text-gray-900">
                  {item.title}
                </Text>
                <ChevronRight size={20} className="text-gray-400" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Recent Activity */}
        <View className="mt-8 px-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">
            近期活動
          </Text>
          <View className="bg-white rounded-xl p-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-700">今日瀏覽</Text>
              <Text className="font-medium text-gray-900">12 件商品</Text>
            </View>
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-700">本月訂單</Text>
              <Text className="font-medium text-gray-900">5 筆</Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-700">累計消費</Text>
              <Text className="font-bold text-blue-600">NT$42,800</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="mx-4 my-8 bg-red-50 p-4 rounded-xl flex-row items-center justify-center"
          activeOpacity={0.7}
        >
          <LogOut size={20} className="text-red-500" />
          <Text className="ml-2 text-red-600 font-medium">登出帳號</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View className="px-4 pb-8">
          <Text className="text-center text-gray-500 text-sm">
            CEO 團購電商 v1.0.0
          </Text>
          <Text className="text-center text-gray-400 text-xs mt-1">
            © 2025 CEO Group Purchase Platform
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}