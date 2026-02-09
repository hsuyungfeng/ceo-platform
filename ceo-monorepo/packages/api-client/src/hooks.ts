import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiResponse, PaginatedResponse } from '@ceo/shared'
import { apiClient, ApiClient, ReactNativeApiClient } from './client'

export interface UseApiOptions<T> {
  client?: ApiClient | ReactNativeApiClient
  initialData?: T | null
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

export function useApi<T>(options: UseApiOptions<T> = {}) {
  const {
    client = apiClient,
    initialData = null,
    enabled = true,
    onSuccess,
    onError,
  } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const execute = useCallback(
    async (
      method: 'get' | 'post' | 'put' | 'patch' | 'delete',
      endpoint: string,
      payload?: any,
      requestOptions?: RequestInit
    ): Promise<ApiResponse<T>> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setLoading(true)
      setError(null)

      try {
        const options = {
          ...requestOptions,
          signal,
        }

        const response = await client[method]<T>(endpoint, payload, options)
        
        if (response.success) {
          setData(response.data as T)
          onSuccess?.(response.data as T)
        } else {
          setError(response.error || '請求失敗')
          onError?.(response.error || '請求失敗')
        }
        
        return response
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return {
            success: false,
            error: '請求已取消',
          }
        }

        const errorMessage = err instanceof Error ? err.message : '請求失敗'
        setError(errorMessage)
        onError?.(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [client, onSuccess, onError]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    cancel,
    setData,
    setError,
  }
}

export interface UsePaginatedApiOptions<T> {
  client?: ApiClient | ReactNativeApiClient
  initialData?: PaginatedResponse<T> | null
  initialParams?: Record<string, any>
  onSuccess?: (data: PaginatedResponse<T>) => void
  onError?: (error: string) => void
}

export function usePaginatedApi<T>(options: UsePaginatedApiOptions<T> = {}) {
  const {
    client = apiClient,
    initialData = null,
    initialParams = {},
    onSuccess,
    onError,
  } = options

  const [data, setData] = useState<PaginatedResponse<T> | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<Record<string, any>>(initialParams)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(
    async (
      endpoint: string,
      fetchParams?: Record<string, any>,
      requestOptions?: RequestInit
    ): Promise<ApiResponse<PaginatedResponse<T>>> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setLoading(true)
      setError(null)

      try {
        const mergedParams = { ...params, ...fetchParams }
        setParams(mergedParams)

        const options = {
          ...requestOptions,
          signal,
        }

        const response = await client.getPaginated<T>(endpoint, mergedParams, options)
        
        if (response.success) {
          setData(response.data as PaginatedResponse<T>)
          onSuccess?.(response.data as PaginatedResponse<T>)
        } else {
          setError(response.error || '請求失敗')
          onError?.(response.error || '請求失敗')
        }
        
        return response
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return {
            success: false,
            error: '請求已取消',
          }
        }

        const errorMessage = err instanceof Error ? err.message : '請求失敗'
        setError(errorMessage)
        onError?.(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [client, params, onSuccess, onError]
  )

  const loadMore = useCallback(
    async (
      endpoint: string,
      requestOptions?: RequestInit
    ): Promise<ApiResponse<PaginatedResponse<T>>> => {
      if (!data || !data.pagination.hasNextPage) {
        return {
          success: false,
          error: '沒有更多資料',
        }
      }

      const nextPage = data.pagination.page + 1
      const nextParams = { ...params, page: nextPage }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setLoading(true)

      try {
        const options = {
          ...requestOptions,
          signal,
        }

        const response = await client.getPaginated<T>(endpoint, nextParams, options)
        
        if (response.success) {
          const newData = response.data as PaginatedResponse<T>
          setData({
            ...newData,
            data: [...data.data, ...newData.data],
          })
          setParams(nextParams)
          onSuccess?.(newData)
        } else {
          setError(response.error || '請求失敗')
          onError?.(response.error || '請求失敗')
        }
        
        return response
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return {
            success: false,
            error: '請求已取消',
          }
        }

        const errorMessage = err instanceof Error ? err.message : '請求失敗'
        setError(errorMessage)
        onError?.(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [client, data, params, onSuccess, onError]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(initialData)
    setParams(initialParams)
    setError(null)
    cancel()
  }, [initialData, initialParams, cancel])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    params,
    fetchData,
    loadMore,
    cancel,
    reset,
    setData,
    setError,
    setParams,
  }
}

export interface UseMutationOptions<T, P = any> {
  client?: ApiClient | ReactNativeApiClient
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
  onMutate?: (variables: P) => void
}

export function useMutation<T, P = any>(options: UseMutationOptions<T, P> = {}) {
  const {
    client = apiClient,
    onSuccess,
    onError,
    onMutate,
  } = options

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const mutate = useCallback(
    async (
      method: 'post' | 'put' | 'patch' | 'delete',
      endpoint: string,
      payload?: P,
      requestOptions?: RequestInit
    ): Promise<ApiResponse<T>> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setLoading(true)
      setError(null)
      onMutate?.(payload as P)

      try {
        const options = {
          ...requestOptions,
          signal,
        }

        const response = await client[method]<T>(endpoint, payload, options)
        
        if (response.success) {
          setData(response.data as T)
          onSuccess?.(response.data as T)
        } else {
          setError(response.error || '請求失敗')
          onError?.(response.error || '請求失敗')
        }
        
        return response
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return {
            success: false,
            error: '請求已取消',
          }
        }

        const errorMessage = err instanceof Error ? err.message : '請求失敗'
        setError(errorMessage)
        onError?.(errorMessage)
        return {
          success: false,
          error: errorMessage,
        }
      } finally {
        setLoading(false)
        abortControllerRef.current = null
      }
    },
    [client, onSuccess, onError, onMutate]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    cancel()
  }, [cancel])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    mutate,
    cancel,
    reset,
    setData,
    setError,
  }
}