import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiService } from '../src/services/api'

export interface Notification {
  id: string
  title: string
  body: string
  data?: Record<string, any>
  read: boolean
  createdAt: string
}

export interface NotificationState {
  // State
  notifications: Notification[]
  unreadCount: number
  
  // Actions
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  fetchNotifications: (params?: { page?: number; limit?: number; read?: boolean }) => Promise<void>
  incrementUnreadCount: () => void
  decrementUnreadCount: () => void
  reset: () => void
}

const defaultState = {
  notifications: [],
  unreadCount: 0,
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      ...defaultState,

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.read).length
        set({ notifications, unreadCount })
      },

      addNotification: (notification) => {
        set((state) => {
          const notifications = [notification, ...state.notifications]
          const unreadCount = notification.read ? state.unreadCount : state.unreadCount + 1
          return { notifications, unreadCount }
        })
      },

      markAsRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
          const unreadCount = Math.max(0, state.unreadCount - 1)
          return { notifications, unreadCount }
        })
      },

      markAllAsRead: () => {
        set((state) => {
          const notifications = state.notifications.map(n => ({ ...n, read: true }))
          return { notifications, unreadCount: 0 }
        })
      },

      fetchNotifications: async (params) => {
        try {
          const response = await apiService.getNotifications(params)
          const notifications = response.data?.items || []
          const unreadCount = notifications.filter((n: Notification) => !n.read).length
          set({ notifications, unreadCount })
        } catch (error) {
          console.error('Failed to fetch notifications:', error)
        }
      },

      incrementUnreadCount: () => {
        set((state) => ({ unreadCount: state.unreadCount + 1 }))
      },

      decrementUnreadCount: () => {
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) }))
      },

      reset: () => {
        set(defaultState)
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)