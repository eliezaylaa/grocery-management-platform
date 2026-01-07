import React from 'react';
import { X, Package, ShoppingCart, Plus, Minus, Flame, Info } from 'lucide-react';

export const ProductDetailModal = ({ product, onClose, cartQuantity = 0, onAddToCart, onUpdateQuantity }) => {
  if (!product) return null;

  const isOutOfStock = product.stockQuantity === 0;
  
  // Extract nutrition info from the nutritionalInfo JSON field
  const nutrition = product.nutritionalInfo || {};
  const hasNutrition = nutrition && (
    nutrition.energy_kcal || nutrition.proteins || nutrition.carbohydrates || 
    nutrition.fat || nutrition.fiber || nutrition.sugars || nutrition.salt
  );

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
                €{parseFloat(product.price).toFixed(2)}
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

          {/* Nutrition Information */}
          {hasNutrition && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                Nutrition Information 
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {nutrition.energy_kcal !== undefined && nutrition.energy_kcal !== null && (
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">{Math.round(nutrition.energy_kcal)}</p>
                    <p className="text-xs text-gray-500">Calories</p>
                  </div>
                )}
                {nutrition.proteins !== undefined && nutrition.proteins !== null && (
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{Number(nutrition.proteins).toFixed(1)}g</p>
                    <p className="text-xs text-gray-500">Protein</p>
                  </div>
                )}
                {nutrition.carbohydrates !== undefined && nutrition.carbohydrates !== null && (
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{Number(nutrition.carbohydrates).toFixed(1)}g</p>
                    <p className="text-xs text-gray-500">Carbs</p>
                  </div>
                )}
                {nutrition.fat !== undefined && nutrition.fat !== null && (
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{Number(nutrition.fat).toFixed(1)}g</p>
                    <p className="text-xs text-gray-500">Fat</p>
                  </div>
                )}
                {nutrition.fiber !== undefined && nutrition.fiber !== null && (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{Number(nutrition.fiber).toFixed(1)}g</p>
                    <p className="text-xs text-gray-500">Fiber</p>
                  </div>
                )}
                {nutrition.sugars !== undefined && nutrition.sugars !== null && (
                  <div className="bg-pink-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-pink-600">{Number(nutrition.sugars).toFixed(1)}g</p>
                    <p className="text-xs text-gray-500">Sugars</p>
                  </div>
                )}
                {nutrition.salt !== undefined && nutrition.salt !== null && (
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{Number(nutrition.salt).toFixed(2)}g</p>
                    <p className="text-xs text-gray-500">Salt</p>
                  </div>
                )}
                {nutrition.saturated_fat !== undefined && nutrition.saturated_fat !== null && (
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{Number(nutrition.saturated_fat).toFixed(1)}g</p>
                    <p className="text-xs text-gray-500">Sat. Fat</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Nutri-Score */}
          {(nutrition.nutriscore || product.nutriscore) && (
            <div className="mt-4">
              <span className="text-sm text-gray-500 mr-2">Nutri-Score:</span>
              <span className={`inline-block px-3 py-1 rounded-full text-white font-bold uppercase ${
                (nutrition.nutriscore || product.nutriscore) === 'a' ? 'bg-green-500' :
                (nutrition.nutriscore || product.nutriscore) === 'b' ? 'bg-lime-500' :
                (nutrition.nutriscore || product.nutriscore) === 'c' ? 'bg-yellow-500' :
                (nutrition.nutriscore || product.nutriscore) === 'd' ? 'bg-orange-500' : 'bg-red-500'
              }`}>
                {nutrition.nutriscore || product.nutriscore}
              </span>
            </div>
          )}

          {/* Ingredients */}
          {(nutrition.ingredients || product.ingredients) && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Info size={18} className="text-blue-500" />
                Ingredients
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{nutrition.ingredients || product.ingredients}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
