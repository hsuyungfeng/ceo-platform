import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AppleSignInButton } from '@/components/auth/AppleSignInButton';

// Mock dependencies
jest.mock('@/stores/useAuthStore', () => ({
  useAuthStore: jest.fn(),
}));

// Mock is already set up via moduleNameMapper in jest config

describe('AppleSignInButton', () => {
  const mockSignInWithApple = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementations
    const { useAuthStore } = require('@/stores/useAuthStore');
    useAuthStore.mockReturnValue({
      signInWithApple: mockSignInWithApple,
      isLoading: false,
      error: null,
      clearError: mockClearError,
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<AppleSignInButton />);
    expect(getByText('使用 Apple 帳戶登入')).toBeTruthy();
  });

  it('calls signInWithApple when pressed', async () => {
    mockSignInWithApple.mockResolvedValue({});

    const { getByText } = render(<AppleSignInButton />);
    fireEvent.press(getByText('使用 Apple 帳戶登入'));

    await waitFor(() => {
      expect(mockSignInWithApple).toHaveBeenCalled();
    });
  });

  it('shows loading state when isLoading is true', () => {
    const { useAuthStore } = require('@/stores/useAuthStore');
    useAuthStore.mockReturnValue({
      signInWithApple: mockSignInWithApple,
      isLoading: true,
      error: null,
      clearError: mockClearError,
    });

    const { getByText } = render(<AppleSignInButton />);
    expect(getByText('登入中...')).toBeTruthy();
  });

  it('navigates to registration when requiresRegistration is true', async () => {
    mockSignInWithApple.mockResolvedValue({
      requiresRegistration: true,
      tempOAuthId: 'temp-123',
      email: 'test@example.com',
      name: 'Test User',
    });

    const { router } = require('expo-router');
    const { getByText } = render(<AppleSignInButton />);
    
    fireEvent.press(getByText('使用 Apple 帳戶登入'));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(
        '/(auth)/register?oauthId=temp-123&email=test%40example.com&name=Test%20User&provider=apple'
      );
    });
  });

  it('navigates to home on successful login', async () => {
    mockSignInWithApple.mockResolvedValue({
      success: true,
      token: 'jwt-token',
      user: { id: 'user-123', name: 'Test User' },
    });

    const { router } = require('expo-router');
    const { getByText } = render(<AppleSignInButton />);
    
    fireEvent.press(getByText('使用 Apple 帳戶登入'));

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/(tabs)');
    });
  });

  it('handles errors from signInWithApple', async () => {
    mockSignInWithApple.mockRejectedValue(new Error('Sign in failed'));

    const { getByText } = render(<AppleSignInButton />);
    
    fireEvent.press(getByText('使用 Apple 帳戶登入'));

    await waitFor(() => {
      expect(mockSignInWithApple).toHaveBeenCalled();
    });
  });
});