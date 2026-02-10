import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

// Server component - no 'use client' needed for static content
export default function HomePage() {
  // Mock data for featured products
  const featuredProducts = [
    { id: 1, name: '醫療口罩', price: 150, originalPrice: 200, discount: 25, image: '/placeholder-product.jpg' },
    { id: 2, name: '酒精乾洗手', price: 280, originalPrice: 350, discount: 20, image: '/placeholder-product.jpg' },
    { id: 3, name: '血壓計', price: 2450, originalPrice: 2900, discount: 15, image: '/placeholder-product.jpg' },
    { id: 4, name: '血糖儀', price: 1800, originalPrice: 2200, discount: 18, image: '/placeholder-product.jpg' },
  ];

  // Mock data for latest products
  const latestProducts = [
    { id: 5, name: '體溫槍', price: 1200, image: '/placeholder-product.jpg' },
    { id: 6, name: '輪椅', price: 8500, image: '/placeholder-product.jpg' },
    { id: 7, name: '拐杖', price: 650, image: '/placeholder-product.jpg' },
    { id: 8, name: '病床', price: 15000, image: '/placeholder-product.jpg' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">CEO 團購電商平台</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            專為醫療機構打造的專業團購平台，享受量大價優的採購體驗
          </p>

          <form action="/products" method="get" className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                name="search"
                placeholder="搜尋商品..."
                className="py-6 px-6 text-lg rounded-full shadow-lg"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 py-5 px-6 rounded-full"
              >
                <Search className="h-5 w-5 mr-2" />
                搜尋
              </Button>
            </div>
          </form>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Products */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">熱門商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    <span className="text-red-600 font-bold">${product.price}</span>
                    <span className="line-through text-gray-500 ml-2">${product.originalPrice}</span>
                    <span className="ml-2 text-green-600">-{product.discount}%</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    asChild
                  >
                    <Link href={`/products/${product.id}`}>
                      查看詳情
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Products */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">最新商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <Card key={product.id}>
                <div className="relative h-48 bg-gray-200">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription>
                    <span className="text-red-600 font-bold">${product.price}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    asChild
                  >
                    <Link href={`/products/${product.id}`}>
                      查看詳情
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">量大價優</h3>
              <p className="text-gray-600">階梯式定價，採購越多價格越優惠</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">限時團購</h3>
              <p className="text-gray-600">精選商品限時團購，把握最佳採購時機</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">品質保證</h3>
              <p className="text-gray-600">嚴格篩選合作廠商，確保商品品質</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}