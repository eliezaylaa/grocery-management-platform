import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Plus, Edit, Trash2, RefreshCw, Search, Filter, X, Download, ChevronDown, Clock, Package } from 'lucide-react';

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    lowStock: false,
    inStock: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    brands: []
  });

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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.delete(id);
        loadProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleSync = async (barcode) => {
    try {
      await productService.syncWithOpenFoodFacts(barcode);
      loadProducts();
      alert('Product synced successfully!');
    } catch (error) {
      alert('Failed to sync product');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      lowStock: false,
      inStock: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    });
    setCurrentPage(1);
  };

  const formatRestockDate = (date) => {
    if (!date) return null;
    const restockDate = new Date(date);
    return restockDate.toLocaleDateString();
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'createdAt' && v !== 'DESC').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Import from OFF
          </button>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

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
            placeholder="Search products by name, brand, barcode..."
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Brands</option>
                {filterOptions.brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                value={filters.lowStock ? 'low' : filters.inStock}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters({
                    ...filters,
                    lowStock: val === 'low',
                    inStock: val === 'low' ? '' : val
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Stock Levels</option>
                <option value="true">In Stock</option>
                <option value="false">Out of Stock</option>
                <option value="low">Low Stock (≤10)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Date Added</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
                <option value="stockQuantity">Stock</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">Loading products...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  {product.pictureUrl ? (
                    <img src={product.pictureUrl} alt={product.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <Package size={48} className="text-gray-400" />
                    </div>
                  )}
                  {product.stockQuantity === 0 && (
                    <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.brand}</p>
                  <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className={`text-sm ${product.stockQuantity === 0 ? 'text-red-600' : product.stockQuantity < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      Stock: {product.stockQuantity}
                    </span>
                  </div>

                  {/* Restock Info */}
                  {product.stockQuantity === 0 && product.restockDate && (
                    <div className="mt-2 p-2 bg-orange-50 rounded-lg flex items-center gap-2">
                      <Clock size={14} className="text-orange-600" />
                      <span className="text-xs text-orange-700">
                        Restock: {formatRestockDate(product.restockDate)}
                        {product.restockQuantity > 0 && ` (${product.restockQuantity} units)`}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => { setEditingProduct(product); setShowModal(true); }}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-600 px-3 py-2 rounded hover:bg-blue-200"
                    >
                      <Edit size={16} /> Edit
                    </button>
                    {product.barcode && (
                      <button
                        onClick={() => handleSync(product.barcode)}
                        className="flex items-center justify-center bg-green-100 text-green-600 px-3 py-2 rounded hover:bg-green-200"
                        title="Sync with Open Food Facts"
                      >
                        <RefreshCw size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center justify-center bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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
        </>
      )}

      {showModal && (
        <ProductModal product={editingProduct} onClose={() => setShowModal(false)} onSave={loadProducts} />
      )}

      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} onImport={loadProducts} />
      )}
    </div>
  );
};

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    barcode: product?.barcode || '',
    price: product?.price || '',
    brand: product?.brand || '',
    category: product?.category || '',
    pictureUrl: product?.pictureUrl || '',
    description: product?.description || '',
    stockQuantity: product?.stockQuantity || 0,
    restockDate: product?.restockDate ? new Date(product.restockDate).toISOString().split('T')[0] : '',
    restockQuantity: product?.restockQuantity || 0
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        restockDate: formData.restockDate || null,
        restockQuantity: formData.restockQuantity || 0
      };
      
      if (product) {
        await productService.update(product.id, dataToSend);
      } else {
        await productService.create(dataToSend);
      }
      onSave();
      onClose();
    } catch (error) {
      alert('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
              <input type="text" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
              <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
              <input type="number" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          {/* Restock Section */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Clock size={18} />
              Restock Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Restock Date</label>
                <input 
                  type="date" 
                  value={formData.restockDate} 
                  onChange={(e) => setFormData({...formData, restockDate: e.target.value})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restock Quantity</label>
                <input 
                  type="number" 
                  value={formData.restockQuantity} 
                  onChange={(e) => setFormData({...formData, restockQuantity: parseInt(e.target.value) || 0})} 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg" 
                  placeholder="Expected units"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Picture URL</label>
            <input type="url" value={formData.pictureUrl} onChange={(e) => setFormData({...formData, pictureUrl: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Product'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImportModal = ({ onClose, onImport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);
  const [importing, setImporting] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await productService.searchOpenFoodFacts(searchQuery);
      setSearchResults(data.products || []);
    } catch (error) {
      alert('Failed to search Open Food Facts');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (barcode) => {
    setSelectedBarcodes(prev => 
      prev.includes(barcode) ? prev.filter(b => b !== barcode) : [...prev, barcode]
    );
  };

  const handleImport = async () => {
    if (selectedBarcodes.length === 0) return;
    setImporting(true);
    try {
      await productService.bulkImport(selectedBarcodes);
      alert(`Successfully imported ${selectedBarcodes.length} products!`);
      onImport();
      onClose();
    } catch (error) {
      alert('Failed to import some products');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Import from Open Food Facts</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
        </div>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search products (e.g., 'nutella', 'coca cola')..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSearch} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">{selectedBarcodes.length} selected</span>
              <button onClick={handleImport} disabled={selectedBarcodes.length === 0 || importing} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {importing ? 'Importing...' : `Import Selected (${selectedBarcodes.length})`}
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((product) => (
                <div
                  key={product.barcode}
                  onClick={() => toggleSelect(product.barcode)}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedBarcodes.includes(product.barcode) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {product.pictureUrl && <img src={product.pictureUrl} alt={product.name} className="w-full h-24 object-contain mb-2" />}
                  <h4 className="font-medium text-sm truncate">{product.name}</h4>
                  <p className="text-xs text-gray-500 truncate">{product.brand}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
