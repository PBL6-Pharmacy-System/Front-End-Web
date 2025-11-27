import http from 'http';

const BASE_URL = 'http://localhost:3000/api';

const testApis = [
  // Working APIs (using categoryId)
  { name: 'Categories Tree', url: BASE_URL + '/categories/tree' },
  { name: 'All Products', url: BASE_URL + '/products' },
  { name: 'Best Sellers', url: BASE_URL + '/products/best-sellers' },
  { name: 'Flash Sales ACTIVE', url: BASE_URL + '/flashsales/active' },
  { name: 'Products by categoryId=8', url: BASE_URL + '/products?categoryId=8' },  // Dưỡng da mặt
  { name: 'Products by categoryId=52', url: BASE_URL + '/products?categoryId=52' }, // Serum
  { name: 'Products by categoryId=71', url: BASE_URL + '/products?categoryId=71' }, // Kem chống nắng
  { name: 'Products by categoryId=106', url: BASE_URL + '/products?categoryId=106' }, // Son môi
  { name: 'Products by categoryId=92', url: BASE_URL + '/products?categoryId=92' }, // Sữa tắm
  { name: 'Products by categoryId=1', url: BASE_URL + '/products?categoryId=1' },
  { name: 'Products by categoryId=2', url: BASE_URL + '/products?categoryId=2' },
  { name: 'Products by categoryId=10', url: BASE_URL + '/products?categoryId=10' },
  { name: 'Products by categoryId=20', url: BASE_URL + '/products?categoryId=20' },
  { name: 'Products by categoryId=50', url: BASE_URL + '/products?categoryId=50' },
  { name: 'Products by categoryId=128', url: BASE_URL + '/products?categoryId=128' }, // Thực phẩm chức năng
  { name: 'Products by categoryId=129', url: BASE_URL + '/products?categoryId=129' }, // Dược mỹ phẩm
  { name: 'Products by categoryId=130', url: BASE_URL + '/products?categoryId=130' }, // Chăm sóc cá nhân
  { name: 'Products by categoryId=131', url: BASE_URL + '/products?categoryId=131' }, // Thiết bị y tế
];

async function testApi(name, url) {
  return new Promise((resolve) => {
    const encodedUrl = encodeURI(url);
    http.get(encodedUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const count = json.data?.products?.length || json.data?.length || json.products?.length || (Array.isArray(json) ? json.length : 0);
          const total = json.data?.total || json.total || count;
          if (res.statusCode === 200 && count > 0) {
            console.log('✅', name, '- Status:', res.statusCode, '- Items:', count, '- Total:', total);
          } else if (res.statusCode === 200 && count === 0) {
            console.log('⚠️', name, '- Status:', res.statusCode, '- Items: 0 (NO DATA)');
          } else {
            console.log('❌', name, '- Status:', res.statusCode, '- Message:', json.message || json.error || 'Unknown');
          }
        } catch(e) {
          console.log('❌', name, '- Parse Error:', e.message);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log('❌', name, '- Connection Error:', err.message);
      resolve();
    });
  });
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Testing Product Category APIs...');
  console.log('='.repeat(60));
  console.log('');
  
  for (const api of testApis) {
    await testApi(api.name, api.url);
  }
  
  console.log('');
  console.log('='.repeat(60));
  console.log('Test completed!');
  console.log('='.repeat(60));
}

runTests();
