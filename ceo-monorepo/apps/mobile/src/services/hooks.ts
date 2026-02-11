import { useEffect } from 'react'
import { useApiWithNetwork, usePaginatedApiWithNetwork, useMutationWithNetwork } from '@ceo/api-client'
import { apiService } from './api'

const apiClient = apiService.getClient()

export function useHomeData() {
  const { execute, ...rest } = useApiWithNetwork<any>({
    client: apiClient,
  })

  useEffect(() => {
    execute('get', '/api/home')
  }, [execute])

  return {
    ...rest,
    refetch: () => execute('get', '/api/home'),
  }
}

export function useFeaturedProducts() {
  const { execute, ...rest } = useApiWithNetwork<any[]>({
    client: apiClient,
    initialData: [],
  })

  useEffect(() => {
    execute('get', '/api/products/featured')
  }, [execute])

  return {
    ...rest,
    refetch: () => execute('get', '/api/products/featured'),
  }
}

export function useLatestProducts() {
  const { execute, ...rest } = useApiWithNetwork<any[]>({
    client: apiClient,
    initialData: [],
  })

  useEffect(() => {
    execute('get', '/api/products/latest')
  }, [execute])

  return {
    ...rest,
    refetch: () => execute('get', '/api/products/latest'),
  }
}

export function useCategories() {
  const { execute, ...rest } = useApiWithNetwork<any[]>({
    client: apiClient,
    initialData: [],
  })

  useEffect(() => {
    execute('get', '/api/categories')
  }, [execute])

  return {
    ...rest,
    refetch: () => execute('get', '/api/categories'),
  }
}

export function useProducts(params?: {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const api = usePaginatedApiWithNetwork<any>({
    client: apiClient,
    initialParams: {
      page: 1,
      limit: 20,
      ...params,
    },
  })

  useEffect(() => {
    if (api.params) {
      api.fetchData('/api/products', api.params)
    }
  }, [api.params])

  return api
}

export function useProduct(id: string) {
  const { execute, ...rest } = useApiWithNetwork<any>({
    client: apiClient,
  })

  useEffect(() => {
    if (id) {
      execute('get', `/api/products/${id}`)
    }
  }, [id, execute])

  return {
    ...rest,
    refetch: () => execute('get', `/api/products/${id}`),
  }
}

export function useCart() {
  const { execute, ...rest } = useApiWithNetwork<any>({
    client: apiClient,
  })

  useEffect(() => {
    execute('get', '/api/cart')
  }, [execute])

  return {
    ...rest,
    refetch: () => execute('get', '/api/cart'),
  }
}

export function useAddToCart() {
  return useMutationWithNetwork<any, { productId: string; quantity: number }>({
    client: apiClient,
    onSuccess: () => {
      console.log('成功加入購物車')
    },
  })
}

export function useUpdateCartItem() {
  return useMutationWithNetwork<any, { itemId: string; quantity: number }>({
    client: apiClient,
    onSuccess: () => {
      console.log('成功更新購物車項目')
    },
  })
}

export function useRemoveCartItem() {
  return useMutationWithNetwork<any, { itemId: string }>({
    client: apiClient,
    onSuccess: () => {
      console.log('成功移除購物車項目')
    },
  })
}

export function useOrders(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  const api = usePaginatedApiWithNetwork<any>({
    client: apiClient,
    initialParams: {
      page: 1,
      limit: 10,
      ...params,
    },
  })

  useEffect(() => {
    if (api.params) {
      api.fetchData('/api/orders', api.params)
    }
  }, [api.params])

  return api
}

export function useOrder(id: string) {
  const { execute, ...rest } = useApiWithNetwork<any>({
    client: apiClient,
  })

  useEffect(() => {
    if (id) {
      execute('get', `/api/orders/${id}`)
    }
  }, [id, execute])

  return {
    ...rest,
    refetch: () => execute('get', `/api/orders/${id}`),
  }
}

export function useCreateOrder() {
  return useMutationWithNetwork<any, {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: any
    paymentMethod: string
  }>({
    client: apiClient,
    onSuccess: () => {
      console.log('成功建立訂單')
    },
  })
}

export function useUserProfile() {
  const { execute, ...rest } = useApiWithNetwork<any>({
    client: apiClient,
  })

  useEffect(() => {
    execute('get', '/api/user/profile')
  }, [execute])

  return {
    ...rest,
    refetch: () => execute('get', '/api/user/profile'),
  }
}

export function useUpdateUserProfile() {
  return useMutationWithNetwork<any, any>({
    client: apiClient,
    onSuccess: () => {
      console.log('成功更新用戶資料')
    },
  })
}

export function useNotifications(params?: {
  page?: number
  limit?: number
  read?: boolean
}) {
  const api = usePaginatedApiWithNetwork<any>({
    client: apiClient,
    initialParams: {
      page: 1,
      limit: 20,
      ...params,
    },
  })

  useEffect(() => {
    if (api.params) {
      api.fetchData('/api/notifications', api.params)
    }
  }, [api.params])

  return api
}

export function useMarkNotificationAsRead() {
  return useMutationWithNetwork<any, { id: string }>({
    client: apiClient,
    onSuccess: () => {
      console.log('成功標記通知為已讀')
    },
  })
}

export function useSearchProducts() {
  const api = usePaginatedApiWithNetwork<any>({
    client: apiClient,
    initialParams: {
      page: 1,
      limit: 20,
    },
  })

  const search = (query: string, params?: {
    page?: number
    limit?: number
    categoryId?: string
  }) => {
    return api.fetchData('/api/products/search', {
      q: query,
      ...params,
    })
  }

  return {
    ...api,
    search,
  }
}

export function useGroupBuyProducts() {
  const { execute, ...rest } = useApiWithNetwork<any[]>({
    client: apiClient,
    initialData: [],
  })

  useEffect(() => {
    execute('get', '/api/products/group-buy')
  }, [execute])

  return {
    ...rest,
    refetch: () => execute('get', '/api/products/group-buy'),
  }
}

export function useGroupBuyProduct(id: string) {
  const { execute, ...rest } = useApiWithNetwork<any>({
    client: apiClient,
  })

  useEffect(() => {
    if (id) {
      execute('get', `/api/products/group-buy/${id}`)
    }
  }, [id, execute])

  return {
    ...rest,
    refetch: () => execute('get', `/api/products/group-buy/${id}`),
  }
}

export function useJoinGroupBuy() {
  return useMutationWithNetwork<any, { productId: string; quantity: number }>({
    client: apiClient,
    onSuccess: () => {
      console.log('成功加入團購')
    },
  })
}

export function useApiClient() {
  return apiClient
}

export function useApiService() {
  return apiService
}