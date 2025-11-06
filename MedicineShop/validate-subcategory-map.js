/**
 * Validation script for subcategoryApiMap.js
 * Kiểm tra tính hợp lệ của mapping configuration
 * 
 * Chạy: node validate-subcategory-map.js
 */

// Import the map
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Subcategory API Map...\n');

// Read the file
const mapFilePath = path.join(__dirname, 'src', 'services', 'subcategoryApiMap.js');
let fileContent;

try {
  fileContent = fs.readFileSync(mapFilePath, 'utf8');
} catch (error) {
  console.error('❌ Cannot read subcategoryApiMap.js:', error.message);
  process.exit(1);
}

// Extract SUBCATEGORY_ENDPOINTS array using regex (simple extraction)
const endpointsMatch = fileContent.match(/const SUBCATEGORY_ENDPOINTS = \[([\s\S]*?)\];/);
if (!endpointsMatch) {
  console.error('❌ Cannot find SUBCATEGORY_ENDPOINTS array');
  process.exit(1);
}

// Count entries
const entryMatches = fileContent.match(/\{ name:/g);
const entryCount = entryMatches ? entryMatches.length : 0;

console.log(`📊 Total Entries: ${entryCount}\n`);

// Validation checks
let issues = [];
let warnings = [];

// Check 1: Duplicate names
const nameMatches = fileContent.match(/name: '([^']+)'/g);
if (nameMatches) {
  const names = nameMatches.map(m => m.match(/name: '([^']+)'/)[1]);
  const nameCounts = {};
  names.forEach(name => {
    nameCounts[name] = (nameCounts[name] || 0) + 1;
  });
  
  const duplicates = Object.entries(nameCounts).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    issues.push({
      type: 'Duplicate Names',
      items: duplicates.map(([name, count]) => `"${name}" appears ${count} times`)
    });
  }
}

// Check 2: Empty or invalid APIs
const apiMatches = fileContent.match(/api: '([^']*)'/g);
if (apiMatches) {
  const emptyApis = apiMatches.filter(m => {
    const url = m.match(/api: '([^']*)'/)[1];
    return !url || url.trim() === '';
  });
  
  if (emptyApis.length > 0) {
    issues.push({
      type: 'Empty API URLs',
      count: emptyApis.length
    });
  }
}

// Check 3: URL format validation
if (apiMatches) {
  const invalidUrls = [];
  apiMatches.forEach(m => {
    const url = m.match(/api: '([^']*)'/)[1];
    if (url) {
      // Check if it's absolute URL with wrong host or malformed relative URL
      if (url.startsWith('http') && !url.includes('localhost:3000')) {
        invalidUrls.push(`Wrong host: ${url}`);
      }
      if (!url.startsWith('http') && !url.startsWith('/')) {
        invalidUrls.push(`Malformed relative: ${url}`);
      }
    }
  });
  
  if (invalidUrls.length > 0) {
    warnings.push({
      type: 'Potential URL Issues',
      items: invalidUrls.slice(0, 5) // Show first 5
    });
  }
}

// Check 4: Special characters that might cause issues
if (nameMatches) {
  const names = nameMatches.map(m => m.match(/name: '([^']+)'/)[1]);
  const specialCharIssues = names.filter(name => {
    // Check for characters that might cause encoding issues
    return /[<>\"\'`\\]/.test(name);
  });
  
  if (specialCharIssues.length > 0) {
    warnings.push({
      type: 'Special Characters in Names',
      items: specialCharIssues.slice(0, 5)
    });
  }
}

// Check 5: Consistency check - all entries have both name and api
const entriesWithoutApi = fileContent.match(/\{ name: '[^']+' \}/g);
if (entriesWithoutApi && entriesWithoutApi.length > 0) {
  issues.push({
    type: 'Entries Missing API',
    count: entriesWithoutApi.length
  });
}

// Display results
console.log('═══════════════════════════════════════\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed!\n');
  console.log('Summary:');
  console.log(`  - Total entries: ${entryCount}`);
  console.log(`  - No duplicates found`);
  console.log(`  - All URLs valid`);
  console.log(`  - No special character issues`);
} else {
  if (issues.length > 0) {
    console.log('❌ Issues Found:\n');
    issues.forEach(issue => {
      console.log(`  ${issue.type}:`);
      if (issue.items) {
        issue.items.forEach(item => console.log(`    - ${item}`));
      } else if (issue.count) {
        console.log(`    Count: ${issue.count}`);
      }
      console.log('');
    });
  }
  
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    warnings.forEach(warning => {
      console.log(`  ${warning.type}:`);
      if (warning.items) {
        warning.items.forEach(item => console.log(`    - ${item}`));
        if (warning.items.length < warning.count) {
          console.log(`    ... and ${warning.count - warning.items.length} more`);
        }
      }
      console.log('');
    });
  }
}

console.log('═══════════════════════════════════════\n');

// Test slugify function
console.log('🧪 Testing Slugify Function:\n');
const testCases = [
  'Máy massage',
  'Vitamin & Khoáng chất',
  'Kem chống nắng da mặt',
  'Bổ não - cải thiện trí nhớ',
  'Dầu gội, dầu xả'
];

// Simple slugify implementation (matching the one in subcategoryApiMap.js)
const slugify = (str) => {
  if (!str) return '';
  const from = 'ÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶáàảãạâấầẩẫậăắằẳẵặÉÈẺẼẸÊẾỀỂỄỆéèẻẽẹêếềểễệÍÌỈĨỊíìỉĩịÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢóòỏõọôốồổỗộơớờởỡợÚÙỦŨỤƯỨỪỬỮỰúùủũụưứừửữựÝỲỶỸỴýỳỷỹỵĐđ';
  const to   = 'AAAAAAAAAAAAAAAAaaaaaaaaaaaaaaaaEEEEEEEEEEEEeeeeeeeeeeeeIIIIIIiiiiiiOOOOOOOOOOOOOoooooooooooooUUUUUUUUUUuuuuuuuuuuYYYYYyyyyyDd';
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

testCases.forEach(name => {
  const slug = slugify(name);
  console.log(`  "${name}"`);
  console.log(`    → "${slug}"`);
  console.log('');
});

console.log('═══════════════════════════════════════\n');

// Recommendations
console.log('💡 Recommendations:\n');
if (issues.length > 0) {
  console.log('  1. Fix all issues before deploying');
  console.log('  2. Remove duplicate entries');
  console.log('  3. Ensure all entries have valid API URLs');
}
if (warnings.length > 0) {
  console.log('  1. Review URL formats for consistency');
  console.log('  2. Test special characters in browser');
  console.log('  3. Consider using slugs instead of display names in URLs');
}
if (issues.length === 0 && warnings.length === 0) {
  console.log('  ✅ Configuration looks good!');
  console.log('  📝 Next: Run test-subcategory-apis.ps1 to test endpoints');
  console.log('  🚀 Then: Test in browser');
}

console.log('');
console.log('Done! ✨\n');
