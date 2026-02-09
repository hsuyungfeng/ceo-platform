import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface NotificationPreferences {
  orderUpdates: boolean
  priceDrops: boolean
  groupBuyProgress: boolean
  marketing: boolean
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'zh-TW' | 'en'
  currency: 'TWD' | 'USD'
  notifications: NotificationPreferences
  biometricAuth: boolean
  autoSync: boolean
}

export interface PreferencesState extends AppPreferences {
  // Actions
  setTheme: (theme: AppPreferences['theme']) => void
  setLanguage: (language: AppPreferences['language']) => void
  setCurrency: (currency: AppPreferences['currency']) => void
  setNotificationPreference: (key: keyof NotificationPreferences, value: boolean) => void
  setBiometricAuth: (enabled: boolean) => void
  setAutoSync: (enabled: boolean) => void
  resetPreferences: () => void
}

const defaultPreferences: AppPreferences = {
  theme: 'system',
  language: 'zh-TW',
  currency: 'TWD',
  notifications: {
    orderUpdates: true,
    priceDrops: true,
    groupBuyProgress: true,
    marketing: false,
  },
  biometricAuth: false,
  autoSync: true,
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...defaultPreferences,

      setTheme: (theme) => {
        set({ theme })
      },

      setLanguage: (language) => {
        set({ language })
      },

      setCurrency: (currency) => {
        set({ currency })
      },

      setNotificationPreference: (key, value) => {
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        }))
      },

      setBiometricAuth: (enabled) => {
        set({ biometricAuth: enabled })
      },

      setAutoSync: (enabled) => {
        set({ autoSync: enabled })
      },

      resetPreferences: () => {
        set(defaultPreferences)
      },
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

// Selector hooks
export const useTheme = () => usePreferencesStore((state) => state.theme)
export const useLanguage = () => usePreferencesStore((state) => state.language)
export const useCurrency = () => usePreferencesStore((state) => state.currency)
export const useNotifications = () => usePreferencesStore((state) => state.notifications)
export const useBiometricAuth = () => usePreferencesStore((state) => state.biometricAuth)
export const useAutoSync = () => usePreferencesStore((state) => state.autoSync)