import ProductList from "@/components/ProductList";
import FilterBar from "@/components/FilterBar";
import Carousel from "@/components/Carousel";
import { ProductService } from "@/services/productService";
import { createClient } from "@/utils/supabase/server";
import { BannerService } from "@/services/bannerService";

export default async function Home() {
  const supabase = await createClient();
  if (!supabase) return null;

  const [products, banners] = await Promise.all([
    ProductService.getProducts(supabase),
    BannerService.getBanners(supabase)
  ]);

  console.log("Products in Page:", products.length);

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* Banner Section */}
      <section className="mb-12">
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

      <FilterBar />

      <ProductList products={products} />

      <div className="mt-12 flex justify-center">
        <button className="px-12 py-4 rounded-full border-2 border-slate-200 font-bold text-slate-600 hover:border-primary hover:text-primary transition-all">
          Xem thêm sản phẩm
        </button>
      </div>
    </main>
  );
}
