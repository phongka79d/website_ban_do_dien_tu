"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { BannerService } from "@/services/bannerService";
import { Banner } from "@/types/database";
import { Edit, Trash2, Image as ImageIcon, ExternalLink, Eye, Palette, Package, Layout } from "lucide-react";
import { ProductImage } from "../common/ProductImage";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import NotificationModal from "@/components/common/NotificationModal";
import { AdminInput } from "./AdminInput";
import { AdminToggle } from "./AdminToggle";
import AdminManagerShell from "./AdminManagerShell";
import AdminActionModal from "./AdminActionModal";
import { ImageUpload } from "./ImageUpload";
import { Button } from "../ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bannerSchema, BannerFormData } from "@/lib/validations/banner";
import { cn } from "@/utils/cn";
import { ProductSearchSelect } from "./ProductSearchSelect";
import { AdminSelect } from "./AdminSelect";
import { Category } from "@/types/database";
import { ProductWithDetails } from "@/types/database";
import { ProductService } from "@/services/productService";

/**
 * Local Preview Component to minimize creating extra files
 * Mimics the homepage Carousel layout
 */
const BannerPreview = ({ data }: { data: Partial<BannerFormData> }) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Eye size={14} className="text-primary" />
        <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Live Preview (Mockup)</span>
      </div>
      
      <div className={cn(
        "relative w-full h-[240px] rounded-[32px] overflow-hidden shadow-xl border border-white/10 transition-all duration-700",
        data.bg_color || "bg-slate-900"
      )}>
        <div className="relative z-10 flex h-full">
          {/* Content Side - 40% */}
          <div className="flex h-full w-[40%] flex-col justify-center pl-10 pr-6">
            <h2 className="text-2xl font-black text-white leading-tight line-clamp-2 tracking-tight">
              {data.title || "Tiêu đề banner"}
            </h2>
            <p className="mt-3 text-[11px] font-bold text-white/50 line-clamp-2 italic">
              {data.subtitle || "Nội dung phụ sẽ hiển thị ở đây..."}
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-[11px] font-black uppercase tracking-wider">
                Xem ngay
              </div>
            </div>
          </div>

          {/* Image Side - 60% */}
          <div className="relative flex h-full w-[60%] bg-black/10 overflow-hidden">
            <ProductImage
              src={data.image_url}
              alt="Preview"
              width={600}
              height={400}
              className="h-full w-full object-cover filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
};

const GRADIENT_PRESETS = [
  { name: "Dark", class: "bg-gradient-to-r from-slate-900 to-slate-800" },
  { name: "Blue", class: "bg-gradient-to-r from-blue-700 to-blue-500" },
  { name: "Indigo", class: "bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900" },
  { name: "Rose", class: "bg-gradient-to-r from-rose-700 to-rose-500" },
  { name: "Amber", class: "bg-gradient-to-r from-amber-600 to-amber-500" },
  { name: "Emerald", class: "bg-gradient-to-r from-emerald-800 to-teal-700" },
];



export default function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [notification, setNotification] = useState<{
    isOpen: boolean; title: string; message: string; type: "success" | "error";
  }>({ isOpen: false, title: "", message: "", type: "success" });

  const [categories, setCategories] = useState<Category[]>([]);
  const [linkType, setLinkType] = useState<"manual" | "product" | "category">("manual");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema) as any,

  });

  const fetchBanners = async () => {
    setLoading(true);
    const supabase = createClient();
    if (supabase) {
      const [bannerData, categoryData] = await Promise.all([
        BannerService.getBanners(supabase, false),
        ProductService.getCategories(supabase, true)
      ]);
      setBanners(bannerData);
      setCategories(categoryData);
    }
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleCreate = () => {
    setLinkType("manual");
    setSelectedProductId("");
    setSelectedCategorySlug("");
    reset({
      title: "",
      subtitle: "",
      image_url: "",
      bg_color: "bg-gradient-to-r from-slate-900 to-slate-800",
      target_url: "",
      is_active: true,
      display_order: banners.length + 1,
    });
    setCurrentBanner(null);
    setIsEditModalOpen(true);
  };

  const handleEdit = (banner: Banner) => {
    setCurrentBanner(banner);
    
    // Determine link type from target_url
    let initialLinkType: "manual" | "product" | "category" = "manual";
    let initialProductId = "";
    let initialCategorySlug = "";

    if (banner.target_url?.startsWith("/products/")) {
      initialLinkType = "product";
      initialProductId = banner.target_url.replace("/products/", "");
    } else if (banner.target_url?.startsWith("/category/")) {
      initialLinkType = "category";
      initialCategorySlug = banner.target_url.replace("/category/", "");
    }

    setLinkType(initialLinkType);
    setSelectedProductId(initialProductId);
    setSelectedCategorySlug(initialCategorySlug);

    reset({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      bg_color: banner.bg_color || "bg-gradient-to-r from-slate-900 to-slate-800",
      target_url: banner.target_url || "",
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (banner: Banner) => {
    setCurrentBanner(banner);
    setIsDeleteModalOpen(true);
  };

  const onSave = async (data: BannerFormData) => {
    setIsSubmitting(true);
    const supabase = createClient();
    if (supabase) {
      const { error } = currentBanner?.id
        ? await BannerService.updateBanner(supabase, currentBanner.id, data)
        : await BannerService.createBanner(supabase, data);

      if (error) {
        setNotification({ isOpen: true, title: "Lỗi", message: error.message, type: "error" });
      } else {
        setNotification({
          isOpen: true,
          title: "Thành công",
          message: currentBanner?.id ? "Cập nhật banner thành công" : "Thêm banner thành công",
          type: "success"
        });
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

  const bannerActive = watch("is_active");
  const targetUrl = watch("target_url");

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
        <div className="grid grid-cols-1 gap-8">
          {filteredBanners.map((banner) => (
            <div key={banner.id} className="group bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col">
              <div className={cn("h-64 relative overflow-hidden transition-all duration-700", banner.bg_color)}>
                <div className="relative z-10 flex h-full">
                  {/* Content Side (Mock Live Side) - 40% */}
                  <div className="flex h-full w-[40%] flex-col justify-center pl-10 pr-6">
                    <h3 className="text-2xl font-black text-white line-clamp-1 tracking-tight leading-tight uppercase">
                      {banner.title}
                    </h3>
                    <p className="text-[12px] text-white/60 font-bold mt-2 line-clamp-2 italic leading-relaxed">
                      {banner.subtitle}
                    </p>
                    <div className="mt-6">
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-[10px] font-black uppercase tracking-widest">
                        Xem ngay
                      </div>
                    </div>
                  </div>

                  {/* Image Side (Mock Live Side) - 60% */}
                  <div className="relative flex h-full w-[60%] bg-black/5 overflow-hidden">
                    {banner.image_url ? (
                      <img 
                        src={banner.image_url} 
                        alt={banner.title} 
                        className="h-full w-full object-cover filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-transform duration-1000 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white/10">
                        <ImageIcon size={64} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
                  </div>
                </div>

                <div className="absolute top-5 right-6 z-20">
                  <StatusBadge active={banner.is_active} />
                </div>
              </div>

              <div className="p-6 flex items-center justify-between bg-white border-t border-slate-50">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Thứ tự</span>
                    <div className="flex items-center gap-1.5 font-black text-slate-600">
                      <Layout size={12} className="text-slate-400" />
                      <span>#{banner.display_order}</span>
                    </div>
                  </div>
                  {banner.target_url && (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5">Điều hướng</span>
                      <a href={banner.target_url} target="_blank" className="text-primary hover:text-primary/70 flex items-center gap-1.5 font-bold text-[12px] transition-colors">
                        <ExternalLink size={12} /> Link
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleEdit(banner)} className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shadow-sm"><Edit size={18} /></button>
                  <button onClick={() => handleDeleteClick(banner)} className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer shadow-sm"><Trash2 size={18} /></button>
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
        maxWidth="max-w-4xl"
      >
        <div className="space-y-8">
          {/* Top Live Preview */}
          <BannerPreview data={watch()} />
          
          <div className="h-px bg-slate-100" />

          <form onSubmit={handleSubmit(onSave as any)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 md:col-span-2">
              <AdminInput 
                label="Tiêu đề chính" 
                required 
                {...register("title")} 
                error={errors.title?.message}
                placeholder="Ví dụ: iPhone 15 Pro Max" 
              />
              <div className="space-y-2">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1">Nội dung phụ (Subtitle)</label>
                <textarea 
                  className={cn(
                    "w-full p-4 rounded-2xl border outline-none transition-all font-bold text-[14px] min-h-[80px]",
                    errors.subtitle ? "border-rose-200 bg-rose-50/30" : "border-slate-100 bg-slate-50/50 focus:border-primary focus:bg-white"
                  )}
                  {...register("subtitle")} 
                  placeholder="Ví dụ: Titanium siêu bền. Chip A17 Pro đỉnh cao." 
                />
                {errors.subtitle && <span className="text-[10px] font-bold text-rose-500 px-1">{errors.subtitle.message}</span>}
              </div>
            </div>

            <div className="space-y-6 md:col-span-2">
              <div className="p-6 bg-slate-50/50 rounded-[32px] border border-slate-100 space-y-6">
                <ImageUpload 
                  label="Hình ảnh banner"
                  imageUrl={watch("image_url")}
                  onSuccess={(res) => setValue("image_url", res.info.secure_url)}
                  onClose={() => {}}
                  onRemove={() => setValue("image_url", "")}
                />
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-50 px-3 font-black text-slate-400">Hoặc nhập URL thủ công</span>
                  </div>
                </div>

                <AdminInput 
                  label="URL hình ảnh (Tùy chọn)" 
                  {...register("image_url")} 
                  error={errors.image_url?.message}
                  placeholder="https://..." 
                  icon={<ImageIcon size={16} />}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-primary" />
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Màu nền / Gradient</label>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setValue("bg_color", preset.class)}
                    className={cn(
                      "h-12 rounded-xl border-4 transition-all flex items-center justify-center relative group/color",
                      preset.class,
                      watch("bg_color") === preset.class ? "border-primary scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <span className="text-[8px] font-black text-white opacity-0 group-hover/color:opacity-100 transition-opacity bg-black/40 px-1 rounded uppercase tracking-tighter">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
              <AdminInput 
                label="Custom Gradient Class" 
                {...register("bg_color")} 
                error={errors.bg_color?.message}
                placeholder="bg-gradient-to-r from-..." 
              />
            </div>

            <div className="md:col-span-2 space-y-6 p-6 bg-slate-50/50 rounded-[32px] border border-slate-100">
              <div className="flex items-center gap-2">
                <ExternalLink size={14} className="text-secondary" />
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Cấu hình điều hướng (Link)</label>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { id: "product", label: "Sản phẩm", icon: <Package size={14} /> },
                  { id: "category", label: "Danh mục", icon: <Layout size={14} /> },
                  { id: "manual", label: "Thủ công", icon: <Edit size={14} /> },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLinkType(type.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black transition-all",
                      linkType === type.id 
                        ? "bg-secondary text-white shadow-lg shadow-secondary/20" 
                        : "bg-white text-slate-400 hover:bg-slate-100"
                    )}
                  >
                    {type.icon}
                    {type.label}
                  </button>
                ))}
              </div>

              <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                {linkType === "product" && (
                  <ProductSearchSelect 
                    label="Chọn sản phẩm"
                    initialValue={selectedProductId}
                    onSelect={(p) => {
                      if (p) {
                        setSelectedProductId(p.id);
                        setValue("target_url", `/products/${p.id}`);
                      } else {
                        setSelectedProductId("");
                        setValue("target_url", "");
                      }
                    }}
                    error={errors.target_url?.message}
                  />
                )}

                {linkType === "category" && (
                  <AdminSelect 
                    label="Chọn danh mục"
                    value={selectedCategorySlug}
                    options={categories.map(c => ({ value: c.slug, label: c.name }))}
                    onChange={(e) => {
                      const slug = e.target.value;
                      setSelectedCategorySlug(slug);
                      setValue("target_url", `/category/${slug}`);
                    }}
                    error={errors.target_url?.message}
                  />
                )}

                {linkType === "manual" && (
                  <AdminInput 
                    label="Nhập URL thủ công" 
                    {...register("target_url")} 
                    error={errors.target_url?.message}
                    placeholder="/product/..." 
                    icon={<ExternalLink size={16} />}
                  />
                )}
              </div>

              {targetUrl && (
                <div className="p-3 bg-white/50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Link đang sử dụng:</span>
                  <code className="text-[11px] font-black text-primary">{targetUrl}</code>
                </div>
              )}
            </div>
            <AdminInput 
              label="Thứ tự hiển thị" 
              type="number" 
              {...register("display_order")} 
              error={errors.display_order?.message}
              placeholder="1" 
              icon={<Layout size={16} />}
            />
            
            <div className="md:col-span-2 p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
              <AdminToggle 
                label="Cho phép hiển thị trên trang chủ" 
                checked={bannerActive || false} 
                onChange={(checked) => setValue("is_active", checked)} 
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                fullWidth 
                size="lg"
                radius="2xl"
              >
                Xác nhận & Lưu Banner
              </Button>
            </div>
          </form>
        </div>
      </AdminActionModal>

      <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="Xóa banner" message={`Bạn có chắc chắn muốn xóa banner "${currentBanner?.title}"? Hành động này không thể hoàn tác.`} confirmText="Xác nhận xóa" type="danger" loading={isSubmitting} />
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
    </>
  );
}

