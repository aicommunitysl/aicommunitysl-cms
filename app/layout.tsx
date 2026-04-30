import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";

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
  title: "aicommunitysl | CMS",
  description: "Official content management system for AI Community Sri Lanka.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Background Gradients - matching the website */}
          <div className="fixed inset-0 -z-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl transform -translate-y-1/2 -translate-x-1/4"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl transform translate-y-1/4 translate-x-1/4"></div>
          </div>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--card)",
                color: "var(--card-foreground)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "0.875rem",
                fontFamily: "var(--font-geist-sans)",
              },
              success: {
                iconTheme: {
                  primary: "var(--primary)",
                  secondary: "var(--primary-foreground)",
                },
              },
              error: {
                iconTheme: {
                  primary: "var(--destructive)",
                  secondary: "var(--destructive-foreground)",
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
