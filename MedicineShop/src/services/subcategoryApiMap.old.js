// Map subcategory/category keys to real API endpoints (relative to base URL or absolute URL)
// Fill this object with endpoints you will provide.
// Example:
// {
//   'bo-nao-cai-thien-tri-nho': '/api/subcategories/bo-nao/products',
//   'khau-trang-y-te': '/api/subcategories/khau-trang-y-te/products'
// }

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
  { name: 'Máy massage', api: 'http://localhost:3000/api/products/category/Máy massage' },
  { name: 'Kem hỗ trợ giảm mụn, gel hỗ trợ giảm mụn', api: 'http://localhost:3000/api/products/category/Kem hỗ trợ giảm mụn, gel hỗ trợ giảm mụn' },
  { name: 'Dầu gội giúp giảm nấm và ngứa da đầu', api: 'http://localhost:3000/api/products/category/Dầu gội giúp giảm nấm và ngứa da đầu' },
  { name: 'Gel bôi trơn', api: 'http://localhost:3000/api/products/category/Gel bôi trơn' },
  { name: 'Sữa rửa mặt (Kem, gel, sữa)', api: 'http://localhost:3000/api/products/category/Sữa rửa mặt (Kem, gel, sữa)' },
  { name: 'Nước tẩy trang, dầu tẩy trang', api: 'http://localhost:3000/api/products/category/Nước tẩy trang, dầu tẩy trang' },
  { name: 'Mặt nạ', api: 'http://localhost:3000/api/products/category/Mặt nạ' },
  { name: 'Dưỡng da mặt', api: 'http://localhost:3000/api/products/category/Dưỡng da mặt' },
  { name: 'Chăm sóc da mặt', api: 'http://localhost:3000/api/products/category/Chăm sóc da mặt' },
  { name: 'Hỗ trợ mờ sẹo, mờ vết thâm', api: 'http://localhost:3000/api/products/category/Hỗ trợ mờ sẹo, mờ vết thâm' },
  { name: 'Da mẫn cảm, dễ kích ứng', api: 'http://localhost:3000/api/products/category/Da mẫn cảm, dễ kích ứng' },
  { name: 'Dưỡng da bị khô, thiếu ẩm', api: 'http://localhost:3000/api/products/category/Dưỡng da bị khô, thiếu ẩm' },
  { name: 'Kim các loại', api: 'http://localhost:3000/api/products/category/Kim các loại' },
  { name: 'Vitamin tổng hợp', api: 'http://localhost:3000/api/products/category/Vitamin tổng hợp' },
  { name: 'Bổ sung Canxi & Vitamin D', api: 'http://localhost:3000/api/products/category/Bổ sung Canxi & Vitamin D' },
  { name: 'Vitamin & Khoáng chất', api: 'http://localhost:3000/api/products/category/Vitamin & Khoáng chất' },
  { name: 'Bổ sung Sắt & Axit Folic', api: 'http://localhost:3000/api/products/category/Bổ sung Sắt & Axit Folic' },
  { name: 'Cơ xương khớp', api: 'http://localhost:3000/api/products/category/Cơ xương khớp' },
  { name: 'Hô hấp, ho, xoang', api: 'http://localhost:3000/api/products/category/Hô hấp, ho, xoang' },
  { name: 'Hỗ trợ điều trị trĩ', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị trĩ' },
  { name: 'Thận, tiền liệt tuyến', api: 'http://localhost:3000/api/products/category/Thận, tiền liệt tuyến' },
  { name: 'Hỗ trợ điều trị', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị' },
  { name: 'Bổ não - cải thiện trí nhớ', api: 'http://localhost:3000/api/products/category/Bổ não - cải thiện trí nhớ' },
  { name: 'Chăm sóc chuyên sâu cho tóc', api: 'http://localhost:3000/api/products/category/Chăm sóc chuyên sâu cho tóc' },
  { name: 'Túi chườm', api: 'http://localhost:3000/api/products/category/Túi chườm' },
  { name: 'Hoạt huyết', api: 'http://localhost:3000/api/products/category/Hoạt huyết' },
  { name: 'Máy đo SpO2', api: 'http://localhost:3000/api/products/category/Máy đo SpO2' },
  { name: 'Thực phẩm - Đồ uống', api: 'http://localhost:3000/api/products/category/Thực phẩm - Đồ uống' },
  { name: 'Nước Yến', api: 'http://localhost:3000/api/products/category/Nước Yến' },
  { name: 'Trà thảo dược', api: 'http://localhost:3000/api/products/category/Trà thảo dược' },
  { name: 'Nước uống không gas', api: 'http://localhost:3000/api/products/category/Nước uống không gas' },
  { name: 'Bổ mắt, bảo vệ mắt', api: 'http://localhost:3000/api/products/category/Bổ mắt, bảo vệ mắt' },
  { name: 'Băng vệ sinh', api: 'http://localhost:3000/api/products/category/Băng vệ sinh' },
  { name: 'Kẹo cứng', api: 'http://localhost:3000/api/products/category/Kẹo cứng' },
  { name: 'Dầu cá, Omega 3, DHA', api: 'http://localhost:3000/api/products/category/Dầu cá, Omega 3, DHA' },
  { name: 'Vitamin C các loại', api: 'http://localhost:3000/api/products/category/Vitamin C các loại' },
  { name: 'Dụng cụ tẩy lông', api: 'http://localhost:3000/api/products/category/Dụng cụ tẩy lông' },
  { name: 'Nước súc miệng', api: 'http://localhost:3000/api/products/category/Nước súc miệng' },
  { name: 'Kit Test Covid', api: 'http://localhost:3000/api/products/category/Kit Test Covid' },
  { name: 'Hỗ trợ mãn kinh', api: 'http://localhost:3000/api/products/category/Hỗ trợ mãn kinh' },
  { name: 'Hỗ trợ cải thiện quầng thâm, bọng mắt', api: 'http://localhost:3000/api/products/category/Hỗ trợ cải thiện quầng thâm, bọng mắt' },
  { name: 'Hỗ trợ giấc ngủ ngon', api: 'http://localhost:3000/api/products/category/Hỗ trợ giấc ngủ ngon' },
  { name: 'Khẩu trang vải', api: 'http://localhost:3000/api/products/category/Khẩu trang vải' },
  { name: 'Sức khoẻ tình dục', api: 'http://localhost:3000/api/products/category/Sức khoẻ tình dục' },
  { name: 'Khẩu trang y tế', api: 'http://localhost:3000/api/products/category/Khẩu trang y tế' },
  { name: 'Đại tràng', api: 'http://localhost:3000/api/products/category/Đại tràng' },
  { name: 'Chăm sóc da nứt nẻ', api: 'http://localhost:3000/api/products/category/Chăm sóc da nứt nẻ' },
  { name: 'Hỗ trợ trao đổi chất', api: 'http://localhost:3000/api/products/category/Hỗ trợ trao đổi chất' },
  { name: 'Khăn giấy, khăn ướt', api: 'http://localhost:3000/api/products/category/Khăn giấy, khăn ướt' },
  { name: 'Máy, que thử đường huyết', api: 'http://localhost:3000/api/products/category/Máy, que thử đường huyết' },
  { name: 'Dưỡng tóc, ủ tóc', api: 'http://localhost:3000/api/products/category/Dưỡng tóc, ủ tóc' },
  { name: 'Serum, Essence hoặc Ampoule', api: 'http://localhost:3000/api/products/category/Serum, Essence hoặc Ampoule' },
  { name: 'Tóc', api: 'http://localhost:3000/api/products/category/Tóc' },
  { name: 'Thử thai', api: 'http://localhost:3000/api/products/category/Thử thai' },
  { name: 'Dụng cụ vệ sinh mũi', api: 'http://localhost:3000/api/products/category/Dụng cụ vệ sinh mũi' },
  { name: 'Giải rượu, cai rượu', api: 'http://localhost:3000/api/products/category/Giải rượu, cai rượu' },
  { name: 'Thuốc tăng cường tuần hoàn não', api: 'http://localhost:3000/api/products/category/Thuốc tăng cường tuần hoàn não' },
  { name: 'Thuốc trị trĩ, suy giãn tĩnh mạch', api: 'http://localhost:3000/api/products/category/Thuốc trị trĩ, suy giãn tĩnh mạch' },
  { name: 'Hỗ trợ điều trị gout', api: 'http://localhost:3000/api/products/category/Hỗ trợ điều trị gout' },
  { name: 'Chỉ nha khoa', api: 'http://localhost:3000/api/products/category/Chỉ nha khoa' },
  { name: 'Dung dịch vệ sinh phụ nữ', api: 'http://localhost:3000/api/products/category/Dung dịch vệ sinh phụ nữ' },
  { name: 'Đồ dùng cho bé', api: 'http://localhost:3000/api/products/category/Đồ dùng cho bé' },
  { name: 'Hỗ trợ cải thiện nếp nhăn vùng mắt', api: 'http://localhost:3000/api/products/category/Hỗ trợ cải thiện nếp nhăn vùng mắt' },
  { name: 'Tăng sức đề kháng, miễn dịch', api: 'http://localhost:3000/api/products/category/Tăng sức đề kháng, miễn dịch' },
  { name: 'Đồ dùng cho mẹ', api: 'http://localhost:3000/api/products/category/Đồ dùng cho mẹ' },
  { name: 'Trang điểm mặt', api: 'http://localhost:3000/api/products/category/Trang điểm mặt' },
  { name: 'Miếng dán giảm đau, hạ sốt', api: 'http://localhost:3000/api/products/category/Miếng dán giảm đau, hạ sốt' },
  { name: 'Băng y tế', api: 'http://localhost:3000/api/products/category/Băng y tế' },
  { name: 'Bông y tế', api: 'http://localhost:3000/api/products/category/Bông y tế' },
  { name: 'Chống nắng toàn thân', api: 'http://localhost:3000/api/products/category/Chống nắng toàn thân' },
  { name: 'Kem chống nắng da mặt', api: 'http://localhost:3000/api/products/category/Kem chống nắng da mặt' },
  { name: 'Tinh dầu xông', api: 'http://localhost:3000/api/products/category/Tinh dầu xông' },
  { name: 'Sữa', api: 'http://localhost:3000/api/products/category/Sữa' },
  { name: 'Chống muỗi & côn trùng', api: 'http://localhost:3000/api/products/category/Chống muỗi & côn trùng' },
  { name: 'Cồn, nước sát trùng, nước muối', api: 'http://localhost:3000/api/products/category/Cồn, nước sát trùng, nước muối' },
  { name: 'Vệ sinh tai', api: 'http://localhost:3000/api/products/category/Vệ sinh tai' },
  { name: 'Dụng cụ cạo râu', api: 'http://localhost:3000/api/products/category/Dụng cụ cạo râu' },
  { name: 'Dụng cụ y tế', api: 'http://localhost:3000/api/products/category/Dụng cụ y tế' },
  { name: 'Các dụng cụ và sản phẩm khác', api: 'http://localhost:3000/api/products/category/Các dụng cụ và sản phẩm khác' },
  { name: 'Thuốc kháng virus', api: 'http://localhost:3000/api/products/category/Thuốc kháng virus' },
  { name: 'Thuốc trị giun sán', api: 'http://localhost:3000/api/products/category/Thuốc trị giun sán' },
  { name: 'Thuốc kháng sinh, kháng nấm', api: 'http://localhost:3000/api/products/category/Thuốc kháng sinh, kháng nấm' },
  { name: 'Thuốc kháng nấm', api: 'http://localhost:3000/api/products/category/Thuốc kháng nấm' },
  { name: 'Chăm sóc vết thương', api: 'http://localhost:3000/api/products/category/Chăm sóc vết thương' },
  { name: 'Giảm Cholesterol', api: 'http://localhost:3000/api/products/category/Giảm Cholesterol' },
  { name: 'Chăm sóc răng', api: 'http://localhost:3000/api/products/category/Chăm sóc răng' },
  { name: 'Cân bằng nội tiết tố', api: 'http://localhost:3000/api/products/category/Cân bằng nội tiết tố' },
  { name: 'Tinh dầu trị cảm', api: 'http://localhost:3000/api/products/category/Tinh dầu trị cảm' },
  { name: 'Tinh dầu massage', api: 'http://localhost:3000/api/products/category/Tinh dầu massage' },
  { name: 'Khó tiêu', api: 'http://localhost:3000/api/products/category/Khó tiêu' },
  { name: 'Sữa dưỡng thể, kem dưỡng thể', api: 'http://localhost:3000/api/products/category/Sữa dưỡng thể, kem dưỡng thể' },
  { name: 'Sữa tắm, xà bông', api: 'http://localhost:3000/api/products/category/Sữa tắm, xà bông' },
  { name: 'Kem đánh răng', api: 'http://localhost:3000/api/products/category/Kem đánh răng' },
  { name: 'Bao cao su', api: 'http://localhost:3000/api/products/category/Bao cao su' },
  { name: 'Kem hỗ trợ mờ nám, tàn nhang, đốm nâu', api: 'http://localhost:3000/api/products/category/Kem hỗ trợ mờ nám, tàn nhang, đốm nâu' },
  { name: 'Táo bón', api: 'http://localhost:3000/api/products/category/Táo bón' },
  { name: 'Tinh dầu', api: 'http://localhost:3000/api/products/category/Tinh dầu' },
  { name: 'Suy giãn tĩnh mạch', api: 'http://localhost:3000/api/products/category/Suy giãn tĩnh mạch' },
  { name: 'Kiểm soát căng thẳng', api: 'http://localhost:3000/api/products/category/Kiểm soát căng thẳng' },
  { name: 'Dưỡng da mắt', api: 'http://localhost:3000/api/products/category/Dưỡng da mắt' },
  { name: 'Chức năng gan', api: 'http://localhost:3000/api/products/category/Chức năng gan' },
  { name: 'Sinh lý nữ', api: 'http://localhost:3000/api/products/category/Sinh lý nữ' },
  { name: 'Da', api: 'http://localhost:3000/api/products/category/Da' },
  { name: 'Vớ ngăn tĩnh mạch', api: 'http://localhost:3000/api/products/category/Vớ ngăn tĩnh mạch' },
  { name: 'Đường ăn kiêng', api: 'http://localhost:3000/api/products/category/Đường ăn kiêng' },
  { name: 'Son môi', api: 'http://localhost:3000/api/products/category/Son môi' },
  { name: 'Dầu gội dầu xả', api: 'http://localhost:3000/api/products/category/Dầu gội dầu xả' },
  { name: 'Vi sinh - Probiotic', api: 'http://localhost:3000/api/products/category/Vi sinh - Probiotic' },
  { name: 'Huyết áp', api: 'http://localhost:3000/api/products/category/Huyết áp' },
  { name: 'Thuốc thần kinh', api: 'http://localhost:3000/api/products/category/Thuốc thần kinh' },
  { name: 'Máy đo huyết áp', api: 'http://localhost:3000/api/products/category/Máy đo huyết áp' },
  { name: 'Chăm sóc cơ thể', api: 'http://localhost:3000/api/products/category/Chăm sóc cơ thể' },
  { name: 'Lăn khử mùi, xịt khử mùi', api: 'http://localhost:3000/api/products/category/Lăn khử mùi, xịt khử mùi' },
  { name: 'Kem dưỡng da tay, chân', api: 'http://localhost:3000/api/products/category/Kem dưỡng da tay, chân' },
  { name: 'Chống lão hóa', api: 'http://localhost:3000/api/products/category/Chống lão hóa' },
  { name: 'Bàn chải điện', api: 'http://localhost:3000/api/products/category/Bàn chải điện' },
  { name: 'Xịt giảm đau, kháng viêm', api: 'http://localhost:3000/api/products/category/Xịt giảm đau, kháng viêm' },
  { name: 'Thuốc dạ dày', api: 'http://localhost:3000/api/products/category/Thuốc dạ dày' },
  { name: 'Thuốc tiêu hoá', api: 'http://localhost:3000/api/products/category/Thuốc tiêu hoá' },
  { name: 'Thuốc trị bệnh gan', api: 'http://localhost:3000/api/products/category/Thuốc trị bệnh gan' },
  { name: 'Thuốc trị tiêu chảy', api: 'http://localhost:3000/api/products/category/Thuốc trị tiêu chảy' },
  { name: 'Thuốc trị táo bón', api: 'http://localhost:3000/api/products/category/Thuốc trị táo bón' },
  { name: 'Dạ dày, tá tràng', api: 'http://localhost:3000/api/products/category/Dạ dày, tá tràng' },
  { name: 'Sinh lý nam', api: 'http://localhost:3000/api/products/category/Sinh lý nam' },
  { name: 'Tuần hoàn máu', api: 'http://localhost:3000/api/products/category/Tuần hoàn máu' },
  { name: 'Nước rửa tay', api: 'http://localhost:3000/api/products/category/Nước rửa tay' },
  { name: 'Nhiệt kế', api: 'http://localhost:3000/api/products/category/Nhiệt kế' }
  // (list continues if you have more entries)
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
