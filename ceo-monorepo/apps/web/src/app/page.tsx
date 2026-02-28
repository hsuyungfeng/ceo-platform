import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Server component - no 'use client' needed for static content
export default function HomePage() {
  // Mock data for featured products
  const featuredProducts = [
    { id: 1, name: '醫療口罩', price: 150, image: '/placeholder-product.svg' },
    { id: 2, name: '酒精乾洗手', price: 280, image: '/placeholder-product.svg' },
    { id: 3, name: '血壓計', price: 2450, image: '/placeholder-product.svg' },
    { id: 4, name: '血糖儀', price: 1800, image: '/placeholder-product.svg' },
  ];

  // Mock data for latest products
  const latestProducts = [
    { id: 5, name: '體溫槍', price: 1200, image: '/placeholder-product.svg' },
    { id: 6, name: '輪椅', price: 8500, image: '/placeholder-product.svg' },
    { id: 7, name: '拐杖', price: 650, image: '/placeholder-product.svg' },
    { id: 8, name: '病床', price: 15000, image: '/placeholder-product.svg' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">CEO 平台</h1>
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
                   <div className="text-sm text-muted-foreground">
                     <span className="text-red-600 font-bold">${product.price}</span>
                   </div>
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
                   <div className="text-sm text-muted-foreground">
                     <span className="text-red-600 font-bold">${product.price}</span>
                   </div>
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
      </div>
    </div>
  );
}