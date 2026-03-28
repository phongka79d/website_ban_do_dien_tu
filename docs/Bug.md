- **Phát hiện quan trọng (Critical Evidence)**: 
    - Click link "Quay lại trang chủ" (Soft Navigation/Next Link) -> **Carousel HOẠT ĐỘNG bình thường**.
    - Nhấn nút **Back** của trình duyệt (Router Cache Restoration) -> **Carousel ĐÓNG BĂNG**.
- Điều này chứng minh: Lỗi không nằm ở code của trang Home, mà nằm ở việc Next.js 16 **khôi phục trang từ cache không đúng cách** (không re-hydrate event delegation).

### 4.23. The "Soft Back" Interceptor (Thất bại)
- **Ý tưởng**: Dùng `popstate` + `router.replace()` + `router.refresh()` để đánh lừa Next.js thực hiện Soft Navigation thay vì restore cache.
- **Kết quả**: ❌ Thất bại. Next.js 16 vẫn ưu tiên restore từ Activity cache bị hỏng, và đợt navigation này không đủ mạnh để re-mount lại các component đã bị đóng băng.

### 4.24. Ultimate Key Reset (Thất bại)
- **Ý tưởng**: Đặt một `key={pathname}` ở cấp độ `ShopLayout` (Client Component) để ép React hủy diệt hoàn toàn cây component cũ và render lại từ đầu.
- **Kết quả**: ❌ Thất bại. Next.js 16/React 19 vẫn ưu tiên khôi phục từ Offscreen cache mà không tôn trọng `key` (hoặc `pathname` bị stale).

### 4.25. Native Hydration Trigger (Thất bại)
- **Ý tưởng**: Dùng script Vanilla JS tiêm thẳng vào Layout để bắt `popstate` và thực hiện "DOM kick".
- **Kết quả**: ❌ Thất bại. Ngay cả Native Reflow cũng không đánh thức được React Hydration trong instance cache.

### 4.26. Service Worker Interceptor (Thành công - Giải pháp tối ưu nhất)
- **Ý tưởng**: Dùng Service Worker chặn request navigation và ép trình duyệt coi đó là một "Network-only fetch" để bypass Router Cache hoàn toàn ở tầng thấp nhất.
- **Kết quả**: ✅ Thành công rực rỡ. Bằng cách ép trình duyệt fetch mới hoàn toàn từ server khi nhấn Back, chúng ta đã buộc Next.js 16 phải khởi tạo lại toàn bộ Context và Event Delegation.

## 2. Environment (Môi trường)

- **Framework**: Next.js 16.2.1 (App Router, Turbopack)
- **UI Library**: React 19.2.4
- **Components**: Embla Carousel, Lucide Icons, Tailwind CSS

## 3. Root Cause Analysis (Phân tích nguyên nhân sâu xa)

### 3.1. Next.js 16 Activity (Keep-Alive) Mechanism
Next.js 16 không unmount trang khi người dùng navigate đi. Thay vào đó, nó bọc toàn bộ trang cũ trong một component tương tự React `<Offscreen>` (gọi là `<Activity>`) và set `display: none !important`. 

### 3.2. Sự cố phục hồi (Restoration Failure)
Khi nhấn Back, Next.js remove `display: none` để hiện lại trang. Tuy nhiên:
1. **React Lifecycle không chạy lại**: Không `useEffect`, không re-render, không mount.
2. **Event Delegation bị đứt**: Hệ thống bắt sự kiện tập trung của React không tái kết nối được với các phần tử DOM đã bị "đóng băng" trong trạng thái `display: none`.
3. **Router Crash**: Các component (như `Link`) hoặc logic ngầm cố gắng truy cập Router trước khi Next.js kịp initialize lại context cho trang đó, gây ra vòng lặp crash trong terminal.

## 4. Nhật ký các nỗ lực (20+ Attempts)

| STT | Phương pháp | Kết quả | Lý do thất bại |
|:---:|:---|:---:|:---|
| 4.1-4.7 | Native Events (`popstate`, `pageshow`) | ❌ | Next.js intercept và swallow toàn bộ event này. |
| 4.8 | `template.tsx` | ❌ | Router Cache vẫn phục vụ instance cũ, bypass template. |
| 4.9, 4.14 | `staleTimes` config | ❌ | Không ảnh hưởng đến hành vi "Instant Back" của Next 16. |
| 4.15 | `IntersectionObserver` | ❌ | Không fire khi chuyển từ `display: none` -> visible. |
| 4.20 | Native Hybrid (Poll `onclick` on Refs) | ❌ | Kể cả gắn listener thuần trực tiếp vào DOM vẫn không fire được, ám chỉ DOM tree bị detach ở level trình duyệt hoặc bị block bởi router crash. |

## 5. Bằng chứng loại trừ

- ✅ **BFCache**: Đã xác nhận "Not served from back/forward cache" (bị block bởi WebSocket/HMR).
- ✅ **Carousel Code**: Đã thay bằng bản Static hoàn toàn và xác nhận lỗi vẫn tồn tại -> **Lỗi nằm ở Framework/Router, không phải ở component cụ thể**.

### 4.21. The "Scroll Hack" (Thất bại)
- **Ý tưởng**: Dùng `NavigationGuard` bắt `popstate` để set flag và dùng native `scroll` event để gọi `window.location.reload()`.
- **Kết quả**: ❌ Thất bại. Có vẻ như ngay cả các sự kiện native này cũng bị Next.js 16 vô hiệu hoá hoặc `location.reload()` bị chặn khi trang đang ở trạng thái restore.

### 4.22. Architectural Fix: Root Suspense + Not Found Handler (Đang thử)
- **Ý tưởng**: 
    1. **Root Suspense**: Next.js 16 App Router yêu cầu `Suspense` để handle việc restore "Activity" cache một cách ổn định. Thêm `<Suspense>` vào `layout.tsx`.
    2. **Not Found Handler**: Tạo `not-found.tsx` để xử lý các path lỗi `/1`, `/product/...`. Điều này ngăn Router rơi vào vòng lặp prefetch vô tận khi gặp 404.
    3. **Prefetch Disable**: Set `prefetch={false}` cho các Link trong Carousel để tránh Router Dispatcher chạy quá sớm khi context chưa kịp initialized sau khi Back.
- **Kết quả**: ✅ Thành công (Phần lớn). Đây là nền tảng kiến trúc cần thiết để SW hoạt động ổn định.
