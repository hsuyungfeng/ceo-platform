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
import { Mail, Smartphone, ArrowLeft, CheckCircle } from "lucide-react-native";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email");
  const [step, setStep] = useState<"input" | "success">("input");

  const handleSendResetLink = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
    }, 1500);
  };

  const handleBackToLogin = () => {
    router.push("/(auth)/login");
  };

  if (step === "success") {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-6 pt-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-6 py-12">
            <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-8">
              <CheckCircle size={48} className="text-green-600" />
            </View>

            <Text className="text-2xl font-bold text-gray-900 text-center">
              重設連結已發送
            </Text>
            <Text className="text-gray-600 text-center mt-3 leading-6">
              我們已將密碼重設連結發送至您的{" "}
              {resetMethod === "email" ? "電子郵件" : "手機"}
            </Text>
            <Text className="text-gray-600 text-center mt-1">
              {resetMethod === "email" ? email : "0912-345-678"}
            </Text>

            <Text className="text-gray-500 text-sm text-center mt-6">
              請檢查您的收件匣（包含垃圾郵件資料夾）
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-1">
              連結將在 24 小時內有效
            </Text>

            <TouchableOpacity
              className="mt-8 bg-blue-600 py-4 rounded-xl w-full"
              onPress={handleBackToLogin}
            >
              <Text className="text-center text-white font-bold text-lg">
                返回登入
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 border border-gray-300 py-4 rounded-xl w-full"
              onPress={() => {
                setStep("input");
                setIsLoading(false);
              }}
            >
              <Text className="text-center text-gray-700 font-medium">
                重新發送連結
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
              忘記密碼
            </Text>
            <Text className="text-gray-600 mt-2">
              請輸入您的帳號資訊，我們將發送重設連結給您
            </Text>
          </View>

          {/* Reset Method Toggle */}
          <View className="mx-6 mt-8">
            <View className="flex-row bg-gray-100 rounded-xl p-1">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${resetMethod === "email" ? "bg-white shadow-sm" : ""}`}
                onPress={() => setResetMethod("email")}
              >
                <Text
                  className={`text-center font-medium ${resetMethod === "email" ? "text-blue-600" : "text-gray-600"}`}
                >
                  電子郵件
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${resetMethod === "phone" ? "bg-white shadow-sm" : ""}`}
                onPress={() => setResetMethod("phone")}
              >
                <Text
                  className={`text-center font-medium ${resetMethod === "phone" ? "text-blue-600" : "text-gray-600"}`}
                >
                  手機號碼
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Input Form */}
          <View className="px-6 mt-8">
            {resetMethod === "email" ? (
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
            ) : (
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
            )}

            {/* Instructions */}
            <View className="mt-6 p-4 bg-blue-50 rounded-xl">
              <Text className="text-blue-800 font-medium mb-1">
                重設密碼說明：
              </Text>
              <Text className="text-blue-700 text-sm">
                1. 輸入您的{resetMethod === "email" ? "電子郵件" : "手機號碼"}
              </Text>
              <Text className="text-blue-700 text-sm">
                2. 我們將發送重設連結至您的帳號
              </Text>
              <Text className="text-blue-700 text-sm">
                3. 點擊連結設定新密碼
              </Text>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              className={`mt-8 py-4 rounded-xl ${isLoading ? "bg-blue-400" : "bg-blue-600"}`}
              onPress={handleSendResetLink}
              disabled={isLoading}
            >
              <Text className="text-center text-white font-bold text-lg">
                {isLoading ? "發送中..." : "發送重設連結"}
              </Text>
            </TouchableOpacity>

            {/* Back to Login */}
            <TouchableOpacity
              className="mt-6 border border-gray-300 py-4 rounded-xl"
              onPress={handleBackToLogin}
            >
              <Text className="text-center text-gray-700 font-medium">
                返回登入
              </Text>
            </TouchableOpacity>

            {/* Contact Support */}
            <View className="mt-12 mb-12">
              <Text className="text-gray-500 text-center text-sm">
                遇到問題？請聯繫客服支援
              </Text>
              <Text className="text-blue-600 text-center font-medium mt-1">
                support@ceo-group.com
              </Text>
              <Text className="text-blue-600 text-center font-medium">
                0800-123-456
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}