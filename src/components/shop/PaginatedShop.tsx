"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductList from "@/components/ProductList";
import { Pagination } from "@/components/ui/Pagination";
import { ProductWithDetails } from "@/types/database";

interface PaginatedShopProps {
  products: ProductWithDetails[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Client Component that wraps ProductList and Pagination to handle URL-based navigation.
 */
export default function PaginatedShop({
  products,
  totalCount,
  page,
  pageSize,
}: PaginatedShopProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    
    // Always scroll to top on page change
    router.push(`/?${params.toString()}`, { scroll: true });
  };

  // pageSize is fixed to 16 for the shop, so we don't really need to set it via UI,
  // but we provide a dummy function to satisfy Pagination props.
  const handlePageSizeChange = () => {};

  return (
    <div className="space-y-12">
      {/* Product Grid */}
      <ProductList products={products} />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-8">
          <Pagination
            page={page}
            setPage={handlePageChange}
            pageSize={pageSize}
            setPageSize={handlePageSizeChange}
            totalPages={totalPages}
            totalCount={totalCount}
            showPageSizeSelector={false} // Hidden as requested
            className="border-none"
          />
        </div>
      )}
    </div>
  );
}
