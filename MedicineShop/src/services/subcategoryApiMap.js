// Map subcategory/category keys to real API endpoints
// IMPORTANT: 'name' field MUST match the key in categories.js (will NOT be slugified)
//            'api' field is the actual backend API category name

const SUBCATEGORY_ENDPOINTS = [
  // Thực phẩm chức năng
  { name: 'canxi-vitamin-d', api: 'http://localhost:3000/api/products/category/Bổ sung Canxi & Vitamin D' },
  { name: 'vitamin-tong-hop', api: 'http://localhost:3000/api/products/category/Vitamin tổng hợp' },
  { name: 'omega-3-dha', api: 'http://localhost:3000/api/products/category/Dầu cá, Omega 3, DHA' },
  { name: 'vitamin-c', api: 'http://localhost:3000/api/products/category/Vitamin C các loại' },
  { name: 'sat-axit-folic', api: 'http://localhost:3000/api/products/category/Bổ sung Sắt & Axit Folic' },
  { name: 'sinh-ly-nam', api: 'http://localhost:3000/api/products/category/Sinh lý nam' },
  { name: 'sinh-ly-nu', api: 'http://localhost:3000/api/products/category/Sinh lý nữ' },
  { name: 'tien-man-kinh', api: 'http://localhost:3000/api/products/category/Hỗ trợ mãn kinh' },
  { name: 'co-xuong-khop', api: 'http://localhost:3000/api/products/category/Cơ xương khớp' },
  { name: 'ho-hap-ho-xoang', api: 'http://localhost:3000/api/products/category/Hô hấp, ho, xoang' },
  { name: 'than-tien-liet-tuyen', api: 'http://localhost:3000/api/products/category/Thận, tiền liệt tuyến' },
  { name: 'ho-tro-dieu-tri-tri', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị trĩ' },
  { name: 'ho-tro-dieu-tri-gout', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị gout' },
  { name: 'ho-tro-dieu-tri', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị' },
  { name: 'tao-bon', api: 'http://localhost:3000/api/products/category/Táo bón' },
  { name: 'kho-tieu', api: 'http://localhost:3000/api/products/category/Khó tiêu' },
  { name: 'sua-duong-the-kem-duong-the', api: 'http://localhost:3000/api/products/category/Sữa dưỡng thể, kem dưỡng thể' },
  { name: 'bo-nao-cai-thien-tri-nho', api: 'http://localhost:3000/api/products/category/Bổ não - cải thiện trí nhớ' },
  { name: 'kiem-soat-cang-thang', api: 'http://localhost:3000/api/products/category/Kiểm soát căng thẳng' },
  { name: 'ho-tro-giac-ngu-ngon', api: 'http://localhost:3000/api/products/category/Hỗ trợ giấc ngủ ngon' },
  { name: 'cham-soc-chuyen-sau-cho-toc', api: 'http://localhost:3000/api/products/category/Chăm sóc chuyên sâu cho tóc' },
  { name: 'cham-soc-da-mat', api: 'http://localhost:3000/api/products/category/Chăm sóc da mặt' },
  { name: 'cham-soc-da-nut-ne', api: 'http://localhost:3000/api/products/category/Chăm sóc da nứt nẻ' },
  { name: 'huyet-ap', api: 'http://localhost:3000/api/products/category/Huyết áp' },
  { name: 'tuan-hoan-mau', api: 'http://localhost:3000/api/products/category/Tuần hoàn máu' },
  { name: 'giam-cholesterol', api: 'http://localhost:3000/api/products/category/Giảm Cholesterol' },
  { name: 'sua', api: 'http://localhost:3000/api/products/category/Sữa' },
  { name: 'nuoc-yen', api: 'http://localhost:3000/api/products/category/Nước Yến' },
  { name: 'thuc-pham-do-uong', api: 'http://localhost:3000/api/products/category/Thực phẩm - Đồ uống' },

  // Chăm sóc sắc đẹp
  { name: 'sua-rua-mat', api: 'http://localhost:3000/api/products/category/Sữa rửa mặt (Kem, gel, sữa)' },
  { name: 'kem-chong-nang', api: 'http://localhost:3000/api/products/category/Kem chống nắng da mặt' },
  { name: 'duong-da-mat', api: 'http://localhost:3000/api/products/category/Dưỡng da mặt' },
  { name: 'mat-na', api: 'http://localhost:3000/api/products/category/Mặt nạ' },
  { name: 'serum-essence', api: 'http://localhost:3000/api/products/category/Serum, Essence hoặc Ampoule' },
  { name: 'sua-tam', api: 'http://localhost:3000/api/products/category/Sữa tắm, xà bông' },
  { name: 'kem-duong-the', api: 'http://localhost:3000/api/products/category/Kem dưỡng thể' },
  { name: 'tay-te-bao-chet', api: 'http://localhost:3000/api/products/category/Tẩy tế bào chết' },
  { name: 'tri-mun', api: 'http://localhost:3000/api/products/category/Trị mụn' },
  { name: 'tri-tham-nam', api: 'http://localhost:3000/api/products/category/Trị thâm nám' },
  { name: 'da-nhay-cam', api: 'http://localhost:3000/api/products/category/Da nhạy cảm' },
  { name: 'dau-goi', api: 'http://localhost:3000/api/products/category/Dầu gội' },
  { name: 'dau-xa', api: 'http://localhost:3000/api/products/category/Dầu xả' },
  { name: 'mat-na-toc', api: 'http://localhost:3000/api/products/category/Mặt nạ tóc' },
  { name: 'son-moi', api: 'http://localhost:3000/api/products/category/Son môi' },
  { name: 'trang-diem-mat', api: 'http://localhost:3000/api/products/category/Trang điểm mặt' },
  { name: 'kem-nen', api: 'http://localhost:3000/api/products/category/Kem nền' },
  { name: 'kem-duong-mat', api: 'http://localhost:3000/api/products/category/Kem dưỡng mắt' },
  { name: 'mat-na-mat', api: 'http://localhost:3000/api/products/category/Mặt nạ mắt' },
  { name: 'serum-mat', api: 'http://localhost:3000/api/products/category/Serum mắt' },
  { name: 'organic', api: 'http://localhost:3000/api/products/category/Organic' },
  { name: 'thao-moc', api: 'http://localhost:3000/api/products/category/Thảo mộc' },
  { name: 'vegan', api: 'http://localhost:3000/api/products/category/Vegan' },

  // Dược phẩm
  { name: 'khang-sinh', api: 'http://localhost:3000/api/products/category/Kháng sinh' },
  { name: 'dieu-tri-ung-thu', api: 'http://localhost:3000/api/products/category/Điều trị ung thư' },
  { name: 'tim-mach-mau', api: 'http://localhost:3000/api/products/category/Tim mạch máu' },
  { name: 'than-kinh', api: 'http://localhost:3000/api/products/category/Thần kinh' },
  { name: 'tieu-hoa-gan-mat', api: 'http://localhost:3000/api/products/category/Tiêu hóa gan mật' },
  { name: 'duoc-chat-khang-sinh', api: 'http://localhost:3000/api/products/category/Dược chất kháng sinh' },
  { name: 'duoc-chat-giam-dau', api: 'http://localhost:3000/api/products/category/Dược chất giảm đau' },
  { name: 'duoc-chat-vitamin', api: 'http://localhost:3000/api/products/category/Dược chất vitamin' },
  { name: 'duoc-lieu-dong-y', api: 'http://localhost:3000/api/products/category/Dược liệu đông y' },
  { name: 'duoc-lieu-quy-hiem', api: 'http://localhost:3000/api/products/category/Dược liệu quý hiếm' },
  { name: 'duoc-lieu-pho-bien', api: 'http://localhost:3000/api/products/category/Dược liệu phổ biến' },

  // Sức khỏe sinh sản
  { name: 'bao-cao-su', api: 'http://localhost:3000/api/products/category/Bao cao su' },
  { name: 'gel-boi-tron', api: 'http://localhost:3000/api/products/category/Gel bôi trơn' },

  // Thực phẩm & Đồ uống
  { name: 'tra-suc-khoe', api: 'http://localhost:3000/api/products/category/Trà sức khỏe' },
  { name: 'mat-ong', api: 'http://localhost:3000/api/products/category/Mật ong' },
  { name: 'nuoc-uong-bo-sung', api: 'http://localhost:3000/api/products/category/Nước uống bổ sung' },

  // Vệ sinh cá nhân
  { name: 'xa-phong', api: 'http://localhost:3000/api/products/category/Xà phòng' },
  { name: 'dung-dich-ve-sinh', api: 'http://localhost:3000/api/products/category/Dung dịch vệ sinh' },
  { name: 'khu-mui', api: 'http://localhost:3000/api/products/category/Khử mùi' },
  { name: 'kem-danh-rang', api: 'http://localhost:3000/api/products/category/Kem đánh răng' },
  { name: 'ban-chai-danh-rang', api: 'http://localhost:3000/api/products/category/Bàn chải đánh răng' },
  { name: 'nuoc-suc-mieng', api: 'http://localhost:3000/api/products/category/Nước súc miệng' },

  // Vệ sinh nhà cửa
  { name: 've-sinh-nha-cua', api: 'http://localhost:3000/api/products/category/Vệ sinh nhà cửa' },
  { name: 'giat-giu', api: 'http://localhost:3000/api/products/category/Giặt giũ' },
  { name: 'nha-bep', api: 'http://localhost:3000/api/products/category/Nhà bếp' },

  // Khuyến mãi
  { name: 'set-qua-tang', api: 'http://localhost:3000/api/products/category/Set quà tặng' },
  { name: 'combo-tiet-kiem', api: 'http://localhost:3000/api/products/category/Combo tiết kiệm' },
  { name: 'khuyen-mai', api: 'http://localhost:3000/api/products/category/Khuyến mãi' },

  // Tinh dầu & Spa
  { name: 'tinh-dau-thu-gian', api: 'http://localhost:3000/api/products/category/Tinh dầu thư giãn' },
  { name: 'tinh-dau-tri-lieu', api: 'http://localhost:3000/api/products/category/Tinh dầu trị liệu' },
  { name: 'tinh-dau-massage', api: 'http://localhost:3000/api/products/category/Tinh dầu massage' },

  // Thiết bị y tế
  { name: 'may-massage-mat', api: 'http://localhost:3000/api/products/category/Máy massage mặt' },
  { name: 'may-xong-hoi', api: 'http://localhost:3000/api/products/category/Máy xông hơi' },
  { name: 'may-tao-am', api: 'http://localhost:3000/api/products/category/Máy tạo ẩm' },
  { name: 've-sinh-mui', api: 'http://localhost:3000/api/products/category/Vệ sinh mũi' },
  { name: 'kim-cac-loai', api: 'http://localhost:3000/api/products/category/Kim các loại' },
  { name: 'may-massage', api: 'http://localhost:3000/api/products/category/Máy massage' },
  { name: 'tui-chuom', api: 'http://localhost:3000/api/products/category/Túi chườm' },
  { name: 'vo-gan-tinh-mach', api: 'http://localhost:3000/api/products/category/Vớ gân tĩnh mạch' },
  { name: 'nhiet-ke', api: 'http://localhost:3000/api/products/category/Nhiệt kế' },
  { name: 'may-do-huyet-ap', api: 'http://localhost:3000/api/products/category/Máy đo huyết áp' },
  { name: 'may-do-duong-huyet', api: 'http://localhost:3000/api/products/category/Máy đo đường huyết' },
  { name: 'bang-gac', api: 'http://localhost:3000/api/products/category/Băng gạc' },
  { name: 'hop-so-cuu', api: 'http://localhost:3000/api/products/category/Hộp sơ cứu' },
  { name: 'dung-dich-sat-khuan', api: 'http://localhost:3000/api/products/category/Dung dịch sát khuẩn' },
  { name: 'khau-trang-y-te', api: 'http://localhost:3000/api/products/category/Khẩu trang y tế' },
  { name: 'khau-trang-n95', api: 'http://localhost:3000/api/products/category/Khẩu trang N95' },
  { name: 'khau-trang-vai', api: 'http://localhost:3000/api/products/category/Khẩu trang vải' }
];

// Build map directly using the 'name' as key (no slugification needed)
export const SUBCATEGORY_API_MAP = SUBCATEGORY_ENDPOINTS.reduce((acc, item) => {
  const key = item.name; // Use name directly as key
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
