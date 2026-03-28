"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BannerService } from "@/services/bannerService";
import { Banner } from "@/types/database";
import { Edit, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";

import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";
import { AdminToggle } from "./AdminToggle";
import AdminManagerShell from "./AdminManagerShell";
import AdminActionModal from "./AdminActionModal";

export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error";
  }>({ isOpen: false, title: "", message: "", type: "success" });

  const fetchBanners = async () => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      const data = await BannerService.getBanners(supabase, false);
      setBanners(data);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleCreate = () => {
    setCurrentBanner({ title: "", subtitle: "", image_url: "", bg_color: "bg-gradient-to-r from-slate-900 to-slate-800", target_url: "", is_active: true, display_order: banners.length + 1 });
    setIsEditModalOpen(true);
  };

  const handleEdit = (banner: Banner) => { setCurrentBanner(banner); setIsEditModalOpen(true); };
  const handleDeleteClick = (banner: Banner) => { setCurrentBanner(banner); setIsDeleteModalOpen(true); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBanner?.title || !currentBanner?.image_url) return;
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = currentBanner.id
        ? await BannerService.updateBanner(supabase, currentBanner.id, currentBanner)
        : await BannerService.createBanner(supabase, currentBanner);
      if (error) {
        setNotification({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: currentBanner.id ? "Cập nhật banner thành công" : "Thêm banner thành công", type: "success" });
        setIsEditModalOpen(false);
        fetchBanners();
      }
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!currentBanner?.id) return;
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = await BannerService.deleteBanner(supabase, currentBanner.id);
      if (error) {
        setNotification({ isOpen: true, title: "Lỗi khi xóa", message: error.message, type: "error" });
      } else {
        setNotification({ isOpen: true, title: "Thành công", message: "Đã xóa banner thành công", type: "success" });
        setIsDeleteModalOpen(false);
        fetchBanners();
      }
    }
    setIsSubmitting(false);
  };

  const filteredBanners = banners.filter((b) => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <>
      <AdminManagerShell
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm kiếm banner..."
        onAdd={handleCreate}
        addLabel="Thêm banner"
        loading={loading}
        isEmpty={filteredBanners.length === 0}
        emptyIcon={<ImageIcon size={48} />}
        emptyText="Không tìm thấy banner nào"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="group bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col">
              <div className={`h-40 relative flex items-center px-8 ${banner.bg_color}`}>
                <div className="z-10 w-2/3">
                  <h3 className="text-xl font-black text-white line-clamp-1">{banner.title}</h3>
                  <p className="text-[12px] text-white/70 font-medium line-clamp-2">{banner.subtitle}</p>
                </div>
                <img src={banner.image_url} alt={banner.title} className="absolute right-4 bottom-0 h-32 object-contain filter drop-shadow-xl z-10 transition-transform group-hover:scale-110" />
                <div className="absolute top-4 right-4 z-20">
                  <StatusBadge active={banner.is_active} />
                </div>
              </div>
              <div className="p-5 flex items-center justify-between bg-white mt-auto">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Thứ tự</span>
                    <span className="font-bold text-slate-600">#{banner.display_order}</span>
                  </div>
                  {banner.target_url && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Link</span>
                      <a href={banner.target_url} target="_blank" className="text-primary hover:underline flex items-center gap-1 font-bold text-[12px]"><ExternalLink size={12} /> View</a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(banner)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all cursor-pointer"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteClick(banner)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </AdminManagerShell>

      <AdminActionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={currentBanner?.id ? "Cập nhật banner" : "Thêm banner mới"}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 md:col-span-2">
            <AdminInput label="Tiêu đề chính" required value={currentBanner?.title || ""} onChange={(e) => setCurrentBanner({ ...currentBanner, title: e.target.value })} placeholder="Ví dụ: iPhone 15 Pro Max" />
            <div className="space-y-2">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Tiêu đề phụ (Subtitle)</label>
              <textarea className="w-full p-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white outline-none transition-all font-bold text-[14px] min-h-[80px]" value={currentBanner?.subtitle || ""} onChange={(e) => setCurrentBanner({ ...currentBanner, subtitle: e.target.value })} placeholder="Ví dụ: Titanium siêu bền. Chip A17 Pro đỉnh cao." />
            </div>
          </div>
          <AdminInput label="URL Hình ảnh" required value={currentBanner?.image_url || ""} onChange={(e) => setCurrentBanner({ ...currentBanner, image_url: e.target.value })} placeholder="https://..." />
          <AdminInput label="Màu nền / Gradient Class" value={currentBanner?.bg_color || ""} onChange={(e) => setCurrentBanner({ ...currentBanner, bg_color: e.target.value })} placeholder="bg-gradient-to-r from-..." />
          <AdminInput label="Link điều hướng (URL)" value={currentBanner?.target_url || ""} onChange={(e) => setCurrentBanner({ ...currentBanner, target_url: e.target.value })} placeholder="/product/..." />
          <AdminInput label="Thứ tự hiển thị" type="number" value={currentBanner?.display_order?.toString() || ""} onChange={(e) => setCurrentBanner({ ...currentBanner, display_order: parseInt(e.target.value) || 0 })} placeholder="1" />
          <div className="md:col-span-2 pt-2">
            <AdminToggle label="Hoạt động" checked={currentBanner?.is_active || false} onChange={(checked) => setCurrentBanner({ ...currentBanner, is_active: checked })} />
          </div>
          <div className="md:col-span-2 pt-4">
            <button disabled={isSubmitting} className="w-full py-5 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 hover:scale-[1.01] active:scale-95 disabled:grayscale transition-all cursor-pointer uppercase tracking-widest">
              {isSubmitting ? "Đang xử lý..." : "Xác nhận lưu"}
            </button>
          </div>
        </form>
      </AdminActionModal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Xóa banner" message={`Bạn có chắc chắn muốn xóa banner "${currentBanner?.title}"? Hành động này không thể hoàn tác.`} confirmText="Xác nhận xóa" type="danger" loading={isSubmitting} />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
    </>
  );
}
