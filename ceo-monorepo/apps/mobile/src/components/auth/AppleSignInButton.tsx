import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert, Platform } from 'react-native';
import { Apple } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { router } from 'expo-router';
import appleAuth from '@invertase/react-native-apple-authentication';

export function AppleSignInButton() {
  const { signInWithApple, isLoading, error, clearError } = useAuthStore();
  const [isAppleSignInAvailable, setIsAppleSignInAvailable] = React.useState(false);

  React.useEffect(() => {
    // Check if Apple Sign-In is available on this device
    const checkAppleSignInAvailability = async () => {
      try {
        const isSupported = appleAuth.isSupported;
        setIsAppleSignInAvailable(isSupported);
      } catch (err) {
        console.error('檢查 Apple 登入支援時發生錯誤:', err);
        setIsAppleSignInAvailable(false);
      }
    };

    checkAppleSignInAvailability();
  }, []);

  const handleAppleSignIn = async () => {
    try {
      clearError();
      const result = await signInWithApple();
      
      if (result?.requiresRegistration) {
        // Navigate to registration screen with OAuth data
        router.push(`/(auth)/register?oauthId=${result.tempOAuthId}&email=${encodeURIComponent(result.email || '')}&name=${encodeURIComponent(result.name || '')}&provider=apple`);
      } else {
        // Successful login, navigate to home
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Apple Sign-In error:', error);
      // Error is already set in the store
    }
  };

  // Show error alert if there's an error
  React.useEffect(() => {
    if (error) {
      Alert.alert('登入錯誤', error, [{ text: '確定', onPress: clearError }]);
    }
  }, [error]);

  // Don't render the button if Apple Sign-In is not available
  if (!isAppleSignInAvailable && Platform.OS !== 'ios') {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleAppleSignIn}
      disabled={isLoading}
    >
      <View style={styles.iconContainer}>
        <Apple size={20} color="#000" />
      </View>
      <Text style={styles.text}>
        {isLoading ? '登入中...' : '使用 Apple 帳戶登入'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});