"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, ShoppingBag, ArrowRight, Home } from "lucide-react";
import { motion } from "framer-motion";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-[80vh] flex items-center justify-center container mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="p-12 text-center border-white shadow-2xl bg-white/80 backdrop-blur-md relative overflow-hidden">
          {/* Confetti-like background element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-400/10 blur-[80px] rounded-full -z-10" />
          
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-green-500 text-white p-6 rounded-full shadow-lg shadow-green-200"
            >
              <CheckCircle2 size={64} />
            </motion.div>
          </div>

          <h1 className="text-4xl font-black text-slate-900 mb-4">Đặt hàng thành công!</h1>
          <p className="text-lg text-slate-500 mb-4">
            Cảm ơn bạn đã tin tưởng AntigravityS Electronics. 
            Đơn hàng của bạn đang được xử lý.
          </p>
          
          <div className="flex flex-col items-center mb-10">
            <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 shadow-sm inline-flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã đơn hàng:</span>
              <span className="text-sm font-black text-slate-900 font-mono tracking-tighter bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                #{orderId || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <Link href="/profile/orders" className="flex-1">
              <Button 
                variant="outline" 
                size="lg" 
                fullWidth
                leftIcon={<ShoppingBag size={20} />}
                className="rounded-2xl h-16 shadow-sm hover:shadow-md transition-all font-black"
              >
                Xem đơn hàng
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button 
                size="lg" 
                fullWidth
                rightIcon={<ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                leftIcon={<Home size={20} />}
                className="rounded-2xl h-16 shadow-lg shadow-primary/20 font-black group"
              >
                Về trang chủ
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
