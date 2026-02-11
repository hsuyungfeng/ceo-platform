import { View, Text } from "react-native";

interface BadgeProps {
  children: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "default",
  className = "",
}: BadgeProps) {
  const baseClasses = "rounded-full px-3 py-1 items-center justify-center";
  
  const variantClasses = {
    default: "bg-blue-100",
    secondary: "bg-gray-100",
    destructive: "bg-red-100",
    outline: "bg-transparent border border-gray-300",
  };

  const textClasses = {
    default: "text-blue-700",
    secondary: "text-gray-700",
    destructive: "text-red-700",
    outline: "text-gray-700",
  };

  const sizeTextClasses = {
    default: "text-sm",
    sm: "text-xs",
    lg: "text-base",
  };

  return (
    <View className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <Text className={`font-medium ${textClasses[variant]} ${sizeTextClasses[size]}`}>
        {children}
      </Text>
    </View>
  );
}