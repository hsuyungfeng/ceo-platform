import { TextInput, View, Text, TouchableOpacity } from "react-native";
import { ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  icon?: ReactNode;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad"
    | "decimal-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  disabled?: boolean;
  className?: string;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  showPasswordToggle = false,
  icon,
  keyboardType = "default",
  autoCapitalize = "none",
  disabled = false,
  className = "",
}: InputProps) {
  const [showPassword, setShowPassword] = useState(secureTextEntry);

  const baseClasses = "border rounded-xl px-4 py-3 flex-row items-center";
  const stateClasses = error
    ? "border-red-300 bg-red-50"
    : disabled
    ? "border-gray-200 bg-gray-100"
    : "border-gray-200 bg-gray-50";

  return (
    <View className={className}>
      {label && (
        <Text className="text-gray-700 font-medium mb-2">{label}</Text>
      )}
      <View className={`${baseClasses} ${stateClasses}`}>
        {icon && <View className="mr-3">{icon}</View>}
        <TextInput
          className="flex-1 text-gray-900"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={showPasswordToggle ? !showPassword : secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          selectTextOnFocus={!disabled}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-3"
          >
            {showPassword ? (
              <EyeOff size={20} className="text-gray-400" />
            ) : (
              <Eye size={20} className="text-gray-400" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
}

// Need to add useState import
import { useState } from "react";