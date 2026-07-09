import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import FloatingWidgets from "@/components/shared/FloatingWidgets";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BimaOS — Insurance for Every African",
  description:
    "Open insurance infrastructure for Africa. Get covered via USSD in under 3 minutes. AI-powered claims, blockchain trust, M-Pesa payouts.",
  keywords: [
    "insurance",
    "Africa",
    "USSD",
    "microinsurance",
    "bima",
    "fintech",
    "insurtech",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const FOUC_SCRIPT = `(function(){try{var t=localStorage.getItem('bimaos-theme')||'system';var r=t==='system'?(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'):t;document.documentElement.classList.toggle('dark',r==='dark')}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script id="fouc-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
          <FloatingWidgets />
        </ThemeProvider>
      </body>
    </html>
  );
}

