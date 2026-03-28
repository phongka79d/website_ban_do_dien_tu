"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { ProductService } from "@/services/productService";
import { Brand } from "@/types/database";
import { Edit, Trash2, Tags } from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";
import { ProductImage } from "@/components/common/ProductImage";
import { ImageUpload } from "./ImageUpload";
import AdminManagerShell from "./AdminManagerShell";
import AdminActionModal from "./AdminActionModal";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

export default function BrandManager() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBrand, setCurrentBrand] = useState<Partial<Brand> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error";
  }>({ isOpen: false, title: "", message: "", type: "success" });

  const fetchBrands = async () => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      const data = await ProductService.getBrands(supabase);
      setBrands(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleCreate = () => { setCurrentBrand({ name: "", logo_url: "" }); setIsEditModalOpen(true); };
  const handleEdit = (brand: Brand) => { setCurrentBrand(brand); setIsEditModalOpen(true); };
  const handleDeleteClick = (brand: Brand) => { setCurrentBrand(brand); setIsDeleteModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBrand?.name) return;
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = currentBrand.id
        ? await ProductService.updateBrand(supabase, currentBrand.id, currentBrand)
        : await ProductService.createBrand(supabase, currentBrand);
      if (error) {
        setNotification({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: currentBrand.id ? "Cập nhật thương hiệu thành công" : "Thêm thương hiệu thành công", type: "success" });
        setIsEditModalOpen(false);
        fetchBrands();
      }
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!currentBrand?.id) return;
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await ProductService.deleteBrand(supabase, currentBrand.id);
      if (error) {
        setNotification({ isOpen: true, title: "Lỗi khi xóa", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: "Đã xóa thương hiệu thành công", type: "success" });
        setIsDeleteModalOpen(false);
        fetchBrands();
      }
    }
    setIsSubmitting(false);
  };

  const filteredBrands = brands.filter((b) => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <AdminManagerShell
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm kiếm thương hiệu..."
        onAdd={handleCreate}
        addLabel="Thêm thương hiệu"
        loading={loading}
        isEmpty={filteredBrands.length === 0}
        emptyIcon={<Tags size={48} />}
        emptyText="Không tìm thấy thương hiệu nào"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBrands.map((brand) => (
            <Card 
              key={brand.id} 
              variant="flat" 
              radius="xl" 
              hover="scale" 
              className="p-6 border-slate-100"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[40px] -z-0 group-hover:bg-primary/5 transition-colors" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden mb-4 group-hover:shadow-lg group-hover:border-primary/20 transition-all">
                  {brand.logo_url ? (
                    <ProductImage src={brand.logo_url} alt={brand.name} width={64} height={64} className="object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                      <span className="font-black text-2xl uppercase">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <h3 className="font-black text-slate-800 text-[18px] mb-1 group-hover:text-primary transition-colors">{brand.name}</h3>
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: {brand.id.slice(0, 4)}...{brand.id.slice(-4)}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="soft" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEdit(brand)}
                    leftIcon={<Edit size={14} />}
                  >
                    Sửa
                  </Button>
                  <Button 
                    variant="soft" 
                    size="sm" 
                    className="p-2.5 hover:bg-red-50 hover:text-red-500"
                    onClick={() => handleDeleteClick(brand)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AdminManagerShell>

      <AdminActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={currentBrand?.id ? "Cập nhật thương hiệu" : "Thêm thương hiệu mới"}
      >
        <form onSubmit={handleSave} className="space-y-6">
          <AdminInput label="Tên thương hiệu" required value={currentBrand?.name || ""} onChange={(e) => setCurrentBrand({ ...currentBrand, name: e.target.value })} placeholder="Ví dụ: Apple, Samsung..." />
          
          <div className="space-y-4">
            <ImageUpload 
              label="Logo Thương hiệu (Tải lên)"
              imageUrl={currentBrand?.logo_url || ""}
              categoryFolder="web_ban_do_dien_tu/brands"
              onSuccess={(result) => setCurrentBrand({ ...currentBrand, logo_url: (result.info as any).public_id })}
              onClose={() => {}}
              onRemove={() => setCurrentBrand({ ...currentBrand, logo_url: "" })}
            />
            
            <div className="pt-2">
              <AdminInput 
                label="Hoặc dán Link ảnh thủ công" 
                value={currentBrand?.logo_url || ""} 
                onChange={(e) => setCurrentBrand({ ...currentBrand, logo_url: e.target.value })} 
                placeholder="Ví dụ: apple_logo_id hoặc https://..." 
              />
            </div>
          </div>
          <div className="pt-4">
            <Button 
              type="submit" 
              isLoading={isSubmitting} 
              fullWidth 
              size="lg"
            >
              Xác nhận lưu
            </Button>
          </div>
        </form>
      </AdminActionModal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Xóa thương hiệu" message={`Bạn có chắc chắn muốn xóa thương hiệu "${currentBrand?.name}"? Các sản phẩm thuộc thương hiệu này có thể bị ảnh hưởng.`} confirmText="Xác nhận xóa" type="danger" loading={isSubmitting} />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
    </>
  );
}
