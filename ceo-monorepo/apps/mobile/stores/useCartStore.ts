import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  maxQuantity?: number
  variant?: {
    id: string
    name: string
    price: number
  }
}

export interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
  isLoading: boolean
  error: string | null
  
  // Actions
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  syncWithServer: () => Promise<void>
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      isLoading: false,
      error: null,

      addItem: (itemData) => {
        const { items } = get()
        const existingItemIndex = items.findIndex(
          item => item.productId === itemData.productId && 
          item.variant?.id === itemData.variant?.id
        )

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...items]
          const existingItem = updatedItems[existingItemIndex]
          const newQuantity = existingItem.quantity + itemData.quantity
          const finalQuantity = itemData.maxQuantity 
            ? Math.min(newQuantity, itemData.maxQuantity)
            : newQuantity

          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: finalQuantity,
          }

          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          })
        } else {
          // Add new item
          const newItem: CartItem = {
            id: Date.now().toString(),
            ...itemData,
          }

          const updatedItems = [...items, newItem]
          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          })
        }
      },

      removeItem: (id) => {
        const { items } = get()
        const updatedItems = items.filter(item => item.id !== id)
        
        set({
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        })
      },

      updateQuantity: (id, quantity) => {
        const { items } = get()
        const itemIndex = items.findIndex(item => item.id === id)
        
        if (itemIndex >= 0) {
          const updatedItems = [...items]
          const item = updatedItems[itemIndex]
          
          // Check max quantity if specified
          const finalQuantity = item.maxQuantity 
            ? Math.min(Math.max(1, quantity), item.maxQuantity)
            : Math.max(1, quantity)
          
          updatedItems[itemIndex] = {
            ...item,
            quantity: finalQuantity,
          }

          set({
            items: updatedItems,
            totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          })
        }
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalAmount: 0,
        })
      },

      setLoading: (loading) => {
        set({ isLoading: loading })
      },

      setError: (error) => {
        set({ error })
      },

      syncWithServer: async () => {
        const { items, setLoading, setError } = get()
        
        try {
          setLoading(true)
          setError(null)
          
          // TODO: Implement actual API sync
          // For now, just simulate API call
          await new Promise(resolve => setTimeout(resolve, 500))
          
          console.log('Cart synced with server:', items)
        } catch (error) {
          setError('同步購物車時發生錯誤')
          console.error('Cart sync error:', error)
        } finally {
          setLoading(false)
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalAmount: state.totalAmount,
      }),
    }
  )
)

// Selector hooks for better performance
export const useCartItems = () => useCartStore((state) => state.items)
export const useCartTotalItems = () => useCartStore((state) => state.totalItems)
export const useCartTotalAmount = () => useCartStore((state) => state.totalAmount)
export const useCartIsLoading = () => useCartStore((state) => state.isLoading)
export const useCartError = () => useCartStore((state) => state.error)