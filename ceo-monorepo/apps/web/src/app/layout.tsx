import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SonnerToaster } from '@/components/ui/sonner';
import AuthProvider from '@/components/auth-provider';
import { WebSocketProvider } from '@/contexts/websocket-context';
import { ThemeProvider } from '@/contexts/theme-context';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CEO 團購電商平台",
  description: "專業的醫療機構團購平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <WebSocketProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <SonnerToaster />
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
