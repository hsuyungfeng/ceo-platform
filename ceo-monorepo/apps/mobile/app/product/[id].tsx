import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Package,
  Truck,
  Shield,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const product = {
  id: "1",
  name: "日本進口高級保溫杯",
  brand: "THERMOS",
  price: 1280,
  originalPrice: 1680,
  discount: 24,
  rating: 4.8,
  reviewCount: 128,
  description:
    "採用日本最新真空斷熱技術，保溫效果長達24小時。雙層不鏽鋼結構，輕量設計，攜帶方便。適合上班族、學生日常使用。",
  features: [
    "24小時保溫保冷",
    "雙層真空斷熱技術",
    "食品級304不鏽鋼",
    "防漏設計，一鍵開關",
    "500ml容量，輕量設計",
  ],
  images: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1589363460772-80c5e5d6e4e7?w-800",
    "https://images.unsplash.com/photo-1572635148811-1e5a63ad5c4a?w=800",
  ],
  stock: 45,
  sold: 128,
  category: "廚房用品",
  tags: ["熱銷商品", "限時優惠", "免運費"],
  specifications: [
    { label: "材質", value: "304不鏽鋼" },
    { label: "容量", value: "500ml" },
    { label: "尺寸", value: "Φ7.5 × H21cm" },
    { label: "重量", value: "280g" },
    { label: "產地", value: "日本" },
    { label: "保固", value: "1年" },
  ],
};

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = () => {
    // Add to cart logic
    console.log(`Added ${quantity} of product ${id} to cart`);
  };

  const handleBuyNow = () => {
    // Navigate to checkout
    router.push("/checkout");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 z-10 px-4 pt-2 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm items-center justify-center shadow-sm"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </TouchableOpacity>
          <View className="flex-row space-x-2">
            <TouchableOpacity className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm items-center justify-center shadow-sm">
              <Share2 size={20} className="text-gray-700" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm items-center justify-center shadow-sm"
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                size={20}
                className={isFavorite ? "text-red-500" : "text-gray-700"}
                fill={isFavorite ? "#ef4444" : "none"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Images */}
        <View className="relative">
          <Image
            source={{ uri: product.images[selectedImage] }}
            className="w-full h-80"
            resizeMode="cover"
          />
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center space-x-2">
            {product.images.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full ${selectedImage === index ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </View>
        </View>

        {/* Product Info */}
        <View className="px-4 pt-6">
          {/* Tags */}
          <View className="flex-row flex-wrap gap-2 mb-3">
            {product.tags.map((tag, index) => (
              <View
                key={index}
                className="bg-red-100 px-3 py-1 rounded-full"
              >
                <Text className="text-red-700 text-xs font-medium">{tag}</Text>
              </View>
            ))}
          </View>

          {/* Title and Brand */}
          <Text className="text-gray-500 text-sm">{product.brand}</Text>
          <Text className="text-2xl font-bold text-gray-900 mt-1">
            {product.name}
          </Text>

          {/* Rating */}
          <View className="flex-row items-center mt-2">
            <View className="flex-row items-center">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <Text className="ml-1 font-bold text-gray-900">
                {product.rating}
              </Text>
            </View>
            <Text className="ml-2 text-gray-500">
              ({product.reviewCount} 則評價)
            </Text>
            <Text className="ml-4 text-gray-500">已售出 {product.sold}</Text>
          </View>

          {/* Price */}
          <View className="flex-row items-center mt-4">
            <Text className="text-3xl font-bold text-red-600">
              NT${product.price}
            </Text>
            <Text className="ml-3 text-lg text-gray-500 line-through">
              NT${product.originalPrice}
            </Text>
            <View className="ml-3 bg-red-100 px-2 py-1 rounded">
              <Text className="text-red-700 font-bold">
                {product.discount}% OFF
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text className="text-gray-700 mt-6 leading-6">
            {product.description}
          </Text>

          {/* Features */}
          <View className="mt-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">
              產品特色
            </Text>
            {product.features.map((feature, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3" />
                <Text className="text-gray-700 flex-1">{feature}</Text>
              </View>
            ))}
          </View>

          {/* Specifications */}
          <View className="mt-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              規格資訊
            </Text>
            <View className="bg-gray-50 rounded-xl p-4">
              {product.specifications.map((spec, index) => (
                <View
                  key={index}
                  className="flex-row justify-between py-3 border-b border-gray-200 last:border-b-0"
                >
                  <Text className="text-gray-600">{spec.label}</Text>
                  <Text className="text-gray-900 font-medium">{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Service Features */}
          <View className="mt-8">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              服務保障
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Package size={24} className="text-blue-500" />
                <Text className="text-gray-700 text-sm mt-2">快速出貨</Text>
              </View>
              <View className="items-center flex-1">
                <Truck size={24} className="text-green-500" />
                <Text className="text-gray-700 text-sm mt-2">免運費</Text>
              </View>
              <View className="items-center flex-1">
                <Shield size={24} className="text-purple-500" />
                <Text className="text-gray-700 text-sm mt-2">正品保證</Text>
              </View>
            </View>
          </View>

          {/* Reviews Preview */}
          <TouchableOpacity className="mt-8 bg-gray-50 rounded-xl p-4">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  商品評價
                </Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {product.rating}
                  </Text>
                  <View className="ml-2">
                    <View className="flex-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      ))}
                    </View>
                    <Text className="text-gray-500 text-sm mt-1">
                      {product.reviewCount} 則評價
                    </Text>
                  </View>
                </View>
              </View>
              <ChevronRight size={20} className="text-gray-400" />
            </View>
          </TouchableOpacity>

          {/* Spacer for bottom buttons */}
          <View className="h-32" />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          {/* Quantity Selector */}
          <View className="flex-row items-center bg-gray-100 rounded-lg">
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus size={20} className="text-gray-700" />
            </TouchableOpacity>
            <Text className="w-12 text-center text-lg font-bold text-gray-900">
              {quantity}
            </Text>
            <TouchableOpacity
              className="w-10 h-10 items-center justify-center"
              onPress={() => setQuantity(quantity + 1)}
            >
              <Plus size={20} className="text-gray-700" />
            </TouchableOpacity>
          </View>

          {/* Stock Info */}
          <View className="ml-4">
            <Text className="text-gray-700">庫存 {product.stock} 件</Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-1 flex-row space-x-3 ml-4">
            <TouchableOpacity
              className="flex-1 bg-blue-50 border border-blue-500 rounded-xl py-3 items-center justify-center"
              onPress={handleAddToCart}
            >
              <ShoppingCart size={20} className="text-blue-600" />
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-600 rounded-xl py-3 items-center justify-center"
              onPress={handleBuyNow}
            >
              <Text className="text-white font-bold">立即購買</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}