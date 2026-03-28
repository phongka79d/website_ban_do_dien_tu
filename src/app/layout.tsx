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
  title: "QuizLM Store | Cửa hàng công nghệ",
  description: "Trải nghiệm mua sắm công nghệ hiện đại phong cách QuizLM",
};

import ServiceWorkerManager from "@/components/ServiceWorkerManager";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <ServiceWorkerManager />
        <Header />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
