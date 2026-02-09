import { create } from 'zustand'

export interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
  sku?: string
}

export interface PriceTier {
  quantity: number
  price: number
  discount: number
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  basePrice: number
  currentPrice: number
  originalPrice: number
  images: string[]
  stock: number
  soldCount: number
  targetCount: number
  startDate: string
  endDate: string
  isActive: boolean
  variants?: ProductVariant[]
  priceTiers: PriceTier[]
  tags: string[]
  rating: number
  reviewCount: number
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  inStock?: boolean
  onSale?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'popularity' | 'newest' | 'discount'
}

export interface ProductState {
  products: Product[]
  featuredProducts: Product[]
  trendingProducts: Product[]
  currentProduct: Product | null
  filters: ProductFilters
  isLoading: boolean
  error: string | null
  searchQuery: string
  
  // Actions
  setProducts: (products: Product[]) => void
  setFeaturedProducts: (products: Product[]) => void
  setTrendingProducts: (products: Product[]) => void
  setCurrentProduct: (product: Product | null) => void
  setFilters: (filters: ProductFilters) => void
  setSearchQuery: (query: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearFilters: () => void
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  fetchProductById: (id: string) => Promise<void>
  searchProducts: (query: string) => Promise<void>
}

const defaultFilters: ProductFilters = {
  sortBy: 'popularity',
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  trendingProducts: [],
  currentProduct: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  searchQuery: '',

  setProducts: (products) => {
    set({ products })
  },

  setFeaturedProducts: (products) => {
    set({ featuredProducts: products })
  },

  setTrendingProducts: (products) => {
    set({ trendingProducts: products })
  },

  setCurrentProduct: (product) => {
    set({ currentProduct: product })
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
  },

  setLoading: (loading) => {
    set({ isLoading: loading })
  },

  setError: (error) => {
    set({ error })
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
  },

  fetchProducts: async (filters?: ProductFilters) => {
    const { setLoading, setError, setProducts } = get()
    
    try {
      setLoading(true)
      setError(null)
      
      // Apply filters if provided
      if (filters) {
        set({ filters: { ...get().filters, ...filters } })
      }
      
      // TODO: Implement actual API call
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const mockProducts: Product[] = [
        {
          id: '1',
          name: '高級辦公椅',
          description: '符合人體工學設計，長時間工作也不累',
          category: '辦公家具',
          basePrice: 2999,
          currentPrice: 2499,
          originalPrice: 3999,
          images: ['https://example.com/chair1.jpg'],
          stock: 50,
          soldCount: 120,
          targetCount: 200,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
          priceTiers: [
            { quantity: 50, price: 2499, discount: 17 },
            { quantity: 100, price: 2299, discount: 23 },
            { quantity: 200, price: 1999, discount: 33 },
          ],
          tags: ['辦公', '家具', '人體工學'],
          rating: 4.5,
          reviewCount: 89,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15',
        },
        {
          id: '2',
          name: '無線鍵盤滑鼠組',
          description: '2.4GHz無線連接，超長電池壽命',
          category: '電腦周邊',
          basePrice: 1299,
          currentPrice: 999,
          originalPrice: 1599,
          images: ['https://example.com/keyboard1.jpg'],
          stock: 100,
          soldCount: 85,
          targetCount: 150,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
          priceTiers: [
            { quantity: 30, price: 999, discount: 23 },
            { quantity: 60, price: 899, discount: 31 },
            { quantity: 100, price: 799, discount: 39 },
          ],
          tags: ['電腦', '周邊', '無線'],
          rating: 4.2,
          reviewCount: 45,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-10',
        },
      ]
      
      setProducts(mockProducts)
    } catch (error) {
      setError('取得商品列表時發生錯誤')
      console.error('Fetch products error:', error)
    } finally {
      setLoading(false)
    }
  },

  fetchProductById: async (id: string) => {
    const { setLoading, setError, setCurrentProduct } = get()
    
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Implement actual API call
      // For now, return mock data
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockProduct: Product = {
        id,
        name: '高級辦公椅',
        description: '符合人體工學設計，長時間工作也不累。採用高品質網布材質，透氣舒適。可調節椅背高度和扶手角度，適合各種體型。',
        category: '辦公家具',
        basePrice: 2999,
        currentPrice: 2499,
        originalPrice: 3999,
        images: [
          'https://example.com/chair1.jpg',
          'https://example.com/chair2.jpg',
          'https://example.com/chair3.jpg',
        ],
        stock: 50,
        soldCount: 120,
        targetCount: 200,
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        variants: [
          { id: '1', name: '黑色', price: 2499, stock: 20, sku: 'CHAIR-BLACK' },
          { id: '2', name: '灰色', price: 2599, stock: 15, sku: 'CHAIR-GRAY' },
          { id: '3', name: '藍色', price: 2699, stock: 15, sku: 'CHAIR-BLUE' },
        ],
        priceTiers: [
          { quantity: 50, price: 2499, discount: 17 },
          { quantity: 100, price: 2299, discount: 23 },
          { quantity: 200, price: 1999, discount: 33 },
        ],
        tags: ['辦公', '家具', '人體工學', '舒適', '可調節'],
        rating: 4.5,
        reviewCount: 89,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15',
      }
      
      setCurrentProduct(mockProduct)
    } catch (error) {
      setError('取得商品詳情時發生錯誤')
      console.error('Fetch product by id error:', error)
    } finally {
      setLoading(false)
    }
  },

  searchProducts: async (query: string) => {
    const { setLoading, setError, setProducts, setSearchQuery } = get()
    
    try {
      setLoading(true)
      setError(null)
      setSearchQuery(query)
      
      // TODO: Implement actual API search
      // For now, filter mock data
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockProducts: Product[] = [
        {
          id: '1',
          name: '高級辦公椅',
          description: '符合人體工學設計，長時間工作也不累',
          category: '辦公家具',
          basePrice: 2999,
          currentPrice: 2499,
          originalPrice: 3999,
          images: ['https://example.com/chair1.jpg'],
          stock: 50,
          soldCount: 120,
          targetCount: 200,
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          isActive: true,
          priceTiers: [
            { quantity: 50, price: 2499, discount: 17 },
            { quantity: 100, price: 2299, discount: 23 },
            { quantity: 200, price: 1999, discount: 33 },
          ],
          tags: ['辦公', '家具', '人體工學'],
          rating: 4.5,
          reviewCount: 89,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-15',
        },
      ]
      
      // Simple search filter
      const filteredProducts = mockProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )
      
      setProducts(filteredProducts)
    } catch (error) {
      setError('搜尋商品時發生錯誤')
      console.error('Search products error:', error)
    } finally {
      setLoading(false)
    }
  },
}))

// Selector hooks
export const useProducts = () => useProductStore((state) => state.products)
export const useFeaturedProducts = () => useProductStore((state) => state.featuredProducts)
export const useTrendingProducts = () => useProductStore((state) => state.trendingProducts)
export const useCurrentProduct = () => useProductStore((state) => state.currentProduct)
export const useProductFilters = () => useProductStore((state) => state.filters)
export const useProductIsLoading = () => useProductStore((state) => state.isLoading)
export const useProductError = () => useProductStore((state) => state.error)
export const useSearchQuery = () => useProductStore((state) => state.searchQuery)