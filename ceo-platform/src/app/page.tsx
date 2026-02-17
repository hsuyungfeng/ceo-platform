'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  unit: string;
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featuredRes, latestRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=4'),
          fetch('/api/products?sortBy=createdAt&order=desc&limit=4')
        ]);

        if (!featuredRes.ok || !latestRes.ok) {
          throw new Error('載入商品失敗');
        }

        const featuredData = await featuredRes.json();
        const latestData = await latestRes.json();

        setFeaturedProducts(featuredData.data || []);
        setLatestProducts(latestData.data || []);
      } catch (error) {
        toast.error('載入商品時發生錯誤');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <HomePageSkeleton />;
  }

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
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>
                      <span className="text-red-600 font-bold">${product.price}</span>
                      <span className="ml-2 text-gray-600">/{product.unit}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href={`/products/${product.id}`}>
                        查看詳情
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                暫無熱門商品
              </div>
            )}
          </div>
        </section>

        {/* Latest Products */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">最新商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <Card key={product.id}>
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>
                      <span className="text-red-600 font-bold">${product.price}</span>
                      <span className="ml-2 text-gray-600">/{product.unit}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" asChild>
                      <Link href={`/products/${product.id}`}>
                        查看詳情
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-8">
                暫無最新商品
              </div>
            )}
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

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Skeleton className="h-12 w-3/4 mx-auto mb-4 bg-blue-500" />
          <Skeleton className="h-8 w-2/3 mx-auto mb-8 bg-blue-500" />
          <Skeleton className="h-14 w-1/2 mx-auto rounded-full bg-blue-500" />
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">熱門商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">最新商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
