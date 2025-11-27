# Hướng dẫn sử dụng API mới

## Thay đổi chính

### Trước đây (cũ):
```javascript
// Phải manually map từng subcategory trong subcategoryApiMap.js
const SUBCATEGORY_ENDPOINTS = [
  { name: 'canxi-vitamin-d', api: 'http://localhost:3000/api/products/category/Bổ sung Canxi & Vitamin D' },
  { name: 'vitamin-tong-hop', api: 'http://localhost:3000/api/products/category/Vitamin tổng hợp' },
  // ... 100+ dòng
];
```

### Bây giờ (mới):
```javascript
// Tự động tạo endpoint từ title danh mục
import { getCategoryEndpoint, fetchProductsByCategory } from './services/categoryApi';

// Cách 1: Lấy endpoint
const endpoint = getCategoryEndpoint('Bổ sung Canxi & Vitamin D');
// => '/api/products/category/B%E1%BB%95%20sung%20Canxi%20%26%20Vitamin%20D'

// Cách 2: Fetch trực tiếp
const result = await fetchProductsByCategory('Vitamin tổng hợp', { page: 1, limit: 20 });
// => { products: [...], total: 100, pagination: {...} }
```

## API mới

### `getCategoryEndpoint(categoryTitle)`
Tự động tạo endpoint từ title danh mục.

**Parameters:**
- `categoryTitle` (string): Tên hiển thị của danh mục (ví dụ: "Vitamin C các loại")

**Returns:**
- (string): Endpoint đầy đủ với encoding (ví dụ: `/api/products/category/Vitamin%20C%20c%C3%A1c%20lo%E1%BA%A1i`)

### `fetchProductsByCategory(categoryTitle, params)`
Fetch sản phẩm từ danh mục.

**Parameters:**
- `categoryTitle` (string): Tên hiển thị của danh mục
- `params` (object): Query parameters
  - `page` (number): Trang hiện tại (default: 1)
  - `limit` (number): Số sản phẩm mỗi trang (default: 20)
  - `sort` (string): Sắp xếp (optional)

**Returns:**
```javascript
{
  products: [...],      // Mảng sản phẩm đã transform
  total: 100,          // Tổng số sản phẩm
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalPages: 5,
    hasMore: true
  }
}
```

### `buildCategoryMap(menuData)`
Tự động build map cho tất cả categories từ MENU_DATA.

**Parameters:**
- `menuData` (object): MENU_DATA từ `categories.js`

**Returns:**
```javascript
{
  'canxi-vitamin-d': '/api/products/category/B%E1%BB%95%20sung%20Canxi%20%26%20Vitamin%20D',
  'vitamin-tong-hop': '/api/products/category/Vitamin%20t%E1%BB%95ng%20h%E1%BB%A3p',
  // ... tất cả categories
}
```

## Ví dụ sử dụng

### Trong component:
```javascript
import { fetchProductsByCategory } from '../services/categoryApi';
import { useState, useEffect } from 'react';

function ProductList({ categoryTitle }) {
  const [data, setData] = useState({ products: [], total: 0 });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchProductsByCategory(categoryTitle, {
          page: 1,
          limit: 20
        });
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [categoryTitle]);
  
  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <p>Tổng: {data.total} sản phẩm</p>
          {data.products.map(product => (
            <div key={product.id}>{product.name}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Trong catalogProductApi.js:
```javascript
// Tự động tạo endpoints cho subcategories
if (cat.subcategories) {
  cat.subcategories.forEach(sub => {
    if (sub.key && sub.title) {
      endpoints.push({
        key: sub.key,
        title: sub.title,
        endpoint: getCategoryEndpoint(sub.title) // ← Tự động từ title
      });
    }
  });
}
```

## Lợi ích

1. **Không cần maintain subcategoryApiMap.js nữa** - 150+ dòng code mapping thủ công đã bị xóa
2. **Tự động sync với categories.js** - Thêm category mới chỉ cần cập nhật 1 file
3. **Dễ đọc và maintain** - Logic rõ ràng: title → endpoint
4. **Tự động encoding** - Xử lý ký tự đặc biệt, khoảng trắng, tiếng Việt
5. **Backward compatible** - catalogProductApi.js vẫn hoạt động bình thường

## Migration checklist

- [x] Tạo `categoryApi.js` với logic tự động
- [x] Cập nhật `catalogProductApi.js` sử dụng `getCategoryEndpoint()`
- [x] Xóa các file backup không cần thiết (.old, .new, .fixed, .backup)
- [x] Giữ lại `subcategoryApiMap.js` để backward compatibility (có thể xóa sau)
- [ ] Test toàn bộ categories hoạt động đúng
- [ ] Xóa hoàn toàn `subcategoryApiMap.js` sau khi confirm mọi thứ OK
