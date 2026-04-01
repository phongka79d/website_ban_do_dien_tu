"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/database";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Minus, Plus, ShoppingCart, Package, CreditCard } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";

interface ProductActionBlockProps {
  product: Product;
}

/**
 * ProductActionBlock: Điều hướng mua hàng qua Modal chọn số lượng. 2.0
 */
export function ProductActionBlock({ product }: ProductActionBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"add" | "buy">("add");
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleIncrease = () => {
    if (quantity < product.stock_quantity) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleOpenModal = (type: "add" | "buy") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    if (modalType === "buy") {
      router.push("/checkout");
    }
  };

  return (
    <div className="mt-auto space-y-4 pt-8">
      {/* Nút 1: MUA NGAY (Ưu tiên cao) */}
      <button 
        onClick={() => handleOpenModal("buy")}
        className="group relative w-full py-8 bg-primary overflow-hidden text-white rounded-3xl font-black uppercase tracking-widest text-[15px] transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
      >
        <div className="flex items-center justify-center gap-3 relative z-10">
          <CreditCard size={24} className="transition-transform group-hover:rotate-12" />
          <span>Mua ngay</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Nút 2: THÊM VÀO GIỎ HÀNG */}
      <button 
        onClick={() => handleOpenModal("add")}
        className="group relative w-full py-8 bg-slate-900 overflow-hidden text-white rounded-3xl font-black uppercase tracking-widest text-[15px] transition-all hover:bg-slate-800 active:scale-95 shadow-xl shadow-slate-200"
      >
        <div className="flex items-center justify-center gap-3 relative z-10">
          <ShoppingCart size={24} className="opacity-70" />
          <span>Thêm vào giỏ hàng</span>
        </div>
      </button>

      {/* Modal Chọn Số Lượng & Tồn Kho */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => {}} 
        showConfirm={false}
        title={modalType === "buy" ? "Mua ngay sản phẩm" : "Thêm vào giỏ hàng"}
        message={modalType === "buy" ? "Chọn số lượng để thanh toán ngay lập tức." : "Chọn số lượng bạn muốn thêm vào giỏ hàng."}
        type="info"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                <Package size={20} />
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">Tồn kho</div>
                <div className="text-sm font-bold text-slate-700">{product.stock_quantity} sản phẩm</div>
              </div>
            </div>
            
            {/* Bộ chọn số lượng */}
            <div className="flex items-center bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
              <button 
                onClick={handleDecrease}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={quantity <= 0}
              >
                <Minus size={18} />
              </button>
              <div className="w-10 text-center font-black text-slate-900">
                {quantity}
              </div>
              <button 
                onClick={handleIncrease}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={quantity >= product.stock_quantity}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <AddToCartButton
            product={product}
            quantity={quantity}
            label={
              quantity === 0 ? "Bỏ qua" : 
              (modalType === "buy" ? "Thanh toán ngay" : "Xác nhận thêm")
            }
            variant="primary"
            className="w-full py-6 rounded-2xl shadow-lg shadow-primary/20"
            showIcon={quantity > 0}
            onSuccess={handleSuccess}
            leftIcon={modalType === "buy" ? <CreditCard size={20} /> : <ShoppingCart size={20} />}
          />
        </div>
      </ConfirmationModal>
    </div>
  );
}
