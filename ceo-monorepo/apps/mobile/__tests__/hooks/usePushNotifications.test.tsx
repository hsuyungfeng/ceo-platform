import { renderHook, act } from '@testing-library/react-native';
import { usePushNotifications } from '../../src/hooks/usePushNotifications';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Mock dependencies
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
}));

jest.mock('../../stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

jest.mock('../../src/services/notification-api', () => ({
  notificationApi: {
    registerToken: jest.fn(),
    unregisterToken: jest.fn(),
  },
}));

describe('usePushNotifications', () => {
  const mockGetPermissionsAsync = Notifications.getPermissionsAsync as jest.Mock;
  const mockRequestPermissionsAsync = Notifications.requestPermissionsAsync as jest.Mock;
  const mockGetExpoPushTokenAsync = Notifications.getExpoPushTokenAsync as jest.Mock;
  const mockRegisterToken = jest.requireMock('../../src/services/notification-api').notificationApi.registerToken as jest.Mock;
  const mockUseAuthStore = jest.requireMock('../../stores/useAuthStore').useAuthStore as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthStore.mockReturnValue({ user: null });
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushTokenAsync.mockResolvedValue({ data: 'mock-expo-push-token' });
    mockRegisterToken.mockResolvedValue({});
  });

  it('requests permissions and gets token when permissions granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      // Wait for async effects
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockGetPermissionsAsync).toHaveBeenCalled();
    expect(mockRequestPermissionsAsync).not.toHaveBeenCalled();
    expect(mockGetExpoPushTokenAsync).toHaveBeenCalled();
    expect(result.current.expoPushToken).toBe('mock-expo-push-token');
  });

  it('requests permissions when not granted', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockGetPermissionsAsync).toHaveBeenCalled();
    expect(mockRequestPermissionsAsync).toHaveBeenCalled();
    expect(mockGetExpoPushTokenAsync).toHaveBeenCalled();
    expect(result.current.expoPushToken).toBe('mock-expo-push-token');
  });

  it('does not get token when permissions denied', async () => {
    mockGetPermissionsAsync.mockResolvedValue({ status: 'denied' });
    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockGetPermissionsAsync).toHaveBeenCalled();
    expect(mockRequestPermissionsAsync).toHaveBeenCalled();
    expect(mockGetExpoPushTokenAsync).not.toHaveBeenCalled();
    expect(result.current.expoPushToken).toBeNull();
  });

  it('registers token with backend when user is authenticated', async () => {
    const mockUser = { id: 'user123', email: 'test@example.com' };
    mockUseAuthStore.mockReturnValue({ user: mockUser });
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockRegisterToken).toHaveBeenCalledWith('mock-expo-push-token', Platform.OS === 'ios' ? 'IOS' : 'ANDROID', undefined);
    expect(result.current.registered).toBe(true);
  });

  it('does not register token when user is not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({ user: null });
    mockGetPermissionsAsync.mockResolvedValue({ status: 'granted' });
    
    const { result } = renderHook(() => usePushNotifications());
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(mockRegisterToken).not.toHaveBeenCalled();
    expect(result.current.registered).toBe(false);
  });
});