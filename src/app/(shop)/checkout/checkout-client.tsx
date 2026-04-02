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
  PackageCheck,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductImage } from "@/components/common/ProductImage";
import { z } from "zod";

// Định nghĩa schema validation bằng Zod. 2.0
const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, "Địa chỉ chi tiết phải có ít nhất 10 ký tự"),
  phoneNumber: z.string()
    .min(9, "Số điện thoại phải có ít nhất 9 số")
    .max(11, "Số điện thoại không được quá 11 số")
    .regex(/^\d+$/, "Số điện thoại chỉ được chứa các chữ số"),
  paymentMethod: z.string()
});

interface CheckoutClientProps {
  user: any;
  initialItems: CartItem[];
}

export default function CheckoutClient({ user, initialItems }: CheckoutClientProps) {
  const router = useRouter();
  const { clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const supabase = createClient();

  const [formData, setFormData] = useState({
    shippingAddress: "",
    phoneNumber: user.user_metadata?.phone || user.phone || "",
    paymentMethod: "cod"
  });

  const totalAmount = initialItems.reduce((acc, item) => 
    acc + (item.products?.price || 0) * item.quantity, 0
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) newErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    const isValid = validateStep1();
    if (!isValid) return;

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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 1. Header & Stepper Step (Standalone) 2.0 */}
      <div className="mb-12 md:mb-20">
        <div className="flex items-center justify-between relative px-4 max-w-2xl mx-auto">
          {/* Connector Track (Background Line) - Refined Gradient 2.0 */}
          <div className="absolute top-5 left-0 w-full h-[3px] bg-slate-200/50 z-0 rounded-full overflow-hidden" />
          
          {/* Active Progress Line (Dynamic Gradient) 2.0 */}
          <motion.div 
            className="absolute top-5 left-0 h-[3px] bg-gradient-to-r from-pink-600 to-indigo-600 z-0 rounded-full shadow-[0_0_15px_rgba(190,24,93,0.3)]"
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
          />
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <motion.div 
                animate={{ 
                  scale: step === s ? 1.15 : 1,
                  backgroundColor: step >= s ? "#be185d" : "#ffffff"
                }}
                className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black transition-all ring-4 ${
                step >= s 
                  ? "text-white shadow-xl shadow-pink-500/20 ring-pink-500/10" 
                  : "border-2 border-slate-200 text-slate-400 ring-transparent"
              }`}>
                {step > s ? <CheckCircle2 size={20} className="text-white" /> : s}
              </motion.div>
              
              <span className={`absolute -bottom-10 text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 ${
                step >= s ? "text-slate-900" : "text-slate-300"
              }`}>
                {s === 1 ? "Thông tin" : s === 2 ? "Thanh toán" : "Xác nhận"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Main Checkout Content Grid 2.0 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card 
                variant="elevated" 
                radius="2xl" 
                className="p-10 border-white/40 shadow-2xl bg-white/70 backdrop-blur-xl relative overflow-hidden group/card"
              >
                {/* Subtle Glow Background 2.0 */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-pink-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                    <MapPin size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Địa chỉ giao hàng</h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-slate-400">Họ và Tên</label>
                        <div className="relative group/user">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                                <User size={18} />
                            </div>
                            <input 
                                id="fullName"
                                type="text" 
                                disabled 
                                value={user.user_metadata?.full_name || "User"}
                                className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 cursor-not-allowed font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="phoneNumber" className="text-xs font-bold uppercase tracking-wider text-slate-400">Số điện thoại</label>
                        <div className="relative group/phone">
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                              errors.phoneNumber ? "text-red-400" : "text-slate-400 group-focus-within/phone:text-primary"
                          }`}>
                              <Phone size={18} />
                          </div>
                          <input 
                              id="phoneNumber"
                              name="phoneNumber"
                              type="tel" 
                              inputMode="numeric"
                              autoComplete="tel"
                              minLength={9}
                              maxLength={11}
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                              placeholder="Nhập số điện thoại"
                              className={`w-full h-12 pl-12 pr-4 rounded-xl bg-white border outline-none transition-all duration-300 font-bold ${
                                errors.phoneNumber 
                                  ? "border-red-500 focus:ring-4 focus:ring-red-500/10 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" 
                                  : "border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 shadow-sm"
                              }`}
                          />
                          {errors.phoneNumber && (
                            <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold animate-in fade-in slide-in-from-top-1">
                              <AlertCircle size={12} />
                              {errors.phoneNumber}
                            </div>
                          )}
                        </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Địa chỉ chi tiết</label>
                    <div className="relative">
                      <textarea 
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                          className={`w-full p-4 rounded-xl bg-white border outline-none transition-all duration-300 font-bold ${
                            errors.shippingAddress 
                              ? "border-red-500 focus:ring-4 focus:ring-red-500/10 shadow-[0_0_0_1px_rgba(239,68,68,0.2)]" 
                              : "border-slate-200 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 shadow-sm"
                          }`}
                      />
                      {errors.shippingAddress && (
                        <div className="flex items-center gap-1 mt-1 text-red-500 text-[10px] font-bold animate-in fade-in slide-in-from-top-1">
                          <AlertCircle size={12} />
                          {errors.shippingAddress}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button 
                        size="lg" 
                        onClick={handleNextStep}
                        className="rounded-full px-10 shadow-xl shadow-pink-500/20 bg-pink-600 hover:bg-pink-700 h-14"
                        rightIcon={<ArrowRight size={20} />}
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
                    <label className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden group/payment ${
                        formData.paymentMethod === 'cod' ? "border-pink-500 bg-pink-50/30" : "border-slate-100/50 hover:border-slate-200 bg-slate-50/30"
                    }`}>
                        {formData.paymentMethod === 'cod' && (
                          <motion.div 
                            layoutId="activePayment"
                            className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent pointer-events-none" 
                          />
                        )}
                        <input 
                            type="radio" 
                            name="paymentMethod" 
                            value="cod" 
                            checked={formData.paymentMethod === 'cod'}
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
                            value="bank" 
                            disabled
                            checked={formData.paymentMethod === 'bank'}
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

                <div className="mt-10 flex justify-between items-center">
                    <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full font-bold h-12">
                      Quay lại
                    </Button>
                    <Button 
                        size="lg" 
                        onClick={() => setStep(3)}
                        className="rounded-full px-10 shadow-xl shadow-pink-500/20 bg-pink-600 hover:bg-pink-700 h-14"
                        rightIcon={<ArrowRight size={20} />}
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
              <Card 
                variant="elevated" 
                radius="2xl" 
                className="p-10 border-white/40 shadow-2xl bg-white/70 backdrop-blur-xl relative overflow-hidden"
              >
                {/* Decorative background element 2.0 */}
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <PackageCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Xác nhận thanh toán</h2>
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
                            <span className="text-sm font-bold text-slate-900">{formData.paymentMethod === 'cod' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-600 rounded-xl text-[11px] font-bold">
                        <Truck size={16} /> Giao hàng dự kiến trong 2-4 ngày làm việc
                    </div>

                    <Button 
                        size="lg" 
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        className="w-full rounded-2xl h-14 text-lg font-black shadow-xl shadow-pink-500/20 bg-pink-600 hover:bg-pink-700"
                    >
                        Đặt hàng ngay - {totalAmount.toLocaleString("vi-VN")}₫
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => setStep(2)} 
                      className="w-full font-bold h-10 text-slate-400 hover:text-pink-600"
                    >
                      Thay đổi thông tin
                    </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Order Summary - Crystal Light Style 2.0 */}
      <div className="lg:col-span-4 h-fit lg:sticky lg:top-28">
        <Card 
          variant="elevated" 
          radius="2xl" 
          className="p-8 border-white/60 bg-white/60 backdrop-blur-xl shadow-2xl shadow-slate-200/50 relative overflow-hidden"
        >
            {/* Ambient Background Patterns (Subtle Pink/Indigo) 2.0 */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/5 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 blur-[100px] rounded-full" />
            
            <h2 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10 text-slate-900">
                Đơn hàng của bạn 
                <span className="text-[10px] bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-black tracking-widest border border-pink-100">
                  {initialItems.length} MẶT HÀNG
                </span>
            </h2>

            <div className="space-y-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar relative z-10">
                {initialItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center group/item p-3 rounded-2xl hover:bg-white/50 transition-colors cursor-default border border-transparent hover:border-white/40">
                        <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-slate-100 shrink-0 p-2 shadow-inner">
                            <ProductImage 
                                src={item.products?.image_url} 
                                alt={item.products?.name || "Product"} 
                                width={64}
                                height={64}
                                className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-black text-slate-800 truncate leading-tight group-hover:text-pink-600 transition-colors">
                                {item.products?.name || "Sản phẩm không xác định"}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 font-bold">
                                SL: <span className="text-slate-600">{item.quantity}</span> × {(item.products?.price || 0).toLocaleString("vi-VN")}₫
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4 relative z-10">
                <div className="flex justify-between text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
                    <span>Tạm tính</span>
                    <span className="text-slate-900">{(totalAmount).toLocaleString("vi-VN")}₫</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">
                    <span>Vận chuyển</span>
                    <span className="text-green-500 font-black">MIỄN PHÍ</span>
                </div>
                <div className="flex justify-between pt-6 border-t border-slate-100">
                    <span className="text-xs font-black uppercase text-slate-300 tracking-widest mt-2">Tổng thanh toán</span>
                    <div className="text-right">
                        <div className="text-3xl font-black text-pink-600 tracking-tight">
                          {totalAmount.toLocaleString("vi-VN")}₫
                        </div>
                        <p className="text-[10px] text-slate-300 uppercase tracking-tighter font-bold mt-1">Đã bao gồm các loại thuế phí</p>
                    </div>
                </div>
            </div>
        </Card>
      </div>
    </div>
  </div>
);
}
