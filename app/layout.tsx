import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NavBar from "@/components/NavBar";
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
  title: "SnapPrint",
  description: "Income, expenses, and invoices for your 3D printing business.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SnapPrint",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a78d6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f9f9f7] dark:bg-[#0d0d0d]">
        <NavBar />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
