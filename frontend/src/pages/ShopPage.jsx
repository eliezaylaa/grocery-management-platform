import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { ShoppingCart, Plus, Minus, Search } from 'lucide-react';
import api from '../services/api';

export const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [searchTerm]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll({ search: searchTerm });
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        product: product,
        quantity: 1
      }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * parseFloat(item.product.price)), 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      await api.post('/invoices', {
        paymentMethod: 'card',
        paymentStatus: 'completed',
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      });

      alert('Order placed successfully!');
      setCart([]);
      setShowCart(false);
    } catch (error) {
      alert('Failed to place order: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shop Products</h1>
        <button
          onClick={() => setShowCart(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 relative"
        >
          <ShoppingCart size={20} />
          Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-20">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {product.pictureUrl && (
                <img
                  src={product.pictureUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg truncate">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                <p className="text-sm text-gray-500 mt-1">{product.category}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  <span className={`text-sm ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stockQuantity === 0}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shopping Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Shopping Cart</h2>

            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4 border-b pb-4">
                      {item.product.pictureUrl && (
                        <img
                          src={item.product.pictureUrl}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">${parseFloat(item.product.price).toFixed(2)} each</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${(item.quantity * parseFloat(item.product.price)).toFixed(2)}</p>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 text-sm hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold">Total:</span>
                    <span className="text-2xl font-bold text-green-600">${getTotal().toFixed(2)}</span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCart(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={handleCheckout}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
