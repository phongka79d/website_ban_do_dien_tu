import React from "react";
import ProductCard from "@/components/ProductCard";
import FilterBar from "@/components/FilterBar";
import Carousel from "@/components/Carousel";
import { ProductService } from "@/services/productService";

export default async function ProductsPage() {
  const products = await ProductService.getProducts();
  console.log("Products in Page:", JSON.stringify(products, null, 2));

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto">
      {/* Banner Section */}
      <section className="mb-12">
        <Carousel />
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

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard 
              key={product.id} 
              name={product.name}
              price={product.price}
              oldPrice={product.original_price ?? undefined}
              image={product.image_url || ""}
              description={product.promotion_text || ""}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400">Chưa có sản phẩm nào trong cửa hàng.</p>
          </div>
        )}
      </section>
      
      <div className="mt-12 flex justify-center">
        <button className="px-12 py-4 rounded-full border-2 border-slate-200 font-bold text-slate-600 hover:border-primary hover:text-primary transition-all">
          Xem thêm sản phẩm
        </button>
      </div>
    </main>
  );
}
