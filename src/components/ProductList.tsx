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
    <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard 
          key={product.id} 
          product={product}
        />
      ))}
    </section>
  );
}
