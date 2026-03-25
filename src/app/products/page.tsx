import React from "react";
import ProductCard from "@/components/ProductCard";
import FilterBar from "@/components/FilterBar";
import Carousel from "@/components/Carousel";

const SAMPLE_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: 29990000,
    oldPrice: 34990000,
    description: "Khám phá sức mạnh tối thượng cùng chip A17 Pro và thiết kế Titan đẳng cấp.",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-pro-max_3.png",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    price: 26990000,
    oldPrice: 29990000,
    description: "Quyền năng AI trong tầm tay. Chụp ảnh đêm siêu sắc nét.",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-2_1.png",
  },
  {
    id: 3,
    name: "MacBook Air M3",
    price: 27990000,
    description: "Mỏng nhẹ kinh ngạc. Hiệu năng vượt thời gian cùng chip M3 mới nhất.",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook-air-m3-13-inch-silver.png",
  },
  {
    id: 4,
    name: "Sony WH-1000XM5",
    price: 6490000,
    oldPrice: 8490000,
    description: "Chống ồn hàng đầu thế giới. Trải nghiệm âm thanh đỉnh cao.",
    image: "https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-chong-on-sony-wh-1000xm5.png",
  },
];

export default function ProductsPage() {
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

      <section className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        {SAMPLE_PRODUCTS.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </section>
      
      <div className="mt-12 flex justify-center">
        <button className="px-12 py-4 rounded-full border-2 border-slate-200 font-bold text-slate-600 hover:border-primary hover:text-primary transition-all">
          Xem thêm sản phẩm
        </button>
      </div>
    </main>
  );
}
