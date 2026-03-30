"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { OrderService } from "@/services/orderService";
import { createClient } from "@/utils/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CartItem } from "@/types/database";
import { 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  ArrowRight,
  Loader2,
  PackageCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "@/components/common/ProductImage";

interface CheckoutClientProps {
  user: any;
  initialItems: CartItem[];
}

export default function CheckoutClient({ user, initialItems }: CheckoutClientProps) {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    shippingAddress: "",
    phoneNumber: user.phone || "",
    paymentMethod: "COD"
  });

  const totalAmount = initialItems.reduce((acc, item) => 
    acc + (item.products?.price || 0) * item.quantity, 0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.shippingAddress || !formData.phoneNumber) {
      alert("Vui lòng nhập đầy đủ thông tin giao hàng!");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!supabase) throw new Error("Connection failed");
      
      const { data, error } = await OrderService.createOrder(supabase, {
        userId: user.id,
        items: initialItems,
        totalAmount,
        shippingAddress: formData.shippingAddress,
        phoneNumber: formData.phoneNumber,
        paymentMethod: formData.paymentMethod
      });

      if (error) throw error;

      // Xóa giỏ hàng trên store local
      clearCart();
      
      // Chuyển hướng trang thành công
      router.push(`/checkout/success?order_id=${data?.id}`);
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form Steps */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between mb-12 relative px-2 max-w-2xl mx-auto">
          {/* Connector Track (Background Line) */}
          <div className="absolute top-5 left-0 w-full h-[3px] bg-slate-100 z-0 rounded-full" />
          
          {/* Active Progress Line (Dynamic) */}
          <div 
            className="absolute top-5 left-0 h-[3px] bg-primary z-0 rounded-full transition-all duration-700 ease-in-out shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]"
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
          />
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-500 ring-4 ${
                step >= s 
                  ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110 ring-primary/10" 
                  : "bg-white border-2 border-slate-200 text-slate-400 ring-transparent"
              }`}>
                {s}
              </div>
              
              <span className={`absolute -bottom-8 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-colors duration-300 ${
                step >= s ? "text-slate-900" : "text-slate-300"
              }`}>
                {s === 1 ? "Thông tin" : s === 2 ? "Thanh toán" : "Xác nhận"}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card radius="2xl" className="p-8 border-white shadow-xl bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-primary" />
                  <h2 className="text-xl font-black">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Họ và Tên</label>
                        <input 
                            type="text" 
                            disabled 
                            value={user.user_metadata?.full_name || "User"}
                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 cursor-not-allowed"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Số điện thoại</label>
                        <input 
                            name="phoneNumber"
                            type="tel" 
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            placeholder="Nhập số điện thoại"
                            className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ chi tiết</label>
                    <textarea 
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                        className="w-full p-4 rounded-xl bg-white border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button 
                        size="lg" 
                        onClick={() => setStep(2)}
                        disabled={!formData.shippingAddress || !formData.phoneNumber}
                        className="rounded-full px-8"
                        rightIcon={<ArrowRight size={18} />}
                    >
                        Tiếp theo
                    </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card radius="2xl" className="p-8 border-white shadow-xl bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="text-primary" />
                  <h2 className="text-xl font-black">Phương thức thanh toán</h2>
                </div>

                <div className="space-y-4">
                    <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        formData.paymentMethod === 'COD' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                    }`}>
                        <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="COD" 
                            checked={formData.paymentMethod === 'COD'}
                            onChange={handleInputChange}
                            className="w-5 h-5 accent-primary"
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900">Thanh toán khi nhận hàng (COD)</h4>
                            <p className="text-xs text-slate-500">Thanh toán bằng tiền mặt khi shipper giao hàng</p>
                        </div>
                        <Truck className="text-slate-400" />
                    </label>

                    <label className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer opacity-60 ${
                        formData.paymentMethod === 'BANK' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                    }`}>
                        <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="BANK" 
                            disabled
                            checked={formData.paymentMethod === 'BANK'}
                            onChange={handleInputChange}
                            className="w-5 h-5 accent-primary"
                        />
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900">Chuyển khoản ngân hàng (Sắp có)</h4>
                            <p className="text-xs text-slate-500">Quét mã QR để thanh toán nhanh chóng</p>
                        </div>
                        <CreditCard className="text-slate-400" />
                    </label>
                </div>

                <div className="mt-8 flex justify-between">
                    <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Quay lại</Button>
                    <Button 
                        size="lg" 
                        onClick={() => setStep(3)}
                        className="rounded-full px-8"
                        rightIcon={<ArrowRight size={18} />}
                    >
                        Xác nhận đơn hàng
                    </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card radius="2xl" className="p-8 border-white shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden relative">
                <div className="flex items-center gap-3 mb-6">
                  <PackageCheck className="text-primary" />
                  <h2 className="text-xl font-black">Xác nhận thanh toán</h2>
                </div>

                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-400 uppercase">Người nhận</span>
                            <span className="text-sm font-bold text-slate-900">{user.user_metadata?.full_name || "User"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-400 uppercase">Số điện thoại</span>
                            <span className="text-sm font-bold text-slate-900">{formData.phoneNumber}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-400 uppercase">Địa chỉ</span>
                            <span className="text-sm font-bold text-slate-900 text-right max-w-[200px]">{formData.shippingAddress}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-400 uppercase">Hình thức</span>
                            <span className="text-sm font-bold text-slate-900">{formData.paymentMethod === 'COD' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-bold">
                        <Truck size={16} /> Giao hàng dự kiến trong 2-4 ngày làm việc
                    </div>

                    <Button 
                        size="lg" 
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        className="w-full rounded-2xl h-16 text-lg font-black shadow-xl shadow-primary/20"
                    >
                        Đặt hàng ngay - {totalAmount.toLocaleString("vi-VN")}₫
                    </Button>
                    
                    <Button variant="ghost" onClick={() => setStep(2)} className="w-full">Thay đổi thông tin</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-4 h-fit sticky top-28">
        <Card radius="2xl" className="p-6 border-white bg-slate-900 text-white shadow-2xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[100px] rounded-full" />
            
            <h2 className="text-lg font-black mb-6 flex items-center gap-2 relative z-10">
                Tóm tắt đơn hàng 
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-medium">#{initialItems.length}</span>
            </h2>

            <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {initialItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 overflow-hidden border border-white/10 shrink-0 p-1.5 shadow-inner">
                            <ProductImage 
                                src={item.products?.image_url} 
                                alt={item.products?.name || "Product"} 
                                width={56}
                                height={56}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold truncate leading-tight group-hover:text-primary transition-colors">
                                {item.products?.name || "Sản phẩm không xác định"}
                            </h4>
                            <p className="text-[11px] text-white/50 mt-1 font-medium italic">
                                SL: {item.quantity} × {(item.products?.price || 0).toLocaleString("vi-VN")}₫
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-3 relative z-10">
                <div className="flex justify-between text-xs text-white/60 font-bold uppercase tracking-widest">
                    <span>Tạm tính</span>
                    <span className="text-white">{totalAmount.toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between text-xs text-white/60 font-bold uppercase tracking-widest">
                    <span>Vận chuyển</span>
                    <span className="text-green-400">MIỄN PHÍ</span>
                </div>
                <div className="flex justify-between pt-2">
                    <span className="text-base font-black uppercase text-white/40">Tổng cộng</span>
                    <div className="text-right">
                        <span className="text-2xl font-black text-primary">{totalAmount.toLocaleString("vi-VN")}₫</span>
                        <p className="text-[9px] text-white/30 uppercase tracking-tighter">Giá đã bao gồm thuế phí</p>
                    </div>
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
