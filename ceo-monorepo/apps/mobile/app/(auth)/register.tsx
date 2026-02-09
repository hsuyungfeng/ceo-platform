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
  Check,
} from "lucide-react-native";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = () => {
    if (!agreedToTerms) {
      alert("請同意服務條款與隱私政策");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("密碼與確認密碼不一致");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace("/(tabs)");
    }, 1500);
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
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
              建立新帳號
            </Text>
            <Text className="text-gray-600 mt-2">
              加入 CEO 團購，享受專屬優惠
            </Text>
          </View>

          {/* Registration Form */}
          <View className="px-6 mt-8 space-y-4">
            {/* Name */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">姓名</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <User size={20} className="text-gray-400" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="請輸入您的姓名"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange("name", value)}
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">電子郵件</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Mail size={20} className="text-gray-400" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange("email", value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">手機號碼</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Smartphone size={20} className="text-gray-400" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="0912-345-678"
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange("phone", value)}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">密碼</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Lock size={20} className="text-gray-400" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="請設定密碼（至少8位）"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange("password", value)}
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
              <Text className="text-gray-500 text-xs mt-1">
                密碼需包含至少8個字符，包含字母和數字
              </Text>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-gray-700 font-medium mb-2">確認密碼</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <Lock size={20} className="text-gray-400" />
                <TextInput
                  className="flex-1 ml-3 text-gray-900"
                  placeholder="請再次輸入密碼"
                  value={formData.confirmPassword}
                  onChangeText={(value) =>
                    handleInputChange("confirmPassword", value)
                  }
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} className="text-gray-400" />
                  ) : (
                    <Eye size={20} className="text-gray-400" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms Agreement */}
            <TouchableOpacity
              className="flex-row items-center mt-6"
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View
                className={`w-6 h-6 rounded-md border-2 ${agreedToTerms ? "bg-blue-600 border-blue-600" : "border-gray-300"} items-center justify-center`}
              >
                {agreedToTerms && <Check size={14} className="text-white" />}
              </View>
              <Text className="ml-3 text-gray-700 flex-1">
                我同意 CEO 團購的{" "}
                <Text className="text-blue-600">服務條款</Text> 與{" "}
                <Text className="text-blue-600">隱私政策</Text>
              </Text>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              className={`mt-8 py-4 rounded-xl ${isLoading || !agreedToTerms ? "bg-blue-400" : "bg-blue-600"}`}
              onPress={handleRegister}
              disabled={isLoading || !agreedToTerms}
            >
              <Text className="text-center text-white font-bold text-lg">
                {isLoading ? "註冊中..." : "註冊帳號"}
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="mx-4 text-gray-500">或</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Register */}
            <View className="space-y-3">
              <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3">
                <Text className="text-gray-700 font-medium">使用 Google 註冊</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3">
                <Text className="text-gray-700 font-medium">使用 Apple 註冊</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-3">
                <Text className="text-gray-700 font-medium">使用 LINE 註冊</Text>
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-8 mb-12">
              <Text className="text-gray-600">已經有帳號？</Text>
              <TouchableOpacity onPress={handleLogin} className="ml-2">
                <Text className="text-blue-600 font-medium">立即登入</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}