import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  User,
  ArrowLeft,
} from "lucide-react-native";
import { AppleSignInButton } from "../../src/components/auth/AppleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  };

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  const handleRegister = () => {
    router.push("/(auth)/register");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-6 pt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-gray-900 mt-6">
              歡迎回來
            </Text>
            <Text className="text-gray-600 mt-2">
              登入您的 CEO 團購帳號
            </Text>
          </View>

          {/* Login Method Toggle */}
          <View className="mx-6 mt-8">
            <View className="flex-row bg-gray-100 rounded-xl p-1">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${loginMethod === "email" ? "bg-white shadow-sm" : ""}`}
                onPress={() => setLoginMethod("email")}
              >
                <Text
                  className={`text-center font-medium ${loginMethod === "email" ? "text-blue-600" : "text-gray-600"}`}
                >
                  電子郵件登入
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${loginMethod === "phone" ? "bg-white shadow-sm" : ""}`}
                onPress={() => setLoginMethod("phone")}
              >
                <Text
                  className={`text-center font-medium ${loginMethod === "phone" ? "text-blue-600" : "text-gray-600"}`}
                >
                  手機號碼登入
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Login Form */}
          <View className="px-6 mt-8">
            {loginMethod === "email" ? (
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    電子郵件
                  </Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Mail size={20} className="text-gray-400" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      placeholder="example@email.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">密碼</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Lock size={20} className="text-gray-400" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      placeholder="請輸入密碼"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-gray-400" />
                      ) : (
                        <Eye size={20} className="text-gray-400" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <View className="space-y-4">
                <View>
                  <Text className="text-gray-700 font-medium mb-2">
                    手機號碼
                  </Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Smartphone size={20} className="text-gray-400" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      placeholder="0912-345-678"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-gray-700 font-medium mb-2">密碼</Text>
                  <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <Lock size={20} className="text-gray-400" />
                    <TextInput
                      className="flex-1 ml-3 text-gray-900"
                      placeholder="請輸入密碼"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff size={20} className="text-gray-400" />
                      ) : (
                        <Eye size={20} className="text-gray-400" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={handleForgotPassword}
              className="self-end mt-3"
            >
              <Text className="text-blue-600 font-medium">忘記密碼？</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`mt-8 py-4 rounded-xl ${isLoading ? "bg-blue-400" : "bg-blue-600"}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-center text-white font-bold text-lg">
                {isLoading ? "登入中..." : "登入"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-500">或</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login */}
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3">
                <Text className="text-gray-700 font-medium">使用 Google 登入</Text>
              </TouchableOpacity>
              <AppleSignInButton />
              <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3">
                <Text className="text-gray-700 font-medium">使用 LINE 登入</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-8 mb-12">
              <Text className="text-gray-600">還沒有帳號？</Text>
              <TouchableOpacity onPress={handleRegister} className="ml-2">
                <Text className="text-blue-600 font-medium">立即註冊</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}