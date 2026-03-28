import { createClient } from "@/utils/supabase/server";
import { ProductService } from "@/services/productService";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  const supabase = await createClient();
  if (!supabase) return notFound();

  // Fetch Category info and Products in parallel
  const [category, products] = await Promise.all([
    ProductService.getCategoryBySlug(supabase, slug),
    ProductService.getProductsByCategory(supabase, slug),
  ]);

  if (!category) return notFound();

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-500 mb-8 animate-in slide-in-from-left-4 duration-500">
          <Link href="/" prefetch={false} className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-bold capitalize">{category.name}</span>
        </nav>

        {/* Header Hero (Text Title Style) */}
        <div className="bg-white rounded-[32px] p-8 lg:p-12 mb-8 border border-slate-100 shadow-[0_10px_40px_-10px_rgb(0,0,0,0.03)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 mb-4 transition-all">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-widest">Danh mục sản phẩm</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 leading-tight capitalize">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-4 text-slate-500 font-medium max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-bold bg-slate-50 px-4 py-2 rounded-xl shrink-0 border border-slate-100 shadow-sm">
              <LayoutGrid size={18} className="text-primary" />
              <span>{products.length} Mẫu mã</span>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] p-16 border border-slate-100 border-dashed flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <LayoutGrid size={32} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có sản phẩm nào</h3>
            <p className="text-slate-500 font-medium max-w-sm">
              Rất tiếc, hiện tại danh mục {category.name} chưa có sản phẩm nào được bày bán. Vui lòng quay lại sau!
            </p>
            <Link
              href="/"
              prefetch={false}
              className="mt-8 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              Về trang chủ
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
