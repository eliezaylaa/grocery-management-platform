import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { Search, Filter, ShoppingCart, Plus, ChevronDown, X, Clock, Package } from 'lucide-react';

export const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'ASC'
  });
  
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: []
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...filters
      });
      setProducts(data.products);
      setTotalPages(data.totalPages);
      if (data.filters) {
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stockQuantity === 0) return;
    
    const existingIndex = cart.findIndex(item => item.id === product.id);
    let newCart;
    
    if (existingIndex >= 0) {
      newCart = [...cart];
      if (newCart[existingIndex].quantity < product.stockQuantity) {
        newCart[existingIndex].quantity += 1;
      }
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateCartQuantity = (productId, newQuantity) => {
    let newCart;
    if (newQuantity <= 0) {
      newCart = cart.filter(item => item.id !== productId);
    } else {
      newCart = cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const getCartQuantity = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const formatRestockDate = (date) => {
    if (!date) return null;
    const restockDate = new Date(date);
    const now = new Date();
    const diffDays = Math.ceil((restockDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Restocking today';
    if (diffDays === 1) return 'Restocking tomorrow';
    if (diffDays <= 7) return `Restocking in ${diffDays} days`;
    return `Restocking on ${restockDate.toLocaleDateString()}`;
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'name',
      sortOrder: 'ASC'
    });
    setCurrentPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'name' && v !== 'ASC').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-600 mt-2">Browse and add products to your cart</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 ${
            activeFiltersCount > 0 ? 'border-blue-500 text-blue-600' : 'border-gray-300'
          }`}
        >
          <Filter size={20} />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filter Products</h3>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
              <X size={14} /> Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters({ ...filters, sortBy, sortOrder });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="name-ASC">Name (A-Z)</option>
                <option value="name-DESC">Name (Z-A)</option>
                <option value="price-ASC">Price (Low to High)</option>
                <option value="price-DESC">Price (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20">Loading products...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative cursor-pointer" onClick={() => setSelectedProduct(product)}>
                  {product.pictureUrl ? (
                    <img src={product.pictureUrl} alt={product.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Package size={48} className="text-gray-400" />
                    </div>
                  )}
                  {product.stockQuantity === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Only {product.stockQuantity} left
                    </span>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity">
                    Click for details
                  </div>
                </div>
                <div className="p-4">
                  <h3 
                    className="font-semibold text-lg truncate cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{product.brand}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{product.category}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    {product.stockQuantity > 0 ? (
                      <span className="text-sm text-green-600">
                        {product.stockQuantity} in stock
                      </span>
                    ) : (
                      product.restockDate && (
                        <span className="text-xs text-orange-600 flex items-center gap-1">
                          <Clock size={12} />
                          {formatRestockDate(product.restockDate)}
                        </span>
                      )
                    )}
                  </div>

                  {product.stockQuantity === 0 && product.restockDate && (
                    <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                      <p className="text-xs text-orange-700 flex items-center gap-1">
                        <Clock size={14} />
                        {formatRestockDate(product.restockDate)}
                        {product.restockQuantity > 0 && ` (${product.restockQuantity} units)`}
                      </p>
                    </div>
                  )}

                  <div className="mt-4">
                    {product.stockQuantity === 0 ? (
                      <button
                        disabled
                        className="w-full flex items-center justify-center gap-2 bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    ) : getCartQuantity(product.id) > 0 ? (
                      <div className="flex items-center justify-between bg-blue-50 rounded-lg p-2">
                        <span className="text-blue-600 font-medium">
                          {getCartQuantity(product.id)} in cart
                        </span>
                        <button
                          onClick={() => addToCart(product)}
                          disabled={getCartQuantity(product.id) >= product.stockQuantity}
                          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        <ShoppingCart size={20} />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          cartQuantity={getCartQuantity(selectedProduct.id)}
          onAddToCart={addToCart}
          onUpdateQuantity={updateCartQuantity}
        />
      )}
    </div>
  );
};
