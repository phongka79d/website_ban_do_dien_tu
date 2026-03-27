# Bug: Carousel Freeze After Back Navigation

## 1. Symptom

- Khi click "Xem chi tiết" (Next.js `<Link>`) trong Carousel → trang 404 (hoặc bất cứ trang nào) → nhấn Back → Carousel **đóng băng hoàn toàn**.
- Autoplay dừng, click tab/mũi tên trong carousel không phản hồi.
- Console không có lỗi JS.
- **F5 reload** thì Carousel hoạt động lại bình thường.

## 2. Environment

- **Next.js**: 16.2.1 (App Router, Turbopack)
- **Carousel**: `embla-carousel-react@8.6.0` + `embla-carousel-autoplay@8.6.0`
- **Navigation**: Client-side via `<Link>` component
- **Route**: Carousel nằm trong `src/app/(shop)/page.tsx` (Server Component)

## 3. Root Cause (Chưa giải quyết)

Next.js Router Cache lưu trữ React tree khi navigate đi. Khi Back, nó restore toàn bộ component tree mà **không chạy lại bất kỳ React lifecycle nào** (không render, không useEffect, không mount/unmount). Embla Carousel giữ reference tới DOM nodes cũ đã bị detach → engine chết.

**Bằng chứng:** Thêm `console.log` ở MỌI vị trí (render body, useEffect, popstate, pageshow, visibilitychange, focus) → **Không có log nào xuất hiện** sau khi bấm Back.

## 4. Các Cách Đã Thử (Tất cả THẤT BẠI)

### 4.1. `pageshow` + `popstate` Event Listeners
- **Ý tưởng**: Bắt sự kiện trình duyệt khi Back để gọi `emblaApi.reInit()`.
- **Kết quả**: ❌ Không fire. Next.js intercept/swallow các event này.

### 4.2. `IntersectionObserver`
- **Ý tưởng**: Detect khi Carousel container trở lại viewport → gọi `reInit()`.
- **Kết quả**: ❌ Observer callback không fire sau Back navigation.

### 4.3. `usePathname()` + `useEffect`
- **Ý tưởng**: Detect pathname thay đổi khi quay lại "/" → trigger `reInit()` hoặc đổi `key`.
- **Kết quả**: ❌ `useEffect` dependency trên `pathname` không fire. Component bị đóng băng hoàn toàn.

### 4.4. `setTimeout` + `emblaApi.reInit()`
- **Ý tưởng**: Delay 150ms sau khi pathname thay đổi rồi reInit.
- **Kết quả**: ❌ Không fire vì `useEffect` không chạy.

### 4.5. Force Remount bằng `key` trên `<div>`
- **Ý tưởng**: Đổi `key` của div container để React destroy/recreate DOM.
- **Kết quả**: ❌ Chỉ đổi key DOM, hook `useEmblaCarousel` vẫn là instance cũ bị đóng băng.

### 4.6. Inner/Outer Component Pattern (Container/Presenter)
- **Ý tưởng**: Tách thành `CarouselInner` (chứa hook) + `Carousel` wrapper (quản lý `remountKey`). Đổi key trên `<CarouselInner key={remountKey}>` để force unmount/remount toàn bộ hook.
- **Kết quả**: ❌ Wrapper component cũng bị đóng băng, `popstate` handler bên trong không fire.

### 4.7. `window` Event Listeners Toàn Diện
- **Ý tưởng**: Đăng ký `popstate`, `pageshow`, `visibilitychange`, `focus` cùng lúc trên `window`.
- **Kết quả**: ❌ **KHÔNG CÓ EVENT NÀO FIRE** sau khi Back. Xác nhận Next.js đóng băng toàn bộ JS execution context.

### 4.8. `template.tsx` (Next.js Official)
- **Ý tưởng**: Tạo `src/app/(shop)/template.tsx` để force Next.js tạo instance mới cho mọi children trên mỗi navigation.
- **Kết quả**: ❌ Không có tác dụng. Router Cache vẫn restore component cũ.

### 4.9. `staleTimes` trong `next.config.ts`
- **Ý tưởng**: Set `experimental.staleTimes.dynamic = 0`, `static = 0` để tắt Router Cache.
- **Kết quả**: ❌ Next.js 16 yêu cầu `static >= 30`. Config bị reject.


### 4.10. Đổi `<Link>` thành `<a>` tag
- **Ý tưởng**: Bypass client-side navigation hoàn toàn, dùng full page navigation.
- **Kết quả**: ❌ Vẫn không giải quyết.

### 4.11. Global Route Change Detector (Custom Event)
- **Ý tưởng**: Tạo `RouteChangeDetector` client component ở root layout (không bao giờ unmount). Dùng `usePathname()` detect route change → dispatch custom event `routechange` trên `window`. Carousel lắng nghe event này để force remount.
- **Kết quả**: ❌ Không hiệu quả. Có thể `usePathname()` trong root layout cũng không update khi Back, hoặc custom event không đến được component bị freeze.

### 4.12. `router.refresh()` + `Date.now()` Key
- **Ý tưởng**: `RouteChangeDetector` gọi `router.refresh()` khi pathname thay đổi → ép Next.js re-execute Server Component → `page.tsx` dùng `key={Date.now()}` → React destroy/recreate Carousel.
- **Kết quả**: ❌ `router.refresh()` không được gọi vì `RouteChangeDetector` cũng bị ảnh hưởng bởi Router Cache.

### 4.13. `export const dynamic = 'force-dynamic'` + `noStore()` trong `page.tsx`
- **Ý tưởng**: Ép Next.js luôn dynamic render page, không cache server-side.
- **Kết quả**: ❌ Chỉ ảnh hưởng server-side rendering, không ảnh hưởng client-side Router Cache.

### 4.14. `staleTimes: { dynamic: 0, static: 30 }` trong `next.config.ts`
- **Ý tưởng**: Set thời gian cache client-side = 0 cho dynamic pages.
- **Kết quả**: ❌ Config được accept nhưng vẫn không ngăn Router Cache khi Back navigation.

## 5. Bằng Chứng Quan Trọng

- `page.tsx` (Server Component) có `console.log("Products in Page:", products.length)` → log này **CHỈ xuất hiện khi F5 reload**, **KHÔNG xuất hiện khi Back**. Xác nhận Next.js phục vụ trang từ client-side cache mà không gọi lại server.
- **BFCache đã được loại trừ**: Chrome DevTools → Application → Back/forward cache xác nhận: "Not served from back/forward cache". WebSocket (Next.js HMR) ngăn BFCache.
- Vấn đề 100% là **Next.js Client-Side Router Cache**, không phải BFCache.

## 6. Kết Luận

Đây là vấn đề ở tầng **Next.js 16 Client-Side Router Cache**. Khi Back navigation:
- Server Component KHÔNG được re-execute (không có GET request, không có server log)
- Client Component KHÔNG được re-render (không có React lifecycle nào chạy)
- Không có browser event nào fire (popstate, pageshow, visibilitychange)
- **Ngay cả các config chính thức của Next.js** (`force-dynamic`, `noStore()`, `staleTimes`, `template.tsx`) cũng không ảnh hưởng client-side Router Cache khi Back

### Hướng Giải Quyết Tiềm Năng (Chưa Thử)
1. **Service Worker**: Intercept navigation requests ở tầng browser để force reload.
2. **Đợi Next.js fix**: Rất có thể là bug của Next.js 16 Router Cache.
3. **Thay thế embla-carousel** bằng pure CSS carousel không phụ thuộc JS DOM references.
