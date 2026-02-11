import { View, Text, TouchableOpacity } from "react-native";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <View className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </View>
  );
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <View className={`px-6 pt-6 ${className}`}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className = "" }: CardTitleProps) {
  return (
    <Text className={`text-xl font-bold text-gray-900 ${className}`}>
      {children}
    </Text>
  );
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return (
    <Text className={`text-gray-600 mt-1 ${className}`}>
      {children}
    </Text>
  );
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return (
    <View className={`px-6 py-4 ${className}`}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <View className={`px-6 pb-6 ${className}`}>
      {children}
    </View>
  );
}