# Flash Sale API Integration

## Tổng quan
Đã chuyển FlashSaleSection từ sử dụng dữ liệu JSON tĩnh sang sử dụng API endpoint thực tế.

## API Endpoint
```
GET http://localhost:3000/api/flashsales
```

## Các thay đổi

### 1. Service API mới: `flashSaleApi.js`
**File:** `src/services/flashSaleApi.js`

**Chức năng:**
- `getFlashSaleProducts()` - Lấy tất cả sản phẩm flash sale
- `getFlashSaleProductById(productId)` - Lấy sản phẩm flash sale theo ID
- `getActiveFlashSales()` - Lấy flash sale đang hoạt động (nếu backend hỗ trợ)

**Đặc điểm:**
- Xử lý nhiều định dạng response từ backend
- Transform dữ liệu API về format phù hợp với frontend
- Xử lý lỗi và fallback gracefully
- Normalize URL và hình ảnh

### 2. Hook cập nhật: `useFlashSaleProducts.js`
**Thay đổi:**
```javascript
// Trước:
import { MockApiService } from '../services/productApi';
const response = await MockApiService.getFlashSaleProducts();

// Sau:
import { getFlashSaleProducts } from '../services/flashSaleApi';
const response = await getFlashSaleProducts();
```

**Cải tiến:**
- Sử dụng API thực thay vì mock data
- Thêm logging để debug
- Xử lý lỗi tốt hơn

### 3. Component cập nhật: `FlashSaleSection.jsx`
**Thay đổi:**
- Cải thiện xử lý hình ảnh từ API
- Hỗ trợ cả array và object images
- URL encoding/decoding tự động
- Fallback hình ảnh khi lỗi

## Format dữ liệu API Backend

### Request
```http
GET /api/flashsales
```

### Expected Response Format (Option 1 - Recommended)
```json
{
  "data": [
    {
      "id": 1,
      "name": "Sản phẩm flash sale",
      "originalPrice": "100000",
      "salePrice": "80000",
      "flashSalePrice": "80000",
      "image": "http://localhost:3000/uploads/product1.jpg",
      "images": ["http://localhost:3000/uploads/product1.jpg"],
      "quantity": "Hộp 30 viên",
      "stock": 50,
      "totalStock": 200,
      "sold": 150,
      "discount": "20%",
      "discountPercent": 20,
      "category": "Vitamin",
      "subcategory": "Vitamin C",
      "brand": "Brand Name",
      "description": "Mô tả sản phẩm",
      "inStock": true,
      "flashSaleId": "fs001",
      "startTime": "2025-10-30T00:00:00Z",
      "endTime": "2025-10-30T23:59:59Z"
    }
  ],
  "total": 10,
  "message": "Success"
}
```

### Alternative Response Formats (Also Supported)

**Option 2 - Direct Array:**
```json
[
  { "id": 1, "name": "Product 1", ... },
  { "id": 2, "name": "Product 2", ... }
]
```

**Option 3 - Products Array:**
```json
{
  "products": [...],
  "total": 10
}
```

## Mapping dữ liệu

Service tự động chuyển đổi các field name khác nhau:

| Backend Field | Frontend Field | Fallback |
|--------------|----------------|----------|
| `originalPrice` / `price` | `price` | `"0"` |
| `salePrice` / `flashSalePrice` / `support` | `support` | `"0"` |
| `image` / `imageUrl` / `images[0]` | `image` | `""` |
| `availableStock` / `stock` | `stock` | `99` |
| `initialStock` / `totalStock` | `totalStock` | `200` |
| `soldCount` / `sold` | `sold` | `0` |

## Testing

### 1. Kiểm tra backend API đang chạy:
```bash
# Backend phải chạy ở port 3000
cd e:\PBL6\backend\Back-End-Web
npm start
```

### 2. Kiểm tra endpoint:
```bash
# Test bằng browser hoặc curl
curl http://localhost:3000/api/flashsales
```

### 3. Chạy frontend:
```bash
cd e:\PBL6\medicineShop-no1 - Copy\MedicineShop
npm run dev
```

### 4. Kiểm tra console logs:
Mở DevTools Console để xem:
- `🔄 Fetching flash sale products from API...`
- `✅ Flash sale products loaded: X`
- Hoặc lỗi nếu có

## Xử lý lỗi

### Khi API không khả dụng:
- Hiển thị loading spinner
- Sau đó hiển thị thông báo lỗi
- Có nút "Thử lại" để reload

### Khi hình ảnh không load được:
- Tự động fallback sang placeholder
- Không crash component

### Khi dữ liệu không đúng format:
- Service tự động normalize
- Transform về format frontend cần
- Filter null/invalid products

## Vite Proxy Configuration

Proxy đã được cấu hình trong `vite.config.js`:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path
  }
}
```

Điều này có nghĩa:
- Frontend request: `http://localhost:5173/api/flashsales`
- Được proxy tới: `http://localhost:3000/api/flashsales`
- Tránh CORS issues trong development

## Production Deployment

Trong production, cần:
1. Cập nhật `API_BASE` trong `flashSaleApi.js` hoặc dùng environment variables
2. Đảm bảo backend CORS được cấu hình đúng
3. Sử dụng absolute URL cho API endpoint

```javascript
// Ví dụ với environment variable
const API_BASE = import.meta.env.VITE_API_URL || '/api/flashsales';
```

## Troubleshooting

### Lỗi: "Failed to fetch flash sale products"
- ✅ Kiểm tra backend đang chạy
- ✅ Kiểm tra port 3000 available
- ✅ Kiểm tra endpoint `/api/flashsales` tồn tại

### Lỗi: "CORS policy"
- ✅ Trong dev: proxy Vite sẽ xử lý
- ✅ Trong prod: cấu hình CORS trong backend

### Hình ảnh không hiển thị:
- ✅ Kiểm tra URL hình ảnh từ API
- ✅ Kiểm tra static file serving trong backend
- ✅ Kiểm tra path uploads folder

### Dữ liệu bị sai format:
- ✅ Kiểm tra console logs
- ✅ Service sẽ tự động transform
- ✅ Đảm bảo backend return đúng structure

## Next Steps

1. ✅ Test với backend API thực tế
2. ✅ Kiểm tra performance với nhiều sản phẩm
3. ✅ Thêm caching nếu cần (React Query, SWR)
4. ✅ Thêm refresh/reload functionality
5. ✅ Implement pagination từ API (nếu backend hỗ trợ)
