import Carousel from "@/components/Carousel";
import FilterBar from "@/components/FilterBar";
import PaginatedShop from "@/components/shop/PaginatedShop";
import { BannerService } from "@/services/bannerService";
import { ProductService } from "@/services/productService";
import { createClient } from "@/utils/supabase/server";
import { getSortByFromParam } from "@/utils/productSort";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const supabase = await createClient();
  if (!supabase) return null;

  // Await searchParams in Next.js 15+
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const pageSize = Number(resolvedParams.pageSize) || 16;
  const sortBy = getSortByFromParam(resolvedParams.filter as string);

  console.log(`[DEBUG] HomePage - sortBy: ${sortBy}`);

  // Fetch paginated products and banners
  const [paginatedData, banners] = await Promise.all([
    ProductService.searchProducts(supabase, "", page, pageSize, sortBy),
    BannerService.getBanners(supabase)
  ]);

  const { data: products, count } = paginatedData;

  console.log(`Page ${page}, Items: ${products.length}, Total: ${count}`);

  return (
    <main className="w-full max-w-7xl mx-auto min-h-screen p-4 md:p-8 pb-24 md:pb-8 overflow-hidden">
      {/* Banner Section */}
      <section className="mb-12 overflow-hidden">
        <Carousel key={`carousel-${banners[0]?.id || "static"}`} banners={banners} />
      </section>

      <header className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-2">
          Danh mục <span className="text-primary italic">Sản phẩm</span>
        </h2>
        <p className="text-slate-500">
          Khám phá những công nghệ hàng đầu với ưu đãi tốt nhất.
        </p>
      </header>

      <div className="overflow-hidden mb-8">
        <FilterBar />
      </div>

      {/* Paginated Product List & Control */}
      <PaginatedShop 
        products={products} 
        totalCount={count} 
        page={page} 
        pageSize={pageSize} 
      />
    </main>
  );
}
