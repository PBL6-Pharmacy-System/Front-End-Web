# Flash Sale Product Detail Fix

## Vấn đề
Khi click vào sản phẩm trong Flash Sale Section, không thể xem chi tiết sản phẩm hoặc load sai API.

## Giải pháp đã áp dụng

### 1. FlashSaleSection.jsx
**Thêm onClick handler cho product card:**
```jsx
<div 
  key={product.id}
  className="product-card"
  onClick={() => handleProductClick(product)}
  style={{ cursor: 'pointer' }}
>
```

**Flow hoạt động:**
- User click vào sản phẩm Flash Sale
- Gọi `handleProductClick(product)` 
- Callback `onProductClick(product.id, 'flash-sale')` được gọi
- App1.jsx nhận callback và set:
  - `selectedProductId = product.id`
  - `productSource = 'flash-sale'`
  - `currentPage = 'productDetail'`

### 2. ProductDetailPage.jsx
**Sử dụng đúng API cho flash-sale products:**
```jsx
case 'flash-sale':
  console.log('🔥 Fetching Flash Sale product');
  // Flash sale products cũng dùng API /api/products/{id}
  const { getProductById: getFlashSaleProduct } = await import('../services/catalogProductApi');
  response = await getFlashSaleProduct(productId);
  break;
```

**Lý do:**
- Flash sale products được lưu trong database products bình thường
- API `/api/flashsales` chỉ trả về danh sách flash sales với thông tin giá giảm
- Để xem chi tiết sản phẩm cụ thể, cần dùng API `/api/products/{id}`
- API này trả về đầy đủ thông tin: categories, unittype, specification, images, etc.

## Kết quả
✅ Click vào sản phẩm Flash Sale → Chuyển sang ProductDetailPage
✅ Load đúng API `/api/products/{id}` để lấy thông tin chi tiết
✅ Hiển thị đúng: danh mục, quy cách, hình ảnh, mô tả
✅ Áp dụng cùng logic với CatalogProducts (categories.name, unittype.name)

## Test
1. Mở trang chủ
2. Scroll xuống Flash Sale Section
3. Click vào bất kỳ sản phẩm nào
4. Kiểm tra ProductDetailPage có load đúng thông tin không
5. Kiểm tra console log: "🔥 Fetching Flash Sale product"
6. Verify: Danh mục, Quy cách, Hình ảnh hiển thị chính xác

## API Endpoints sử dụng
- **Flash Sale List:** `GET /api/flashsales` - Lấy danh sách flash sales với giá giảm
- **Product Detail:** `GET /api/products/{id}` - Lấy chi tiết sản phẩm đầy đủ
