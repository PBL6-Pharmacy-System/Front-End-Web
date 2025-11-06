# ✅ Checklist: Tích hợp API Subcategory

## 📋 Tổng quan
Hệ thống đã được chuẩn bị sẵn để tích hợp API thật cho các subcategory. File này sẽ giúp bạn kiểm tra và đảm bảo mọi thứ hoạt động đúng.

---

## 🎯 Các file quan trọng

### 1. **`src/services/subcategoryApiMap.js`** ⭐
**Mục đích:** Map tên subcategory sang API endpoint

**Cấu trúc hiện tại:**
```javascript
const SUBCATEGORY_ENDPOINTS = [
  { name: 'Máy massage', api: 'http://localhost:3000/api/products/category/Máy massage' },
  { name: 'Vitamin tổng hợp', api: 'http://localhost:3000/api/products/category/Vitamin tổng hợp' },
  // ... 120+ categories
];
```

**Những gì cần kiểm tra khi chiều:**
- ✅ URL endpoints có đúng format không?
- ✅ Tên category có khớp với backend không?
- ✅ URL encoding có được xử lý đúng không? (ví dụ: khoảng trắng, dấu)

**Auto-conversion:**
- Hệ thống tự động chuyển `localhost:3000` URLs thành relative paths
- `http://localhost:3000/api/products/category/Máy massage` → `/api/products/category/Máy massage`
- Slugify: `Máy massage` → `may-massage` (key để lookup)

---

### 2. **`src/services/catalogProductApi.js`** ⭐
**Mục đích:** Service chính để fetch products

**Flow xử lý:**
```
1. Check SUBCATEGORY_API_MAP có endpoint cho category này không?
2. Nếu có → Call API endpoint đó
3. Nếu fail → Fallback sang MockApiService
4. Nếu không có map → Try default endpoint
5. Normalize response về format chuẩn
```

**Code quan trọng cần review:**

```javascript
// Line 60-80: Logic chọn endpoint
if (SUBCATEGORY_API_MAP[categoryKey]) {
  mappedEndpoint = SUBCATEGORY_API_MAP[categoryKey];
}

// Fuzzy matching nếu không match chính xác
const found = Object.entries(SUBCATEGORY_API_MAP).find(
  ([k]) => k === categoryKey || k.includes(categoryKey) || categoryKey.includes(k)
);
```

**Normalize response (Line 22-36):**
```javascript
const normalizeApiResponse = (payload) => {
  // Xử lý các format:
  // { products: [...], total: N }
  // { data: [...], total: N }
  // [...]
  // { data: { data: [...] } }
}
```

**⚠️ Vấn đề có thể gặp:**
1. Backend trả về format khác → Cần update `normalizeApiResponse`
2. URL encoding không đúng → Khoảng trắng, dấu tiếng Việt
3. CORS issues → Đảm bảo proxy Vite hoạt động

---

### 3. **`src/hooks/useCatalogProducts.js`** 
**Mục đích:** React hook để load products

**Flow:**
```
1. Nhận categoryKey hoặc searchQuery
2. Gọi getProductsByCategory() hoặc searchProducts()
3. Normalize response về array
4. Set state: products, loading, error
```

**Code cần review (Line 40-60):**
```javascript
// Defensive: xử lý nhiều format response
if (Array.isArray(result.data)) {
  productsData = result.data;
} else if (result.data && Array.isArray(result.data.products)) {
  productsData = result.data.products;
} else if (Array.isArray(result.products)) {
  productsData = result.products;
}
```

**✅ Đã xử lý tốt các edge cases**

---

### 4. **`src/components/CatalogProducts.jsx`**
**Mục đích:** Component hiển thị danh sách products

**Xử lý:**
- Nhận `category` prop (object hoặc string)
- Extract `categoryKey` và `categoryName`
- Gọi `useCatalogProducts` hook
- Apply filters và sorting
- Hiển thị products

**✅ Đã xử lý tốt cả object và string category**

---

## 🔧 Khi thêm API thật - Bước làm

### Bước 1: Cập nhật `subcategoryApiMap.js`

**Option A: Giữ nguyên format hiện tại**
```javascript
const SUBCATEGORY_ENDPOINTS = [
  { name: 'Máy massage', api: 'http://localhost:3000/api/products/category/Máy massage' },
  // Chỉ cần update URL nếu backend thay đổi
];
```

**Option B: Nếu backend thay đổi format URL**
```javascript
const SUBCATEGORY_ENDPOINTS = [
  { name: 'Máy massage', api: '/api/subcategories/may-massage/products' },
  { name: 'Vitamin tổng hợp', api: '/api/subcategories/vitamin-tong-hop/products' },
];
```

### Bước 2: Test từng endpoint

**Test script:**
```bash
# PowerShell
$categories = @(
  "Máy massage",
  "Vitamin tổng hợp",
  "Kem chống nắng da mặt"
)

foreach ($cat in $categories) {
  Write-Host "Testing: $cat" -ForegroundColor Cyan
  $encoded = [System.Web.HttpUtility]::UrlEncode($cat)
  $url = "http://localhost:3000/api/products/category/$encoded"
  
  try {
    $response = Invoke-RestMethod -Uri $url
    Write-Host "✅ Success: $($response.data.products.length) products" -ForegroundColor Green
  } catch {
    Write-Host "❌ Failed: $_" -ForegroundColor Red
  }
  Write-Host ""
}
```

### Bước 3: Kiểm tra Response Format

**Expected format từ backend:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Product name",
        "price": "100000",
        "images": ["url1", "url2"],
        "category_id": 1,
        ...
      }
    ],
    "total": 100
  }
}
```

**Alternative formats (cũng được hỗ trợ):**
```json
// Format 1
{
  "products": [...],
  "total": 100
}

// Format 2
{
  "data": [...],
  "total": 100
}

// Format 3
[...] // Direct array
```

### Bước 4: Update `normalizeApiResponse` nếu cần

Nếu backend trả về format hoàn toàn khác:

```javascript
// In catalogProductApi.js
const normalizeApiResponse = (payload) => {
  if (!payload) return { data: [], total: 0 };

  // THÊM format mới của bạn ở đây
  if (payload.your_custom_format) {
    return {
      data: payload.your_custom_format.items,
      total: payload.your_custom_format.count
    };
  }

  // Giữ nguyên các format cũ...
};
```

---

## 🐛 Troubleshooting

### Vấn đề 1: API không được gọi
**Triệu chứng:** Console không thấy network request

**Kiểm tra:**
```javascript
// Trong catalogProductApi.js, thêm log:
console.log('🔍 Looking up category:', categoryKey);
console.log('📍 SUBCATEGORY_API_MAP:', SUBCATEGORY_API_MAP);
console.log('🎯 Mapped endpoint:', mappedEndpoint);
```

**Nguyên nhân thường gặp:**
- `categoryKey` không match với key trong map
- Slugify function có vấn đề
- Map object rỗng

### Vấn đề 2: CORS Error
**Triệu chứng:** 
```
Access to fetch at 'http://localhost:3000/...' has been blocked by CORS policy
```

**Giải pháp:**
1. **Kiểm tra Vite proxy** (`vite.config.js`):
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
    secure: false,
  }
}
```

2. **Đảm bảo dùng relative path:**
```javascript
// ❌ Sai
fetch('http://localhost:3000/api/products/...')

// ✅ Đúng
fetch('/api/products/...')
```

3. **Backend CORS config** (nếu production):
```javascript
// Express.js
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Vấn đề 3: URL Encoding sai
**Triệu chứng:** API trả về 404 cho category có dấu

**Test:**
```javascript
// In browser console:
const testCategory = 'Vitamin & Khoáng chất';
console.log('Original:', testCategory);
console.log('encodeURI:', encodeURI(testCategory));
console.log('encodeURIComponent:', encodeURIComponent(testCategory));
```

**Fix trong catalogProductApi.js:**
```javascript
const url = `${API_BASE}/${encodeURIComponent(categoryKey)}`;
```

### Vấn đề 4: Response format không khớp
**Triệu chứng:** `products` array rỗng dù API trả về data

**Debug:**
```javascript
// Trong useCatalogProducts.js, thêm:
console.log('📦 Raw API result:', JSON.stringify(result, null, 2));
console.log('🔍 result.data:', result.data);
console.log('🔍 Array.isArray(result.data):', Array.isArray(result.data));
```

**Fix:** Update normalize logic trong `useCatalogProducts.js` (line 40-60)

### Vấn đề 5: Images không hiển thị
**Triệu chứng:** Product card hiển thị nhưng không có ảnh

**Kiểm tra:**
```javascript
// Trong ProductCard.jsx, log:
console.log('Product images:', product.images);
console.log('Product image:', product.image);
console.log('Image URL:', product.image_url);
```

**Đảm bảo mapping đúng:**
```javascript
// Backend field → Frontend field
image_url → image
images → images (array)
```

---

## ✅ Testing Checklist

Khi thêm API thật, test theo thứ tự:

### 1. Backend API Test
```bash
# Test individual endpoints
curl http://localhost:3000/api/products/category/May%20massage

# Check response format
curl http://localhost:3000/api/products/category/Vitamin%20tong%20hop | jq .
```

### 2. Frontend Service Test
```javascript
// In browser console:
import { getProductsByCategory } from './services/catalogProductApi';
const result = await getProductsByCategory('may-massage');
console.log('Result:', result);
```

### 3. Component Test
- [ ] Mở trang catalog
- [ ] Chọn từng category
- [ ] Kiểm tra console logs
- [ ] Xem products có load không
- [ ] Test pagination
- [ ] Test filters
- [ ] Test sorting
- [ ] Test search

### 4. Edge Cases
- [ ] Category không tồn tại
- [ ] API timeout
- [ ] API trả về lỗi 500
- [ ] Response rỗng
- [ ] Response format khác
- [ ] Special characters trong category name
- [ ] Dấu tiếng Việt trong URL

---

## 📊 Backend API Requirements

Để hệ thống hoạt động tốt nhất, backend nên:

### 1. Consistent Response Format
```json
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "message": "Success"
}
```

### 2. Product Object Format
```json
{
  "id": 1,
  "name": "Product Name",
  "description": "...",
  "price": "100000",
  "sale_price": "80000",
  "images": ["url1", "url2"],
  "image_url": "url1",
  "stock": 50,
  "category_id": 1,
  "category_name": "Category",
  "brand": "Brand Name",
  "specification": "Hộp 30 viên",
  "manufacturer": "Company",
  "in_stock": true
}
```

### 3. URL Format Options

**Option 1: Category Name** (Hiện tại)
```
GET /api/products/category/:categoryName
GET /api/products/category/Máy%20massage
```

**Option 2: Category Slug**
```
GET /api/products/category/:slug
GET /api/products/category/may-massage
```

**Option 3: Category ID**
```
GET /api/products/category/:id
GET /api/products/category/123
```

**Khuyến nghị:** Option 2 (slug) - dễ đọc, SEO friendly, không có vấn đề encoding

### 4. Query Parameters Support
```
GET /api/products/category/:category?page=1&limit=20&sort=price_asc
```

### 5. Error Response Format
```json
{
  "success": false,
  "error": "Category not found",
  "message": "Category 'xyz' does not exist",
  "statusCode": 404
}
```

---

## 🚀 Quick Start - Khi chiều test

### 1. Backup code hiện tại
```bash
cd "e:\PBL6\medicineShop-no1 - Copy\MedicineShop"
git add .
git commit -m "Before subcategory API integration"
```

### 2. Test 1 endpoint trước
```javascript
// Chọn 1 category phổ biến, ví dụ: "Máy massage"
// Update subcategoryApiMap.js với URL mới
// Test trong browser
```

### 3. Kiểm tra logs
```javascript
// Mở DevTools Console
// Filter logs: 🔍 📦 ✅ ❌
// Xem flow: lookup → fetch → normalize → display
```

### 4. Rollback nếu cần
```bash
git reset --hard HEAD
# hoặc
git checkout -- src/services/subcategoryApiMap.js
```

---

## 📝 Notes

### Strengths của implementation hiện tại:
✅ Hỗ trợ nhiều response formats
✅ Fallback mechanism (API → Mock)
✅ Fuzzy matching cho category keys
✅ Auto URL conversion (absolute → relative)
✅ Defensive programming (null checks)
✅ Comprehensive error handling
✅ Good logging for debugging

### Potential Issues cần lưu ý:
⚠️ Slugify function có thể không perfect cho mọi edge case
⚠️ Fuzzy matching có thể match sai nếu tên category giống nhau
⚠️ Backend response format có thể thay đổi
⚠️ URL encoding cho tiếng Việt cần test kỹ
⚠️ Image URLs cần handle cả relative và absolute paths

### Recommended Improvements (tương lai):
💡 Add caching (localStorage hoặc React Query)
💡 Add retry logic cho failed requests
💡 Add request debouncing
💡 Better error messages for users
💡 Loading skeleton cho better UX
💡 Lazy load images
💡 Add infinite scroll option

---

## 🎯 Success Criteria

API integration thành công khi:
- [ ] Tất cả 120+ categories load được products
- [ ] Response time < 1 giây
- [ ] Không có CORS errors
- [ ] Images hiển thị đúng
- [ ] Filters hoạt động
- [ ] Sorting hoạt động
- [ ] Search hoạt động
- [ ] Pagination hoạt động (nếu có)
- [ ] Error handling gracefully
- [ ] Loading states hiển thị đúng

---

**Last Updated:** Oct 30, 2025
**Status:** ✅ Ready for API integration
**Contact:** Check with backend team for final endpoint URLs
