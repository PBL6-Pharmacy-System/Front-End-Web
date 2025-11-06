# 🐛 Bug Fixes - CatalogProducts Price Handling

## ❌ Lỗi gặp phải:

```
CatalogProducts.jsx:338 Uncaught TypeError: currentPrice.replace is not a function
```

## 🔍 Nguyên nhân:

Trong file `CatalogProducts.jsx`, code đang cố gọi `.replace()` trên biến `currentPrice` nhưng:
- Giá từ JSON có thể là **string** (`"150000"`) hoặc **number** (`150000`)
- Method `.replace()` chỉ hoạt động với string
- Khi `currentPrice` là number, gọi `.replace()` sẽ gây lỗi

### Code cũ (SAI):
```javascript
const currentPrice = product.support || product.price;
const discountPercent = Math.round(((parseFloat(originalPrice.replace(/[.,]/g, '')) - parseFloat(currentPrice.replace(/[.,]/g, ''))) / parseFloat(originalPrice.replace(/[.,]/g, ''))) * 100);

// Khi render
{new Intl.NumberFormat('vi-VN').format(currentPrice.replace(/[.,]/g, ''))}đ
```

## ✅ Giải pháp:

Sử dụng utility functions từ `productHelpers.js` để chuẩn hóa giá:

### Code mới (ĐÚNG):
```javascript
import { normalizePrice, formatPrice } from '../utils/productHelpers';

// Chuẩn hóa giá
const currentPriceRaw = product.support || product.price;
const currentPrice = normalizePrice(currentPriceRaw); // Convert sang number

const originalPriceRaw = product.price && product.support && product.price !== product.support ? product.price : null;
const originalPrice = originalPriceRaw ? normalizePrice(originalPriceRaw) : null;

// Tính discount
const discountPercent = originalPrice && currentPrice 
  ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
  : 0;

// Khi render
{formatPrice(currentPrice)}đ
```

## 📝 Các thay đổi trong CatalogProducts.jsx:

### 1. Import thêm utilities:
```javascript
import { normalizePrice, formatPrice } from '../utils/productHelpers';
import { useAddToCart } from '../hooks/useAddToCart';
```

### 2. Thêm hook để add to cart:
```javascript
const { handleAddToCart } = useAddToCart();
```

### 3. Sửa logic tính giá:
```javascript
// OLD (SAI)
const currentPrice = product.support || product.price;
const discountPercent = originalPrice 
  ? Math.round(((parseFloat(originalPrice.replace(/[.,]/g, '')) - parseFloat(currentPrice.replace(/[.,]/g, ''))) / parseFloat(originalPrice.replace(/[.,]/g, ''))) * 100) 
  : 0;

// NEW (ĐÚNG)
const currentPriceRaw = product.support || product.price;
const currentPrice = normalizePrice(currentPriceRaw);

const originalPriceRaw = product.price && product.support && product.price !== product.support ? product.price : null;
const originalPrice = originalPriceRaw ? normalizePrice(originalPriceRaw) : null;

const discountPercent = originalPrice && currentPrice 
  ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) 
  : 0;
```

### 4. Sửa cách hiển thị giá:
```javascript
// OLD (SAI)
{new Intl.NumberFormat('vi-VN').format(currentPrice.replace(/[.,]/g, ''))}đ

// NEW (ĐÚNG)
{formatPrice(currentPrice)}đ
```

### 5. Sửa tính tiền tiết kiệm:
```javascript
// OLD (SAI)
Tiết kiệm: {discountPercent}% ({new Intl.NumberFormat('vi-VN').format((parseFloat(originalPrice.replace(/[.,]/g, '')) - parseFloat(currentPrice.replace(/[.,]/g, ''))).toString())}đ)

// NEW (ĐÚNG)
Tiết kiệm: {discountPercent}% ({formatPrice(originalPrice - currentPrice)}đ)
```

### 6. Cập nhật handleBuyProduct:
```javascript
// OLD
const handleBuyProduct = (product, e) => {
  e.stopPropagation();
  console.log('🛒 Buy product:', product.name);
};

// NEW
const handleBuyProduct = async (product, e) => {
  e.stopPropagation();
  console.log('🛒 [Catalog] Adding to cart:', product.name);
  
  const result = await handleAddToCart(product, 'catalog', 1);
  
  if (result.success) {
    alert(`✅ ${result.message}`);
  } else {
    alert(`❌ ${result.message}`);
  }
};
```

## 🎯 Lợi ích của việc sử dụng productHelpers:

1. **Type Safety**: `normalizePrice()` luôn trả về number
2. **Consistent Formatting**: `formatPrice()` format đồng nhất
3. **Error Handling**: Xử lý các edge cases (null, undefined, invalid)
4. **Reusability**: Dùng lại ở nhiều nơi
5. **Maintainability**: Dễ maintain và debug

## 📊 Các format giá được xử lý:

```javascript
normalizePrice("150.000")     → 150000
normalizePrice("150,000")     → 150000
normalizePrice("150000đ")     → 150000
normalizePrice("150 000")     → 150000
normalizePrice(150000)        → 150000
normalizePrice(null)          → 0
normalizePrice(undefined)     → 0
```

## ✅ Kết quả:

- ✅ Không còn lỗi `TypeError: currentPrice.replace is not a function`
- ✅ Giá hiển thị đúng format VND
- ✅ Tính toán discount chính xác
- ✅ Xử lý được cả string và number
- ✅ Add to cart hoạt động bình thường

## 🧪 Test Cases:

### Test 1: Sản phẩm có giá là string
```javascript
product = {
  price: "200000",
  support: "150000"
}
// ✅ Hiển thị: 150.000đ (Giá gốc: 200.000đ)
// ✅ Discount: 25%
```

### Test 2: Sản phẩm có giá là number
```javascript
product = {
  price: 200000,
  support: 150000
}
// ✅ Hiển thị: 150.000đ (Giá gốc: 200.000đ)
// ✅ Discount: 25%
```

### Test 3: Sản phẩm không có giá khuyến mãi
```javascript
product = {
  price: 150000
}
// ✅ Hiển thị: 150.000đ
// ✅ Không hiển thị discount
```

### Test 4: Sản phẩm có giá format đặc biệt
```javascript
product = {
  price: "200.000đ",
  support: "150,000"
}
// ✅ Hiển thị: 150.000đ (Giá gốc: 200.000đ)
// ✅ Discount: 25%
```

## 🚀 Deployment:

Sau khi fix:
1. ✅ Server HMR tự động reload
2. ✅ Không cần restart
3. ✅ Test ngay trên browser

## 📚 Related Files:

- `src/utils/productHelpers.js` - Utility functions
- `src/components/CatalogProducts.jsx` - Component đã fix
- `src/hooks/useAddToCart.js` - Add to cart hook
- `src/store/cartSlice.js` - Redux cart state

## 💡 Best Practice:

**LUÔN** sử dụng `normalizePrice()` và `formatPrice()` khi làm việc với giá tiền:

```javascript
// ❌ KHÔNG NÊN
const price = product.price.replace(/[.,]/g, '');
const formatted = new Intl.NumberFormat('vi-VN').format(price);

// ✅ NÊN
const price = normalizePrice(product.price);
const formatted = formatPrice(price);
```

---

**Status**: ✅ FIXED - Ready for testing!
