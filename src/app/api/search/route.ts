import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';
import { searchQuerySchema } from '@/lib/validations/search';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // 1. Validate Query Parameters
    const result = searchQuerySchema.safeParse(params);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message, issues: result.error.issues },
        { status: 400 }
      );
    }

    const { q, limit, type } = result.data;
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Không thể kết nối cơ sở dữ liệu' },
        { status: 500 }
      );
    }

    // 2. Thực hiện tìm kiếm song song (Parallel execution)
    // Tối ưu hóa hiệu năng bằng cách không đợi từng truy vấn một
    const searchPromises = [];

    if (type === "all" || type === "product") {
      searchPromises.push(ProductService.searchProducts(supabase, q, 1, limit));
    } else {
      searchPromises.push(Promise.resolve({ data: [], count: 0 }));
    }

    if (type === "all" || type === "category") {
      searchPromises.push(ProductService.searchCategories(supabase, q, 1, limit));
    } else {
      searchPromises.push(Promise.resolve({ data: [], count: 0 }));
    }

    if (type === "all" || type === "brand") {
      searchPromises.push(ProductService.searchBrands(supabase, q, 1, limit));
    } else {
      searchPromises.push(Promise.resolve({ data: [], count: 0 }));
    }

    const [productsRes, categoriesRes, brandsRes] = await Promise.all(searchPromises);

    // 3. Gộp và trả về kết quả
    const totalResults = productsRes.count + categoriesRes.count + brandsRes.count;

    return NextResponse.json({
      products: productsRes.data,
      categories: categoriesRes.data,
      brands: brandsRes.data,
      total: totalResults,
      query: q,
      limit,
      type
    }, { status: 200 });

  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi thực hiện tìm kiếm' },
      { status: 500 }
    );
  }
}
