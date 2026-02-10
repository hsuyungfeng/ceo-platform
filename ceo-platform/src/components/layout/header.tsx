'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock cart count
  const cartItemCount = 3;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">CEO團購平台</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/" 
              className={`font-medium ${pathname === '/' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              首頁
            </Link>
            <Link 
              href="/products" 
              className={`font-medium ${pathname.startsWith('/products') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              商品
            </Link>
            <Link 
              href="/cart" 
              className={`font-medium ${pathname === '/cart' ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              購物車
              {cartItemCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            <Button asChild className="hidden md:block">
              <Link href="/login">會員登入</Link>
            </Button>
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className={`font-medium py-2 ${pathname === '/' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                首頁
              </Link>
              <Link 
                href="/products" 
                className={`font-medium py-2 ${pathname.startsWith('/products') ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                商品
              </Link>
              <Link 
                href="/cart" 
                className={`font-medium py-2 ${pathname === '/cart' ? 'text-blue-600' : 'text-gray-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                購物車
                {cartItemCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Button asChild className="w-full mt-2">
                <Link href="/login">會員登入</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}