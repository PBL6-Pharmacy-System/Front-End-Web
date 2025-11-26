const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// THÊM: Function để gộp tất cả catalog products
const getAllCatalogProductsData = () => {
  const allProducts = [];
  
  try {
    // Từ vitaminProducts.json
    if (vitaminData && vitaminData.products) {
      const vitaminProducts = vitaminData.products.map(product => ({
        ...product,
        categoryKey: vitaminData.category,
        categoryName: vitaminData.categoryName,
        source: 'vitamin'
      }));
      allProducts.push(...vitaminProducts);
    }
    
    // Từ hormonalProducts.json
    if (hormonalData && hormonalData.products) {
      const hormonalProducts = hormonalData.products.map(product => ({
        ...product,
        categoryKey: hormonalData.category,
        categoryName: hormonalData.categoryName,
        source: 'hormonal'
      }));
      allProducts.push(...hormonalProducts);
    }
    
    // Từ functionalProducts.json
    if (functionalData && functionalData.products) {
      const functionalProducts = functionalData.products.map(product => ({
        ...product,
        categoryKey: functionalData.category,
        categoryName: functionalData.categoryName,
        source: 'functional'
      }));
      allProducts.push(...functionalProducts);
    }
    
    console.log('📦 Loaded catalog products:', allProducts.length);
    return allProducts;
  } catch (error) {
    console.error('❌ Error loading catalog products:', error);
    return [];
  }
};

export class MockApiService {
  // Get flash sale products
  static async getFlashSaleProducts() {
    try {
      await delay(400);
      
      return {
        success: true,
        data: flashSaleData,
        message: 'Flash sale products fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch flash sale products',
        data: []
      };
    }
  }

  // Get listing products
  static async getListingProducts() {
    try {
      await delay(450);
      
      return {
        success: true,
        data: listingProductsData,
        message: 'Listing products fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch listing products',
        data: []
      };
    }
  }

  // CẬP NHẬT: Get single product by ID
  static async getProductById(id) {
    try {
      await delay(300);
      
      console.log('Searching for product ID:', id, 'Type:', typeof id);
      
      const numericId = parseInt(id);
      const stringId = String(id);
      
      // Tìm theo thứ tự: flashSale -> listing -> catalog (vitamin, hormonal, functional) -> medical
      const searchSources = [
        { name: 'Flash Sale', data: flashSaleData },
        { name: 'Listing', data: listingProductsData },
        { name: 'Catalog Products', data: getAllCatalogProductsData() } // THÊM catalog products
      ];
      
      for (const source of searchSources) {
        console.log(`🔍 Searching in ${source.name}, products count:`, source.data.length);
        
        const product = source.data.find(p => {
          const match = p.id === id || 
                       p.id === numericId || 
                       p.id === stringId ||
                       String(p.id) === stringId ||
                       parseInt(p.id) === numericId;
          
          if (match) {
            console.log(`✅ Found product in ${source.name}:`, p);
          }
          return match;
        });
        
        if (product) {
          return {
            success: true,
            data: product,
            message: `Product found in ${source.name}`,
            source: source.name
          };
        }
      }
      
      // Nếu không tìm thấy, thử tìm trong medical products
      console.log('Not found in main sources, searching medical products...');
      const medicalResponse = await this.getMedicalProductById(id);
      if (medicalResponse.success) {
        return medicalResponse;
      }
      
      console.log('❌ Product not found in any source');
      return {
        success: false,
        error: 'Product not found',
        data: null
      };
    } catch (error) {
      console.error('Error in getProductById:', error);
      return {
        success: false,
        error: 'Failed to fetch product',
        data: null
      };
    }
  }

  // THÊM: Get catalog products by category
  static async getCatalogProductsByCategory(categoryKey) {
    try {
      await delay(300);
      
      const allCatalogProducts = getAllCatalogProductsData();
      const filteredProducts = allCatalogProducts.filter(product => 
        product.categoryKey === categoryKey
      );
      
      return {
        success: true,
        data: filteredProducts,
        message: `Found ${filteredProducts.length} products in ${categoryKey}`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch catalog products by category',
        data: []
      };
    }
  }

  // THÊM: Get all catalog products
  static async getAllCatalogProducts() {
    try {
      await delay(300);
      
      const allProducts = getAllCatalogProductsData();
      
      return {
        success: true,
        data: allProducts,
        message: `Fetched ${allProducts.length} catalog products`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch all catalog products',
        data: []
      };
    }
  }

  // THÊM: Search catalog products
  static async searchCatalogProducts(query) {
    try {
      await delay(400);
      
      if (!query || query.trim() === '') {
        return this.getAllCatalogProducts();
      }

      const allProducts = getAllCatalogProductsData();
      const searchQuery = query.toLowerCase();
      
      const filteredProducts = allProducts.filter(product =>
        (product.name && product.name.toLowerCase().includes(searchQuery)) ||
        (product.description && product.description.toLowerCase().includes(searchQuery)) ||
        (product.category && product.category.toLowerCase().includes(searchQuery))
      );

      return {
        success: true,
        data: filteredProducts,
        message: `Found ${filteredProducts.length} products matching "${query}"`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Search failed',
        data: []
      };
    }
  }

  // Filter listing products by category
  static async getListingProductsByCategory(category) {
    try {
      await delay(350);
      
      const filteredProducts = listingProductsData.filter(product =>
        product.category === category
      );

      return {
        success: true,
        data: filteredProducts,
        message: `Found ${filteredProducts.length} products in ${category}`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Filter failed',
        data: []
      };
    }
  }

  // Get listing products with pagination
  static async getListingProductsPaginated(page = 1, limit = 8) {
    try {
      await delay(400);
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = listingProductsData.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: paginatedProducts,
        pagination: {
          current_page: page,
          per_page: limit,
          total: listingProductsData.length,
          total_pages: Math.ceil(listingProductsData.length / limit)
        },
        message: 'Listing products fetched with pagination'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Pagination failed',
        data: []
      };
    }
  }

  // Get listing products sorted by price/name/discount
  static async getListingProductsSorted(sortBy = 'price_asc') {
    try {
      await delay(350);
      
      let sortedProducts = [...listingProductsData];
      
      switch (sortBy) {
        case 'price_asc':
          sortedProducts.sort((a, b) => {
            const priceA = parseFloat((a.support || '0').replace(/[.,]/g, ''));
            const priceB = parseFloat((b.support || '0').replace(/[.,]/g, ''));
            return priceA - priceB;
          });
          break;
        case 'price_desc':
          sortedProducts.sort((a, b) => {
            const priceA = parseFloat((a.support || '0').replace(/[.,]/g, ''));
            const priceB = parseFloat((b.support || '0').replace(/[.,]/g, ''));
            return priceB - priceA;
          });
          break;
        case 'name_asc':
          sortedProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          break;
        case 'name_desc':
          sortedProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
          break;
        case 'discount_desc':
          sortedProducts.sort((a, b) => {
            const getDiscountValue = (discount) => {
              if (!discount) return 0;
              if (discount.includes('%')) {
                return parseFloat(discount.replace(/[-%]/g, ''));
              }
              if (discount.includes('đ')) {
                return parseFloat(discount.replace(/[-.đ]/g, ''));
              }
              return 0;
            };
            return getDiscountValue(b.discount) - getDiscountValue(a.discount);
          });
          break;
        default:
          break;
      }
      
      return {
        success: true,
        data: sortedProducts,
        message: `Products sorted by ${sortBy}`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Sort failed',
        data: []
      };
    }
  }

  // Get listing products by price range
  static async getListingProductsByPriceRange(minPrice = 0, maxPrice = Infinity) {
    try {
      await delay(350);
      
      const filteredProducts = listingProductsData.filter(product => {
        if (!product.support) return false;
        const price = parseFloat(product.support.replace(/[.,]/g, ''));
        return price >= minPrice && price <= maxPrice;
      });

      return {
        success: true,
        data: filteredProducts,
        message: `Found ${filteredProducts.length} products in price range`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Price filter failed',
        data: []
      };
    }
  }

  // Get all categories from listing products
  static async getListingCategories() {
    try {
      await delay(200);
      
      const categories = [...new Set(
        listingProductsData
          .filter(product => product.category)
          .map(product => product.category)
      )].sort();

      return {
        success: true,
        data: categories,
        message: 'Categories fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch categories',
        data: []
      };
    }
  }

  // Get listing products with advanced filters
  static async getListingProductsWithFilters(filters = {}) {
    try {
      await delay(450);
      
      let filteredProducts = [...listingProductsData];
      
      // Filter by category
      if (filters.category) {
        filteredProducts = filteredProducts.filter(product => 
          product.category === filters.category
        );
      }
      
      // Filter by price range
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        const minPrice = filters.minPrice || 0;
        const maxPrice = filters.maxPrice || Infinity;
        
        filteredProducts = filteredProducts.filter(product => {
          if (!product.support) return false;
          const price = parseFloat(product.support.replace(/[.,]/g, ''));
          return price >= minPrice && price <= maxPrice;
        });
      }
      
      // Filter by search query
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          (product.name && product.name.toLowerCase().includes(query)) ||
          (product.description && product.description.toLowerCase().includes(query))
        );
      }
      
      // Filter by discount
      if (filters.hasDiscount) {
        filteredProducts = filteredProducts.filter(product => 
          product.discount && product.discount !== ''
        );
      }
      
      // Sort results
      if (filters.sortBy) {
        const sortResponse = await this.getListingProductsSorted(filters.sortBy);
        if (sortResponse.success) {
          // Apply sort to filtered results
          const sortedData = sortResponse.data;
          filteredProducts = filteredProducts.sort((a, b) => {
            const indexA = sortedData.findIndex(item => item.id === a.id);
            const indexB = sortedData.findIndex(item => item.id === b.id);
            return indexA - indexB;
          });
        }
      }

      return {
        success: true,
        data: filteredProducts,
        message: `Found ${filteredProducts.length} products with filters`,
        filters: filters
      };
    } catch (error) {
      return {
        success: false,
        error: 'Advanced filter failed',
        data: []
      };
    }
  }

  // Get featured listing products
  static async getFeaturedListingProducts(limit = 8) {
    try {
      await delay(300);
      
      // Lấy sản phẩm có discount cao nhất
      const featuredProducts = listingProductsData
        .filter(product => product.discount)
        .sort((a, b) => {
          const getDiscountValue = (discount) => {
            if (!discount) return 0;
            if (discount.includes('%')) {
              return parseFloat(discount.replace(/[-%]/g, ''));
            }
            if (discount.includes('đ')) {
              return parseFloat(discount.replace(/[-.đ]/g, ''));
            }
            return 0;
          };
          return getDiscountValue(b.discount) - getDiscountValue(a.discount);
        })
        .slice(0, limit);
      
      return {
        success: true,
        data: featuredProducts,
        message: 'Featured listing products fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch featured listing products',
        data: []
      };
    }
  }

  // Get all medical products
  static async getMedicalProducts() {
    try {
      await delay(400);
      
      return {
        success: true,
        data: medicalProductsData,
        message: 'Medical products fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch medical products',
        data: {}
      };
    }
  }

  // Get medical product by ID - Updated version
  static async getMedicalProductById(id) {
    try {
      await delay(300);
      
      console.log('Searching medical products for ID:', id);
      
      // Convert id to both string and number for comparison
      const numericId = parseInt(id);
      const stringId = String(id);
      
      // Tìm trong tất cả medical categories
      for (const category in medicalProductsData) {
        const categoryData = medicalProductsData[category];
        console.log(`Checking category ${category}:`, categoryData);
        
        let products = [];
        
        // Handle different data structures
        if (Array.isArray(categoryData)) {
          // Direct array (like vitaminTab, functionalFoodTab, etc.)
          products = categoryData;
        } else if (categoryData && Array.isArray(categoryData.products)) {
          // Object with products property (like sot-xuat-huyet, tay-chan-mieng, etc.)
          products = categoryData.products;
        } else {
          console.log(`Skipping category ${category} - no products found`);
          continue;
        }
        
        console.log(`Searching in medical category ${category}, products count:`, products.length);
        
        const product = products.find(p => {
          const match = p.id === id || 
                       p.id === numericId || 
                       p.id === stringId ||
                       String(p.id) === stringId ||
                       parseInt(p.id) === numericId;
          
          if (match) {
            console.log(`Found medical product in ${category}:`, p);
          }
          return match;
        });
        
        if (product) {
          return {
            success: true,
            data: product,
            message: `Medical product found in ${category}`,
            source: `Medical - ${category}`
          };
        }
      }
      
      console.log('Medical product not found in any category');
      return {
        success: false,
        error: 'Medical product not found',
        data: null
      };
    } catch (error) {
      console.error('Error in getMedicalProductById:', error);
      return {
        success: false,
        error: 'Failed to fetch medical product',
        data: null
      };
    }
  }

  // Get medical products by category - Updated version
  static async getMedicalProductsByCategory(category) {
    try {
      await delay(350);
      
      const categoryData = medicalProductsData[category];
      if (!categoryData) {
        return {
          success: false,
          error: 'Category not found',
          data: null
        };
      }

      return {
        success: true,
        data: categoryData,
        message: `Medical products for ${category} fetched successfully`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch medical products by category',
        data: null
      };
    }
  }

  // Get medical products with pagination - Updated version
  static async getMedicalProductsPaginated(category, page = 1, limit = 4) {
    try {
      await delay(400);
      
      const categoryData = medicalProductsData[category];
      if (!categoryData) {
        return {
          success: false,
          error: 'Category not found',
          data: null,
          pagination: null
        };
      }

      let products = [];
      
      // Handle different data structures
      if (Array.isArray(categoryData)) {
        products = categoryData;
      } else if (categoryData.products && Array.isArray(categoryData.products)) {
        products = categoryData.products;
      }

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = products.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: Array.isArray(categoryData) ? paginatedProducts : {
          ...categoryData,
          products: paginatedProducts
        },
        pagination: {
          current_page: page,
          per_page: limit,
          total: products.length,
          total_pages: Math.ceil(products.length / limit)
        },
        message: 'Medical products fetched with pagination'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Pagination failed',
        data: null,
        pagination: null
      };
    }
  }

  // Search medical products within category - Updated version
  static async searchMedicalProducts(category, query) {
    try {
      await delay(400);
      
      const categoryData = medicalProductsData[category];
      if (!categoryData) {
        return {
          success: false,
          error: 'Category not found',
          data: null
        };
      }

      if (!query || query.trim() === '') {
        return this.getMedicalProductsByCategory(category);
      }

      let products = [];
      
      // Handle different data structures
      if (Array.isArray(categoryData)) {
        products = categoryData;
      } else if (categoryData.products && Array.isArray(categoryData.products)) {
        products = categoryData.products;
      }

      const filteredProducts = products.filter(product =>
        product.name && product.name.toLowerCase().includes(query.toLowerCase())
      );

      return {
        success: true,
        data: Array.isArray(categoryData) ? filteredProducts : {
          ...categoryData,
          products: filteredProducts
        },
        message: `Found ${filteredProducts.length} products`
      };
    } catch (error) {
      return {
        success: false,
        error: 'Search failed',
        data: null
      };
    }
  }

  // Get available medical categories
  static async getMedicalCategories() {
    try {
      await delay(200);
      
      const categories = Object.keys(medicalProductsData).map(key => ({
        key,
        title: medicalProductsData[key].title || key,
        productCount: Array.isArray(medicalProductsData[key]) 
          ? medicalProductsData[key].length 
          : medicalProductsData[key].products?.length || 0
      }));

      return {
        success: true,
        data: categories,
        message: 'Medical categories fetched successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch medical categories',
        data: []
      };
    }
  }
}