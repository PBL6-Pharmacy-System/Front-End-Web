// Filter configurations
export const FILTER_CONFIG = {
  ageGroups: {
    title: 'Đối tượng sử dụng',
    expanded: true,
    hasSearch: false,
    options: [
      { key: 'all', label: 'Tất cả' },
      { key: 'children', label: 'Trẻ em' },
      { key: 'pregnant', label: 'Phụ nữ có thai' },
      { key: 'breastfeeding', label: 'Phụ nữ cho con bú' },
      { key: 'adults', label: 'Người lớn' }
    ]
  },
  priceRange: {
    title: 'Giá bán',
    expanded: true,
    hasSearch: false,
    type: 'price',
    options: [
      { key: 'under100k', label: 'Dưới 100,000₫', min: 0, max: 100000 },
      { key: 'from100to300k', label: '100,000₫ đến 300,000₫', min: 100000, max: 300000 },
      { key: 'from300to500k', label: '300,000₫ đến 500,000₫', min: 300000, max: 500000 },
      { key: 'over500k', label: 'Trên 500,000₫', min: 500000, max: Infinity }
    ]
  },
  brands: {
    title: 'Thương hiệu',
    expanded: false,
    hasSearch: true,
    options: [
      { key: 'all', label: 'Tất cả' },
      { key: 'vitabiotics', label: 'Vitabiotics' },
      { key: 'brauer', label: 'Brauer' },
      { key: 'hatro', label: 'Hatro' },
      { key: 'kudos', label: 'KUDOS' },
      { key: 'blackmores', label: 'Blackmores' },
      { key: 'nature', label: 'Nature\'s Way' },
      { key: 'centrum', label: 'Centrum' }
    ]
  },
  origins: {
    title: 'Xuất xứ thương hiệu',
    expanded: false,
    hasSearch: true,
    options: [
      { key: 'all', label: 'Tất cả' },
      { key: 'usa', label: 'Hoa Kỳ' },
      { key: 'vietnam', label: 'Việt Nam' },
      { key: 'uk', label: 'Anh' },
      { key: 'australia', label: 'Úc' },
      { key: 'germany', label: 'Đức' },
      { key: 'japan', label: 'Nhật Bản' }
    ]
  },
  ingredients: {
    title: 'Chỉ định',
    expanded: false,
    hasSearch: true,
    options: [
      { key: 'all', label: 'Tất cả' },
      { key: 'nutrition', label: 'Suy dinh dưỡng' },
      { key: 'probiotics', label: 'Cơi xương' },
      { key: 'digestive', label: 'Suy giảm hệ miễn dịch' },
      { key: 'fatigue', label: 'Mệt mỏi' },
      { key: 'memory', label: 'Tăng cường trí nhớ' },
      { key: 'skin', label: 'Chăm sóc da' }
    ]
  }
};

// Initial filter state
export const INITIAL_FILTER_STATE = {
  ageGroups: {
    all: true,
    children: false,
    pregnant: false,
    breastfeeding: false,
    adults: false
  },
  priceRange: {
    under100k: false,
    from100to300k: false,
    from300to500k: false,
    over500k: false
  },
  brands: {
    all: true,
    vitabiotics: false,
    brauer: false,
    hatro: false,
    kudos: false,
    blackmores: false,
    nature: false,
    centrum: false
  },
  origins: {
    all: true,
    usa: false,
    vietnam: false,
    uk: false,
    australia: false,
    germany: false,
    japan: false
  },
  ingredients: {
    all: true,
    nutrition: false,
    probiotics: false,
    digestive: false,
    fatigue: false,
    memory: false,
    skin: false
  }
};

// Initial expanded sections state
export const INITIAL_EXPANDED_STATE = {
  ageGroups: true,
  priceRange: true,
  brands: false,
  origins: false,
  ingredients: false
};

// Sort options
export const SORT_OPTIONS = [
  { key: 'bestselling', label: 'Bán chạy' },
  { key: 'priceAsc', label: 'Giá thấp' },
  { key: 'priceDesc', label: 'Giá cao' },
  { key: 'newest', label: 'Mới nhất' },
  { key: 'rating', label: 'Đánh giá cao' }
];

// View modes
export const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list'
};

// Filter helper functions
export const filterHelpers = {
  // Handle regular filter changes - SỬA LẠI HOÀN TOÀN
  handleFilterChange: (filters, filterType, filterKey) => {
    const newFilters = JSON.parse(JSON.stringify(filters)); // Deep clone
    
    if (filterKey === 'all') {
      // Nếu click vào "Tất cả"
      if (newFilters[filterType].all) {
        // Nếu "Tất cả" đã được chọn, không làm gì (không cho bỏ chọn)
        return newFilters;
      } else {
        // Nếu "Tất cả" chưa được chọn, chọn nó và bỏ chọn tất cả cái khác
        Object.keys(newFilters[filterType]).forEach(key => {
          newFilters[filterType][key] = key === 'all';
        });
      }
    } else {
      // Toggle specific filter
      newFilters[filterType][filterKey] = !newFilters[filterType][filterKey];
      
      // Nếu có bất kỳ filter cụ thể nào được chọn, bỏ chọn "Tất cả"
      const hasActiveSpecificFilter = Object.keys(newFilters[filterType])
        .filter(key => key !== 'all')
        .some(key => newFilters[filterType][key]);
      
      if (hasActiveSpecificFilter) {
        newFilters[filterType].all = false;
      } else {
        // Nếu không có filter cụ thể nào được chọn, tự động chọn "Tất cả"
        newFilters[filterType].all = true;
      }
    }
    
    return newFilters;
  },

  // Handle price range filter (exclusive selection) - SỬA LẠI
  handlePriceRangeFilter: (filters, range) => {
    const newFilters = JSON.parse(JSON.stringify(filters)); // Deep clone
    
    if (newFilters.priceRange[range]) {
      // Nếu đã được chọn, bỏ chọn nó
      newFilters.priceRange[range] = false;
    } else {
      // Reset all price filters trước
      Object.keys(newFilters.priceRange).forEach(key => {
        newFilters.priceRange[key] = false;
      });
      // Set selected range
      newFilters.priceRange[range] = true;
    }
    
    return newFilters;
  },

  // Toggle expanded sections
  toggleSection: (expandedSections, section) => {
    return {
      ...expandedSections,
      [section]: !expandedSections[section]
    };
  },

  // Apply filters to products - HOÀN TOÀN MỚI
  applyFilters: (products, filters) => {
    // Kiểm tra products trước
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.warn('⚠️ applyFilters - Invalid products:', products);
      return [];
    }
    
    let filtered = [...products];
    
    console.log('🔧 Applying filters to', filtered.length, 'products');

    // 1. Price Range Filter
    if (filters.priceRange && Object.keys(filters.priceRange).length > 0) {
      const activePriceRanges = Object.keys(filters.priceRange).filter(
        key => filters.priceRange[key]
      );
      
      if (activePriceRanges.length > 0) {
        const priceConfig = FILTER_CONFIG.priceRange.options.find(
          opt => opt.key === activePriceRanges[0]
        );
        
        if (priceConfig) {
          filtered = filtered.filter(product => {
            // Lấy giá thực tế từ product (support > price)
            const actualPrice = product.support || product.price || 0;
            return actualPrice >= priceConfig.min && actualPrice <= priceConfig.max;
          });
          console.log(`💰 Price filter (${priceConfig.label}):`, filtered.length, 'products');
        }
      }
    }

    // 2. Age Groups Filter (Đối tượng sử dụng)
    if (filters.ageGroups && !filters.ageGroups.all) {
      const activeAgeGroups = Object.keys(filters.ageGroups).filter(
        key => key !== 'all' && filters.ageGroups[key]
      );
      
      if (activeAgeGroups.length > 0) {
        filtered = filtered.filter(product => {
          // Kiểm tra trong description hoặc các field liên quan
          const searchText = `${product.name} ${product.description || ''} ${product.category || ''}`.toLowerCase();
          
          return activeAgeGroups.some(ageGroup => {
            switch(ageGroup) {
              case 'children':
                return searchText.includes('trẻ em') || searchText.includes('bé') || searchText.includes('kid');
              case 'pregnant':
                return searchText.includes('có thai') || searchText.includes('bầu') || searchText.includes('pregnant');
              case 'breastfeeding':
                return searchText.includes('cho con bú') || searchText.includes('кормящих');
              case 'adults':
                return searchText.includes('người lớn') || searchText.includes('adult');
              default:
                return false;
            }
          });
        });
        console.log(`👥 Age groups filter:`, filtered.length, 'products');
      }
    }

    // 3. Brands Filter (Thương hiệu)
    if (filters.brands && !filters.brands.all) {
      const activeBrands = Object.keys(filters.brands).filter(
        key => key !== 'all' && filters.brands[key]
      );
      
      if (activeBrands.length > 0) {
        filtered = filtered.filter(product => {
          const productBrand = (product.brand || '').toLowerCase();
          return activeBrands.some(brandKey => {
            const brandLabel = FILTER_CONFIG.brands.options.find(opt => opt.key === brandKey)?.label.toLowerCase();
            return productBrand.includes(brandLabel || brandKey);
          });
        });
        console.log(`🏷️ Brands filter:`, filtered.length, 'products');
      }
    }

    // 4. Origins Filter (Xuất xứ)
    if (filters.origins && !filters.origins.all) {
      const activeOrigins = Object.keys(filters.origins).filter(
        key => key !== 'all' && filters.origins[key]
      );
      
      if (activeOrigins.length > 0) {
        filtered = filtered.filter(product => {
          const productOrigin = (product.origin || product.made_in || '').toLowerCase();
          return activeOrigins.some(originKey => {
            const originLabel = FILTER_CONFIG.origins.options.find(opt => opt.key === originKey)?.label.toLowerCase();
            return productOrigin.includes(originLabel || originKey);
          });
        });
        console.log(`🌍 Origins filter:`, filtered.length, 'products');
      }
    }

    // 5. Ingredients/Indications Filter (Chỉ định)
    if (filters.ingredients && !filters.ingredients.all) {
      const activeIngredients = Object.keys(filters.ingredients).filter(
        key => key !== 'all' && filters.ingredients[key]
      );
      
      if (activeIngredients.length > 0) {
        filtered = filtered.filter(product => {
          const searchText = `${product.name} ${product.description || ''} ${product.dosage || ''} ${product.indication || ''}`.toLowerCase();
          
          return activeIngredients.some(ingredientKey => {
            switch(ingredientKey) {
              case 'nutrition':
                return searchText.includes('dinh dưỡng') || searchText.includes('nutrition');
              case 'probiotics':
                return searchText.includes('xương') || searchText.includes('bone') || searchText.includes('calcium');
              case 'digestive':
                return searchText.includes('miễn dịch') || searchText.includes('immune');
              case 'fatigue':
                return searchText.includes('mệt') || searchText.includes('fatigue');
              case 'memory':
                return searchText.includes('trí nhớ') || searchText.includes('memory') || searchText.includes('não');
              case 'skin':
                return searchText.includes('da') || searchText.includes('skin');
              default:
                return false;
            }
          });
        });
        console.log(`� Ingredients filter:`, filtered.length, 'products');
      }
    }

    console.log('✅ Final filtered:', filtered.length, 'products');
    return filtered;
  },

  // Sort products
  sortProducts: (products, sortBy) => {
    const sortedProducts = [...products];
    
    switch(sortBy) {
      case 'priceAsc':
        return sortedProducts.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return sortedProducts.sort((a, b) => b.price - a.price);
      case 'newest':
        return sortedProducts.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      case 'rating':
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'bestselling':
      default:
        return sortedProducts.sort((a, b) => b.sold - a.sold);
    }
  },

  // Generate sample products (for demo)
  generateSampleProducts: (currentCategory, count = 12) => {
    const products = [];
    const sampleBrands = ['Vitabiotics', 'Brauer', 'Hatro', 'KUDOS', 'Blackmores', 'Nature\'s Way'];
    const sampleOrigins = ['Hoa Kỳ', 'Việt Nam', 'Anh', 'Úc', 'Đức', 'Nhật Bản'];
    
    for (let i = 1; i <= count; i++) {
      const price = Math.floor(Math.random() * 500000) + 50000;
      const discount = Math.random() > 0.6 ? Math.floor(Math.random() * 30) + 5 : 0;
      const oldPrice = discount > 0 ? Math.floor(price / (1 - discount / 100)) : null;
      
      products.push({
        id: `${currentCategory?.key || 'product'}-${i}`,
        name: `${currentCategory?.name || 'Sản phẩm'} ${i} - Mô tả chi tiết sản phẩm chất lượng cao từ thương hiệu uy tín`,
        price: price,
        oldPrice: oldPrice,
        unit: 'Hộp',
        sold: Math.floor(Math.random() * 200) + 10,
        image: currentCategory?.data?.categories?.[0]?.icon || '💊',
        discount: discount,
        brand: sampleBrands[Math.floor(Math.random() * sampleBrands.length)],
        origin: sampleOrigins[Math.floor(Math.random() * sampleOrigins.length)],
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
      });
    }
    
    return products;
  },

  // Search within filter options
  searchFilterOptions: (options, searchTerm) => {
    if (!searchTerm.trim()) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  // Get active filter count - SỬA LẠI
  getActiveFilterCount: (filters) => {
    let count = 0;
    
    Object.keys(filters).forEach(filterType => {
      if (filterType === 'priceRange') {
        // Count price range filters
        count += Object.keys(filters[filterType])
          .filter(key => filters[filterType][key]).length;
      } else {
        // Count other filters (excluding 'all' and only when 'all' is false)
        if (!filters[filterType].all) {
          count += Object.keys(filters[filterType])
            .filter(key => key !== 'all' && filters[filterType][key]).length;
        }
      }
    });
    
    return count;
  },

  // Reset all filters - SỬA LẠI
  resetAllFilters: () => {
    return JSON.parse(JSON.stringify(INITIAL_FILTER_STATE));
  },

  // Reset specific filter type
  resetFilterType: (filters, filterType) => {
    const newFilters = JSON.parse(JSON.stringify(filters));
    newFilters[filterType] = JSON.parse(JSON.stringify(INITIAL_FILTER_STATE[filterType]));
    return newFilters;
  },

  // Get category name from key - Helper function
  getCategoryFromKey: (categoryKey) => {
    // Convert key to readable name
    if (!categoryKey) return 'Tất cả sản phẩm';
    
    // Replace hyphens with spaces and capitalize
    return categoryKey
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};

// Export default for convenience
export default {
  FILTER_CONFIG,
  INITIAL_FILTER_STATE,
  INITIAL_EXPANDED_STATE,
  SORT_OPTIONS,
  VIEW_MODES,
  filterHelpers
};