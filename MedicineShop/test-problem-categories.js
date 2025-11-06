// Script để test các categories có vấn đề
const problematicCategories = [
  { key: 'canxi-vitamin-d', backendName: 'Bổ sung Canxi & Vitamin D' },
  { key: 'omega-3-dha', backendName: 'Dầu cá, Omega 3, DHA' },
  { key: 'vitamin-c', backendName: 'Vitamin C các loại' },
  { key: 'sat-axit-folic', backendName: 'Bổ sung Sắt & Axit Folic' },
  { key: 'tien-man-kinh', backendName: 'Hỗ trợ mãn kinh' },
  { key: 'sua-duong-the-kem-duong-the', backendName: 'Sữa dưỡng thể, kem dưỡng thể' },
  { key: 'cham-soc-da-mat', backendName: 'Chăm sóc da mặt' },
  { key: 'sua-rua-mat', backendName: 'Sữa rửa mặt (Kem, gel, sữa)' },
  { key: 'kem-chong-nang', backendName: 'Kem chống nắng da mặt' },
  { key: 'duong-da-mat', backendName: 'Dưỡng da mặt' },
  { key: 'mat-na', backendName: 'Mặt nạ' },
  { key: 'serum-essence', backendName: 'Serum, Essence hoặc Ampoule' }
];

// Import slugify function
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

console.log('\n🔍 Kiểm tra mapping cho các categories có vấn đề\n');
console.log('='.repeat(80));

let allMatch = true;

problematicCategories.forEach(({ key, backendName }) => {
  const slugifiedName = slugify(backendName);
  const match = slugifiedName === key;
  
  if (!match) {
    allMatch = false;
    console.log(`\n❌ KHÔNG KHỚP:`);
    console.log(`   Frontend key:     ${key}`);
    console.log(`   Backend name:     "${backendName}"`);
    console.log(`   Slugified:        ${slugifiedName}`);
    console.log(`   → Cần dùng frontend key "${key}" làm name trong SUBCATEGORY_ENDPOINTS`);
  } else {
    console.log(`\n✅ Khớp: ${key} ← "${backendName}"`);
  }
});

console.log('\n' + '='.repeat(80));

if (allMatch) {
  console.log('\n🎉 TẤT CẢ ĐỀU KHỚP! Có thể load data thành công.\n');
} else {
  console.log('\n⚠️  CÓ KEYS KHÔNG KHỚP! Cần fix name trong SUBCATEGORY_ENDPOINTS.\n');
  console.log('💡 Giải pháp: Dùng tên đơn giản làm "name" (để slugify ra đúng key),');
  console.log('   nhưng giữ nguyên tên backend đầy đủ trong "api" URL.\n');
}
