# 🛒 Hệ Thống Giỏ Hàng - Implementation Guide

## 📋 Tổng quan

Đã triển khai thành công hệ thống giỏ hàng hoàn chỉnh sử dụng **Redux Toolkit** với đầy đủ tính năng:
- ✅ Thêm sản phẩm vào giỏ hàng từ nhiều nguồn khác nhau
- ✅ Cập nhật số lượng sản phẩm
- ✅ Xóa sản phẩm khỏi giỏ hàng
- ✅ Chọn/bỏ chọn sản phẩm để thanh toán
- ✅ Tự động lưu giỏ hàng vào LocalStorage
- ✅ Hiển thị badge số lượng sản phẩm trên header
- ✅ Tính toán tổng tiền tự động

---

## 🗂️ Cấu trúc File Mới

```
src/
├── store/
│   ├── index.js              # Redux store configuration
│   └── cartSlice.js          # Cart state management với Redux Toolkit
├── hooks/
│   └── useAddToCart.js       # Custom hook để thêm sản phẩm vào giỏ
├── utils/
│   └── productHelpers.js     # Utilities để chuẩn hóa dữ liệu sản phẩm
└── components/
    ├── Cart.jsx              # Component giỏ hàng (đã cập nhật)
    ├── Header.jsx            # Header với badge giỏ hàng (đã cập nhật)
    ├── FlashSaleSection.jsx  # Đã tích hợp add to cart
    ├── ProductListing.jsx    # Đã tích hợp add to cart
    ├── MedicalProductsTabs.jsx # Đã tích hợp add to cart
    ├── ProductCard.jsx       # Đã tích hợp add to cart
    └── CatalogProducts.jsx   # Hiển thị chi tiết như ProductListing
```

---

## 🔧 Chi tiết Implementation

### 1. Redux Store Setup

**File: `src/store/index.js`**
```javascript
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});
```

**File: `src/store/cartSlice.js`**
- Quản lý state giỏ hàng với Redux Toolkit
- Tự động sync với LocalStorage
- Actions: addToCart, removeFromCart, updateQuantity, toggleSelectItem, etc.

### 2. Product Helpers

**File: `src/utils/productHelpers.js`**

Các utility functions:
- `normalizePrice()` - Chuẩn hóa giá từ string sang number
- `getCurrentPrice()` - Lấy giá hiện tại (ưu tiên giá KM)
- `getOriginalPrice()` - Lấy giá gốc
- `normalizeProductForCart()` - Chuẩn hóa dữ liệu sản phẩm
- `validateProductForCart()` - Validate sản phẩm trước khi thêm
- `formatPrice()` - Format giá theo VND

### 3. Custom Hook

**File: `src/hooks/useAddToCart.js`**

```javascript
const { handleAddToCart } = useAddToCart();

// Sử dụng
const result = await handleAddToCart(product, 'flash-sale', 1);
if (result.success) {
  alert(result.message);
}
```

---

## 🎯 Tích hợp vào Components

### FlashSaleSection.jsx
```javascript
import { useAddToCart } from '../hooks/useAddToCart';

const { handleAddToCart } = useAddToCart();

const handleAddToCartClick = async (product, e) => {
  e.stopPropagation();
  const result = await handleAddToCart(product, 'flash-sale', 1);
  if (result.success) {
    alert(`✅ ${result.message}`);
  }
};
```

### ProductListing.jsx
```javascript
// Tương tự FlashSaleSection, source = 'listing'
const result = await handleAddToCart(product, 'listing', 1);
```

### MedicalProductsTabs.jsx
```javascript
// Source = 'medical'
const result = await handleAddToCart(product, 'medical', 1);
```

### ProductCard.jsx
```javascript
// Nhận source từ props
const result = await addToCart(product, source, 1);
```

### CatalogProducts.jsx
```javascript
// Hiển thị chi tiết sản phẩm như ProductListing
- Giá gốc và giá khuyến mãi
- Phần trăm giảm giá
- Số tiền tiết kiệm
- Mô tả sản phẩm
- Rating
- Stock info
- 2 buttons: Xem chi tiết & Thêm vào giỏ
```

---

## 📱 Cart Component Features

### Cart.jsx - Tính năng đầy đủ:

1. **Hiển thị danh sách sản phẩm**
   - Hình ảnh, tên, giá, số lượng
   - Giá gốc (nếu có giảm giá)
   - Tổng giá cho mỗi item

2. **Quản lý số lượng**
   - Tăng/giảm số lượng
   - Minimum = 1

3. **Chọn sản phẩm**
   - Checkbox cho từng item
   - Select All checkbox
   - Chỉ tính tổng tiền cho items được chọn

4. **Xóa sản phẩm**
   - Có confirm dialog
   - Cập nhật tổng tiền ngay lập tức

5. **Tính toán**
   - Tổng tiền các sản phẩm đã chọn
   - Phí vận chuyển (miễn phí nếu > 300k)
   - Thành tiền cuối cùng

6. **Empty State**
   - Hiển thị khi giỏ hàng trống
   - Button quay về trang chủ

---

## 🎨 UI/UX Improvements

### Header Badge
- Hiển thị tổng số lượng sản phẩm trong giỏ
- Auto update khi thêm/xóa sản phẩm
- Chỉ hiển thị khi có sản phẩm

### Product Cards (Catalog)
- Giống hệt ProductListing
- Hiển thị đầy đủ thông tin:
  - Discount badge
  - Giá gốc + giá KM
  - % giảm giá
  - Số tiền tiết kiệm
  - Mô tả ngắn
  - Rating (nếu có)
  - Stock info (nếu có)
  - 2 action buttons

### Notifications
- Alert khi thêm sản phẩm thành công
- Alert khi có lỗi
- Confirm dialog khi xóa sản phẩm

---

## 🔄 Data Flow

```
User Click "Thêm vào giỏ"
    ↓
Component gọi handleAddToCart(product, source, quantity)
    ↓
useAddToCart hook
    ↓
Validate product (validateProductForCart)
    ↓
Normalize product (normalizeProductForCart)
    ↓
Dispatch addToCart action
    ↓
Redux Store cập nhật state
    ↓
Auto save to LocalStorage
    ↓
All components using cart data re-render
    ↓
Header badge cập nhật
Cart page cập nhật
```

---

## 💾 LocalStorage

Giỏ hàng tự động được lưu vào LocalStorage với key: `medicineShopCart`

**Cấu trúc dữ liệu:**
```json
[
  {
    "id": "product-123",
    "name": "Vitamin C 1000mg",
    "price": 150000,
    "originalPrice": 200000,
    "image": "/images/product.jpg",
    "quantity": 2,
    "unit": "Hộp",
    "discount": "-25%",
    "category": "Vitamin",
    "source": "flash-sale",
    "selected": true,
    "totalPrice": 300000
  }
]
```

---

## 🧪 Testing Guide

### Test Scenarios:

1. **Thêm sản phẩm từ FlashSaleSection**
   - Click "Thêm vào giỏ"
   - Kiểm tra alert success
   - Kiểm tra badge header tăng lên
   - Mở giỏ hàng → sản phẩm phải hiển thị

2. **Thêm sản phẩm từ ProductListing**
   - Tương tự scenario 1
   - Source phải là 'listing'

3. **Thêm sản phẩm từ MedicalProductsTabs**
   - Tương tự scenario 1
   - Source phải là 'medical'

4. **Thêm sản phẩm từ CatalogProducts**
   - Click vào danh mục
   - Click "Thêm vào giỏ"
   - Source phải là 'catalog'

5. **Thêm sản phẩm đã có trong giỏ**
   - Số lượng phải tăng lên
   - Không tạo item mới

6. **Cập nhật số lượng trong giỏ**
   - Click + / -
   - Tổng tiền phải cập nhật ngay

7. **Xóa sản phẩm**
   - Click icon 🗑️
   - Confirm dialog xuất hiện
   - Sau khi confirm, sản phẩm phải biến mất

8. **Select/Deselect items**
   - Checkbox phải hoạt động
   - Tổng tiền chỉ tính items được chọn
   - Select All phải chọn tất cả

9. **Reload page**
   - Giỏ hàng phải giữ nguyên (từ LocalStorage)
   - Badge header phải đúng

10. **Empty cart**
    - Khi giỏ trống, hiển thị empty state
    - Button "Tiếp tục mua sắm" hoạt động

---

## 🐛 Debug Tips

### Console Logs đã thêm:

```javascript
// Khi thêm vào giỏ
console.log('🛒 [Source] Adding to cart:', product.name);

// Khi normalize
console.log('🔧 Normalizing product for cart:', { product, source, quantity });

// Khi validate
console.log('✅ Product validation:', validation);

// Trong Redux
console.log('💰 Cart totals - Quantity:', totalQuantity, 'Amount:', totalAmount);
```

### Kiểm tra Redux State:

Cài Redux DevTools Extension và kiểm tra:
- State → cart → items
- State → cart → totalQuantity
- State → cart → totalAmount

### Kiểm tra LocalStorage:

```javascript
// Trong browser console
localStorage.getItem('medicineShopCart')
```

---

## 🚀 Chạy Ứng Dụng

```bash
cd "e:\PBL6\medicineShop - Copy (2) - Copy - Copy\MedicineShop"
npm install
npm run dev
```

Server sẽ chạy tại: **http://localhost:5174/**

---

## ✅ Checklist Hoàn Thành

- [x] Cài đặt Redux Toolkit
- [x] Cài đặt react-redux
- [x] Tạo Redux store
- [x] Tạo cartSlice với đầy đủ actions
- [x] Tích hợp Provider vào main.jsx
- [x] Tạo productHelpers utilities
- [x] Tạo useAddToCart hook
- [x] Cập nhật Header với cart badge
- [x] Cập nhật FlashSaleSection
- [x] Cập nhật ProductListing
- [x] Cập nhật MedicalProductsTabs
- [x] Cập nhật ProductCard
- [x] Cập nhật CatalogProducts (hiển thị chi tiết)
- [x] Cập nhật Cart component
- [x] Cập nhật CartPage
- [x] Thêm CSS cho empty cart
- [x] Thêm CSS cho catalog product cards
- [x] LocalStorage integration
- [x] Testing & Debug

---

## 📝 Notes

- Tất cả giá tiền được chuẩn hóa sang number để tính toán
- Format lại sang VND khi hiển thị
- Source tracking giúp debug và analytics
- Validation đầy đủ trước khi thêm vào giỏ
- Auto save to LocalStorage mỗi khi có thay đổi
- HMR (Hot Module Replacement) hoạt động tốt

---

## 🎉 Kết quả

Hệ thống giỏ hàng đã hoạt động hoàn chỉnh với:
- ✅ Mock API integration
- ✅ Redux state management
- ✅ LocalStorage persistence
- ✅ Responsive UI
- ✅ Error handling
- ✅ Loading states
- ✅ User-friendly notifications
- ✅ Detailed product display in catalog

**Ready for production!** 🚀

---

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Console logs
2. Redux DevTools
3. Network tab (nếu có API thật)
4. LocalStorage data

Mọi thông tin debug đã có log chi tiết! 🔍
