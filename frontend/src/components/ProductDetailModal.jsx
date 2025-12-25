import React from 'react';
import { X, Package, ShoppingCart, Plus, Minus, Flame, Info } from 'lucide-react';

export const ProductDetailModal = ({ product, onClose, cartQuantity = 0, onAddToCart, onUpdateQuantity }) => {
  if (!product) return null;

  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Product Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
              {product.pictureUrl ? (
                <img src={product.pictureUrl} alt={product.name} className="w-full h-full object-contain p-4" />
              ) : (
                <Package size={80} className="text-gray-300" />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                {product.brand && <p className="text-gray-500 mt-1">{product.brand}</p>}
              </div>

              <div className="text-3xl font-bold text-blue-600">
                ${parseFloat(product.price).toFixed(2)}
              </div>

              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-medium">Out of Stock</span>
                ) : product.stockQuantity <= 10 ? (
                  <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-sm font-medium">Low Stock - {product.stockQuantity} left</span>
                ) : (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm font-medium">In Stock - {product.stockQuantity} available</span>
                )}
              </div>

              {product.category && (
                <div>
                  <span className="text-sm text-gray-500">Category: </span>
                  <span className="text-sm font-medium text-gray-700">{product.category}</span>
                </div>
              )}

              {product.barcode && (
                <div>
                  <span className="text-sm text-gray-500">Barcode: </span>
                  <span className="text-sm font-medium text-gray-700">{product.barcode}</span>
                </div>
              )}

              {product.description && (
                <div className="pt-2">
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {onAddToCart && (
                <div className="pt-4">
                  {isOutOfStock ? (
                    <button disabled className="w-full py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium">
                      Out of Stock
                    </button>
                  ) : cartQuantity === 0 ? (
                    <button
                      onClick={() => onAddToCart(product)}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                    >
                      <ShoppingCart size={20} />
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                      <button
                        onClick={() => onUpdateQuantity(product.id, cartQuantity - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="text-xl font-semibold text-gray-900">{cartQuantity} in cart</span>
                      <button
                        onClick={() => onUpdateQuantity(product.id, cartQuantity + 1)}
                        disabled={cartQuantity >= product.stockQuantity}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {(product.calories || product.proteins || product.carbs || product.fat || product.fiber) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Flame size={18} className="text-orange-500" />
                Nutrition Information (per 100g)
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {product.calories !== undefined && product.calories !== null && (
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">{product.calories}</p>
                    <p className="text-xs text-gray-500">kcal</p>
                  </div>
                )}
                {product.proteins !== undefined && product.proteins !== null && (
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{product.proteins}g</p>
                    <p className="text-xs text-gray-500">Protein</p>
                  </div>
                )}
                {product.carbs !== undefined && product.carbs !== null && (
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{product.carbs}g</p>
                    <p className="text-xs text-gray-500">Carbs</p>
                  </div>
                )}
                {product.fat !== undefined && product.fat !== null && (
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{product.fat}g</p>
                    <p className="text-xs text-gray-500">Fat</p>
                  </div>
                )}
                {product.fiber !== undefined && product.fiber !== null && (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{product.fiber}g</p>
                    <p className="text-xs text-gray-500">Fiber</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {product.nutriscore && (
            <div className="mt-4">
              <span className="text-sm text-gray-500 mr-2">Nutri-Score:</span>
              <span className={`inline-block px-3 py-1 rounded-full text-white font-bold uppercase ${
                product.nutriscore === 'a' ? 'bg-green-500' :
                product.nutriscore === 'b' ? 'bg-lime-500' :
                product.nutriscore === 'c' ? 'bg-yellow-500' :
                product.nutriscore === 'd' ? 'bg-orange-500' : 'bg-red-500'
              }`}>
                {product.nutriscore}
              </span>
            </div>
          )}

          {product.ingredients && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                Ingredients
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.ingredients}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
