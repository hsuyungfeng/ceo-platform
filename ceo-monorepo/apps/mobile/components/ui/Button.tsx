import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onPress,
  variant = "default",
  size = "default",
  loading = false,
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseClasses = "rounded-xl items-center justify-center";
  
  const variantClasses = {
    default: "bg-blue-600",
    outline: "bg-transparent border border-gray-300",
    ghost: "bg-transparent",
    destructive: "bg-red-600",
  };

  const sizeClasses = {
    default: "px-6 py-3",
    sm: "px-4 py-2",
    lg: "px-8 py-4",
  };

  const textClasses = {
    default: "text-white font-medium",
    outline: "text-gray-700 font-medium",
    ghost: "text-gray-700 font-medium",
    destructive: "text-white font-medium",
  };

  const sizeTextClasses = {
    default: "text-base",
    sm: "text-sm",
    lg: "text-lg",
  };

  const disabledClasses = disabled || loading ? "opacity-50" : "";

  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? "#374151" : "#ffffff"}
        />
      ) : (
        <Text className={`${textClasses[variant]} ${sizeTextClasses[size]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}