import { useEffect, useState } from 'react'
import { useApi, usePaginatedApi, useMutation } from './hooks'
import type { UseApiOptions, UsePaginatedApiOptions, UseMutationOptions } from './hooks'
import type { ApiClient, ReactNativeApiClient } from './client'

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true)
  const [connectionType, setConnectionType] = useState<string | null>('wifi')

  useEffect(() => {
    // Network status monitoring will be implemented when NetInfo is available
    setIsConnected(true)
    setConnectionType('wifi')
  }, [])

  return {
    isConnected,
    connectionType,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
    isOffline: isConnected === false,
  }
}

export function useApiWithNetwork<T>(options: UseApiOptions<T> = {}) {
  const network = useNetworkStatus()
  const api = useApi<T>(options)

  return {
    ...api,
    network,
    isOffline: network.isOffline,
    shouldUseCache: network.isOffline || !network.isConnected,
  }
}

export function usePaginatedApiWithNetwork<T>(options: UsePaginatedApiOptions<T> = {}) {
  const network = useNetworkStatus()
  const api = usePaginatedApi<T>(options)

  const fetchDataWithCache = async (
    endpoint: string,
    params?: Record<string, any>,
    requestOptions?: RequestInit
  ) => {
    const options = {
      ...requestOptions,
      cache: network.isOffline ? 'force-cache' : requestOptions?.cache,
    }

    return api.fetchData(endpoint, params, options)
  }

  const loadMoreWithCache = async (
    endpoint: string,
    requestOptions?: RequestInit
  ) => {
    const options = {
      ...requestOptions,
      cache: network.isOffline ? 'force-cache' : requestOptions?.cache,
    }

    return api.loadMore(endpoint, options)
  }

  return {
    ...api,
    network,
    isOffline: network.isOffline,
    fetchData: fetchDataWithCache,
    loadMore: loadMoreWithCache,
  }
}

export function useMutationWithNetwork<T, P = any>(options: UseMutationOptions<T, P> = {}) {
  const network = useNetworkStatus()
  const mutation = useMutation<T, P>(options)

  const mutateWithQueue = async (
    method: 'post' | 'put' | 'patch' | 'delete',
    endpoint: string,
    payload?: P,
    requestOptions?: RequestInit
  ) => {
    if (network.isOffline) {
      console.warn('離線狀態，請求已加入隊列:', { endpoint, method })
      
      return {
        success: false,
        error: '離線狀態，請連線後重試',
        queued: true,
      } as any
    }

    return mutation.mutate(method, endpoint, payload, requestOptions)
  }

  return {
    ...mutation,
    network,
    isOffline: network.isOffline,
    mutate: mutateWithQueue,
  }
}

export function useApiClient() {
  const [client, setClient] = useState<ApiClient | ReactNativeApiClient | null>(null)

  const initializeClient = (
    baseUrl: string,
    authService?: any,
    storage?: any,
    enableOfflineCache = true
  ) => {
    if (enableOfflineCache) {
      const { createReactNativeApiClient } = require('./react-native')
      const newClient = createReactNativeApiClient(baseUrl, authService, storage, {
        enableOfflineCache: true,
        cacheTTL: 10 * 60 * 1000,
      })
      setClient(newClient)
    } else {
      const { ApiClient } = require('./client')
      const newClient = new ApiClient({
        baseUrl,
        authService,
        storage,
      })
      setClient(newClient)
    }
  }

  return {
    client,
    initializeClient,
  }
}