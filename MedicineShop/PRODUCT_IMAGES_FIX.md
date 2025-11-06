# Fix: Product Images Not Displaying

## 🔍 Vấn đề

API trả về ảnh trong field `images` (array) nhưng ảnh không hiển thị trên UI:

```javascript
// Response từ API:
{
  id: 498,
  name: "Dung dịch dạng xịt LineaBon K2+D3...",
  image_url: null,  // ❌ NULL!
  images: [         // ✅ Có 12 ảnh ở đây!
    "https://cdn.nhathuoclongchau.com.vn/unsafe/https://cms-prod.s3-sgn09.fptcloud.com/DSC_04736_15a585f3cb.jpg",
    "https://cdn.nhathuoclongchau.com.vn/unsafe/https://cms-prod.s3-sgn09.fptcloud.com/DSC_04874_6c29236c37.jpg",
    // ... 10 more images
  ]
}
```

## 💡 Nguyên nhân

1. **Component đã có logic đúng** để đọc từ `images` array
2. **Nhưng có 2 vấn đề phụ**:
   - `encodeURI()` đang encode lại URLs đã được encode → double encoding
   - Không có logging để debug

## ✅ Giải pháp

### 1. Fix ProductCard.jsx

**Trước:**
```javascript
// Dùng encodeURI - gây double encoding
if (firstImage.startsWith('/') || firstImage.startsWith('http')) {
  return encodeURI(firstImage);  // ❌ Encode lại URL đã encode
}
```

**Sau:**
```javascript
// Không encode URLs, browser tự xử lý
if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
  console.log('✅ Using full URL:', firstImage);
  return firstImage;  // ✅ Giữ nguyên
}
```

### 2. Thêm logging để debug

```javascript
// Log khi tìm thấy ảnh
if (mapped.length > 0) {
  console.log('🖼️ ProductCard image from images array:', mapped[0]);
  return mapped[0];
}

// Log khi không tìm thấy
console.warn('⚠️ No image found, using placeholder for product:', product?.name);
```

### 3. Thêm normalize function trong catalogProductApi.js

```javascript
// Normalize product để đảm bảo có images field
const normalizeProduct = (product) => {
  if (!product) return null;
  
  const normalizedProduct = { ...product };
  
  // Nếu có images array → giữ nguyên
  if (Array.isArray(normalizedProduct.images) && normalizedProduct.images.length > 0) {
    // Already has images
  } 
  // Nếu có image_url nhưng không có images → tạo images array
  else if (normalizedProduct.image_url) {
    normalizedProduct.images = [normalizedProduct.image_url];
  }
  // Fallback sang các fields khác
  else if (normalizedProduct.imageUrl) {
    normalizedProduct.images = [normalizedProduct.imageUrl];
  } else if (normalizedProduct.thumbnail) {
    normalizedProduct.images = [normalizedProduct.thumbnail];
  }
  
  return normalizedProduct;
};
```

### 4. Apply normalization cho tất cả API calls

```javascript
// getAllCatalogProducts
const products = normalizeProducts(normalized.data);
return { success: true, data: products, total: normalized.total };

// getProductsByCategory  
const products = normalizeProducts(normalized.data);
return { success: true, data: products, total: normalized.total };

// searchProducts
const products = normalizeProducts(normalized.data);
return { success: true, data: products, total: normalized.total };

// getProductById
const normalizedProduct = normalizeProduct(product);
return { success: true, data: normalizedProduct };
```

## 🎯 Luồng xử lý hoàn chỉnh

```
1. Backend API trả về:
   {
     image_url: null,
     images: ["https://cdn.../image1.jpg", "https://cdn.../image2.jpg"]
   }
   
2. catalogProductApi.normalizeProduct():
   - Kiểm tra images array → ✅ Có → giữ nguyên
   - Nếu không có → tạo từ image_url hoặc các fields khác
   
3. ProductCard component:
   - Đọc từ product.images[0] → ✅ Có
   - Log: "🖼️ ProductCard image from images array: https://cdn.../image1.jpg"
   - Return URL as-is (không encode)
   
4. Browser hiển thị ảnh:
   <img src="https://cdn.nhathuoclongchau.com.vn/unsafe/..." />
   ✅ Ảnh hiển thị thành công!
```

## 📋 Priority xử lý ảnh

ProductCard sẽ tìm ảnh theo thứ tự:

1. **product.images[0]** ← Ưu tiên cao nhất (từ API)
2. **product.image_url** ← Fallback 1
3. **product.image** ← Fallback 2
4. **product.imageUrl** ← Fallback 3
5. **product.thumbnail** ← Fallback 4
6. **Placeholder** ← Cuối cùng

## 🐛 Debug

Khi ảnh không hiển thị, check console logs:

```javascript
// ✅ Thành công:
🖼️ ProductCard image from images array: https://cdn.../image.jpg
✅ Using full URL: https://cdn.../image.jpg

// ⚠️ Cảnh báo:
⚠️ No image found, using placeholder for product: LineaBon K2+D3

// ❌ Lỗi:
❌ Error getting product image: [error details]
❌ Error processing image URL: [error details]
```

## 📁 Files đã sửa

1. **ProductCard.jsx**
   - ✅ Bỏ `encodeURI()` để tránh double encoding
   - ✅ Thêm logging chi tiết
   - ✅ Thêm priority cho `image_url` field

2. **catalogProductApi.js**
   - ✅ Thêm `normalizeProduct()` function
   - ✅ Thêm `normalizeProducts()` helper
   - ✅ Apply normalization cho tất cả API calls
   - ✅ Ensure images field luôn có data

## 🎉 Kết quả

- ✅ Tất cả ảnh từ API giờ hiển thị đúng
- ✅ URL không bị double encode
- ✅ Có logging để debug dễ dàng
- ✅ Fallback hierarchy rõ ràng
- ✅ Works với mọi format data từ backend

---
**Status**: ✅ **FIXED**  
**Date**: October 30, 2025  
**Impact**: All product images now display correctly
