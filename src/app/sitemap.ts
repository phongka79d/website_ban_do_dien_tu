import { MetadataRoute } from 'next';
import { ProductService } from '@/services/productService';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tsshopping.io.vn';
  const supabase = await createClient();

  if (!supabase) return [];

  // 1. Fetch Categories & Products
  const categories = await ProductService.getCategories(supabase);
  const products = await ProductService.getProducts(supabase);

  // 2. Static Routes
  const staticRoutes = [
    '',
    '/products',
    '/cart',
    '/track-order',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 3. Category Routes
  const categoryRoutes = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // 4. Product Routes
  const productRoutes = products.map((prod) => ({
    url: `${baseUrl}/products/${prod.id}`,
    lastModified: new Date(prod.updated_at || prod.created_at || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
