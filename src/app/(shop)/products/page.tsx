import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";
import FilterBar from "@/components/FilterBar";
import PaginatedShop from "@/components/shop/PaginatedShop";
import { ProductService } from "@/services/productService";
import { createClient } from "@/utils/supabase/server";
import { getSortByFromParam } from "@/utils/productSort";

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * All Products Page - Displays a paginated list of all active products without a banner.
 */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient();
  if (!supabase) return null;

  // Await searchParams for Next.js 15+
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const pageSize = Number(resolvedParams.pageSize) || 16;
  // Support both 'q' (new standard) and 'search' (fallback)
  const searchQuery = (resolvedParams.q as string) || (resolvedParams.search as string) || "";
  const sortBy = getSortByFromParam(resolvedParams.filter as string);

  console.log(`[DEBUG] ProductsPage - sortBy: ${sortBy}`);

  // Fetch paginated products (with search query AND filter)
  const { data: products, count } = await ProductService.searchProducts(
    supabase, 
    searchQuery, 
    page, 
    pageSize,
    sortBy
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-32">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-500 mb-8 animate-in slide-in-from-left-4 duration-500">
          <Link href="/" prefetch={false} className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-bold">
            {searchQuery ? <>Tìm kiếm: &quot;{searchQuery}&quot;</> : "Sản phẩm"}
          </span>
        </nav>

        {/* Header Section (Banner replacement) */}
        <div className="bg-white rounded-[32px] p-8 lg:p-12 mb-8 border border-slate-100 shadow-[0_10px_40px_-10px_rgb(0,0,0,0.03)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -z-0"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 mb-4 transition-all">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                <span className="text-xs font-black uppercase tracking-widest">
                  {searchQuery ? "Kết quả tìm kiếm" : "Kho hàng công nghệ"}
                </span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 leading-tight">
                {searchQuery ? (
                  <>Kết quả cho <span className="text-primary italic">&quot;{searchQuery}&quot;</span></>
                ) : (
                  <>Tất cả <span className="text-primary italic">Sản phẩm</span></>
                )}
              </h1>
              <p className="mt-4 text-slate-500 font-medium max-w-2xl leading-relaxed">
                {searchQuery 
                  ? `Tìm thấy ${count} sản phẩm phù hợp với từ khóa của bạn.`
                  : "Khám phá bộ sưu tập đầy đủ các thiết bị điện tử cao cấp với ưu đãi tốt nhất dành cho bạn."
                }
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-600 font-bold bg-slate-50 px-4 py-2 rounded-xl shrink-0 border border-slate-100 shadow-sm">
              <LayoutGrid size={18} className="text-primary" />
              <span>{count} Sản phẩm {searchQuery ? "tìm thấy" : "hiện có"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Integrated FilterBar */}
          <FilterBar />

          {/* Paginated Product Grid */}
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <PaginatedShop 
              products={products} 
              totalCount={count} 
              page={page} 
              pageSize={pageSize} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
