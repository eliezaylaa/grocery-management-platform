const axios = require("axios");

class OpenFoodFactsService {
  constructor() {
    this.baseUrl = "https://world.openfoodfacts.org/api/v0";
  }

  async getProductByBarcode(barcode) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/product/${barcode}.json`
      );

      if (response.data.status === 0) {
        throw new Error("Product not found in Open Food Facts");
      }

      const product = response.data.product;

      return {
        name: product.product_name || "Unknown",
        brand: product.brands || "Unknown",
        category: product.categories || "Unknown",
        pictureUrl: product.image_url,
        description: product.generic_name,
        nutritionalInfo: {
          energy: product.nutriments?.["energy-kcal_100g"],
          fat: product.nutriments?.fat_100g,
          saturatedFat: product.nutriments?.["saturated-fat_100g"],
          carbohydrates: product.nutriments?.carbohydrates_100g,
          sugars: product.nutriments?.sugars_100g,
          proteins: product.nutriments?.proteins_100g,
          salt: product.nutriments?.salt_100g,
          fiber: product.nutriments?.fiber_100g,
        },
        openFoodFactsId: product.id || product.code,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("Product not found in Open Food Facts");
      }
      throw new Error("Failed to fetch product from Open Food Facts");
    }
  }

  async searchProducts(searchTerm) {
    try {
      const response = await axios.get(`${this.baseUrl}/cgi/search.pl`, {
        params: {
          search_terms: searchTerm,
          json: 1,
          page_size: 20,
        },
      });

      return response.data.products.map((product) => ({
        barcode: product.code,
        name: product.product_name,
        brand: product.brands,
        pictureUrl: product.image_url,
      }));
    } catch (error) {
      throw new Error("Failed to search products in Open Food Facts");
    }
  }
}

module.exports = new OpenFoodFactsService();
