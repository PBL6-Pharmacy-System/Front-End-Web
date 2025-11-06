# Fix: Subcategory API Mapping - Không cần slugify

## 🔍 Vấn đề phát hiện

User báo các subcategories sau không load được data:
1. Bổ sung Canxi & Vitamin D
2. Dầu cá, Omega 3, DHA  
3. Vitamin C các loại
4. Bổ sung Sắt & Axit Folic
5. Hỗ trợ mãn kinh
6. Sữa dưỡng thể, kem dưỡng thể
7. Chăm sóc da mặt
8. Sữa rửa mặt (Kem, gel, sữa)
9. Kem chống nắng da mặt
10. Dưỡng da mặt
11. Mặt nạ
12. Serum, Essence hoặc Ampoule

## 💡 Nguyên nhân gốc rễ

### Approach cũ (SAI):
```javascript
// CÁCH CŨ (SAI):
const SUBCATEGORY_ENDPOINTS = [
  { name: 'Canxi Vitamin D', api: '...' },  // Slugify → "canxi-vitamin-d"
  { name: 'Omega 3 DHA', api: '...' }       // Slugify → "omega-3-dha"
];

// Slugify name để tạo key
const key = slugify(item.name);
```

**Vấn đề**: Khi backend API name phức tạp (có "&", dấu ngoặc, dấu phẩy), slugify không ra đúng key trong `categories.js`

Ví dụ:
```javascript
"Bổ sung Canxi & Vitamin D" → slugify → "bo-sung-canxi-vitamin-d" ❌
// Nhưng categories.js có key: "canxi-vitamin-d" ✅

"Dầu cá, Omega 3, DHA" → slugify → "dau-ca-omega-3-dha" ❌  
// Nhưng categories.js có key: "omega-3-dha" ✅

"Sữa rửa mặt (Kem, gel, sữa)" → slugify → "sua-rua-met-kem-gel-sua" ❌
// Nhưng categories.js có key: "sua-rua-mat" ✅
```

**Bug phụ trong slugify**: Ký tự "ặ" map sai → "E" thay vì "a"
```javascript
"mặt" → slugify → "met" ❌ (phải là "mat")
```

## ✅ Giải pháp đúng

### Approach mới (ĐÚNG):
```javascript
// CÁCH MỚI (ĐÚNG):
const SUBCATEGORY_ENDPOINTS = [
  // 'name' = key từ categories.js (KHÔNG slugify)
  // 'api' = tên category thực tế trên backend
  { name: 'canxi-vitamin-d', api: 'http://localhost:3000/api/products/category/Bổ sung Canxi & Vitamin D' },
  { name: 'omega-3-dha', api: 'http://localhost:3000/api/products/category/Dầu cá, Omega 3, DHA' },
  { name: 'sua-rua-mat', api: 'http://localhost:3000/api/products/category/Sữa rửa mặt (Kem, gel, sữa)' }
];

// Dùng name trực tiếp làm key (NO slugify!)
const key = item.name; // ✅ Khớp 100% với categories.js
```

## 📋 Mapping đã fix

| Frontend Key (categories.js) | Backend API Category Name | Status |
|------------------------------|---------------------------|--------|
| `canxi-vitamin-d` | `Bổ sung Canxi & Vitamin D` | ✅ Fixed |
| `omega-3-dha` | `Dầu cá, Omega 3, DHA` | ✅ Fixed |
| `vitamin-c` | `Vitamin C các loại` | ✅ Fixed |
| `sat-axit-folic` | `Bổ sung Sắt & Axit Folic` | ✅ Fixed |
| `tien-man-kinh` | `Hỗ trợ mãn kinh` | ✅ Fixed |
| `sua-duong-the-kem-duong-the` | `Sữa dưỡng thể, kem dưỡng thể` | ✅ Fixed |
| `cham-soc-da-mat` | `Chăm sóc da mặt` | ✅ Fixed |
| `sua-rua-mat` | `Sữa rửa mặt (Kem, gel, sữa)` | ✅ Fixed |
| `kem-chong-nang` | `Kem chống nắng da mặt` | ✅ Fixed |
| `duong-da-mat` | `Dưỡng da mặt` | ✅ Fixed |
| `mat-na` | `Mặt nạ` | ✅ Fixed |
| `serum-essence` | `Serum, Essence hoặc Ampoule` | ✅ Fixed |

## 🔄 Code flow sau khi fix

```javascript
// 1. User click subcategory "Canxi & Vitamin D" trong UI
// 2. Code lookup key trong categories.js
const key = 'canxi-vitamin-d';

// 3. Lookup trong SUBCATEGORY_API_MAP
const apiUrl = SUBCATEGORY_API_MAP['canxi-vitamin-d'];
// → '/api/products/category/Bổ sung Canxi & Vitamin D' ✅

// 4. Fetch data từ backend
fetch(apiUrl) // ✅ SUCCESS!
```

## 📁 Files đã sửa

1. **subcategoryApiMap.js** - File chính
   - ❌ Removed: Slugify logic trong reduce function
   - ✅ Changed: Dùng `item.name` trực tiếp làm key
   - ✅ Changed: Tất cả `name` fields giờ là keys từ categories.js
   - ✅ Changed: Tất cả `api` fields giờ là tên backend chính xác

2. **Backup files**:
   - `subcategoryApiMap.backup.js` - Backup lần cuối
   - `subcategoryApiMap.old.js` - Backup lần trước đó

## 🎯 Key Takeaway

**Nguyên tắc mới**: 
- ❌ KHÔNG slugify `name` field
- ✅ Dùng TRỰC TIẾP key từ `categories.js` làm `name`
- ✅ Giữ nguyên tên backend đầy đủ trong `api` field

**Lợi ích**:
- 🎯 100% mapping chính xác
- 🚀 Không phụ thuộc vào slugify function
- 🛡️ Không sợ bug với ký tự đặc biệt
- 📝 Dễ maintain và debug

---
**Status**: ✅ **FIXED** - All 12 problematic categories now load data correctly
**Date**: October 30, 2025
**Impact**: Fixed data loading for 12 important subcategories
