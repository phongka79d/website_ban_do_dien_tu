import { createClient } from "@/utils/supabase/server";
import { ProductService } from "@/services/productService";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProductImage } from "@/components/common/ProductImage";
import { ChevronRight, Truck, ShieldCheck } from "lucide-react";
import { ProductActionBlock } from "./ProductActionBlock";

export default async function ProductDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createClient();
  if (!supabase) return notFound();

  const product = await ProductService.getProductById(supabase, id);
  if (!product) return notFound();

  // Định dạng tiền tệ
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const specsArray = product.specs ? Object.entries(product.specs) : [];

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

        {/* Breadcrumb - Tuân thủ luật prefetch={false} từ Bug.md */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-500 mb-8 animate-in slide-in-from-left-4 duration-500">
          <Link href="/" prefetch={false} className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/category/${product.category_slug}`} prefetch={false} className="hover:text-primary transition-colors capitalize">
            {product.categories?.name || product.category_slug}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-bold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Bố cục Glassmorphism 50/50 (Tuân theo Project.md) */}
        <div className="bg-white rounded-[40px] border border-slate-100/80 shadow-[0_20px_80px_-20px_rgb(0,0,0,0.05)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Cột trái: Hình ảnh */}
            <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-slate-100 bg-slate-50/50 flex flex-col justify-center items-center">
              <div className="w-full aspect-square relative rounded-3xl overflow-hidden bg-white shadow-sm border border-slate-100 flex items-center justify-center group mb-6">
                {product.image_url ? (
                  <ProductImage
                    src={product.image_url}
                    width={800}
                    height={800}
                    alt={product.name}
                    className="object-contain w-[80%] h-[80%] transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="text-slate-300 font-medium">Không có hình ảnh</div>
                )}

                {(product.discount_percentage ?? 0) > 0 && (
                  <div className="absolute top-6 left-6 bg-red-500 text-white text-sm font-black tracking-widest px-4 py-2 rounded-xl shadow-lg shadow-red-500/30">
                    -{product.discount_percentage}%
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery (Mock) */}
              <div className="flex gap-4 w-full justify-start overflow-x-auto pb-4 hide-scrollbar">
                <div className="w-20 h-20 shrink-0 rounded-2xl border-2 border-primary overflow-hidden p-2 bg-white flex items-center justify-center">
                  {product.image_url && <ProductImage src={product.image_url} width={100} height={100} alt="Thumb" className="max-w-full max-h-full object-contain" />}
                </div>
              </div>
            </div>

            {/* Cột phải: Thông tin & Mua hàng */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 mb-6 w-max">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-widest">{product.brands?.name || 'Thương hiệu'}</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-slate-900 leading-[1.2] mb-6">
                {product.name}
              </h1>

              {/* Price Block: Stacked for better readability */}
              <div className="flex flex-col gap-0.5 mb-8">
                {(product.original_price ?? 0) > product.price && (
                  <div className="text-xl text-slate-400 font-medium line-through decoration-slate-300 decoration-[1.5px]">
                    {formatPrice(product.original_price!)}
                  </div>
                )}
                <div className="text-4xl lg:text-5xl font-black text-primary tracking-tight transition-transform duration-500 hover:scale-[1.02] origin-left">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Promotion / Tóm tắt */}
              {product.promotion_text && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 mb-8">
                  <div className="flex items-center gap-2 text-orange-600 font-black text-sm uppercase tracking-widest mb-2">
                    🔥 Khuyến mãi đặc biệt
                  </div>
                  <div className="text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-line">
                    {product.promotion_text}
                  </div>
                </div>
              )}

              {/* Action Block */}
              <div className="mt-auto space-y-4 pt-8">
                <ProductActionBlock product={product} />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <Truck className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-600 leading-tight">Giao hàng<br />siêu tốc 2H</div>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-600 leading-tight">Bảo hành<br />chính hãng 100%</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Vùng mô tả & Thông số: Layout Grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Cột trái: HTML Description */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-slate-100/80 shadow-[0_10px_40px_-10px_rgb(0,0,0,0.03)] hook-prose">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                Đặc điểm nổi bật
              </h2>
              {product.description ? (
                <div
                  className="prose prose-slate max-w-none text-[15px] leading-[1.8] text-slate-600 prose-headings:font-black prose-headings:text-slate-900 prose-a:text-primary prose-img:rounded-3xl"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-slate-400 font-medium italic">Đang cập nhật nội dung mô tả cho sản phẩm này...</p>
              )}
            </div>
          </div>

          {/* Cột phải: Specs JSONB Table */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[40px] p-8 border border-slate-100/80 shadow-[0_10px_40px_-10px_rgb(0,0,0,0.03)] sticky top-28">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                Thông số kỹ thuật
              </h2>

              {specsArray.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {specsArray.map(([key, value], idx) => (
                    <div key={idx} className="py-4 flex flex-col xl:flex-row xl:items-start gap-1 xl:gap-4">
                      <div className="text-[13px] font-bold text-slate-400 xl:w-1/3 shrink-0">{key}</div>
                      <div className="text-[14px] font-medium text-slate-800 xl:w-2/3">{String(value)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-400 text-sm font-medium">Chưa có thông số kỹ thuật</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
