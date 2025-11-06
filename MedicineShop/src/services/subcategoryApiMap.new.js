// Map subcategory/category keys to real API endpoints (relative to base URL or absolute URL)
// This file maps ALL subcategory keys from categories.js to their respective API endpoints

// Helper: slugify a display name to the app's subcategory key format
const slugify = (str) => {
  if (!str) return '';
  // Normalize unicode characters, remove diacritics - FIXED: Corrected character mapping for Vietnamese
  const from = 'ÀÁẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶàáảãạâấầẩẫậăắằẳẵặÈÉẺẼẸÊẾỀỂỄỆèéẻẽẹêếềểễệÌÍỈĨỊìíỉĩịÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢòóỏõọôốồổỗộơớờởỡợÙÚỦŨỤƯỨỪỬỮỰùúủũụưứừửữựỲÝỶỸỴỳýỷỹỵĐđ';
  const to   = 'AAAAAAAAAAAAAAAAAaaaaaaaaaaaaaaaaEEEEEEEEEEEEeeeeeeeeeeeIIIIIiiiiiOOOOOOOOOOOOOOOOOoooooooooooooooooUUUUUUUUUUUuuuuuuuuuuuYYYYYyyyyyDd';
  let s = str.split('').map(ch => {
    const idx = from.indexOf(ch);
    return idx > -1 ? to[idx] : ch;
  }).join('');

  s = s.toLowerCase();
  // Replace any non-alphanumeric characters with hyphens
  s = s.replace(/[^a-z0-9]+/g, '-');
  // Collapse multiple hyphens
  s = s.replace(/-+/g, '-');
  // Trim
  s = s.replace(/^-|-$/g, '');
  return s;
};

// Raw list of display names + endpoints provided by user.
// We will slugify the display name to produce the mapping key so it matches
// the application's subcategory key convention.
const SUBCATEGORY_ENDPOINTS = [
  // Thực phẩm chức năng - FIXED: Using simpler names to match categories.js keys
  { name: 'Canxi Vitamin D', api: 'http://localhost:3000/api/products/category/Canxi Vitamin D' },
  { name: 'Vitamin tổng hợp', api: 'http://localhost:3000/api/products/category/Vitamin tổng hợp' },
  { name: 'Omega 3 DHA', api: 'http://localhost:3000/api/products/category/Omega 3 DHA' },
  { name: 'Vitamin C', api: 'http://localhost:3000/api/products/category/Vitamin C' },
  { name: 'Sat Axit Folic', api: 'http://localhost:3000/api/products/category/Sat Axit Folic' },
  { name: 'Sinh lý nam', api: 'http://localhost:3000/api/products/category/Sinh lý nam' },
  { name: 'Sinh lý nữ', api: 'http://localhost:3000/api/products/category/Sinh lý nữ' },
  { name: 'Tien Man Kinh', api: 'http://localhost:3000/api/products/category/Tien Man Kinh' },
  { name: 'Cơ xương khớp', api: 'http://localhost:3000/api/products/category/Cơ xương khớp' },
  { name: 'Hô hấp, ho, xoang', api: 'http://localhost:3000/api/products/category/Hô hấp, ho, xoang' },
  { name: 'Thận, tiền liệt tuyến', api: 'http://localhost:3000/api/products/category/Thận, tiền liệt tuyến' },
  { name: 'Hỗ trợ điều trị trĩ', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị trĩ' },
  { name: 'Hỗ trợ điều trị gout', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị gout' },
  { name: 'Hỗ trợ điều trị', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị' },
  { name: 'Táo bón', api: 'http://localhost:3000/api/products/category/Táo bón' },
  { name: 'Khó tiêu', api: 'http://localhost:3000/api/products/category/Khó tiêu' },
  { name: 'Sua Duong The Kem Duong The', api: 'http://localhost:3000/api/products/category/Sua Duong The Kem Duong The' },
  { name: 'Bổ não - cải thiện trí nhớ', api: 'http://localhost:3000/api/products/category/Bổ não - cải thiện trí nhớ' },
  { name: 'Kiểm soát căng thẳng', api: 'http://localhost:3000/api/products/category/Kiểm soát căng thẳng' },
  { name: 'Hỗ trợ giấc ngủ ngon', api: 'http://localhost:3000/api/products/category/Hỗ trợ giấc ngủ ngon' },
  { name: 'Chăm sóc chuyên sâu cho tóc', api: 'http://localhost:3000/api/products/category/Chăm sóc chuyên sâu cho tóc' },
  { name: 'Cham Soc Da Mat', api: 'http://localhost:3000/api/products/category/Cham Soc Da Mat' },
  { name: 'Chăm sóc da nứt nẻ', api: 'http://localhost:3000/api/products/category/Chăm sóc da nứt nẻ' },
  { name: 'Huyết áp', api: 'http://localhost:3000/api/products/category/Huyết áp' },
  { name: 'Tuần hoàn máu', api: 'http://localhost:3000/api/products/category/Tuần hoàn máu' },
  { name: 'Giảm Cholesterol', api: 'http://localhost:3000/api/products/category/Giảm Cholesterol' },
  { name: 'Sữa', api: 'http://localhost:3000/api/products/category/Sữa' },
  { name: 'Nước Yến', api: 'http://localhost:3000/api/products/category/Nước Yến' },
  { name: 'Thực phẩm - Đồ uống', api: 'http://localhost:3000/api/products/category/Thực phẩm - Đồ uống' },

  // Chăm sóc sắc đẹp - FIXED: Using simpler names
  { name: 'Sua Rua Mat', api: 'http://localhost:3000/api/products/category/Sua Rua Mat' },
  { name: 'Kem Chong Nang', api: 'http://localhost:3000/api/products/category/Kem Chong Nang' },
  { name: 'Duong Da Mat', api: 'http://localhost:3000/api/products/category/Duong Da Mat' },
  { name: 'Mat Na', api: 'http://localhost:3000/api/products/category/Mat Na' },
  { name: 'Serum Essence', api: 'http://localhost:3000/api/products/category/Serum Essence' },
  { name: 'Sua Tam', api: 'http://localhost:3000/api/products/category/Sua Tam' },
  { name: 'Kem Duong The', api: 'http://localhost:3000/api/products/category/Kem Duong The' },
  { name: 'Tay Te Bao Chet', api: 'http://localhost:3000/api/products/category/Tay Te Bao Chet' },
  { name: 'Tri Mun', api: 'http://localhost:3000/api/products/category/Tri Mun' },
  { name: 'Tri Tham Nam', api: 'http://localhost:3000/api/products/category/Tri Tham Nam' },
  { name: 'Da Nhay Cam', api: 'http://localhost:3000/api/products/category/Da Nhay Cam' },
  { name: 'Dau Goi', api: 'http://localhost:3000/api/products/category/Dau Goi' },
  { name: 'Dau Xa', api: 'http://localhost:3000/api/products/category/Dau Xa' },
  { name: 'Mat Na Toc', api: 'http://localhost:3000/api/products/category/Mat Na Toc' },
  { name: 'Son môi', api: 'http://localhost:3000/api/products/category/Son môi' },
  { name: 'Trang Diem Mat', api: 'http://localhost:3000/api/products/category/Trang Diem Mat' },
  { name: 'Kem Nen', api: 'http://localhost:3000/api/products/category/Kem Nen' },
  { name: 'Kem Duong Mat', api: 'http://localhost:3000/api/products/category/Kem Duong Mat' },
  { name: 'Mat Na Mat', api: 'http://localhost:3000/api/products/category/Mat Na Mat' },
  { name: 'Serum Mat', api: 'http://localhost:3000/api/products/category/Serum Mat' },
  { name: 'Organic', api: 'http://localhost:3000/api/products/category/Organic' },
  { name: 'Thao Moc', api: 'http://localhost:3000/api/products/category/Thao Moc' },
  { name: 'Vegan', api: 'http://localhost:3000/api/products/category/Vegan' },

  // Dược phẩm
  { name: 'Khang Sinh', api: 'http://localhost:3000/api/products/category/Khang Sinh' },
  { name: 'Dieu Tri Ung Thu', api: 'http://localhost:3000/api/products/category/Dieu Tri Ung Thu' },
  { name: 'Tim Mach Mau', api: 'http://localhost:3000/api/products/category/Tim Mach Mau' },
  { name: 'Than Kinh', api: 'http://localhost:3000/api/products/category/Than Kinh' },
  { name: 'Tieu Hoa Gan Mat', api: 'http://localhost:3000/api/products/category/Tieu Hoa Gan Mat' },
  { name: 'Duoc Chat Khang Sinh', api: 'http://localhost:3000/api/products/category/Duoc Chat Khang Sinh' },
  { name: 'Duoc Chat Giam Dau', api: 'http://localhost:3000/api/products/category/Duoc Chat Giam Dau' },
  { name: 'Duoc Chat Vitamin', api: 'http://localhost:3000/api/products/category/Duoc Chat Vitamin' },
  { name: 'Duoc Lieu Dong Y', api: 'http://localhost:3000/api/products/category/Duoc Lieu Dong Y' },
  { name: 'Duoc Lieu Quy Hiem', api: 'http://localhost:3000/api/products/category/Duoc Lieu Quy Hiem' },
  { name: 'Duoc Lieu Pho Bien', api: 'http://localhost:3000/api/products/category/Duoc Lieu Pho Bien' },

  // Sức khỏe sinh sản
  { name: 'Bao cao su', api: 'http://localhost:3000/api/products/category/Bao cao su' },
  { name: 'Gel bôi trơn', api: 'http://localhost:3000/api/products/category/Gel bôi trơn' },

  // Thực phẩm & Đồ uống
  { name: 'Tra Suc Khoe', api: 'http://localhost:3000/api/products/category/Tra Suc Khoe' },
  { name: 'Mat Ong', api: 'http://localhost:3000/api/products/category/Mat Ong' },
  { name: 'Nuoc Uong Bo Sung', api: 'http://localhost:3000/api/products/category/Nuoc Uong Bo Sung' },

  // Vệ sinh cá nhân
  { name: 'Xa Phong', api: 'http://localhost:3000/api/products/category/Xa Phong' },
  { name: 'Dung Dich Ve Sinh', api: 'http://localhost:3000/api/products/category/Dung Dich Ve Sinh' },
  { name: 'Khu Mui', api: 'http://localhost:3000/api/products/category/Khu Mui' },
  { name: 'Kem đánh răng', api: 'http://localhost:3000/api/products/category/Kem đánh răng' },
  { name: 'Ban Chai Danh Rang', api: 'http://localhost:3000/api/products/category/Ban Chai Danh Rang' },
  { name: 'Nước súc miệng', api: 'http://localhost:3000/api/products/category/Nước súc miệng' },

  // Vệ sinh nhà cửa
  { name: 'Ve Sinh Nha Cua', api: 'http://localhost:3000/api/products/category/Ve Sinh Nha Cua' },
  { name: 'Giat Giu', api: 'http://localhost:3000/api/products/category/Giat Giu' },
  { name: 'Nha Bep', api: 'http://localhost:3000/api/products/category/Nha Bep' },

  // Khuyến mãi
  { name: 'Set Qua Tang', api: 'http://localhost:3000/api/products/category/Set Qua Tang' },
  { name: 'Combo Tiet Kiem', api: 'http://localhost:3000/api/products/category/Combo Tiet Kiem' },
  { name: 'Khuyen Mai', api: 'http://localhost:3000/api/products/category/Khuyen Mai' },

  // Tinh dầu & Spa
  { name: 'Tinh Dau Thu Gian', api: 'http://localhost:3000/api/products/category/Tinh Dau Thu Gian' },
  { name: 'Tinh Dau Tri Lieu', api: 'http://localhost:3000/api/products/category/Tinh Dau Tri Lieu' },
  { name: 'Tinh dầu massage', api: 'http://localhost:3000/api/products/category/Tinh dầu massage' },

  // Thiết bị y tế
  { name: 'May Massage Mat', api: 'http://localhost:3000/api/products/category/May Massage Mat' },
  { name: 'May Xong Hoi', api: 'http://localhost:3000/api/products/category/May Xong Hoi' },
  { name: 'May Tao Am', api: 'http://localhost:3000/api/products/category/May Tao Am' },
  { name: 'Ve Sinh Mui', api: 'http://localhost:3000/api/products/category/Ve Sinh Mui' },
  { name: 'Kim các loại', api: 'http://localhost:3000/api/products/category/Kim các loại' },
  { name: 'Máy massage', api: 'http://localhost:3000/api/products/category/Máy massage' },
  { name: 'Túi chườm', api: 'http://localhost:3000/api/products/category/Túi chườm' },
  { name: 'Vo Gan Tinh Mach', api: 'http://localhost:3000/api/products/category/Vo Gan Tinh Mach' },
  { name: 'Nhiệt kế', api: 'http://localhost:3000/api/products/category/Nhiệt kế' },
  { name: 'Máy đo huyết áp', api: 'http://localhost:3000/api/products/category/Máy đo huyết áp' },
  { name: 'May Do Duong Huyet', api: 'http://localhost:3000/api/products/category/May Do Duong Huyet' },
  { name: 'Bang Gac', api: 'http://localhost:3000/api/products/category/Bang Gac' },
  { name: 'Hop So Cuu', api: 'http://localhost:3000/api/products/category/Hop So Cuu' },
  { name: 'Dung Dich Sat Khuan', api: 'http://localhost:3000/api/products/category/Dung Dich Sat Khuan' },
  { name: 'Khẩu trang y tế', api: 'http://localhost:3000/api/products/category/Khẩu trang y tế' },
  { name: 'Khau Trang N95', api: 'http://localhost:3000/api/products/category/Khau Trang N95' },
  { name: 'Khẩu trang vải', api: 'http://localhost:3000/api/products/category/Khẩu trang vải' }
];

// Build map by slugifying the display name so the app can lookup by subcategory key
export const SUBCATEGORY_API_MAP = SUBCATEGORY_ENDPOINTS.reduce((acc, item) => {
  const key = slugify(item.name);
  let api = item.api || '';
  // If the user provided a localhost absolute URL, convert it to a relative path
  // so the Vite dev server proxy (configured in vite.config.js) can forward it
  // and prevent CORS issues in the browser.
  try {
    const url = new URL(api);
    if ((url.protocol === 'http:' || url.protocol === 'https:') && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
      api = url.pathname + url.search + url.hash;
      // ensure leading slash
      if (!api.startsWith('/')) api = '/' + api;
    }
  } catch (err) {
    // not a full URL, leave as-is (could already be relative)
  }

  acc[key] = api;
  return acc;
}, {});

export default SUBCATEGORY_API_MAP;
