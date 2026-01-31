import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invofy - Modern Invoice Management",
  description: "Simplify your billing with Invofy. Create, manage, and track invoices with ease.",
  icons: {
    icon: "/favicon.jpg",
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import NextAuthSessionProvider from "@/components/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthSessionProvider>
            {children}
            <Toaster />
            <Analytics />
          </NextAuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
