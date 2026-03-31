## Error Type
Console Error

## Error Message
Supabase Error [createProduct]: "new row for relation \"products\" violates check constraint \"products_check\""


    at Object.createProduct (src/services/productService.ts:161:15)
    at async onSubmit (src/hooks/useProductForm.ts:92:11)
    at async executeSubmit (src/components/admin/ProductForm.tsx:77:20)

## Code Frame
  159 |
  160 |     if (error) {
> 161 |       console.error("Supabase Error [createProduct]:", error.message);
      |               ^
  162 |     }
  163 |
  164 |     return { data: data as Product, error };

Next.js version: 16.2.1 (Turbopack)
