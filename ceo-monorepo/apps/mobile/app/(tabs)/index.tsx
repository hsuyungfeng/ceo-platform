import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { Search, ArrowRight } from "lucide-react-native";
import { Link } from "expo-router";
import { useFeaturedProducts, useCategories, useLatestProducts } from "@/src/services/hooks";
import { formatCurrency } from "@/src/lib/utils";

export default function HomeScreen() {
  const {
    data: featuredProducts = [],
    loading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useFeaturedProducts()

  const {
    data: categories = [],
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useCategories()

  const {
    data: latestProducts = [],
    loading: latestLoading,
    error: latestError,
    refetch: refetchLatest,
  } = useLatestProducts()

  const isLoading = featuredLoading || categoriesLoading || latestLoading
  const hasError = featuredError || categoriesError || latestError

  const handleRefresh = () => {
    refetchFeatured()
    refetchCategories()
    refetchLatest()
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-600">載入中...</Text>
      </View>
    )
  }

  if (hasError) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-4">
        <Text className="text-red-600 text-lg font-medium mb-2">載入失敗</Text>
        <Text className="text-gray-600 text-center mb-4">
          {featuredError || categoriesError || latestError}
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-full"
          onPress={handleRefresh}
        >
          <Text className="text-white font-medium">重試</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          colors={["#3b82f6"]}
        />
      }
    >
      {/* Hero Section */}
      <View className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 pt-12 pb-8">
        <Text className="text-3xl font-bold text-white mb-2">
          CEO 團購電商平台
        </Text>
        <Text className="text-lg text-blue-100 mb-6">
          專為醫療機構打造的專業團購平台
        </Text>

        {/* Search Bar */}
        <Link href="/search" asChild>
          <TouchableOpacity className="bg-white rounded-full px-4 py-3 flex-row items-center">
            <Search size={20} color="#9ca3af" />
            <Text className="ml-3 text-gray-500 flex-1">搜尋商品...</Text>
            <View className="bg-blue-600 px-4 py-2 rounded-full">
              <Text className="text-white font-medium">搜尋</Text>
            </View>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Categories */}
      <View className="px-4 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold">商品分類</Text>
          <Link href="/search" asChild>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-blue-600 mr-1">查看全部</Text>
              <ArrowRight size={16} color="#3b82f6" />
            </TouchableOpacity>
          </Link>
        </View>

        {categoriesLoading ? (
          <View className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} className="bg-white rounded-lg p-4 items-center shadow-sm">
                <View className="w-12 h-12 bg-gray-200 rounded-full mb-2" />
                <View className="h-4 bg-gray-200 rounded w-16 mb-1" />
                <View className="h-3 bg-gray-200 rounded w-12" />
              </View>
            ))}
          </View>
        ) : categories.length > 0 ? (
          <View className="grid grid-cols-3 gap-3">
            {categories.slice(0, 6).map((category: any) => (
              <Link key={category.id} href={`/search?categoryId=${category.id}`} asChild>
                <TouchableOpacity className="bg-white rounded-lg p-4 items-center shadow-sm">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                    <Text className="text-blue-600 font-bold">{category.name?.charAt(0) || 'C'}</Text>
                  </View>
                  <Text className="font-medium text-center" numberOfLines={1}>
                    {category.name || '分類'}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {category.productCount || 0}件商品
                  </Text>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        ) : (
          <View className="bg-white rounded-lg p-8 items-center">
            <Text className="text-gray-500">暫無分類資料</Text>
          </View>
        )}
      </View>

      {/* Featured Products */}
      <View className="px-4 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold">熱門商品</Text>
          <Link href="/search?featured=true" asChild>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-blue-600 mr-1">查看更多</Text>
              <ArrowRight size={16} color="#3b82f6" />
            </TouchableOpacity>
          </Link>
        </View>

        {featuredLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="bg-white rounded-lg w-48 mr-4 shadow-sm">
                <View className="h-40 bg-gray-200 rounded-t-lg" />
                <View className="p-4">
                  <View className="h-4 bg-gray-200 rounded mb-2" />
                  <View className="h-6 bg-gray-200 rounded w-16 mb-3" />
                  <View className="h-10 bg-gray-200 rounded" />
                </View>
              </View>
            ))}
          </ScrollView>
        ) : featuredProducts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
            {featuredProducts.map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`} asChild>
                <TouchableOpacity className="bg-white rounded-lg w-48 mr-4 shadow-sm">
                  <View className="h-40 bg-gray-200 rounded-t-lg">
                    {product.images?.[0] ? (
                      <Image
                        source={{ uri: product.images[0] }}
                        className="w-full h-full rounded-t-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Text className="text-gray-400">無圖片</Text>
                      </View>
                    )}
                  </View>
                  <View className="p-4">
                    <Text className="font-medium mb-1" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-red-600 font-bold">
                      {formatCurrency(product.price || 0)}
                    </Text>
                    <View className="mt-3 bg-blue-600 py-2 rounded-lg">
                      <Text className="text-white text-center font-medium">查看詳情</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        ) : (
          <View className="bg-white rounded-lg p-8 items-center">
            <Text className="text-gray-500">暫無熱門商品</Text>
          </View>
        )}
       </View>

      {/* Latest Products */}
      <View className="px-4 py-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold">最新商品</Text>
          <Link href="/search?sortBy=createdAt&sortOrder=desc" asChild>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-blue-600 mr-1">查看更多</Text>
              <ArrowRight size={16} color="#3b82f6" />
            </TouchableOpacity>
          </Link>
        </View>

        {latestLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
            {[1, 2, 3, 4].map((i) => (
              <View key={i} className="bg-white rounded-lg w-48 mr-4 shadow-sm">
                <View className="h-40 bg-gray-200 rounded-t-lg" />
                <View className="p-4">
                  <View className="h-4 bg-gray-200 rounded mb-2" />
                  <View className="h-6 bg-gray-200 rounded w-16 mb-3" />
                  <View className="h-10 bg-gray-200 rounded" />
                </View>
              </View>
            ))}
          </ScrollView>
        ) : latestProducts.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4">
            {latestProducts.map((product: any) => (
              <Link key={product.id} href={`/product/${product.id}`} asChild>
                <TouchableOpacity className="bg-white rounded-lg w-48 mr-4 shadow-sm">
                  <View className="h-40 bg-gray-200 rounded-t-lg">
                    {product.images?.[0] ? (
                      <Image
                        source={{ uri: product.images[0] }}
                        className="w-full h-full rounded-t-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <Text className="text-gray-400">無圖片</Text>
                      </View>
                    )}
                  </View>
                  <View className="p-4">
                    <Text className="font-medium mb-1" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-red-600 font-bold">
                      {formatCurrency(product.price || 0)}
                    </Text>
                    <View className="mt-3 bg-blue-600 py-2 rounded-lg">
                      <Text className="text-white text-center font-medium">查看詳情</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </Link>
            ))}
          </ScrollView>
        ) : (
          <View className="bg-white rounded-lg p-8 items-center">
            <Text className="text-gray-500">暫無最新商品</Text>
          </View>
        )}
      </View>

      {/* Features */}
      <View className="px-4 py-6 bg-white">
        <Text className="text-xl font-bold mb-6 text-center">平台特色</Text>
        <View className="space-y-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
              <Text className="text-blue-600 font-bold">✓</Text>
            </View>
            <View className="flex-1">
              <Text className="font-medium">量大價優</Text>
              <Text className="text-gray-600 text-sm">階梯式定價，採購越多價格越優惠</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
              <Text className="text-green-600 font-bold">⏰</Text>
            </View>
            <View className="flex-1">
              <Text className="font-medium">限時團購</Text>
              <Text className="text-gray-600 text-sm">精選商品限時團購，把握最佳採購時機</Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-yellow-100 rounded-full items-center justify-center mr-3">
              <Text className="text-yellow-600 font-bold">⭐</Text>
            </View>
            <View className="flex-1">
              <Text className="font-medium">品質保證</Text>
              <Text className="text-gray-600 text-sm">嚴格篩選合作廠商，確保商品品質</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}