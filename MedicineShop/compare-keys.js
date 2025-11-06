// Script kiểm tra mapping giữa categories.js và subcategoryApiMap.js

// Slugify function (copy từ subcategoryApiMap.js) - FIXED VERSION
const slugify = (str) => {
  if (!str) return '';
  const from = 'ÀÁẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶàáảãạâấầẩẫậăắằẳẵặÈÉẺẼẸÊẾỀỂỄỆèéẻẽẹêếềểễệÌÍỈĨỊìíỉĩịÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢòóỏõọôốồổỗộơớờởỡợÙÚỦŨỤƯỨỪỬỮỰùúủũụưứừửữựỲÝỶỸỴỳýỷỹỵĐđ';
  const to   = 'AAAAAAAAAAAAAAAAAaaaaaaaaaaaaaaaaEEEEEEEEEEEEeeeeeeeeeeeIIIIIiiiiiOOOOOOOOOOOOOOOOOoooooooooooooooooUUUUUUUUUUUuuuuuuuuuuuYYYYYyyyyyDd';
  let s = str.split('').map(ch => {
    const idx = from.indexOf(ch);
    return idx > -1 ? to[idx] : ch;
  }).join('');
  s = s.toLowerCase();
  s = s.replace(/[^a-z0-9]+/g, '-');
  s = s.replace(/-+/g, '-');
  s = s.replace(/^-|-$/g, '');
  return s;
};

// Keys từ categories.js (tất cả subcategory keys)
const categoriesKeys = [
  // Thực phẩm chức năng
  'canxi-vitamin-d',
  'vitamin-tong-hop',
  'omega-3-dha',
  'vitamin-c',
  'sat-axit-folic',
  'sinh-ly-nam',
  'sinh-ly-nu',
  'tien-man-kinh',
  'co-xuong-khop',
  'ho-hap-ho-xoang',
  'than-tien-liet-tuyen',
  'ho-tro-dieu-tri-tri',
  'ho-tro-dieu-tri-gout',
  'ho-tro-dieu-tri',
  'tao-bon',
  'kho-tieu',
  'sua-duong-the-kem-duong-the',
  'bo-nao-cai-thien-tri-nho',
  'kiem-soat-cang-thang',
  'ho-tro-giac-ngu-ngon',
  'cham-soc-chuyen-sau-cho-toc',
  'cham-soc-da-mat',
  'cham-soc-da-nut-ne',
  'huyet-ap',
  'tuan-hoan-mau',
  'giam-cholesterol',
  'sua',
  'nuoc-yen',
  'thuc-pham-do-uong',
  
  // Chăm sóc sắc đẹp
  'sua-rua-mat',
  'kem-chong-nang',
  'duong-da-mat',
  'mat-na',
  'serum-essence',
  'sua-tam',
  'kem-duong-the',
  'tay-te-bao-chet',
  'tri-mun',
  'tri-tham-nam',
  'da-nhay-cam',
  'dau-goi',
  'dau-xa',
  'mat-na-toc',
  'son-moi',
  'trang-diem-mat',
  'kem-nen',
  'kem-duong-mat',
  'mat-na-mat',
  'serum-mat',
  'organic',
  'thao-moc',
  'vegan',
  
  // Dược phẩm
  'khang-sinh',
  'dieu-tri-ung-thu',
  'tim-mach-mau',
  'than-kinh',
  'tieu-hoa-gan-mat',
  'duoc-chat-khang-sinh',
  'duoc-chat-giam-dau',
  'duoc-chat-vitamin',
  'duoc-lieu-dong-y',
  'duoc-lieu-quy-hiem',
  'duoc-lieu-pho-bien',
  
  // Sức khỏe sinh sản
  'bao-cao-su',
  'gel-boi-tron',
  
  // Thực phẩm & Đồ uống
  'tra-suc-khoe',
  'mat-ong',
  'nuoc-uong-bo-sung',
  
  // Vệ sinh cá nhân
  'xa-phong',
  'dung-dich-ve-sinh',
  'khu-mui',
  'kem-danh-rang',
  'ban-chai-danh-rang',
  'nuoc-suc-mieng',
  
  // Vệ sinh nhà cửa
  've-sinh-nha-cua',
  'giat-giu',
  'nha-bep',
  
  // Khuyến mãi
  'set-qua-tang',
  'combo-tiet-kiem',
  'khuyen-mai',
  
  // Tinh dầu & Spa
  'tinh-dau-thu-gian',
  'tinh-dau-tri-lieu',
  'tinh-dau-massage',
  
  // Thiết bị y tế
  'may-massage-mat',
  'may-xong-hoi',
  'may-tao-am',
  've-sinh-mui',
  'kim-cac-loai',
  'may-massage',
  'tui-chuom',
  'vo-gan-tinh-mach',
  'nhiet-ke',
  'may-do-huyet-ap',
  'may-do-duong-huyet',
  'bang-gac',
  'hop-so-cuu',
  'dung-dich-sat-khuan',
  'khau-trang-y-te',
  'khau-trang-n95',
  'khau-trang-vai'
];

// Tên từ subcategoryApiMap.js (SUBCATEGORY_ENDPOINTS) - NEW VERSION
const subcategoryNames = [
  'Canxi Vitamin D',
  'Vitamin tổng hợp',
  'Omega 3 DHA',
  'Vitamin C',
  'Sat Axit Folic',
  'Sinh lý nam',
  'Sinh lý nữ',
  'Tien Man Kinh',
  'Cơ xương khớp',
  'Hô hấp, ho, xoang',
  'Thận, tiền liệt tuyến',
  'Hỗ trợ điều trị trĩ',
  'Hỗ trợ điều trị gout',
  'Hỗ trợ điều trị',
  'Táo bón',
  'Khó tiêu',
  'Sua Duong The Kem Duong The',
  'Bổ não - cải thiện trí nhớ',
  'Kiểm soát căng thẳng',
  'Hỗ trợ giấc ngủ ngon',
  'Chăm sóc chuyên sâu cho tóc',
  'Cham Soc Da Mat',
  'Chăm sóc da nứt nẻ',
  'Huyết áp',
  'Tuần hoàn máu',
  'Giảm Cholesterol',
  'Sữa',
  'Nước Yến',
  'Thực phẩm - Đồ uống',
  'Sua Rua Mat',
  'Kem Chong Nang',
  'Duong Da Mat',
  'Mat Na',
  'Serum Essence',
  'Sua Tam',
  'Kem Duong The',
  'Tay Te Bao Chet',
  'Tri Mun',
  'Tri Tham Nam',
  'Da Nhay Cam',
  'Dau Goi',
  'Dau Xa',
  'Mat Na Toc',
  'Son môi',
  'Trang Diem Mat',
  'Kem Nen',
  'Kem Duong Mat',
  'Mat Na Mat',
  'Serum Mat',
  'Organic',
  'Thao Moc',
  'Vegan',
  'Khang Sinh',
  'Dieu Tri Ung Thu',
  'Tim Mach Mau',
  'Than Kinh',
  'Tieu Hoa Gan Mat',
  'Duoc Chat Khang Sinh',
  'Duoc Chat Giam Dau',
  'Duoc Chat Vitamin',
  'Duoc Lieu Dong Y',
  'Duoc Lieu Quy Hiem',
  'Duoc Lieu Pho Bien',
  'Bao cao su',
  'Gel bôi trơn',
  'Tra Suc Khoe',
  'Mat Ong',
  'Nuoc Uong Bo Sung',
  'Xa Phong',
  'Dung Dich Ve Sinh',
  'Khu Mui',
  'Kem đánh răng',
  'Ban Chai Danh Rang',
  'Nước súc miệng',
  'Ve Sinh Nha Cua',
  'Giat Giu',
  'Nha Bep',
  'Set Qua Tang',
  'Combo Tiet Kiem',
  'Khuyen Mai',
  'Tinh Dau Thu Gian',
  'Tinh Dau Tri Lieu',
  'Tinh dầu massage',
  'May Massage Mat',
  'May Xong Hoi',
  'May Tao Am',
  'Ve Sinh Mui',
  'Kim các loại',
  'Máy massage',
  'Túi chườm',
  'Vo Gan Tinh Mach',
  'Nhiệt kế',
  'Máy đo huyết áp',
  'May Do Duong Huyet',
  'Bang Gac',
  'Hop So Cuu',
  'Dung Dich Sat Khuan',
  'Khẩu trang y tế',
  'Khau Trang N95',
  'Khẩu trang vải'
];

console.log('\n🔍 Kiểm tra mapping giữa categories.js và subcategoryApiMap.js\n');
console.log('='.repeat(80));

// Tạo map từ tên -> slugified key
const apiMapKeys = subcategoryNames.map(name => slugify(name));
const nameToKeyMap = {};
subcategoryNames.forEach((name, index) => {
  nameToKeyMap[name] = apiMapKeys[index];
});

const missingInApiMap = [];
const missingInCategories = [];
const matched = [];

// Check keys trong categories.js mà không có trong API map
categoriesKeys.forEach(key => {
  if (apiMapKeys.includes(key)) {
    const name = subcategoryNames[apiMapKeys.indexOf(key)];
    matched.push({ key, name });
  } else {
    missingInApiMap.push(key);
  }
});

// Check keys trong API map mà không có trong categories.js
apiMapKeys.forEach((key, index) => {
  if (!categoriesKeys.includes(key)) {
    missingInCategories.push({ key, name: subcategoryNames[index] });
  }
});

console.log('\n✅ Keys khớp giữa 2 files:');
console.log(`(Tổng: ${matched.length} keys)\n`);
matched.forEach(item => {
  console.log(`  ✓ ${item.key} ← "${item.name}"`);
});

console.log('\n' + '='.repeat(80));
console.log('\n❌ Keys trong categories.js nhưng KHÔNG có trong subcategoryApiMap.js:');
console.log('(Cần thêm vào SUBCATEGORY_ENDPOINTS hoặc sửa key trong categories.js)\n');
if (missingInApiMap.length > 0) {
  missingInApiMap.forEach(key => {
    console.log(`  ✗ ${key}`);
  });
  console.log(`\n  → Tổng: ${missingInApiMap.length} keys bị thiếu`);
} else {
  console.log('  ✅ Không có keys nào bị thiếu');
}

console.log('\n' + '='.repeat(80));
console.log('\n⚠️  Keys trong subcategoryApiMap.js nhưng KHÔNG có trong categories.js:');
console.log('(Có thể không cần thiết hoặc thiếu trong menu)\n');
if (missingInCategories.length > 0) {
  missingInCategories.forEach(item => {
    console.log(`  ? ${item.key} ← "${item.name}"`);
  });
  console.log(`\n  → Tổng: ${missingInCategories.length} keys thừa`);
} else {
  console.log('  ✅ Không có keys nào thừa');
}

console.log('\n' + '='.repeat(80));
console.log('\n📊 Tổng kết:');
console.log(`  - Keys trong categories.js: ${categoriesKeys.length}`);
console.log(`  - Keys trong subcategoryApiMap.js: ${apiMapKeys.length}`);
console.log(`  - Keys khớp: ${matched.length}`);
console.log(`  - Thiếu trong API map: ${missingInApiMap.length}`);
console.log(`  - Thừa trong API map: ${missingInCategories.length}`);
console.log('');

// Tạo suggestions để fix
if (missingInApiMap.length > 0) {
  console.log('\n💡 Gợi ý sửa lỗi:\n');
  console.log('Thêm các entries sau vào SUBCATEGORY_ENDPOINTS trong subcategoryApiMap.js:\n');
  missingInApiMap.forEach(key => {
    // Tạo tên hiển thị từ key (capitalize và remove dashes)
    const displayName = key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    console.log(`  { name: "${displayName}", endpoint: "/api/products/category/${key}" },`);
  });
}
