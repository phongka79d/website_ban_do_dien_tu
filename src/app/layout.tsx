import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ServiceWorkerManager from "@/components/ServiceWorkerManager";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "TSShop | Cửa hàng công nghệ",
  description: "Trải nghiệm mua sắm công nghệ hiện đại phong cách TSShop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full antialiased`}
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
