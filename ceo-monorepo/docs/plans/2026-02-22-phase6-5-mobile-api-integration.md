# Phase 6.5: Mobile App API Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete API integration for all remaining mobile app pages using the enhanced API client system built in Phase 6.4.

**Architecture:** Use the existing API client system (`@ceo/api-client`) with React hooks (`useApi`, `usePaginatedApi`, `useMutation`) to integrate product detail, cart, search, orders, and profile pages. Implement offline support with MMKV caching and network detection.

**Tech Stack:** React Native, Expo SDK 54, TypeScript, NativeWind (Tailwind CSS), Expo Router, @ceo/api-client, Zustand, MMKV, NetInfo

---

### Task 1: Install Required Packages

**Files:**
- Modify: `apps/mobile/package.json`

**Step 1: Install MMKV and NetInfo packages**

```bash
cd apps/mobile
pnpm add react-native-mmkv @react-native-community/netinfo
```

**Step 2: Update package.json to verify installation**

Check: `cat package.json | grep -A2 -B2 "react-native-mmkv"`
Expected: Shows react-native-mmkv in dependencies

**Step 3: Install iOS pods (if needed)**

```bash
cd ios
pod install
```

**Step 4: Commit**

```bash
git add apps/mobile/package.json apps/mobile/package-lock.json
git commit -m "chore: add mmkv and netinfo packages for offline support"
```

### Task 2: Initialize MMKV Storage

**Files:**
- Create: `apps/mobile/src/lib/storage.ts`
- Modify: `apps/mobile/app/_layout.tsx`

**Step 1: Create storage utility**

```typescript
// apps/mobile/src/lib/storage.ts
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const StorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_DATA: 'cart_data',
  PRODUCT_CACHE: 'product_cache',
  CATEGORY_CACHE: 'category_cache',
  API_CACHE: 'api_cache',
  PREFERENCES: 'preferences',
} as const;

export function getStorageItem<T>(key: string, defaultValue?: T): T | null {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : defaultValue || null;
  } catch (error) {
    console.error(`Error reading from storage key ${key}:`, error);
    return defaultValue || null;
  }
}

export function setStorageItem(key: string, value: any): void {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to storage key ${key}:`, error);
  }
}

export function removeStorageItem(key: string): void {
  storage.delete(key);
}

export function clearStorage(): void {
  storage.clearAll();
}
```

**Step 2: Update _layout.tsx to initialize storage**

```typescript
// apps/mobile/app/_layout.tsx
import { useEffect } from 'react';
import { storage } from '@/src/lib/storage';
import { useAuthStore } from '@/src/stores/authStore';

export default function RootLayout() {
  const { initializeFromStorage } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from storage
    initializeFromStorage();
  }, []);

  // ... rest of layout code
}
```

**Step 3: Test storage functions**

Create test: `apps/mobile/src/lib/__tests__/storage.test.ts`
Run: `cd apps/mobile && npx jest src/lib/__tests__/storage.test.ts`

**Step 4: Commit**

```bash
git add apps/mobile/src/lib/storage.ts apps/mobile/app/_layout.tsx
git commit -m "feat: initialize mmkv storage system"
```

### Task 3: Integrate Product Detail Page

**Files:**
- Modify: `apps/mobile/app/product/[id].tsx`
- Modify: `apps/mobile/src/services/hooks.ts`

**Step 1: Add product detail hook to hooks.ts**

```typescript
// apps/mobile/src/services/hooks.ts
export function useProduct(productId: string) {
  return useApi<Product>(
    `/api/products/${productId}`,
    {
      cacheKey: `product_${productId}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useRelatedProducts(productId: string) {
  return usePaginatedApi<Product>(
    `/api/products/${productId}/related`,
    {
      pageSize: 10,
      cacheKey: `related_products_${productId}`,
    }
  );
}

export function useAddToCart() {
  return useMutation<CartItem, { productId: string; quantity: number }>(
    (data) => api.cart.addItem(data),
    {
      onSuccess: () => {
        // Invalidate cart cache
        queryClient.invalidateQueries(['cart']);
      },
      optimisticUpdate: (variables) => {
        // Optimistically update cart in store
        const cartStore = useCartStore.getState();
        cartStore.addItem({
          id: Date.now().toString(),
          productId: variables.productId,
          quantity: variables.quantity,
          addedAt: new Date().toISOString(),
        });
      },
    }
  );
}
```

**Step 2: Update product detail page**

```typescript
// apps/mobile/app/product/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useProduct, useRelatedProducts, useAddToCart } from '@/src/services/hooks';
import { ProductDetail } from '@/src/components/ProductDetail';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';

export default function ProductDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: product, isLoading, error, refetch } = useProduct(id);
  const { data: relatedProducts } = useRelatedProducts(id);
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (quantity: number) => {
    addToCartMutation.mutate({
      productId: id,
      quantity,
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load product" onRetry={refetch} />;
  }

  if (!product) {
    return <ErrorMessage message="Product not found" />;
  }

  return (
    <ProductDetail
      product={product}
      relatedProducts={relatedProducts?.items || []}
      onAddToCart={handleAddToCart}
      isAddingToCart={addToCartMutation.isLoading}
    />
  );
}
```

**Step 3: Test product detail page**

Run: `cd apps/mobile && npx expo start`
Navigate to product detail page with product ID

**Step 4: Commit**

```bash
git add apps/mobile/src/services/hooks.ts apps/mobile/app/product/[id].tsx
git commit -m "feat: integrate product detail page with API"
```

### Task 4: Integrate Cart Page

**Files:**
- Modify: `apps/mobile/app/(tabs)/cart.tsx`
- Modify: `apps/mobile/src/services/hooks.ts`

**Step 1: Add cart hooks to hooks.ts**

```typescript
// apps/mobile/src/services/hooks.ts
export function useCart() {
  return useApi<Cart>(
    '/api/cart',
    {
      cacheKey: 'cart',
      cacheTTL: 1 * 60 * 1000, // 1 minute
    }
  );
}

export function useUpdateCartItem() {
  return useMutation<CartItem, { itemId: string; quantity: number }>(
    (data) => api.cart.updateItem(data.itemId, data.quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
      },
    }
  );
}

export function useRemoveCartItem() {
  return useMutation<void, { itemId: string }>(
    (data) => api.cart.removeItem(data.itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
      },
    }
  );
}

export function useClearCart() {
  return useMutation<void, void>(
    () => api.cart.clear(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
        // Also clear local cart store
        const cartStore = useCartStore.getState();
        cartStore.clearCart();
      },
    }
  );
}
```

**Step 2: Update cart page**

```typescript
// apps/mobile/app/(tabs)/cart.tsx
import { useCart, useUpdateCartItem, useRemoveCartItem, useClearCart } from '@/src/services/hooks';
import { CartList } from '@/src/components/CartList';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { Button } from '@/src/components/ui/Button';
import { useRouter } from 'expo-router';

export default function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading, error, refetch } = useCart();
  const updateMutation = useUpdateCartItem();
  const removeMutation = useRemoveCartItem();
  const clearMutation = useClearCart();

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateMutation.mutate({ itemId, quantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeMutation.mutate({ itemId });
  };

  const handleClearCart = () => {
    clearMutation.mutate();
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load cart" onRetry={refetch} />;
  }

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <View className="flex-1 p-4">
      {isEmpty ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-lg text-gray-500">Your cart is empty</Text>
          <Button onPress={() => router.push('/')} className="mt-4">
            Browse Products
          </Button>
        </View>
      ) : (
        <>
          <CartList
            items={cart.items}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            isUpdating={updateMutation.isLoading}
            isRemoving={removeMutation.isLoading}
          />
          <View className="mt-4 space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-lg font-semibold">Total:</Text>
              <Text className="text-lg font-bold">{formatCurrency(cart.total)}</Text>
            </View>
            <Button onPress={handleCheckout} disabled={clearMutation.isLoading}>
              Proceed to Checkout
            </Button>
            <Button
              variant="outline"
              onPress={handleClearCart}
              disabled={clearMutation.isLoading}
            >
              {clearMutation.isLoading ? 'Clearing...' : 'Clear Cart'}
            </Button>
          </View>
        </>
      )}
    </View>
  );
}
```

**Step 3: Test cart page**

Run app and test:
- Add items to cart
- Update quantities
- Remove items
- Clear cart

**Step 4: Commit**

```bash
git add apps/mobile/src/services/hooks.ts apps/mobile/app/(tabs)/cart.tsx
git commit -m "feat: integrate cart page with API"
```

### Task 5: Integrate Search Page

**Files:**
- Modify: `apps/mobile/app/search.tsx`
- Modify: `apps/mobile/src/services/hooks.ts`

**Step 1: Add search hooks to hooks.ts**

```typescript
// apps/mobile/src/services/hooks.ts
export function useSearchProducts(searchQuery: string, filters?: SearchFilters) {
  return usePaginatedApi<Product>(
    '/api/products/search',
    {
      params: {
        q: searchQuery,
        ...filters,
      },
      pageSize: 20,
      cacheKey: `search_${searchQuery}_${JSON.stringify(filters)}`,
      cacheTTL: 2 * 60 * 1000, // 2 minutes
    }
  );
}

export function useProductCategories() {
  return useApi<Category[]>(
    '/api/categories',
    {
      cacheKey: 'categories',
      cacheTTL: 10 * 60 * 1000, // 10 minutes
    }
  );
}
```

**Step 2: Update search page**

```typescript
// apps/mobile/app/search.tsx
import { useState, useCallback } from 'react';
import { useSearchProducts, useProductCategories } from '@/src/services/hooks';
import { SearchBar } from '@/src/components/SearchBar';
import { ProductGrid } from '@/src/components/ProductGrid';
import { FilterPanel } from '@/src/components/FilterPanel';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { useDebounce } from '@/src/hooks/useDebounce';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const debouncedQuery = useDebounce(searchQuery, 500);
  
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore,
    isRefreshing,
  } = useSearchProducts(debouncedQuery, filters);

  const { data: categories } = useProductCategories();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  }, [hasMore, isLoading, loadMore]);

  return (
    <View className="flex-1">
      <SearchBar
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search products..."
      />
      
      <FilterPanel
        categories={categories || []}
        filters={filters}
        onFilterChange={handleFilterChange}
      />

      {isLoading && !searchResults ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message="Failed to search products" onRetry={handleRefresh} />
      ) : (
        <ProductGrid
          products={searchResults?.items || []}
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoadingMore={isLoading && searchResults?.items.length > 0}
        />
      )}
    </View>
  );
}
```

**Step 3: Test search functionality**

Run app and test:
- Search for products
- Apply filters
- Pagination
- Refresh

**Step 4: Commit**

```bash
git add apps/mobile/src/services/hooks.ts apps/mobile/app/search.tsx
git commit -m "feat: integrate search page with API"
```

### Task 6: Integrate Orders Page

**Files:**
- Modify: `apps/mobile/app/(tabs)/orders.tsx`
- Modify: `apps/mobile/src/services/hooks.ts`

**Step 1: Add orders hooks to hooks.ts**

```typescript
// apps/mobile/src/services/hooks.ts
export function useOrders(filters?: OrderFilters) {
  return usePaginatedApi<Order>(
    '/api/orders',
    {
      params: filters,
      pageSize: 10,
      cacheKey: `orders_${JSON.stringify(filters)}`,
    }
  );
}

export function useOrderDetails(orderId: string) {
  return useApi<OrderDetails>(
    `/api/orders/${orderId}`,
    {
      cacheKey: `order_${orderId}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
    }
  );
}

export function useCancelOrder() {
  return useMutation<void, { orderId: string }>(
    (data) => api.orders.cancel(data.orderId),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['order', variables.orderId]);
      },
    }
  );
}
```

**Step 2: Update orders page**

```typescript
// apps/mobile/app/(tabs)/orders.tsx
import { useState } from 'react';
import { useOrders, useCancelOrder } from '@/src/services/hooks';
import { OrderList } from '@/src/components/OrderList';
import { OrderFilter } from '@/src/components/OrderFilter';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { SegmentedControl } from '@/src/components/ui/SegmentedControl';

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  const filters = {
    ...(statusFilter !== 'all' && { status: statusFilter }),
    ...(timeFilter !== 'all' && { timeframe: timeFilter }),
  };

  const {
    data: orders,
    isLoading,
    error,
    refetch,
    loadMore,
    hasMore,
    isRefreshing,
  } = useOrders(filters);

  const cancelMutation = useCancelOrder();

  const handleCancelOrder = (orderId: string) => {
    cancelMutation.mutate({ orderId });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      loadMore();
    }
  };

  if (isLoading && !orders) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load orders" onRetry={handleRefresh} />;
  }

  return (
    <View className="flex-1">
      <View className="p-4 space-y-4">
        <SegmentedControl
          options={[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />

        <SegmentedControl
          options={[
            { label: 'All Time', value: 'all' },
            { label: 'Last 7 Days', value: '7d' },
            { label: 'Last 30 Days', value: '30d' },
            { label: 'Last 90 Days', value: '90d' },
          ]}
          value={timeFilter}
          onChange={setTimeFilter}
        />
      </View>

      <OrderList
        orders={orders?.items || []}
        onCancelOrder={handleCancelOrder}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoading && orders?.items.length > 0}
        isCancelling={cancelMutation.isLoading}
      />
    </View>
  );
}
```

**Step 3: Test orders page**

Run app and test:
- Filter orders by status
- Filter by timeframe
- Cancel orders
- Pagination

**Step 4: Commit**

```bash
git add apps/mobile/src/services/hooks.ts apps/mobile/app/(tabs)/orders.tsx
git commit -m "feat: integrate orders page with API"
```

### Task 7: Integrate Profile Page

**Files:**
- Modify: `apps/mobile/app/(tabs)/profile.tsx`
- Modify: `apps/mobile/src/services/hooks.ts`

**Step 1: Add profile hooks to hooks.ts**

```typescript
// apps/mobile/src/services/hooks.ts
export function useUserProfile() {
  return useApi<UserProfile>(
    '/api/user/profile',
    {
      cacheKey: 'user_profile',
      cacheTTL: 30 * 60 * 1000, // 30 minutes
    }
  );
}

export function useUpdateProfile() {
  return useMutation<UserProfile, Partial<UserProfile>>(
    (data) => api.user.updateProfile(data),
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['user_profile'], data);
      },
    }
  );
}

export function useChangePassword() {
  return useMutation<void, { currentPassword: string; newPassword: string }>(
    (data) => api.user.changePassword(data),
  );
}

export function useShippingAddresses() {
  return useApi<ShippingAddress[]>(
    '/api/user/shipping-addresses',
    {
      cacheKey: 'shipping_addresses',
    }
  );
}

export function useAddShippingAddress() {
  return useMutation<ShippingAddress, Omit<ShippingAddress, 'id'>>(
    (data) => api.user.addShippingAddress(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shipping_addresses']);
      },
    }
  );
}
```

**Step 2: Update profile page**

```typescript
// apps/mobile/app/(tabs)/profile.tsx
import { useState } from 'react';
import { 
  useUserProfile, 
  useUpdateProfile, 
  useChangePassword,
  useShippingAddresses,
  useAddShippingAddress,
} from '@/src/services/hooks';
import { ProfileHeader } from '@/src/components/ProfileHeader';
import { ProfileForm } from '@/src/components/ProfileForm';
import { PasswordForm } from '@/src/components/PasswordForm';
import { AddressList } from '@/src/components/AddressList';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/src/components/ui/ErrorMessage';
import { Tabs } from '@/src/components/ui/Tabs';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  const { data: profile, isLoading, error, refetch } = useUserProfile();
  const updateMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const { data: addresses } = useShippingAddresses();
  const addAddressMutation = useAddShippingAddress();

  const handleUpdateProfile = (data: Partial<UserProfile>) => {
    updateMutation.mutate(data);
  };

  const handleChangePassword = (data: { currentPassword: string; newPassword: string }) => {
    changePasswordMutation.mutate(data);
  };

  const handleAddAddress = (data: Omit<ShippingAddress, 'id'>) => {
    addAddressMutation.mutate(data);
  };

  if (isLoading && !profile) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message="Failed to load profile" onRetry={refetch} />;
  }

  return (
    <View className="flex-1">
      <ProfileHeader user={profile} />
      
      <Tabs
        tabs={[
          { id: 'profile', label: 'Profile' },
          { id: 'password', label: 'Password' },
          { id: 'addresses', label: 'Addresses' },
          { id: 'settings', label: 'Settings' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <View className="p-4">
        {activeTab === 'profile' && (
          <ProfileForm
            profile={profile}
            onSubmit={handleUpdateProfile}
            isSubmitting={updateMutation.isLoading}
          />
        )}

        {activeTab === 'password' && (
          <PasswordForm
            onSubmit={handleChangePassword}
            isSubmitting={changePasswordMutation.isLoading}
          />
        )}

        {activeTab === 'addresses' && (
          <AddressList
            addresses={addresses || []}
            onAddAddress={handleAddAddress}
            isAdding={addAddressMutation.isLoading}
          />
        )}

        {activeTab === 'settings' && (
          <View>
            <Text className="text-lg font-semibold mb-4">Settings</Text>
            {/* Settings options */}
          </View>
        )}
      </View>
    </View>
  );
}
```

**Step 3: Test profile page**

Run app and test:
- View profile
- Update profile info
- Change password
- Manage addresses

**Step 4: Commit**

```bash
git add apps/mobile/src/services/hooks.ts apps/mobile/app/(tabs)/profile.tsx
git commit -m "feat: integrate profile page with API"
```

### Task 8: Test All API Integrations

**Files:**
- Create: `apps/mobile/src/services/__tests__/api.test.ts`
- Create: `apps/mobile/src/services/__tests__/hooks.test.ts`

**Step 1: Create API integration tests**

```typescript
// apps/mobile/src/services/__tests__/api.test.ts
import { api } from '../api';
import { mockApiResponse } from '@/src/lib/test-utils';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should fetch products', async () => {
    const mockProducts = [{ id: '1', name: 'Test Product' }];
    mockApiResponse('/api/products', mockProducts);

    const result = await api.products.getAll();
    expect(result).toEqual(mockProducts);
  });

  test('should fetch product by id', async () => {
    const mockProduct = { id: '1', name: 'Test Product' };
    mockApiResponse('/api/products/1', mockProduct);

    const result = await api.products.getById('1');
    expect(result).toEqual(mockProduct);
  });

  test('should add item to cart', async () => {
    const mockCartItem = { id: '1', productId: '1', quantity: 1 };
    mockApiResponse('/api/cart/items', mockCartItem, 'POST');

    const result = await api.cart.addItem({ productId: '1', quantity: 1 });
    expect(result).toEqual(mockCartItem);
  });

  test('should fetch user profile', async () => {
    const mockProfile = { id: '1', name: 'Test User', email: 'test@example.com' };
    mockApiResponse('/api/user/profile', mockProfile);

    const result = await api.user.getProfile();
    expect(result).toEqual(mockProfile);
  });
});
```

**Step 2: Create hooks integration tests**

```typescript
// apps/mobile/src/services/__tests__/hooks.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { useProduct, useCart, useSearchProducts } from '../hooks';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockApiResponse } from '@/src/lib/test-utils';

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('API Hooks', () => {
  beforeEach(() => {
    queryClient.clear();
    jest.clearAllMocks();
  });

  test('useProduct should fetch product data', async () => {
    const mockProduct = { id: '1', name: 'Test Product' };
    mockApiResponse('/api/products/1', mockProduct);

    const { result } = renderHook(() => useProduct('1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockProduct);
    });
  });

  test('useCart should fetch cart data', async () => {
    const mockCart = { items: [], total: 0 };
    mockApiResponse('/api/cart', mockCart);

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockCart);
    });
  });

  test('useSearchProducts should fetch search results', async () => {
    const mockResults = { items: [{ id: '1', name: 'Test' }], total: 1, page: 1 };
    mockApiResponse('/api/products/search?q=test', mockResults);

    const { result } = renderHook(() => useSearchProducts('test'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data?.items).toHaveLength(1);
    });
  });
});
```

**Step 3: Run all tests**

```bash
cd apps/mobile
pnpm test
```

Expected: All tests pass

**Step 4: Test offline mode**

1. Turn off network connection
2. Test each page loads cached data
3. Test mutations queue for when network returns
4. Test network status detection

**Step 5: Commit**

```bash
git add apps/mobile/src/services/__tests__/
git commit -m "test: add API integration tests"
```

### Task 9: Final Verification

**Step 1: Run TypeScript type check**

```bash
cd apps/mobile
pnpm type-check
```

Expected: No TypeScript errors

**Step 2: Run linting**

```bash
cd apps/mobile
pnpm lint
```

Expected: No linting errors

**Step 3: Build the app**

```bash
cd apps/mobile
pnpm build
```

Expected: Build succeeds

**Step 4: Run the app and test all features**

```bash
cd apps/mobile
pnpm start
```

Test manually:
1. Browse products
2. Search and filter
3. Add to cart
4. Checkout flow
5. View orders
6. Update profile
7. Test offline mode

**Step 5: Final commit**

```bash
git add .
git commit -m "feat: complete Phase 6.5 mobile app API integration"
```

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-02-22-phase6-5-mobile-api-integration.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**