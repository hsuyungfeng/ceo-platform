/// <reference types="nativewind/types" />

// Extend React Native types to include className prop
import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  
  interface TextProps {
    className?: string;
  }
  
  interface TextInputProps {
    className?: string;
  }
  
  interface ScrollViewProps {
    className?: string;
  }
  
  interface TouchableOpacityProps {
    className?: string;
  }
  
  interface KeyboardAvoidingViewProps {
    className?: string;
  }
  
  interface ImageProps {
    className?: string;
  }
  
  interface ActivityIndicatorProps {
    className?: string;
  }
}

// Extend lucide-react-native types
declare module 'lucide-react-native' {
  interface LucideProps {
    className?: string;
  }
}