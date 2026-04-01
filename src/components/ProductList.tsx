import React from "react";
import ProductCard from "./ProductCard";
import { ProductWithDetails } from "@/types/database";

interface ProductListProps {
  products: ProductWithDetails[];
}

/**
 * Reusable ProductList component for displaying a grid of products.
 */
export default function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full py-20 text-center">
        <p className="text-slate-400">Chưa có sản phẩm nào trong cửa hàng.</p>
      </div>
    );
  }

  return (
    <section className="mt-2 md:mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
        />
      ))}
    </section>
  );
}
