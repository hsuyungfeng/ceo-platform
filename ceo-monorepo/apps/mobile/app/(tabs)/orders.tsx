import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react-native";

const orders = [
  {
    id: "ORD-20250221-001",
    date: "2025-02-21",
    total: 12800,
    status: "delivered",
    items: 3,
  },
  {
    id: "ORD-20250220-002",
    date: "2025-02-20",
    total: 5600,
    status: "processing",
    items: 2,
  },
  {
    id: "ORD-20250219-003",
    date: "2025-02-19",
    total: 8900,
    status: "shipped",
    items: 1,
  },
  {
    id: "ORD-20250218-004",
    date: "2025-02-18",
    total: 15200,
    status: "delivered",
    items: 4,
  },
  {
    id: "ORD-20250217-005",
    date: "2025-02-17",
    total: 3200,
    status: "cancelled",
    items: 1,
  },
];

const statusConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  icon: any;
}> = {
  processing: {
    label: "處理中",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    icon: Clock,
  },
  shipped: {
    label: "已出貨",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    icon: Package,
  },
  delivered: {
    label: "已送達",
    color: "text-green-600",
    bgColor: "bg-green-50",
    icon: CheckCircle,
  },
  cancelled: {
    label: "已取消",
    color: "text-red-600",
    bgColor: "bg-red-50",
    icon: XCircle,
  },
};

export default function OrdersPage() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-6">
        <Text className="text-2xl font-bold text-gray-900">我的訂單</Text>
        <Text className="text-gray-600 mt-1">查看您的所有訂單記錄</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        {orders.map((order) => {
          const StatusIcon = statusConfig[order.status].icon;
          return (
            <TouchableOpacity
              key={order.id}
              className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-start mb-3">
                <View>
                  <Text className="text-sm font-medium text-gray-500">
                    訂單編號
                  </Text>
                  <Text className="text-base font-semibold text-gray-900">
                    {order.id}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${statusConfig[order.status].bgColor}`}
                >
                  <View className="flex-row items-center">
                    <StatusIcon
                      size={14}
                      className={statusConfig[order.status].color}
                    />
                    <Text
                      className={`ml-1 text-xs font-medium ${statusConfig[order.status].color}`}
                    >
                      {statusConfig[order.status].label}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between items-center mb-4">
                <View>
                  <Text className="text-sm text-gray-500">下單日期</Text>
                  <Text className="text-base font-medium text-gray-900">
                    {order.date}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-500">商品數量</Text>
                  <Text className="text-base font-medium text-gray-900">
                    {order.items} 件
                  </Text>
                </View>
                <View>
                  <Text className="text-sm text-gray-500">總金額</Text>
                  <Text className="text-base font-bold text-blue-600">
                    NT${order.total.toLocaleString()}
                  </Text>
                </View>
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity className="flex-1 py-2 border border-gray-300 rounded-lg">
                  <Text className="text-center text-gray-700 font-medium">
                    查看詳情
                  </Text>
                </TouchableOpacity>
                {order.status === "delivered" && (
                  <TouchableOpacity className="flex-1 py-2 bg-blue-600 rounded-lg">
                    <Text className="text-center text-white font-medium">
                      再次購買
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}